import { body, param, query } from "express-validator";

export const registerUserValidator = [
  body("username")
    .trim()
    .notEmpty()
    .withMessage("Username is required")
    .isLength({ min: 3 })
    .withMessage("Username must be at least 3 characters"),
  body("fullName").trim().notEmpty().withMessage("Full name is required"),
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email"),
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters"),
];

export const loginValidator = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email"),
  body("password").notEmpty().withMessage("Password is required"),
];

export const changePasswordValidator = [
  body("currentPassword").notEmpty().withMessage("Current password is required"),
  body("newPassword")
    .notEmpty()
    .withMessage("New password is required")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters")
    .custom((val, { req }) => {
      if (val === req.body.currentPassword) {
        throw new Error("New password cannot be the same as current password");
      }
      return true;
    }),
];

export const updateProfileValidator = [
  body("fullName").trim().notEmpty().withMessage("Full name is required"),
  body("username").trim().notEmpty().withMessage("Username is required"),
];

export const usernameParamValidator = [
  param("username").trim().notEmpty().withMessage("Username is required"),
];

export const suggestionsValidator = [
  query("q")
    .optional()
    .isString()
    .withMessage("Search query must be a string")
    .isLength({ min: 3 })
    .withMessage("Search query must be at least 3 characters"),
];
