import { body, param } from "express-validator";
import mongoose from "mongoose";

// Helper to check ObjectId validity
const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

export const createPlaylistValidator = [
  body("name")
    .trim()
    .notEmpty().withMessage("Name is required")
    .isLength({ min: 3 }).withMessage("Name must be at least 3 characters"),
  body("isPublic")
    .optional()
    .isBoolean().withMessage("isPublic must be true or false"),
];

export const playlistIdParamValidator = [
  param("playlistId")
    .custom((value) => isValidObjectId(value))
    .withMessage("Invalid playlist ID"),
];

export const videoIdParamValidator = [
  param("videoId")
    .custom((value) => isValidObjectId(value))
    .withMessage("Invalid video ID"),
];

export const addVideoToPlaylistValidator = [
  ...playlistIdParamValidator,
  ...videoIdParamValidator,
];

export const usernameParamValidator = [
  param("username")
    .trim()
    .notEmpty().withMessage("Username is required"),
];
