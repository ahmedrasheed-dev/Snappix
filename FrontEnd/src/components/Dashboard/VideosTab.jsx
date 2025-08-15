import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchMyVideos,
  updateVideoThunk,
  deleteVideoThunk,
  togglePublishThunk,
  UpdateThumbnail,
} from "../../store/features/dashboardSlice";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

const VideosTab = () => {
  const dispatch = useDispatch();
  const { videos, status } = useSelector((state) => state.dashboard);

  const [selectedVideo, setSelectedVideo] = useState(null);
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    isPublished: false,
  });
  const [file, setFile] = useState(null);

  useEffect(() => {
    dispatch(fetchMyVideos());
  }, [dispatch]);

  const openEditDialog = (video) => {
    setSelectedVideo(video._id);
    setEditForm({
      title: video.title,
      description: video.description || "",
      thumbnail: video.thumbnail,
      isPublished: video.isPublished,
      file: null,
    });
  };

  const closeEditDialog = () => {
    setSelectedVideo(null);
    setEditForm({
      title: "",
      description: "",
      thumbnail: "",
      isPublished: false,
      file: null,
    });
  };

  const handleUpdate = async() => {
    const data = {
      title: editForm.title,
      description: editForm.description,
      isPublished: editForm.isPublished,
    };
    //if thumbnail present then update
    if (file) {
      await dispatch(UpdateThumbnail({ videoId: selectedVideo, file: file }));
    }

    await dispatch(updateVideoThunk({ videoId: selectedVideo, data: data }));
    closeEditDialog();
  };

  const handleDelete = (videoId) => {
    if (window.confirm("Are you sure you want to delete this video?")) {
      dispatch(deleteVideoThunk(videoId));
    }
  };

  const handleTogglePublish = (videoId) => {
    dispatch(togglePublishThunk(videoId));
  };

  if (status === "loading") {
    return <div className="text-center text-gray-400 text-lg">Loading your videos...</div>;
  }

  return (
    <div className="p-8 space-y-6">
      <h2 className="text-3xl font-bold text-pink-500 mb-4">My Videos</h2>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {videos.map((video) => (
          <div
            key={video._id}
            className="bg-zinc-700 bg-opacity-30 backdrop-blur-md border border-zinc-600 rounded-xl overflow-hidden shadow-lg hover:shadow-pink-500/50 transition-shadow duration-300"
          >
            <img src={video.thumbnail} alt={video.title} className="w-full h-48 object-cover" />
            <div className="p-4 space-y-2">
              <h4 className="text-lg font-semibold text-gray-100 truncate">{video.title}</h4>
              <p className="text-sm text-gray-400 line-clamp-2">{video.description}</p>
              <p className="text-xs text-gray-400">
                Views: {video.views} | Likes: {video.likes}
              </p>
              <p
                className={`text-xs font-medium ${
                  video.isPublished ? "text-green-400" : "text-yellow-400"
                }`}
              >
                {video.isPublished ? "Published" : "Draft"}
              </p>
              <div className="flex gap-2 mt-2">
                <Button onClick={() => openEditDialog(video)} className=" hover:bg-pink-700">
                  <span>✏️</span> Edit
                </Button>
                <Button
                  onClick={() => handleTogglePublish(video._id)}
                  className="hover:bg-pink-700"
                >
                  Toggle Publish
                </Button>
                <Button onClick={() => handleDelete(video._id)} className="hover:bg-red-700">
                  Delete
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ShadCN Edit Dialog */}
      <Dialog open={!!selectedVideo} onOpenChange={closeEditDialog}>
        <DialogContent className="bg-zinc-800 text-white rounded-xl border border-zinc-600 backdrop-blur-md">
          <DialogHeader>
            <DialogTitle>Edit Video</DialogTitle>
            <DialogDescription>Update video details below.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <Input
              value={editForm.title}
              onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
              placeholder="Video Title"
              className="bg-zinc-900 border-zinc-600 text-white"
            />
            <Textarea
              value={editForm.description}
              onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
              placeholder="Video Description"
              className="bg-zinc-900 border-zinc-600 text-white resize-none"
              rows={4}
            />
            <label className="flex flex-col gap-2 text-gray-300 outline-1 rounded-md p-4 hover:outline-pink-700">
              <span className="font-bold">Change Thumbnail:</span>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setFile(e.target.files[0])}
                className="text-sm text-gray-400"
              />
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={editForm.isPublished}
                onChange={(e) => setEditForm({ ...editForm, isPublished: e.target.checked })}
                className="form-checkbox h-5 w-5 text-pink-500 rounded focus:ring-2 focus:ring-pink-400"
              />
              Published
            </label>
          </div>
          <DialogFooter className="mt-4 flex justify-end gap-2">
            <Button onClick={closeEditDialog}>Cancel</Button>
            <Button onClick={handleUpdate} className="bg-pink-600 hover:bg-pink-700">
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VideosTab;
