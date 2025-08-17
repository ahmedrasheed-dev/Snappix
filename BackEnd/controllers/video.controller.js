import asyncHandler from "../utils/asyncHandler.js";
import fs from "fs";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Video } from "../models/video.model.js";
import ffmpeg from "fluent-ffmpeg";
import { uploadToCloudinary, deleteFromCloudinary, extractPublicId } from "../utils/cloudinary.js";
import path from "path";
import { imageComp } from "../utils/ImageCompressionUtils.js";
import { deleteLocalFile } from "../utils/DeleteLocalfile.js";
import mongoose from "mongoose";

const compressVideo = (inputPath, outputPath) => {
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .videoCodec("libx264")
      .size("?x720")
      .outputOptions("-crf 28")
      .outputOptions("-preset veryfast")
      .save(outputPath)
      .on("end", () => resolve(outputPath))
      .on("error", (err) => reject(err));
  });
};

const getAllVideos = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    query,
    sortBy = "createdAt",
    sortType = "desc",
    title,
    owner,
  } = req.query;
  //TODO: get all videos based on query, sort, pagination

  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
    sort: { [sortBy]: sortType === "desc" ? -1 : 1 },
  };

  const matchStage = {};
  if (query) {
    matchStage.title = { $regex: query, $options: "i" };
  }
  if (owner) {
    matchStage.owner = new mongoose.Types.ObjectId(owner);
  }
  matchStage.isPublished = true;

  const aggregate = Video.aggregate([
    { $match: matchStage },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "ownerInfo",
      },
    },
    {
      $unwind: "$ownerInfo",
    },
    {
      $project: {
        _id: 1,
        videoFile: 1,
        thumbnail: 1,
        owner: 1,
        title: 1,
        description: 1,
        duration: 1,
        views: 1,
        isPublished: 1,
        createdAt: 1,
        // The `ownerInfo` field will now only contain the `username`
        "ownerInfo.username": 1,
        "ownerInfo.isEmailVerified": 1,
        "ownerInfo.avatar": 1,
      },
    },
  ]);
  const videos = await Video.aggregatePaginate(aggregate, options);

  return new ApiResponse(200, videos, "Videos fetched successfully").send(res);
});
//user dashboard videos
const getMyVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, sortBy = "createdAt", sortType = "desc" } = req.query;

  const userId = new mongoose.Types.ObjectId(req.user._id);

  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
    sort: { [sortBy]: sortType === "desc" ? -1 : 1 },
  };

  const aggregate = Video.aggregate([
    { $match: { owner: userId } },
    {
      $facet: {
        // 1️⃣ Video list (with pagination)
        videos: [
          { $sort: { [sortBy]: sortType === "desc" ? -1 : 1 } },

          // join with user
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "ownerInfo",
            },
          },
          { $unwind: "$ownerInfo" },

          // join with comments
          {
            $lookup: {
              from: "comments",
              localField: "_id",
              foreignField: "video",
              as: "comments",
            },
          },
          {
            $addFields: {
              commentsCount: { $size: "$comments" },
            },
          },

          // join with likes
          {
            $lookup: {
              from: "likes",
              localField: "_id",
              foreignField: "video",
              as: "likes",
            },
          },
          {
            $addFields: {
              likesCount: { $size: "$likes" },
            },
          },

          {
            $project: {
              _id: 1,
              videoFile: 1,
              thumbnail: 1,
              owner: 1,
              title: 1,
              description: 1,
              duration: 1,
              views: 1,
              isPublished: 1,
              createdAt: 1,
              commentsCount: 1,
              likesCount: 1,
              "ownerInfo.username": 1,
              "ownerInfo.avatar": 1,
            },
          },

          { $limit: parseInt(limit) },
        ],

        // 2️⃣ Total views
        totalViews: [{ $group: { _id: null, totalViews: { $sum: "$views" } } }],

        // 3️⃣ Total count for pagination
        totalCount: [{ $count: "count" }],
      },
    },
  ]);

  const result = await aggregate.exec();

  const videos = result[0].videos;
  const totalViews = result[0].totalViews[0]?.totalViews || 0;
  const totalCount = result[0].totalCount[0]?.count || 0;

  return new ApiResponse(
    200,
    {
      videos,
      totalViews,
      pagination: {
        totalItems: totalCount,
        totalPages: Math.ceil(totalCount / limit),
        currentPage: parseInt(page),
      },
    },
    "Your videos fetched successfully"
  ).send(res);
});

