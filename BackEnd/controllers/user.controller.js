import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import { User } from "../models/user.model.js";

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
        $or: [{username}, {email}]
    })
    if(existingUser) {
        throw new ApiError(400, "Username or email already exists");
    }
    const user = await User.create({
        username: username.toLowerCase(),
        fullName,
        email,
        password,
    })

});
