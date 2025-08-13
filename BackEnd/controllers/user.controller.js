import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import mongoose from "mongoose";
import crypto from "crypto";
import {
  sendOTPEmail,
  sendPasswordResetEmail,
} from "../utils/NodeMailer.js";
import bcrypt from "bcrypt";
import {
  uploadToCloudinary,
  deleteFromCloudinary,
  extractPublicId,
} from "../utils/cloudinary.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import {
  capitalizeFirstLetter,
  convertMillisToMinutes,
} from "../utils/utilFunctions.js";
import { imageComp } from "../utils/ImageCompressionUtils.js";
import path from "path";
import fs from "fs";
import { deleteLocalFile } from "../utils/DeleteLocalfile.js";

dotenv.config({
  path: "../env",
});

const cookieOptions = {
  httpOnly: true,
  secure: true,
};

const generateAccessAndRefereshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating referesh and access token"
    ).send(res);
  }
};

function generateOTP() {
  // crypto.randomInt(min, max) generates an integer in [min, max)
  return crypto.randomInt(100000, 1000000).toString();
}

const registerUser = asyncHandler(async (req, res) => {
  const { username, fullName, email, password } = req.body;

  // COMMENT: All fields validation, without the incorrect .send(res)
  if (
    [username, fullName, email, password].some(
      (field) => field?.trim() === ""
    )
  ) {
    throw new ApiError(400, "All fields are required");
  }

  const avatarlocalFilePath = req.files?.avatar?.[0]?.path;
  const compressedAvatarImagePath = path.join(
    path.dirname(avatarlocalFilePath),
    `compressed-${path.basename(avatarlocalFilePath)}`
  );
  let coverImagelocalFilePath = req.files?.coverImage?.[0]?.path;

  try {
    const existingUser = await User.findOne({
      $or: [{ username }, { email }],
    });
    if (existingUser) {
      throw new ApiError(400, "Username or email already exists");
    }

    if (password.length < 8) {
      throw new ApiError(
        400,
        "Password must be at least 8 characters long"
      );
    }

    await imageComp(avatarlocalFilePath, compressedAvatarImagePath);
    const avatar = await uploadToCloudinary(
      compressedAvatarImagePath
    );

    let coverImage = null;
    if (coverImagelocalFilePath) {
      coverImage = await uploadToCloudinary(coverImagelocalFilePath);
    }

    if (!avatar) {
      throw new ApiError(500, "Failed to upload avatar image");
    }

    const newUser = await User.create({
      username: username.toLowerCase(),
      fullName,
      email,
      password,
      avatar: avatar?.secure_url,
      coverImage: coverImage?.secure_url || "",
    });

    if (!newUser) {
      throw new ApiError(500, "Failed to create user");
    }

    const responseuser = await User.findById(newUser._id).select(
      "-password -refreshToken"
    );

    res
      .status(201)
      .json(
        new ApiResponse(
          201,
          responseuser,
          "User registered successfully"
        )
      );
  } finally {
    await deleteLocalFile(avatarlocalFilePath);
    await deleteLocalFile(coverImagelocalFilePath);
    await deleteLocalFile(compressedAvatarImagePath);
  }
});

const sendEmailVerifyOtp = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw new ApiError(400, "Email is required");
  }

  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(
      404,
      "User with this email does not exist"
    ).send(res);
  }

  if (user.isEmailVerified) {
    throw new ApiError(400, "Email is already verified");
  }

  const otp = generateOTP();
  const salt = await bcrypt.genSalt(10);
  const hashedOtp = await bcrypt.hash(otp.toString(), salt);

  const otpExpiresAt = new Date(Date.now() + 3 * 60 * 1000); // 3 minutes
  const otpExpiresAtInMinutes = Math.ceil(
    convertMillisToMinutes(3 * 60 * 1000)
  );

  user.emailVerificationOtp = hashedOtp;
  user.emailVerificationOtpExpiresAt = otpExpiresAt;
  const savedUser = await user.save({ validateBeforeSave: false });

  await sendOTPEmail(user.email, otp, otpExpiresAtInMinutes);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        {},
        "OTP sent successfully. Please check your email."
      )
    );
});

