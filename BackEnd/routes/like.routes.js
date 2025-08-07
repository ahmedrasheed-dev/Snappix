import { Router } from "express";
const router = Router();

import {
  toggleCommentLike,
  toggleTweetLike,
  toggleVideoLike,
  getLikedVideos,
} from "../controllers/likes.controller.js";

router.get("/videos", getLikedVideos);
router.post("/v/:videoId", toggleVideoLike);
router.post("/c/:videoId", toggleCommentLike);
router.post("/t/:videoId", toggleTweetLike);

export default router;
