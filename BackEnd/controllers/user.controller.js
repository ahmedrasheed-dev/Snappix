import asyncHandler from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";

const registerUser = asyncHandler(async (req, res) => {
  const { username, fullName, email, password } = req.body;
  if (
    [username, fullName, email, password].some(
      (field) => field.trim() === ""
    )
  ) {
    throw new ApiError(400, "All fields are required");
  }

  const existingUser = await User.findOne({
    $or: [{ username }, { email }],
  });
  if (existingUser) {
    throw new ApiError(
      400,
      "Username or email already exists"
    );
  }

  if (password.length < 6) {
    throw new ApiError(
      400,
      "Password must be at least 6 characters long"
    );
  }

  const avatarLocalPath = req.files.avatar
    ? req.files.avatar[0].filename
    : null;
  const coverImageLocalPath = req.files.coverImage
    ? req.files.coverImage[0].filename
    : null;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar image is required");
  }

  const avatar_cloudinary_url =
    await uploadToCloudinary(avatarLocalPath);
  if (!avatar_cloudinary_url) {
    throw new ApiError(
      500,
      "Failed to upload avatar image"
    );
  }

  const coverImage_cloudinary_url =
    await uploadToCloudinary(coverImageLocalPath);
  if (!coverImage_cloudinary_url) {
    throw new ApiError(
      500,
      "Failed to upload coverImage image"
    );
  }

  const user = await User.create({
    username: username.toLowerCase(),
    fullName,
    email,
    password,
    avatar: avatar_cloudinary_url,
    coverImage: coverImage_cloudinary_url || "",
  });
  user.password = ""; // Exclude password from response
  user.refreshToken = ""; // Exclude refreshToken from response

  if (!user) {
    throw new ApiError(500, "Failed to create user");
  }
  res
    .status(201)
    .json(
      new ApiResponse("User registered successfully", user)
    );
});

export { registerUser };
