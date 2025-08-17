import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Like } from "../models/like.model.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  const existingLike = await Like.findOne({
    video: videoId,
    likedBy: req.user._id,
  });

  if (existingLike) {
    await Like.deleteOne({ _id: existingLike._id });
    return new ApiResponse(200, null, "Video unliked successfully").send(res);
  }

  const like = await Like.create({
    video: videoId,
    likedBy: req.user._id,
  });

  return new ApiResponse(200, like, "Video liked successfully").send(res);
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  const existingLike = await Like.findOne({
    comment: commentId,
    likedBy: req.user._id,
  });

  if (existingLike) {
    await Like.deleteOne({ _id: existingLike._id });
    return new ApiResponse(200, null, "Comment unliked successfully").send(res);
  }

  const like = await Like.create({
    comment: commentId,
    likedBy: req.user._id,
  });

  return new ApiResponse(200, like, "Comment liked successfully").send(res);
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;

  const existingLike = await Like.findOne({
    tweet: tweetId,
    likedBy: req.user._id,
  });

  if (existingLike) {
    await Like.deleteOne({ _id: existingLike._id });
    return new ApiResponse(200, null, "Tweet unliked successfully").send(res);
  }

  const like = await Like.create({
    tweet: tweetId,
    likedBy: req.user._id,
  });

  return new ApiResponse(200, like, "Tweet liked successfully").send(res);
});

const getAllLikedVideos = asyncHandler(async (req, res) => {
  const likes = await Like.find({ likedBy: req.user._id });

  if (!likes || likes.length === 0) {
    throw new ApiError(404, "No liked videos found");
  }

  return new ApiResponse(200, likes, "Liked videos fetched successfully").send(res);
});

const getIfLikedVideosById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  const like = await Like.findOne({
    likedBy: req.user._id,
    video: videoId,
  });

  return new ApiResponse(200, { liked: !!like }, "Like status fetched successfully").send(res);
});

const getVideoLikesId = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  const likes = await Like.find({ video: videoId });

  return new ApiResponse(200, likes, "Likes for the video fetched successfully").send(res);
});

export {
  toggleCommentLike,
  toggleTweetLike,
  toggleVideoLike,
  getAllLikedVideos,
  getIfLikedVideosById,
  getVideoLikesId,
};
