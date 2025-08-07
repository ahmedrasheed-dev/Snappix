import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Comment } from "../models/comments.model.js";
import mongoose from "mongoose";

const getVideoComments = asyncHandler(async (req, res) => {
  //TODO: get all comments for a video
  const { videoId } = req.params;
  const {
    page = 1,
    limit = 10,
    sortBy = "createdAt",
    sortType = "desc",
  } = req.query;
  const commentsWithRepliesPipeLine = [
    {
      $match: {
        video: new mongoose.Types.ObjectId(videoId),
        parentComment: null,
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
        foreignField: "parentComment",
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
  ];
  if (!commentsWithRepliesPipeLine) {
    throw new ApiError(404, "Comments not found").send(res);
  }
  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
    sort: { [sortBy]: sortType === "desc" ? -1 : 1 },
  };
  const result = await Comment.aggregatePaginate(
    Comment.aggregate(commentsWithRepliesPipeLine),
    options
  );

  return new ApiResponse(200, result, "Comments fetched successfully").send(
    res
  );
});

const addComment = asyncHandler(async (req, res) => {
  // TODO: add a comment to a video
  const { videoId } = req.params;
  const userId = req.user._id;
  if (!userId) {
    throw new ApiError(401, "Unauthorized Access").send(res);
  }
  const { content, parentComponent } = req.body;
  if (!content || !content.trim().length === "") {
    throw new ApiError(400, "Content is required").send(res);
  }
  if (!videoId) {
    throw new ApiError(400, "Video ID is required").send(res);
  }

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new ApiError(400, "invalid User ID").send(res);
  }
  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(400, "invalid Video ID").send(res);
  }
  if (parentComponent && !mongoose.Types.ObjectId.isValid(parentComponent)) {
    throw new ApiError(400, "invalid Parent Comment ID").send(res);
  }

  const comment = await Comment.create({
    video: videoId,
    owner: userId,
    content,
    parentComment: parentComponent || null,
  });
  if (!comment) {
    throw new ApiError(500, "Failed to add comment").send(res);
  }
  return new ApiResponse(200, comment, "Comment added successfully").send(res);
});

const addReplyToComment = asyncHandler(async (req, res) => {
  // TODO: add a reply to a comment
  const { videoId, parentCommentId } = req.params;
  const { content } = req.body;
  const userId = req.user._id;
  if (!parentCommentId || !content.trim().length === "") {
    throw new ApiError(400, "ParentCommentId and content is required").send(
      res
    );
  }

  const comment = await Comment.create({
    video: videoId,
    owner: userId,
    content,
    parentComment: parentCommentId,
  });

  res
    .status(201)
    .json(new ApiResponse(200, comment, "Comment added successfully"));
});

const updateComment = asyncHandler(async (req, res) => {
  // TODO: update a comment
  const { commentId } = req.params;
  const { content } = req.body;

  if (!content.trim().length === "") {
    throw new ApiError(400, "Content is required").send(res);
  }
  if (!commentId) {
    throw new ApiError(400, "Comment id is required").send(res);
  }

  if (!mongoose.Types.ObjectId.isValid(commentId)) {
    throw new ApiError(400, "invalid commmentId").send(res);
  }

  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new ApiError(404, "Comment not found").send(res);
  }
  comment.content = content;
  await comment.save({ valideBeforeSave: false });
  return new ApiResponse(200, comment, "Comment updated successfully").send(
    res
  );
});
const deleteCommentAndReplies = async (commentId) => {
  const comment = await Comment.findById(commentId);
  if (!comment) return;

  // Find replies to this comment
  const replies = await Comment.find({ parentComment: commentId });

  // Recursively delete replies
  for (const reply of replies) {
    await deleteCommentAndReplies(reply._id);
  }

  // Delete this comment
  await Comment.findByIdAndDelete(commentId);
};

const deleteComment = asyncHandler(async (req, res) => {
  // TODO: delete a comment
  const { commentId } = req.params;
  if (!commentId) {
    throw new ApiError(400, "Comment id is required").send(res);
  }
  if (!mongoose.Types.ObjectId.isValid(commentId)) {
    throw new ApiError(400, "invalid commmentId").send(res);
  }
  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new ApiError(404, "Comment not found").send(res);
  }
  await deleteCommentAndReplies(commentId);
  return new ApiResponse(200, comment, "Comment deleted successfully").send(
    res
  );

});

export {
  getVideoComments,
  addComment,
  updateComment,
  deleteComment,
  addReplyToComment,
};
