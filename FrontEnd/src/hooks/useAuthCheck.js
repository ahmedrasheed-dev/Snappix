import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

import {
  setLoggedInUser,
  logoutUser,
} from "../store/features/userSlice";

import axiosInstance from "../api/axios";

const useInitialAuthCheck = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const verifyToken = async () => {
      try {
        const response = await axiosInstance.get(
          `/users/profile`,
          {
            withCredentials: true,
          }
        );

        if (response.data && response.data.data) {
          const user = response.data.data;
          dispatch(setLoggedInUser({ user }));
        } else {
          console.log(
            "Profile API returned 200 OK but no user data. Logging out."
          );
          dispatch(logoutUser());
        }
      } catch (error) {
        if (error.response && error.response.status === 401) {
          console.log("No valid session found. Logging out.");
          dispatch(logoutUser());
        } else {
          console.error(
            "An error occurred during initial auth check:",
            error
          );
        }
      }
    };

    verifyToken();
  }, [dispatch, navigate]);
};

export default useInitialAuthCheck;
