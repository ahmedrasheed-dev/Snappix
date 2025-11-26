import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { Video } from "../models/video.model.js";
import mongoose from "mongoose";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { sendOTPEmail, sendPasswordResetEmail } from "../utils/NodeMailer.js";
//moving to s3
import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3 } from "../config/s3.config.js";

dotenv.config({ path: "../env" });

const cookieOptions = {
  httpOnly: true,
  secure: process.env.ENVIRONMENT === "development" ? false : true, //for local host
  age: 24 * 60 * 60 * 1000,
  sameSite: "None",
};

const generateAccessAndRefereshTokens = async (userId) => {
  const user = await User.findById(userId);
  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  return { accessToken, refreshToken };
};

const generateOTP = () => crypto.randomInt(100000, 1000000).toString();

// ------------------- Auth -------------------

export const getUploadUrl = async (req, res) => {
  try {
    const { fileName, fileType, fileCategory } = req.body;

    if (!fileName || !fileType || !fileCategory)
      throw new ApiError(400, "fileName, fileType, and fileCategory are required");

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(fileType))
      throw new ApiError(400, "Invalid image type");

    // Decide folder directly
    if (!["avatar", "cover"].includes(fileCategory))
      throw new ApiError(400, "Invalid file category");

    const folder = fileCategory === "avatar" ? "users/avatars" : "users/covers";
    const cleanName = fileName.replace(/\s+/g, "_");
    const key = `${folder}/${Date.now()}-${cleanName}`;

    const command = new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key,
      ContentType: fileType,
    });

    const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 300 }); // 5 mins
    const fileUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

    return new ApiResponse(
      200,
      { uploadUrl, fileUrl, key },
      "Presigned URL generated successfully"
    ).send(res);
  } catch (error) {
    console.error(error);
    return new ApiError(500, "Failed to generate presigned URL");
  }
};
// Register user after upload
export const registerUser = async (req, res) => {
  try {
    const { username, fullName, email, password, avatar, coverImage } = req.body;

    if (!username || !fullName || !email || !password || !avatar) {
      // Throwing here sends it to the catch block
      throw new ApiError(400, "Missing required fields");
    }

    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) throw new ApiError(400, "Username or email already exists");

    const newUser = await User.create({
      username: username.toLowerCase(),
      fullName,
      email,
      password,
      avatar: avatar, 
      coverImage: coverImage || "",
    });

    const responseUser = await User.findById(newUser._id).select("-password -refreshToken");
    return new ApiResponse(201, responseUser, "User registered successfully").send(res);
  } catch (error) {
    console.error(error);
    return new ApiError(500, "Failed to register user", error);
  }
};

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const DBuser = await User.findOne({ email });
  if (!DBuser) throw new ApiError(404, "User not found");

  const isPasswordValid = await DBuser.isPasswordrect(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid email or password");
  }

  const { refreshToken, accessToken } = await generateAccessAndRefereshTokens(DBuser._id);

  const user = DBuser.toObject();
  delete user.password;
  delete user.refreshToken;
  delete user.emailVerificationOtp;
  delete user.emailVerificationOtpExpiresAt;
  delete user.passwordResetOtp;
  delete user.passwordResetOtpExpiresAt;
  delete user.__v;
  delete user.refreshToken;

  res
    .cookie("refreshToken", refreshToken, cookieOptions)
    .cookie("accessToken", accessToken, cookieOptions);
  return new ApiResponse(200, { user, accessToken, refreshToken }, "Login successful").send(res);
});

export const logout = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, { $unset: { refreshToken: 1 } });

  return new ApiResponse(200, {}, "Logout successful").send(
    res.clearCookie("refreshToken", cookieOptions).clearCookie("accessToken", cookieOptions)
  );
});

export const refreshToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;
  if (!incomingRefreshToken) throw new ApiError(401, "Unauthorized");

  const decoded = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
  const user = await User.findById(decoded._id).select("-password -refreshToken");
  if (!user) throw new ApiError(401, "Unauthorized");

  const { refreshToken, accessToken } = await generateAccessAndRefereshTokens(user._id);

  return new ApiResponse(200, { user, accessToken }, "Token updated successfully").send(
    res
      .cookie("refreshToken", refreshToken, cookieOptions)
      .cookie("accessToken", accessToken, cookieOptions)
  );
});
export const sendEmailVerifyOtp = asyncHandler(async (req, res) => {
  const user = req.user;

  const otp = generateOTP();
  user.emailVerificationOtp = otp;
  user.emailVerificationOtpExpiresAt = Date.now() + 10 * 60 * 1000; // 10 mins
  await user.save({ validateBeforeSave: false });

  await sendOTPEmail(user.email, otp);

  return new ApiResponse(200, {}, "Verification OTP sent to email").send(res);
});

