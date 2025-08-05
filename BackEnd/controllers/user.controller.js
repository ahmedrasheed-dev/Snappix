import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import {
  uploadToCloudinary,
  deleteFromCloudinary,
  extractPublicId,
} from "../utils/cloudinary.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

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

const registerUser = asyncHandler(async (req, res) => {
  const { username, fullName, email, password } = req.body;
  if (
    [username, fullName, email, password].some((field) => field.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required").send(res);
  }

  const existingUser = await User.findOne({
    $or: [{ username }, { email }],
  });
  if (existingUser) {
    throw new ApiError(400, "Username or email already exists").send(res);
  }

  if (password.length < 8) {
    throw new ApiError(400, "Password must be at least 6 characters long").send(
      res
    );
  }

  const avatarlocalFilePath = req.files?.avatar?.[0]?.path;

  if (!avatarlocalFilePath) {
    throw new ApiError(400, "Avatar is required").send(res);
  }

  let coverImagelocalFilePath = "";
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImagelocalFilePath = req.files.coverImage[0].path;
  }

  // console.log("req.files: ", req.files);
  //   {
  //   avatar: [
  //     {
  //       fieldname: 'avatar',
  //       originalname: 'Screenshot_20250622_185853.png',
  //       encoding: '7bit',
  //       mimetype: 'image/png',
  //       destination: '/home/ahmed/Desktop/Snappix-Project/BackEnd/public/temp',
  //       filename: 'Screenshot_20250622_185853.png',
  //       path: '/home/ahmed/Desktop/Snappix-Project/BackEnd/public/temp/Screenshot_20250622_185853.png',
  //       size: 47646
  //     }
  //   ],
  //   coverImage: [
  //     {
  //       fieldname: 'coverImage',
  //       originalname: 'picture_2025-07-01_21-57-16.jpg',
  //       encoding: '7bit',
  //       mimetype: 'image/jpeg',
  //       destination: '/home/ahmed/Desktop/Snappix-Project/BackEnd/public/temp',
  //       filename: 'picture_2025-07-01_21-57-16.jpg',
  //       path: '/home/ahmed/Desktop/Snappix-Project/BackEnd/public/temp/picture_2025-07-01_21-57-16.jpg',
  //       size: 36498
  //     }
  //   ]
  // }

  const avatar = await uploadToCloudinary(avatarlocalFilePath);

  let coverImage = "";
  if (coverImagelocalFilePath) {
    coverImage = await uploadToCloudinary(coverImagelocalFilePath);
  }

  if (!avatar) {
    throw new ApiError(500, "Failed to upload avatar image").send(res);
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
    throw new ApiError(500, "Failed to create user").send(res);
  }

  const responseuser = await User.findById(newUser._id).select(
    "-password -refreshToken"
  );
  res
    .status(201)
    .json(new ApiResponse(201, responseuser, "User registered successfully"));
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new ApiError(400, "Email and password are required").send(res);
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(404, "User not found").send(res);
  }

  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid email or password").send(res);
  }
  const { refreshToken, accessToken } = await generateAccessAndRefereshTokens(
    user._id
  );

  user.refreshToken = refreshToken;
  user.accessToken = accessToken;
  await user.save({ validateBeforeSave: false });

  const responseUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  res
    .status(200)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .cookie("accessToken", accessToken, cookieOptions)
    .json(
      new ApiResponse(
        200,
        { user: responseUser, refreshToken, accessToken },
        "Login successful"
      )
    );
});

const logout = asyncHandler(async (req, res) => {
  const user = req.user;
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
  const { refreshToken, accessToken } = await generateAccessAndRefereshTokens(
    user._id
  );
  user.refreshToken = refreshToken;
  user.accessToken = accessToken;
  await user.save({ validateBeforeSave: false });

  res
    .status(200)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .cookie("accessToken", accessToken, cookieOptions)
    .json(
      new ApiResponse(200, { user, accessToken }, "Token updated successfully")
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
    throw new ApiError(400, "Password must be at least 8 characters long").send(
      res
    );
  }

  const isPasswordValid = await user.isPasswordCorrect(currentPassword);
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
    .json(new ApiResponse(200, responseUser, "Password changed successfully"));
});

const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const { fullName, email } = req.body;
  if (!fullName || !email) {
    throw new ApiError(400, "Full name and email are required").send(res);
  }

  if (email === user.email) {
    throw new ApiError(400, "Email cannot be same as previous email").send(res);
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
    .json(new ApiResponse(200, responseUser, "Profile updated successfully"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  const user = req.user;
  const responseUser = await User.findById(user._id).select(
    "-password -refreshToken"
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
    .json(new ApiResponse(200, responseUser, "Avatar updated successfully"));
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
      new ApiResponse(200, responseUser, "coverImage updated successfully")
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
};
