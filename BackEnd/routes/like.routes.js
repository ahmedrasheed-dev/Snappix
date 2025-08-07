import { Router } from "express";
const router = Router();

import {
  toggleCommentLike,
  toggleTweetLike,
  toggleVideoLike,
  getLikedVideos,
} from "../controllers/likes.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

router.get("/videos", verifyJWT, getLikedVideos);
router.post("/v/:videoId", verifyJWT, toggleVideoLike);
router.post("/c/:commentId", verifyJWT, toggleCommentLike);
router.post("/t/:tweetId", verifyJWT, toggleTweetLike);

export default router;
