import axios from "axios";
let reduxStore = null;

export const setReduxStore = (store) => {
  reduxStore = store;
};

const axiosInstance = axios.create({
  baseURL: "/api/v1",
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
  const { setTokens, logoutUser } = await import(
    "../store/features/userSlice"
  );

  try {
    const refreshResponse = await axios.post(
      "/api/v1/users/refresh-token",
      {},
      { withCredentials: true }
    );
    console.log("refreshingToken: ", refreshResponse);
    const { accessToken, refreshToken, user } =
      refreshResponse.data?.data;

    reduxStore?.dispatch(
      setTokens({ accessToken, refreshToken, user })
    );

    axiosInstance.defaults.headers.common.Authorization = `Bearer ${accessToken}`;

    return accessToken;
  } catch (err) {
    reduxStore?.dispatch(logoutUser());
    throw err;
  }
};

// ===== Request Interceptor =====
axiosInstance.interceptors.request.use(
  (config) => {
    const accessToken = reduxStore?.getState()?.user?.accessToken;
    if (accessToken) {
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

    if (error.response?.status === 401 && !originalRequest._retry) {
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
