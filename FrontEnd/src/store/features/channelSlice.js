import axiosInstance from "@/api/axios";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

const initialState = {
  ChannelProfile: {},
  ChannelVideos: [],
  ChannelPlaylists: [],
  status: "idle",
  error: null,
};

export const getChannelProfile = createAsyncThunk(
  "user/getChannelProfile",
  async (username, { rejectWithValue, getState }) => {
    try {
      const res = await axiosInstance.get(`${import.meta.env.VITE_BASE_URL}/users/c/${username}`);
      console.log("userChannelProfile: ", res?.data?.data);
      return res?.data?.data;
    } catch (error) {
      rejectWithValue(
        "Error updating profile" || error.respone?.data?.message
      );
    }
  }
);
export const getChannelVideos = createAsyncThunk(
  "user/getChannelVideos",
  async (userId, { rejectWithValue, getState }) => {
    try {
      const res = await axiosInstance.get(`${import.meta.env.VITE_BASE_URL}/videos?owner=${userId}`);
      return res?.data?.data?.docs;
    } catch (error) {
      rejectWithValue(
        "Error updating profile" || error.respone?.data?.message
      );
    }
  }
);
export const getChannelPlaylists = createAsyncThunk(
  "user/getChannelPlaylists",
  async (username, { rejectWithValue, getState }) => {
    try {
      const res = await axiosInstance.get(
        `${import.meta.env.VITE_BASE_URL}/playlists/channel/${username}`
      );
      return res?.data?.data?.docs;
    } catch (error) {
      rejectWithValue(
        "Error updating profile" || error.respone?.data?.message
      );
    }
  }
);

export const userSlice = createSlice({
  name: "Channel",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // Profile
    builder
      .addCase(getChannelProfile.pending, (state) => {
        state.status = "loading";
      })
      .addCase(getChannelProfile.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.ChannelProfile = action.payload;
        state.error = null;
      })
      .addCase(getChannelProfile.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });

    // Videos
    builder
      .addCase(getChannelVideos.pending, (state) => {
        state.status = "loading";
      })
      .addCase(getChannelVideos.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.ChannelVideos = action.payload;
        state.error = null;
      })
      .addCase(getChannelVideos.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });

    // Playlists
    builder
      .addCase(getChannelPlaylists.pending, (state) => {
        state.status = "loading";
      })
      .addCase(getChannelPlaylists.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.ChannelPlaylists = action.payload;
        state.error = null;
      })
      .addCase(getChannelPlaylists.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export default userSlice.reducer;
