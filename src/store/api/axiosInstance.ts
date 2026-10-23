import axios from "axios";

import { API_BASE_URL } from "./config";
import { getAuthToken } from "./token";

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 120_000,
  headers: { Accept: "application/json" },
  withCredentials: true,
});

axiosInstance.interceptors.request.use((config) => {
  if (!config.headers.Authorization) {
    const token = getAuthToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default axiosInstance;
