import { Router } from "express";
import {
  publishAVideo,
  getAllVideos,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
  increaseVideoViews,
} from "../controllers/video.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import { validate } from "../middlewares/validateRequest.middleware.js";
import {
  publishVideoValidator,
  videoIdParamValidator,
  getAllVideosValidator,
  updateVideoValidator,
  togglePublishValidator,
  increaseViewsValidator,
  deleteVideoValidator,
  getVideoByIdValidator,
} from "../validators/video.validators.js";

const router = Router();

// Upload and publish a video
router.post(
  "/upload",
  verifyJWT,
  upload.fields([
    { name: "video", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 },
  ]),
  publishVideoValidator,
  validate,
  publishAVideo
);

// Get all videos with filters, pagination, search
router.get("/", getAllVideosValidator, validate, getAllVideos);

// Get single video by ID
router.get("/:videoId", getVideoByIdValidator, validate, getVideoById);

// Increase video views
router.patch("/:videoId/views", increaseViewsValidator, validate, increaseVideoViews);

// Update video details (title, description, thumbnail)
router.patch(
  "/:videoId",
  verifyJWT,
  upload.single("thumbnail"),
  updateVideoValidator,
  validate,
  updateVideo
);

// Delete video
router.delete("/:videoId", verifyJWT, deleteVideoValidator, validate, deleteVideo);

// Toggle publish status
router.patch(
  "/toggle-publish/:videoId",
  verifyJWT,
  togglePublishValidator,
  validate,
  togglePublishStatus
);

export default router;
