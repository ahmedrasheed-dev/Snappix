import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
const initialState = {
  playlist: [],
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
        console.log("playlists using redux: ", response);
        return response.data.data.docs;
      } catch (error) {
        return rejectWithValue("Error fetching user playlists:", error);
      }
    }
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
      console.log("action,payload of playlist: ", action.payload);
      state.playlist = action.payload;
      state.error = null;
    });
    builder.addCase(fetchUserPlaylists.rejected, (state, action) => {
      state.status = "failed";
      state.error = action.payload;
    }) 
    builder.addCase(createPlaylist.fulfilled, (state, action) => {
      state.playlist.push(action.payload);
      state.error = null;
    });
    builder.addCase(createPlaylist.rejected, (state, action) => {
      state.error = action.payload;
    });
  },
});
export default playlistSlice.reducer;