export const verifyEmailOtp = asyncHandler(async (req, res) => {
  const { otp } = req.body;
  const user = req.user;

  if (user.emailVerificationOtp !== otp || Date.now() > user.emailVerificationOtpExpiresAt) {
    throw new ApiError(400, "Invalid or expired OTP");
  }

  user.isEmailVerified = true;
  user.emailVerificationOtp = null;
  user.emailVerificationOtpExpiresAt = null;
  await user.save({ validateBeforeSave: false });

  return new ApiResponse(200, {}, "Email verified successfully").send(res);
});

export const sendPasswordResetOtp = asyncHandler(async (req, res) => {
  const user = req.user;

  const otp = generateOTP();
  user.passwordResetOtp = otp;
  user.passwordResetOtpExpiresAt = Date.now() + 10 * 60 * 1000; // 10 mins
  await user.save({ validateBeforeSave: false });

  await sendPasswordResetEmail(user.email, user.username, otp, 10);

  return new ApiResponse(200, {}, "Password reset OTP sent to email").send(res);
});

export const verifyPasswordResetOtp = asyncHandler(async (req, res) => {
  const { otp } = req.body;
  const user = req.user;

  if (!user.passwordResetOtp || !user.passwordResetOtpExpiresAt) {
    throw new ApiError(400, "No OTP request found. Please request again.");
  }

  if (user.passwordResetOtp !== otp || Date.now() > user.passwordResetOtpExpiresAt) {
    throw new ApiError(400, "Invalid or expired OTP");
  }

  // OTP is valid → clear OTP but mark user as verified for reset
  user.passwordResetOtp = null;
  user.passwordResetOtpExpiresAt = null;
  user.isPasswordResetVerified = true; // 🔑 add a temp flag in schema
  await user.save({ validateBeforeSave: false });

  return new ApiResponse(200, {}, "OTP verified successfully").send(res);
});

export const setNewPassword = asyncHandler(async (req, res) => {
  const { newPassword } = req.body;
  const user = req.user;

  if (!user.isPasswordResetVerified) {
    throw new ApiError(400, "OTP not verified. Please verify before setting password.");
  }

  user.password = newPassword;
  user.isPasswordResetVerified = false; // clear flag
  await user.save({ validateBeforeSave: false });

  return new ApiResponse(200, {}, "Password reset successful").send(res);
});

// ------------------- Profile -------------------

export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id);
  const isPasswordValid = await user.isPasswordrect(currentPassword);
  if (!isPasswordValid) throw new ApiError(401, "Invalid current password");

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  const responseUser = await User.findById(user._id).select("-password -refreshToken");
  return new ApiResponse(200, responseUser, "Password changed successfully").send(res);
});

export const updateProfile = asyncHandler(async (req, res) => {
  const { username, fullName } = req.body;
  const user = await User.findById(req.user._id);

  if (username === user.username) throw new ApiError(400, "Username cannot be same as before");
  if (await User.findOne({ username })) throw new ApiError(400, "Username already in use");

  user.username = username;
  user.fullName = fullName;
  await user.save({ validateBeforeSave: false });

  const responseUser = await User.findById(user._id).select("-password -refreshToken");
  return new ApiResponse(200, responseUser, "Profile updated successfully").send(res);
});

export const getCurrentUser = asyncHandler(async (req, res) => {
  const responseUser = await User.findById(req.user._id).select(
    "-password -refreshToken -passwordResetOtp -passwordResetOtpExpiresAt -emailVerificationOtp -emailVerificationOtpExpiresAt"
  );
  return new ApiResponse(200, responseUser).send(res);
});

