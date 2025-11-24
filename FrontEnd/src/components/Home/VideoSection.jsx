import React, { useEffect } from "react";
import VideoItem from "./VideoItem";
import { useGetVideos } from "../../hooks/useGetAllVideos";
import VideoItemSkeleton from "./VideoItemSkeleton";
import axios from "axios";

const VideoSection = () => {
  const { data, isLoading, isError, error } = useGetVideos({
    page: 1,
    limit: 12,
  });

const getStatus = async () => {
    try {
      const res = await axios.get('https://qc02m0485e.execute-api.eu-north-1.amazonaws.com/dev/api/v1/videos');
      console.log('Response:', res.data); 
      console.log("TEST ENV: ", import.meta.env.VITE_BASE_URL)
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    getStatus();
  }, []);
  if (isLoading) {
    return (
      <div
        className="
          grid 
          grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4
          gap-x-6 gap-y-10
          px-3 sm:px-4 md:px-6 py-4
        "
      >
        {Array.from({ length: 12 }).map((_, index) => (
          <VideoItemSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (isError) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div
      className="
        grid
        grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4
        gap-x-6 gap-y-10
        px-3 sm:px-4 md:px-6 py-4
        justify-items-center
      "
    >
      {data?.data?.docs?.map((video) => (
        <VideoItem
          key={video._id}
          videoId={video._id}
          title={video.title}
          views={video.views}
          thumbnail={video.thumbnail}
          duration={video.duration}
          owner={video.ownerInfo.username}
          isVerifed={video.ownerInfo.isEmailVerified}
          createdAt={video.createdAt}
          avatar={video.ownerInfo.avatar}
        />
      ))}
    </div>
  );
};

export default VideoSection;
