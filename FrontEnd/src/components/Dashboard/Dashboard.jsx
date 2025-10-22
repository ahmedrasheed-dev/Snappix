import React, { useState } from "react";
import DashboardHome from "./DashboardHome";
import VideosTab from "./VideosTab";
import PlaylistsTab from "./PlaylistsTab";
import LikedVideosTab from "./LikedVideosTab";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("home");

  const tabs = [
    { id: "home", label: "Dashboard Home" },
    { id: "videos", label: "My Videos" },
    { id: "Playlists", label: "Update Playlists" },
    { id: "LikedVideos", label: "All Liked Videos" },
  ];

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-zinc-900 text-white">
      {/* Sidebar / Topbar */}
      <nav
        className={`
          flex 
          md:flex-col 
          items-center md:items-start
          md:w-64 w-full
          p-4 md:p-6
          bg-zinc-800 bg-opacity-30 backdrop-blur-md 
          border-b md:border-b-0 md:border-r border-zinc-600
          shadow-lg
        `}
      >
        {/* Title (hidden on small screens to save space) */}
        <div className="hidden md:block mb-8">
          <h1 className="text-2xl font-bold text-pink-500 tracking-wide">
            User Dashboard
          </h1>
        </div>

        {/* Tabs */}
        <div
          className={`
            grid grid-cols-3 md:flex md:flex-col 
            gap-2 md:gap-3 
            w-full
          `}
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                text-center
                text-xs sm:text-sm md:text-base
                px-2 py-2 md:py-3 rounded-xl font-medium
                transition-all duration-200
                ${
                  activeTab === tab.id
                    ? "bg-pink-600 text-white shadow-lg"
                    : "text-gray-300 hover:bg-zinc-700 hover:bg-opacity-50"
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 p-4 md:p-8">
        {activeTab === "home" && <DashboardHome />}
        {activeTab === "videos" && <VideosTab />}
        {activeTab === "Playlists" && <PlaylistsTab />}
        {activeTab === "LikedVideos" && <LikedVideosTab />}
      </div>
    </div>
  );
};

export default Dashboard;
