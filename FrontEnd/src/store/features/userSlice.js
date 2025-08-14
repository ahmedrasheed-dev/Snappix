import axiosInstance from "@/api/axios";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: {},
  accessToken: null,
  refreshToken: null,
  isLoggedIn: false,
  error: null,
  status: "idle",
};
export const fetchLoggedInUser = createAsyncThunk(
  "user/fetchLoggedInUser",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/users/profile`);
      if (response.data?.data) {
        return response.data.data;
      }
      return rejectWithValue("No user data found");
    } catch (error) {
      if (error.response?.status === 401) {
        return rejectWithValue("No valid session");
      }
      return rejectWithValue(
        error.response?.data?.message || "Auth check failed"
      );
    }
  }
);
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
export const updateAvatar = createAsyncThunk(
  "user/updateAvatar",
  async (file, { rejectWithValue, getState }) => {
    const isLoggedIn = getState().user?.isLoggedIn;
    if (!isLoggedIn) {
      return rejectWithValue("Not logged in");
    }

    try {
      const formData = new FormData();
      formData.append("avatar", file);
      const response = await axiosInstance.patch(
        `/users/avatar`,
        formData
      );
      return response.data?.data?.avatar;
    } catch (error) {
      rejectWithValue(
        "Error updating avatar" || error.response?.data?.message
      );
    }
  }
);
export const updateCoverImage = createAsyncThunk(
  "user/updateCoverImage",
  async (file, { rejectWithValue, getState }) => {
    const isLoggedIn = getState().user?.isLoggedIn;

    if (!isLoggedIn) {
      return rejectWithValue("Not logged in");
    }

    try {
      const formData = new FormData();
      formData.append("coverImage", file);
      const response = await axiosInstance.patch(
        `/users/cover-image`,
        formData
      );
      return data?.data?.coverImage;
    } catch (error) {
      rejectWithValue(
        "Error updating cover image" || error.respone?.data?.message
      );
    }
  }
);

export const updateProflie = createAsyncThunk(
  "user/updateProfile",
  async ({ username, fullName }, { rejectWithValue, getState }) => {
    const isLoggedIn = getState().user?.isLoggedIn;

    if (!isLoggedIn) {
      return rejectWithValue("Not logged in");
    }
    let formData = new FormData();
    formData.append("username", username);
    formData.append("fullName", fullName);
    try {
      const response = await axiosInstance.patch(
        `/users/update-account`,
        formData
      );
      return {
        username: data?.data?.username,
        fullName: data?.data?.fullName,
      };
    } catch (error) {
      rejectWithValue(
        "Error updating profile" || error.respone?.data?.message
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
      //  Fetch logged in user
      .addCase(fetchLoggedInUser.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchLoggedInUser.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload;
        state.isLoggedIn = true;
        state.error = null;
      })
      .addCase(fetchLoggedInUser.rejected, (state, action) => {
        state.status = "failed";
        state.isLoggedIn = false;
        state.user = null;
        state.error = action.payload;
      })
      // Login
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
      })
      // Logout
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
      //update avatar
      .addCase(updateAvatar.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(updateAvatar.fulfilled, (state, action) => {
        state.user.avatar = action.payload;
        state.status = "succeeded";
        state.error = null;
      })
      .addCase(updateAvatar.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      //update cover
      .addCase(updateCoverImage.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(updateCoverImage.fulfilled, (state, action) => {
        state.user.coverImage = action.payload;
        state.status = "succeeded";
        state.error = null;
      })
      .addCase(updateCoverImage.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      //update Profile username and fullname
      .addCase(updateProflie.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(updateProflie.fulfilled, (state, action) => {
        const { username, fullName } = action.payload;
        state.user.username = username;
        state.user.fullName = fullName;
        state.status = "succeeded";
        state.error = null;
      })
      .addCase(updateProflie.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export const { setLoggedInUser, logoutUser, setError, setTokens } =
  userSlice.actions;

export default userSlice.reducer;
