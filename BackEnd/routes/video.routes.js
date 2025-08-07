import { Router } from "express";
import {
  publishAVideo,
  getAllVideos,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
} from "../controllers/video.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.post(
  "/upload",
  verifyJWT,
  upload.fields([
    { name: "video", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 },
  ]),
  publishAVideo
);

router.get("/", verifyJWT, getAllVideos);
router.get("/:videoId", verifyJWT, getVideoById);
router.patch("/:videoId", verifyJWT, upload.single("thumbnail"), updateVideo);
router.delete("/:videoId", verifyJWT, deleteVideo);
router.patch("/toggle-publish/:videoId", verifyJWT, togglePublishStatus);
export default router;
