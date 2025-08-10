import { useLayoutEffect, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  setLoggedInUser,
  logoutUser,
} from "../store/features/userSlice";

const useInitialAuthCheck = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const verifyToken = async () => {
      try {
        const response = await axios.get(`/api/v1/users/profile`, {
          withCredentials: true,
        });

        

        if (response.data) {
           const user = response.data.data;
          dispatch(setLoggedInUser({ user }));
        } else {
          // If the API returns 200 but no user data, something is wrong.
          console.log(
            "Profile API returned 200 OK but no user data. Logging out."
          );
          dispatch(logoutUser());
        }
      } catch (error) {
        // This block runs if the API returns a 401 or any other error status code
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
