import { useEffect, useState } from "react";
import { setReduxStore, refreshAccessToken } from "./api/axios.js"; // Import your helper
import { store } from "./store/index.js"; 
import Loadericon from "./assets/icons/Loadericon";

const AuthLayout = ({ children }) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setReduxStore(store);

    const initAuth = async () => {
      const storedRefreshToken = localStorage.getItem("refreshToken");

      if (!storedRefreshToken) {
        setLoading(false);
        return;
      }

      try {
        // This function will:
        // - Call the API
        // - Dispatch setTokens to Redux
        // - Set the Authorization header
        await refreshAccessToken();
        
      } catch (error) {
        console.log("Session initialization failed:", error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []); // Run once on mount

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