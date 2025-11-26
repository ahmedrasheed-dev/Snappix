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
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import VideoPage from "./components/VideoPage/VideoPage.jsx";
import Dashboard from "./components/Dashboard/Dashboard.jsx";
import HistoryComponent from "./components/History/HistoryComponent.jsx";
import ChanePasswordPage from "./components/Settings/ChangePassword/ChanePasswordPage.jsx";
import SubscriptionsPage from "./components/Subscriptions/SubscriptionsPage.jsx";
import PlaylistPage from "./components/Playlist/PlaylistPage.jsx";
import TweetsPage from "./components/Tweets/TweetsPage.jsx";
import SettingsPage from "./components/Settings/SettingsPage.jsx";
import Error from "./pages/Error.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import LoginProtection from "./components/LoginProtection.jsx";
import AuthLayout from "./layout.jsx";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 10000 },
  },
});

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <QueryClientProvider client={queryClient}>
      <StrictMode>
        <Provider store={store}>
          <AuthLayout />
          <Routes>
            <Route path="/" element={<App />}>
              <Route index element={<Home />} />

              {/* Protected routes wrapper */}
              <Route element={<ProtectedRoute />}>
                <Route path="channel/:username" element={<Profile />} />
                <Route path="history" element={<HistoryComponent />} />
                <Route path="subscriptions" element={<SubscriptionsPage />} />
                <Route path="settings" element={<SettingsPage />} />
                <Route path="verify-email" element={<VerifyEmailPage />} />
                <Route path="upload-video" element={<UploadVideo />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="change-password" element={<ChanePasswordPage />} />
              </Route>

              {/* Public routes */}
              <Route path="register" element={<RegisterPage />} />
              <Route
                path="login"
                element={
                  <LoginProtection>
                    <LoginPage />
                  </LoginProtection>
                }
              />
              <Route path="logout" element={<LogoutPage />} />
              <Route path="video/:videoId" element={<VideoPage />} />
              <Route path="tweets" element={<TweetsPage />} />
              <Route path="playlist/:playlistId" element={<PlaylistPage />} />
              <Route path="*" element={<Error />} />
            </Route>
          </Routes>
          <AuthLayout />
        </Provider>
      </StrictMode>
    </QueryClientProvider>
  </BrowserRouter>
);
