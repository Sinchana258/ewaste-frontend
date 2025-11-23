// src/pages/Marketplace/CreateListing.jsx
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import apiClient from "../api/apiClient";
import { useToast } from "../../context/ToastContext";
import { useAuth } from "../../hooks/useAuth";


const CreateListing = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { showToast } = useToast();
    const { user } = useAuth();


    // navigation state from classifier
    const navState = location.state || {};

    const [form, setForm] = useState({
        title: "",
        price: "",
        condition: "Good",
        stock: 1,
        category: "reusable",
        image_url: "",
        tags: [],
    });

    // Prefill from:
    // 1) value estimator (sessionStorage: prefillListing)
    // 2) classifier (navState: { imageUrl, label })
    useEffect(() => {
        // 1) From Value Estimator
        const saved = sessionStorage.getItem("prefillListing");
        if (saved) {
            const data = JSON.parse(saved);
            setForm((prev) => ({
                ...prev,
                title: data.title || prev.title,
                price: data.price ?? prev.price,
                category: data.category || prev.category,
                condition: data.condition || prev.condition,
                image_url: data.imageUrl || prev.image_url,
            }));
            sessionStorage.removeItem("prefillListing");
            return; // give estimator prefill priority
        }

        // 2) From Classifier direct navigation
        if (navState) {
            setForm((prev) => ({
                ...prev,
                title: navState.label
                    ? `${navState.label} - Used Device`
                    : prev.title,
                image_url: navState.imageUrl || prev.image_url,
            }));
        }
    }, [navState]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setForm((prev) => ({
            ...prev,
            [name]:
                name === "price" || name === "stock"
                    ? value === ""
                        ? ""
                        : Number(value)
                    : name === "tags"
                        ? value.split(",").map((t) => t.trim()).filter(Boolean)
                        : value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!form.title.trim() || !form.price || !form.image_url) {
            showToast({ message: "Please fill all required fields" });
            return;
        }

        try {
            const payload = {
                ...form,
                price: Number(form.price),
                stock: Number(form.stock || 1),
                owner_email: user?.email || null,
            };

            await apiClient.post("/marketplace/listings", payload);
            showToast({ message: "Listing posted to marketplace!" });
            navigate("/marketplace");
        } catch (err) {
            console.error("Failed to create listing:", err);
            showToast({ message: "Failed to create listing" });
        }
    };

    return (
        <div className="max-w-xl mx-auto p-6 bg-white rounded-2xl shadow">
            <h1 className="text-xl font-bold mb-4">Post Item to Marketplace</h1>

            {form.image_url && (
                <div className="mb-4 flex justify-center">
                    <img
                        src={form.image_url}
                        alt="Item"
                        className="w-40 h-40 object-cover rounded-lg shadow"
                    />
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Title */}
                <div>
                    <label className="block text-sm font-medium mb-1">Title *</label>
                    <input
                        name="title"
                        className="border rounded w-full px-3 py-2 text-sm"
                        value={form.title}
                        onChange={handleChange}
                        placeholder="e.g., Used Dell Laptop i5"
                    />
                </div>

                {/* Price */}
                <div>
                    <label className="block text-sm font-medium mb-1">
                        Price (₹) *
                    </label>
                    <input
                        type="number"
                        name="price"
                        className="border rounded w-full px-3 py-2 text-sm"
                        value={form.price}
                        onChange={handleChange}
                        min="0"
                    />
                </div>

                {/* Stock */}
                <div>
                    <label className="block text-sm font-medium mb-1">Quantity</label>
                    <input
                        type="number"
                        name="stock"
                        className="border rounded w-full px-3 py-2 text-sm"
                        value={form.stock}
                        onChange={handleChange}
                        min="1"
                    />
                </div>

                {/* Category */}
                <div>
                    <label className="block text-sm font-medium mb-1">
                        Category
                    </label>
                    <select
                        name="category"
                        className="border rounded w-full px-3 py-2 text-sm"
                        value={form.category}
                        onChange={handleChange}
                    >
                        <option value="reusable">Reusable</option>
                        <option value="recyclable">Recyclable</option>
                        <option value="hazardous">Hazardous</option>
                    </select>
                </div>

                {/* Condition */}
                <div>
                    <label className="block text-sm font-medium mb-1">
                        Condition
                    </label>
                    <select
                        name="condition"
                        className="border rounded w-full px-3 py-2 text-sm"
                        value={form.condition}
                        onChange={handleChange}
                    >
                        <option value="Good">Good</option>
                        <option value="Fair">Fair</option>
                        <option value="Poor">Poor</option>
                    </select>
                </div>

                {/* Tags */}
                <div>
                    <label className="block text-sm font-medium mb-1">
                        Tags (comma separated)
                    </label>
                    <input
                        name="tags"
                        className="border rounded w-full px-3 py-2 text-sm"
                        value={form.tags.join(", ")}
                        onChange={handleChange}
                        placeholder="phone, samsung, 4GB RAM"
                    />
                </div>

                <button
                    type="submit"
                    className="w-full bg-[#5a8807] text-white py-2 rounded text-sm font-semibold hover:brightness-95"
                >
                    Post Listing
                </button>
            </form>
        </div>
    );
};

export default CreateListing;
