// src/utils/axiosInstance.js
import axios from "axios";

const instance = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

// Attach token on each request
instance.interceptors.request.use(
    (config) => {
        if (typeof window !== "undefined") {
            const token = localStorage.getItem("access_token");
            if (token) {
                config.headers = config.headers || {};
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Optional response interceptor
instance.interceptors.response.use(
    (response) => response,
    (error) => Promise.reject(error)
);

// Helper to set/remove token after login/logout
export function setAuthToken(token) {
    if (typeof window === "undefined") return;

    if (token) {
        localStorage.setItem("access_token", token);
        instance.defaults.headers.common.Authorization = `Bearer ${token}`;
    } else {
        localStorage.removeItem("access_token");
        delete instance.defaults.headers.common.Authorization;
    }
}

export default instance;
