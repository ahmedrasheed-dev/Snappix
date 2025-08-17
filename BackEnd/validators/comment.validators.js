import { body, param } from "express-validator";
import mongoose from "mongoose";

const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

export const videoIdParamValidator = [
  param("videoId")
    .custom(isValidObjectId)
    .withMessage("Invalid Video ID"),
];

export const commentIdParamValidator = [
  param("commentId")
    .custom(isValidObjectId)
    .withMessage("Invalid Comment ID"),
];

export const parentCommentIdParamValidator = [
  param("parentCommentId")
    .custom(isValidObjectId)
    .withMessage("Invalid Parent Comment ID"),
];

export const contentBodyValidator = [
  body("content")
    .trim()
    .notEmpty()
    .withMessage("Content is required")
    .isLength({ min: 1 })
    .withMessage("Content must not be empty"),
];
