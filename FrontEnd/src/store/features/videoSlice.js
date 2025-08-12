import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

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

      const response = await axios.post(
        `/api/v1/likes/v/${videoId}`,
        {},
        {
          withCredentials: true,
        }
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

    try {
      const isLoggedIn = getState().user.isLoggedIn;
      // Fetch video data and likes count simultaneously
      const [videoRes, allLikesRes] = await Promise.all([
        axios.get(`/api/v1/videos/${videoId}`),
        axios.get(`/api/v1/likes/v/likes/${videoId}`),
      ]);

      axios.patch(`/api/v1/videos/${videoId}/views`);

      let isLiked = false;
      let addedToPlaylistIds = [];

      if (isLoggedIn) {
        try {
          // Fetch like status and playlists for the video concurrently
          const [isLikedVideoStatus, playlistsWithVideoRes] =
            await Promise.all([
              axios.get(`/api/v1/likes/v/${videoId}`, {
                withCredentials: true,
              }),
              axios.get(`/api/v1/playlists/video/${videoId}/`, {
                withCredentials: true,
              }),
            ]);
          isLiked = !!isLikedVideoStatus.data.data;
          addedToPlaylistIds = playlistsWithVideoRes.data.data.map(
            (playlist) => playlist._id
          );
        } catch (error) {
          console.error(
            "Error fetching like/playlist status:",
            error
          );
          isLiked = false;
          addedToPlaylistIds = [];
        }
      }

      return {
        video: videoRes.data.data,
        likesCount: allLikesRes.data.data.length,
        isLiked: isLiked,
        addedToPlaylistIds: addedToPlaylistIds,
      };
    } catch (error) {
      return rejectWithValue("Error fetching video details.");
    }
  }
);

export const addVideoToPlaylist = createAsyncThunk(
  "video/addVideoToPlaylist",
  async ({ playlistId, videoId }, { rejectWithValue }) => {
    if (!playlistId || playlistId.length !== 24) {
      return rejectWithValue("Invalid playlist ID.");
    }
    if (!videoId || videoId.length !== 24) {
      return rejectWithValue("Invalid video ID.");
    }
    try {
      const response = await axios.post(
        `/api/v1/playlists/add-video/${playlistId}/${videoId}`,
        {},
        {
          withCredentials: true,
        }
      );
      return response.data; // You may want to return a more specific payload
    } catch (error) {
      if (error.response.status === 409) {
        return rejectWithValue("Video already in playlist");
      }
      return rejectWithValue(
        error?.response?.data?.message ||
          "Error adding video to playlist."
      );
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
      .addCase(addVideoToPlaylist.fulfilled, (state, action) => {
        state.addedToPlaylistId.push(action.meta.arg.playlistId);
      })
      .addCase(addVideoToPlaylist.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});
export default videoSlice.reducer;
