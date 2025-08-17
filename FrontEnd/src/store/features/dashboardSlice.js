import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axios";

const initialState = {
  videos: [],
  totalViews: 0,
  pagination: {
    totalItems: 0,
    totalPages: 0,
    currentPage: 1,
  },
  avatar: null,
  cover: null,
  status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
};

// Fetch videos
export const fetchMyVideos = createAsyncThunk(
  "dashboard/fetchMyVideos",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("videos/myvideos");
      console.log("videos: ", response?.data?.data);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch videos.");
    }
  }
);

// Update video
export const updateVideoThunk = createAsyncThunk(
  "dashboard/updateVideo",
  async ({ videoId, data }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(`videos/${videoId}`, data);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to update video.");
    }
  }
);
export const UpdateThumbnail = createAsyncThunk(
  "dashboard/UpdateThumbnail",
  async ({ videoId, file }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append("thumbnail", file);
      const response = await axiosInstance.post(`videos/thumbnail/${videoId}`, formData);
      return { updatedThumbnail: response.data.data, _id: videoId };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to update video.");
    }
  }
);
// Delete video
export const deleteVideoThunk = createAsyncThunk(
  "dashboard/deleteVideo",
  async (videoId, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`videos/${videoId}`);
      return videoId; // return deleted video id
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to delete video.");
    }
  }
);

// Toggle publish status
export const togglePublishThunk = createAsyncThunk(
  "dashboard/togglePublish",
  async (videoId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(`videos/toggle-publish/${videoId}`);
      return response.data.data; // updated video
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to update status.");
    }
  }
);



const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // FETCH
      .addCase(fetchMyVideos.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchMyVideos.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.videos = action.payload.videos || []; // now each video has commentsCount & likesCount
        state.totalViews = action.payload.totalViews || 0;
        state.pagination = action.payload.pagination || {
          totalItems: 0,
          totalPages: 0,
          currentPage: 1,
        };
      })

      .addCase(fetchMyVideos.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Something went wrong";
      })

      // UPDATE
      .addCase(updateVideoThunk.fulfilled, (state, action) => {
        const index = state.videos.findIndex((v) => v._id === action.payload._id);
        if (index !== -1) state.videos[index] = action.payload;
      })

      // DELETE
      .addCase(deleteVideoThunk.fulfilled, (state, action) => {
        state.videos = state.videos.filter((v) => v._id !== action.payload);
      })

      // TOGGLE PUBLISH
      .addCase(togglePublishThunk.fulfilled, (state, action) => {
        const index = state.videos.findIndex((v) => v._id === action.payload._id);
        if (index !== -1) state.videos[index] = action.payload;
      })
      //UPDATE THUMBNAIL
      .addCase(UpdateThumbnail.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(UpdateThumbnail.fulfilled, (state, action) => {
        console.log("updateThumbnail", action.payload);
        state.status = "succeeded";
        const index = state.videos.findIndex((v) => v._id === action.payload._id);
        if (index !== -1) state.videos[index].thumbnail = action.payload.updatedThumbnail;
      })
      .addCase(UpdateThumbnail.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Something went wrong";
      })
     
  },
});

export default dashboardSlice.reducer;
