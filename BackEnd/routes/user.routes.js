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
  getUserChannelProfile,
  getWatchHistory,
  getSearchSuggestions,
} from "../controllers/user.controller.js";
import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router = Router();

router.post(
  "/register",
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
  ]),
  registerUser
);

router.post("/login", login);
router.get("/suggestions", getSearchSuggestions);

//secured routes
router.post("/logout", verifyJWT, logout);
router.post("/refresh-token", refreshToken);
router.post("/change-password", verifyJWT, changePassword);
router.post("/update-profile", verifyJWT, updateProfile);
router.get("/profile", verifyJWT, getCurrentUser);

router.post(
  "/update-avatar",
  verifyJWT,
  upload.single("avatar"),
  updateAvatar
);

router.post(
  "/update-cover-image",
  verifyJWT,
  upload.single("coverImage"),
  updateCoverImage
);

router.get("/c/:username", verifyJWT, getUserChannelProfile);

router.get("/watch-history", verifyJWT, getWatchHistory);

export default router;
