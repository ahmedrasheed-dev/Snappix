import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Video } from "../models/video.model.js";

//move to s3
// import { deleteLocalFile } from "../utils/DeleteLocalfile.js";
import mongoose from "mongoose";

import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3 } from "../config/s3.config.js";

export const getPresignedUrl = async (req, res, next) => {
  try {
    const { fileName, fileType, fileCategory, fileSize } = req.body;

    if (!fileName || !fileType || !fileCategory || !fileSize)
      throw new ApiError(400, "Missing required fields");

    // Size limits
    const MAX_VIDEO_SIZE = 60 * 1024 * 1024; // 60 MB
    const MAX_IMAGE_SIZE = 2 * 1024 * 1024; // 2 MB

    const allowedVideoTypes = ["video/mp4", "video/mov", "video/webm"];
    const allowedImageTypes = ["image/jpeg", "image/png", "image/webp"];

    if (fileCategory === "video" && !allowedVideoTypes.includes(fileType))
      throw new ApiError(400, "Invalid video type");
    if (fileCategory === "thumbnail" && !allowedImageTypes.includes(fileType))
      throw new ApiError(400, "Invalid thumbnail type");

    if (fileCategory === "video" && fileSize > MAX_VIDEO_SIZE)
      throw new ApiError(400, "Video exceeds 60 MB limit");
    if (fileCategory === "thumbnail" && fileSize > MAX_IMAGE_SIZE)
      throw new ApiError(400, "Thumbnail exceeds 2 MB limit");

    // Folder routing
    const folder = fileCategory === "video" ? "videos" : "thumbnails";

    // Give unique name
    const cleanName = fileName.replace(/\s+/g, "_");
    const key = `${folder}/${Date.now()}-${cleanName}`;

    const command = new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key,
      ContentType: fileType,
    });

    const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });
    const publicUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

    res.json({ uploadUrl, fileUrl: publicUrl });
  } catch (err) {
    next(err);
  }
};

const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description, videoUrl, thumbnailUrl, duration  } = req.body;

  if (!title || !description || !videoUrl || !thumbnailUrl || !duration)
    throw new ApiError(400, "All fields are required");

  const newVideo = await Video.create({
    videoFile: videoUrl,
    thumbnail: thumbnailUrl,
    owner: req.user._id,
    title,
    description,
    duration,
  });

  return new ApiResponse(201, newVideo, "Video published successfully").send(res);
});


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

//moving to s3
export const getThumbnailUploadUrl = async (req, res) => {
  try {
    const { videoId, fileType } = req.body;

    if (!videoId) throw new ApiError(400, "videoId is required");
    if (!fileType) throw new ApiError(400, "fileType is required");

    const video = await Video.findById(videoId);
    if (!video) throw new ApiError(404, "Video not found");

    const fileKey = `thumbnails/${videoId}-${Date.now()}.jpg`;

    const command = new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: fileKey,
      ContentType: fileType,
    });

    const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 300 }); // 5 mins

    return new ApiResponse(200, { uploadUrl, fileKey }, "Presigned URL generated").send(res);
  } catch (error) {
    console.error(error);
    return new ApiError(500, "Failed to generate presigned URL", error).send(res);
  }
};
// save thumbnail to DB (after client upload)
export const updateThumbnailRecord = async (req, res) => {
  try {
    const { videoId, fileKey } = req.body;
    if (!videoId || !fileKey) throw new ApiError(400, "videoId and fileKey required");

    const video = await Video.findById(videoId);
    if (!video) throw new ApiError(404, "Video not found");

    //  step 1: delete old thumbnail from S3 if exists 
    if (video.thumbnail) {
      try {
        const oldKey = video.thumbnail.split(".amazonaws.com/")[1];
        if (oldKey) {
          await s3.send(
            new DeleteObjectCommand({
              Bucket: process.env.AWS_BUCKET_NAME,
              Key: oldKey,
            })
          );
          console.log("Old thumbnail deleted:", oldKey);
        }
      } catch (delErr) {
        console.warn("Failed to delete old thumbnail:", delErr);
      }
    }

    // --- Step 2: save new thumbnail URL in DB ---
    const thumbnailUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`;

    video.thumbnail = thumbnailUrl;
    await video.save();

    return new ApiResponse(200, video, "Thumbnail updated successfully").send(res);
  } catch (error) {
    console.error(error);
    return new ApiError(500, "Failed to update thumbnail record", error).send(res);
  }
};

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
  getMyVideos
};
