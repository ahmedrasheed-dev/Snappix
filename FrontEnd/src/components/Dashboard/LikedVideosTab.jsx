import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchLikedVideos } from "../../store/features/dashboardSlice";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const LikedVideosTab = () => {
  const dispatch = useDispatch();
  const { likedVideos, status } = useSelector((state) => state.dashboard);

  const [selectedVideo, setSelectedVideo] = useState(null);

  useEffect(() => {
    dispatch(fetchLikedVideos());
  }, [dispatch]);

  

  if (status === "loading") {
    return <div className="text-center text-gray-400 text-lg">Loading liked videos...</div>;
  }

  if (!likedVideos || likedVideos.length === 0) {
    return <div className="text-center text-gray-400 text-lg">No liked videos found</div>;
  }

  return (
    <div className="p-8">
      <h2 className="text-3xl font-bold text-pink-500 mb-6">Liked Videos</h2>

      <div className="overflow-x-auto rounded-lg border border-zinc-700">
        <table className="min-w-full text-sm text-gray-300">
          <thead className="bg-zinc-800 text-xs uppercase text-gray-400">
            <tr>
              <th className="px-4 py-3 text-left">Video</th>
              <th className="px-4 py-3 text-left">Date Liked</th>
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-700">
            {likedVideos.map((like) => {
              const video = like.video;
              return (
                <Link to={`/video/${video._id}`}>
                <tr key={video._id} className="hover:bg-zinc-800/50 transition">
                  <td className="px-4 py-3 flex gap-3 items-center">
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-24 h-14 object-cover rounded"
                    />
                    <div className="flex flex-col">
                      <span className="font-semibold text-gray-100 truncate w-48">{video.title}</span>
                      <span className="text-xs text-gray-400 truncate w-48">
                        {video.description || "No description"}
                      </span>
                    </div>
                  </td>

                  <td className="px-4 py-3 text-gray-400">
                    {new Date(like.createdAt || like.likedAt).toLocaleDateString()}
                  </td>
                </tr>
                </Link>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LikedVideosTab;
