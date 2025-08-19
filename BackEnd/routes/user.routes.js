import { Router } from "express";
import {
  registerUser,
  login,
  logout,
  refreshToken,
  changePassword,
  updateProfile,
  getCurrentUser,
  updateAvatar,
  updateCoverImage,
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
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
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
router.post(
  "/register",
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
  ]),
  registerUserValidator,
  validate,
  registerUser
);

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

router.post("/update-avatar", verifyJWT, upload.single("avatar"), updateAvatar);

router.post("/update-cover-image", verifyJWT, upload.single("coverImage"), updateCoverImage);

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
