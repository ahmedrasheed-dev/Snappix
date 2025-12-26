import axios from "axios";

// 1. Holder for the Redux Store
let reduxStore = null;

export const setReduxStore = (store) => {
  reduxStore = store;
};

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
  withCredentials: true,
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    error ? reject(error) : resolve(token);
  });
  failedQueue = [];
};

// ==========================================
//  UPDATED REFRESH FUNCTION
// ==========================================
export const refreshAccessToken = async () => {
  // 1. Dynamic Import to avoid Circular Dependency
  // We import fetchLoggedInUser here, not at the top
  const { setTokens, logoutUser, fetchLoggedInUser } = await import("../store/features/userSlice");

  try {
    const refreshResponse = await axiosInstance.post(
      "/users/refresh-token",
      {}, 
      { withCredentials: true }
    );
    const { accessToken, user } = refreshResponse.data?.data || {};

    // 2. Update Tokens in Redux
    reduxStore?.dispatch(setTokens({ accessToken, user }));

    // 3. FETCH FULL USER PROFILE HERE
    // Since the token is now fresh, we can immediately fetch the latest user data.
    // We await it to ensure data is ready before returning.
    if (accessToken) {
       await reduxStore?.dispatch(fetchLoggedInUser());
    }

    return accessToken;
  } catch (err) {
    console.error("Refresh failed:", err);
    reduxStore?.dispatch(logoutUser());
    throw err;
  }
};

// ... Request Interceptor remains the same ...
axiosInstance.interceptors.request.use(
  (config) => {
    const accessToken = reduxStore?.getState()?.user?.accessToken;
    
    const isAuthFreeRoute =
      config.url.includes("/users/login") ||
      config.url.includes("/users/register") ||
      config.url.includes("/users/password-reset") ||
      config.url.includes("/users/refresh-token");

    const isUploadRoute = config.url.includes("https://snappix-app.s3.eu-north-1.amazonaws.com/videos/"); 

    if (accessToken && !isAuthFreeRoute && !isUploadRoute) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// ... Response Interceptor remains the same ...
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const isAuthFreeRoute =
      originalRequest.url.includes("/users/login") ||
      originalRequest.url.includes("/users/register") || 
      originalRequest.url.includes("/users/refresh-token");

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthFreeRoute) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axiosInstance(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      isRefreshing = true;

      try {
        const newToken = await refreshAccessToken();
        processQueue(null, newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;