import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "@/api/axios";

const initialState = {
  status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
  // Indicates if the currently logged-in user is subscribed to the channel being viewed
  isSubscribed: false,
  subscriberCount: 0,
};

export const fetchSubscriptionStatus = createAsyncThunk(
  "subscription/fetchSubscriptionStatus",
  async (channelId, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const isLoggedIn = state.user.isLoggedIn;

      if (!isLoggedIn) {
        return { isSubscribed: false, subscriberCount: 0 };
      }
      const response = await axiosInstance.get(`subscriptions/status/${channelId}`);

      const channelData = response.data.data;

      return {
        isSubscribed: channelData.isSubscribed,
        subscriberCount: channelData.subscriberCount || 0,
      };
    } catch (error) {
      console.error("Error fetching subscription status:", error);
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch subscription status."
      );
    }
  }
);

export const toggleSubscription = createAsyncThunk(
  "subscription/toggleSubscription",
  async (channelId, { getState, rejectWithValue }) => {
    const state = getState();
    const isLoggedIn = state.user.isLoggedIn;

    if (!isLoggedIn) {
      return rejectWithValue("Please log in to subscribe.");
    }

    try {
      const response = await axiosInstance.post(`/subscriptions/toggle/${channelId}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response.data.message || "Failed to toggle subscription.");
    }
  }
);

const subscriptionSlice = createSlice({
  name: "subscription",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSubscriptionStatus.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchSubscriptionStatus.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.isSubscribed = action.payload.isSubscribed || false;
        state.subscriberCount = action.payload.subscriberCount || 0;
        state.error = null;
      })
      .addCase(fetchSubscriptionStatus.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
        state.isSubscribed = false;
        state.subscriberCount = 0;
      });

    builder
      .addCase(toggleSubscription.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(toggleSubscription.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.isSubscribed = action.payload.subscribed;
        const delta = action.payload.subscribed ? 1 : -1;
        state.subscriberCount = Math.max(0, state.subscriberCount + delta)
        state.error = null;
      })
      .addCase(toggleSubscription.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export default subscriptionSlice.reducer;
