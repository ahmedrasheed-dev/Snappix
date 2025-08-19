import Mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const UserSchema = new Mongoose.Schema(
  {
    watchHistory: [
      {
        type: Mongoose.Schema.Types.ObjectId,
        ref: "video",
      },
    ],
    username: {
      type: String,
      required: [true, "Username is required"],
      lowercase: true,
      trim: true,
      match: /^[A-Za-z0-9$_]+$/,
      index: true,
      unique: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      lowercase: true,
      trim: true,
      index: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      unique: true,
    },
    fullName: {
      type: String,
      required: [true, "FullName is required"],
      lowercase: true,
      trim: true,
      minlength: [4, "FullName can't be Shorter than 4 characters"],
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
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationOtp: {
      type: String,
      required: false,
    },
    emailVerificationOtpExpiresAt: {
      type: Date,
      required: false,
    },
    // Separate fields for password reset OTP
    passwordResetOtp: {
      type: String,
      required: false,
    },
    passwordResetOtpExpiresAt: {
      type: Date,
      required: false,
    },
  },
  { timestamps: true }
);

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

UserSchema.methods.isPasswordrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

UserSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      fullName: this.fullName,
    },
    process.env.REFRESH_TOKEN_SECRET,
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

export const User = Mongoose.models.User || Mongoose.model("user", UserSchema);
