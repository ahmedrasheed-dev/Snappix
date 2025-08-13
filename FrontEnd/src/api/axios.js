import axios from 'axios';
let reduxStore = null;

export const setReduxStore = (store) => {
  reduxStore = store;
};

const axiosInstance = axios.create({
  baseURL: '/api/v1', 
  withCredentials: true, 
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

axiosInstance.interceptors.request.use(
  (config) => {
    const accessToken = reduxStore?.getState()?.user?.accessToken;

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle 401 Unauthorized errors and refresh tokens
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // If the error is 401 Unauthorized AND it's not a retry attempt
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // Mark this request as retried

      // If a refresh token request is already in progress, add the current request to a queue
      if (isRefreshing) {
        return new Promise(function(resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
        .then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return axiosInstance(originalRequest); // Retry original request with new token
        })
        .catch(err => {
          return Promise.reject(err);
        });
      }

      isRefreshing = true; // Set flag: refresh token request is starting

      return new Promise(async (resolve, reject) => {
        try {
          // Call your backend refresh token endpoint
          const refreshResponse = await axios.post('/api/v1/users/refresh-token', {}, { withCredentials: true });
          console.log("refreshing Tokens: ", refreshResponse);
          const { user } = refreshResponse.data?.data; 
          const {refreshToken} = refreshResponse?.data?.data?.user?.refreshToken
          const accessToken = refreshResponse?.data?.data?.accessToken;

          // Dispatch setTokens using the stored reduxStore
          if (reduxStore) {
            // Dynamically import actions to avoid circular dependency at module load time
            const { setTokens } = await import('../store/features/userSlice');
            reduxStore.dispatch(setTokens({ accessToken, refreshToken, user }));
          }

          // Update the Axios instance's default header (for any future direct axios.defaults use, though axiosInstance is preferred)
          axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

          // Process the queue of failed requests
          processQueue(null, accessToken);

          // Retry the original failed request with the new access token
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          resolve(axiosInstance(originalRequest));
        } catch (refreshError) {
          // If refresh fails (e.g., refresh token expired/invalid), log out the user
          if (reduxStore) {
             // Dynamically import logoutUser
            const { logoutUser } = await import('../store/features/userSlice');
            reduxStore.dispatch(logoutUser());
          }
          processQueue(refreshError, null); // Reject all queued requests
          reject(refreshError); // Reject the original request
        } finally {
          isRefreshing = false; // Reset the flag
        }
      });
    }

    // For any other error status or if already retried, just reject the promise
    return Promise.reject(error);
  }
);

export default axiosInstance;
