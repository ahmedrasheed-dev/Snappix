import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Comment } from "../models/comment.model.js";
import mongoose from "mongoose";

const getVideoComments = asyncHandler(async (req, res) => {
  //TODO: get all comments for a video
  const { videoId } = req.params;
  const { page = 1, limit = 10 } = req.query;
  const commentsWithReplies = await Comment.aggregate([
    {
      $match: {
        video: mongoose.Types.ObjectId(videoId),
        parent: null,
      },
    },
    {
      $sort: { createdAt: -1 },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "commentOwners",
        pipeline: [
          {
            $project: {
              fullName: 1,
              username: 1,
              avatar: 1,
            },
          },
        ],
      },
    },
    {
      $lookup: {
        from: "comments",
        localField: "_id",
        foreignField: "parent",
        as: "replies",
        pipeline: [
          {
            $sort: { createdAt: 1 }, // sort replies oldest -> newest
          },
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "replyOwners",
              pipeline: [
                {
                  $project: {
                    fullName: 1,
                    username: 1,
                    avatar: 1,
                  },
                },
              ],
            },
          },
          {
            $project: {
              content: 1,
              createdAt: 1,
              "replyOwners.fullName": 1,
              "replyOwners.username": 1,
              "replyOwners.avatar": 1,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        commentCount: {
          $size: "$commentOwners",
        },
      },
    },
    {
      $project: {
        content: 1,
        createdAt: 1,
        commentCount: 1,
        "commentOwners.fullName": 1,
        "commentOwners.username": 1,
        "commentOwners.avatar": 1,
        replies: 1,
      },
    },
  ]);
  if (!commentsWithReplies) {
    throw new ApiError(404, "Comments not found").send(res);
  }
  return new ApiResponse(
    200,
    commentsWithReplies,
    "Comments fetched successfully"
  ).send(res);
});

const addComment = asyncHandler(async (req, res) => {
  // TODO: add a comment to a video
});

const updateComment = asyncHandler(async (req, res) => {
  // TODO: update a comment
});

const deleteComment = asyncHandler(async (req, res) => {
  // TODO: delete a comment
});

export { getVideoComments, addComment, updateComment, deleteComment };
