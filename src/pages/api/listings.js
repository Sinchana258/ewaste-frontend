import apiClient from "./apiClient";

export const fetchListings = async () => {
    const res = await apiClient.get("/marketplace/listings");
    return res.data;
};

export const fetchListingById = async (id) => {
    const res = await apiClient.get(`/marketplace/listings/${id}`);
    return res.data;
};

export const getMyListings = async (email) => {
    const res = await apiClient.get("/marketplace/my-listings", {
        params: { owner_email: email },
    });
    return res.data;
};

export const deleteListing = async (id, email) => {
    const res = await apiClient.delete(`/marketplace/listings/${id}`, {
        params: { owner_email: email },
    });
    return res.data;
};