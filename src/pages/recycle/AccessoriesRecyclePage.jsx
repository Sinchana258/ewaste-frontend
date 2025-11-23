// src/pages/recycle/AccessoriesRecyclePage.jsx
import React, { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { facility } from "../../data/facility";

/**
 * Decorative asset uploaded earlier — use exact local path (we'll transform to URL in dev environment).
 * Developer note: provided local path will be served by the environment: /mnt/data/31139e21-fece-4d9c-abef-f65c1c8bd0d0.png
 */
const LOGO_URL = "/mnt/data/31139e21-fece-4d9c-abef-f65c1c8bd0d0.png";

const ACCESSORY_CATEGORIES = [
  {
    category: "Headphones",
    items: [
      "Sony WH-1000XM4",
      "Bose QuietComfort 35 II",
      "AirPods Pro",
      "Sennheiser HD 660 S",
      "JBL Free X",
    ],
  },
  {
    category: "Chargers",
    items: [
      "Anker PowerPort",
      "Belkin Boost Charge",
      "Apple 20W USB-C Power Adapter",
      "Samsung Super Fast Charger",
      "RAVPower 60W 6-Port USB Charger",
    ],
  },
  {
    category: "Laptop Bags",
    items: [
      "SwissGear Travel Gear 1900 Scansmart TSA Laptop Backpack",
      "AmazonBasics Laptop Backpack",
      "Targus Drifter II Backpack",
      "KROSER Laptop Backpack",
      "Matein Travel Laptop Backpack",
    ],
  },
  {
    category: "External Hard Drives",
    items: [
      "WD Black 5TB P10 Game Drive",
      "Seagate Backup Plus Slim 2TB",
      "Samsung T5 Portable SSD",
      "LaCie Rugged Mini 4TB",
      "Toshiba Canvio Basics 1TB",
    ],
  },
  {
    category: "Smartwatches",
    items: [
      "Apple Watch Series 7",
      "Samsung Galaxy Watch 4",
      "Fitbit Charge 5",
      "Garmin Venu 2",
      "Amazfit GTR 3",
    ],
  },
  {
    category: "Mouse and Keyboards",
    items: [
      "Logitech MX Master 3",
      "Razer DeathAdder Elite",
      "Apple Magic Keyboard",
      "Corsair K95 RGB Platinum XT",
      "HP Wireless Elite Keyboard",
    ],
  },
  {
    category: "Power Banks",
    items: [
      "Anker PowerCore 26800mAh",
      "RAVPower Portable Charger 20000mAh",
      "Xiaomi Mi Power Bank 3",
      "AUKEY Portable Charger 10000mAh",
      "Samsung Wireless Charger Portable Battery 10,000mAh",
    ],
  },
];

// Try to import a shared axiosInstance; fallback to default axios if not available.
let axiosInstance = axios;
try {
  // eslint-disable-next-line import/no-unresolved
  // If you have src/utils/axiosInstance.js, it should export a configured axios instance.
  // The `try/catch` ensures this file still works if that module doesn't exist.
  // You can remove this fallback if you always have axiosInstance present.
  // Note: bundlers may still tree-shake; this pattern is tolerant in dev.
  // If you prefer, simply `import axiosInstance from "../../utils/axiosInstance";`
  // but the try/catch prevents a hard import failure.
  // eslint-disable-next-line global-require
  const maybe = require("../../utils/axiosInstance");
  if (maybe && maybe.default) axiosInstance = maybe.default;
  else if (maybe) axiosInstance = maybe;
} catch {
  // use default axios
}

const AccessoriesRecyclePage = () => {
  const location = useLocation();
  const mountedRef = useRef(true);

  // Prefill category from router state (SlotSchedulingPage passes `state={{ selectedCategory }}`)
  const initialCategory = location?.state?.selectedCategory || "";

  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedItem, setSelectedItem] = useState("");
  const [selectedFacility, setSelectedFacility] = useState("");
  const [recycleItemPrice, setRecycleItemPrice] = useState("");
  const [pickupDate, setPickupDate] = useState("");
  const [pickupTime, setPickupTime] = useState("");
  const [address, setAddress] = useState("");

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [lastBookingSummary, setLastBookingSummary] = useState(null);

  const currentDate = new Date().toISOString().split("T")[0];

  useEffect(() => {
    // populate items if initial category provided
    if (initialCategory) {
      const found = ACCESSORY_CATEGORIES.find((c) => c.category === initialCategory);
      setItems(found ? found.items : []);
    }
    return () => {
      mountedRef.current = false;
    };
  }, [initialCategory]);

  const handleCategoryChange = (e) => {
    const category = e.target.value;
    setSelectedCategory(category);
    setSelectedItem("");
    setSelectedFacility("");

    const found = ACCESSORY_CATEGORIES.find((c) => c.category === category);
    setItems(found ? found.items : []);
  };

  // basic validation helpers
  const validateEmail = (str) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(str).toLowerCase());

  const validatePhone = (str) =>
    // allow +91 or 10 digit local numbers; adapt as needed
    /^(\+?\d{1,3}[- ]?)?\d{10}$/.test(String(str));

  const handleSubmit = async () => {
    const recycleItem = `${selectedCategory} ${selectedItem}`.trim();

    if (
      !recycleItem ||
      !selectedFacility ||
      !recycleItemPrice ||
      !pickupDate ||
      !pickupTime ||
      !fullName ||
      !email ||
      !phone ||
      !address
    ) {
      toast.error("Please fill in all the required fields.", { autoClose: 3000 });
      return;
    }

    if (!validateEmail(email)) {
      toast.error("Please enter a valid email address.", { autoClose: 3000 });
      return;
    }

    if (!validatePhone(phone)) {
      toast.error("Please enter a valid phone number (10 digits).", {
        autoClose: 3000,
      });
      return;
    }

    const storedUser = (() => {
      try {
        return JSON.parse(localStorage.getItem("user"));
      } catch {
        return null;
      }
    })();

    const userId = storedUser?.id || "";

    const newBooking = {
      userId,
      userEmail: email,
      recycleItem,
      recycleItemPrice: Number(recycleItemPrice),
      pickupDate,
      pickupTime,
      facility: selectedFacility,
      fullName,
      address,
      phone,
    };

    try {
      setIsLoading(true);

      // Use axiosInstance if available; otherwise default to axios
      const resp = await axiosInstance.post(
        `${process.env.REACT_APP_API_BASE || "http://localhost:8000"}/api/v1/booking`,
        newBooking,
        {
          headers: {
            "Content-Type": "application/json",
            // optionally include Authorization if you issue bearer tokens:
            // Authorization: `Bearer ${localStorage.getItem("access_token") || ""}`
          },
          timeout: 15000,
        }
      );

      if (resp.status >= 200 && resp.status < 300) {
        const summary = {
          recycleItem,
          pickupDate,
          pickupTime,
          facility: selectedFacility,
          address,
          userEmail: email,
        };

        setLastBookingSummary(summary);
        setShowSuccessModal(true);

        toast.success("Booking confirmed! A confirmation email has been sent.", {
          autoClose: 3000,
        });

        // Clear form fields
        setSelectedFacility("");
        setRecycleItemPrice("");
        setPickupDate("");
        setPickupTime("");
        setAddress("");
        setFullName("");
        setEmail("");
        setPhone("");
        setSelectedCategory("");
        setSelectedItem("");
        setItems([]);
      } else {
        console.error("Booking error response:", resp);
        toast.error("Error submitting data. Please try again.", { autoClose: 3000 });
      }
    } catch (err) {
      console.error("Submit error:", err);
      const msg =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        "Error submitting data. Please try again.";
      toast.error(msg, { autoClose: 4000 });
    } finally {
      if (mountedRef.current) setIsLoading(false);
    }
  };

  // Submit handler used by onSubmit
  const onSubmit = (e) => {
    e.preventDefault();
    handleSubmit();
  };

  return (
    <div className="container mx-auto p-6 md:p-8">
      <ToastContainer />
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="flex items-center gap-4 p-6 border-b">
          <div className="w-16 h-16 rounded-full bg-[#E2F0C9] p-2 flex items-center justify-center">
            <img
              src={LOGO_URL}
              alt="Ecycle logo"
              className="w-full h-full object-contain"
              aria-hidden="true"
            />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Accessories Recycling</h1>
            <p className="text-sm text-gray-600">
              Schedule a pickup for your accessories — headphones, chargers, power banks, and more.
            </p>
          </div>
        </div>

        <form className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6" onSubmit={onSubmit}>
          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="fullName">
              Full name <span className="text-red-500">*</span>
            </label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#5a8807]"
              placeholder="Jane Doe"
              aria-required="true"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#5a8807]"
              placeholder="you@example.com"
              aria-required="true"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="category">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              id="category"
              value={selectedCategory}
              onChange={handleCategoryChange}
              className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#5a8807]"
              aria-required="true"
            >
              <option value="">Select category</option>
              {ACCESSORY_CATEGORIES.map((c) => (
                <option key={c.category} value={c.category}>
                  {c.category}
                </option>
              ))}
            </select>
          </div>

          {/* Item */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="item">
              Item <span className="text-red-500">*</span>
            </label>
            <select
              id="item"
              value={selectedItem}
              onChange={(e) => setSelectedItem(e.target.value)}
              className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#5a8807]"
              aria-required="true"
              disabled={!items.length}
            >
              <option value="">{items.length ? "Select item" : "Choose a category first"}</option>
              {items.map((it) => (
                <option key={it} value={it}>
                  {it}
                </option>
              ))}
            </select>
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="price">
              Approx value (₹) <span className="text-red-500">*</span>
            </label>
            <input
              id="price"
              name="price"
              type="number"
              min="0"
              value={recycleItemPrice}
              onChange={(e) => setRecycleItemPrice(e.target.value)}
              className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#5a8807]"
              placeholder="100"
              aria-required="true"
            />
          </div>

          {/* Pickup Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="pickupDate">
              Pickup date <span className="text-red-500">*</span>
            </label>
            <input
              id="pickupDate"
              name="pickupDate"
              type="date"
              min={currentDate}
              value={pickupDate}
              onChange={(e) => setPickupDate(e.target.value)}
              className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#5a8807]"
              aria-required="true"
            />
          </div>

          {/* Pickup Time */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="pickupTime">
              Pickup time <span className="text-red-500">*</span>
            </label>
            <input
              id="pickupTime"
              name="pickupTime"
              type="time"
              value={pickupTime}
              onChange={(e) => setPickupTime(e.target.value)}
              className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#5a8807]"
              aria-required="true"
            />
          </div>

          {/* Address */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="address">
              Pickup address <span className="text-red-500">*</span>
            </label>
            <input
              id="address"
              name="address"
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#5a8807]"
              placeholder="House no, street, area, city"
              aria-required="true"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="phone">
              Phone <span className="text-red-500">*</span>
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#5a8807]"
              placeholder="+911234567890 or 1234567890"
              aria-required="true"
            />
          </div>

          {/* Facility */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="facility">
              Facility <span className="text-red-500">*</span>
            </label>
            <select
              id="facility"
              name="facility"
              value={selectedFacility}
              onChange={(e) => setSelectedFacility(e.target.value)}
              className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#5a8807]"
              aria-required="true"
            >
              <option value="">Select facility</option>
              {facility.map((f) => (
                <option key={f.name} value={f.name}>
                  {f.name} — {f.address}
                </option>
              ))}
            </select>
          </div>

          {/* Submit area */}
          <div className="md:col-span-2 mt-2">
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full inline-flex items-center justify-center gap-3 rounded-md px-4 py-3 text-white font-medium transition ${isLoading ? "bg-gray-400 cursor-not-allowed" : "bg-[#5a8807] hover:bg-[#86c418]"
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#5a8807]`}
              aria-disabled={isLoading}
              aria-busy={isLoading}
            >
              {isLoading ? (
                <>
                  <svg
                    className="w-5 h-5 animate-spin"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    />
                  </svg>
                  Submitting...
                </>
              ) : (
                "Schedule Pickup"
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Success modal */}
      {showSuccessModal && lastBookingSummary && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="booking-confirmation-title"
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4"
        >
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-auto p-6">
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
                <span className="text-3xl">✅</span>
              </div>

              <h2 id="booking-confirmation-title" className="text-xl font-semibold text-gray-800">
                Booking Confirmed!
              </h2>

              <p className="text-sm text-gray-600 text-center">
                A confirmation email has been sent to{" "}
                <span className="font-medium">{lastBookingSummary.userEmail}</span>.
              </p>

              <div className="w-full bg-gray-50 rounded-xl p-4 text-sm space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium text-gray-700">Item</span>
                  <span className="text-gray-800">{lastBookingSummary.recycleItem}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-700">Slot</span>
                  <span className="text-gray-800">
                    {lastBookingSummary.pickupDate} at {lastBookingSummary.pickupTime}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-700">Facility</span>
                  <span className="text-gray-800">{lastBookingSummary.facility}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Pickup Address</span>
                  <p className="text-gray-800 text-right">{lastBookingSummary.address}</p>
                </div>
              </div>

              <button
                onClick={() => setShowSuccessModal(false)}
                className="w-full bg-[#5a8807] hover:bg-[#86c418] text-white font-semibold py-2.5 rounded-xl transition-colors"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccessoriesRecyclePage;
