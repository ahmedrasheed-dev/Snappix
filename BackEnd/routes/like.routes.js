import { Router } from "express";
const router = Router();

import {
  toggleCommentLike,
  toggleTweetLike,
  toggleVideoLike,
  getAllLikedVideos,
  getIfLikedVideosById,
  getVideoLikesId,
} from "../controllers/likes.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

router.get("/videos", verifyJWT, getAllLikedVideos);
router.post("/v/:videoId", verifyJWT, toggleVideoLike);
router.get("/v/:videoId", verifyJWT, getIfLikedVideosById);
router.post("/c/:commentId", verifyJWT, toggleCommentLike);
router.post("/t/:tweetId", verifyJWT, toggleTweetLike);
router.get("/v/likes/:videoId", getVideoLikesId)

export default router;
