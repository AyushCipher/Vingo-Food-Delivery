import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import { MdDeliveryDining, MdKeyboardBackspace } from "react-icons/md";
import {
  FaMapMarkerAlt,
  FaCreditCard,
  FaMobileAlt,
  FaSearch,
  FaCrosshairs,
} from "react-icons/fa";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useNavigate } from "react-router-dom";
import { serverUrl } from "../App";
import useCurrentLocation from "../hooks/useCurrentLocation";
import { clearCart } from "../redux/userSlice";

const GEOAPIFY_API_KEY = "812d749999de462e9df7ca070383975b";

// Fix Leaflet default icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

function Recenter({ lat, lng }) {
  const map = useMap();
  useEffect(() => {
    if (lat && lng) {
      map.setView([lat, lng], 20, { animate: true });
    }
  }, [lat, lng, map]);
  return null;
}

export default function CheckoutPage() {
  const { cartItems, userData } = useSelector((s) => s.user);
  const dispatch = useDispatch();
  const {
    location,
    address,
    loading,
    error,
    getCurrentLocation,
    setLocation,
    reverseGeocode,
  } = useCurrentLocation();

  const [method, setMethod] = useState("cod");
  const [searchText, setSearchText] = useState(""); // 👈 input ke liye
  const navigate = useNavigate();

  // address hook se aaya → input me sync karo
  useEffect(() => {
    if (address) {
      setSearchText(address);
    }
  }, [address]);

  const subtotal = cartItems.reduce(
    (sum, i) => sum + Number(i.price) * Number(i.quantity),
    0
  );
  const deliveryFee = subtotal > 500 ? 0 : 40;
  const total = subtotal + deliveryFee;

  // 🔥 Forward Geocoding (Address → LatLng via Geoapify)
  const forwardGeocode = async (addr) => {
    if (typeof addr !== "string" || !addr.trim()) return;
    try {
      const res = await fetch(
        `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(
          addr
        )}&apiKey=${GEOAPIFY_API_KEY}`
      );
      const data = await res.json();
      if (data.features && data.features.length > 0) {
        const { lat, lon } = data.features[0].properties;
        const display_name = data.features[0].properties.formatted;

        setLocation({ lat, lng: lon });
        reverseGeocode(lat, lon);
        setSearchText(display_name); // 👈 input update
      }
    } catch (err) {
      console.error("Geoapify forward geocode failed:", err);
    }
  };

  // Marker drag
  const onDragEnd = (e) => {
    const { lat, lng } = e.target.getLatLng();
    setLocation({ lat, lng });
    reverseGeocode(lat, lng);
  };

  const handlePlaceOrder = async () => {
    try {
      // Step 1: Place order
      const res = await axios.post(
        `${serverUrl}/api/order/placeorder`,
        {
          address: {
            text: address,
            latitude: location.lat,
            longitude: location.lng,
          },
          paymentMethod: method,
          cartItems,
        },
        { withCredentials: true }
      );

      const orderId = res.data.orderId; // assume backend returns { order, razorpayOrder }

      if (method === "cod") {
        dispatch(clearCart());
        navigate("/order-placed");
      } else {
        // Step 2: Start Razorpay flow
        openRazorpay(orderId, res.data.razorOrder);
      }
    } catch (error) {
      console.error(error);
      alert("Order failed!");
    }
  };

  const openRazorpay = (orderId, razorpayOrder) => {
    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID, // Razorpay key id from env
      amount: razorpayOrder?.amount, // in paise
      currency: "INR",
      name: "Vingo",
      description: "Order Payment",
      order_id: razorpayOrder?.id,
      handler: async function (response) {
        try {
          // Step 3: Verify payment
          const verifyRes = await axios.post(
            `${serverUrl}/api/order/verify-razorpay`,
            {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderId,
            },
            { withCredentials: true }
          );

          console.log("Verify response:", verifyRes.data);
          dispatch(clearCart());
          navigate("/order-placed");
        } catch (err) {
          console.error("Payment verify failed", err);
          alert("Payment verification failed!");
        }
      },
      prefill: {
        name: userData?.name,
        email: userData?.email,
        contact: userData?.phone,
      },
      theme: {
        color: "#ff4d2d",
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  return (
    <div className="min-h-screen bg-[#fff9f6] flex items-center justify-center p-5 mb-5">
      {/* Back Button */}
      <div
        className="absolute top-[28px] left-[28px] z-[10]"
        onClick={() => navigate("/")}
      >
        <MdKeyboardBackspace className="w-[25px] h-[25px] text-[#ff4d2d]" />
      </div>

      <div className="w-full max-w-[900px] bg-white rounded-2xl shadow-xl p-6 space-y-6">
        <h1 className="text-2xl font-bold text-gray-800 mt-5">Checkout</h1>

        {/* Location Section */}
        <section>
          <h2 className="text-lg font-semibold mb-2 flex items-center gap-2 text-gray-800">
            <FaMapMarkerAlt className="text-[#ff4d2d]" /> Delivery Location
          </h2>

          {/* Input + Search + Current Location */}
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="flex-1 border border-gray-300 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff4d2d]"
              placeholder="Enter your delivery address"
            />
            <button
              onClick={() => forwardGeocode(searchText)}
              className="bg-[#ff4d2d] hover:bg-[#e64526] text-white px-3 py-2 rounded-lg flex items-center justify-center"
            >
              <FaSearch />
            </button>
            <button
              onClick={getCurrentLocation}
              className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg flex items-center justify-center"
              title="Use my current location"
            >
              <FaCrosshairs />
            </button>
          </div>

          {/* Map */}
          <div className="rounded-xl border overflow-hidden">
            <div className="h-64 w-full flex items-center justify-center">
              {loading ? (
                <p className="text-gray-500">Fetching current location...</p>
              ) : error ? (
                <p className="text-red-500">{error}</p>
              ) : location.lat && location.lng ? (
                <MapContainer
                  className="h-full w-full"
                  center={[location.lat, location.lng]}
                  zoom={17}
                  scrollWheelZoom={false}
                >
                  <TileLayer
                    attribution="&copy; OpenStreetMap contributors"
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <Recenter lat={location.lat} lng={location.lng} />
                  <Marker
                    position={[location.lat, location.lng]}
                    draggable
                    eventHandlers={{ dragend: onDragEnd }}
                  >
                    <Popup>Drag to adjust location</Popup>
                  </Marker>
                </MapContainer>
              ) : (
                <p className="text-gray-500">Location not available</p>
              )}
            </div>
          </div>
        </section>

        {/* Payment */}
        <section>
          <h2 className="text-lg font-semibold mb-3 text-gray-800">
            Payment Method
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* COD */}
            <button
              type="button"
              onClick={() => setMethod("cod")}
              className={`flex items-center gap-3 rounded-xl border p-4 text-left transition ${
                method === "cod"
                  ? "border-[#ff4d2d] bg-orange-50 shadow"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                <MdDeliveryDining className="text-green-600 text-xl" />
              </span>
              <div>
                <p className="font-medium text-gray-800">Cash on Delivery</p>
                <p className="text-xs text-gray-500">
                  Pay when your food arrives
                </p>
              </div>
            </button>

            {/* UPI + Card */}
            <button
              type="button"
              onClick={() => setMethod("online")}
              className={`flex items-center gap-3 rounded-xl border p-4 text-left transition ${
                method === "online"
                  ? "border-[#ff4d2d] bg-orange-50 shadow"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
                <FaMobileAlt className="text-purple-700 text-lg" />
              </span>
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                <FaCreditCard className="text-blue-700 text-lg" />
              </span>
              <div>
                <p className="font-medium text-gray-800">
                  UPI / Credit / Debit Card
                </p>
                <p className="text-xs text-gray-500">Pay securely online</p>
              </div>
            </button>
          </div>
        </section>

        {/* Order Summary */}
        <section>
          <h2 className="text-lg font-semibold mb-3 text-gray-800">
            Order Summary
          </h2>
          <div className="rounded-xl border bg-gray-50 p-4 space-y-2">
            {cartItems.map((it) => (
              <div
                key={it.id}
                className="flex justify-between text-sm text-gray-700"
              >
                <span>
                  {it.name} × {it.quantity}
                </span>
                <span>₹{(it.price * it.quantity).toFixed(2)}</span>
              </div>
            ))}
            <hr className="border-gray-200 my-2" />
            <div className="flex justify-between font-medium text-gray-800">
              <span>Subtotal</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-700">
              <span>Delivery Fee</span>
              <span>{deliveryFee === 0 ? "Free" : `₹${deliveryFee}`}</span>
            </div>
            <div className="flex justify-between text-lg font-bold text-[#ff4d2d] pt-2">
              <span>Total</span>
              <span>₹{total.toFixed(2)}</span>
            </div>
          </div>
        </section>

        <button
          className="w-full bg-[#ff4d2d] hover:bg-[#e64526] text-white py-3 rounded-xl font-semibold"
          onClick={handlePlaceOrder}
        >
          {method === "cod" ? "Place Order" : "Pay & Place Order"}
        </button>
      </div>
    </div>
  );
}
