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
    return new ApiResponse(200, { subscribed: false }, "Unsubscribed successfully").send(res);
  }

  subscription = await Subscription.create({
    channel: channelId,
    subscriber: subscriberId,
  });

  return new ApiResponse(200, { subscribed: true }, "Subscribed successfully").send(res);
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

  return new ApiResponse(200, subscribers, "Subscribers fetched successfully").send(res);
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

  return new ApiResponse(200, subscribedChannels, "Subscribed channels fetched successfully").send(res);
});

export const getSubscriptionStatus = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  const viewerId = req.user._id;

  const exists = await Subscription.exists({
    channel: channelId,
    subscriber: viewerId
  });

  const subscribers = await Subscription.aggregate([
  { $match: { channel: new mongoose.Types.ObjectId(channelId) } },
  { $count: "subscriberCount" }
]);


  return new ApiResponse(200, { isSubscribed: !!exists, subscriberCount: subscribers[0]?.subscriberCount || 0 }, "Subscription status fetched").send(res);
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
