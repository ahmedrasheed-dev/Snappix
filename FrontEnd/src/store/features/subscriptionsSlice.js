import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axios";

const initialState = {
  subscribers: [],      // People who subscribed to *me*
  subscribedChannels: [], // Channels that *I* subscribed to
  status: "idle",
  error: null,
};


// Get all subscribers of a channel
export const fetchSubscribers = createAsyncThunk(
  "subscriptions/fetchSubscribers",
  async (channelId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/subscriptions/${channelId}`);
      return response.data?.data; 
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch subscribers");
    }
  }
);

// Get all channels a user subscribed to
export const fetchSubscribedChannels = createAsyncThunk(
  "subscriptions/fetchSubscribedChannels",
  async (subscriberId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/subscriptions/channels/${subscriberId}`);
      return response.data?.data; 
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch subscribed channels");
    }
  }
);

const subscriptionsSlice = createSlice({
  name: "subscriptions",
  initialState,
  reducers: {
    clearSubscriptions: (state) => {
      state.subscribers = [];
      state.subscribedChannels = [];
      state.status = "idle";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch Subscribers
    builder
      .addCase(fetchSubscribers.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchSubscribers.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.subscribers = action.payload || [];
      })
      .addCase(fetchSubscribers.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });

    // Fetch Subscribed Channels
    builder
      .addCase(fetchSubscribedChannels.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchSubscribedChannels.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.subscribedChannels = action.payload || [];
      })
      .addCase(fetchSubscribedChannels.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export const { clearSubscriptions } = subscriptionsSlice.actions;
export default subscriptionsSlice.reducer;
