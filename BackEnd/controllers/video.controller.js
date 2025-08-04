import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Video } from "../models/video.model.js";
import {
  uploadToCloudinary,
  deleteFromCloudinary,
} from "../utils/cloudinary.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

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
  if(query){
      filter.title = {$regex: query, $options: "i"};
  }

  const videos = await Video.paginate(filter, options);
  return new ApiResponse(200, videos,"Videos fetched successfully").send(res);

});

const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  // TODO: get video, upload to cloudinary, create video
  if (!title || !description) {
    throw new ApiError(400, "Title and description are required");
  }
  if (
    [title, description].some((val) => {
      val.trim() == "";
    })
  ) {
    throw new ApiError(400, "Title and description cannot be empty");
  }

  const videoLocalPath = req.files?.video?.[0].path;
  const thumbnailLocalPath = req.files?.thumbnail?.[0].path;

  if (!videoLocalPath || !thumbnailLocalPath) {
    throw new ApiError(400, "Video and thumbnail are required");
  }

  const video = await uploadToCloudinary(videoLocalPath);
  const thumbnail = await uploadToCloudinary(thumbnailLocalPath);
  console.log("duration: ", video.duration);

  await Video.create({
    videoFile: video.secure_url,
    thumbnail: thumbnail.secure_url,
    owner: req.user._id,
    title,
    description,
    duration: video.duration,
  });

  res
    .status(201)
    .json(new ApiResponse(201, video, "Video published successfully"));
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: get video by id
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: update video details like title, description, thumbnail
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: delete video
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
