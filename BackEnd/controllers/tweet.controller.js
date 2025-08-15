import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Tweet } from "../models/tweet.model.js";

const createTweet = asyncHandler(async (req, res) => {
  const { content } = req.body;
  const user = req.user;

  const tweet = await Tweet.create({
    content,
    owner: user._id,
  });

  return new ApiResponse(201, tweet, "Tweet created successfully").send(res);
});

const getUserTweets = asyncHandler(async (req, res) => {
  const tweets = await Tweet.find({ owner: req.user._id });
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
