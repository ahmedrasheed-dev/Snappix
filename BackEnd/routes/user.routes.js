import { Router } from "express";
import {
  login,
  logout,
  refreshToken,
  changePassword,
  updateProfile,
  getCurrentUser,
  getPublicChannelDetails,
  getWatchHistory,
  getSearchSuggestions,
  addVideoToWatchHistory,
  clearWatchHistory,
  sendPasswordResetOtp,
  verifyPasswordResetOtp,
  sendEmailVerifyOtp,
  verifyEmailOtp,
  setNewPassword,
  getUploadUrl,
  registerUser,
  updateAvatarRecord,
  updateCoverRecord,
} from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validateRequest.middleware.js";
import {
  registerUserValidator,
  loginValidator,
  changePasswordValidator,
  updateProfileValidator,
  usernameParamValidator,
  suggestionsValidator,
} from "../validators/user.validators.js";

const router = Router();

/* ---------- PUBLIC ROUTES ----------- */

//move to s3
// Register new user (after uploading avatar & cover to S3)
router.post("/presigned-url/public", getUploadUrl);
router.post("/register", registerUserValidator, validate, registerUser);

router.post("/login", loginValidator, validate, login);

router.get("/suggestions", suggestionsValidator, validate, getSearchSuggestions);

router.get("/c/:username", usernameParamValidator, validate, getPublicChannelDetails);

router.post("/watchHistory/:videoId", verifyJWT, addVideoToWatchHistory);

router.delete("/watchHistory/clear", verifyJWT, clearWatchHistory);

/* ---------- AUTH ROUTES ---------- */
router.post("/logout", verifyJWT, logout);

router.post("/refresh-token", refreshToken);

router.post("/update-profile", verifyJWT, updateProfileValidator, validate, updateProfile);

router.get("/profile", verifyJWT, getCurrentUser);

// get Private Pre-signed url for uploading cover or avatar
router.post("/presigned-url", verifyJWT, getUploadUrl);

router.post("/update-avatar", verifyJWT, updateAvatarRecord);

router.post("/update-cover", verifyJWT, updateCoverRecord);

router.get("/watch-history", verifyJWT, getWatchHistory);

router.post("/change-password", verifyJWT, changePasswordValidator, validate, changePassword);

// Password Reset Flow (via OTP)
router.post("/password-reset/send-otp", verifyJWT, sendPasswordResetOtp);
router.post("/password-reset/verify-otp", verifyJWT, verifyPasswordResetOtp);
router.post("/password-reset/set-password", verifyJWT, setNewPassword);
// Email Verification Flow
router.post("/email/send-otp", verifyJWT, sendEmailVerifyOtp);
router.post("/email/verify-otp", verifyJWT, verifyEmailOtp);

export default router;
