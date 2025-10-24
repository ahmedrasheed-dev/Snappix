import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "@/api/axios";

const initialState = {
  relatedVideos: [],
  status: "idle",
  error: null,
};

export const fetchRelatedVideos = createAsyncThunk(
  "videos/getRelatedVideos",
  async ({ videoId, page = 1, limit = 10 }, { rejectWithValue }) => {
    if (!videoId || videoId.length !== 24) {
      return rejectWithValue("Invalid video ID.");
    }

    try {
      const response = await axiosInstance.get(`${import.meta.env.VITE_BASE_URL}/videos`, {
        params: {
          page,
          limit,
        },
      });
      const filteredVideos = response.data.data.docs.filter(
        (video) => video._id !== videoId
      );
      return filteredVideos;
    } catch (error) {
      return rejectWithValue("Error fetching related videos:", error);
    }
  }
);

const videosSlice = createSlice({
  name: "videos",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchRelatedVideos.pending, (state) => {
      state.status = "loading";
    });
    builder.addCase(fetchRelatedVideos.fulfilled, (state, action) => {
      state.status = "succeeded";
      state.relatedVideos = action.payload;
      state.error = null;
    });
    builder.addCase(fetchRelatedVideos.rejected, (state, action) => {
      state.status = "failed";
      state.error = action.payload;
    });
  },
});
export default videosSlice.reducer;
