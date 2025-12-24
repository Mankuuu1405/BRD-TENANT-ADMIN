// src/utils/axiosInstance.js
import axios from "axios";
import authService from "../services/authService";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const axiosInstance = axios.create({
  baseURL:`${BASE_URL}/api/v1/`,
  withCredentials: false,
});

// Endpoints that do NOT need Authorization header
const noAuthUrls = [
  "/api/token/tenant/",
  "/api/token/refresh/",
  "/api/v1/tenants/signup/",
];

axiosInstance.interceptors.request.use(
  (config) => {
    const token = authService.getAccessToken();

    if (
      token &&
      !noAuthUrls.some((url) => config.url.startsWith(url))
    ) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    config.headers["Content-Type"] = "application/json";
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response?.status === 401 &&
      !noAuthUrls.some((url) => error.config.url.startsWith(url))
    ) {
      console.warn("🔐 Token expired → Logging out");
      authService.logout();
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
