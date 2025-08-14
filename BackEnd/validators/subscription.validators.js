import { param } from "express-validator";
import mongoose from "mongoose";

export const channelIdParamValidator = [
  param("channelId")
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage("Invalid channel ID"),
];

export const subscriberIdParamValidator = [
  param("subscriberId")
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage("Invalid subscriber ID"),
];