const verifyEmailOtp = asyncHandler(async (req, res) => {
  const user = req.user;
  const { otp } = req.body;
  if (!otp.trim()) {
    throw new ApiError(400, "OTP is required").send(res);
  }
  try {
    const dbUser = await User.findById(user._id).lean();
    if (!dbUser) {
      throw new ApiError(404, "User not found").send(res);
    }

    if (dbUser.emailVerificationOtpExpiresAt < Date.now()) {
      throw new ApiError(400, "OTP has expired").send(res);
    }
    const isOtpValid = await bcrypt.compare(
      otp,
      dbUser.emailVerificationOtp
    );
    if (!isOtpValid) {
      throw new ApiError(400, "Invalid OTP").send(res);
    }

    const userToUpdate = await User.findById(user._id);
    userToUpdate.isEmailVerified = true;
    userToUpdate.emailVerificationOtp = "";
    userToUpdate.emailVerificationOtpExpiresAt = 0;
    await userToUpdate.save({ validateBeforeSave: false });
    const sanitizedUser = {
      _id: userToUpdate._id,
      fullName: userToUpdate.fullName,
      email: userToUpdate.email,
      isEmailVerified: userToUpdate.isEmailVerified,
    };
    res
      .status(200)
      .json(new ApiResponse(200, sanitizedUser, "Email verified"));
  } catch (error) {
    throw new ApiError(500, "Error in Verifying Email OTP.");
  }
});

const sendPasswordResetOtp = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const userEmail = req.user.email;

  const otp = generateOTP();
  const salt = await bcrypt.genSalt(10);
  const hashedOtp = await bcrypt.hash(otp.toString(), salt);

  try {
    const otpExpiresAt = Date.now() + 5 * 60 * 1000; // 5 min
    const otpExpiresAtInMinutes = Math.ceil(
      convertMillisToMinutes(5 * 60 * 1000)
    );

    const userUpdate = await User.updateOne(
      { _id: userId },
      {
        passwordResetOtp: hashedOtp,
        passwordResetOtpExpiresAt: otpExpiresAt,
      }
    );

    if (userUpdate.modifiedCount === 0) {
      throw new ApiError(404, "User not found or update failed");
    }

    await sendPasswordResetEmail(
      userEmail,
      capitalizeFirstLetter(req.user.username),
      otp,
      otpExpiresAtInMinutes
    );

    return new ApiResponse(
      200,
      {},
      "OTP sent successfully. Please check your email."
    ).send(res);
  } catch (error) {
    if (error instanceof ApiError) {
      throw new ApiError(
        500,
        "Error in sending Password Reset OTP."
      ).send(res);
    } else {
      throw new ApiError(
        500,
        "An internal server error occurred."
      ).send(res);
    }
  }
});

