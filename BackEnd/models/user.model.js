import Mongoose from "mongoose";
import bcrypt from "bcrypt.js";
import jwt from "jsonwebtoken";

const UserSchema = new Mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Username is required"],
      lowercase: true,
      trim: true,
      match: /^[A-Za-z0-9$_]+$/,
      index: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      lowercase: true,
      trim: true,
      index: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    fullName: {
      type: String,
      required: [true, "FullName is required"],
      lowercase: true,
      trim: true,
      minlength: [
        4,
        "FullName can't be Shorter than 4 characters",
      ],
    },
    avatar: {
      type: String,
      required: [true, "Avatar image is required"],
    },
    coverImage: {
      type: String,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    refreshToken: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  this.password = await bcrypt.hash(password, 10);
  next();
});

UserSchema.methods.isPasswordCorrect = async (password) => {
  return await bcrypt.compare(this.password, password);
};

UserSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      fullName: this.fullName,
    },
    process.env.REFRESH_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN,
    }
  );
};

UserSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN,
    }
  );
};

export const user = Mongoose.model("user", UserSchema);
