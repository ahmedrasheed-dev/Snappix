import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Copy } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import axios from "axios";
import Topbar from "../Topbar/Topbar";
import { formatTimeAgo } from "../../utils/VideoUtils";
import {
  FaHeart,
  FaRegHeart,
  FaShareAlt,
  FaExpand,
} from "react-icons/fa";
import { toast, Bounce } from "react-toastify";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { CiBookmark } from "react-icons/ci";
import { SolidBookmark } from "@/assets/index.js";
import { Label } from "@/components/ui/label";
import { useSelector, useDispatch } from "react-redux";
import {
  getVideoData,
  toggleVideoLike,
  addVideoToPlaylist,
} from "@/store/features/videoSlice";
import { fetchRelatedVideos } from "@/store/features/videosSlice";
import {
  fetchUserPlaylists,
  createPlaylist,
} from "@/store/features/playlistSlice";

const VideoPage = () => {
  const notifySuccess = (error) => {
    toast.success(error, {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "colored",
      transition: Bounce,
    });
  };
  const notifyError = (error) => {
    toast.error(error, {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "colored",
      transition: Bounce,
    });
  };

  const dispatch = useDispatch();
  const { videoId } = useParams();
  const {
    currentVideo: video,
    likesCount,
    likeStatus,
    isLiked,
    status: videoStatus,
    error: videoError,
    // The following two are removed as they are no longer in the videoSlice
    // addedVideoToPlaylist,
    // alreadyinPlaylist,
    addedToPlaylistId, // This is now an array
  } = useSelector((state) => state.video);

  const relatedVideos = useSelector(
    (state) => state.videos.relatedVideos
  );
  const userPlaylists = useSelector(
    (state) => state.playlists.playlist
  );
  const isLoggedIn = useSelector((state) => state.user.isLoggedIn);
  const user = useSelector((state) => state.user.user);

  //UI states
  const [showFullDescription, setShowFullDescription] =
    useState(false);
  const [isTheaterMode, setIsTheaterMode] = useState(false);
  const [isVideoVertical, setIsVideoVertical] = useState(false);
  const [showPlaylistDialog, setShowPlaylistDialog] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [newPlaylistDescription, setNewPlaylistDescription] =
    useState("");

  useEffect(() => {
    if (videoId) {
      dispatch(getVideoData(videoId));
      dispatch(fetchRelatedVideos({ videoId }));
    }
  }, [videoId, dispatch]);

  useEffect(() => {
    if (isLoggedIn && user?._id) {
      dispatch(fetchUserPlaylists(user._id));
    }
  }, [isLoggedIn, user, dispatch]);

  const toggleTheaterMode = () => {
    setIsTheaterMode(!isTheaterMode);
  };

  const handleLoadedMetadata = (e) => {
    const { videoWidth, videoHeight } = e.target;
    setIsVideoVertical(videoWidth < videoHeight);
  };

  const handleLike = () => {
    if (likeStatus !== "loading") {
      dispatch(toggleVideoLike(videoId)).then((result) => {
        if (toggleVideoLike.rejected.match(result)) {
          notifyError(result.payload);
        }
      });
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

  const handleAddVideoToPlaylist = (playlistId) => {
    if (!isLoggedIn) {
      notifyError("Please log in to add video to a playlist.");
      return;
    }

    dispatch(addVideoToPlaylist({ playlistId, videoId }))
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

  const handleCreatePlaylist = () => {
    if (!newPlaylistName || !newPlaylistDescription) {
      notifyError("Playlist name and description are required.");
      return;
    }

    dispatch(
      createPlaylist({
        name: newPlaylistName,
        description: newPlaylistDescription,
      })
    )
      .then((result) => {
        const newPlaylistId = result.payload._id;
        console.log("playlist id: ", newPlaylistId);
        setNewPlaylistName("");
        setNewPlaylistDescription("");
        handleAddVideoToPlaylist(newPlaylistId);
      })
      .catch((error) => {
        notifyError(error);
      });
  };

  const openPlaylistDialog = () => {
    if (isLoggedIn) {
      setShowPlaylistDialog(true);
    } else {
      notifyError("Please log in to add video to a playlist.");
    }
  };

  if (videoStatus === "loading" || !video) {
    return (
      <>
        <div className="flex justify-center items-center">
          <Topbar classes={"mt-5 w-[90%]"} />
        </div>
        <div className="min-h-screen bg-gray-900 text-white p-4 md:p-8 flex flex-col lg:flex-row gap-6 lg:max-w-screen-2xl lg:mx-auto">
          <div className="flex-1 min-w-0 lg:max-w-[70%]">
            <div
              className={`relative bg-black rounded-xl overflow-hidden shadow-2xl aspect-video w-full`}
            >
              <div className="flex items-center justify-center w-full h-full">
                <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-pink-500"></div>
              </div>
            </div>
            <div className="mt-6 space-y-4">
              <div className="h-8 w-3/4 bg-gray-800 rounded animate-pulse"></div>
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-gray-800 animate-pulse"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-1/2 bg-gray-800 rounded animate-pulse"></div>
                  <div className="h-4 w-1/4 bg-gray-800 rounded animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
          <div className="lg:w-80 hidden lg:block">
            <h3 className="text-xl font-bold text-pink-500 mb-4">
              Related Videos
            </h3>
            <div className="space-y-4">
              {[...Array(4)].map((_, index) => (
                <div
                  key={index}
                  className="flex gap-4 p-2 rounded-lg animate-pulse"
                >
                  <div className="w-32 h-18 bg-gray-800 rounded-lg"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-full bg-gray-800 rounded"></div>
                    <div className="h-3 w-3/4 bg-gray-800 rounded"></div>
                    <div className="h-3 w-1/2 bg-gray-800 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </>
    );
  }

  if (videoStatus === "failed") {
    return (
      <div className="flex justify-center items-center h-screen text-red-500 text-2xl">
        Error: {videoError || "Failed to load video."}
      </div>
    );
  }

  return (
    <>
      <div className="flex justify-center items-center">
        <Topbar classes={"mt-5 w-[90%]"} />
      </div>

      <div
        className={`min-h-screen bg-gray-900 text-white p-4 md:p-8 flex flex-col lg:flex-row gap-6 lg:max-w-screen-2xl lg:mx-auto`}
      >
        {/* Main Video Section */}
        <div
          className={`flex-1 min-w-0 ${
            !isTheaterMode ? "lg:max-w-[70%]" : ""
          }`}
        >
          {/* Video Player */}
          <div
            className={`relative rounded-xl overflow-hidden shadow-2xl ${
              isTheaterMode
                ? "lg:h-[90vh] h-auto w-full"
                : `w-full ${
                    isVideoVertical
                      ? "aspect-[9/16] max-w-sm mx-auto"
                      : "aspect-video"
                  }`
            }`}
          >
            <video
              src={video.videoFile}
              controls
              autoPlay
              className="w-full h-full"
              onLoadedMetadata={handleLoadedMetadata}
            />
            {/* Theater mode button */}
            <div className="absolute top-4 right-4 z-10">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheaterMode}
                className="text-white hover:bg-gray-700"
              >
                <FaExpand />
              </Button>
            </div>
          </div>

          <div className="w-full">
            {/* Video Info Section */}
            <div className={`mt-6`}>
              <h1 className="text-2xl md:text-3xl font-bold text-pink-500">
                {video?.title}
              </h1>
              <div className="flex items-center justify-between mt-2">
                <span className="text-gray-400">
                  {video?.views} views •{" "}
                  {formatTimeAgo(video?.createdAt)}
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    disabled={likeStatus === "loading"}
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
                        className={`flex items-center gap-2 text-white hover:text-pink transition-colors `}
                      >
                        <span>
                          {addedToPlaylistId.length > 0 ? (
                            <SolidBookmark
                              classes={"text-pink-600"}
                            />
                          ) : (
                            <CiBookmark />
                          )}
                        </span>
                      </Button>
                    </DialogTrigger>
                    {isLoggedIn ? (
                      <DialogContent className="sm:max-w-md bg-gray-900 text-white">
                        <DialogHeader>
                          <DialogTitle>Add to Playlist</DialogTitle>
                          <DialogDescription>
                            Select a playlist or create a new one.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4 overflow-x-auto max-h-96 scroll-auto">
                          {/* Display existing playlists */}
                          {userPlaylists?.length > 0 ? (
                            <div className="space-y-2 overflow-x-scroll overflow-y-hidden">
                              <h4 className="text-lg font-semibold">
                                My Playlists
                              </h4>
                              {userPlaylists.map((playlist) => {
                                const isAdded =
                                  addedToPlaylistId.includes(
                                    playlist._id
                                  );
                                return (
                                  <div
                                    key={playlist._id}
                                    className="flex justify-between items-center p-2 rounded-lg hover:bg-gray-700 transition-colors overflow-hidden"
                                  >
                                    <span className="overflow-ellipsis overflow-hidden">
                                      {playlist.name}
                                    </span>
                                    <Button
                                      disabled={isAdded}
                                      variant="ghost"
                                      onClick={() =>
                                        handleAddVideoToPlaylist(
                                          playlist._id
                                        )
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
                                No playlists found. Create a new one
                                below.
                              </p>
                              {/* Create new playlist form */}
                            </>
                          )}
                        </div>
                        <div className="space-y-2 mt-4">
                          <h4 className="text-lg font-semibold">
                            Create New Playlist
                          </h4>
                          <Label htmlFor="playlistName">
                            Playlist Name
                          </Label>
                          <Input
                            id="playlistName"
                            value={newPlaylistName}
                            onChange={(e) =>
                              setNewPlaylistName(e.target.value)
                            }
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
                              setNewPlaylistDescription(
                                e.target.value
                              )
                            }
                            className={"selection:bg-pink-500"}
                            placeholder="Enter description"
                          />
                          <Button
                            onClick={handleCreatePlaylist}
                            className="w-full bg-pink-600 hover:bg-pink-700"
                          >
                            Create & Add Video
                          </Button>
                        </div>
                        <DialogFooter>
                          <Button
                            variant="secondary"
                            onClick={() =>
                              setShowPlaylistDialog(false)
                            }
                          >
                            Close
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    ) : (
                      ""
                    )}
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

            <div className="mt-6 border-t border-gray-700 pt-6">
              {/* Channel Info */}
              <div className="flex items-center gap-4">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={video?.owner?.avatar} />
                  <AvatarFallback className={"text-black"}>
                    {video?.owner?.username?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h2 className="text-lg font-semibold text-pink-500">
                    {video?.owner?.username}
                  </h2>
                  <p className="text-sm text-gray-400">
                    100K subscribers
                  </p>
                </div>
                <Button className="bg-pink-600 hover:bg-pink-700 text-white">
                  Subscribe
                </Button>
              </div>

              {/* Description */}
              <div className="bg-gray-800 p-4 rounded-lg mt-6 shadow-md">
                <p
                  className={`whitespace-pre-line text-gray-300 ${
                    !showFullDescription ? "line-clamp-3" : ""
                  }`}
                >
                  {video?.description}
                </p>
                {video?.description &&
                  video?.description.length > 100 && (
                    <button
                      onClick={() =>
                        setShowFullDescription(!showFullDescription)
                      }
                      className="mt-2 text-pink-500 hover:underline"
                    >
                      {showFullDescription
                        ? "Show less"
                        : "Show more"}
                    </button>
                  )}
              </div>
            </div>

            {/* Comments Section Placeholder */}
            <div className="mt-8 border-t border-gray-700 pt-8">
              <h3 className="text-xl font-bold text-pink-500">
                Comments
              </h3>
              <div className="mt-4 p-4 text-center text-gray-400 border border-dashed border-gray-700 rounded-lg">
                Comments section coming soon!
              </div>
            </div>
          </div>
        </div>

        {/* Related Videos Section */}
        <div
          className={`lg:w-80 ${
            isTheaterMode ? "hidden" : "lg:block"
          }`}
        >
          <h3 className="text-xl font-bold text-pink-500 mb-4">
            Related Videos
          </h3>
          <div className="space-y-4">
            {relatedVideos?.map((relatedVideo) => (
              <Link
                key={relatedVideo._id}
                to={`/video/${relatedVideo._id}`}
                className="flex gap-4 p-2 rounded-lg hover:bg-gray-800 transition-colors duration-200"
              >
                <img
                  src={relatedVideo.thumbnail}
                  alt={relatedVideo.title}
                  className="w-32 h-18 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <h4 className="text-sm font-semibold line-clamp-2">
                    {relatedVideo.title}
                  </h4>
                  <p className="text-xs text-gray-400 mt-1">
                    {relatedVideo.ownerInfo.username}
                  </p>
                  <p className="text-xs text-gray-500">
                    {relatedVideo.views} views •{" "}
                    {formatTimeAgo(relatedVideo.createdAt)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default VideoPage;
