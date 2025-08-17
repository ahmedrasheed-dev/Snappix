import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  toggleCommentLike,
  toggleTweetLike,
  toggleVideoLike,
  getAllLikedVideos,
  getIfLikedVideosById,
  getVideoLikesId,
} from "../controllers/likes.controller.js";
import {
  videoIdParamValidator,
  commentIdParamValidator,
  tweetIdParamValidator,
} from "../validators/like.validators.js";
import { validate } from "../middlewares/validateRequest.middleware.js";

const router = Router();

router.post("/v/:videoId", verifyJWT, videoIdParamValidator, validate, toggleVideoLike);
router.post("/c/:commentId", verifyJWT, commentIdParamValidator, validate, toggleCommentLike);
router.post("/t/:tweetId", verifyJWT, tweetIdParamValidator, validate, toggleTweetLike);

router.get("/videos", verifyJWT, getAllLikedVideos);
router.get("/v/:videoId", verifyJWT, videoIdParamValidator, validate, getIfLikedVideosById);
router.get("/v/likes/:videoId", videoIdParamValidator, validate, getVideoLikesId);

export default router;