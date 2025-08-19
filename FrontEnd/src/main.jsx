import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { Provider } from "react-redux";
import { store } from "./store";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import {
  Home,
  Profile,
  RegisterPage,
  LoginPage,
  LogoutPage,
  VerifyEmailPage,
  UploadVideo,
} from "./components";
import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import VideoPage from "./components/VideoPage/VideoPage.jsx";
import Dashboard from "./components/Dashboard/Dashboard.jsx";
import HistoryComponent from "./components/History/HistoryComponent.jsx";
import ChanePasswordPage from "./components/ChangePassword/ChanePasswordPage.jsx";
import SubscriptionsPage from "./components/Subscriptions/SubscriptionsPage.jsx";
import PlaylistPage from "./components/Playlist/PlaylistPage.jsx";
import TweetsPage from "./components/Tweets/TweetsPage.jsx";
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Set the global staleTime for all queries to 10 seconds (10000 milliseconds)
      staleTime: 10000,
    },
  },
});

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <QueryClientProvider client={queryClient}>
      <StrictMode>
        <Provider store={store}>
          <Routes>
            <Route path="/" element={<App />}>
              {/* Child routes that will be rendered inside the Outlet */}
              <Route index element={<Home />} />
              <Route path="channel/:username" element={<Profile />} />
              <Route path="history" element={<HistoryComponent />} />
              <Route path="subscriptions" element={<SubscriptionsPage />} />
              <Route path="settings" element={<Home />} />
              <Route path="register" element={<RegisterPage />} />
              <Route path="login" element={<LoginPage />} />
              <Route path="logout" element={<LogoutPage />} />
              <Route
                path="verify-email"
                element={<VerifyEmailPage />}
              />
              <Route path="upload-video" element={<UploadVideo />} />
              <Route path="video/:videoId" element={<VideoPage />} />                
              <Route path="dashboard" element={<Dashboard />} />                
              <Route path="change-password" element={<ChanePasswordPage />} />                
              <Route path="tweets" element={<TweetsPage />} />                
              <Route path="playlist/:playlistId" element={<PlaylistPage />} />                
            </Route>
          </Routes>
        </Provider>
      </StrictMode>
    </QueryClientProvider>
  </BrowserRouter>
);
