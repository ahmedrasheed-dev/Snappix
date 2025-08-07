import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Video } from "../models/video.model.js";
import ffmpeg from "fluent-ffmpeg";
import {
  uploadToCloudinary,
  deleteFromCloudinary,
  extractPublicId,
} from "../utils/cloudinary.js";

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
    userId,
  } = req.query;
  //TODO: get all videos based on query, sort, pagination

  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
    sort: { [sortBy]: sortType === "desc" ? -1 : 1 },
  };

  const filter = {};
  if (query) {
    filter.title = { $regex: query, $options: "i" };
  }

  const videos = await Video.paginate(filter, options);
  return new ApiResponse(200, videos, "Videos fetched successfully").send(res);
});

const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;

  if (!title || !description || title.trim() === "" || description.trim() === "") {
    throw new ApiError(400, "Title and description are required").send(res);
  }

  const videoLocalPath = req.files?.video?.[0]?.path;
  const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path;

  if (!videoLocalPath || !thumbnailLocalPath) {
    throw new ApiError(400, "Video and thumbnail are required").send(res);
  }

  const compressedVideoPath = `${videoLocalPath}-compressed.mp4`;

  try {
    await compressVideo(videoLocalPath, compressedVideoPath);

    const video = await uploadToCloudinary(compressedVideoPath);
    const thumbnail = await uploadToCloudinary(thumbnailLocalPath);
    await deleteFromCloudinary(videoLocalPath)
    const newVideo = await Video.create({
      videoFile: video.secure_url,
      thumbnail: thumbnail.secure_url,
      owner: req.user._id,
      title,
      description,
      duration: video.duration || 0, // handle undefined
    });

    res.status(201).json(new ApiResponse(201, newVideo, "Video published successfully"));
  } catch (err) {
    console.error("Compression/upload error: ", err);
    res.status(500).json(new ApiError(500, "Video processing failed", err).send(res));
  }
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: get video by id
  if (!videoId) {
    throw new ApiError(400, "Video id is required").send(res);
  }
  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video not found").send(res);
  }
  return new ApiResponse(200, video, "Video fetched successfully").send(res);
});

const updateVideo = asyncHandler(async (req, res) => {
  //TODO: update video details like title, description, thumbnail
  const { videoId } = req.params;
  const { title, description } = req.body;
  const thumbnailLocalPath = req.file?.path;

  if (!videoId) {
    throw new ApiError(400, "Video id is required").send(res);
  }
  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video not found").send(res);
  }
  if (title) {
    video.title = title;
  }
  if (description) {
    video.description = description;
  }
  if (!thumbnailLocalPath) {
    throw new ApiError(400, "Thumbnail is required").send(res);
  }
  const oldThumbnail = video.thumbnail;
  const publicId = extractPublicId(oldThumbnail);
  await deleteFromCloudinary(publicId);

  const thumbnail = await uploadToCloudinary(thumbnailLocalPath);
  video.thumbnail = thumbnail.secure_url;
  await video.save();
  const responeVideo = await Video.findById(videoId);
  return new ApiResponse(200, responeVideo, "Video updated successfully").send(
    res
  );
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: delete video
  if (!videoId) {
    throw new ApiError(400, "Video id is required").send(res);
  }

  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video not found").send(res);
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
    throw new ApiError(400, "Video id is required").send(res);
  }
  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video not found").send(res);
  }
  video.isPublished = !video.isPublished;
  await video.save({ validateBeforeSave: false });
  return res
    .status(201)
    .json(new ApiResponse(200, video, "Video status updated successfully"));
});
export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
