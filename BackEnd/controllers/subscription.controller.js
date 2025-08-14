import mongoose from "mongoose";
import { Subscription } from "../models/subscription.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  const subscriberId = req.user._id;

  if (channelId.toString() === subscriberId.toString()) {
    throw new ApiError(400, "You cannot subscribe to your own channel.");
  }

  let subscription = await Subscription.findOne({
    channel: channelId,
    subscriber: subscriberId,
  });

  if (subscription) {
    await Subscription.deleteOne({ _id: subscription._id });
    return res
      .status(200)
      .json(new ApiResponse(200, { subscribed: false }, "Unsubscribed successfully"));
  }

  subscription = await Subscription.create({
    channel: channelId,
    subscriber: subscriberId,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, { subscribed: true }, "Subscribed successfully"));
});

const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  const subscribers = await Subscription.aggregate([
    {
      $match: { channel: new mongoose.Types.ObjectId(channelId) },
    },
    {
      $lookup: {
        from: "users",
        localField: "subscriber",
        foreignField: "_id",
        as: "subscriberInfo",
        pipeline: [
          { $project: { username: 1, fullName: 1, avatar: 1, createdAt: 1 } },
        ],
      },
    },
    { $unwind: "$subscriberInfo" },
    { $replaceRoot: { newRoot: "$subscriberInfo" } },
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, subscribers, "Subscribers fetched successfully"));
});

const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params;

  const subscribedChannels = await Subscription.aggregate([
    {
      $match: { subscriber: new mongoose.Types.ObjectId(subscriberId) },
    },
    {
      $lookup: {
        from: "users",
        localField: "channel",
        foreignField: "_id",
        as: "channelInfo",
        pipeline: [
          { $project: { username: 1, fullName: 1, avatar: 1, createdAt: 1 } },
        ],
      },
    },
    { $unwind: "$channelInfo" },
    { $replaceRoot: { newRoot: "$channelInfo" } },
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, subscribedChannels, "Subscribed channels fetched successfully"));
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
