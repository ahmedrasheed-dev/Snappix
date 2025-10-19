import React, { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { formatViews, formatDuration, formatTimeAgo } from "../../utils/VideoUtils";
import { Verifiedicon } from "../../assets/index.js";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";

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
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleImageLoad = () => setImageLoaded(true);
  const handleImageError = () => setImageError(true);
  console.log("user is :", owner);
  return (
    <Link to={`/video/${videoId}`} className="block group">
      <div
        className="
          flex flex-col
          w-full max-w-[360px]
          cursor-pointer
          transition-transform duration-200
          hover:scale-[1.03]
          hover:bg-[#272727]
          overflow-hidden
          rounded-2xl p-2
        "
      >
        {/* Thumbnail */}
        <div className="relative w-full aspect-video bg-gray-800 rounded-xl overflow-hidden flex items-center justify-center">
          {!imageLoaded && !imageError && (
            <Skeleton className="absolute inset-0 w-full h-full rounded-xl" />
          )}

          {/* Show fallback when image fails */}
          {imageError ? (
            <div className="flex flex-col items-center justify-center text-amber-500">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-10 h-10 mb-2 opacity-70"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9.75 9.75h.008v.008H9.75V9.75zm.008 4.5h.008v.008H9.758v-.008zM12 21a9 9 0 100-18 9 9 0 000 18z"
                />
              </svg>
              <span className="font-semibold text-sm">Image not available</span>
            </div>
          ) : (
            <img
              onLoad={handleImageLoad}
              onError={handleImageError}
              src={thumbnail}
              className={`w-full h-full object-cover transition-opacity duration-300 ${
                imageLoaded ? "opacity-100" : "opacity-0"
              }`}
            />
          )}

          {duration && (
            <span className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-md">
              {formatDuration(duration)}
            </span>
          )}
        </div>

        {/* Details */}
        <div className="flex mt-3 space-x-3">
          <Avatar
            className="w-9 h-9 rounded-full object-cover cursor-pointer "
            src={avatar}
          >
            <AvatarImage src={avatar} />
            <AvatarFallback
            className="flex justify-center items-center text-white bg-pink border rounded-full px-4 py-1"
            
            >{owner?.charAt(0)?.toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col flex-grow">
            <h3 className="text-white text-[15px] font-semibold line-clamp-2 leading-tight">
              {title}
            </h3>
            <div className="text-gray-400 text-xs mt-1">
              <span className="flex items-center gap-1 group">
                <p className="hover:text-white transition-colors duration-200">{owner}</p>
                {isVerifed && (
                  <Verifiedicon className="size-4 group-hover:text-blue-500 transition-colors duration-200" />
                )}
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
