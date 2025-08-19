import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchTweets } from "../../store/features/tweetSlice";
import TweetItem from "./Tweetitem";

const TweetList = () => {
  const dispatch = useDispatch();
  const { tweets, status } = useSelector(state => state.tweets);

  useEffect(() => {
    dispatch(fetchTweets());
  }, [dispatch]);

  if (status === "loading") return <div className="text-gray-400 text-center">Loading tweets...</div>;

  return (
    <div>
      {tweets.length === 0 ? (
        <div className="text-gray-500 text-center">No tweets yet.</div>
      ) : (
        tweets.map(tweet => <TweetItem key={tweet._id} tweet={tweet} />)
      )}
    </div>
  );
};

export default TweetList;
