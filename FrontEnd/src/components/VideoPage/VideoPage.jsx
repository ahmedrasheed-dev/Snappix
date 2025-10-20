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
  const { currentVideo: video, status: videoStatus, error: videoError } =
    useSelector((state) => state.video);
  const { subscriberCount } = useSelector((state) => state.subscription);
  const { isLoggedIn } = useSelector((state) => state.user);

  const [showFullDescription, setShowFullDescription] = useState(false);
  const [isTheaterMode, setIsTheaterMode] = useState(false);
  const [isVideoVertical, setIsVideoVertical] = useState(false);

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

  const handleLoadedMetadata = (e) => {
    const { videoWidth, videoHeight } = e.target;
    setIsVideoVertical(videoWidth < videoHeight);
  };

  const toggleTheaterMode = () => {
    if (window.innerWidth >= 1024) {
      setIsTheaterMode((prev) => !prev);
    }
  };

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
          className={`relative rounded-xl overflow-hidden shadow-2xl ${
            isTheaterMode
              ? "lg:h-[90vh] h-auto w-full"
              : isVideoVertical
              ? "aspect-[9/16] max-w-sm mx-auto"
              : "aspect-video w-full"
          }`}
        >
          <video
            src={video.videoFile}
            controls
            className="w-full h-full"
            onLoadedMetadata={handleLoadedMetadata}
          />

          {/* Theater Mode Button — only visible on lg and above */}
          <div className="hidden lg:block absolute top-4 right-4 z-10">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheaterMode}
              className="text-white bg-black/50 hover:bg-black/70"
            >
              <FaExpand />
            </Button>
          </div>
        </div>

        {/* Video Info & Description */}
        <div className="w-full mt-4">
          <VideoInfo video={video} />

          <div className="mt-6 border-t border-gray-700 pt-6">
            {/* Channel Info */}
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
                <p className="text-sm text-gray-400">
                  {subscriberCount} subscribers
                </p>
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

          {/* Comments */}
          <div className="mt-8 pt-8">
            <CommentList videoId={videoId} />
          </div>

          {/* Related Videos for Mobile (below comments) */}
          {!isTheaterMode && (
            <div className="block lg:hidden mt-10">
              <h3 className="text-xl font-bold text-pink-500 mb-4">Related Videos</h3>
              <RelatedVideos isTheaterMode={isTheaterMode} videoId={videoId} />
            </div>
          )}

          {/* Related Videos below in theater mode */}
          {isTheaterMode && (
            <div className="mt-10 border-t border-gray-700 pt-8">
              <RelatedVideos isTheaterMode={!isTheaterMode} videoId={videoId} />
            </div>
          )}
        </div>
      </div>

      {/* Sidebar Related Videos — visible only on desktop non-theater mode */}
      {!isTheaterMode && (
        <div className="hidden lg:block lg:w-80">
          <RelatedVideos isTheaterMode={isTheaterMode} videoId={videoId} />
        </div>
      )}
    </div>
  );
};

export default VideoPage;
