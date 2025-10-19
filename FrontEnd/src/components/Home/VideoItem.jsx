import React, { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  formatViews,
  formatDuration,
  formatTimeAgo,
} from "../../utils/VideoUtils";
import { Verifiedicon } from "../../assets/index.js";
import { Link } from "react-router-dom";

const VideoItem = ({
  videoId,
  title,
  views,
  thumbnail,
  duration,
  owner,
  createdAt,
  isVerifed,
  avatar,
}) => {
  const [imageLoaded, setimageLoaded] = useState(false);
  const handleImageLoad = () => {
    setimageLoaded(true);
  };
  return (
    <Link to={`/video/${videoId}`} className="block group">
      <div className="flex flex-col w-full h-full cursor-pointer transition-transform duration-200 hover:scale-105 overflow-hidden">
        
        {!imageLoaded && <Skeleton className="w-full h-full" />}
        {/* Thumbnail */}
        <div className="relative w-full h-48 bg-gray-800 rounded-xl overflow-hidden">
          <img
            onLoad={handleImageLoad}
            src={thumbnail}
            alt={title}
            className={`w-full h-full object-cover ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
          />
          {duration && (
            <span className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded-md">
              {formatDuration(duration)}
            </span>
          )}
        </div>

        {/* Video Details */}
        <div className="flex mt-2 space-x-2">
          {/* Channel Avatar */}
          <div className="flex-shrink-0">
            <div className="w-9 h-9">
              <img className="rounded-full" src={avatar} alt="" />
            </div>
          </div>

          {/* Text Details */}
          <div className="flex flex-col flex-grow">
            <h3 className="text-white text-sm font-semibold line-clamp-2">
              {title}
            </h3>
            {/* Owner, views, and upload time are now in a separate div */}
            <div className="text-gray-400 text-xs mt-1">
              <span className=" flex gap-1 group">
                <p className="hover:text-white transition-colors duration-200">
                  {owner}
                </p>
                <p>
                  {isVerifed && (
                    <Verifiedicon className="size-4 group-hover:text-blue-500 transition-colors duration-200" />
                  )}
                </p>
              </span>
              <div className="flex items-center space-x-1">
                <span>{formatViews(views)}</span>
                <span className="text-gray-500">•</span>
                <span>{formatTimeAgo(createdAt)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default VideoItem;
