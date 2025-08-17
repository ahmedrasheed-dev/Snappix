import React, { useState } from "react";
import DashboardHome from "./DashboardHome";
import VideosTab from "./VideosTab";
import UpdateProfile from "./UpdateProfile";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("home");

  const tabs = [
    { id: "home", label: "Dashboard Home" },
    { id: "videos", label: "My Videos" },
    { id: "profile", label: "Update Profile" },
  ];

  return (
    <div className="flex min-h-screen bg-zinc-900 text-white">
      {/* Sidebar */}
      <nav className="w-64 p-6 flex flex-col bg-zinc-800 bg-opacity-30 backdrop-blur-md border border-zinc-600 rounded-r-2xl shadow-lg">
        <div className="mb-10">
          <h1 className="text-2xl font-bold text-pink-500 tracking-wide">
            User Dashboard
          </h1>
        </div>
        <div className="flex flex-col gap-3">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`text-left px-4 py-3 rounded-xl font-medium transition-all duration-200
                ${
                  activeTab === tab.id
                    ? "bg-pink-600 text-white shadow-lg"
                    : "text-gray-300 hover:bg-zinc-700 hover:bg-opacity-50"
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </nav>

      {/* Content */}
      <div className="flex-1 p-8">
        {activeTab === "home" && <DashboardHome />}
        {activeTab === "videos" && <VideosTab />}
        {activeTab === "profile" && <UpdateProfile />}
      </div>
    </div>
  );
};

export default Dashboard;
