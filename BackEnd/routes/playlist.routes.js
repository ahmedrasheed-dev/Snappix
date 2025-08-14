import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
  getPlaylistsByVideoId,
  getChannelPlaylists
} from "../controllers/playlist.controller.js";
import { verifyJWTOptional } from "../middlewares/verifyJWTOptonal.js";
const router = Router();
// users playlist which are private
router.get("/:userID", verifyJWT, getUserPlaylists);
// pulbic playlists of anyone
router.get("/channel/:username", verifyJWTOptional, getChannelPlaylists);

router.get("/:playlistId", verifyJWT, getPlaylistById);
router.get("/video/:videoId/", getPlaylistsByVideoId);
router.post("/", verifyJWT, createPlaylist);
router.post(
  "/add-video/:playlistId/:videoId",
  verifyJWT,
  addVideoToPlaylist
);
router.delete(
  "/remove-video/:playlistId/:videoId",
  verifyJWT,
  removeVideoFromPlaylist
);
router.delete("/:playlistId", verifyJWT, deletePlaylist);
router.patch("/:playlistId", verifyJWT, updatePlaylist);

export default router;
