import { param } from "express-validator";
import mongoose from "mongoose";

const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

export const videoIdParamValidator = [
  param("videoId")
    .custom((value) => isValidObjectId(value))
    .withMessage("Video id is required and must be valid"),
];

export const commentIdParamValidator = [
  param("commentId")
    .custom((value) => isValidObjectId(value))
    .withMessage("Comment id is required and must be valid"),
];

export const tweetIdParamValidator = [
  param("tweetId")
    .custom((value) => isValidObjectId(value))
    .withMessage("Tweet id is required and must be valid"),
];