import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./features/userSlice";
import videoReducer from "./features/videoSlice";
import videosReducer from "./features/videosSlice";
import playlistReducer from "./features/playlistSlice";
import commentReducer from "./features/commentSlice";
import subscriptionReducer from "./features/subscriptionSlice";
import channelReducers from "./features/channelSlice";
import dashboardReducers from "./features/dashboardSlice";
import { setReduxStore } from "@/api/axios";
export const store = configureStore({
  reducer: {
    user: userReducer,
    video: videoReducer,
    videos: videosReducer,
    playlists: playlistReducer,
    comments: commentReducer,
    subscription: subscriptionReducer,
    channel: channelReducers,
    dashboard: dashboardReducers,
  },
});
setReduxStore(store);
