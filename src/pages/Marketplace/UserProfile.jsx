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
        if (!form.name.trim()) {
            showToast({ message: "Please enter your name" });
            return;
        }

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

    const handleDeleteListing = async (listingIdRaw) => {
        const listingId = listingIdRaw;
        if (!window.confirm("Delete this listing?")) return;
        try {
            await deleteListing(listingId, email);
            setMyListings((prev) =>
                prev.filter(
                    (l) =>
                        l.id !== listingId &&
                        l._id !== listingId
                )
            );
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
        <div className="min-h-screen bg-gradient-to-b from-[#E2F0C9] to-[#f6faec] py-10 px-4">
            <div className="max-w-6xl mx-auto bg-white rounded-3xl shadow-2xl border border-[#e4f1cf] p-6 md:p-8 lg:p-10 text-base">
                {/* Top heading */}
                <div className="mb-6">
                    <h1 className="text-2xl md:text-3xl font-semibold text-gray-900">
                        My Account
                    </h1>
                    <p className="text-sm md:text-base text-gray-500 mt-1">
                        Manage your profile, orders, and marketplace listings.
                    </p>
                </div>

                <div className="grid gap-8 md:grid-cols-[260px,1fr]">
                    {/* LEFT SIDEBAR */}
                    <aside className="bg-[#F8FBF1] rounded-2xl p-5 flex flex-col gap-6 border border-[#e4f1cf]">
                        {/* Avatar + basic info */}
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-[#5a8807] text-white flex items-center justify-center text-2xl md:text-3xl font-semibold shadow-md">
                                {initials}
                            </div>
                            <div className="flex flex-col">
                                <span className="text-base md:text-lg font-semibold text-gray-900">
                                    {form.name || "Your Name"}
                                </span>
                                <span className="text-xs md:text-sm text-gray-500 break-all">
                                    {form.email}
                                </span>
                            </div>
                        </div>

                        {/* Quick stats */}
                        <div className="grid grid-cols-2 gap-3 text-xs md:text-sm">
                            <div className="rounded-xl bg-white border border-[#e4f1cf] p-3 flex flex-col gap-1">
                                <span className="flex items-center gap-1 text-gray-500">
                                    <FiPackage className="w-4 h-4" />
                                    Orders
                                </span>
                                <span className="text-lg font-semibold text-gray-900">
                                    {orderCount}
                                </span>
                            </div>
                            <div className="rounded-xl bg-white border border-[#e4f1cf] p-3 flex flex-col gap-1">
                                <span className="flex items-center gap-1 text-gray-500">
                                    <FiGrid className="w-4 h-4" />
                                    Listings
                                </span>
                                <span className="text-lg font-semibold text-gray-900">
                                    {myListings.length}
                                </span>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-3">
                            <button
                                type="button"
                                onClick={() => setIsEditing((prev) => !prev)}
                                className="inline-flex items-center justify-center gap-2 text-sm md:text-base px-4 py-2 rounded-full border border-gray-200 hover:bg-gray-50"
                            >
                                <FiEdit2 className="w-4 h-4" />
                                {isEditing ? "Cancel editing" : "Edit Profile"}
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

                        {/* Sidebar Nav */}
                        <nav className="mt-2 flex flex-col gap-2 text-sm md:text-base">
                            <button
                                onClick={() => setActiveTab("profile")}
                                className={`w-full inline-flex items-center justify-between px-3 py-2 rounded-xl transition ${activeTab === "profile"
                                        ? "bg-[#5a8807] text-white shadow-sm"
                                        : "bg-white text-gray-700 border border-[#e4f1cf] hover:bg-gray-50"
                                    }`}
                            >
                                <span className="inline-flex items-center gap-2">
                                    <FiUser className="w-4 h-4" />
                                    Profile
                                </span>
                            </button>

                            <button
                                onClick={() => setActiveTab("orders")}
                                className={`w-full inline-flex items-center justify-between px-3 py-2 rounded-xl transition ${activeTab === "orders"
                                        ? "bg-[#5a8807] text-white shadow-sm"
                                        : "bg-white text-gray-700 border border-[#e4f1cf] hover:bg-gray-50"
                                    }`}
                            >
                                <span className="inline-flex items-center gap-2">
                                    <FiPackage className="w-4 h-4" />
                                    Orders
                                </span>
                            </button>

                            <button
                                onClick={() => setActiveTab("listings")}
                                className={`w-full inline-flex items-center justify-between px-3 py-2 rounded-xl transition ${activeTab === "listings"
                                        ? "bg-[#5a8807] text-white shadow-sm"
                                        : "bg-white text-gray-700 border border-[#e4f1cf] hover:bg-gray-50"
                                    }`}
                            >
                                <span className="inline-flex items-center gap-2">
                                    <FiGrid className="w-4 h-4" />
                                    My Listings
                                </span>
                            </button>
                        </nav>
                    </aside>

                    {/* RIGHT MAIN CONTENT */}
                    <main className="space-y-6">
                        {/* Profile Tab */}
                        {activeTab === "profile" && (
                            <div className="bg-[#F8FBF1] rounded-2xl p-6 md:p-8 border border-[#e4f1cf] space-y-5">
                                <h2 className="text-xl md:text-2xl font-semibold text-gray-900 mb-2">
                                    Profile Information
                                </h2>

                                {!isEditing && (
                                    <div className="grid gap-5 md:grid-cols-2">
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

                                        <div className="md:col-span-2">
                                            <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">
                                                Address
                                            </p>
                                            <p className="text-base font-medium text-gray-900 whitespace-pre-wrap">
                                                {form.address || "Not set"}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {isEditing && (
                                    <div className="space-y-5">
                                        <div className="grid gap-4 md:grid-cols-2">
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
                            <div className="bg-[#F8FBF1] rounded-2xl p-6 md:p-8 border border-[#e4f1cf]">
                                <h2 className="text-xl md:text-2xl font-semibold text-gray-900 mb-4">
                                    Order History
                                </h2>

                                {orders.length === 0 ? (
                                    <p className="text-sm md:text-base text-gray-600">
                                        You haven&apos;t placed any orders yet.
                                    </p>
                                ) : (
                                    <div className="overflow-x-auto rounded-2xl border border-[#e4f1cf] bg-white">
                                        <table className="w-full text-sm md:text-base">
                                            <thead className="bg-gray-50 text-gray-700">
                                                <tr>
                                                    <th className="p-3 text-left">Order</th>
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
                                                    const oid = order.id || order._id || "";
                                                    return (
                                                        <tr
                                                            key={oid}
                                                            className="border-t border-[#eef4df] hover:bg-gray-50"
                                                        >
                                                            <td className="p-3 text-xs md:text-sm font-mono">
                                                                #{oid.slice(-6) || "-"}
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
                            <div className="bg-[#F8FBF1] rounded-2xl p-6 md:p-8 border border-[#e4f1cf]">
                                <h2 className="text-xl md:text-2xl font-semibold text-gray-900 mb-4">
                                    My Listings
                                </h2>

                                {myListings.length === 0 ? (
                                    <p className="text-sm md:text-base text-gray-600">
                                        You haven&apos;t posted any items yet.
                                    </p>
                                ) : (
                                    <div className="overflow-x-auto rounded-2xl border border-[#e4f1cf] bg-white">
                                        <table className="w-full text-sm md:text-base">
                                            <thead className="bg-gray-50 text-gray-700">
                                                <tr>
                                                    <th className="p-3 text-left">Item</th>
                                                    <th className="p-3 text-left">Price</th>
                                                    <th className="p-3 text-left">Stock</th>
                                                    <th className="p-3 text-left">Category</th>
                                                    <th className="p-3 text-left">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {myListings.map((listing) => {
                                                    const lid = listing.id || listing._id;
                                                    return (
                                                        <tr
                                                            key={lid}
                                                            className="border-t border-[#eef4df] hover:bg-gray-50"
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
                                                                    onClick={() => handleDeleteListing(lid)}
                                                                    className="text-xs md:text-sm px-3 py-1.5 rounded-full bg-red-100 text-red-700 hover:bg-red-200"
                                                                >
                                                                    Delete
                                                                </button>
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
                    </main>
                </div>
            </div>
        </div>
    );
};

export default UserProfile;
