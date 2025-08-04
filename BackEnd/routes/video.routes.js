import { Router } from "express";
import {
  publishAVideo,
  getAllVideos,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
} from "../controllers/video.controller.js";
import { veriftJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.post(
  "/upload",
  veriftJWT,
  upload.fields([
    { name: "video", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 },
  ]),
  publishAVideo
);

router.get("/", veriftJWT, getAllVideos);
router.get("/:videoId", veriftJWT, getVideoById);
router.patch("/:videoId", veriftJWT, upload.single("thumbnail"), updateVideo);
router.delete("/:videoId", veriftJWT, deleteVideo);
router.patch("/toggle-publish/:videoId", veriftJWT, togglePublishStatus);
export default router;
