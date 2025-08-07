import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Tweet } from "../models/tweet.model.js";
import { isValidObjectId } from "mongoose";

const createTweet = asyncHandler(async (req, res) => {
  //TODO: create tweet
  const { content } = req.body;
  const user = req.user;

  if (!user) {
    throw new ApiError(401, "Unauthorized Access").send(res);
  }
  if (!content || !content.trim().length === "") {
    throw new ApiError(400, "Content is required").send(res);
  }
  const tweet = await Tweet.create({
    content,
    owner: user._id,
  });
  return new ApiResponse(200, tweet, "Tweet created successfully").send(res);
});

const getUserTweets = asyncHandler(async (req, res) => {
  // TODO: get user tweets
  const user = req.user;
  if (!user) {
    throw new ApiError(401, "Unauthorized Access").send(res);
  }
  const tweets = await Tweet.find({ owner: user._id });
  if (!tweets) {
    throw new ApiError(404, "No tweets found").send(res);
  }
  return new ApiResponse(200, tweets, "Tweets fetched successfully").send(res);
});

const updateTweet = asyncHandler(async (req, res) => {
  //TODO: update tweet
  const { tweetId } = req.params;
  const { content } = req.body;
  if (!tweetId || !isValidObjectId(tweetId)) {
    throw new ApiError(400, "Tweet id is required and must be valid").send(res);
  }
  const tweet = await Tweet.findById(tweetId);
  if (!tweet) {
    throw new ApiError(404, "Tweet not found").send(res);
  }
  tweet.content = content;
  tweet.save();
  return new ApiResponse(200, tweet, "Tweet updated successfully").send(res);
});

const deleteTweet = asyncHandler(async (req, res) => {
  //TODO: delete tweet
  const { tweetId } = req.params;
  if (!tweetId || !isValidObjectId(tweetId)) {
    throw new ApiError(400, "Tweet id is required and must be valid").send(res);
  }
  const tweet = await Tweet.findByIdAndDelete(tweetId);
  if (!tweet) {
    throw new ApiError(404, "Tweet not found").send(res);
  }
  return new ApiResponse(200, tweet, "Tweet deleted successfully").send(res);
});

export { createTweet, getUserTweets, updateTweet, deleteTweet };
