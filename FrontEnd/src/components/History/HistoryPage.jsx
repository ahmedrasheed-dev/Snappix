import React from "react";
import { Clock, Trash2 } from "lucide-react";

const dummyHistory = [
  {
    id: 1,
    title: "Learn React in 30 Minutes",
    channel: "CodeWithAhmad",
    thumbnail: "https://i.ytimg.com/vi/w7ejDZ8SWv8/maxresdefault.jpg",
    views: "120K",
    timeAgo: "2 days ago",
    duration: "29:58",
  },
  {
    id: 2,
    title: "MERN Stack Crash Course",
    channel: "DevWorld",
    thumbnail: "https://i.ytimg.com/vi/7CqJlxBYj-M/maxresdefault.jpg",
    views: "85K",
    timeAgo: "1 week ago",
    duration: "2:15:22",
  },
  {
    id: 3,
    title: "Next.js 13 Tutorial for Beginners",
    channel: "BuildFast",
    thumbnail: "https://i.ytimg.com/vi/Y6KDk5iyrYE/maxresdefault.jpg",
    views: "45K",
    timeAgo: "3 weeks ago",
    duration: "45:12",
  },
];

const HistoryPage = () => {
  return (
    <div className="min-h-screen bg-zinc-900 text-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold flex items-center gap-2">
          <Clock className="w-6 h-6 text-pink-500" />
          Watch History
        </h1>
        <button className="flex items-center gap-2 px-4 py-2 bg-pink-600 hover:bg-pink-700 rounded-md text-white font-medium transition-colors">
          <Trash2 className="w-4 h-4" />
          Clear All
        </button>
      </div>

      {/* History List */}
      <div className="grid gap-6">
        {dummyHistory.map((video) => (
          <div
            key={video.id}
            className="flex gap-4 bg-zinc-800 rounded-xl overflow-hidden shadow-md hover:bg-zinc-700 transition-colors"
          >
            {/* Thumbnail */}
            <div className="relative w-60 flex-shrink-0">
              <img
                src={video.thumbnail}
                alt={video.title}
                className="w-full h-32 object-cover"
              />
              <span className="absolute bottom-1 right-1 bg-black bg-opacity-70 text-xs px-1 rounded">
                {video.duration}
              </span>
            </div>

            {/* Info */}
            <div className="flex flex-col justify-between py-2">
              <div>
                <h3 className="text-lg font-semibold line-clamp-2">{video.title}</h3>
                <p className="text-sm text-gray-400">{video.channel}</p>
              </div>
              <p className="text-sm text-gray-500">
                {video.views} views • {video.timeAgo}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HistoryPage;