//move to s3
// Update avatar
export const updateAvatarRecord = async (req, res) => {
  try {
    const { fileKey } = req.body;
    const userId = req.user._id;

    if (!fileKey) throw new ApiError(400, "fileKey required");

    const user = await User.findById(userId);
    if (!user) throw new ApiError(404, "User not found");

    // Delete old avatar
    if (user.avatar) {
      try {
        const oldKey = user.avatar.split(".amazonaws.com/")[1];
        if (oldKey) {
          await s3.send(
            new DeleteObjectCommand({ Bucket: process.env.AWS_BUCKET_NAME, Key: oldKey })
          );
          console.log("Old avatar deleted:", oldKey);
        }
      } catch (err) {
        console.warn("Failed to delete old avatar:", err);
      }
    }
    user.avatar = fileKey;
    await user.save({ validateBeforeSave: false });

    const updatedUser = await User.findById(userId).select("-password -refreshToken");
    return new ApiResponse(200, updatedUser, "Avatar updated successfully").send(res);
  } catch (error) {
    console.error(error);
    return new ApiError(500, "Failed to update avatar", error);
  }
};
// Update cover image
export const updateCoverRecord = async (req, res) => {
  try {
    const { fileKey } = req.body;
    const userId = req.user._id;

    if (!fileKey) throw new ApiError(400, "fileKey required");

    const user = await User.findById(userId);
    if (!user) throw new ApiError(404, "User not found");

    // Delete old cover image
    if (user.coverImage) {
      try {
        const oldKey = user.coverImage.split(".amazonaws.com/")[1];
        if (oldKey) {
          await s3.send(
            new DeleteObjectCommand({ Bucket: process.env.AWS_BUCKET_NAME, Key: oldKey })
          );
          console.log("Old cover image deleted:", oldKey);
        }
      } catch (err) {
        console.warn("Failed to delete old cover:", err);
      }
    }
    user.coverImage = fileKey;
    await user.save({ validateBeforeSave: false });

    const updatedUser = await User.findById(userId).select("-password -refreshToken");
    return new ApiResponse(200, updatedUser, "Cover image updated successfully").send(res);
  } catch (error) {
    console.error(error);
    return new ApiError(500, "Failed to update cover image", error);
  }
};

export const getWatchHistory = asyncHandler(async (req, res) => {
  const watchHistory = await User.aggregate([
    { $match: { _id: new mongoose.Types.ObjectId(req.user._id) } },
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
              pipeline: [{ $project: { fullName: 1, username: 1, avatar: 1 } }],
            },
          },
          { $addFields: { owner: { $first: "$owner" } } },
          { $project: { title: 1, thumbnail: 1, views: 1, owner: 1, createdAt: 1 } },
        ],
      },
    },
    {
      $project: { watchHistory: 1 }, // only return watchHistory
    },
  ]);
  const results = watchHistory[0];
  return new ApiResponse(200, results, "Watch history fetched successfully").send(res);
});

export const addVideoToWatchHistory = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const userId = req.user._id;

  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    return new ApiError(400, "Invalid video ID");
  }

  await User.findByIdAndUpdate(userId, {
    $addToSet: { watchHistory: videoId },
  });

  return new ApiResponse(200, null, "Video added to watch history").send(res);
});

export const clearWatchHistory = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, { $set: { watchHistory: [] } }, { new: true });

  return new ApiResponse(200, {}, "Watch history cleared successfully").send(res);
});

// ------------------- Public -------------------

export const getPublicChannelDetails = asyncHandler(async (req, res) => {
  const { username } = req.params;

  const channel = await User.aggregate([
    { $match: { username: username.toLowerCase() } },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers",
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribedTo",
      },
    },
    {
      $addFields: {
        subscriberCount: { $size: "$subscribers" },
        channelsSubscribedToCount: { $size: "$subscribedTo" },
      },
    },
    {
      $project: {
        fullName: 1,
        username: 1,
        subscriberCount: 1,
        channelsSubscribedToCount: 1,
        avatar: 1,
        coverImage: 1,
        email: 1,
      },
    },
  ]);
  if (!channel?.length) throw new ApiError(404, "Channel does not exist");

  return new ApiResponse(200, channel[0], "User channel fetched successfully").send(res);
});

export const getSearchSuggestions = asyncHandler(async (req, res) => {
  const searchTerm = req.query.q.toLowerCase();

  const videoSuggestions = await Video.aggregate([
    { $match: { title: { $regex: searchTerm, $options: "i" }, isPublished: true } },
    { $limit: 5 },
    {
      $project: {
        _id: 1,
        title: 1,
        thumbnail: 1,
        type: { $literal: "video" },
        url: { $concat: ["/video/", { $toString: "$_id" }] },
      },
    },
  ]);

  const channelSuggestions = await User.aggregate([
    {
      $match: {
        $or: [
          { username: { $regex: searchTerm, $options: "i" } },
          { fullName: { $regex: searchTerm, $options: "i" } },
        ],
      },
    },
    { $limit: 10 },
    {
      $project: {
        _id: 1,
        title: "$username",
        url: { $concat: ["/channel/", "$username"] },
        avatar: 1,
        type: { $literal: "channel" },
      },
    },
  ]);

  return new ApiResponse(
    200,
    [...videoSuggestions, ...channelSuggestions],
    "Search suggestions fetched successfully"
  ).send(res);
});
