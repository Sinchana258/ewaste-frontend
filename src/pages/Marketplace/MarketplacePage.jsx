// src/pages/Marketplace/MarketplacePage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { fetchListings } from "../api/listings";
import ListingCard from "../../components/ListingCard";
import { useAuth } from "../../hooks/useAuth";

const Marketplace = () => {
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");

    const { user, logout } = useAuth();

    useEffect(() => {
        const load = async () => {
            try {
                const data = await fetchListings();
                setListings(data || []);
            } catch (err) {
                console.error("Failed to load listings", err);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const categories = useMemo(
        () => [
            "all",
            ...Array.from(new Set(listings.map((l) => l.category))).filter(Boolean),
        ],
        [listings]
    );

    const filteredListings = useMemo(() => {
        let result =
            selectedCategory === "all"
                ? listings
                : listings.filter((l) => l.category === selectedCategory);

        if (searchTerm.trim()) {
            const term = searchTerm.toLowerCase();
            result = result.filter((l) =>
                (l.title || "").toLowerCase().includes(term)
            );
        }

        return result;
    }, [listings, selectedCategory, searchTerm]);

    if (loading) return <div className="p-6">Loading marketplace...</div>;

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            {/* Top Header + User Actions */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                        E-Waste Marketplace
                    </h1>
                    <p className="text-gray-600 mt-1 text-sm md:text-base max-w-lg">
                        Buy reusable electronics instead of sending them to landfills. Every
                        item sold extends device life and reduces e-waste. 🌱
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 md:justify-end">
                    {user && (
                        <span className="text-xs md:text-sm text-gray-600 mr-1">
                            Signed in as{" "}
                            <span className="font-semibold">{user.email}</span>
                        </span>
                    )}

                    <Link
                        to="/cart"
                        className="inline-flex items-center gap-2 bg-[#5a8807] text-white px-3 py-1.5 rounded-full text-xs md:text-sm hover:brightness-95"
                    >
                        View Cart
                    </Link>

                    <Link
                        to="/profile"
                        className="inline-flex items-center gap-2 bg-white border border-gray-300 text-gray-800 px-3 py-1.5 rounded-full text-xs md:text-sm hover:bg-gray-50"
                    >
                        Profile
                    </Link>

                    <button
                        onClick={logout}
                        className="inline-flex items-center gap-2 bg-red-500 text-white px-3 py-1.5 rounded-full text-xs md:text-sm hover:bg-red-600"
                    >
                        Logout
                    </button>
                </div>
            </div>

            {/* Small info banner */}
            <div className="mb-5 bg-[#F7FBEE] border border-[#E1F0C8] rounded-2xl px-4 py-3 text-xs md:text-sm text-gray-700">
                Listings shown here are user-posted reusable e-waste items. Always
                verify condition with the seller before finalising a purchase.
            </div>

            {/* Filters row */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
                <div className="flex items-center gap-3">
                    <label className="text-sm text-gray-600 whitespace-nowrap">
                        Category:
                    </label>
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="border rounded-lg px-2 py-1.5 text-sm bg-white"
                    >
                        {categories.map((cat) => (
                            <option key={cat} value={cat}>
                                {cat === "all" ? "All" : cat}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="flex items-center gap-2">
                    <input
                        type="text"
                        placeholder="Search by title…"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full sm:w-56 border rounded-lg px-3 py-1.5 text-sm bg-white"
                    />
                </div>
            </div>

            {/* Results meta */}
            <div className="flex items-center justify-between mb-3 text-xs text-gray-500">
                <span>
                    Showing{" "}
                    <span className="font-semibold">
                        {filteredListings.length}
                    </span>{" "}
                    item{filteredListings.length === 1 ? "" : "s"}
                </span>
            </div>

            {/* Grid */}
            {filteredListings.length === 0 ? (
                <p className="text-sm text-gray-600">
                    No items match your filters right now. Try clearing the search or
                    changing the category.
                </p>
            ) : (
                <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
                    {filteredListings
                        ?.filter(Boolean)
                        .map((listing) => (
                            <ListingCard
                                key={listing.id || listing._id}
                                listing={listing}
                            />
                        ))}
                </div>
            )}
        </div>
    );
};

export default Marketplace;
