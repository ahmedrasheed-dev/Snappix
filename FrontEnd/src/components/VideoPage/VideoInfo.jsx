import { toggleVideoLike } from "@/store/features/videoSlice";
import { notifyError, notifySuccess } from "@/utils/toasts";
import { formatTimeAgo } from "@/utils/VideoUtils";
import React, { use } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useState, useEffect } from "react";
import { FaHeart, FaRegHeart, FaShareAlt } from "react-icons/fa";

import { Input } from "@/components/ui/input";
import { Copy } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CiBookmark } from "react-icons/ci";
import { SolidBookmark } from "@/assets/index.js";
import {
  createPlaylist,
  fetchUserPlaylists,
  addVideoToPlaylist,
} from "@/store/features/playlistSlice";
import { Label } from "@/components/ui/label";
import { useParams } from "react-router-dom";

const VideoInfo = () => {
  const dispatch = useDispatch();
  const {
    currentVideo: video,
    likesCount,
    isLiked,
  } = useSelector((state) => state.video);
  const userPlaylists = useSelector(
    (state) => state.playlists.userPlaylists
  );
  const { videoId } = useParams();
  const {
    isLoggedIn,
    user,
    status: userStatus,
  } = useSelector((state) => state.user);

  const [likeDisabled, setLikeDisabled] = useState(false);
  const [showPlaylistDialog, setShowPlaylistDialog] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [newPlaylistDescription, setNewPlaylistDescription] =
    useState("");

  useEffect(() => {
    if (user?.username) {
      dispatch(fetchUserPlaylists(user?._id));
    }
  }, [dispatch, user]);

  const handleLike = () => {
    setLikeDisabled(true);
    dispatch(toggleVideoLike(videoId)).then((result) => {
      if (toggleVideoLike.rejected.match(result)) {
        notifyError(result.payload);
      }
      setLikeDisabled(false);
    });
  };

  const openPlaylistDialog = () => {
    if (isLoggedIn) {
      setShowPlaylistDialog(true);
    } else {
      notifyError("Please log in to add video to a playlist.");
    }
  };

  const handleAddVideoToPlaylist = async (playlistId) => {
    if (!isLoggedIn) {
      notifyError("Please log in to add video to a playlist.");
      return;
    }
    const added = await dispatch(
      addVideoToPlaylist({ playlistId, videoId })
    )
      .then((result) => {
        if (addVideoToPlaylist.fulfilled.match(result)) {
          notifySuccess("Video added to playlist!");
        } else {
          notifyError(result.payload);
        }
        setShowPlaylistDialog(false);
      })
      .catch((error) => {
        notifyError(error || "An unexpected error occurred.");
      });
  };

  const handleCreateAndAddToPlaylist = async () => {
    if (!newPlaylistName || !newPlaylistDescription) {
      notifyError("Playlist name and description are required.");
      return;
    }

    try {
      const createResult = await dispatch(
        createPlaylist({
          name: newPlaylistName,
          description: newPlaylistDescription,
        })
      ).unwrap();

      const newPlaylistId = createResult._id;
      setNewPlaylistName("");
      setNewPlaylistDescription("");

      await dispatch(
        addVideoToPlaylist({ playlistId: newPlaylistId, videoId })
      );
      notifySuccess("Video added to new playlist!");
      setShowPlaylistDialog(false);
    } catch (error) {
      notifyError(error.message || "An unexpected error occurred.");
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      notifySuccess("Link copied to clipboard!");
    } catch (error) {
      notifyError("Failed to copy link.");
      console.error("Failed to copy link:", error);
    }
  };
  const totalPlaylistsWithVideo = userPlaylists.filter((p) =>
    p.videos.some((v) => v._id === videoId)
  ).length;

  return (
    <div className={`mt-6`}>
      <h1 className="text-2xl md:text-3xl font-bold text-pink-500">
        {video?.title}
      </h1>
      <div className="flex items-center justify-between mt-2">
        <span className="text-gray-400">
          {video?.views} views • {formatTimeAgo(video?.createdAt)}
        </span>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            disabled={likeDisabled}
            onClick={handleLike}
            className="flex items-center gap-2 text-white hover:text-pink transition-colors"
          >
            {isLiked ? (
              <FaHeart className="text-pink-500" />
            ) : (
              <FaRegHeart />
            )}
            <span>{likesCount} Likes</span>
          </Button>

          <Dialog
            open={showPlaylistDialog}
            onOpenChange={setShowPlaylistDialog}
          >
            <DialogTrigger asChild>
              <Button
                title="Add to Playlist"
                variant="ghost"
                onClick={openPlaylistDialog}
                className={`flex items-center gap-2 text-white hover:text-pink transition-colors`}
              >
                <span>
                  {totalPlaylistsWithVideo > 0 ? (
                    <SolidBookmark classes={"text-pink-600"} />
                  ) : (
                    <CiBookmark />
                  )}
                </span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md bg-gray-900 text-white">
              <DialogHeader>
                <DialogTitle>Add to Playlist</DialogTitle>
                <DialogDescription>
                  Select a playlist or create a new one.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4 overflow-x-scroll scroll-auto max-h-72 ">
                {userPlaylists?.length > 0 ? (
                  <div className="space-y-2 overflow-y-scroll overflow-x-hidden">
                    <h4 className="text-lg font-semibold">
                      My Playlists
                    </h4>
                    {userPlaylists &&
                      userPlaylists.map((playlist) => {
                        // console.log("playlist maping: ", playlist);
                        const isAdded = userPlaylists.filter((p) =>
                          p.videos.some((v) => v._id === videoId)
                        );
                        return (
                          <div
                            key={playlist._id}
                            className="flex justify-between items-center p-2 rounded-lg hover:bg-gray-700 transition-colors overflow-hidden border-1 border-pink"
                          >
                            <span className="overflow-ellipsis overflow-hidden">
                              {playlist.name}
                            </span>
                            <Button
                              disabled={isAdded}
                              variant="ghost"
                              onClick={() =>
                                handleAddVideoToPlaylist(playlist._id)
                              }
                            >
                              {isAdded ? "Added" : "Add"}
                            </Button>
                          </div>
                        );
                      })}
                  </div>
                ) : (
                  <>
                    <p className="text-gray-400">
                      No playlists found. Create a new one below.
                    </p>
                  </>
                )}
              </div>
              <div className="space-y-2 mt-4">
                <h4 className="text-lg font-semibold">
                  Create New Playlist
                </h4>
                <Label htmlFor="playlistName">Playlist Name</Label>
                <Input
                  id="playlistName"
                  value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                  placeholder="Enter playlist name"
                  className={"selection:bg-pink-500"}
                />
                <Label htmlFor="playlistDescription">
                  Description
                </Label>
                <Input
                  id="playlistDescription"
                  value={newPlaylistDescription}
                  onChange={(e) =>
                    setNewPlaylistDescription(e.target.value)
                  }
                  className={"selection:bg-pink-500"}
                  placeholder="Enter description"
                />
                <Button
                  onClick={handleCreateAndAddToPlaylist}
                  className="w-full bg-pink-600 hover:bg-pink-700"
                >
                  Create & Add Video
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-2 text-pink-500 hover:text-pink-600 transition-colors"
              >
                <FaShareAlt />
                <span>Share</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md bg-gray-900 text-white">
              <DialogHeader>
                <DialogTitle>Share Video</DialogTitle>
              </DialogHeader>
              <div className="flex items-center space-x-2">
                <div className="grid flex-1 gap-2">
                  <Input
                    id="link"
                    defaultValue={window.location.href}
                    readOnly
                    className={"selection:bg-pink-500"}
                  />
                </div>
                <Button
                  type="button"
                  size="sm"
                  className="px-3 bg-pink-600 hover:bg-pink-700"
                  onClick={handleCopyLink}
                >
                  <span className="sr-only">Copy</span>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
};

export default VideoInfo;
