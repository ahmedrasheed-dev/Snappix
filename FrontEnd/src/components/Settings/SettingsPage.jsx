import React, { useState } from "react";
import ChangePasswordPage from "./ChangePassword/ChanePasswordPage";
import UpdateProfile from "./UpdateProfile";

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState("profile");

  const tabs = [
    { id: "profile", label: "Update Profile" },
    { id: "password", label: "Change Password" },
  ];

  return (
    <div className="flex p-8 bg-zinc-900 min-h-screen text-white">
      {/* Left Tabs List */}
      <div className="w-64 border-r border-zinc-700 pr-4 flex flex-col space-y-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`text-left px-4 py-2 rounded-l-md transition-colors ${
              activeTab === tab.id
                ? "bg-pink-500 text-white font-semibold"
                : "text-gray-400 hover:bg-zinc-800"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 pl-8">
        {activeTab === "profile" && <UpdateProfile />}
        {activeTab === "password" && (
          <div className="flex justify-center items-center">
            <ChangePasswordPage />
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsPage;
