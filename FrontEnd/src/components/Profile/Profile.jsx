import React, { useState, useEffect } from "react";
import { Link, NavLink, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { FaPlay, FaRegEdit, FaPencilAlt } from "react-icons/fa";
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
import { Pencil, FileInput } from "lucide-react";
import axios from "axios";

// Dummy data for a user profile
const dummyUserData = {
  _id: "user123",
  username: "johndoe",
  fullName: "John Doe",
  email: "john@example.com",
  avatar:
    "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=2080&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  coverImage:
    "https://images.unsplash.com/photo-1582213782179-e0d2919f9024?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  subscribers: 1500,
  videos: [
    {
      _id: "video1",
      title: "My First Vlog in San Francisco",
      thumbnail:
        "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=2073&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      views: 12000,
      createdAt: "2023-01-15T10:00:00Z",
    },
    {
      _id: "video2",
      title: "Cooking a Delicious Italian Dish",
      thumbnail:
        "https://images.unsplash.com/photo-1506354674715-e2a21e4b85d9?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      views: 8500,
      createdAt: "2023-02-20T12:00:00Z",
    },
    {
      _id: "video3",
      title: "Exploring the Alps: A Hiking Adventure",
      thumbnail:
        "https://images.unsplash.com/photo-1549880338-65ddcdfd017b?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      views: 21000,
      createdAt: "2023-03-10T14:00:00Z",
    },
  ],
};

const UserProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [newFullName, setNewFullName] = useState("");

  const isLoggedIn = useSelector((state) => state.user.isLoggedIn);
  const reduxUser = useSelector((state) => state.user.user);

  const [channelProfile, setChannelProfile] = useState(null);

  useEffect(() => {
    const getUserChannelProfile = async () => {
      if (reduxUser && reduxUser.username) {
        try {
          const res = await axios.get(
            `/api/v1/users/c/${reduxUser.username}`
          );
          setChannelProfile(res.data.data);
        } catch (error) {
          console.error(
            "Failed to fetch user channel profile:",
            error
          );
        }
      }
    };
    getUserChannelProfile();
  }, [reduxUser]);

  const updateProfile = async () => {
    if (!isLoggedIn) return;

    try {
      const response = await axios.patch(
        `/api/v1/users/update-account`,
        {
          username: newUsername || channelProfile.username,
          fullName: newFullName || channelProfile.fullName,
        },
        { withCredentials: true }
      );
      // Update the state with the new data from the backend
      setChannelProfile(response.data.data);
      setIsEditing(false); // Close the dialog
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  const updateAvatar = async (file) => {
    if (!isLoggedIn) return;

    try {
      const formData = new FormData();
      formData.append("avatar", file);
      const response = await axios.patch(
        `/api/v1/users/avatar`,
        formData,
        {
          withCredentials: true,
        }
      );
      setChannelProfile(response.data.data);
    } catch (error) {
      console.error("Error updating avatar:", error);
    }
  };

  const updateCoverImage = async (file) => {
    if (!isLoggedIn) return;

    try {
      const formData = new FormData();
      formData.append("coverImage", file);
      const response = await axios.patch(
        `/api/v1/users/cover-image`,
        formData,
        {
          withCredentials: true,
        }
      );
      setChannelProfile(response.data.data);
    } catch (error) {
      console.error("Error updating cover image:", error);
    }
  };

if(!isLoggedIn){
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-gray-900 text-white">
        <h2 className="text-2xl font-bold mb-4">
          Please login or register first to see your profile.
        </h2>
        <div className="flex gap-4">
          <NavLink to="/login">
            <Button
              className={
                "bg-pink-600 hover:bg-pink-700 text-white font-medium rounded-md px-4 py-2 shadow-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 focus:ring-offset-gray-900"
              }
            >
              Login
            </Button>
          </NavLink>
          <NavLink to="/register">
            <Button
              className={
                "bg-pink-600 hover:bg-pink-700 text-white font-medium rounded-md px-4 py-2 shadow-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 focus:ring-offset-gray-900"
              }
            >
              Register
            </Button>
          </NavLink>
        </div>
      </div>
    );
  }

  if (!channelProfile) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex justify-center items-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 md:p-8">
      {/* Cover Image and Avatar Section */}
      <div className="relative w-full h-64 md:h-80 bg-gray-800 rounded-xl overflow-hidden shadow-2xl">
        <img
          src={
            channelProfile.coverImage ||
            "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=2073&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          }
          alt="Cover"
          className="w-full h-full object-cover"
        />
        {/* Update Cover Image Dialog */}
        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="absolute bottom-4 right-4 bg-gray-800 border text-white hover:bg-pink-600 transition-colors"
            >
              <Pencil className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Update Cover Image</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-4">
              <Label htmlFor="coverImage">New Cover Image</Label>
              <Input
                id="coverImage"
                type="file"
                onChange={(e) => updateCoverImage(e.target.files[0])}
                accept="image/*"
              />
            </div>
          </DialogContent>
        </Dialog>

        {/* Avatar and Info */}
        <div className="absolute bottom-0 left-8 flex items-end">
          <div className="relative">
            <Avatar className="w-32 h-32 border-4 border-gray-900">
              <AvatarImage src={channelProfile?.avatar} />
              <AvatarFallback className="text-black text-4xl">
                {channelProfile?.username?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {/* Update Avatar Dialog */}
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute bottom-1 right-1 bg-gray-800 border text-white hover:bg-pink-600 transition-colors rounded-full"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Update Avatar</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col gap-4">
                  <Label htmlFor="avatar">New Avatar</Label>
                  <Input
                    id="avatar"
                    type="file"
                    onChange={(e) => updateAvatar(e.target.files[0])}
                    accept="image/*"
                  />
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <div className="ml-6 mb-4">
            <h2 className="text-3xl font-bold text-pink-500">
              {channelProfile?.fullName}
            </h2>
            <p className="text-lg text-gray-400">
              @{channelProfile.username}
            </p>
            <p className="text-sm text-gray-400">
              subscribers: {channelProfile?.subscribers || 0}
            </p>
          </div>
        </div>
      </div>

      {/* Profile Details and Edit Button */}
      <div className="mt-20 md:mt-24 flex items-center justify-between border-b border-gray-700 pb-4">
        <h3 className="text-2xl font-bold text-white">
          Channel Details
        </h3>
        {/* Update Profile Dialog */}
        <Dialog open={isEditing} onOpenChange={setIsEditing}>
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center gap-2 text-pink-500 hover:text-pink-600 transition-colors"
            >
              <Pencil className="h-4 w-4" />
              <span>Edit Profile</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Update Profile</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-4">
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  defaultValue={channelProfile.username}
                  onChange={(e) => setNewUsername(e.target.value)}
                />
              </div>
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  defaultValue={channelProfile.fullName}
                  onChange={(e) => setNewFullName(e.target.value)}
                />
              </div>
              <Button
                onClick={updateProfile}
                className="bg-pink-600 hover:bg-pink-700 text-white"
              >
                Save Changes
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* User's Videos Section */}
      <div className="mt-8">
        <h3 className="text-xl font-bold text-pink-500 mb-4">
          My Videos
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {channelProfile?.videos?.map((video) => (
            <Link
              key={video._id}
              to={`/video/${video._id}`}
              className="group relative block w-full aspect-video rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-transform transform hover:-translate-y-1"
            >
              <img
                src={video.thumbnail}
                alt={video.title}
                className="w-full h-full object-cover transition-transform group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h4 className="text-sm font-semibold text-white line-clamp-2">
                  {video.title}
                </h4>
                <p className="text-xs text-gray-300 mt-1">
                  {video.views} views
                </p>
              </div>
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <FaPlay className="text-white text-4xl" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;
