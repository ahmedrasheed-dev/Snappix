import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verifyJWTOptional } from "../middlewares/verifyJWTOptonal.js";
import { validate } from "../middlewares/validateRequest.middleware.js";
import {
  createPlaylistValidator,
  playlistIdParamValidator,
  addVideoToPlaylistValidator,
  usernameParamValidator,
  videoIdParamValidator,
} from "../validators/playlist.validators.js";
import {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
  getPlaylistsByVideoId,
  getChannelPlaylists,
  getSinglePlaylist,
} from "../controllers/playlist.controller.js";

const router = Router();

// Private user playlists
router.get("/:userID", verifyJWT, getUserPlaylists);

// Public playlists by channel username
router.get(
  "/channel/:username",
  verifyJWTOptional,
  usernameParamValidator,
  validate,
  getChannelPlaylists
);
//get all videos of a single playlist
router.get("/videos/:playlistId", verifyJWTOptional, getSinglePlaylist);

// Playlist by ID
router.get("/:playlistId", verifyJWT, playlistIdParamValidator, validate, getPlaylistById);

// Get playlists containing a video
router.get("/video/:videoId", videoIdParamValidator, validate, getPlaylistsByVideoId);

// Create playlist
router.post("/", verifyJWT, createPlaylistValidator, validate, createPlaylist);

// Add video to playlist
router.post(
  "/add-video/:playlistId/:videoId",
  verifyJWT,
  addVideoToPlaylistValidator,
  validate,
  addVideoToPlaylist
);

// Remove video from playlist
router.delete(
  "/remove-video/:playlistId/:videoId",
  verifyJWT,
  addVideoToPlaylistValidator,
  validate,
  removeVideoFromPlaylist
);

// Delete playlist
router.delete("/:playlistId", verifyJWT, playlistIdParamValidator, validate, deletePlaylist);

// Update playlist
router.patch("/:playlistId", verifyJWT, playlistIdParamValidator, validate, updatePlaylist);

export default router;
