import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { fetchMyVideos } from "../../store/features/dashboardSlice";

const DashboardHome = () => {
  const dispatch = useDispatch();
  const { videos, totalViews } = useSelector((state) => state.dashboard);
  const totalLikes = videos.reduce((total, video) => total + (video.likesCount || 0), 0);

  const stats = [
    { label: "Total Videos", value: videos.length, color: "bg-pink-600" },
    { label: "Total Views", value: totalViews, color: "bg-yellow-500" },
    { label: "Total Likes", value: totalLikes, color: "bg-yellow-500" },
    {
      label: "Published Videos",
      value: videos.filter((v) => v.isPublished).length,
      color: "bg-green-500",
    },
    { label: "Drafts", value: videos.filter((v) => !v.isPublished).length, color: "bg-gray-500" },
  ];
  const chartData = videos.map((video) => ({
    name: video.title,
    views: video.views,
    likes: video.likesCount || 0,
    published: video.isPublished ? "Published" : "Draft",
  }));

  useEffect(() => {
    dispatch(fetchMyVideos());
  }, [dispatch]);

  return (
    <div className="flex flex-col gap-30 justify-center items-start">
      <div className="w-full h-80">
        <h3 className="text-lg font-semibold text-gray-300 mb-4">Video Performance</h3>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#52525B" />
            <XAxis dataKey="name" stroke="#a1a1aa" />
            <YAxis stroke="#a1a1aa" />
            <Tooltip
              contentStyle={{
                backgroundColor: "#3f3f46",
                border: "1px solid #52525B",
                color: "#fff",
              }}
              labelStyle={{ color: "#fff" }}
            />
            <Legend wrapperStyle={{ color: "#fff" }} />
            <Line type="monotone" dataKey="views" stroke="#F472B6" activeDot={{ r: 8 }} />
            <Line type="monotone" dataKey="likes" stroke="#8B5CF6" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="space-y-6 w-full">
        <h1 className="text-3xl font-bold text-pink-500 mb-6">Dashboard Overview</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className={`p-6 rounded-2xl border border-zinc-600 bg-zinc-700 bg-opacity-30 backdrop-blur-md shadow hover:shadow-${stat.color}/50 transition-shadow duration-300`}
            >
              <h2 className="text-xl font-semibold text-gray-100">{stat.value}</h2>
              <p className="text-gray-400 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 w-full">
          <h2 className="text-2xl font-semibold text-gray-300 mb-4">Recent Videos</h2>
          <div className="space-y-4">
            {videos.slice(0, 4).map((video) => (
              <div
                key={video._id}
                className="flex items-center gap-4 p-4 bg-zinc-700 bg-opacity-30 backdrop-blur-md border border-zinc-600 rounded-xl shadow hover:shadow-pink-500/40 transition-shadow duration-300"
              >
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-24 h-14 object-cover rounded-md"
                />
                <div className="flex-1">
                  <h4 className="text-lg font-semibold text-gray-100 truncate">{video.title}</h4>
                  <p className="text-sm text-gray-400">
                    Views: {video.views} | Status: {video.isPublished ? "Published" : "Draft"}
                  </p>
                </div>
              </div>
            ))}
            {videos.length === 0 && <p className="text-gray-400">No videos uploaded yet.</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
