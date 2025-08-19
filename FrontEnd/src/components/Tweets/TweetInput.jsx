import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { createTweetThunk } from "../../store/features/tweetSlice";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";



const TweetInput = () => {
  const [content, setContent] = useState("");
  const dispatch = useDispatch();

  const handleSubmit = async () => {
    if (content.trim().length < 3) return;
    await dispatch(createTweetThunk(content));
    setContent("");
  };

  return (
    <div className="mb-4 p-4 bg-zinc-800 rounded-lg">
      <Textarea
        placeholder="What's happening?"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="bg-zinc-900 text-white placeholder-gray-500"
      />
      <div className="flex justify-end mt-2">
        <Button className="bg-pink-600 hover:bg-pink-700" onClick={handleSubmit}>
          Tweet
        </Button>
      </div>
    </div>
  );
};

export default TweetInput;
