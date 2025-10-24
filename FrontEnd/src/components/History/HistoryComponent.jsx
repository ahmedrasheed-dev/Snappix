import React, { useEffect, useState } from "react";
import HistoryPage from "./HistoryPage";
import axiosInstance from "@/api/axios";

const HistoryComponent = () => {
  const [watchHistoryData, setWatchHistoryData] = useState({});
  useEffect(() => {
    const getWatchHistory = async () => {
      const res = await axiosInstance.get(`${import.meta.env.VITE_BASE_URL}/users/watch-history`);
      console.log(res.data?.data);
      setWatchHistoryData(res.data?.data);
    };
    getWatchHistory();
  }, []);

  return (
    <div>
      <HistoryPage data={watchHistoryData}/>
    </div>
  );
};

export default HistoryComponent;
