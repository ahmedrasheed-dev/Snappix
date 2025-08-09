import axios from "axios";
const BASE_URL = import.meta.env.VITE_server_url;

export const getVideos = async (params = {}) => {
  try {
    const res = await axios.get(`${BASE_URL}/api/v1/videos`, {
      params: {
        page: params.page,
        limit: params.limit,
        query: params.query,
        sortBy: params.sortBy,
        sortType: params.sortType,
        userId: params.userId,
      },
    });
    return res.data;
  } catch (error) {
    console.error("Failed to fetch videos:", error);
    throw error;
  }
};
