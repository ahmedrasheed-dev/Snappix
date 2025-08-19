import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Playlist } from "../models/playlist.model.js";
import { User } from "../models/user.model.js";
import mongoose from "mongoose";
import aggregatePaginate from "mongoose-aggregate-paginate-v2";

const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description, isPublic } = req.body;

  const playlist = await Playlist.create({
    name,
    description,
    isPublic: typeof isPublic === "boolean" ? isPublic : true,
    owner: req.user._id,
  });

  return new ApiResponse(200, playlist, "Playlist created successfully").send(res);
});

const getUserPlaylists = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, visibility } = req.query;
  const { userID } = req.params;

  if (userID.toString() !== req.user._id.toString()) {
    throw new ApiError(401, "Unauthorized Access");
  }

  const matchQuery = { owner: new mongoose.Types.ObjectId(req.user._id) };
  if (visibility === "public") matchQuery.isPublic = true;
  if (visibility === "private") matchQuery.isPublic = false;

  const pipeline = [
    { $match: matchQuery },
    {
      $lookup: {
        from: "videos",
        localField: "videos",
        foreignField: "_id",
        as: "videos",
      },
    },
    { $unwind: { path: "$videos", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "users",
        localField: "videos.owner",
        foreignField: "_id",
        as: "videos.ownerInfo",
      },
    },
    { $unwind: { path: "$videos.ownerInfo", preserveNullAndEmptyArrays: true } },
    {
      $group: {
        _id: "$_id",
        name: { $first: "$name" },
        description: { $first: "$description" },
        isPublic: { $first: "$isPublic" },
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
        totalViews: { $sum: "$videos.views" },
      },
    },
  ];

  const playlists = await Playlist.aggregatePaginate(pipeline, { page, limit });

  if (!playlists.docs.length) {
    throw new ApiError(404, "Playlists not found for this user.");
  }

  return new ApiResponse(200, playlists, "Playlists fetched successfully").send(res);
});
//public playlits of a chanel 
const getChannelPlaylists = asyncHandler(async (req, res) => {
  const { username } = req.params;
  const { page = 1, limit = 10 } = req.query;

  const user = await User.findOne({ username }).select("_id");
  if (!user) throw new ApiError(404, "Channel not found");

  const channelId = user._id;
  let matchStage = { owner: channelId };
  if (!req.user || req.user._id.toString() !== channelId.toString()) {
    matchStage.isPublic = true;
  }

  const pipeline = [
    { $match: matchStage },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
        pipeline: [{ $project: { fullName: 1, username: 1, avatar: 1 } }],
      },
    },
    { $unwind: "$owner" },
    {
      $lookup: {
        from: "videos",
        localField: "videos",
        foreignField: "_id",
        as: "videos",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
              pipeline: [{ $project: { fullName: 1, username: 1, avatar: 1 } }],
            },
          },
          { $unwind: "$owner" },
          { $project: { title: 1, views: 1, owner: 1, thumbnail: 1 } },
        ],
      },
    },
    {
      $addFields: {
        videoCount: { $size: "$videos" },
        totalViews: { $sum: "$videos.views" },
      },
    },
    { $sort: { createdAt: -1 } },
  ];

  const playlists = await Playlist.aggregatePaginate(Playlist.aggregate(pipeline), {
    page: Number(page),
    limit: Number(limit),
  });

  return new ApiResponse(200, playlists, "Channel playlists fetched successfully").send(res);
});

//get all videos of a single playlisst
export const getSinglePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;

  if (!playlistId || playlistId.length !== 24) {
    throw new ApiError(400, "Invalid playlist ID");
  }

  const playlist = await Playlist.findById(playlistId)
    .populate({
      path: "owner",
      select: "fullName username avatar",
    })
    .populate({
      path: "videos",
      populate: {
        path: "owner",
        select: "fullName username avatar",
      },
      select: "title views thumbnail owner",
    });

  if (!playlist) throw new ApiError(404, "Playlist not found");

  // check privacy
  if (!playlist.isPublic) {
    if (!req.user || req.user._id.toString() !== playlist.owner._id.toString()) {
      throw new ApiError(403, "This playlist is private");
    }
  }

  return new ApiResponse(200, playlist, "Playlist fetched successfully").send(res);
});

const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const playlist = await Playlist.findById(playlistId);
  if (!playlist) throw new ApiError(404, "Playlist not found");

  return new ApiResponse(200, playlist, "Playlist fetched successfully").send(res);
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;

  const playlist = await Playlist.findById(playlistId);
  if (!playlist) throw new ApiError(404, "Playlist not found");

  if (playlist.videos.includes(videoId)) {
    throw new ApiError(409, "Video already in playlist");
  }

  playlist.videos.push(videoId);
  await playlist.save({ validateBeforeSave: false });

  return new ApiResponse(200, playlist, "Video added to playlist").send(res);
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;

  const playlist = await Playlist.findById(playlistId);
  if (!playlist) throw new ApiError(404, "Playlist not found");

  const initialLength = playlist.videos.length;
  playlist.videos.pull(videoId);

  if (playlist.videos.length === initialLength) {
    return new ApiResponse(200, playlist, "Video was not in the playlist").send(res);
  }

  await playlist.save({ validateBeforeSave: false });
  return new ApiResponse(200, playlist, "Video removed from playlist").send(res);
});

const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;

  const playlist = await Playlist.findByIdAndDelete(playlistId);
  if (!playlist) throw new ApiError(404, "Playlist not found");

  return new ApiResponse(200, playlist, "Playlist deleted successfully").send(res);
});

const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { name, description, isPublic } = req.body;

  const playlist = await Playlist.findById(playlistId);
  if (!playlist) throw new ApiError(404, "Playlist not found");

  if (name) playlist.name = name;
  if (description) playlist.description = description;
  if (typeof isPublic === "boolean") playlist.isPublic = isPublic;

  await playlist.save({ validateBeforeSave: false });
  return new ApiResponse(200, playlist, "Playlist updated successfully").send(res);
});

const getPlaylistsByVideoId = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  let query = { videos: videoId };
  if (!req.user) query.isPublic = true;

  const playlists = await Playlist.find(query);
  return new ApiResponse(200, playlists, "Playlists fetched successfully").send(res);
});

export {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
  getPlaylistsByVideoId,
  getChannelPlaylists,
};
