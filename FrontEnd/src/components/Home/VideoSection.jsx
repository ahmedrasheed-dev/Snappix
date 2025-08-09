import React, { useState, useEffect } from "react";
import VideoItem from "./VideoItem";
import { getVideos } from "../../hooks/useGetAllVideos";
const VideoSection = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const videoData = await getVideos({
          page: 1,
          limit: 12,
        });
        setVideos(videoData.data.docs);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchVideos();
  }, []);

  if (loading) return <div>Loading videos...</div>;
  if (error) return <div>Error: {error}</div>;
  return (
   
      <div className="grid sm:grid-cols-3 md:grid-cols-4  lg:grid-cols-5 gap-4 p-4">
        {videos.map((video) => (
          <VideoItem
            key={video._id}
            videoId={video._id}
            title={video.title}
            views={video.views}
            thumbnail={video.thumbnail}
            duration={video.duration}
          />
        ))}
    </div>
  );
};

export default VideoSection;
