// src/pages/Marketplace/OrderSuccess.jsx
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
    FiCheckCircle,
    FiShoppingBag,
    FiArrowLeft,
    FiUser,
} from "react-icons/fi";

const PRIMARY = "#5a8807";

const OrderSuccess = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const state = location.state || {};

    const {
        orderId = "—",
        amount = 0,
        title = "Your order has been placed",
        userEmail = "",
    } = state;

    const formattedAmount =
        typeof amount === "number"
            ? new Intl.NumberFormat("en-IN", {
                style: "currency",
                currency: "INR",
                maximumFractionDigits: 0,
            }).format(amount)
            : amount;

    const shortOrderId =
        typeof orderId === "string" && orderId.length > 8
            ? `#${orderId.slice(-8)}`
            : orderId
                ? `#${orderId}`
                : "—";

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#E2F0C9] px-4 py-10">
            <div className="max-w-2xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden">
                {/* Top bar / accent */}
                <div
                    className="h-2 w-full"
                    style={{
                        background:
                            "linear-gradient(90deg, #5a8807 0%, #8cc63f 40%, #c4e48e 100%)",
                    }}
                />

                <div className="p-6 md:p-8">
                    {/* Icon + title */}
                    <div className="flex flex-col items-center text-center mb-6">
                        <div className="w-16 h-16 rounded-full flex items-center justify-center mb-3 shadow-md bg-[#E8F4D4]">
                            <FiCheckCircle className="w-9 h-9" style={{ color: PRIMARY }} />
                        </div>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                            Order Successful!
                        </h1>
                        <p className="mt-2 text-sm md:text-base text-gray-600 max-w-md">
                            {title || "Thank you for choosing to reuse instead of discard."}
                        </p>
                    </div>

                    {/* Order summary card */}
                    <div className="bg-[#F7FBEE] border border-[#E1F0C8] rounded-2xl p-4 md:p-5 mb-6">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div className="flex items-start gap-3">
                                <div className="mt-1">
                                    <FiShoppingBag
                                        className="w-6 h-6 text-[#5a8807]"
                                        aria-hidden="true"
                                    />
                                </div>
                                <div>
                                    <p className="text-xs font-semibold tracking-wide text-gray-500 uppercase">
                                        Order ID
                                    </p>
                                    <p className="text-base md:text-lg font-semibold text-gray-900">
                                        {shortOrderId}
                                    </p>

                                    <p className="mt-3 text-xs font-semibold tracking-wide text-gray-500 uppercase">
                                        Amount Paid
                                    </p>
                                    <p className="text-base md:text-lg font-semibold text-green-700">
                                        {formattedAmount}
                                    </p>
                                </div>
                            </div>

                            <div className="border-t md:border-t-0 md:border-l border-dashed border-[#D5E7B1] md:pl-5 md:ml-3 pt-4 md:pt-0">
                                <div className="flex items-start gap-2">
                                    <FiUser className="mt-0.5 w-4 h-4 text-gray-500" />
                                    <div>
                                        <p className="text-xs font-semibold tracking-wide text-gray-500 uppercase">
                                            Confirmation sent to
                                        </p>
                                        <p className="text-sm md:text-base font-medium text-gray-800 break-all">
                                            {userEmail || "Email not provided"}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <p className="mt-4 text-xs md:text-sm text-gray-600">
                            You&apos;ll also find this order under{" "}
                            <span className="font-semibold">Profile → Orders</span>. The
                            seller / recycler will contact you with the next steps.
                        </p>
                    </div>

                    {/* Info bullets */}
                    <div className="space-y-2 mb-6 text-xs md:text-sm text-gray-600">
                        <p className="flex gap-2">
                            <span className="mt-0.5 text-[#5a8807]">•</span>
                            <span>
                                Buying pre-used electronics helps reduce e-waste going to
                                landfills. 🌱
                            </span>
                        </p>
                        <p className="flex gap-2">
                            <span className="mt-0.5 text-[#5a8807]">•</span>
                            <span>
                                Keep your payment ID and order ID handy in case you need
                                support.
                            </span>
                        </p>
                    </div>

                    {/* Action buttons */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        <button
                            onClick={() => navigate("/marketplace")}
                            className="w-full inline-flex items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm md:text-base font-medium text-white shadow-md hover:brightness-95"
                            style={{ backgroundColor: PRIMARY }}
                        >
                            Continue Shopping
                        </button>

                        <button
                            onClick={() => navigate("/profile", { state: { tab: "orders" } })}
                            className="w-full inline-flex items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm md:text-base font-medium border border-gray-200 text-gray-800 hover:bg-gray-50"
                        >
                            View My Orders
                        </button>
                    </div>

                    {/* Back link */}
                    <button
                        onClick={() => navigate(-1)}
                        className="mt-4 inline-flex items-center gap-1 text-xs md:text-sm text-gray-500 hover:text-gray-800"
                    >
                        <FiArrowLeft className="w-4 h-4" />
                        Back to previous page
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OrderSuccess;
