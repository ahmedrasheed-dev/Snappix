import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  updateAvatar,
  updateCoverImage,
  updateProfile,
} from "../../store/features/userSlice";

const UpdateProfile = () => {
  const dispatch = useDispatch();
  const { user, status, error } = useSelector((state) => state.user);

  const [form, setForm] = useState({
    username: "",
    fullName: "",
    avatar: null,
    coverImage: null,
  });
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setForm({ ...form, [name]: files[0] }); // take single file
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("Updating...");

    try {
      if (form.username || form.fullName) {
        await dispatch(updateProfile({ username: form.username, fullName: form.fullName }));
      }
      if (form.avatar) {
        await dispatch(updateAvatar(form.avatar));
      }
      if (form.coverImage) {
        await dispatch(updateCoverImage(form.coverImage));
      }
      setMessage("Profile updated successfully!");
      setForm({ username: "", fullName: "", avatar: null, coverImage: null });
    } catch {
      setMessage("Something went wrong.");
    }
  };

  return (
    <div className="bg-zinc-800 p-8 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold text-gray-300 mb-6">Update Profile</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="block text-gray-400 font-medium">
          Username:
          <input
            type="text"
            name="username"
            value={form.username}
            onChange={handleChange}
            placeholder={user?.username || "Enter new username"}
            className="mt-1 block w-full p-2 bg-zinc-700 border border-zinc-600 rounded-md text-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
        </label>

        <label className="block text-gray-400 font-medium">
          Full Name:
          <input
            type="text"
            name="fullName"
            value={form.fullName}
            onChange={handleChange}
            placeholder={user?.fullName || "Enter full name"}
            className="mt-1 block w-full p-2 bg-zinc-700 border border-zinc-600 rounded-md text-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
        </label>

        <label className="block text-gray-400 font-medium">
          Avatar:
          <input
            type="file"
            name="avatar"
            onChange={handleChange}
            className="mt-1 block w-full text-sm text-gray-500 
              file:mr-4 file:py-2 file:px-4 file:rounded-full 
              file:border-0 file:text-sm file:font-semibold 
              file:bg-pink-500 file:text-white hover:file:bg-pink-600"
          />
        </label>

        <label className="block text-gray-400 font-medium">
          Cover Image:
          <input
            type="file"
            name="coverImage"
            onChange={handleChange}
            className="mt-1 block w-full text-sm text-gray-500 
              file:mr-4 file:py-2 file:px-4 file:rounded-md 
              file:border-0 file:text-sm file:font-semibold 
              file:bg-pink-500 file:text-white hover:file:bg-pink-600"
          />
        </label>

        <button
          type="submit"
          disabled={status === "loading"}
          className="mt-4 px-6 py-3 bg-pink-600 text-white font-semibold 
            rounded-md hover:bg-pink-700 transition-colors duration-200 
            disabled:opacity-50"
        >
          {status === "loading" ? "Updating..." : "Update"}
        </button>
      </form>

      {message && (
        <p className="mt-4 p-3 rounded-md bg-pink-900 text-pink-300 border border-pink-700">
          {message}
        </p>
      )}
      {error && <p className="text-red-400 mt-2">Error: {error}</p>}
    </div>
  );
};

export default UpdateProfile;
