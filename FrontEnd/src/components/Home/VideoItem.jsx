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

  return (
    <Link to={`/video/${videoId}`} className="block group w-full max-w-[360px]">
      <div
        className="
          flex flex-col w-full 
          cursor-pointer rounded-2xl overflow-hidden
          transition-transform duration-200 hover:scale-[1.03]
          hover:bg-[#272727]/50
        "
      >
        {/* Thumbnail */}
        <div className="relative w-full aspect-[16/9] bg-gray-800 rounded-xl overflow-hidden">
          {!imageLoaded && !imageError && (
            <Skeleton className="absolute inset-0 w-full h-full rounded-xl" />
          )}

          {imageError ? (
            <div className="flex flex-col items-center justify-center h-full text-amber-500">
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
              <span className="font-semibold text-sm text-center">
                Image not available
              </span>
            </div>
          ) : (
            <img
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
              src={thumbnail}
              alt={title}
              className={`w-full h-full object-cover transition-opacity duration-300 ${
                imageLoaded ? "opacity-100" : "opacity-0"
              }`}
              loading="lazy"
            />
          )}

          {duration && (
            <span
              className="
                absolute bottom-2 right-2 
                bg-black/70 text-white 
                text-xs px-2 py-1 rounded-md
              "
            >
              {formatDuration(duration)}
            </span>
          )}
        </div>

        {/* Info Section */}
        <div className="flex mt-3 space-x-3">
          <Avatar className="w-9 h-9 rounded-full shrink-0 cursor-pointer">
            <AvatarImage src={avatar} />
            <AvatarFallback className="flex justify-center items-center text-white bg-pink-600 rounded-full w-9 h-9">
              {owner?.charAt(0)?.toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="flex flex-col justify-between flex-grow min-w-0">
            {/* Title */}
            <h3
              className="
                text-white text-[14px] sm:text-[15px] 
                font-semibold leading-tight line-clamp-2
                break-words min-w-0
              "
              title={title}
            >
              {title}
            </h3>

            {/* Channel Info */}
            <div className="text-gray-400 text-xs sm:text-[13px] mt-[2px] min-w-0">
              <div className="flex items-center gap-1">
                <p
                  className="
                    hover:text-white transition-colors duration-200 
                    truncate max-w-[180px]
                  "
                  title={owner}
                >
                  {owner}
                </p>
                {isVerifed && (
                  <Verifiedicon className="size-4 text-blue-500 shrink-0" />
                )}
              </div>

              <div className="flex items-center space-x-1 text-gray-400 truncate">
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
