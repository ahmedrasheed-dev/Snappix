import React from "react";
import TweetInput from "./TweetInput";
import TweetList from "./TweetList";

const TweetsPage = () => {
  return (
  <div className="min-h-screen bg-[#0f0f0f] text-white"> 
      <div className="p-4 md:p-8 max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-pink-500 mb-6">Tweets</h1>
        <TweetInput />
        <TweetList />
      </div>
    </div>
  );
};

export default TweetsPage;
