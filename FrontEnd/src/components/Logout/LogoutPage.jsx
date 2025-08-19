import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { performLogout, logoutUser } from "../../store/features/userSlice";
import { Loadericon } from "../../assets/index.js";
import { notifyError, notifySuccess } from "@/utils/toasts";

const LogoutPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const logUserOut = async () => {
      try {
        await dispatch(performLogout()).unwrap();
        notifySuccess("Logout successful!");
        setTimeout(() => {
          navigate("/login");
        }, 1000);
      } catch (error) {
        notifyError(error);
        setTimeout(() => {
          navigate("/login");
        }, 1000);
      }
    };

    logUserOut();

  }, [dispatch, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
      <div className="flex flex-col items-center p-8 bg-gray-800 rounded-lg shadow-lg max-w-sm w-full text-center">
        <Loadericon className="w-12 h-12 text-pink-600 animate-spin mb-4" />

        <h1 className="text-2xl font-semibold mb-2">Logging out...</h1>

        <p className="text-gray-400">You are being securely logged out of your account.</p>
      </div>
    </div>
  );
};

export default LogoutPage;
