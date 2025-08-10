import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logoutUser } from "../../store/features/userSlice";
import { Loadericon } from "../../assets/index.js";
import axios from "axios";

const LogoutPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    let redirectTimeout;
    const logUserOut = async () => {
      try {
        const res = await axios.post(
          `/api/v1/users/logout`,
          {},
          {
            withCredentials: true,
          }
        );

        if (res?.data?.statusCode === 200) {
          dispatch(logoutUser());
          redirectTimeout = setTimeout(() => {
            navigate("/");
          }, 1500);
        }
      } catch (error) {
        console.error("Logout error:", error);
        dispatch(logoutUser());
        redirectTimeout = setTimeout(() => {
          navigate("/");
        }, 1500);
      }
    };

    logUserOut();

    return () => clearTimeout(redirectTimeout);
  }, [dispatch, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
      <div className="flex flex-col items-center p-8 bg-gray-800 rounded-lg shadow-lg max-w-sm w-full text-center">
        <Loadericon className="w-12 h-12 text-pink-600 animate-spin mb-4" />

        <h1 className="text-2xl font-semibold mb-2">
          Logging out...
        </h1>

        <p className="text-gray-400">
          You are being securely logged out of your account.
        </p>
      </div>
    </div>
  );
};

export default LogoutPage;
