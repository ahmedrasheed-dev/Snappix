import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import axiosInstance from "@/api/axios";
import { useDispatch } from "react-redux";
import { setLoggedInUser } from "../../store/features/userSlice";
import { Loadericon } from "../../assets/index.js";
import { toast, Bounce } from "react-toastify";
import axios from "axios";

const RegisterPage = () => {
  const notifySuccess = (success) => {
    toast.success(success, {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "colored",
      transition: Bounce,
    });
  };
  const notifyError = (error) => {
    toast.error(error, {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "colored",
      transition: Bounce,
    });
  };
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const intialState = {
    username: "",
    fullName: "",
    email: "",
    password: "",
    avatar: null,
  };

  const [avatarPreview, setAvatarPreview] = useState(null);
  const [user, setUser] = useState(intialState);
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm();

  const handleAvatarChange = (file, onChange) => {
    if (file) {
      setAvatarPreview(URL.createObjectURL(file));
      onChange(file);
    } else {
      setAvatarPreview(null);
      onChange(null);
    }
  };

  const onSubmit = async (data) => {
    const avatarFile = data.avatar;
    if (!avatarFile) {
      return notifyError("Please select an avatar image.");
    }
    try {
      let avatarFileUrl = null;
      const presignedUrlResponse = await axiosInstance.post(
        `${import.meta.env.VITE_BASE_URL}/users/presigned-url/public`,
        {
          fileName: avatarFile.name,
          fileType: avatarFile.type,
          fileCategory: "avatar",
          fileSize: avatarFile.size,
        }
      );

      const { uploadUrl, fileUrl } = presignedUrlResponse.data.data;
      avatarFileUrl = fileUrl;

      //uplod to s3
      const uploadResponse = await fetch(uploadUrl, {
        method: "PUT",
        body: avatarFile,
        headers: {
          "Content-Type": avatarFile.type,
        },
      });

      const registrationBody = {
        username: data.username,
        fullName: data.fullName,
        email: data.email,
        password: data.password,
        avatar: avatarFileUrl,
      };
      const response = await axiosInstance.post(
        `${import.meta.env.VITE_BASE_URL}/users/register`,
        registrationBody
      );


      setUser((prevUser) => ({
        ...prevUser,
        username: data.username,
        fullName: data.fullName,
        email: data.email,
        password: data.password,
        avatar: data.avatar,
      }));
      notifySuccess("Registration Successfull");
      dispatch(setLoggedInUser(user));
      navigate("/");
    } catch (error) {
      notifyError("Registration Failed");
      console.error("Registration Error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-indigo-900 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="bg-black bg-opacity-60 backdrop-filter backdrop-blur-lg rounded-xl shadow-xl p-8 w-full max-w-md">
        <h2 className="mt-6 text-center text-3xl font-bold text-white">Create an Account</h2>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          {/* Avatar Uplo Field (no Shadcn) */}
          <div className="flex flex-col items-center gap-4">
            <Label htmlFor="avatar" className="text-white text-sm font-medium">
              Profile Photo
            </Label>

            {/* Image Preview / Placeholder */}
            <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-pink-500 flex items-center justify-center bg-gray-700">
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="Profile preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-pink-500 font-bold text-lg">IMG</span>
              )}
            </div>

            <Controller
              rules={{ required: "Profile photo is required" }}
              name="avatar"
              control={control}
              render={({ field: { onChange } }) => (
                <div className="flex flex-col items-center gap-2">
                  <input
                    id="avatar"
                    type="file"
                    accept="image/*"
                    className="hidden" // Hide the default input
                    onChange={(e) => handleAvatarChange(e.target.files[0], onChange)}
                  />
                  <button
                    type="button"
                    onClick={() => document.getElementById("avatar").click()}
                    className="flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 transition-colors duration-200"
                  >
                    Choose File
                  </button>
                  {avatarPreview && (
                    <button
                      type="button"
                      onClick={() => handleAvatarChange(null, onChange)}
                      className="flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 mt-2 transition-colors duration-200"
                    >
                      Remove
                    </button>
                  )}
                </div>
              )}
            />
            {errors.avatar && <p className="text-pink-500 text-xs mt-1">{errors.avatar.message}</p>}
          </div>

          <Separator className="bg-gray-700" />

          <div className="space-y-4">
            <div>
              <Label htmlFor="username" className="text-white block text-sm font-medium">
                Username
              </Label>
              <Input
                id="username"
                type="text"
                {...register("username", {
                  required: "Username is required",
                  pattern: {
                    value: /^[A-Za-z0-9$_]+$/,
                    message: "Username can only contain letters, numbers, $, and _",
                  },
                })}
                className="mt-1 block w-full rounded-md shadow-sm bg-gray-800 border-gray-700 text-white focus:border-pink-500 focus:ring-pink-500"
              />
              {errors.username && (
                <p className="text-pink-500 text-xs mt-1">{errors.username.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="fullName" className="text-white block text-sm font-medium">
                Full Name
              </Label>
              <Input
                id="fullName"
                type="text"
                {...register("fullName", {
                  required: "Full Name is required",
                })}
                className="mt-1 block w-full rounded-md shadow-sm bg-gray-800 border-gray-700 text-white focus:border-pink-500 focus:ring-pink-500"
              />
              {errors.fullName && (
                <p className="text-pink-500 text-xs mt-1">{errors.fullName.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="email" className="text-white block text-sm font-medium">
                Email address
              </Label>
              <Input
                id="email"
                type="email"
                {...register("email", {
                  required: "Email is required",
                  pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                })}
                className="mt-1 block w-full rounded-md shadow-sm bg-gray-800 border-gray-700 text-white focus:border-pink-500 focus:ring-pink-500"
              />
              {errors.email && <p className="text-pink-500 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <Label htmlFor="password" className="text-white block text-sm font-medium">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                {...register("password", {
                  required: "Password is required",
                  minLength: {
                    value: 8,
                    message: "Password must be at least 8 characters",
                  },
                })}
                className="mt-1 block w-full rounded-md shadow-sm bg-gray-800 border-gray-700 text-white focus:border-pink-500 focus:ring-pink-500"
              />
              {errors.password && (
                <p className="text-pink-500 text-xs mt-1">{errors.password.message}</p>
              )}
            </div>
          </div>

          <div>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center py-3 px-4 rounded-md shadow-sm text-white bg-pink-600 hover:bg-pink-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink-500"
            >
              {isSubmitting ? (
                <>
                  {<Loadericon className="animate-spin" />}
                  <span>Submitting...</span>
                </>
              ) : (
                "Register"
              )}
            </Button>
          </div>
        </form>
        <div className="mt-6 text-center text-sm text-gray-300">
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-pink-500 hover:text-pink-400">
            Log in
          </Link>
        </div>
      </div>
    </div>
  );
};

export { RegisterPage };
