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
} from "../controllers/user.controller.js";
import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { veriftJWT } from "../middlewares/auth.middleware.js";
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

//secured routes
router.post("/logout", veriftJWT, logout);
router.post("/refresh-token", refreshToken);
router.post("/change-password", veriftJWT, changePassword);
router.post("/update-profile", veriftJWT, updateProfile);
router.get("/profile", veriftJWT, getCurrentUser);
router.post(
  "/update-avatar",
  veriftJWT,
  upload.single("avatar"),
  updateAvatar
);
router.post(
  "/update-cover-image",
  veriftJWT,
  upload.single("coverImage"),
  updateCoverImage)


router.get("/c/:username", veriftJWT, getUserChannelProfile)  
export default router;
