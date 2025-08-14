import React, { useEffect, useState } from "react";
import { Link, NavLink, useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { FaPlay } from "react-icons/fa";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pencil } from "lucide-react";
import Playlists from "./Playlists";

import {
  updateAvatar,
  updateCoverImage,
  updateProflie,
} from "@/store/features/userSlice";
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
  const {
    ChannelProfile,
    ChannelVideos,
    ChannelPlaylists,
    status,
    error,
  } = useSelector((state) => state.channel);

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
        .catch((err) =>
          console.error("Failed to load channel:", err)
        );
    }
  }, [username, dispatch]);

  // Handle profile update
  const handleUpdateProfile = () => {
    dispatch(
      updateProflie({ username: newUsername, fullName: newFullName })
    )
      .unwrap()
      .then(() => setIsEditing(false))
      .catch((err) => console.error(err));
  };

  // Handle avatar update
  const handleUpdateAvatar = (file) => {
    if (file) dispatch(updateAvatar(file));
  };

  // Handle cover update
  const handleUpdateCoverImage = (file) => {
    if (file) dispatch(updateCoverImage(file));
  };

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

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 md:p-8">
      {/* Cover Image */}
      <div className="relative w-full h-64 md:h-80 bg-gray-800 rounded-xl overflow-hidden shadow-2xl">
        <img
          src={
            ChannelProfile?.coverImage ||
            "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80"
          }
          alt="Cover"
          className="w-full h-full object-cover"
        />

        {/* Edit Cover - Only if owner */}
        {isLoggedIn && user.username === username && (
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="absolute bottom-4 right-4 bg-gray-800 border text-white hover:bg-pink-600"
              >
                <Pencil className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Update Cover Image</DialogTitle>
              </DialogHeader>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  handleUpdateCoverImage(e.target.files[0])
                }
              />
            </DialogContent>
          </Dialog>
        )}

        {/* Avatar */}
        <div className="absolute bottom-0 left-8 flex items-end">
          <div className="relative">
            <Avatar className="w-32 h-32 border-4 border-gray-900">
              <AvatarImage src={ChannelProfile?.avatar} />
              <AvatarFallback className="text-black text-4xl">
                {ChannelProfile?.username?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            {/* Edit Avatar - Only if owner */}
            {isLoggedIn && user.username === username && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute bottom-1 right-1 bg-gray-800 border text-white hover:bg-pink-600 rounded-full"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Update Avatar</DialogTitle>
                  </DialogHeader>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      handleUpdateAvatar(e.target.files[0])
                    }
                  />
                </DialogContent>
              </Dialog>
            )}
          </div>

          <div className="ml-6 mb-4">
            <h2 className="text-3xl font-bold text-pink-500">
              {ChannelProfile?.fullName}
            </h2>
            <p className="text-lg text-gray-400">
              @{ChannelProfile?.username}
            </p>
            <p className="text-sm text-gray-400">
              Subscribers: {ChannelProfile?.subscribers || 0}
            </p>
          </div>
        </div>
      </div>

      {/* Profile Edit */}
      {isLoggedIn && user.username === username && (
        <div className="mt-20 md:mt-24 flex items-center justify-between border-b border-gray-700 pb-4">
          <h3 className="text-2xl font-bold">Channel Details</h3>
          <Dialog open={isEditing} onOpenChange={setIsEditing}>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-2 text-pink-500"
              >
                <Pencil className="h-4 w-4" /> Edit Profile
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Update Profile</DialogTitle>
              </DialogHeader>
              <Label>Username</Label>
              <Input
                defaultValue={ChannelProfile?.username}
                onChange={(e) => setNewUsername(e.target.value)}
              />
              <Label>Full Name</Label>
              <Input
                defaultValue={ChannelProfile?.fullName}
                onChange={(e) => setNewFullName(e.target.value)}
              />
              <Button
                onClick={handleUpdateProfile}
                className="bg-pink-600"
              >
                Save Changes
              </Button>
            </DialogContent>
          </Dialog>
        </div>
      )}

      {/* Tabs */}
      <div className="flex space-x-4 mt-8 border-b border-gray-700">
        <Button
          variant="ghost"
          onClick={() => setActiveTab("videos")}
          className={
            activeTab === "videos"
              ? "text-pink-500 border-b-2 border-pink-500"
              : "text-gray-400"
          }
        >
          Videos
        </Button>
        <Button
          variant="ghost"
          onClick={() => setActiveTab("playlists")}
          className={
            activeTab === "playlists"
              ? "text-pink-500 border-b-2 border-pink-500"
              : "text-gray-400"
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
                  <h4 className="text-sm font-semibold">
                    {video.title}
                  </h4>
                  <p className="text-xs">{video.views} views</p>
                </div>
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <FaPlay className="text-white text-4xl" />
                </div>
              </Link>
            ))}
          </div>
        )}
        {activeTab === "playlists" && (
          <Playlists playlists={ChannelPlaylists} />
        )}
      </div>
    </div>
  );
};

export default Profile;
