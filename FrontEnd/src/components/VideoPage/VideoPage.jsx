import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import {
  FaHeart,
  FaRegHeart,
  FaShareAlt,
  FaExpand,
} from "react-icons/fa";
import { Copy } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import axios from "axios";
import Topbar from "../Topbar/Topbar";
import { formatTimeAgo } from "../../utils/VideoUtils";
import { toast, Bounce } from "react-toastify";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

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

  const [video, setVideo] = useState(null);
  const [showFullDescription, setShowFullDescription] =
    useState(false);
  const [isTheaterMode, setIsTheaterMode] = useState(false);
  const [isVideoVertical, setIsVideoVertical] = useState(false);
  const [relatedVideos, setRelatedVideos] = useState([]);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const { videoId } = useParams();

  const isLoggedIn = useSelector((state) => state.user.isLoggedIn);

  useEffect(() => {
    const fetchVideoData = async () => {
      if (!videoId || videoId.length !== 24) {
        setVideo(null);
        return;
      }

      try {
        const [videoRes, allLikesRes] = await Promise.all([
          axios.get(`/api/v1/videos/${videoId}`),
          axios.get(`/api/v1/likes/v/likes/${videoId}`),
        ]);

        axios.patch(`/api/v1/videos/${videoId}/views`);

        setVideo(videoRes.data.data);
        setLikeCount(allLikesRes.data.data.length);

        if (isLoggedIn) {
          try {
            const likedRes = await axios.get(
              `/api/v1/likes/v/${videoId}`,
              {
                withCredentials: true,
              }
            );
            setIsLiked(!!likedRes.data.data);
          } catch (error) {
            console.error("Error fetching like status:", error);
            setIsLiked(false);
          }
        } else {
          setIsLiked(false);
        }
      } catch (error) {
        console.error("Error fetching video details:", error);
        setVideo(null);
      }
    };

    const fetchRelatedVideos = async () => {
      try {
        const response = await axios.get("/api/v1/videos", {
          params: { limit: 10 },
        });
        setRelatedVideos(response.data.data.docs);
      } catch (error) {
        console.error("Error fetching related videos:", error);
      }
    };

    fetchVideoData();
    fetchRelatedVideos();
  }, [videoId, isLoggedIn]);

  const toggleTheaterMode = () => {
    setIsTheaterMode(!isTheaterMode);
  };

  const handleLoadedMetadata = (e) => {
    const { videoWidth, videoHeight } = e.target;
    if (videoWidth < videoHeight) {
      setIsVideoVertical(true);
    } else {
      setIsVideoVertical(false);
    }
  };

  const handleLike = async () => {
    if (!isLoggedIn) {
      notifyError("Please log in to like a video.");
      return;
    }

    try {
      const response = await axios.post(
        `/api/v1/likes/v/${videoId}`,
        {},
        {
          withCredentials: true,
        }
      );
      console.log("toggle like: ", response.data);
      setIsLiked(!isLiked);
      setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
    } catch (error) {
      notifyError("Error liking video:");
      console.error("Error toggling like status:", error);
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
  if (!video) {
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
                <div className="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    onClick={handleLike}
                    className="flex items-center gap-2 text-white hover:text-pink transition-colors"
                  >
                    {console.log("isLiked: ", isLiked)}
                    {isLiked ? (
                      <FaHeart className="text-pink-500" />
                    ) : (
                      <FaRegHeart />
                    )}
                    <span>{likeCount} Likes</span>
                  </Button>

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
            {relatedVideos.map((relatedVideo) => (
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
