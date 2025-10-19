import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Comment } from "../models/comments.model.js";
import mongoose from "mongoose";

const getVideoComments = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { page = 1, limit = 10, sortBy = "createdAt", sortType = "desc" } = req.query;

  const commentsWithRepliesPipeLine = [
    {
      $match: {
        video: new mongoose.Types.ObjectId(videoId),
        parentComment: null,
      },
    },
    { $sort: { [sortBy]: sortType === "desc" ? -1 : 1 } },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "commentOwners",
        pipeline: [{ $project: { fullName: 1, username: 1, avatar: 1 } }],
      },
    },
    {
      $lookup: {
        from: "comments",
        localField: "_id",
        foreignField: "parentComment",
        as: "replies",
        pipeline: [
          { $sort: { createdAt: 1 } },
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "replyOwners",
              pipeline: [{ $project: { fullName: 1, username: 1, avatar: 1 } }],
            },
          },
          {
            $project: {
              _id: 1,
              content: 1,
              createdAt: 1,
              replyOwners: { $first: "$replyOwners" },
            },
          },
        ],
      },
    },
    { $addFields: { commentCount: { $size: "$replies" } } },
    {
      $project: {
        content: 1,
        createdAt: 1,
        commentCount: 1,
        commentOwners: { $first: "$commentOwners" },
        replies: 1,
      },
    },
  ];

  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
  };

  const result = await Comment.aggregatePaginate(
    Comment.aggregate(commentsWithRepliesPipeLine),
    options
  );

  return new ApiResponse(200, result, "Comments fetched successfully").send(res);
});

const addComment = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { content } = req.body;
  const userId = req.user._id;
  console.log("in comment addition controler")
  const comment = await Comment.create({
    video: videoId,
    owner: userId,
    content,
    parentComment: null,
  });
  console.log("comment is: ",comment)

  const createdComment = await Comment.aggregate([
    { $match: { _id: comment._id } },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "commentOwners",
        pipeline: [{ $project: { fullName: 1, username: 1, avatar: 1 } }],
      },
    },
    { $addFields: { replies: [] } },
  ]);

  return new ApiResponse(201, createdComment[0], "Comment added successfully").send(res);
});

const addReplyToComment = asyncHandler(async (req, res) => {
  const { videoId, parentCommentId } = req.params;
  const { content } = req.body;
  const userId = req.user._id;

  const comment = await Comment.create({
    video: videoId,
    owner: userId,
    content,
    parentComment: parentCommentId,
  });

  const createdReply = await Comment.aggregate([
    { $match: { _id: comment._id } },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "replyOwners",
        pipeline: [{ $project: { fullName: 1, username: 1, avatar: 1 } }],
      },
    },
  ]);

  return new ApiResponse(201, createdReply[0], "Reply added successfully").send(res);
});

const updateComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const { content } = req.body;

  const comment = await Comment.findById(commentId);
  if (!comment) throw new ApiError(404, "Comment not found");

  comment.content = content;
  await comment.save({ validateBeforeSave: false });

  return new ApiResponse(200, comment, "Comment updated successfully").send(res);
});

const deleteCommentAndReplies = async (commentId) => {
  const replies = await Comment.find({ parentComment: commentId });
  for (const reply of replies) {
    await deleteCommentAndReplies(reply._id);
  }
  await Comment.findByIdAndDelete(commentId);
};

const deleteComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  const comment = await Comment.findById(commentId);
  if (!comment) throw new ApiError(404, "Comment not found");

  await deleteCommentAndReplies(commentId);

  return new ApiResponse(200, comment, "Comment deleted successfully").send(res);
});

export { getVideoComments, addComment, updateComment, deleteComment, addReplyToComment };
