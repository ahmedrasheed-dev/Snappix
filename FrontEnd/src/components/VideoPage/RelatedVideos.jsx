import { fetchRelatedVideos } from "@/store/features/videosSlice";
import { formatTimeAgo } from "@/utils/VideoUtils";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";

const RelatedVideos = ({ videoId }) => {
  const dispatch = useDispatch();
  const { relatedVideos, status } = useSelector((state) => state.videos);

  useEffect(() => {
    if (videoId && status === "idle") {
      dispatch(fetchRelatedVideos({ videoId }));
    }
  }, [videoId, dispatch, status]);

  const SkeletonRelatedVideoItem = () => (
    <div className="flex gap-4 p-2 rounded-lg bg-gray-800 animate-pulse">
      <div className="w-32 h-20 bg-gray-700 rounded-lg"></div>
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gray-700 rounded w-full"></div>
        <div className="h-3 bg-gray-700 rounded w-3/4"></div>
        <div className="h-3 bg-gray-700 rounded w-1/2"></div>
      </div>
    </div>
  );

  return (
    <div className="w-full">
      {status === "loading" ? (
        Array.from({ length: 10 }).map((_, index) => (
          <SkeletonRelatedVideoItem key={index} />
        ))
      ) : relatedVideos?.length > 0 ? (
        relatedVideos.map((relatedVideo) => (
          <Link
            key={relatedVideo._id}
            to={`/video/${relatedVideo._id}`}
            className="flex gap-4 p-2 rounded-lg hover:bg-gray-800 transition-colors duration-200 overflow-hidden"
          >
            <img
              src={relatedVideo.thumbnail}
              alt={relatedVideo.title}
              className="w-32 h-20 object-cover rounded-lg flex-shrink-0"
            />
            <div className="flex-1 overflow-hidden">
              <h4 className="text-sm font-semibold line-clamp-2">
                {relatedVideo.title}
              </h4>
              <p className="text-xs text-gray-400 mt-1 truncate">
                {relatedVideo.ownerInfo.username}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {relatedVideo.views} views • {formatTimeAgo(relatedVideo.createdAt)}
              </p>
            </div>
          </Link>
        ))
      ) : (
        <p className="text-gray-400 text-center mt-8">No related videos found.</p>
      )}
    </div>
  );
};

export default RelatedVideos;
