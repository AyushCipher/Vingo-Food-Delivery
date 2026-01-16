import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { MdKeyboardBackspace } from "react-icons/md";
import { ClipLoader } from "react-spinners";
import { toast } from "react-toastify";

import { serverUrl } from "../App";
import { setMyOrders } from "../redux/userSlice";

/* ---------------- Helpers ---------------- */

const formatDate = (dateString) =>
  new Date(dateString).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

const capitalizeFirst = (text = "") =>
  text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();

const statusStyle = (status = "") => {
  const s = status.toLowerCase();
  if (s === "delivered")
    return "bg-green-100 text-green-700 border-green-200";
  if (s === "pending")
    return "bg-yellow-100 text-yellow-700 border-yellow-200";
  if (s === "cancelled")
    return "bg-red-100 text-red-700 border-red-200";
  if (s === "out_for_delivery")
    return "bg-blue-100 text-blue-700 border-blue-200";
  if (s === "preparing")
    return "bg-purple-100 text-purple-700 border-purple-200";
  return "bg-gray-100 text-gray-700 border-gray-200";
};

// Get overall order status based on all shop orders
const getOverallStatus = (shopOrders = []) => {
  if (!shopOrders.length) return "pending";
  
  const allDelivered = shopOrders.every(so => so.status === "delivered");
  if (allDelivered) return "delivered";
  
  const anyDelivered = shopOrders.some(so => so.status === "delivered");
  const anyOutForDelivery = shopOrders.some(so => so.status === "out_for_delivery");
  
  if (anyDelivered && (anyOutForDelivery || shopOrders.some(so => so.status !== "delivered"))) {
    return "partially_delivered";
  }
  
  if (anyOutForDelivery) return "out_for_delivery";
  
  const anyPreparing = shopOrders.some(so => so.status === "preparing");
  if (anyPreparing) return "preparing";
  
  return "pending";
};

// Format status for display
const formatStatus = (status) => {
  const map = {
    pending: "Pending",
    preparing: "Preparing",
    out_for_delivery: "Out for Delivery",
    delivered: "Delivered",
    partially_delivered: "Partially Delivered",
    cancelled: "Cancelled"
  };
  return map[status] || capitalizeFirst(status);
};

/* ================================================= */

export default function MyOrders() {
  const { myOrders, socket } = useSelector((state) => state.user);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  /* ---------------- Fetch Orders ---------------- */
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await axios.get(`${serverUrl}/api/order/getmy`, {
          withCredentials: true,
        });

        if (res.data.success) {
          dispatch(setMyOrders(res.data.orders));
          toast.success("Orders loaded successfully", {
            position: "top-right",
          });
        }
      } catch (error) {
        toast.error("Failed to load orders", {
          position: "top-right",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [dispatch]);

  /* ---------------- Socket Updates ---------------- */
  useEffect(() => {
    if (!socket) return;

    const handleStatusUpdate = async (data) => {
      console.log("📦 Socket received status update:", data);
      
      // Re-fetch orders to get fresh data (avoids stale closure issues)
      try {
        const res = await axios.get(`${serverUrl}/api/order/getmy`, {
          withCredentials: true,
        });
        if (res.data.success) {
          dispatch(setMyOrders(res.data.orders));
        }
      } catch (err) {
        console.error("Failed to refresh orders:", err);
      }

      toast.info("Order status updated", {
        position: "top-right",
      });
    };

    const handleDeliveryCompleted = async (data) => {
      console.log("✅ Socket received delivery completed:", data);
      
      // Re-fetch orders to get fresh data
      try {
        const res = await axios.get(`${serverUrl}/api/order/getmy`, {
          withCredentials: true,
        });
        if (res.data.success) {
          dispatch(setMyOrders(res.data.orders));
        }
      } catch (err) {
        console.error("Failed to refresh orders:", err);
      }

      toast.success("🎉 Order delivered successfully!", {
        position: "top-right",
      });
    };

    socket.on("orders:statusUpdated", handleStatusUpdate);
    socket.on("delivery:completed", handleDeliveryCompleted);

    return () => {
      socket.off("orders:statusUpdated", handleStatusUpdate);
      socket.off("delivery:completed", handleDeliveryCompleted);
    };
  }, [socket, dispatch]);

  /* ---------------- Loading ---------------- */
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#fff1eb] to-[#fff9f6]">
        <ClipLoader size={50} color="#ff4d2d" />
        <p className="mt-4 text-gray-600 font-medium">
          Loading your orders...
        </p>
      </div>
    );
  }

  /* ---------------- Empty Orders ---------------- */
