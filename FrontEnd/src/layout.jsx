import { useEffect, useState } from "react";
import { setReduxStore, refreshAccessToken } from "./api/axios.js"; 
import { store } from "./store/index.js"; 
import Loadericon from "./assets/icons/Loadericon";

const AuthLayout = ({ children }) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Inject store into axios interceptors
    setReduxStore(store);

    const initAuth = async () => {
      try {
        // Attempt to refresh the token immediately on app load.
        // If an HTTP-Only cookie exists, this will succeed and populate Redux.
        await refreshAccessToken();
      } catch (error) {
        // If this fails, it just means the user is not logged in (Guest).
        // We do NOT block the UI, we just catch the error and proceed.
      } finally {
        // Always remove the loader so the page renders
        setLoading(false);
      }
    };

    initAuth();
  }, []); 

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