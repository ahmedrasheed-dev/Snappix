import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import asyncHandler from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params;
    const subscriberId = req.user?._id;

    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channel ID");
    }
    if (!subscriberId) {
        throw new ApiError(401, "Unauthorized: User not logged in.");
    }

    if (channelId.toString() === subscriberId.toString()) {
        throw new ApiError(400, "You cannot subscribe to your own channel.");
    }

    let subscription = await Subscription.findOne({
        channel: channelId,
        subscriber: subscriberId
    });

    if (subscription) {
        // If subscription exists, unsubscribe
        await Subscription.deleteOne({ _id: subscription._id });
        return res
            .status(200)
            .json(new ApiResponse(200, { subscribed: false }, "Unsubscribed successfully"));
    } else {
        // If subscription does not exist, subscribe
        subscription = await Subscription.create({
            channel: channelId,
            subscriber: subscriberId
        });
        return res
            .status(200)
            .json(new ApiResponse(200, { subscribed: true }, "Subscribed successfully"));
    }
});

const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params;

    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channel ID");
    }

    const subscribers = await Subscription.aggregate([
        {
            $match: {
                channel: new mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $lookup: {
                from: "users", // The collection name for the User model
                localField: "subscriber",
                foreignField: "_id",
                as: "subscriberInfo",
                pipeline: [
                    {
                        $project: {
                            username: 1,
                            fullName: 1,
                            avatar: 1,
                            createdAt: 1,
                        }
                    }
                ]
            }
        },
        {
            $unwind: "$subscriberInfo" // Deconstructs the subscriberInfo array
        },
        {
            $replaceRoot: { newRoot: "$subscriberInfo" } // Promote the subscriberInfo to the root
        },
        {
            $project: { // Project only the necessary fields for the final output
                username: 1,
                fullName: 1,
                avatar: 1,
                createdAt: 1,
            }
        }
    ]);

    return res
        .status(200)
        .json(new ApiResponse(200, subscribers, "Subscribers fetched successfully"));
});

const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params;

    if (!isValidObjectId(subscriberId)) {
        throw new ApiError(400, "Invalid subscriber ID");
    }

    const subscribedChannels = await Subscription.aggregate([
        {
            $match: {
                subscriber: new mongoose.Types.ObjectId(subscriberId)
            }
        },
        {
            $lookup: {
                from: "users", // The collection name for the User model
                localField: "channel",
                foreignField: "_id",
                as: "channelInfo",
                pipeline: [
                    {
                        $project: {
                            username: 1,
                            fullName: 1,
                            avatar: 1,
                            createdAt: 1,
                        }
                    }
                ]
            }
        },
        {
            $unwind: "$channelInfo" // Deconstructs the channelInfo array
        },
        {
            $replaceRoot: { newRoot: "$channelInfo" } // Promote the channelInfo to the root
        },
        {
            $project: { // Project only the necessary fields for the final output
                username: 1,
                fullName: 1,
                avatar: 1,
                createdAt: 1,
            }
        }
    ]);

    return res
        .status(200)
        .json(new ApiResponse(200, subscribedChannels, "Subscribed channels fetched successfully"));
});

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}
