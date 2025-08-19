import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { Video } from "../models/video.model.js";
import mongoose from "mongoose";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import path from "path";
import { sendOTPEmail, sendPasswordResetEmail } from "../utils/NodeMailer.js";
import { uploadToCloudinary, deleteFromCloudinary, extractPublicId } from "../utils/cloudinary.js";
import { capitalizeFirstLetter, convertMillisToMinutes } from "../utils/utilFunctions.js";
import { imageComp } from "../utils/ImageCompressionUtils.js";
import { deleteLocalFile } from "../utils/DeleteLocalfile.js";

dotenv.config({ path: "../env" });

const cookieOptions = {
  httpOnly: true,
  secure: false, //for local host
  age: 24 * 60 * 60 * 1000,
  sameSite: "lax",
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

export const registerUser = asyncHandler(async (req, res) => {
  const { username, fullName, email, password } = req.body;
  const avatarPath = req.files?.avatar?.[0]?.path;
  const coverImagePath = req.files?.coverImage?.[0]?.path;
  const compressedAvatarPath = path.join(
    path.dirname(avatarPath),
    `compressed-${path.basename(avatarPath)}`
  );

  try {
    const existingUser = await User.findOne({
      $or: [{ username }, { email }],
    });
    if (existingUser) throw new ApiError(400, "Username or email already exists");

    await imageComp(avatarPath, compressedAvatarPath);
    const avatar = await uploadToCloudinary(compressedAvatarPath);
    const coverImage = coverImagePath ? await uploadToCloudinary(coverImagePath) : null;

    const newUser = await User.create({
      username: username.toLowerCase(),
      fullName,
      email,
      password,
      avatar: avatar.secure_url,
      coverImage: coverImage?.secure_url || "",
    });

    const responseUser = await User.findById(newUser._id).select("-password -refreshToken");
    return new ApiResponse(201, responseUser, "User registered successfully").send(res);
  } finally {
    await deleteLocalFile(avatarPath);
    await deleteLocalFile(coverImagePath);
    await deleteLocalFile(compressedAvatarPath);
  }
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const DBuser = await User.findOne({ email });
  if (!DBuser) throw new ApiError(404, "User not found");

  const isPasswordValid = await DBuser.isPasswordrect(password);
  if (!isPasswordValid) {
    console.log("About to throw ApiError: Invalid email or password");
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

export const updateAvatar = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.file?.path;
  const publicId = extractPublicId(req.user.avatar);
  if (publicId) await deleteFromCloudinary(publicId);

  const avatar = await uploadToCloudinary(avatarLocalPath);
  req.user.avatar = avatar.secure_url;
  await req.user.save({ validateBeforeSave: false });

  const responseUser = await User.findById(req.user._id).select("-password -refreshToken");
  return new ApiResponse(200, responseUser, "Avatar updated successfully").send(res);
});

export const updateCoverImage = asyncHandler(async (req, res) => {
  const coverLocalPath = req.file?.path;
  const publicId = extractPublicId(req.user.coverImage);
  if (publicId) await deleteFromCloudinary(publicId);

  const coverImage = await uploadToCloudinary(coverLocalPath);
  req.user.coverImage = coverImage.secure_url;
  await req.user.save({ validateBeforeSave: false });

  const responseUser = await User.findById(req.user._id).select("-password -refreshToken");
  return new ApiResponse(200, responseUser, "Cover image updated successfully").send(res);
});

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
