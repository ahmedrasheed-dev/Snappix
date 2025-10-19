import React, { useState } from "react";
import { Clock, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import moment from "moment";
import axiosInstance from "@/api/axios";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const HistoryPage = ({ data }) => {
  const watchHistory = data?.watchHistory || [];
  const [open, setOpen] = useState(false);

  const handleDelete = async () => {
    try {
      await axiosInstance.delete("users/watchHistory/clear");
      setOpen(false);
      window.location.reload();
    } catch (error) {
      console.error("Error deleting watch history:", error);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-900/30 text-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold flex items-center gap-2">
          <Clock className="w-6 h-6 text-pink-500" />
          Watch History
        </h1>
        <Button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 bg-pink-600 hover:bg-pink-700"
        >
          <Trash2 className="w-4 h-4" />
          Clear All
        </Button>
      </div>

      {/* History List */}
      {watchHistory.length === 0 ? (
        <p className="text-gray-400">No watch history yet.</p>
      ) : (
        <div className="grid gap-6">
          {watchHistory.map((video) => (
            <Link
              to={`/video/${video._id}`}
              key={video._id}
              className="flex gap-4 bg-zinc-800 rounded-xl overflow-hidden shadow-md hover:bg-zinc-700 transition-colors"
            >
              {/* Thumbnail */}
              <div className="relative w-60 flex-shrink-0">
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full h-32 object-cover"
                />
              </div>

              {/* Info */}
              <div className="flex flex-col justify-between py-2">
                <div>
                  <h3 className="text-lg font-semibold line-clamp-2 overflow-hidden">{video.title}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <img
                      src={video.owner?.avatar}
                      alt={video.owner?.username}
                      className="w-6 h-6 rounded-full overflow-hidden"
                    />
                    <p className="text-sm text-gray-400">{video.owner?.fullName}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-500">
                  {video.views} views • {moment(video.createdAt).fromNow()}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Confirm Delete Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-zinc-800 text-gray-200 border border-zinc-700">
          <DialogHeader>
            <DialogTitle className="text-pink-500">Clear Watch History?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. All your watch history will be permanently deleted.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-end gap-2 mt-4">
            <Button
              variant="outline"
              className="bg-zinc-700 hover:bg-zinc-600"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-700"
              onClick={handleDelete}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HistoryPage;
