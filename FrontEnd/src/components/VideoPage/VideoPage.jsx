import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import CommentList from "../Comments/CommentList";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { FaExpand } from "react-icons/fa";
import { useSelector, useDispatch } from "react-redux";
import { getVideoData, addToWatchHistory } from "@/store/features/videoSlice";
import VideoInfo from "./VideoInfo";
import RelatedVideos from "./RelatedVideos";
import SubscribeButton from "./SubscribeButton";

const VideoPage = () => {
  const dispatch = useDispatch();
  const { videoId } = useParams();
  const {
    currentVideo: video,
    status: videoStatus,
    error: videoError,
  } = useSelector((state) => state.video);
  const { subscriberCount, status, error } = useSelector((state) => state.subscription);

  const isLoggedIn = useSelector((state) => state.user.isLoggedIn);
  const user = useSelector((state) => state.user.user);

  //UI states
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [isTheaterMode, setIsTheaterMode] = useState(false);
  const [isVideoVertical, setIsVideoVertical] = useState(false);
  useState("");

  useEffect(() => {
    if (videoId) {
      dispatch(getVideoData(videoId));
    }
  }, [videoId, dispatch]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      dispatch(addToWatchHistory(videoId));
    }, 10000);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [videoId, isLoggedIn, dispatch]);

  const toggleTheaterMode = () => {
    setIsTheaterMode(!isTheaterMode);
  };

  const handleLoadedMetadata = (e) => {
    const { videoWidth, videoHeight } = e.target;
    setIsVideoVertical(videoWidth < videoHeight);
  };

  const handleSubscribe = () => {};

  if (videoStatus === "loading" || !video) {
    return (
      <>
        <div className="min-h-screen bg-gray-900 text-white p-4 md:p-8 flex flex-col lg:flex-row gap-6 lg:max-w-screen-2xl lg:mx-auto w-full h-full">
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
            <h3 className="text-xl font-bold text-pink-500 mb-4">Related Videos</h3>
            <div className="space-y-4">
              {[...Array(4)].map((_, index) => (
                <div key={index} className="flex gap-4 p-2 rounded-lg animate-pulse">
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
      <div
        className={`min-h-screen bg-[#0f0f0f] text-white p-4 md:p-8 flex flex-col lg:flex-row gap-6 lg:max-w-screen-2xl lg:mx-auto`}
      >
        {/* Main Video Section */}
        <div className={`flex-1 min-w-0 ${!isTheaterMode ? "lg:max-w-[70%]" : ""}`}>
          {/* Video Player */}
          <div
            className={`relative rounded-xl overflow-hidden shadow-2xl ${
              isTheaterMode
                ? "lg:h-[90vh] h-auto w-full"
                : `w-full ${isVideoVertical ? "aspect-[9/16] max-w-sm mx-auto" : "aspect-video"}`
            }`}
          >
            <video
              src={video.videoFile}
              controls
              autoPlay={false}
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
            <VideoInfo video={video} />

            <div className="mt-6 border-t border-gray-700 pt-6">
              {/* Channel Info */}
              <div className="flex items-center gap-4">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={video?.owner?.avatar} />
                  <AvatarFallback className={"text-black"}>
                    {video?.owner?.username?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <Link
                  to={`/channel/${video?.owner?.username}`}
                  className="flex-1 hover:underline underline-offset-1 decoration-blue-400"
                >
                  <h2 className="text-lg font-semibold text-pink-500">{video?.owner?.username}</h2>
                  <p className="text-sm text-gray-400">{subscriberCount} subscribers</p>
                </Link>

                {video?.owner?._id && (
                  <SubscribeButton
                    channelUsername={video?.owner?.username}
                    channelId={video?.owner?._id}
                  />
                )}
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
                {video?.description && video?.description.length > 100 && (
                  <button
                    onClick={() => setShowFullDescription(!showFullDescription)}
                    className="mt-2 text-pink-500 hover:underline"
                  >
                    {showFullDescription ? "Show less" : "Show more"}
                  </button>
                )}
              </div>
            </div>

            {/* Comments Section Placeholder */}
            <div className="mt-8 border-t border-gray-700 pt-8">
              <h3 className="text-xl font-bold text-pink-500">Comments</h3>
              <CommentList videoId={videoId} />
            </div>
          </div>
        </div>

        {/* Related Videos Section */}
        <RelatedVideos isTheaterMode={isTheaterMode} videoId={videoId} />
      </div>
    </>
  );
};

export default VideoPage;
