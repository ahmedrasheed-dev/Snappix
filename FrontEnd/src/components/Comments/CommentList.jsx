import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  addCommentToVideo,
  fetchComments,
} from "../../store/features/commentSlice.js";
import CommentNested from "./CommentNested.jsx";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast, Bounce } from "react-toastify";

const CommentList = ({ videoId }) => {
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
  const dispatch = useDispatch();
  const { comments, status, error } = useSelector(
    (state) => state.comments
  );
  const { isLoggedIn } = useSelector((state) => state.user);
  const [newCommentContent, setNewCommentContent] = useState("");

  const handleAddComment = () => {
    if (!isLoggedIn) {
      notifyError("Please log in to add a comment.");
      return;
    }
    if (newCommentContent.trim() !== "") {
      dispatch(
        addCommentToVideo({ videoId, content: newCommentContent })
      );
      setNewCommentContent("");
    }
  };

  useEffect(() => {
    if (videoId) {
      dispatch(fetchComments(videoId));
    }
  }, [videoId, dispatch]);

  return (
    <div className="mt-8 border-t border-gray-700 pt-8">
      <h3 className="text-xl font-bold text-pink-500">
        Comments ({comments.length})
      </h3>

      {/* Add New Comment Section */}
      <div className="mt-4 flex gap-2 justify-center items-center">
        <Textarea
          placeholder="Add a public comment..."
          value={newCommentContent}
          onChange={(e) => setNewCommentContent(e.target.value)}
          className="bg-gray-800 text-white border-gray-700 focus:border-pink-500"
        />
        <Button
          disabled={!isLoggedIn || newCommentContent.trim() === ""}
          title={
            !isLoggedIn
              ? "Please log in to add a comment."
              : "Add Comment"
          }
          onClick={handleAddComment}
          className="bg-pink-600 hover:bg-pink-700 self-start"
        >
          Comment
        </Button>
      </div>

      <div className="mt-4 space-y-6">
        {status === "loading" && (
          <div className="text-center text-gray-400">
            Loading comments...
          </div>
        )}
        {status === "failed" && (
          <div className="text-center text-red-500">
            Error: {error}
          </div>
        )}
        {status === "succeeded" && comments.length > 0
          ? comments.map((comment) => (
              <CommentNested
                key={comment._id}
                comment={comment}
                videoId={videoId}
              />
            ))
          : status === "succeeded" && (
              <div className="p-4 text-center text-gray-400 border border-dashed border-gray-700 rounded-lg">
                No comments yet. Be the first to comment!
              </div>
            )}
      </div>
    </div>
  );
};

export default CommentList;
