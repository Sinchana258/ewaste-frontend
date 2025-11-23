// src/pages/Marketplace/UserProfile.jsx
import React, { useEffect, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../context/ToastContext";
import { fetchProfile, updateProfile } from "../api/user";
import { getOrdersByUser } from "../api/orders";
import { getMyListings, deleteListing } from "../api/listings";
import {
    FiUser,
    FiPackage,
    FiGrid,
    FiShoppingCart,
    FiEdit2,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const UserProfile = () => {
    const { user } = useAuth();
    const { showToast } = useToast();
    const navigate = useNavigate();
    const email = user?.email;

    const [form, setForm] = useState({
        email: "",
        name: "",
        phone: "",
        address: "",
    });

    const [orders, setOrders] = useState([]);
    const [myListings, setMyListings] = useState([]);
    const [orderCount, setOrderCount] = useState(0);

    const [activeTab, setActiveTab] = useState("profile"); // 'profile' | 'orders' | 'listings'
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!email) return;

        const loadAll = async () => {
            try {
                const [profileRes, ordersRes, listingsRes] = await Promise.all([
                    fetchProfile(email),
                    getOrdersByUser(email),
                    getMyListings(email),
                ]);

                if (profileRes) {
                    setForm((prev) => ({
                        ...prev,
                        email: profileRes.email || email,
                        name: profileRes.name || "",
                        phone: profileRes.phone || "",
                        address: profileRes.address || "",
                    }));
                } else {
                    setForm((prev) => ({ ...prev, email }));
                }

                setOrders(ordersRes || []);
                setOrderCount(ordersRes?.length || 0);
                setMyListings(listingsRes || []);
            } catch (err) {
                console.error("Failed to load profile/orders/listings:", err);
                showToast({ message: "Failed to load profile data" });
            } finally {
                setLoading(false);
            }
        };

        loadAll();
    }, [email, showToast]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            await updateProfile(form);
            showToast({ message: "Profile updated successfully" });
            setIsEditing(false);
        } catch (err) {
            console.error("Profile update failed:", err);
            showToast({ message: "Failed to update profile" });
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteListing = async (listingId) => {
        if (!window.confirm("Delete this listing?")) return;
        try {
            await deleteListing(listingId, email);
            setMyListings((prev) => prev.filter((l) => l.id !== listingId));
            showToast({ message: "Listing deleted" });
        } catch (err) {
            console.error("Failed to delete listing:", err);
            showToast({ message: "Failed to delete listing" });
        }
    };

    const initials = (() => {
        if (form.name && form.name.trim()) {
            const parts = form.name.trim().split(" ");
            const first = parts[0]?.[0] ?? "";
            const second = parts[1]?.[0] ?? "";
            return (first + second).toUpperCase();
        }
        if (email) return email[0].toUpperCase();
        return "?";
    })();

    if (!email) {
        return (
            <div className="min-h-screen bg-[#E2F0C9] flex items-center justify-center px-4">
                <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center text-base">
                    Please sign in to view your profile.
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-[#E2F0C9] flex items-center justify-center px-4">
                <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center text-base">
                    Loading profile...
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#E2F0C9] py-10 px-4">
            <div className="max-w-5xl mx-auto bg-white rounded-3xl shadow-2xl p-8 md:p-10 text-base">
                {/* Header: avatar + name + stats + actions */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 border-b pb-6">
                    <div className="flex items-center gap-4">
                        <div className="w-20 h-20 rounded-full bg-[#5a8807] text-white flex items-center justify-center text-3xl font-semibold shadow-md">
                            {initials}
                        </div>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-semibold text-gray-900">
                                {form.name || "Your Name"}
                            </h1>
                            <p className="text-sm md:text-base text-gray-500 break-all">
                                {form.email}
                            </p>

                            <div className="flex flex-wrap gap-3 mt-3 text-xs md:text-sm">
                                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#F4F8E8] text-gray-700">
                                    <FiPackage className="w-4 h-4" />
                                    {orderCount} orders
                                </span>
                                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#F4F8E8] text-gray-700">
                                    <FiGrid className="w-4 h-4" />
                                    {myListings.length} listings
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col items-stretch gap-3 w-full md:w-auto md:items-end">
                        <button
                            type="button"
                            onClick={() => setIsEditing((prev) => !prev)}
                            className="inline-flex items-center justify-center gap-2 text-sm md:text-base px-4 py-2 rounded-full border border-gray-200 hover:bg-gray-50"
                        >
                            <FiEdit2 className="w-4 h-4" />
                            {isEditing ? "Cancel" : "Edit Profile"}
                        </button>

                        <button
                            type="button"
                            onClick={() => navigate("/cart")}
                            className="inline-flex items-center justify-center gap-2 text-sm md:text-base px-4 py-2 rounded-full bg-[#5a8807] text-white hover:brightness-95"
                        >
                            <FiShoppingCart className="w-4 h-4" />
                            View Cart
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="mt-6 border-b flex gap-8 text-sm md:text-base">
                    <button
                        onClick={() => setActiveTab("profile")}
                        className={`pb-3 -mb-px border-b-2 transition ${activeTab === "profile"
                            ? "border-[#5a8807] text-[#5a8807] font-semibold"
                            : "border-transparent text-gray-500 hover:text-gray-800"
                            }`}
                    >
                        <span className="inline-flex items-center gap-2">
                            <FiUser className="w-4 h-4" />
                            Profile
                        </span>
                    </button>

                    <button
                        onClick={() => setActiveTab("orders")}
                        className={`pb-3 -mb-px border-b-2 transition ${activeTab === "orders"
                            ? "border-[#5a8807] text-[#5a8807] font-semibold"
                            : "border-transparent text-gray-500 hover:text-gray-800"
                            }`}
                    >
                        <span className="inline-flex items-center gap-2">
                            <FiPackage className="w-4 h-4" />
                            Orders
                        </span>
                    </button>

                    <button
                        onClick={() => setActiveTab("listings")}
                        className={`pb-3 -mb-px border-b-2 transition ${activeTab === "listings"
                            ? "border-[#5a8807] text-[#5a8807] font-semibold"
                            : "border-transparent text-gray-500 hover:text-gray-800"
                            }`}
                    >
                        <span className="inline-flex items-center gap-2">
                            <FiGrid className="w-4 h-4" />
                            My Listings
                        </span>
                    </button>
                </div>

                {/* Tab Content */}
                <div className="mt-6">
                    {/* Profile Tab */}
                    {activeTab === "profile" && (
                        <div className="bg-[#F8FBF1] rounded-2xl p-6 md:p-8 space-y-5">
                            {!isEditing && (
                                <>
                                    <div>
                                        <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">
                                            Full Name
                                        </p>
                                        <p className="text-base font-medium text-gray-900">
                                            {form.name || "Not set"}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">
                                            Email
                                        </p>
                                        <p className="text-base font-medium text-gray-900 break-all">
                                            {form.email}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">
                                            Phone
                                        </p>
                                        <p className="text-base font-medium text-gray-900">
                                            {form.phone || "Not set"}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">
                                            Address
                                        </p>
                                        <p className="text-base font-medium text-gray-900 whitespace-pre-wrap">
                                            {form.address || "Not set"}
                                        </p>
                                    </div>
                                </>
                            )}

                            {isEditing && (
                                <div className="space-y-5">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-600 mb-1">
                                            Full Name
                                        </label>
                                        <input
                                            name="name"
                                            className="w-full border rounded-xl px-3 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-[#5a8807] focus:border-[#5a8807]"
                                            value={form.name || ""}
                                            onChange={handleChange}
                                            placeholder="Your name"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-gray-600 mb-1">
                                            Email
                                        </label>
                                        <input
                                            disabled
                                            className="w-full border rounded-xl px-3 py-2.5 text-base bg-gray-100 cursor-not-allowed text-gray-500"
                                            value={form.email}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-gray-600 mb-1">
                                            Phone
                                        </label>
                                        <input
                                            name="phone"
                                            className="w-full border rounded-xl px-3 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-[#5a8807] focus:border-[#5a8807]"
                                            value={form.phone || ""}
                                            onChange={handleChange}
                                            placeholder="+91 9876543210"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-gray-600 mb-1">
                                            Address
                                        </label>
                                        <textarea
                                            name="address"
                                            className="w-full border rounded-xl px-3 py-2.5 text-base min-h-[90px] resize-y focus:outline-none focus:ring-2 focus:ring-[#5a8807] focus:border-[#5a8807]"
                                            value={form.address || ""}
                                            onChange={handleChange}
                                            placeholder="House no, Street, Area, City, Pincode"
                                        />
                                    </div>

                                    <button
                                        type="button"
                                        onClick={handleSave}
                                        disabled={saving}
                                        className="inline-flex items-center justify-center px-6 py-2.5 rounded-full bg-[#5a8807] text-white text-sm md:text-base font-semibold hover:brightness-95 disabled:opacity-60"
                                    >
                                        {saving ? "Saving..." : "Save Changes"}
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Orders Tab */}
                    {activeTab === "orders" && (
                        <div className="bg-[#F8FBF1] rounded-2xl p-6 md:p-8">
                            <h2 className="text-xl md:text-2xl font-semibold text-gray-900 mb-4">
                                Order History
                            </h2>

                            {orders.length === 0 ? (
                                <p className="text-sm md:text-base text-gray-600">
                                    You haven&apos;t placed any orders yet.
                                </p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm md:text-base border rounded-xl overflow-hidden">
                                        <thead className="bg-gray-100 text-gray-700">
                                            <tr>
                                                <th className="p-3 text-left">Order ID</th>
                                                <th className="p-3 text-left">Items</th>
                                                <th className="p-3 text-left">Total</th>
                                                <th className="p-3 text-left">Status</th>
                                                <th className="p-3 text-left">Date</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {orders.map((order) => {
                                                const date = order.created_at
                                                    ? new Date(order.created_at)
                                                    : null;
                                                return (
                                                    <tr
                                                        key={order.id}
                                                        className="border-t hover:bg-white"
                                                    >
                                                        <td className="p-3 text-xs md:text-sm font-mono">
                                                            #{order.id?.slice(-6) || "-"}
                                                        </td>
                                                        <td className="p-3 align-top">
                                                            {order.items?.map((i, idx) => (
                                                                <div key={idx} className="text-xs md:text-sm">
                                                                    {i.title} × {i.quantity}
                                                                </div>
                                                            ))}
                                                        </td>
                                                        <td className="p-3 font-semibold text-green-700">
                                                            ₹{order.total_amount}
                                                        </td>
                                                        <td className="p-3 text-xs md:text-sm capitalize">
                                                            {order.status || "pending"}
                                                        </td>
                                                        <td className="p-3 text-xs md:text-sm">
                                                            {date ? date.toLocaleDateString() : "-"}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Listings Tab */}
                    {activeTab === "listings" && (
                        <div className="bg-[#F8FBF1] rounded-2xl p-6 md:p-8">
                            <h2 className="text-xl md:text-2xl font-semibold text-gray-900 mb-4">
                                My Listings
                            </h2>

                            {myListings.length === 0 ? (
                                <p className="text-sm md:text-base text-gray-600">
                                    You haven&apos;t posted any items yet.
                                </p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm md:text-base border rounded-xl overflow-hidden">
                                        <thead className="bg-gray-100 text-gray-700">
                                            <tr>
                                                <th className="p-3 text-left">Item</th>
                                                <th className="p-3 text-left">Price</th>
                                                <th className="p-3 text-left">Stock</th>
                                                <th className="p-3 text-left">Category</th>
                                                <th className="p-3 text-left">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {myListings.map((listing) => (
                                                <tr
                                                    key={listing.id}
                                                    className="border-t hover:bg-white"
                                                >
                                                    <td className="p-3">
                                                        <div className="flex items-center gap-3">
                                                            {listing.image_url && (
                                                                <img
                                                                    src={listing.image_url}
                                                                    alt={listing.title}
                                                                    className="w-12 h-12 object-cover rounded-lg border"
                                                                />
                                                            )}
                                                            <span className="font-medium">
                                                                {listing.title}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="p-3 font-semibold text-green-700">
                                                        ₹{listing.price}
                                                    </td>
                                                    <td className="p-3">{listing.stock}</td>
                                                    <td className="p-3 capitalize">
                                                        {listing.category}
                                                    </td>
                                                    <td className="p-3">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDeleteListing(listing.id)}
                                                            className="text-xs md:text-sm px-3 py-1.5 rounded-full bg-red-100 text-red-700 hover:bg-red-200"
                                                        >
                                                            Delete
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserProfile;
