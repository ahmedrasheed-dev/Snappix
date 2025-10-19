import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

const VideoItemSkeleton = () => {
  return (
    <div
      className="
        flex flex-col
        w-[360px]                /* YouTube-like width */
        cursor-pointer
        overflow-hidden
        rounded-2xl
      "
    >
      {/* Thumbnail Skeleton */}
      <div className="relative w-full aspect-video bg-gray-800 rounded-xl overflow-hidden">
        <Skeleton className="absolute inset-0 w-full h-full rounded-xl" />
      </div>

      {/* Details Skeleton */}
      <div className="flex mt-3 space-x-3">
        {/* Avatar Skeleton */}
        <Skeleton className="w-9 h-9 rounded-full" />

        {/* Text Info Skeletons */}
        <div className="flex flex-col flex-grow space-y-2">
          <Skeleton className="h-4 w-3/4 rounded-md" />
          <Skeleton className="h-3 w-1/2 rounded-md" />
          <Skeleton className="h-3 w-1/3 rounded-md" />
        </div>
      </div>
    </div>
  );
};

export default VideoItemSkeleton;
