import axiosInstance from "@/api/axios";
const BASE_URL = import.meta.env.VITE_server_url;
import { useQuery } from "@tanstack/react-query";

export const getVideos = async (params = {}) => {
  try {
    const res = await axiosInstance.get(`/videos?page=1&limit=12`, {
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

export const useGetVideos = (params) => {
  return useQuery({
    queryKey: ["videos", params],
    queryFn: () => getVideos(params),
    staleTime: 10000,
  });
};
