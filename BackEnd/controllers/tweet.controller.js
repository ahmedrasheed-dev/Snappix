import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Tweet } from "../models/tweet.model.js";

const createTweet = asyncHandler(async (req, res) => {
  const { content } = req.body;
  const user = req.user;

  const tweetCreated = await Tweet.create({
    content,
    owner: user._id,
  });

  // Use aggregation to return the created tweet with owner info
  const tweet = await Tweet.aggregate([
    { $match: { _id: tweetCreated._id } },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
      },
    },
    { $unwind: "$owner" },
    {
      $project: {
        content: 1,
        createdAt: 1,
        updatedAt: 1,
        "owner._id": 1,
        "owner.fullname": 1,
        "owner.username": 1,
        "owner.avatar": 1,
      },
    },
  ]);

  return new ApiResponse(201, tweet[0], "Tweet created successfully").send(res);
});
//get all tweets of everyone
const getUserTweets = asyncHandler(async (req, res) => {
  const tweets = await Tweet.aggregate([
    { $sort: { createdAt: -1 } }, // newest first
    {
      $lookup: {
        // join with User collection
        from: "users", // MongoDB collection name
        localField: "owner",
        foreignField: "_id",
        as: "owner",
      },
    },
    { $unwind: "$owner" }, // convert array to object
    {
      $project: {
        // select only needed fields
        content: 1,
        createdAt: 1,
        updatedAt: 1,
        "owner._id": 1,
        "owner.fullname": 1,
        "owner.username": 1,
        "owner.avatar": 1,
      },
    },
  ]);

  return new ApiResponse(200, tweets, "Tweets fetched successfully").send(res);
});

const updateTweet = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  const { content } = req.body;

  const tweet = await Tweet.findById(tweetId);
  if (!tweet) {
    throw new ApiError(404, "Tweet not found");
  }

  tweet.content = content;
  await tweet.save();

  return new ApiResponse(200, tweet, "Tweet updated successfully").send(res);
});

const deleteTweet = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;

  const tweet = await Tweet.findByIdAndDelete(tweetId);
  if (!tweet) {
    throw new ApiError(404, "Tweet not found");
  }

  return new ApiResponse(200, tweet, "Tweet deleted successfully").send(res);
});

export { createTweet, getUserTweets, updateTweet, deleteTweet };
