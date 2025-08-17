import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "@/api/axios";
import { fetchUserPlaylists } from "./playlistSlice";

const initialState = {
  currentVideo: null,

  status: "idle",
  error: null,
  likesCount: 0,
  isLiked: false,
  likeStatus: "idle",
  comments: [],

  addedToPlaylistId: [],
};

export const toggleVideoLike = createAsyncThunk(
  "video/toggleLike",
  async (videoId, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const isLoggedIn = state.user.isLoggedIn;
      if (!videoId || videoId.length !== 24) {
        return rejectWithValue("Invalid video ID.");
      }
      if (!isLoggedIn) {
        return rejectWithValue("Please log in to like a video.");
      }

      const response = await axiosInstance.post(
        `/likes/v/${videoId}`,
        {}
      );
      return response?.data;
    } catch (error) {
      return rejectWithValue(error?.response?.message);
    }
  }
);

export const getVideoData = createAsyncThunk(
  "video/getVideoData",
  async (videoId, { getState, rejectWithValue }) => {
    if (!videoId || videoId.length !== 24) {
      return rejectWithValue("Invalid video ID.");
    }

    const isLoggedIn = getState().user.isLoggedIn;

    try {
      // Mandatory: video details
      const videoRes = await axiosInstance.get(`/videos/${videoId}`);
      const videoData = videoRes.data.data;

      // Patch views (non-blocking, no await)
      axiosInstance.patch(`/videos/${videoId}/views`).catch(() => {});

      // Optional: likes count
      let likesCount = 0;
      try {
        const allLikesRes = await axiosInstance.get(`/likes/v/likes/${videoId}`);
        likesCount = allLikesRes.data.data.length;
      } catch (err) {
        console.warn("Likes count fetch failed:", err);
      }

      // Optional: like status + playlist status if logged in
      let isLiked = false;
      let addedToPlaylistIds = [];
      if (isLoggedIn) {
        try {
          const [isLikedVideoStatus, playlistsWithVideoRes] = await Promise.all([
            axiosInstance.get(`/likes/v/${videoId}`),
            axiosInstance.get(`/playlists/video/${videoId}/`),
          ]);

          isLiked = !!isLikedVideoStatus.data.data;
          addedToPlaylistIds = playlistsWithVideoRes.data.data.map((playlist) => playlist._id);
        } catch (err) {
          console.warn("Like/playlist status fetch failed:", err);
        }
      }

      return {
        video: videoData,
        likesCount,
        isLiked,
        addedToPlaylistIds,
      };
    } catch (err) {
      // Only reject if video details fail
      return rejectWithValue("Error fetching video details.");
    }
  }
);

const videoSlice = createSlice({
  name: "video",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getVideoData.pending, (state) => {
        state.status = "loading";
      })
      .addCase(getVideoData.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.currentVideo = action.payload?.video;
        state.likesCount = action.payload?.likesCount;
        state.isLiked = action.payload?.isLiked;
        state.error = null;
      })
      .addCase(getVideoData.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(toggleVideoLike.pending, (state) => {
        state.likeStatus = "loading";
      })
      .addCase(toggleVideoLike.fulfilled, (state, action) => {
        state.likeStatus = "succeeded";
        const wasLiked = state.isLiked;
        state.isLiked = !wasLiked;

        if (wasLiked) {
          state.likesCount--;
        } else {
          state.likesCount++;
        }
        state.error = null;
      })
      .addCase(toggleVideoLike.rejected, (state, action) => {
        state.likeStatus = "failed";
        state.error = action.payload;
      })
      .addCase(fetchUserPlaylists.fulfilled, (state, action) => {
        const videoId = state.currentVideo?._id;
        if (videoId) {
          const playlistsWithVideo = action.payload.filter((playlist) =>
            playlist.videos.some((video) => video._id === videoId)
          );
          state.addedToPlaylistId = playlistsWithVideo.map((playlist) => playlist._id);
        }
      });
  },
});
export default videoSlice.reducer;
