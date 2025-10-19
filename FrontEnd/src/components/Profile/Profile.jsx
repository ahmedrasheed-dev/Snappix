import React, { useEffect, useState } from "react";
import { Link, NavLink, useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { FaPlay } from "react-icons/fa";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import Playlists from "./Playlists";

import {
  getChannelProfile,
  getChannelVideos,
  getChannelPlaylists,
} from "@/store/features/channelSlice";

const Profile = () => {
  const { username } = useParams();
  const dispatch = useDispatch();

  const [isEditing, setIsEditing] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [newFullName, setNewFullName] = useState("");
  const [activeTab, setActiveTab] = useState("videos");

  const { isLoggedIn, user } = useSelector((state) => state.user);
  const { ChannelProfile, ChannelVideos, ChannelPlaylists, status, error } = useSelector(
    (state) => state.channel
  );

  // Fetch profile, videos, and playlists on mount
  useEffect(() => {
    if (username) {
      dispatch(getChannelProfile(username))
        .unwrap()
        .then((profile) => {
          if (profile?._id) {
            dispatch(getChannelVideos(profile._id));
            dispatch(getChannelPlaylists(profile.username));
          }
        })
        .catch((err) => console.error("Failed to load channel:", err));
    }
  }, [username, dispatch]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex justify-center items-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex justify-center items-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  console.log("data clg: ", ChannelProfile);
  const coverImage = ChannelProfile?.coverImage?.trim().length > 0
    ? ChannelProfile.coverImage
    : "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80";

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 md:p-8">
      {/* Cover Image */}
      <div className="relative w-full h-64 md:h-80 bg-gray-800 rounded-xl overflow-hidden shadow-2xl">
        <img src={coverImage} alt="Channel Cover Goes Here" className="w-full h-full object-cover" />

        {/* Avatar */}
        <div className="absolute bottom-0 left-8 flex items-end">
          <div className="relative">
            <Avatar className="w-32 h-32 border-4 border-gray-900">
              <AvatarImage src={ChannelProfile?.avatar} />
              <AvatarFallback className="text-pink text-4xl">
                {ChannelProfile?.username?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>

          <div className="ml-6 mb-4 bg-gray-900 rounded-md p-4">
            <h2 className="text-3xl font-bold text-pink-500">{ChannelProfile?.fullName}</h2>
            <p className="text-lg text-gray-400">@{ChannelProfile?.username}</p>
            <p className="text-sm text-gray-400">Subscribers: {ChannelProfile?.subscribers || 0}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-4 mt-8 border-b border-gray-700">
        <Button
          variant="ghost"
          onClick={() => setActiveTab("videos")}
          className={
            activeTab === "videos" ? "text-pink-500 border-b-2 border-pink-500" : "text-gray-400"
          }
        >
          Videos
        </Button>
        <Button
          variant="ghost"
          onClick={() => setActiveTab("playlists")}
          className={
            activeTab === "playlists" ? "text-pink-500 border-b-2 border-pink-500" : "text-gray-400"
          }
        >
          Playlists
        </Button>
      </div>

      {/* Tab Content */}
      <div className="mt-8">
        {activeTab === "videos" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {ChannelVideos?.map((video) => (
              <Link
                key={video._id}
                to={`/video/${video._id}`}
                className="group relative block aspect-video rounded-lg overflow-hidden shadow-lg hover:shadow-xl"
              >
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full h-full object-cover group-hover:scale-105"
                />
                <div className="absolute bottom-0 p-4">
                  <h4 className="text-sm font-semibold">{video.title}</h4>
                  <p className="text-xs">{video.views} views</p>
                </div>
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <FaPlay className="text-white text-4xl" />
                </div>
              </Link>
            ))}
          </div>
        )}
        {activeTab === "playlists" && <Playlists playlists={ChannelPlaylists} />}
      </div>
    </div>
  );
};

export default Profile;
