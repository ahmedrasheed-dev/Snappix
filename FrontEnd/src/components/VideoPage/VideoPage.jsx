import React, { useState, useEffect, useRef } from "react";
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
  const { currentVideo: video, status: videoStatus, error: videoError } = useSelector((state) => state.video);
  const { subscriberCount } = useSelector((state) => state.subscription);
  const { isLoggedIn } = useSelector((state) => state.user);

  const [showFullDescription, setShowFullDescription] = useState(false);
  const [isTheaterMode, setIsTheaterMode] = useState(false);
  const [isVideoVertical, setIsVideoVertical] = useState(false);
  const [playerWidth, setPlayerWidth] = useState(0);

  const videoContainerRef = useRef(null);

  // Fetch video data
  useEffect(() => {
    if (videoId) dispatch(getVideoData(videoId));
  }, [videoId, dispatch]);

  // Add to watch history after 10 seconds
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (isLoggedIn) dispatch(addToWatchHistory(videoId));
    }, 10000);
    return () => clearTimeout(timeoutId);
  }, [videoId, isLoggedIn, dispatch]);

  // Detect video orientation
  const handleLoadedMetadata = (e) => {
    const { videoWidth, videoHeight } = e.target;
    setIsVideoVertical(videoWidth < videoHeight);
  };

  // Toggle theater mode
  const toggleTheaterMode = () => {
    if (window.innerWidth >= 1024) setIsTheaterMode((prev) => !prev);
  };

  // Measure player width dynamically
  useEffect(() => {
    if (!videoContainerRef.current) return;

    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        setPlayerWidth(entry.contentRect.width);
      }
    });

    observer.observe(videoContainerRef.current);
    return () => observer.disconnect();
  }, [isTheaterMode]);

  if (videoStatus === "loading" || !video) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex justify-center items-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-pink-500 border-b-2"></div>
      </div>
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
    <div
      className={`min-h-screen bg-[#0f0f0f] text-white p-4 md:p-8 flex flex-col 
        ${!isTheaterMode ? "lg:flex-row" : "lg:flex-col"} 
        gap-6 lg:max-w-screen-2xl lg:mx-auto mt-14`}
    >
      {/* Main Video Section */}
      <div className={`flex-1 min-w-0 ${!isTheaterMode ? "lg:max-w-[70%]" : "w-full"}`}>
        {/* Video Player */}
        <div
          ref={videoContainerRef}
          className={`relative rounded-xl shadow-2xl overflow-hidden bg-black mx-auto
          ${isTheaterMode
            ? "w-full max-h-[90vh]"
            : isVideoVertical
            ? "aspect-[9/16] max-w-sm"
            : "aspect-video w-full"
          }`}
        >
          <div className="w-full h-full flex justify-center items-center overflow-hidden">
            <video
              src={video.videoFile}
              controls
              onLoadedMetadata={handleLoadedMetadata}
              className="max-w-full max-h-[90vh] object-contain rounded-xl bg-black"
            />
          </div>

          {/* Theater mode button */}
          <div className="hidden lg:block absolute top-4 right-4 z-10">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheaterMode}
              className="text-white bg-black/50 hover:text-pink-400"
            >
              <FaExpand />
            </Button>
          </div>
        </div>

        {/* Video Info — width synced with video player */}
        <div
          className="mt-4 mx-auto transition-all duration-300"
          style={{
            width: playerWidth > 0 ? `${playerWidth}px` : "100%",
          }}
        >
          <VideoInfo video={video} />
        </div>

        {/* Channel Info */}
        <div className="mt-6 border-t border-gray-700 pt-6">
          <div className="flex items-center gap-4">
            <Avatar className="w-12 h-12">
              <AvatarImage src={video?.owner?.avatar} />
              <AvatarFallback className="text-black">
                {video?.owner?.username?.charAt(0)}
              </AvatarFallback>
            </Avatar>

            <Link
              to={`/channel/${video?.owner?.username}`}
              className="flex-1 hover:underline underline-offset-2 decoration-pink-400"
            >
              <h2 className="text-lg font-semibold text-pink-500">
                {video?.owner?.username}
              </h2>
              <p className="text-sm text-gray-400">{subscriberCount} subscribers</p>
            </Link>

            {video?.owner?._id && (
              <SubscribeButton
                channelUsername={video?.owner?.username}
                channelId={video?.owner?._id}
              />
            )}
          </div>

          {/* Deascription */}
          <div className="bg-gray-800 p-4 rounded-lg mt-6 shadow-md">
            <p
              className={`whitespace-pre-line text-gray-300 ${
                !showFullDescription ? "line-clamp-3" : ""
              }`}
            >
              {video?.description}
            </p>
            {video?.description?.length > 100 && (
              <button
                onClick={() => setShowFullDescription(!showFullDescription)}
                className="mt-2 text-pink-500 hover:underline"
              >
                {showFullDescription ? "Show less" : "Show more"}
              </button>
            )}
          </div>
        </div>

        {/* Comsments */}
        <div className="mt-8 pt-8">
          <CommentList videoId={videoId} />
        </div>

        {/* Related Videos (Mobile) */}
        {!isTheaterMode && (
          <div className="block lg:hidden mt-10">
            <h3 className="text-xl font-bold text-pink-500 mb-4">Related Videos</h3>
            <RelatedVideos isTheaterMode={isTheaterMode} videoId={videoId} />
          </div>
        )}

        {/* Related Videos (Theater Mode) */}
        {isTheaterMode && (
          <div className="mt-10 border-t border-gray-700 pt-8">
            <RelatedVideos isTheaterMode={!isTheaterMode} videoId={videoId} />
          </div>
        )}
      </div>

      {/* Sidebar Related Videos isible only on desktop non-theater mode */}
      {!isTheaterMode && (
        <div className="hidden lg:block lg:w-80">
          <RelatedVideos isTheaterMode={isTheaterMode} videoId={videoId} />
        </div>
      )}
    </div>
  );
};

export default VideoPage;
