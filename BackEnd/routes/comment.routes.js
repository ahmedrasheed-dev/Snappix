import { Router } from "express";
import {
  getVideoComments,
  addComment,
  updateComment,
  deleteComment,
  addReplyToComment,
} from "../controllers/comment.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/:videoId", verifyJWT, getVideoComments);
router.post("/:videoId", verifyJWT, addComment);
router.post("/reply/:videoId/:parentCommentId", verifyJWT, addReplyToComment);
router.patch("/:commentId", verifyJWT, updateComment);
router.delete("/:commentId", verifyJWT, deleteComment);

export default router;
