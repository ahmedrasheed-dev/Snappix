import { Router } from "express";
import {
  getVideoComments,
  addComment,
  updateComment,
  deleteComment,
  addReplyToComment,
} from "../controllers/comment.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validateRequest.middleware.js";
import {
  videoIdParamValidator,
  commentIdParamValidator,
  parentCommentIdParamValidator,
  contentBodyValidator,
} from "../validators/comment.validators.js";

const router = Router();

router.get("/:videoId", videoIdParamValidator, validate, getVideoComments);

router.post(
  "/:videoId",
  verifyJWT,
  videoIdParamValidator,
  contentBodyValidator,
  validate,
  addComment
);

router.post(
  "/reply/:videoId/:parentCommentId",
  verifyJWT,
  videoIdParamValidator,
  parentCommentIdParamValidator,
  contentBodyValidator,
  validate,
  addReplyToComment
);

router.patch(
  "/:commentId",
  verifyJWT,
  commentIdParamValidator,
  contentBodyValidator,
  validate,
  updateComment
);

router.delete(
  "/:commentId",
  verifyJWT,
  commentIdParamValidator,
  validate,
  deleteComment
);

export default router;
