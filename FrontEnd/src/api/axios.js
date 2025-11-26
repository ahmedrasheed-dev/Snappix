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

const refreshAccessToken = async () => {
  const { setTokens, logoutUser } = await import("../store/features/userSlice");

  try {
    // 1. Get token from storage (Fallback for HTTP S3 where cookies fail)
    const storedRefreshToken = localStorage.getItem("refreshToken");

    // 2. Send the request
    const refreshResponse = await axiosInstance.post(
      "/users/refresh-token", // No need to repeat VITE_BASE_URL, it's in baseURL
      {
        refreshToken: storedRefreshToken // Send in body so backend can find it
      },
      { withCredentials: true }
    );

    // 3. Log AFTER the response exists
    console.log("refreshingToken response: ", refreshResponse);
    
    const { accessToken, refreshToken, user } = refreshResponse.data?.data;

    // 4. Update LocalStorage if a new refresh token was returned
    if (refreshToken) {
      localStorage.setItem("refreshToken", refreshToken);
    }

    reduxStore?.dispatch(setTokens({ accessToken, refreshToken, user }));

    axiosInstance.defaults.headers.common.Authorization = `Bearer ${accessToken}`;

    return accessToken;
  } catch (err) {
    // If refresh fails, clear storage and logout
    localStorage.removeItem("refreshToken");
    reduxStore?.dispatch(logoutUser());
    throw err;
  }
};

// ===== Request Interceptor =====
axiosInstance.interceptors.request.use(
  (config) => {
    const accessToken = reduxStore?.getState()?.user?.accessToken;
    const isAuthFreeRoute =
      config.url.includes("/users/login") ||
      config.url.includes("/users/register") ||
      config.url.includes("/users/password-reset") ||
      config.url.includes("/users/refresh-token");

    if (accessToken && !isAuthFreeRoute) {
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