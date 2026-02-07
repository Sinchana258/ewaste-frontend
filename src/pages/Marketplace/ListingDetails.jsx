// src/pages/Marketplace/ListingDetails.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchListingById } from "../api/listings";
import { useToast } from "../../context/ToastContext";
import {
    FiArrowLeft,
    FiShoppingCart,
    FiTag,
    FiPackage,
} from "react-icons/fi";

const PRIMARY = "#5a8807";

const ListingDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { showToast } = useToast();

    const [listing, setListing] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadListing = async () => {
            try {
                const data = await fetchListingById(id);
                setListing(data);
            } catch (err) {
                console.error("Failed to fetch listing details", err);
            } finally {
                setLoading(false);
            }
        };
        loadListing();
    }, [id]);

    if (loading) return <div className="p-6">Loading...</div>;
    if (!listing) return <div className="p-6">Listing not found.</div>;

    const {
        image_url,
        title,
        price,
        category,
        condition,
        description,
        stock = 0,
    } = listing;

    const handleAddToCart = () => {
        if (stock <= 0) {
            showToast({ message: "This item is out of stock" });
            return;
        }

        try {
            const raw = localStorage.getItem("ewaste_cart");
            const cart = raw ? JSON.parse(raw) : [];

            const index = cart.findIndex((item) => item.id === id);

            if (index !== -1) {
                if (cart[index].quantity >= stock) {
                    showToast({ message: "You've added maximum available stock!" });
                    return;
                }
                cart[index].quantity += 1;
            } else {
                cart.push({
                    id,
                    title,
                    price,
                    image_url,
                    category,
                    condition,
                    quantity: 1,
                    stock,
                });
            }

            localStorage.setItem("ewaste_cart", JSON.stringify(cart));
            showToast({ message: "Item added to cart" });
        } catch (err) {
            console.error("Add to cart failed", err);
            showToast({ message: "Error adding item to cart" });
        }
    };

    const conditionColor =
        (condition || "").toLowerCase().includes("working") ||
            (condition || "").toLowerCase().includes("good")
            ? "bg-emerald-100 text-emerald-800"
            : (condition || "").toLowerCase().includes("repair")
                ? "bg-amber-100 text-amber-800"
                : "bg-gray-100 text-gray-700";

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            {/* Back button */}
            <button
                onClick={() => navigate(-1)}
                className="mb-4 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
            >
                <FiArrowLeft className="w-4 h-4" />
                Back to marketplace
            </button>

            <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
                <div className="flex flex-col md:flex-row">
                    {/* Image section */}
                    <div className="md:w-1/2 relative bg-gray-50">
                        {stock <= 0 && (
                            <div className="absolute top-4 left-4 bg-red-600 text-white text-xs font-semibold px-3 py-1 rounded-full shadow">
                                Out of stock
                            </div>
                        )}

                        <img
                            src={
                                image_url ||
                                "https://via.placeholder.com/600x400?text=E-waste+Item"
                            }
                            alt={title}
                            className={`w-full h-72 md:h-full object-cover ${stock <= 0 ? "opacity-60" : ""
                                }`}
                        />
                    </div>

                    {/* Details section */}
                    <div className="md:w-1/2 p-6 md:p-8 flex flex-col gap-5">
                        {/* Title + chips */}
                        <div>
                            <h1 className="text-2xl md:text-3xl font-semibold text-gray-900">
                                {title}
                            </h1>

                            <div className="mt-3 flex flex-wrap gap-2 text-xs">
                                {category && (
                                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gray-100 text-gray-700">
                                        <FiTag className="w-3 h-3" />
                                        <span className="font-medium">{category}</span>
                                    </span>
                                )}

                                {condition && (
                                    <span
                                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${conditionColor}`}
                                    >
                                        <FiPackage className="w-3 h-3" />
                                        Condition: {condition}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Price + stock */}
                        <div className="flex flex-wrap items-end justify-between gap-3 border-y border-gray-100 py-3">
                            <div>
                                <p className="text-xs font-semibold tracking-wide text-gray-500 uppercase">
                                    Price
                                </p>
                                <p className="text-2xl font-bold text-green-700">
                                    ₹{Number(price || 0).toLocaleString("en-IN")}
                                </p>
                            </div>

                            <div className="text-right">
                                <p className="text-xs font-semibold tracking-wide text-gray-500 uppercase">
                                    Availability
                                </p>
                                {stock <= 0 ? (
                                    <p className="text-sm font-semibold text-red-600">
                                        Currently unavailable
                                    </p>
                                ) : stock <= 2 ? (
                                    <p className="text-sm font-semibold text-amber-700">
                                        Hurry! Only {stock} left
                                    </p>
                                ) : (
                                    <p className="text-sm text-gray-700">In stock: {stock}</p>
                                )}
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <h2 className="text-sm font-semibold text-gray-800 mb-1">
                                Item details
                            </h2>
                            <p className="text-sm text-gray-700 leading-relaxed">
                                {description ||
                                    "This reusable e-waste item has been listed on the marketplace to encourage reuse instead of disposal. Please review the condition before purchase."}
                            </p>
                        </div>

                        {/* Info note */}
                        <div className="bg-[#F7FBEE] border border-[#E1F0C8] rounded-2xl px-4 py-3 text-xs text-gray-700">
                            Buying pre-used electronics helps reduce e-waste going to landfills
                            and supports a circular economy. 🌱
                        </div>

                        {/* CTA buttons */}
                        <div className="mt-2 flex flex-col sm:flex-row gap-3">
                            <button
                                onClick={handleAddToCart}
                                disabled={stock <= 0}
                                className={`inline-flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-2.5 rounded-full text-sm font-medium text-white shadow-md ${stock > 0
                                        ? "hover:brightness-95"
                                        : "opacity-60 cursor-not-allowed"
                                    }`}
                                style={{ backgroundColor: PRIMARY }}
                            >
                                <FiShoppingCart className="w-4 h-4" />
                                {stock > 0 ? "Add to Cart" : "Unavailable"}
                            </button>

                            <button
                                onClick={() => navigate("/cart")}
                                className="inline-flex items-center justify-center w-full sm:w-auto px-6 py-2.5 rounded-full text-sm font-medium border border-gray-200 text-gray-800 hover:bg-gray-50"
                            >
                                View Cart
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ListingDetails;