if (myOrders?.length === 0) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#fff1eb] via-[#fff9f6] to-[#ffe5dd] px-4">
      
      {/* Card */}
      <div className="bg-white rounded-3xl shadow-xl max-w-md w-full text-center px-8 py-10 relative overflow-hidden">

        {/* Decorative blur */}
        <div className="absolute -top-24 -right-24 w-56 h-56 bg-orange-200 rounded-full blur-3xl opacity-40" />
        <div className="absolute -bottom-24 -left-24 w-56 h-56 bg-pink-200 rounded-full blur-3xl opacity-40" />

        {/* Illustration */}
        <div className="relative z-10">
          <div className="w-28 h-28 mx-auto mb-6 rounded-full bg-orange-50 flex items-center justify-center">
            <img
              src="https://cdni.iconscout.com/illustration/premium/thumb/no-orders-yet-illustration-svg-download-png-13391228.png"
              alt="No orders"
              className="w-16 h-16 opacity-90"
            />
          </div>

          <h2 className="text-3xl font-bold text-gray-800 mb-3">
            No Orders Yet
          </h2>

          <p className="text-gray-500 text-sm leading-relaxed max-w-sm mx-auto mb-8">
            You haven’t placed any orders yet.  
            Start shopping and your delicious orders will appear here.
          </p>

          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center justify-center
                       bg-gradient-to-r from-[#ff4d2d] to-[#ff6a3d]
                       hover:from-[#e64526] hover:to-[#ff4d2d]
                       text-white px-10 py-3 rounded-2xl
                       font-semibold shadow-lg
                       transition-all duration-300 hover:scale-[1.02]"
          >
            Start Shopping
          </button>
        </div>
      </div>
    </div>
  );
}


  /* ---------------- Main UI ---------------- */
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fff1eb] to-[#fff9f6] flex justify-center px-4 py-8">
      <div className="w-full max-w-5xl">

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate("/")}>
            <MdKeyboardBackspace className="w-6 h-6 text-[#ff4d2d]" />
          </button>
          <h1 className="text-3xl font-bold text-gray-800">
            My Orders
          </h1>
        </div>

        {/* Orders */}
        <div className="space-y-8">
          {myOrders.map((order) => {
            const overallStatus = getOverallStatus(order?.shopOrders);

            return (
              <div
                key={order._id}
                className="bg-white rounded-3xl shadow-md hover:shadow-xl transition p-6 space-y-5"
              >
                {/* Order Header */}
                <div className="flex flex-wrap justify-between gap-4 border-b pb-4">
                  <div>
                    <p className="font-semibold text-lg text-gray-800">
                      Order #{order._id.slice(-6)}
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatDate(order.createdAt)}
                    </p>
                  </div>

                  <div className="text-right space-y-1">
                    <p className="text-sm text-gray-500">
                      Payment:{" "}
                      <span className="font-medium text-gray-800">
                        {order.paymentMethod.toUpperCase()}
                      </span>
                    </p>
                    <span
                      className={`inline-block text-xs font-semibold px-3 py-1 rounded-full border ${statusStyle(
                        overallStatus
                      )}`}
                    >
                      {formatStatus(overallStatus)}
                    </span>
                  </div>
                </div>

                {/* Shop Orders */}
                {order.shopOrders.map((shopOrder) => (
                  <div
                    key={shopOrder._id}
                    className="bg-[#fffaf7] border rounded-2xl p-4 space-y-3"
                  >
                    <p className="text-lg font-semibold text-gray-800">
                      {shopOrder.shop?.name || "Shop"}
                    </p>

                    {/* Items */}
                    <div className="flex gap-4 overflow-x-auto pb-2">
                      {shopOrder.items.map((item) => (
                        <div
                          key={item._id}
                          className="w-40 bg-white border rounded-xl p-2 flex-shrink-0 hover:shadow-sm transition"
                        >
                          <img
                            src={item.item?.image || "/placeholder.png"}
                            alt={item.name}
                            className="h-24 w-full object-cover rounded-lg"
                          />
                          <p className="text-sm font-semibold mt-1">
                            {item.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            Qty {item.quantity} × ₹{item.price}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Shop Footer - Status + Track Button */}
                    <div className="flex flex-wrap justify-between items-center gap-3 border-t pt-3">
                      <p className="font-semibold">
                        Subtotal: ₹{shopOrder.subtotal}
                      </p>
                      
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs font-semibold px-3 py-1 rounded-full border ${statusStyle(
                            shopOrder.status
                          )}`}
                        >
                          {formatStatus(shopOrder.status)}
                        </span>
                        
                        {/* Track button for out_for_delivery orders */}
                        {shopOrder.status === "out_for_delivery" && (
                          <button
                            onClick={() => navigate(`/track-order/${order._id}?shopOrderId=${shopOrder._id}`)}
                            className="bg-[#ff4d2d] hover:bg-[#e64526]
                                       text-white px-3 py-1 rounded-lg
                                       text-xs font-medium shadow"
                          >
                            Track
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Order Footer */}
                <div className="flex flex-wrap justify-between items-center gap-4 border-t pt-4">
                  <p className="text-lg font-bold text-gray-800">
                    Total: ₹{order.totalAmount}
                  </p>

                  {overallStatus === "delivered" ? (
                    <span className="text-green-600 font-semibold">
                      Delivered ✅
                    </span>
                  ) : overallStatus === "partially_delivered" ? (
                    <span className="text-blue-600 font-semibold">
                      Partially Delivered 📦
                    </span>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
