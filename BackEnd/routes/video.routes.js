import { Router } from "express";
import {
  publishAVideo,
  getAllVideos,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
  increaseVideoViews,
  getMyVideos,
  UpdateThumbnail,
  getPresignedUrl,
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
router.post("/upload", verifyJWT, publishAVideo);

// Get all videos with filters, pagination, search
router.get("/", getAllVideosValidator, validate, getAllVideos);

// get user dahsboard videos
router.get("/myvideos", verifyJWT, getAllVideosValidator, getMyVideos);

// Get single video by ID
router.get("/:videoId", getVideoByIdValidator, validate, getVideoById);

// Increase video views
router.patch("/:videoId/views", increaseViewsValidator, validate, increaseVideoViews);

//get presigned url for upload to s3
router.post("/presign", verifyJWT, getPresignedUrl);

// Update video details (title, description, isPublished)
router.patch("/:videoId", verifyJWT, updateVideoValidator, validate, updateVideo);

//updaet thumbnil
router.post("/thumbnail/:videoId", verifyJWT, upload.single("thumbnail"), UpdateThumbnail);

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
