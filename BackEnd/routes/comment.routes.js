import { Router } from "express";
import {
  getVideoComments,
  addComment,
} from "../controllers/comment.controller.js";
import { veriftJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/:videoId", veriftJWT, getVideoComments);
router.post("/:videoId", veriftJWT, addComment);
router.post("/reply/:videoId/:parentCommentId", veriftJWT, addReplyToComment);
router.post("/:commentId", veriftJWT, updateComment);
router.delete("/:commentId", veriftJWT, deleteComment);

export default router;
