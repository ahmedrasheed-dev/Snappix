import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axios";

const initialState = {
  tweets: [],
  status: "idle",
  error: null,
};

// Thunks
export const fetchTweets = createAsyncThunk("tweets/fetchTweets", async () => {
  const res = await axiosInstance.get("/tweets");
  return res.data.data;
});

export const createTweetThunk = createAsyncThunk("tweets/createTweet", async (content) => {
  const res = await axiosInstance.post("/tweets", { content });
  return res.data.data;
});

export const deleteTweetThunk = createAsyncThunk("tweets/deleteTweet", async (tweetId) => {
  const res = await axiosInstance.delete(`/tweets/${tweetId}`);
  return res.data.data;
});

// Slice
const tweetSlice = createSlice({
  name: "tweets",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTweets.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchTweets.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.tweets = action.payload.reverse(); // newest first
      })
      .addCase(fetchTweets.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })

      .addCase(createTweetThunk.fulfilled, (state, action) => {
        const tweet = {
          ...action.payload,
          owner: {
            _id: action.payload.owner._id,
            fullname: action.payload.owner.fullname || "",
            username: action.payload.owner.username || "",
            avatar: action.payload.owner.avatar || "/default-avatar.png",
          },
        };
        state.tweets.unshift(tweet);
      })
      .addCase(deleteTweetThunk.fulfilled, (state, action) => {
        state.tweets = state.tweets.filter((t) => t._id !== action.payload._id);
      });
  },
});

export default tweetSlice.reducer;
