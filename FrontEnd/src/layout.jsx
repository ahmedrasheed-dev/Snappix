import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { setTokens, logoutUser } from "./store/features/userSlice"; 
import axiosInstance from "./api/axios";
import Loadericon  from "./assets/icons/Loadericon";
import axios from "axios";

const AuthLayout = ({ children }) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      // 1. Check if we have a refresh token in LocalStorage
      const storedRefreshToken = localStorage.getItem("refreshToken");

      if (!storedRefreshToken) {
        setLoading(false);
        return;
      }

      try {
        // 2. Attempt to refresh the token immediately
        const response = await axios.post("/users/refresh-token", {
          refreshToken: storedRefreshToken,
        });

        const { accessToken, refreshToken, user } = response.data?.data;

        // 3. Update Redux with the fresh session
        dispatch(setTokens({ accessToken, refreshToken, user }));

        // 4. Update LocalStorage if rotation happened
        if (refreshToken) {
          localStorage.setItem("refreshToken", refreshToken);
        }
      } catch (error) {
        console.log("Session expired or invalid:", error);
        // Clear everything if refresh fails
        localStorage.removeItem("refreshToken");
        dispatch(logoutUser());
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, [dispatch]);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-900 text-white">
        <Loadericon className="animate-spin h-10 w-10" />
      </div>
    );
  }

  return <>{children}</>;
};

export default AuthLayout;
