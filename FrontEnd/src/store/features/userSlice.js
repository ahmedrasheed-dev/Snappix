import axiosInstance from "@/api/axios";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: {
    username: "",
    fullName: "",
    email: "",
    avatar: null,
  },
  accessToken: null,
  refreshToken: null,
  isLoggedIn: false,
  error: null,
};

export const performLogout = createAsyncThunk(
  "user/performLogout",
  async (_, { rejectWithValue, dispatch }) => {
    try {
      const res = await axiosInstance.post(
        `/users/logout`,
        {},
        {
          withCredentials: true,
        }
      );

      if (res?.data?.statusCode === 200) {
        dispatch(logoutUser());
        return { success: true };
      } else {
        return rejectWithValue(
          res.data?.message || "Logout failed unexpectedly."
        );
      }
    } catch (error) {
      dispatch(logoutUser());
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "An error occurred during logout."
      );
    }
  }
);
export const perfomLogin = createAsyncThunk(
  "user/performLogin",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        `/users/login`,
        { email, password },
        {
          withCredentials: true,
        }
      );
      if (response?.data?.statusCode === 200) {
        const { user, accessToken, refreshToken } =
          response?.data?.data;
        return { user, accessToken, refreshToken };
      } else {
        return rejectWithValue(
          response.data?.message || "Login failed unexpectedly."
        );
      }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "An error occurred during login."
      );
    }
  }
);

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setLoggedInUser: (state, action) => {
      state.user = action.payload?.user;
      state.isLoggedIn = true;
      state.error = null;
      state.status = "succeeded";
    },
    logoutUser: (state) => {
      state.user = initialState.user;
      state.accessToken = null;
      state.refreshToken = null;
      state.isLoggedIn = false;
      state.error = null;
      state.status = "idle";
    },
    setError: (state, action) => {
      state.error = action.payload?.error;
    },
    setTokens: (state, action) => {
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.user.refreshToken;
      state.user = action.payload.user;
      state.isLoggedIn = true;
      state.status = "succeeded";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(performLogout.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(performLogout.fulfilled, (state) => {
        state.status = "succeeded";
        state.error = null;
      })
      .addCase(performLogout.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(perfomLogin.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(perfomLogin.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.error = null;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken; 
        state.refreshToken = action.payload.refreshToken; 
        state.isLoggedIn = true;
      })
      .addCase(perfomLogin.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
        state.user = initialState.user;
        state.accessToken = null;
        state.refreshToken = null;
        state.isLoggedIn = false;
      });
  },
});

export const { setLoggedInUser, logoutUser, setError, setTokens } =
  userSlice.actions;

export default userSlice.reducer;
