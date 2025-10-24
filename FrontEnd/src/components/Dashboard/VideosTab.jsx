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

  const handleUpdate = async () => {
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
    <div className="p-8">
      <h2 className="text-3xl font-bold text-pink-500 mb-6">My Videos</h2>

      <div className="overflow-x-auto rounded-lg border border-zinc-700">
        <table className="min-w-full text-sm text-gray-300">
          <thead className="bg-zinc-800 text-xs uppercase text-gray-400">
            <tr>
              <th className="px-4 py-3 text-left">Video</th>
              <th className="px-4 py-3 text-left">Visibility</th>
              <th className="px-4 py-3 text-left">Date</th>
              <th className="px-4 py-3 text-left">Views</th>
              <th className="px-4 py-3 text-left">Comments</th>
              <th className="px-4 py-3 text-left">Likes</th>
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-700">
            {videos.map((video) => (
              <tr key={video._id} className="hover:bg-zinc-800/50 transition">
                {/* Video thumbnail + title */}
                <td className="px-4 py-3 flex gap-3 items-center truncate max-w-xs">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-24 h-14 object-cover rounded"
                  />
                  <div className="flex flex-col">
                    <span className="font-semibold text-gray-100 truncate w-48">{video.title}</span>
                    <span className="text-xs text-gray-400 truncate w-48">
                      {video.description || "No description"}
                    </span>
                  </div>
                </td>

                {/* Visibility */}
                <td className="px-4 py-3">
                  <span
                    className={`text-xs font-medium px-2 py-1 rounded-full ${
                      video.isPublished
                        ? "bg-green-500/20 text-green-400"
                        : "bg-yellow-500/20 text-yellow-400"
                    }`}
                  >
                    {video.isPublished ? "Public" : "Draft"}
                  </span>
                </td>

                {/* Date */}
                <td className="px-4 py-3 text-gray-400">
                  {new Date(video.createdAt).toLocaleDateString()}
                </td>

                {/* Views */}
                <td className="px-4 py-3">{video.views}</td>

                {/* Comments */}
                <td className="px-4 py-3">{video.commentsCount || 0}</td>

                {/* Likes bar */}
                <td className="px-4 py-3 w-32">
                  <div className="w-full bg-zinc-700 h-2 rounded">
                    <div
                      className="bg-pink-500 h-2 rounded"
                      style={{
                        width: `${
                          video.likesCount && video.views
                            ? Math.min((video.likesCount / video.views) * 100, 100)
                            : 0
                        }%`,
                      }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-400 ml-1">{video.likesCount || 0}</span>
                </td>

                {/* Actions */}
                <td className="px-4 py-3 align-middle">
                  <div className="flex flex-col gap-2">
                    <Button
                      onClick={() => openEditDialog(video)}
                      size="sm"
                      className="bg-zinc-700 hover:bg-zinc-600"
                    >
                      Edit
                    </Button>
                    <Button
                      onClick={() => handleTogglePublish(video._id)}
                      size="sm"
                      className="bg-pink-600 hover:bg-pink-700"
                    >
                      {video.isPublished ? "Unpublish" : "Publish"}
                    </Button>
                    <Button
                      onClick={() => handleDelete(video._id)}
                      size="sm"
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Delete
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <Dialog open={!!selectedVideo} onOpenChange={closeEditDialog}>
          <DialogContent className="sm:max-w-lg bg-gray-900 text-white selection:bg-pink">
            <DialogHeader>
              <DialogTitle>Edit Video</DialogTitle>
              <DialogDescription>Update your video details below.</DialogDescription>
            </DialogHeader>

            <div className="flex flex-col gap-4">
              {/* Title */}
              <div>
                <label className="block text-sm text-gray-300 mb-1">Title</label>
                <Input
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className={"selection:bg-pink"}
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm text-gray-300 mb-1 selection:bg-pink">Description</label>
                <Textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                />
              </div>

              {/* Thumbnail Drag & Drop */}
              <div>
                <label className="block text-sm text-gray-300 mb-1 ">Thumbnail</label>

                <div
                  className="border-2 border-dashed border-zinc-600 rounded-md p-4 text-center cursor-pointer hover:border-pink-500 transition"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const file = e.dataTransfer.files[0];
                    if (file) {
                      setFile(file);
                      setEditForm({ ...editForm, thumbnail: URL.createObjectURL(file) });
                    }
                  }}
                  onClick={() => document.getElementById("thumbnailInput").click()}
                >
                  <input
                    id="thumbnailInput"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        setFile(file);
                        setEditForm({ ...editForm, thumbnail: URL.createObjectURL(file) });
                      }
                    }}
                  />

                  {editForm.thumbnail ? (
                    <img
                      src={editForm.thumbnail}
                      alt="thumbnail preview"
                      className="mx-auto max-h-40 rounded object-cover"
                    />
                  ) : (
                    <p className="text-gray-400 text-sm">
                      Drag & drop thumbnail here, or click to select
                    </p>
                  )}
                </div>
              </div>
            </div>

            <DialogFooter className="flex justify-end gap-2">
              <Button variant="secondary" onClick={closeEditDialog}>
                Cancel
              </Button>
              <Button className="bg-pink-600 hover:bg-pink-700" onClick={handleUpdate}>
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default VideosTab;
