import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware";
import {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
} from "../controllers/playlist.controller";

const router = Router();

router.get("/:userId/:page/:limit", verifyJWT, getUserPlaylists);
router.get("/:playlistId", verifyJWT, getPlaylistById);
router.post("/", verifyJWT, createPlaylist);
router.post("/add-video/:playlistId/:videoId", verifyJWT, addVideoToPlaylist);
router.delete(
  "/remove-video/:playlistId/:videoId",
  verifyJWT,
  removeVideoFromPlaylist
);
router.delete("/:playlistId", verifyJWT, deletePlaylist);
router.patch("/:playlistId", verifyJWT, updatePlaylist);

export default router;
