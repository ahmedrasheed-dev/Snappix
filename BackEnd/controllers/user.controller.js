import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";

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
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  const { username, fullName, email, password } = req.body;
  if (
    [username, fullName, email, password].some((field) => field.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }

  const existingUser = await User.findOne({
    $or: [{ username }, { email }],
  });
  if (existingUser) {
    throw new ApiError(400, "Username or email already exists");
  }

  if (password.length < 6) {
    throw new ApiError(400, "Password must be at least 6 characters long");
  }
  const avatarlocalFilePath = req.files.avatar[0].path;
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
    .json(new ApiResponse(201, responseuser, "User registered successfully"));
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new ApiError(400, "Email and password are required");
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid email or password");
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
    throw new ApiError(401, "Unauthorized");
  }

  res
    .status(200)
    .clearCookie("refreshToken", cookieOptions)
    .clearCookie("accessToken", cookieOptions)
    .json(new ApiResponse(200, {}, "Logout successful"));
});
export { registerUser, login, logout };
