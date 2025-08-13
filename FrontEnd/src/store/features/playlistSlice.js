import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

import axios from "axios";
const initialState = {
  playlists: [],
  status: "idle",
  error: null,
};

export const fetchUserPlaylists = createAsyncThunk(
  "playlist/fetchUserPlaylists",
  async (_, { getState, rejectWithValue }) => {
    const user = getState().user;
    const isLoggedIn = user.isLoggedIn;
    if (isLoggedIn) {
      try {
        const response = await axios.get(`/api/v1/playlists/`, {
          withCredentials: true,
        });
        return response.data.data.docs;
      } catch (error) {
        return rejectWithValue(
          "Error fetching user playlists:",
          error
        );
      }
    }
    return [];
  }
);

export const createPlaylist = createAsyncThunk(
  "playlists/createPlaylist",
  async ({ name, description }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `/api/v1/playlists/`,
        { name, description },
        { withCredentials: true }
      );
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to create playlist."
      );
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
      const response = await axios.post(
        `/api/v1/playlists/add-video/${playlistId}/${videoId}`,
        {},
        {
          withCredentials: true,
        }
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
      return rejectWithValue(
        error?.response?.data?.message ||
          "Error adding video to playlist."
      );
    }
  }
);

const playlistSlice = createSlice({
  name: "playlist",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchUserPlaylists.pending, (state) => {
      state.status = "loading";
    });
    builder.addCase(fetchUserPlaylists.fulfilled, (state, action) => {
      state.status = "succeeded";
      state.playlists = action.payload;
      state.error = null;
    });
    builder.addCase(fetchUserPlaylists.rejected, (state, action) => {
      state.status = "failed";
      state.error = action.payload;
    });
    builder.addCase(createPlaylist.fulfilled, (state, action) => {
      state.playlists.push(action.payload);
      state.error = null;
    });
    builder.addCase(createPlaylist.rejected, (state, action) => {
      state.error = action.payload;
    });
    builder.addCase(addVideoToPlaylist.fulfilled, (state, action) => {
      const updatedPlaylist = action.payload;
      const playlistToUpdateIndex = state.playlists.findIndex(
        (p) => p._id === updatedPlaylist._id
      );

      if (playlistToUpdateIndex !== -1) {
        state.playlists[playlistToUpdateIndex] = updatedPlaylist;
      }
    });
  },
});
export default playlistSlice.reducer;
