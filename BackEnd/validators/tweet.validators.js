import { body, param } from "express-validator";
import mongoose from "mongoose";

export const createTweetValidator = [
  body("content").trim().notEmpty().withMessage("Content is required"),
];

export const tweetIdParamValidator = [
  param("tweetId")
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage("Invalid tweet ID"),
];

export const updateTweetValidator = [
  ...tweetIdParamValidator,
  body("content").trim().notEmpty().withMessage("Content is required"),
];
