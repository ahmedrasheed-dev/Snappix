import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { FaUpload, FaPlayCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Loadericon } from "../../assets/index.js";
import { Progress } from "@/components/ui/progress";
import axiosInstance from "@/api/axios";
import { notifyError, notifySuccess } from "@/utils/toasts.js";
const UploadVideo = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm();

  const [isSubmiting, setisSubmiting] = useState(false);
  const navigate = useNavigate();
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const [progress, setProgress] = useState(0);

  const thumbnailFile = watch("thumbnail");
  const videoFile = watch("video");

  useEffect(() => {
    if (thumbnailFile && thumbnailFile.length > 0) {
      const file = thumbnailFile[0];
      setThumbnailPreview(URL.createObjectURL(file));
    } else {
      setThumbnailPreview(null);
    }
  }, [thumbnailFile]);

  useEffect(() => {
    if (videoFile && videoFile.length > 0) {
      const file = videoFile[0];
      setVideoPreview(URL.createObjectURL(file));
    } else {
      setVideoPreview(null);
    }
  }, [videoFile]);

  const uploadToS3 = async (file, category, setProgress) => {
    // Ask backend for presigned URL
    const res = await axiosInstance.post("/videos/presign", {
      fileName: file.name,
      fileType: file.type,
      fileCategory: category, // "video" or "thumbnail"
      fileSize: file.size,
    });

    const { uploadUrl, fileUrl } = res.data;

    // Upload file directly to S3
    await axiosInstance.put(uploadUrl, file, {
      headers: { "Content-Type": file.type },
      onUploadProgress: (progressEvent) => {
        if (setProgress && category === "video") {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setProgress(percent);
        }
      },
    });

    return fileUrl;
  };

  const onSubmit = async (data) => {
    try {
      setisSubmiting(true);
      setProgress(0);

      // Upload each file
      const videoUrl = await uploadToS3(data.video[0], "video", setProgress);
      const thumbnailUrl = await uploadToS3(data.thumbnail[0], "thumbnail");

      // Send metadata to backend
      const payload = {
        title: data.title,
        description: data.description,
        videoUrl,
        thumbnailUrl,
      };

      const res = await axiosInstance.post("/videos/upload", payload);

      if (res.status === 201) {
        notifySuccess("Video uploaded successfully!");
        navigate("/");
      }
    } catch (err) {
      console.error(err);
      notifyError(err.response?.data?.message || "Upload failed");
    } finally {
      setisSubmiting(false);
      setProgress(0);
    }
  };

  const clearVideo = () => {
    setValue("video", null);
    setVideoPreview(null);
  };
  const clearThumbnail = () => {
    setValue("thumbnail", null);
    setThumbnailPreview(null);
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-6">
      <div className="w-full max-w-5xl bg-gray-800 rounded-xl shadow-2xl p-8 text-white">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-pink-500">Upload a Video</h1>
          <p className="text-gray-400 mt-2">Share your story with the world.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Left Column for Previews */}
            <div className="flex-1 space-y-6">
              {/* Video Preview Section */}
              <div>
                {videoPreview ? (
                  <div className="flex flex-col items-center justify-center w-full">
                    <video
                      src={videoPreview}
                      controls
                      className="w-full h-auto rounded-lg shadow-xl aspect-video"
                    />
                    <Button
                      type="button"
                      onClick={clearVideo}
                      className="w-full mt-2 bg-gray-700 hover:bg-gray-600 text-white"
                    >
                      Change Video
                    </Button>
                  </div>
                ) : (
                  <div>
                    <label
                      htmlFor="video"
                      className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-600 border-dashed rounded-lg cursor-pointer bg-gray-700 hover:bg-gray-600 transition duration-200"
                    >
                      <FaPlayCircle className="w-16 h-16 text-gray-400 mb-3" />
                      <p className="mb-2 text-sm text-gray-400">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">MP4, MOV (MAX. 500MB)</p>
                      <input
                        id="video"
                        type="file"
                        className="hidden"
                        accept="video/mp4,video/mov,video/ogg,video/webm"
                        {...register("video", {
                          required: "Video file is required",
                          validate: {
                            isVideo: (value) =>
                              value[0]?.type.startsWith("video/") || "Only video files are allowed",
                          },
                        })}
                      />
                    </label>
                    {errors.video && (
                      <p className="text-red-500 text-sm mt-1">{errors.video.message}</p>
                    )}
                  </div>
                )}
              </div>

              {/* Thumbnail Preview Section */}
              <div>
                <label className="block text-gray-300 font-semibold mb-2">Thumbnail</label>
                {thumbnailPreview ? (
                  <div className="flex flex-col items-center justify-center w-full">
                    <img
                      src={thumbnailPreview}
                      alt="Thumbnail Preview"
                      className="h-auto w-full object-cover rounded-lg aspect-video"
                    />
                    <Button
                      type="button"
                      onClick={clearThumbnail}
                      className="w-full mt-2 bg-gray-700 hover:bg-gray-600 text-white"
                    >
                      Change Thumbnail
                    </Button>
                  </div>
                ) : (
                  <div>
                    <label
                      htmlFor="thumbnail"
                      className="flex flex-col items-center justify-center w-full h-40 border-2 border-gray-600 border-dashed rounded-lg cursor-pointer bg-gray-700 hover:bg-gray-600 transition duration-200"
                    >
                      <FaUpload className="w-10 h-10 text-gray-400 mb-3" />
                      <p className="mb-2 text-sm text-gray-400">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">JPG, PNG, WEBP</p>
                      <input
                        id="thumbnail"
                        type="file"
                        className="hidden"
                        accept="image/jpeg,image/png,image/webp"
                        {...register("thumbnail", {
                          required: "Thumbnail is required",
                          validate: {
                            isImage: (value) =>
                              value[0]?.type.startsWith("image/") || "Only image files are allowed",
                          },
                        })}
                      />
                    </label>
                    {errors.thumbnail && (
                      <p className="text-red-500 text-sm mt-1">{errors.thumbnail.message}</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column for Form Fields */}
            <div className="flex-1 space-y-6">
              {/* Title Field */}
              <div>
                <label htmlFor="title" className="block text-gray-300 font-semibold mb-2">
                  Video Title
                </label>
                <input
                  id="title"
                  type="text"
                  {...register("title", {
                    required: "Title is required",
                    minLength: {
                      value: 3,
                      message: "Title must be at least 3 characters long",
                    },
                  })}
                  className="w-full p-3 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 transition duration-200"
                />
                {errors.title && (
                  <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
                )}
              </div>

              {/* Description Field */}
              <div>
                <label htmlFor="description" className="block text-gray-300 font-semibold mb-2">
                  Description
                </label>
                <textarea
                  id="description"
                  {...register("description", {
                    required: "Description is required",
                    minLength: {
                      value: 10,
                      message: "Description must be at least 10 characters long",
                    },
                  })}
                  rows="4"
                  className="w-full p-3 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 transition duration-200"
                ></textarea>
                {errors.description && (
                  <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
                )}
              </div>
            </div>
          </div>

          {isSubmiting && (
            <div className="my-4">
              <Progress value={progress} className="w-full" />
              <p className="text-center text-gray-400 mt-2">{`Uploading: ${progress}%`}</p>
            </div>
          )}
          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isSubmiting}
            className="w-full flex justify-center py-3 px-4 rounded-md shadow-sm text-white bg-pink-600 hover:bg-pink-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink-500"
          >
            {isSubmiting ? (
              <>
                <Loadericon className="animate-spin" />
                <span>Submitting...</span>
              </>
            ) : (
              "Submit"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default UploadVideo;