const verifyPasswordResetOtp = asyncHandler(async (req, res) => {
  const user = req.user;
  const { otp, newPassword } = req.body;
  if (!otp.trim()) {
    throw new ApiError(400, "OTP is required").send(res);
  }
  try {
    const dbUser = await User.findById(user._id);
    if (!dbUser) {
      throw new ApiError(404, "User not found").send(res);
    }
    if (dbUser.passwordResetOtpExpiresAt < Date.now()) {
      throw new ApiError(400, "OTP has expired").send(res);
    }
    const isOtpValid = await bcrypt.compare(
      otp,
      dbUser.passwordResetOtp
    );
    if (!isOtpValid) {
      throw new ApiError(400, "Invalid OTP").send(res);
    }

    dbUser.password = newPassword;

    dbUser.passwordResetOtp = "";
    dbUser.passwordResetOtpExpiresAt = 0;
    await dbUser.save({ validateBeforeSave: false });
    const sanitizedUser = {
      _id: dbUser._id,
      fullName: dbUser.fullName,
      email: dbUser.email,
      isEmailVerified: dbUser.isEmailVerified,
      // Add other fields you want to return
    };
    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          sanitizedUser,
          "Pasword reset Successfully"
        )
      );
  } catch (error) {
    if (error instanceof ApiError) {
      throw new ApiError(
        500,
        "Error in verifing Pasword reset OTP."
      ).send(res);
    } else {
      throw new ApiError(
        500,
        "An internal server error occurred."
      ).send(res);
    }
  }
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new ApiError(400, "Email and password are required").send(
      res
    );
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(404, "User not found").send(res);
  }

  const isPasswordValid = await user.isPasswordrect(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid email or password").send(res);
  }
  const { refreshToken, accessToken } =
    await generateAccessAndRefereshTokens(user._id);

  user.refreshToken = refreshToken;
  user.accessToken = accessToken;
  await user.save({ validateBeforeSave: false });
  console.log("user: ", user);
  const sanitizedUser = user.toObject();
  delete sanitizedUser.password;
  delete sanitizedUser.refreshToken;
  delete sanitizedUser.emailVerificationOtp;
  delete sanitizedUser.emailVerificationOtpExpiresAt;
  delete sanitizedUser.passwordResetOtp;
  delete sanitizedUser.passwordResetOtpExpiresAt;
  delete sanitizedUser.__v;
  res
    .status(200)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .cookie("accessToken", accessToken, cookieOptions)
    .json(
      new ApiResponse(
        200,
        { user: sanitizedUser, refreshToken, accessToken },
        "Login successful"
      )
    );
});

const logout = asyncHandler(async (req, res) => {
  const user = req.user;

  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: {
        refreshToken: 1, // this removes the field from document
      },
    },
    {
      new: true,
    }
  );

  if (!user) {
    throw new ApiError(401, "Unauthorized").send(res);
  }

  res
    .status(200)
    .clearCookie("refreshToken", cookieOptions)
    .clearCookie("accessToken", cookieOptions)
    .json(new ApiResponse(200, {}, "Logout successful"));
});

const refreshToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized").send(res);
  }
  const decodedRefreshToken = jwt.verify(
    incomingRefreshToken,
    process.env.REFRESH_TOKEN_SECRET
  );
  const user = await User.findById(decodedRefreshToken._id).select(
    "-password -refreshToken"
  );
  if (!user) {
    throw new ApiError(401, "Unauthorized").send(res);
  }
  const { refreshToken, accessToken } =
    await generateAccessAndRefereshTokens(user._id);
  user.refreshToken = refreshToken;
  user.accessToken = accessToken;
  await user.save({ validateBeforeSave: false });

  res
    .status(200)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .cookie("accessToken", accessToken, cookieOptions)
    .json(
      new ApiResponse(
        200,
        { user, accessToken },
        "Token updated successfully"
      )
    );
});

const changePassword = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    throw new ApiError(401, "Unauthorized").send(res);
  }
  const { currentPassword, newPassword } = req.body;

  if (currentPassword === newPassword) {
    throw new ApiError(
      400,
      "New password cannot be same as current password"
    ).send(res);
  }
  if (!currentPassword || !newPassword) {
    throw new ApiError(
      400,
      "Current password and new password are required"
    ).send(res);
  }
  if (newPassword.length < 8) {
    throw new ApiError(
      400,
      "Password must be at least 8 characters long"
    ).send(res);
  }

  const isPasswordValid = await user.isPasswordrect(currentPassword);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid current password").send(res);
  }

  user.password = newPassword;
  user.save({ validateBeforeSave: false }, { new: true });

  const responseUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        responseUser,
        "Password changed successfully"
      )
    );
});

const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const { fullName, email } = req.body;
  if (!fullName || !email) {
    throw new ApiError(400, "Full name and email are required").send(
      res
    );
  }

  if (email === user.email) {
    throw new ApiError(
      400,
      "Email cannot be same as previous email"
    ).send(res);
  }
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(400, "Email already in use").send(res);
  }
  user.fullName = fullName;
  user.email = email;
  user.save({ validateBeforeSave: false }, { new: true });
  const responseUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        responseUser,
        "Profile updated successfully"
      )
    );
});

