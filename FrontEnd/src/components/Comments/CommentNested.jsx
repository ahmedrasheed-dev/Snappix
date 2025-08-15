import React, { useState } from "react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { formatTimeAgo } from "../../utils/VideoUtils";
import { Textarea } from "@/components/ui/textarea";
import { addReplyToComment } from "../../store/features/commentSlice.js";
import { useDispatch, useSelector } from "react-redux";
import { notifyError, notifySuccess } from "@/utils/toasts";

const CommentNested = ({ comment, videoId }) => {
  const { isLoggedIn } = useSelector((state) => state.user);

  const dispatch = useDispatch();
  const [showReplies, setShowReplies] = useState(false);
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyContent, setReplyContent] = useState("");

  const getInitials = (name) => {
    return name?.charAt(0)?.toUpperCase() || "?";
  };

  const handleReply = () => {
    if (!isLoggedIn) {
      notifyError("Please log in to add a comment.");
      return;
    }

    if (replyContent.trim() !== "") {
      dispatch(
        addReplyToComment({
          videoId,
          commentId: comment._id,
          content: replyContent,
        })
      );
      setReplyContent("");
      setShowReplyInput(false);
    }
  };

  const mainCommentOwner = comment.commentOwners;

  const mainCommentDate = formatTimeAgo(comment.createdAt);
  return (
    <div className="flex gap-4 mb-4">
      <Avatar className="w-10 h-10">
        <AvatarImage src={mainCommentOwner.avatar} />
        <AvatarFallback className={"text-black"}>
          {getInitials(mainCommentOwner?.username)}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <h4 className="text-sm font-semibold text-white">
            {mainCommentOwner?.username}
          </h4>
          <span className="text-xs text-gray-400">
            {mainCommentDate}
          </span>
        </div>
        <p className="text-gray-300">{comment.content}</p>

        {/* Reply button */}
        <div className="mt-2">
          <Button
            variant="ghost"
            onClick={() => setShowReplyInput(!showReplyInput)}
            className="text-pink-500 hover:underline px-0 h-auto"
          >
            Reply
          </Button>
        </div>

        {/* Reply input field */}
        {showReplyInput && (
          <div className="flex gap-2">
            <Textarea
              placeholder="Write a reply..."
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              className="bg-gray-800 text-white border-gray-700 focus:border-pink-500"
            />
            <Button
              onClick={handleReply}
              disabled={(!isLoggedIn) || (replyContent.trim() === "")}
              className="bg-pink-600 hover:bg-pink-700 self-start"
            >
              Reply
            </Button>
          </div>
        )}

        {/* Replies Section */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-4">
            <Button
              variant="ghost"
              onClick={() => setShowReplies(!showReplies)}
              className="text-pink-500 hover:underline px-0 h-auto"
            >
              {showReplies
                ? "Hide Replies"
                : `View ${comment.replies.length} Replies`}
            </Button>
            {showReplies && (
              <div className="mt-4 space-y-4">
                {comment.replies.map((reply) => {
                  const replyOwner = reply.replyOwners?.[0];
                  const replyDate = formatTimeAgo(reply.createdAt);
                  return (
                    <div key={reply._id} className="flex gap-4">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={reply?.replyOwners?.avatar} />
                        <AvatarFallback className={"text-black"}>
                          {getInitials(reply?.replyOwners?.username)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-semibold text-white">
                            {reply?.replyOwners?.username}
                          </h4>
                          <span className="text-xs text-gray-400">
                            {replyDate}
                          </span>
                        </div>
                        <p className="text-gray-300 mt-1">
                          {reply.content}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
export default CommentNested;
