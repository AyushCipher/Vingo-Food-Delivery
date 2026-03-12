import React, { useEffect, useState, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { MdKeyboardBackspace, MdLocationOn, MdPhone } from "react-icons/md";
import { MdOutlineShoppingBag } from "react-icons/md";
import { ClipLoader } from "react-spinners";
import { toast } from "react-toastify";

import { serverUrl } from "../App";
import { setOwnerPendingOrders, setDeliveryBoys, setPendingOrdersCount } from "../redux/userSlice";
import { getSocket } from "../socket";

const PRIMARY = "#ff4d2d";
const statusOptions = ["pending", "preparing", "out_for_delivery"];

// Helper to display status nicely in dropdown
const formatStatus = (status) => {
  const map = {
    pending: "Pending",
    preparing: "Preparing",
    out_for_delivery: "Out for Delivery",
    delivered: "Delivered"
  };
  return map[status] || status;
};

export default function PendingOrders() {

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { ownerPendingOrders, deliveryBoys, userData, pendingOrdersCount } = useSelector(
    (state) => state.user
  );
  // Always use singleton socket instance for real-time events
  const socket = userData?._id ? getSocket(userData._id) : null;

  /* ---------------- Socket: Order Status Updated (real-time payment/COD tick) ---------------- */
  useEffect(() => {
    if (!socket) return;

    const handleStatusUpdated = (data) => {
      // Option 1: Re-fetch all orders for full accuracy (recommended for now)
      setTimeout(async () => {
        try {
          const res = await axios.get(`${serverUrl}/api/order/shop-orders`, {
            withCredentials: true,
          });
          if (res.data.success) {
            dispatch(setOwnerPendingOrders(res.data.orders || []));
            // Update count based on pending/preparing orders
            const pendingCount = res.data.orders?.filter(
              o => o.shopOrder?.status === "pending" || o.shopOrder?.status === "preparing"
            ).length || 0;
            dispatch(setPendingOrdersCount(pendingCount));
          }
        } catch (err) {
          console.error("Failed to fetch orders (statusUpdated):", err);
        }
      }, 1000);
      toast.info("Order status updated!", { position: "top-right" });
    };

    socket.on("orders:statusUpdated", handleStatusUpdated);
    return () => {
      socket.off("orders:statusUpdated", handleStatusUpdated);
    };
  }, [socket, dispatch]);

  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  /* ---------------- Socket: Delivery Boy Accepted ---------------- */
  useEffect(() => {
    if (!socket) return;

    const handleDeliveryAccepted = ({ orderId, shopOrderId, deliveryBoy }) => {
      console.log("🚚 Delivery boy accepted:", deliveryBoy);
      
      // Update local state with assigned delivery boy
      const updated = ownerPendingOrders.map((order) => {
        if (order._id === orderId) {
          return {
            ...order,
            shopOrder: {
              ...order.shopOrder,
              assignedDeliveryBoy: deliveryBoy,
            },
          };
        }
        return order;
      });

      dispatch(setOwnerPendingOrders(updated));
      toast.success(`${deliveryBoy.fullName} accepted the order!`, {
        position: "top-right",
      });
    };

    socket.on("delivery:accepted", handleDeliveryAccepted);

    return () => {
      socket.off("delivery:accepted", handleDeliveryAccepted);
    };
  }, [socket, ownerPendingOrders, dispatch]);

  /* ---------------- Socket: New Order Received ---------------- */
  useEffect(() => {
    if (!socket) return;

    const handleNewOrder = async () => {
      try {
        const res = await axios.get(`${serverUrl}/api/order/shop-orders`, {
          withCredentials: true,
        });
        if (res.data.success) {
          dispatch(setOwnerPendingOrders(res.data.orders || []));
          // Update count based on pending/preparing orders
          const pendingCount = res.data.orders?.filter(
            o => o.shopOrder?.status === "pending" || o.shopOrder?.status === "preparing"
          ).length || 0;
          dispatch(setPendingOrdersCount(pendingCount));
        }
      } catch (err) {
        console.error("Failed to fetch orders (orders:new):", err);
      }
      toast.info("🔔 New order received!", { position: "top-right" });
    };

    socket.on("orders:new", handleNewOrder);

    return () => {
      socket.off("orders:new", handleNewOrder);
    };
  }, [socket, dispatch]);

  /* ---------------- Socket: Order Delivered ---------------- */
  useEffect(() => {
    if (!socket) return;

    const handleDeliveryCompleted = (data) => {
      console.log("✅ Order delivered:", data);
      
      // Update the order status to delivered in local state
      const updated = ownerPendingOrders.map((order) => {
        if (order._id === data.orderId && order.shopOrder?._id === data.shopOrderId) {
          return {
            ...order,
            shopOrder: {
              ...order.shopOrder,
              status: "delivered",
            },
          };
        }
        return order;
      });
      
      dispatch(setOwnerPendingOrders(updated));
      
      toast.success("🎉 Order has been delivered!", {
        position: "top-right",
      });
    };

    socket.on("delivery:completed", handleDeliveryCompleted);

    return () => {
      socket.off("delivery:completed", handleDeliveryCompleted);
    };
  }, [socket, dispatch, ownerPendingOrders]);

  /* ---------------- Fetch Orders ---------------- */
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);

        const res = await axios.get(`${serverUrl}/api/order/shop-orders`, {
          withCredentials: true,
        });

        dispatch(setOwnerPendingOrders(res.data.orders || []));
      } catch (err) {
        toast.error("Failed to load pending orders", {
          position: "top-right",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [dispatch]);

  /* ---------------- Update Local Order ---------------- */
  const updateLocalShopOrder = (orderId, shopId, updatedShopOrder) => {
    const updated = ownerPendingOrders.map((order) =>
      order._id === orderId && order.shopOrder?.shop?._id === shopId
        ? { ...order, shopOrder: updatedShopOrder }
        : order
    );

    dispatch(setOwnerPendingOrders(updated));
  };

  /* ---------------- Update Status ---------------- */
  const updateStatus = async (orderId, shopId, status) => {
    try {
      setUpdatingId(orderId);

      const res = await axios.post(
        `${serverUrl}/api/order/update-order-status/${orderId}/${shopId}`,
        { status },
        { withCredentials: true }
      );

      if (!res.data.success) throw new Error("Update failed");

      updateLocalShopOrder(orderId, shopId, res.data.shopOrder);

      if (res.data.deliveryBoys) {
        dispatch(setDeliveryBoys(res.data.deliveryBoys));
      }

      toast.success("Order status updated", {
        position: "top-right",
      });
    } catch (err) {
      toast.error("Failed to update order status", {
        position: "top-right",
      });
    } finally {
      setUpdatingId(null);
    }
  };

  /* ---------------- Loading ---------------- */
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <ClipLoader size={50} color={PRIMARY} />
        <p className="mt-4 text-gray-600 font-medium">
          Loading pending orders...
        </p>
      </div>
    );
  }

  /* ---------------- No Orders ---------------- */
  if (!ownerPendingOrders || ownerPendingOrders.length === 0) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center bg-gradient-to-br from-[#fff7f3] to-white px-4">
        <div className="flex flex-col items-center text-center max-w-md">
          {/* Icon */}
          <div className="w-24 h-24 rounded-full bg-orange-100 flex items-center justify-center mb-6 shadow-sm animate-pulse">
            <MdOutlineShoppingBag size={40} className="text-[#ff4d2d]" />
          </div>

          {/* Title */}
          <h2 className="text-3xl font-extrabold text-gray-800 mb-2">
            No Pending Orders
          </h2>

          {/* Subtitle */}
          <p className="text-gray-500 text-base leading-relaxed mb-6">
            You’re all caught up for now. New orders will appear here as soon as
            customers place them.
          </p>

          {/* Divider */}
          <div className="w-20 h-[3px] rounded-full bg-gradient-to-r from-[#ff4d2d] to-[#ff7a45] mb-6" />

          {/* Optional CTA */}
          <button
            onClick={() => window.location.reload()}
            className="
              px-6 py-2.5 rounded-full
              bg-[#ff4d2d] text-white font-semibold
              shadow-md hover:shadow-lg
              hover:bg-[#e64526]
              active:scale-95
              transition-all
            "
          >
            Refresh Orders
          </button>
        </div>
      </div>
    );
  }

  /* ---------------- Main UI ---------------- */
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#fff1eb] to-[#fff9f6]">
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate("/")}>
            <MdKeyboardBackspace className="text-[#ff4d2d]" size={26} />
          </button>
          <h1 className="text-3xl font-bold text-gray-800">My Orders</h1>
        </div>

        {/* Orders */}
        <div className="space-y-8">
          {ownerPendingOrders.map((order) => {
            const orderId = order._id;
            const shopId = order.shopOrder?.shop?._id;

            return (
              <div
                key={orderId}
                className="
                bg-white/90 backdrop-blur
                rounded-3xl shadow-md hover:shadow-xl
                transition p-6 space-y-5
              "
              >
                {/* Customer */}
                <div>
                  <h2 className="text-xl font-bold text-gray-800">
                    {order.user?.fullName || "Customer"}
                  </h2>
                  <p className="text-sm text-gray-500">{order.user?.email}</p>
                  <p className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                    <MdPhone size={14} /> {order.user?.mobile || "N/A"}
                  </p>
                </div>

                {/* Address */}
                {order.address?.text && (
                  <div className="flex gap-2 text-sm text-gray-600">
                    <MdLocationOn size={16} />
                    {order.address.text}
                  </div>
                )}

                {/* Items */}
                <div>
                  <p className="font-semibold mb-3">Items</p>
                  <div className="flex gap-4 overflow-x-auto pb-2">
                    {order.shopOrder?.items?.map((item) => (
                      <div
                        key={item.item?._id}
                        className="
                        w-44 flex-shrink-0
                        bg-gray-50 rounded-xl border
                        p-3 hover:shadow-md transition
                      "
                      >
                        <img
                          src={item.item?.image || "/placeholder.png"}
                          alt={item.name}
                          className="w-full h-24 object-cover rounded-lg mb-2 cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() => navigate(`/product/${item.item?._id}`)}
                        />
                        <p 
                          className="text-sm font-semibold cursor-pointer hover:text-[#ff4d2d] transition-colors"
                          onClick={() => navigate(`/product/${item.item?._id}`)}
                        >
                          {item.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          Qty {item.quantity} × ₹{item.price}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer */}
                <div className="flex flex-wrap justify-between items-center gap-4 border-t pt-4">
                  <span className="text-md font-semibold capitalize text-[#ff4d2d]">
                    {formatStatus(order.shopOrder?.status)}
                  </span>

                  {/* Payment Status */}
                  <span className="text-xs font-semibold">
                    Payment Status: {order.shopOrder?.status === "delivered" ? (
                      order.paymentMethod === "online" ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 text-green-700 font-bold border border-green-300">
                          Online <span className="ml-1">&#10003;</span>
                        </span>
                      ) : order.paymentMethod === "cod" ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 text-green-700 font-bold border border-green-300">
                          COD <span className="ml-1">&#10003;</span>
                        </span>
                      ) : (
                        <span className="text-gray-500">-</span>
                      )
                    ) : (
                      order.paymentMethod === "online" ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 text-green-700 font-bold border border-green-300">
                          Online
                        </span>
                      ) : order.paymentMethod === "cod" ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-red-100 text-red-700 font-bold border border-red-300">
                          False
                        </span>
                      ) : (
                        <span className="text-gray-500">-</span>
                      )
                    )}
                  </span>

                  <div className="flex items-center gap-2">
                    {order.shopOrder?.status !== "delivered" && (
                      <select
                        disabled={updatingId === orderId}
                        className="border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-[#ff4d2d]/40"
                        style={{ borderColor: PRIMARY }}
                        onChange={(e) =>
                          updateStatus(orderId, shopId, e.target.value)
                        }
                        defaultValue=""
                      >
                        <option value="" disabled>
                          Change Status
                        </option>
                        {statusOptions.map((st) => (
                          <option key={st} value={st}>
                            {formatStatus(st)}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>

                {/* Assigned Delivery Boy (show deliveredBy if assignedDeliveryBoy is null and delivered) */}
                {(order.shopOrder?.assignedDeliveryBoy || (order.shopOrder?.status === "delivered" && order.shopOrder?.deliveredBy)) && (
                  <div className="mt-3 p-3 border rounded-xl bg-gray-50">
                    <p className="text-sm font-semibold text-gray-700 mb-1">
                      Assigned Delivery Boy:
                    </p>

                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MdPhone className="text-[#ff4d2d]" />
                      <span className="font-medium">
                        {(order.shopOrder.assignedDeliveryBoy || order.shopOrder.deliveredBy)?.fullName}
                      </span>
                      <span className="text-gray-400">–</span>
                      <span>{(order.shopOrder.assignedDeliveryBoy || order.shopOrder.deliveredBy)?.mobile}</span>
                    </div>
                  </div>
                )}

                {/* Total */}
                <div className="text-right text-lg font-bold text-gray-800">
                  Total: ₹{order.shopOrder?.subtotal}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