const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;

  if (!title || !description || title.trim() === "" || description.trim() === "") {
    throw new ApiError(400, "Title and description are required");
  }

  const videoLocalPath = req.files?.video?.[0]?.path;
  const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path;

  if (!videoLocalPath || !thumbnailLocalPath) {
    throw new ApiError(400, "Video and thumbnail are required");
  }

  const compressedVideoPath = `${videoLocalPath}-compressed.mp4`;
  const compressedThumbnailPath = path.join(
    path.dirname(thumbnailLocalPath),
    `${path.parse(thumbnailLocalPath).name}-compressed.jpg`
  );

  try {
    await compressVideo(videoLocalPath, compressedVideoPath);
    await imageComp(thumbnailLocalPath, compressedThumbnailPath);

    const video = await uploadToCloudinary(compressedVideoPath);
    const thumbnail = await uploadToCloudinary(compressedThumbnailPath);

    const newVideo = await Video.create({
      videoFile: video.secure_url,
      thumbnail: thumbnail.secure_url,
      owner: req.user._id,
      title,
      description,
      duration: video.duration || 0, // handle undefined
    });

    return new ApiResponse(201, newVideo, "Video published successfully").send(res);
  } catch (err) {
    console.error("Compression/upload error: ", err);
    res.status(500).json(new ApiError(500, "Video processing failed", err));
  } finally {
    await deleteLocalFile(videoLocalPath);
    await deleteLocalFile(compressedVideoPath);
    await deleteLocalFile(thumbnailLocalPath);
    await deleteLocalFile(compressedThumbnailPath);
  }
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!videoId || !mongoose.isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }

  const video = await Video.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(videoId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
      },
    },
    {
      $unwind: "$owner",
    },
    {
      $project: {
        _id: 1,
        videoFile: 1,
        thumbnail: 1,
        title: 1,
        description: 1,
        duration: 1,
        views: 1,
        isPublished: 1,
        createdAt: 1,
        updatedAt: 1,
        ownerId: "$owner._id",
        owner: {
          _id: "$owner._id",
          avatar: "$owner.avatar",
          username: "$owner.username",
        },
      },
    },
  ]);

  if (!video[0]) {
    throw new ApiError(404, "Video not found");
  }

  return new ApiResponse(200, video[0], "Video fetched successfully").send(res);
});

const updateVideo = asyncHandler(async (req, res) => {
  //TODO: update video details like title, description
  const { videoId } = req.params;
  const { title, description } = req.body;

  if (!videoId) {
    throw new ApiError(400, "Video id is required");
  }
  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video not found");
  }
  if (title) {
    video.title = title;
  }
  if (description) {
    video.description = description;
  }
  await video.save();
  const responeVideo = await Video.findById(videoId);
  return new ApiResponse(200, responeVideo, "Video updated successfully").send(res);
});

const UpdateThumbnail = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const thumbnailLocalPath = req.file?.path;
  if (!thumbnailLocalPath) {
    throw new ApiError(400, "Thumbnail is required");
  }
  if (!videoId) {
    throw new ApiError(400, "Video id is required");
  }
  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  const oldThumbnail = video.thumbnail;
  const compressedThumbnailPath = path.join(
    path.dirname(thumbnailLocalPath),
    `${path.parse(thumbnailLocalPath).name}-compressed.jpg`
  );
  try {
    const publicId = extractPublicId(oldThumbnail);
    await deleteFromCloudinary(publicId);

    await imageComp(thumbnailLocalPath, compressedThumbnailPath);

    const thumbnail = await uploadToCloudinary(compressedThumbnailPath);
    video.thumbnail = thumbnail.secure_url;
    await video.save();
    const responeVideo = await Video.findById(videoId);
    return new ApiResponse(200, responeVideo, "Thumbnail updated successfully").send(res);
  } catch (error) {
    console.error("Compression/upload error: ", error);
    return new ApiError(500, "Thumbnail processing failed", error).send(res);
  } finally {
    deleteLocalFile(thumbnailLocalPath);
    deleteLocalFile(compressedThumbnailPath);
  }
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: delete video
  if (!videoId) {
    throw new ApiError(400, "Video id is required");
  }

  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video not found");
  }
  let publicId = extractPublicId(video.videoFile);
  await deleteFromCloudinary(publicId);
  publicId = extractPublicId(video.thumbnail);
  await deleteFromCloudinary(publicId);
  await Video.findByIdAndDelete(videoId);
  return new ApiResponse(200, {}, "Video deleted successfully").send(res);
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!videoId) {
    throw new ApiError(400, "Video id is required");
  }
  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video not found");
  }
  video.isPublished = !video.isPublished;
  await video.save({ validateBeforeSave: false });
  return new ApiResponse(200, video, "Video status updated successfully").send(res);
});

const increaseVideoViews = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!videoId) {
    throw new ApiError(400, "Video ID is required");
  }

  const video = await Video.findByIdAndUpdate(
    videoId,
    {
      $inc: { views: 1 },
    },
    { new: true }
  );

  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  return new ApiResponse(200, video, "Video view count increased successfully").send(res);
});
export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
  increaseVideoViews,
  getMyVideos,
  UpdateThumbnail,
};
