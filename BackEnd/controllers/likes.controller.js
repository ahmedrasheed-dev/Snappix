import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Like } from "../models/likes.model.js";
import { Mongoose } from "mongoose";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: toggle like on video
  if (!videoId || Mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(400, "Video id is required and must be Valid").send(res);
  }

  const like = await Like.create({
    video: videoId,
    likedBy: req.user._id,
  });
  return new ApiResponse(200, like, "Video liked successfully").send(res);
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  //TODO: toggle like on comment
  if (!commentId || Mongoose.Types.ObjectId.isValid(commentId)) {
    throw new ApiError(400, "commentId id is required and must be Valid").send(
      res
    );
  }

  const like = await Like.create({
    comment: commentId,
    likedBy: req.user._id,
  });
  return new ApiResponse(200, like, "Comment liked successfully").send(res);
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  //TODO: toggle like on tweet
  if (!tweetId || Mongoose.Types.ObjectId.isValid(tweetId)) {
    throw new ApiError(400, "tweet Id is required and must be Valid").send(res);
  }

  const like = await Like.create({
    tweet: tweetId,
    likedBy: req.user._id,
  });
  return new ApiResponse(200, like, "tweet liked successfully").send(res);
});

const getLikedVideos = asyncHandler(async (req, res) => {
  //TODO: get all liked videos
  const user = req.user;

  if (!user) {
    throw new ApiError(401, "Unauthorized Access").send(res);
  }
  const likes = await Like.find({ likedBy: user._id });
  if (!likes) {
    throw new ApiError(404, "No liked videos found").send(res);
  }
  return new ApiResponse(200, likes, "Liked videos fetched successfully").send(
    res
  );
});

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };
