import { fetchRelatedVideos } from "@/store/features/videosSlice";
import { formatTimeAgo } from "@/utils/VideoUtils";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";

const RelatedVideos = ({ isTheaterMode, videoId }) => {
  const dispatch = useDispatch();

  const { relatedVideos, status } = useSelector(
    (state) => state.videos
  );

  useEffect(() => {
    if (videoId && status === 'idle') {
      dispatch(fetchRelatedVideos({ videoId }));
    }
  }, [videoId, dispatch, status]);

  const SkeletonRelatedVideoItem = () => (
    <div className="flex gap-4 p-2 rounded-lg bg-gray-800 animate-pulse">
      {/* Thumbnail placeholder */}
      <div className="w-32 h-18 bg-gray-700 rounded-lg"></div>
      <div className="flex-1 space-y-2">
        {/* Title placeholder */}
        <div className="h-4 bg-gray-700 rounded w-full"></div>
        {/* Owner placeholder */}
        <div className="h-3 bg-gray-700 rounded w-3/4"></div>
        {/* Views/Time placeholder */}
        <div className="h-3 bg-gray-700 rounded w-1/2"></div>
      </div>
    </div>
  );

  return (
    <div
      className={`lg:w-80 ${isTheaterMode ? "hidden" : "lg:block"}`}
    >
      <h3 className="text-xl font-bold text-pink-500 mb-4">
        Related Videos
      </h3>
      <div className="space-y-4">
        {status === "loading" ? (
          Array.from({ length: 10 }).map((_, index) => (
            <SkeletonRelatedVideoItem key={index} />
          ))
        ) : relatedVideos?.length > 0 ? (
          relatedVideos.map((relatedVideo) => (
            <Link
              key={relatedVideo._id}
              to={`/video/${relatedVideo._id}`}
              className="flex gap-4 p-2 rounded-lg hover:bg-gray-800 transition-colors duration-200 overflow-hidden text-ellipsis"
            >
              <img
                src={relatedVideo.thumbnail}
                alt={relatedVideo.title}
                className="w-32 h-18 object-cover rounded-lg"
              />
              <div className="flex-1">
                <h4 className="text-sm font-semibold line-clamp-2 text-ellipsis">
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
          ))
        ) : (
          // Render a message if no related videos are found after loading
          <p className="text-gray-400 text-center mt-8">No related videos found.</p>
        )}
      </div>
    </div>
  );
};

export default RelatedVideos;
