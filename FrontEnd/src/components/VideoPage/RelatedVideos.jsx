import { fetchRelatedVideos } from "@/store/features/videosSlice";
import { formatTimeAgo } from "@/utils/VideoUtils";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";

const RelatedVideos = ({ isTheaterMode, videoId }) => {
  const dispatch = useDispatch();

   const relatedVideos = useSelector(
    (state) => state.videos.relatedVideos
  );

  useEffect(() => {
    dispatch(fetchRelatedVideos({ videoId }));
  }, []);

  return (
    <div
      className={`lg:w-80 ${isTheaterMode ? "hidden" : "lg:block"}`}
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
  );
};

export default RelatedVideos;
