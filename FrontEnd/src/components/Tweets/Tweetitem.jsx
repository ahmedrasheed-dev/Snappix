import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { deleteTweetThunk } from "../../store/features/tweetSlice";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

const TweetItem = ({ tweet }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.user);

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleDelete = () => {
    dispatch(deleteTweetThunk(tweet._id));
    setIsDialogOpen(false);
  };

  return (
    <div className="p-4 bg-zinc-800 rounded-lg mb-3 hover:bg-zinc-700 transition">
      <div className="flex items-center gap-3 mb-2">
        <img
          src={tweet.owner.avatar || "/default-avatar.png"}
          alt={tweet.owner.fullname}
          className="w-10 h-10 rounded-full"
        />
        <div>
          <p className="font-semibold text-gray-100">{tweet.owner.fullname}</p>
          <p className="text-gray-400 text-sm">@{tweet.owner.username}</p>
        </div>
      </div>
      <p className="text-gray-100 mb-2">{tweet.content}</p>
      <div className="flex justify-between text-gray-400 text-sm">
        <span>{new Date(tweet.createdAt).toLocaleString()}</span>
        {user._id === tweet.owner._id && (
          <Button
            onClick={() => setIsDialogOpen(true)}
            className="text-red-500 bg-transparent hover:bg-red-700/20 px-2 py-1 text-xs rounded"
          >
            Delete
          </Button>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-sm bg-gray-900 text-white">
          <DialogHeader>
            <DialogTitle>Delete Tweet?</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this tweet? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button className="bg-red-600 hover:bg-red-700" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TweetItem;
