import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

import axiosInstance from "../../api/axios.js";

const initialState = {
  userPlaylists: [],
  singlePlaylist: null,
  status: "idle",
  error: null,
};

export const fetchUserPlaylists = createAsyncThunk(
  "playlist/fetchUserPlaylists",
  async (userID, { getState, rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`${import.meta.env.VITE_BASE_URL}/playlists/${userID}`);
      return response.data.data.docs;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Error fetching user playlists."
      );
    }
  }
);

export const createPlaylist = createAsyncThunk(
  "playlists/createPlaylist",
  async ({ name, description }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`${import.meta.env.VITE_BASE_URL}/playlists/`, { name, description });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || "Failed to create playlist.");
    }
  }
);

export const addVideoToPlaylist = createAsyncThunk(
  "playlists/addVideoToPlaylist",
  async ({ playlistId, videoId }, { rejectWithValue }) => {
    if (!playlistId || playlistId.length !== 24) {
      return rejectWithValue("Invalid playlist ID.");
    }
    if (!videoId || videoId.length !== 24) {
      return rejectWithValue("Invalid video ID.");
    }
    try {
      const response = await axiosInstance.post(
        `${import.meta.env.VITE_BASE_URL}/playlists/add-video/${playlistId}/${videoId}`,
        {}
      );
      // {
      //   "success": true,
      //   "message": "Video added to playlist",
      //   "data": {
      //     "_id": "689c105c6e0232a51ba84925",
      //     "name": "tesing again here we go",
      //     "owner": "6896d0a87d4a55db1b98bb67",
      //     "description": "tesing again here we go",
      //     "videos": [
      //       "6899686c426ca924d5440628"
      //     ],
      //     "createdAt": "2025-08-13T04:11:08.255Z",
      //     "updatedAt": "2025-08-13T04:11:08.321Z",
      //     "__v": 1
      //   }
      // }
      return response.data.data;
    } catch (error) {
      if (error.response.status === 409) {
        return rejectWithValue("Video already in playlist");
      }
      return rejectWithValue(error?.response?.data?.message || "Error adding video to playlist.");
    }
  }
);

// Delete Playlist
export const deletePlaylistThunk = createAsyncThunk(
  "playlists/deletePlaylist",
  async (playlistId, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`${import.meta.env.VITE_BASE_URL}/playlists/${playlistId}`);
      return playlistId;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || "Failed to delete playlist.");
    }
  }
);

// Update Playlist
export const updatePlaylistThunk = createAsyncThunk(
  "playlists/updatePlaylist",
  async ({ playlistId, data }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(`${import.meta.env.VITE_BASE_URL}/playlists/${playlistId}`, data);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || "Failed to update playlist.");
    }
  }
);

// Toggle Publish
export const togglePlaylistThunk = createAsyncThunk(
  "playlists/togglePlaylist",
  async (playlistId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(`${import.meta.env.VITE_BASE_URL}/playlists/toggle/${playlistId}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to toggle playlist visibility."
      );
    }
  }
);

//get all videos of a playlist
export const fetchSinglePlaylist = createAsyncThunk(
  "playlists/fetchSinglePlaylist",
  async (playlistId, { rejectWithValue }) => {
    if (!playlistId || playlistId.length !== 24) {
      return rejectWithValue("Invalid playlist ID.");
    }
    try {
      const response = await axiosInstance.get(`${import.meta.env.VITE_BASE_URL}/playlists/videos/${playlistId}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || "Error fetching playlist.");
    }
  }
);

const playlistSlice = createSlice({
  name: "playlist",
  initialState,
  reducers: {
    clearSinglePlaylist: (state) => {
      state.singlePlaylist = null; // reset when leaving page
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchUserPlaylists.pending, (state) => {
      state.status = "loading";
    });
    builder.addCase(fetchUserPlaylists.fulfilled, (state, action) => {
      state.status = "succeeded";
      state.userPlaylists = action.payload;
      state.error = null;
    });
    builder.addCase(fetchUserPlaylists.rejected, (state, action) => {
      state.status = "failed";
      state.error = action.payload;
      state.userPlaylists = [];
    });
    builder.addCase(createPlaylist.fulfilled, (state, action) => {
      state.userPlaylists.push(action.payload);
      state.error = null;
    });
    builder.addCase(createPlaylist.rejected, (state, action) => {
      state.error = action.payload;
    });
    builder.addCase(addVideoToPlaylist.fulfilled, (state, action) => {
      const updatedPlaylist = action.payload;
      const playlistToUpdateIndex = state.userPlaylists.findIndex(
        (p) => p._id === updatedPlaylist._id
      );

      if (playlistToUpdateIndex !== -1) {
        state.userPlaylists[playlistToUpdateIndex] = updatedPlaylist;
      }
    });
    /* ===== Single playlist ===== */
    builder.addCase(fetchSinglePlaylist.pending, (state) => {
      state.status = "loading";
      state.error = null;
    });
    builder.addCase(fetchSinglePlaylist.fulfilled, (state, action) => {
      state.status = "succeeded";
      state.singlePlaylist = action.payload;
      state.error = null;
    });
    builder.addCase(fetchSinglePlaylist.rejected, (state, action) => {
      state.status = "failed";
      state.error = action.payload;
      state.singlePlaylist = null;
    });
    builder.addCase(deletePlaylistThunk.fulfilled, (state, action) => {
      state.userPlaylists = state.userPlaylists.filter((p) => p._id !== action.payload);
    });

    builder.addCase(updatePlaylistThunk.fulfilled, (state, action) => {
      const updated = action.payload;
      const index = state.userPlaylists.findIndex((p) => p._id === updated._id);
      if (index !== -1) {
        state.userPlaylists[index] = updated;
      }
    });

    builder.addCase(togglePlaylistThunk.fulfilled, (state, action) => {
      const updated = action.payload;
      const index = state.userPlaylists.findIndex((p) => p._id === updated._id);
      if (index !== -1) {
        state.userPlaylists[index] = updated;
      }
    });
  },
});
export const { clearSinglePlaylist } = playlistSlice.actions;
export default playlistSlice.reducer;
