import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: {
    username: "",
    fullName: "",
    email: "",
    avatar: null,
  },
  token: null,
  isLoggedIn: false,
  error: null,
};


export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setLoggedInUser: (state, action) => {
      state.user = action.payload?.user;
      state.token = action.payload?.token;
      state.isLoggedIn = true;
      state.error = null;
    },
    logoutUser: (state) => {
      state.user = initialState.user;
      state.token = null;
      state.isLoggedIn = false;
      state.error = null;
    },
    setError: (state, action) => {
      state.error = action.payload?.error;
    },
  },
});

export const { setLoggedInUser, logoutUser, setError } =
  userSlice.actions;

export default userSlice.reducer;
