import React from "react";
import { formatViews, formatDuration } from "../../utils/VideoUtils";
const VideoItem = ({ videoId, title, views, thumbnail, duration }) => {
  return (
    <div className="flex flex-col w-full h-full cursor-pointer rounded-lg overflow-hidden transition-transform duration-200 hover:scale-105 bg-video-section">
      {/* Thumbnail and Duration */}
      <div className="relative w-full h-48 bg-gray-800">
        <img
          src={thumbnail}
          alt={title}
          className="w-full h-full object-cover"
        />
        {duration && (
          <span className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded-md">
            {formatDuration(duration)}
          </span>
        )}
      </div>

      {/* Video Details */}
      <div className="p-2 flex-1 flex flex-col justify-between">
        <h3 className="text-white text-sm font-semibold line-clamp-2">
          {title}
        </h3>
        <div className="text-gray-400 text-xs mt-1">
          <span>{formatViews(views)}</span>
        </div>
      </div>
    </div>
  );
};

export default VideoItem;
