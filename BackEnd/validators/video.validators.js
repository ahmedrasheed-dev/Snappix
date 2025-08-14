import { body, param, query } from "express-validator";
import mongoose from "mongoose";

export const publishVideoValidator = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Title is required")
    .isLength({ min: 3 })
    .withMessage("Title must be at least 3 characters long"),

  body("description")
    .trim()
    .notEmpty()
    .withMessage("Description is required")
    .isLength({ min: 10 })
    .withMessage("Description must be at least 10 characters long"),

  // Files validation will still be done in controller or multer check
];

export const videoIdParamValidator = [
  param("videoId")
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage("Invalid video ID"),
];

export const getAllVideosValidator = [
  query("page").optional().isInt({ min: 1 }).withMessage("Page must be a positive integer"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),
  query("sortBy").optional().isString().withMessage("SortBy must be a string"),
  query("sortType")
    .optional()
    .isIn(["asc", "desc"])
    .withMessage("SortType must be 'asc' or 'desc'"),
  query("query").optional().isString().withMessage("Search query must be a string"),
  query("owner")
    .optional()
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage("Owner must be a valid ObjectId"),
];

export const updateVideoValidator = [
  ...videoIdParamValidator,
  body("title")
    .optional()
    .trim()
    .isLength({ min: 3 })
    .withMessage("Title must be at least 3 characters long"),
  body("description")
    .optional()
    .trim()
    .isLength({ min: 10 })
    .withMessage("Description must be at least 10 characters long"),
];

export const togglePublishValidator = [...videoIdParamValidator];
export const increaseViewsValidator = [...videoIdParamValidator];
export const deleteVideoValidator = [...videoIdParamValidator];
export const getVideoByIdValidator = [...videoIdParamValidator];
