import axiosInstance from "@/api/axios";
import axios from "axios";
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
      const response = await axiosInstance.get(`/users/profile`, { withCredentials: true });
      if (response.data?.data) {
        return response.data.data;
      }
      return rejectWithValue("No user data found");
    } catch (error) {
      if (error.response?.status === 401) {
        return rejectWithValue("No valid session");
      }
      return rejectWithValue(error.response?.data?.message || "Auth check failed");
    }
  }
);
export const performLogout = createAsyncThunk(
  "user/performLogout",
  async (_, { rejectWithValue, dispatch }) => {
    try {
      const res = await axiosInstance.post(`/users/logout`);
      console.log("logout Res: ", res);
      if (res?.status === 200) {
        return { success: true };
      } else {
        return rejectWithValue(res.data?.message || "Logout failed unexpectedly.");
      }
    } catch (error) {
      dispatch(logoutUser());
      return rejectWithValue(
        error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          "An error occurred during login."
      );
    }
  }
);
export const perfomLogin = createAsyncThunk(
  "user/performLogin",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`/users/login`, { email, password });

      if (response?.status === 200 && response?.data?.data) {
        const { user, accessToken, refreshToken } = response?.data?.data;
        return { user, accessToken, refreshToken };
      } else {
        return rejectWithValue(response.data?.message || "Login failed unexpectedly.");
      }
    } catch (error) {
      console.log("login reject thunk: ", error.response);
      return rejectWithValue(
        error.response?.data?.message || error.message || "An error occurred during login."
      );
    }
  }
);
// Update Avatar
export const updateAvatar = createAsyncThunk(
  "dashboard/updateAvatar",
  async (file, { rejectWithValue }) => {
    try {
      // Get presigned URL from backend (private route)
      const presignRes = await axiosInstance.post("/users/presigned-url", {
        fileName: file.name,
        fileType: file.type,
        fileCategory: "avatar",
      });

      const { uploadUrl, fileUrl: fileKey } = presignRes.data.data;

      // Upload file directly to S3 using the presigned URL
      await axios.put(uploadUrl, file, {
        headers: { "Content-Type": file.type },
      });

      // Notify backend to update the user's avatar record
      const updateRes = await axiosInstance.post("/users/update-avatar", { fileKey });

      return updateRes.data.data; // Updated user object
    } catch (error) {
      console.error(error);
      return rejectWithValue(error.response?.data?.message || "Failed to update avatar.");
    }
  }
);


// Update Cover Image
export const updateCoverImage = createAsyncThunk(
  "dashboard/updateCover",
  async (file, { rejectWithValue }) => {
    try {
      //  Get presigned URL for cover
      const presignRes = await axiosInstance.post("/users/presigned-url", {
        fileName: file.name,
        fileType: file.type,
        fileCategory: "cover",
      });

      const { uploadUrl, fileUrl: fileKey } = presignRes.data.data;

      //  Upload to S3
      await axios.put(uploadUrl, file, {
        headers: { "Content-Type": file.type },
      });

      //  Update cover in DB
      const updateRes = await axiosInstance.post("/users/update-cover", { fileKey });

      return updateRes.data.data;
    } catch (error) {
      console.error(error);
      return rejectWithValue(error.response?.data?.message || "Failed to update cover image.");
    }
  }
);

// Update Profile (username + fullName)
export const updateProfile = createAsyncThunk(
  "dashboard/updateProfile",
  async ({ username, fullName }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/users/update-profile", { username, fullName });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to update profile.");
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
        return initialState;
      })
      .addCase(performLogout.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(updateAvatar.fulfilled, (state, action) => {
        state.user = { ...state.user, ...action.payload };
        state.status = "succeeded";
      })
      .addCase(updateAvatar.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // Update Cover
      .addCase(updateCoverImage.fulfilled, (state, action) => {
        state.user = { ...state.user, ...action.payload };
        state.status = "succeeded";
      })
      .addCase(updateCoverImage.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // Update Profile
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.user = { ...state.user, ...action.payload };
        state.status = "succeeded";
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export const { setLoggedInUser, logoutUser, setError, setTokens } = userSlice.actions;

export default userSlice.reducer;
