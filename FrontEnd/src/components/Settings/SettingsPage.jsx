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
    <div className="flex flex-col md:flex-row p-4 md:p-8 bg-zinc-900 min-h-screen text-white">
      {/* Tabs List */}
      <div
        className="
          flex md:flex-col 
          border-b md:border-b-0 md:border-r 
          border-zinc-700 
          mb-4 md:mb-0 
          md:w-64 
          md:pr-4
          space-x-2 md:space-x-0 md:space-y-2
          overflow-x-auto
          scrollbar-none
        "
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              flex-shrink-0 px-4 py-2 rounded-md md:rounded-l-md transition-colors whitespace-nowrap
              ${
                activeTab === tab.id
                  ? "bg-pink-500 text-white font-semibold"
                  : "text-gray-400 hover:bg-zinc-800"
              }
            `}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 md:pl-8">
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