const getCurrentUser = asyncHandler(async (req, res) => {
  const user = req.user;
  const responseUser = await User.findById(user._id).select(
    "-password -refreshToken -passwordResetOtp -passwordResetOtpExpiresAt -emailVerificationOtp -emailVerificationOtpExpiresAt"
  );
  res.status(200).json(new ApiResponse(200, responseUser));
});

const updateAvatar = asyncHandler(async (req, res) => {
  const user = req.user;
  const avatarLocalPath = req.file?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar is required").send(res);
  }
  const existingAvatar = user.avatar;

  if (existingAvatar) {
    const publicId = extractPublicId(existingAvatar);
    await deleteFromCloudinary(publicId);
  }
  const avatar = await uploadToCloudinary(avatarLocalPath);
  user.avatar = avatar.secure_url;

  user.save({ validateBeforeSave: false }, { new: true });
  const responseUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        responseUser,
        "Avatar updated successfully"
      )
    );
});

const updateCoverImage = asyncHandler(async (req, res) => {
  const user = req.user;
  const coverLocalPath = req.file?.path;

  if (!coverLocalPath) {
    throw new ApiError(400, "Cover is required").send(res);
  }
  const existingCover = user.coverImage;

  if (existingCover) {
    const publicId = extractPublicId(existingCover);
    await deleteFromCloudinary(publicId);
  }
  const coverImage = await uploadToCloudinary(coverLocalPath);
  user.coverImage = coverImage.secure_url;

  user.save({ validateBeforeSave: false }, { new: true });
  const responseUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        responseUser,
        "coverImage updated successfully"
      )
    );
});


const getUserChannelProfile = asyncHandler(async (req, res) => {
  const { username } = req.params;

  if (!username?.trim()) {
    throw new ApiError(400, "Username is required").send(res);
  }

  const channel = await User.aggregate([
    {
      $match: {
        username: username.toLowerCase(),
      },
    },
    {
      //subscribers
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers",
      },
    },
    {
      //channels user is subscirbed to
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribedTo",
      },
    },
    {
      $addFields: {
        subscriberCount: {
          $size: "$subscribers",
        },
        channelsSubscribedToCount: {
          $size: "$subscribedTo",
        },
        isSubscribed: {
          $cond: {
            if: req.user && req.user._id ? { $in: [req.user._id, "$subscribers.subscriber"] } : false,
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $project: {
        fullName: 1,
        username: 1,
        subscriberCount: 1,
        channelsSubscribedToCount: 1,
        isSubscribed: 1,
        avatar: 1,
        coverImage: 1,
        email: 1,
      },
    },
  ]);

  if (!channel?.length) {
    throw new ApiError(404, "channel does not exists").send(res);
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        channel[0],
        "User channel fetched successfully"
      )
    );
});

const getWatchHistory = asyncHandler(async (req, res) => {
  const user = req.user;

  const watchHistory = await User.aggregate([
    {
      $match: { _id: mongoose.Types.ObjectId(user._id) },
    },
    {
      $lookup: {
        from: "videos",
        localField: "watchHistory",
        foreignField: "_id",
        as: "watchHistory",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
              pipeline: [
                {
                  $project: {
                    fullName: 1,
                    username: 1,
                    avatar: 1,
                  },
                },
              ],
            },
          },
          {
            $addFields: {
              $first: "$owner",
            },
          },
        ],
      },
    },
  ]);

  if (!watchHistory) {
    throw new ApiError(403, "No watch History").send(res);
  }

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        watchHistory,
        "Watch history fetched successfully"
      )
    );
});

export {
  registerUser,
  login,
  logout,
  refreshToken,
  changePassword,
  updateProfile,
  getCurrentUser,
  updateAvatar,
  updateCoverImage,
  getUserChannelProfile,
  getWatchHistory,
  sendEmailVerifyOtp,
  verifyEmailOtp,
  sendPasswordResetOtp,
  verifyPasswordResetOtp,
};
