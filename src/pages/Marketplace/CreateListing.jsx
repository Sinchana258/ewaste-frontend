// src/pages/Marketplace/CreateListing.jsx
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import apiClient from "../api/apiClient";
import { useToast } from "../../context/ToastContext";
import { useAuth } from "../../hooks/useAuth";

const DEVICE_CATEGORIES = [
    "Laptop",
    "Smartphone",
    "Tablet",
    "Television",
    "Desktop PC",
    "Accessories",
    "Home Appliance",
    "Other",
];

// Map from estimator category to nicer device category label
const mapEstimatorCategoryToDevice = (cat) => {
    switch ((cat || "").toLowerCase()) {
        case "phone":
            return "Smartphone";
        case "laptop":
            return "Laptop";
        case "tablet":
            return "Tablet";
        case "tv":
            return "Television";
        case "desktop":
            return "Desktop PC";
        case "other":
        default:
            return "Other";
    }
};

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
        category: "reusable", // classification type
        image_url: "",
        tags: [],
        // new detailed fields
        device_category: "Laptop",
        custom_category: "",
        brand: "",
        model: "",
        age_years: "",
        description: "",
    });

    // Prefill from:
    // 1) value estimator (sessionStorage: prefillListing)
    // 2) classifier (navState: { imageUrl, label })
    useEffect(() => {
        // 1) From Value Estimator
        const saved = sessionStorage.getItem("prefillListing");
        if (saved) {
            const data = JSON.parse(saved);

            const mappedDeviceCategory = mapEstimatorCategoryToDevice(data.category);

            setForm((prev) => ({
                ...prev,
                title: data.title || prev.title,
                price: data.price ?? prev.price,
                category: data.categoryType || prev.category, // if you stored classification type
                device_category: mappedDeviceCategory,
                custom_category:
                    mappedDeviceCategory === "Other" ? (data.categoryLabel || "") : "",
                condition: data.conditionLabel || prev.condition,
                brand: data.brand || prev.brand,
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
                        ? value
                            .split(",")
                            .map((t) => t.trim())
                            .filter(Boolean)
                        : name === "age_years"
                            ? value === ""
                                ? ""
                                : Number(value)
                            : value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!form.title.trim() || !form.price) {
            showToast({ message: "Please fill all required fields" });
            return;
        }

        // Decide final device category
        const finalDeviceCategory =
            form.device_category === "Other" && form.custom_category.trim()
                ? form.custom_category.trim()
                : form.device_category;

        // Build description if empty
        let finalDescription = form.description || "";
        if (!finalDescription.trim()) {
            const parts = [];

            if (form.brand) parts.push(form.brand);
            if (form.model) parts.push(form.model);
            if (finalDeviceCategory) parts.push(`(${finalDeviceCategory})`);

            const header = parts.length ? parts.join(" ") : form.title;

            finalDescription =
                header +
                ". " +
                (form.condition
                    ? `Condition: ${form.condition}. `
                    : "") +
                (form.age_years
                    ? `Approx age: ${form.age_years} year(s). `
                    : "") +
                "Listed via Ecycle marketplace to encourage reuse instead of disposal.";
        }

        try {
            const payload = {
                ...form,
                price: Number(form.price),
                stock: Number(form.stock || 1),
                owner_email: user?.email || null,
                image_url:
                    form.image_url ||
                    "https://via.placeholder.com/400x300?text=E-waste+item",
                device_category: finalDeviceCategory,
                description: finalDescription,
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
        <div className="max-w-3xl mx-auto p-6 md:p-8 bg-white rounded-2xl shadow">
            <h1 className="text-xl md:text-2xl font-bold mb-2">
                Post Item to Marketplace
            </h1>
            <p className="text-sm text-gray-600 mb-4">
                Provide as many details as possible so buyers understand the device
                condition and category.
            </p>

            {form.image_url && (
                <div className="mb-5 flex justify-center">
                    <img
                        src={form.image_url}
                        alt="Item"
                        className="w-40 h-40 object-cover rounded-lg shadow"
                    />
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
                {/* Title */}
                <div>
                    <label className="block text-sm font-medium mb-1">
                        Title <span className="text-red-500">*</span>
                    </label>
                    <input
                        name="title"
                        className="border rounded-lg w-full px-3 py-2 text-sm"
                        value={form.title}
                        onChange={handleChange}
                        placeholder="e.g., Used Dell Inspiron i5 Laptop"
                    />
                </div>

                {/* Device category + custom */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Device Category
                        </label>
                        <select
                            name="device_category"
                            className="border rounded-lg w-full px-3 py-2 text-sm"
                            value={form.device_category}
                            onChange={handleChange}
                        >
                            {DEVICE_CATEGORIES.map((c) => (
                                <option key={c} value={c}>
                                    {c}
                                </option>
                            ))}
                        </select>
                    </div>

                    {form.device_category === "Other" && (
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Custom Category Name
                            </label>
                            <input
                                name="custom_category"
                                className="border rounded-lg w-full px-3 py-2 text-sm"
                                value={form.custom_category}
                                onChange={handleChange}
                                placeholder="e.g., Industrial control unit"
                            />
                        </div>
                    )}
                </div>

                {/* Brand / Model */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Brand</label>
                        <input
                            name="brand"
                            className="border rounded-lg w-full px-3 py-2 text-sm"
                            value={form.brand}
                            onChange={handleChange}
                            placeholder="e.g., Dell, Samsung, Apple"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Model / Series
                        </label>
                        <input
                            name="model"
                            className="border rounded-lg w-full px-3 py-2 text-sm"
                            value={form.model}
                            onChange={handleChange}
                            placeholder="e.g., Inspiron 3511, Galaxy A52"
                        />
                    </div>
                </div>

                {/* Price / Stock / Age */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Price (₹) <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            name="price"
                            className="border rounded-lg w-full px-3 py-2 text-sm"
                            value={form.price}
                            onChange={handleChange}
                            min="0"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Quantity</label>
                        <input
                            type="number"
                            name="stock"
                            className="border rounded-lg w-full px-3 py-2 text-sm"
                            value={form.stock}
                            onChange={handleChange}
                            min="1"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Approx Age (years)
                        </label>
                        <input
                            type="number"
                            name="age_years"
                            className="border rounded-lg w-full px-3 py-2 text-sm"
                            value={form.age_years}
                            onChange={handleChange}
                            min="0"
                            step="0.5"
                        />
                    </div>
                </div>

                {/* Classification category + condition */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            E-waste Category
                        </label>
                        <select
                            name="category"
                            className="border rounded-lg w-full px-3 py-2 text-sm"
                            value={form.category}
                            onChange={handleChange}
                        >
                            <option value="reusable">Reusable</option>
                            <option value="recyclable">Recyclable</option>
                            <option value="hazardous">Hazardous</option>
                        </select>
                        <p className="text-[11px] text-gray-500 mt-1">
                            This is the environmental classification (from AI or manual
                            selection).
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Condition
                        </label>
                        <select
                            name="condition"
                            className="border rounded-lg w-full px-3 py-2 text-sm"
                            value={form.condition}
                            onChange={handleChange}
                        >
                            <option value="Good">Good</option>
                            <option value="Fair">Fair</option>
                            <option value="Poor">Poor</option>
                        </select>
                    </div>
                </div>

                {/* Description */}
                <div>
                    <label className="block text-sm font-medium mb-1">
                        Description (optional)
                    </label>
                    <textarea
                        name="description"
                        className="border rounded-lg w-full px-3 py-2 text-sm min-h-[80px]"
                        value={form.description}
                        onChange={handleChange}
                        placeholder="Add any additional details about issues, accessories included, battery backup, screen condition, etc."
                    />
                </div>

                {/* Tags */}
                <div>
                    <label className="block text-sm font-medium mb-1">
                        Tags (comma separated)
                    </label>
                    <input
                        name="tags"
                        className="border rounded-lg w-full px-3 py-2 text-sm"
                        value={form.tags.join(", ")}
                        onChange={handleChange}
                        placeholder="phone, samsung, 4GB RAM"
                    />
                    <p className="text-[11px] text-gray-500 mt-1">
                        Helps users find your item via search (e.g., &quot;i5&quot;,
                        &quot;8GB RAM&quot;, &quot;SSD&quot;).
                    </p>
                </div>

                <button
                    type="submit"
                    className="w-full bg-[#5a8807] text-white py-2.5 rounded-lg text-sm font-semibold hover:brightness-95"
                >
                    Post Listing
                </button>
            </form>
        </div>
    );
};

export default CreateListing;
