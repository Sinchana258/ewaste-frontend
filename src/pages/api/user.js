// src/pages/api/user.js
import apiClient from "./apiClient";

// GET /users/me?email=...
export const fetchProfile = async (email) => {
    const res = await apiClient.get("/users/me", {
        params: { email },
    });
    return res.data;
};

// PUT /users/me?email=...
export const updateProfile = async (payload) => {
    const { email, ...rest } = payload;
    const res = await apiClient.put("/users/me", rest, {
        params: { email },
    });
    return res.data;
};

