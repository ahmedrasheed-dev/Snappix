import axios from "axios";

let reduxStore = null;

export const setReduxStore = (store) => {
  reduxStore = store;
};

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
  withCredentials: true,
});

// ===== Refresh Token Logic =====
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    error ? reject(error) : resolve(token);
  });
  failedQueue = [];
};

export const refreshAccessToken = async () => {
  const { setTokens, logoutUser } = await import("../store/features/userSlice");

  try {
    const storedRefreshToken = localStorage.getItem("refreshToken");

    if (!storedRefreshToken) {
      throw new Error("No refresh token found");
    }

    const refreshResponse = await axiosInstance.post(
      "/users/refresh-token",
      { refreshToken: storedRefreshToken },
      { withCredentials: true }
    );

    console.log("refreshingToken response: ", refreshResponse);

    const { accessToken, refreshToken, user } = refreshResponse.data?.data;

    if (refreshToken) {
      localStorage.setItem("refreshToken", refreshToken);
    }

    // Update Redux
    reduxStore?.dispatch(setTokens({ accessToken, refreshToken, user }));

    // --- REMOVED THE LINE BELOW ---
    // We rely on the Request Interceptor to attach the token dynamically.
    // Setting defaults.headers.common here makes it "sticky" for all future requests, 
    // which breaks S3/Upload routes.
    // axiosInstance.defaults.headers.common.Authorization = `Bearer ${accessToken}`; 
    // ------------------------------

    return accessToken;
  } catch (err) {
    localStorage.removeItem("refreshToken");
    reduxStore?.dispatch(logoutUser());
    throw err;
  }
};

// ===== Request Interceptor =====
axiosInstance.interceptors.request.use(
  (config) => {
    const accessToken = reduxStore?.getState()?.user?.accessToken;
    
    // 1. Define routes that do NOT need the token
    const isAuthFreeRoute =
      config.url.includes("/users/login") ||
      config.url.includes("/users/register") ||
      config.url.includes("/users/password-reset") ||
      config.url.includes("/users/refresh-token");

    // 2. Define routes that MUST NOT have the token (e.g., S3 / Cloudinary uploads)
    // If you are using a Presigned URL, usually the entire config.url will be different,
    // but if you are hitting your own backend route that proxies to S3, add it here.
    const isUploadRoute = config.url.includes("https://snappix-app.s3.eu-north-1.amazonaws.com/videos/"); 

    // 3. Only add the header if:
    // - We have a token
    // - It's not an auth-free route
    // - It's not the upload route
    if (accessToken && !isAuthFreeRoute && !isUploadRoute) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// ===== Response Interceptor =====
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    const isAuthFreeRoute =
      originalRequest.url.includes("/users/login") ||
      originalRequest.url.includes("/users/register") ||
      originalRequest.url.includes("/users/password-reset");

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
        
        // This manual override is fine because it only affects THIS retry attempt, not global defaults
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