import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Like } from "../models/like.model.js";
import { mongoose } from "mongoose";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: toggle like on video
  if (!videoId || !mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(
      400,
      "Video id is required and must be Valid"
    ).send(res);
  }

  const existingLike = await Like.findOne({
    video: videoId,
    likedBy: req.user._id,
  });

  if (existingLike) {
    await Like.deleteOne({ _id: existingLike._id });
    return new ApiResponse(
      200,
      null,
      "Video unliked successfully"
    ).send(res);
  }

  const like = await Like.create({
    video: videoId,
    likedBy: req.user._id,
  });
  return new ApiResponse(200, like, "Video liked successfully").send(
    res
  );
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  //TODO: toggle like on comment
  if (!commentId || !mongoose.Types.ObjectId.isValid(commentId)) {
    throw new ApiError(
      400,
      "commentId id is required and must be Valid"
    ).send(res);
  }

  const existingLike = await Like.findOne({
    comment: commentId,
    likedBy: req.user._id,
  });

  if (existingLike) {
    await Like.deleteOne({ _id: existingLike._id });
    return new ApiResponse(
      200,
      null,
      "Comment unliked successfully"
    ).send(res);
  }

  const like = await Like.create({
    comment: commentId,
    likedBy: req.user._id,
  });
  return new ApiResponse(
    200,
    like,
    "Comment liked successfully"
  ).send(res);
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  //TODO: toggle like on tweet
  if (!tweetId || !mongoose.Types.ObjectId.isValid(tweetId)) {
    throw new ApiError(
      400,
      "tweet Id is required and must be Valid"
    ).send(res);
  }

  const existingLike = await Like.findOne({
    tweet: tweetId,
    likedBy: req.user._id,
  });

  if (existingLike) {
    await Like.deleteOne({ _id: existingLike._id });
    return new ApiResponse(
      200,
      null,
      "Tweet unliked successfully"
    ).send(res);
  }

  const like = await Like.create({
    tweet: tweetId,
    likedBy: req.user._id,
  });
  return new ApiResponse(200, like, "tweet liked successfully").send(
    res
  );
});

const getAllLikedVideos = asyncHandler(async (req, res) => {
  //TODO: get all liked videos
  const user = req.user;

  if (!user) {
    throw new ApiError(401, "Unauthorized Access").send(res);
  }
  const likes = await Like.find({ likedBy: user._id });
  if (!likes) {
    throw new ApiError(404, "No liked videos found").send(res);
  }
  return new ApiResponse(
    200,
    likes,
    "Liked videos fetched successfully"
  ).send(res);
});
const getIfLikedVideosById = asyncHandler(async (req, res) => {
  //TODO: get all liked videos
  const user = req.user;
  const videoId = req.params?.videoId;
  if (!videoId || !mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(400, "Video id is required and must be Valid");
  }
  if (!user) {
    throw new ApiError(401, "Unauthorized Access").send(res);
  }
  const likes = await Like.find({
    likedBy: user._id,
    video: videoId,
  });
  if (!likes) {
    throw new ApiError(404, "No liked videos found").send(res);
  }
  return new ApiResponse(
    200,
    likes,
    "Liked videos fetched successfully"
  ).send(res);
});
const getVideoLikesId = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!videoId || !mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(400, "Video id is required and must be valid");
  }

  const likes = await Like.find({ video: videoId });

  return new ApiResponse(
    200,
    likes,
    "Likes for the video fetched successfully"
  ).send(res);
});

export {
  toggleCommentLike,
  toggleTweetLike,
  toggleVideoLike,
  getAllLikedVideos,
  getIfLikedVideosById,
  getVideoLikesId
};
