import React, { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import axios from "axios";
import { serverUrl } from "../App";
import UserDeliveryTracking from "../components/userDeliveryTracking";
import { MdKeyboardBackspace, MdLocationOn, MdPhone } from "react-icons/md";
import { ClipLoader } from "react-spinners";
import { toast } from "react-toastify";

const PRIMARY = "#ff4d2d";

export default function TrackOrderPage() {
  const { orderId } = useParams();
  const [searchParams] = useSearchParams();
  const shopOrderIdFilter = searchParams.get("shopOrderId"); // Optional filter
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  /* ---------------- Fetch Order ---------------- */
  const fetchOrder = async () => {
    try {
      const res = await axios.get(`${serverUrl}/api/order/${orderId}`, {
        withCredentials: true,
      });

      if (res.data.success) {
        setOrder(res.data.order);
      }
    } catch (err) {
      toast.error("Failed to fetch order", { position: "top-right" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
    const i = setInterval(fetchOrder, 5000);
    return () => clearInterval(i);
  }, [orderId]);

  /* ---------------- Loading ---------------- */
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <ClipLoader size={45} color={PRIMARY} />
        <p className="mt-4 text-gray-600 font-medium">Loading order...</p>
      </div>
    );
  }

  if (!order) return null;

  // Filter shop orders if specific shopOrderId is provided
  const shopOrdersToShow = shopOrderIdFilter
    ? order.shopOrders.filter((so) => so._id === shopOrderIdFilter)
    : order.shopOrders;

  /* ---------------- UI ---------------- */
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fff1eb] to-[#fff9f6] px-4 py-6">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center gap-4">
          <button onClick={() => navigate("/my-orders")}>
            <MdKeyboardBackspace className="text-[#ff4d2d]" size={26} />
          </button>
          <h1 className="text-2xl font-bold text-gray-800">
            Track Order
          </h1>
        </div>

        {/* Shop Orders */}
        {shopOrdersToShow.map((shopOrder) => (
          <div
            key={shopOrder._id}
            className="bg-white rounded-3xl shadow-md border p-5 space-y-4"
          >
            {/* Shop Info */}
            <div>
              <h2 className="text-lg font-bold text-[#ff4d2d]">
                {shopOrder.shop?.name}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                <strong>Items:</strong>{" "}
                {shopOrder.items.map((i) => i.name).join(", ")}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Subtotal:</strong> ₹{shopOrder.subtotal}
              </p>
            </div>

            {/* Address */}
            <div className="flex gap-2 text-sm text-gray-600">
              <MdLocationOn size={16} />
              {order.address?.text}
            </div>

            {/* Status */}
            {shopOrder.status === "delivered" ? (
              <div className="text-green-600 font-semibold text-lg">
                Delivered ✅
              </div>
            ) : (
              <>
                {/* Delivery Boy Info */}
                <div className="border rounded-xl p-3 bg-gray-50">
                  <h3 className="font-semibold text-gray-800 mb-2">
                    Delivery Partner
                  </h3>

                  {shopOrder.assignedDeliveryBoy ? (
                    <div className="text-sm text-gray-700 space-y-1">
                      <p>
                        <strong>Name:</strong>{" "}
                        {shopOrder.assignedDeliveryBoy.fullName}
                      </p>
                      <p className="flex items-center gap-1">
                        <MdPhone size={14} />
                        {shopOrder.assignedDeliveryBoy.mobile}
                      </p>
                    </div>
                  ) : (
                    <p className="text-gray-500 italic">
                      Delivery partner not assigned yet
                    </p>
                  )}
                </div>

                {/* Map */}
                {shopOrder.assignedDeliveryBoy && (
                  <div className="h-[380px] w-full rounded-2xl overflow-hidden shadow-md border">
                    <UserDeliveryTracking
                      orderId={order._id}
                      shopOrderId={shopOrder._id}
                      userLocation={{
                        lat: Number(order.address.latitude),
                        lng: Number(order.address.longitude),
                      }}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
