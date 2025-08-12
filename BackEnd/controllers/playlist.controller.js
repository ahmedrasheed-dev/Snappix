import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Playlist } from "../models/playlist.model.js";
import { isValidObjectId } from "mongoose";
import mongoose from "mongoose";
import aggregatePaginate from "mongoose-aggregate-paginate-v2";

const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  //TODO: create playlist
  if (!name || !description) {
    throw new ApiError(400, "Name and description is required").send(
      res
    );
  }
  const playlist = await Playlist.create({
    name,
    description,
    owner: req.user._id,
  });
  if (!playlist) {
    throw new ApiError(
      400,
      "Something went wrong while creating playlist"
    ).send(res);
  }
  return new ApiResponse(
    200,
    playlist,
    "Playlist created successfully"
  ).send(res);
});

const getUserPlaylists = asyncHandler(async (req, res) => {
  
  const {page = 1, limit = 10 } = req.params;
  //TODO: get user playlists

  const userId = req.user._id;
  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
    throw new ApiError(400, "Invalid userId provided.");
  }

  const options = {
    page,
    limit,
  };
  const user = req.user;

  const pipeline = [
    {
      $match: {
        owner: new mongoose.Types.ObjectId(userId),
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "videos",
        foreignField: "_id",
        as: "videos",
      },
    },
    {
      $unwind: {
        path: "$videos",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "videos.owner",
        foreignField: "_id",
        as: "videos.ownerInfo",
      },
    },
    {
      $unwind: {
        path: "$videos.ownerInfo",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $group: {
        _id: "$_id",
        name: { $first: "$name" },
        description: { $first: "$description" },
        createdAt: { $first: "$createdAt" },
        updatedAt: { $first: "$updatedAt" },
        videos: {
          $push: {
            _id: "$videos._id",
            title: "$videos.title",
            views: "$videos.views",
            owner: {
              _id: "$videos.ownerInfo._id",
              fullName: "$videos.ownerInfo.fullName",
              username: "$videos.ownerInfo.username",
              avatar: "$videos.ownerInfo.avatar",
            },
          },
        },
      },
    },
    {
      $addFields: {
        videoCount: { $size: "$videos" },
        totalViews: {
          $sum: {
            $map: {
              input: "$videos",
              as: "v",
              in: "$$v.views",
            },
          },
        },
      },
    },
  ];
  const playlists = await Playlist.aggregatePaginate(
    pipeline,
    options
  );
  if (!playlists || playlists.docs.length === 0) {
    throw new ApiError(404, "Playlists not found for this user.");
  }
  return new ApiResponse(
    200,
    playlists,
    "Playlists fetched successfully"
  ).send(res);
});

const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  //TODO: get playlist by id
  if (!isValidObjectId(playlistId)) {
    throw new ApiError(
      400,
      "Playlist id is required and must be valid"
    ).send(res);
  }
  const playlist = await Playlist.findById(playlistId);
  if (!playlist) {
    throw new ApiError(404, "Playlist not found").send(res);
  }
  return new ApiResponse(
    200,
    playlist,
    "Playlist fetched successfully"
  ).send(res);
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  // TODO: add video to playlist
  if (
    !videoId ||
    !playlistId ||
    !isValidObjectId(videoId) ||
    !isValidObjectId(playlistId)
  ) {
    throw new ApiError(
      400,
      "Video id and playlist id is required and must be valid"
    ).send(res);
  }

  const playlist = await Playlist.findById(playlistId);
  const alreadyExists = playlist?.videos?.includes(videoId);
  if (alreadyExists) {
    throw new ApiError(409, "Video already in playlist").send(res);
  }
  if (!playlist) {
    throw new ApiError(404, "Playlist not found").send(res);
  }
  playlist.videos.push(videoId);
  await playlist.save({ validateBeforeSave: false });
  return new ApiResponse(
    200,
    playlist,
    "Video added to playlist"
  ).send(res);
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  // TODO: remove video from playlist
  if (
    !videoId ||
    !playlistId ||
    !isValidObjectId(videoId) ||
    !isValidObjectId(playlistId)
  ) {
    throw new ApiError(
      400,
      "Video id and playlist id is required and must be valid"
    ).send(res);
  }

  const playlist = await Playlist.findById(playlistId);
  if (!playlist) {
    throw new ApiError(404, "Playlist not found").send(res);
  }
  const initialLength = playlist.videos.length;
  playlist.videos.pull(videoId);

  if (playlist.videos.length === initialLength) {
    return new ApiResponse(
      200,
      playlist,
      "Video was not in the playlist"
    ).send(res);
  }

  await playlist.save({ validateBeforeSave: false });
  return new ApiResponse(
    200,
    playlist,
    "Video removed from playlist"
  ).send(res);
});

const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  // TODO: delete playlist
  if (!isValidObjectId(playlistId)) {
    throw new ApiError(
      400,
      "Playlist id is required and must be valid"
    ).send(res);
  }
  const playlist = await Playlist.findByIdAndDelete(playlistId);
  if (!playlist) {
    throw new ApiError(404, "Playlist not found").send(res);
  }
  return new ApiResponse(
    200,
    playlist,
    "Playlist deleted successfully"
  ).send(res);
});

const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { name, description } = req.body;
  //TODO: update playlist
  if (!isValidObjectId(playlistId)) {
    throw new ApiError(
      400,
      "Playlist id is required and must be valid"
    ).send(res);
  }
  const playlist = await Playlist.findById(playlistId);
  if (!playlist) {
    throw new ApiError(404, "Playlist not found").send(res);
  }
  if (name) {
    playlist.name = name;
  }
  if (description) {
    playlist.description = description;
  }
  await playlist.save({ validateBeforeSave: false });
  return new ApiResponse(
    200,
    playlist,
    "Playlist updated successfully"
  ).send(res);
});

const getPlaylistsByVideoId = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(
      400,
      "Video id is required and must be valid"
    ).send(res);
  }

  const playlists = await Playlist.find({ videos: videoId });

  if (!playlists || playlists.length === 0) {
    return new ApiResponse(
      200,
      [],
      "No playlists found for this video"
    ).send(res);
  }

  return new ApiResponse(
    200,
    playlists,
    "Playlists fetched successfully"
  ).send(res);
});
export {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
  getPlaylistsByVideoId
};
