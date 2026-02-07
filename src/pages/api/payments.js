// src/api/payments.js
import apiClient from "./apiClient";

export const createRazorpayOrder = async ({ amount, email }) => {
    const res = await apiClient.post("/payments/create-order", {
        amount, // in rupees (number)
        currency: "INR",
        receipt: `order_rcpt_${Date.now()}`,
        notes: { email },
    });
    return res.data;
};
