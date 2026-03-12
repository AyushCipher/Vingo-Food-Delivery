import React, { useState, useEffect } from "react";
import Nav from "./Nav";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { FaUtensils, FaPen, FaPlus } from "react-icons/fa";
import { RxCross2 } from "react-icons/rx";
import Footer from "./Footer";
import OwnerFoodCard from "./OwnerFoodCard";
import { setPendingOrdersCount, setOwnerPendingOrders } from "../redux/userSlice";
import axios from "axios";
import { serverUrl } from "../App";
import { toast } from "react-toastify";


function OwnerDashboard() {
  const { shop, ownerPendingOrders, socket, pendingOrdersCount } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [hoveredItem, setHoveredItem] = useState(null);

  useEffect(() => {
    const pending = ownerPendingOrders.filter(
      (order) => order.shopOrder.status === "pending"
    );
    dispatch(setPendingOrdersCount(pending.length));
  }, [ownerPendingOrders]);

  /* ---------------- Socket: New Order Received & Delivery Completed ---------------- */

  useEffect(() => {
    // Always refetch shop orders for real-time badge and order list update
    const refetchShopOrders = async (toastMsg, toastType = "info") => {
      try {
        const res = await axios.get(`${serverUrl}/api/order/shop-orders`, { withCredentials: true });
        if (res.data.success) {
          dispatch(setOwnerPendingOrders(res.data.orders || []));
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch orders");
      }
    };

    if (!socket) return;

    socket.on("newOrderReceived", (data) => {
      console.log("New order received:", data);
      refetchShopOrders("New order received", "info");
    });

    socket.on("deliveryCompleted", (data) => {
      console.log("Delivery completed:", data);
      refetchShopOrders("Delivery status updated", "success");
    });

    return () => {
      socket.off("newOrderReceived");
      socket.off("deliveryCompleted");
    };
  }, [socket, dispatch]);

  /* ---------------- Handlers: Toggle Availability & Delete Item ---------------- */

  // Toggle availability handler
  const handleToggleAvailability = async (itemId, newAvailability) => {
    try {
      await axios.post(`${serverUrl}/api/item/edititem/${itemId}`, { availability: newAvailability }, { withCredentials: true });
      // No reload! Just update local state for instant UI feedback
      if (shop && shop.items) {
        const updatedItems = shop.items.map(item =>
          item._id === itemId ? { ...item, availability: newAvailability } : item
        );
        dispatch({ type: "user/setShop", payload: { ...shop, items: updatedItems } });
      }
      // Optionally, show a toast
      toast.success("Availability updated");
    } catch (err) {
      alert("Failed to update availability");
    }
  };

  // Delete item handler
  const handleDeleteItem = async (itemId) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;
    try {
      await axios.delete(`${serverUrl}/api/item/deleteitem/${itemId}`, { withCredentials: true });
      window.location.reload();
    } catch (err) {
      alert("Failed to delete item");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Nav />

      {/* If no shop */}
      {!shop && (
        <div className="flex justify-center items-center p-4 sm:p-6">
          <div className="w-full max-w-md bg-white shadow-lg rounded-2xl p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
            <div className="flex flex-col items-center text-center">
              <FaUtensils className="text-[#ff4d2d] w-16 h-16 sm:w-20 sm:h-20 mb-4" />
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
                Add Your Restaurant
              </h2>
              <p className="text-gray-600 mb-4 text-sm sm:text-base">
                Join our food delivery platform and reach thousands of hungry
                customers every day.
              </p>
              <button
                className="bg-[#ff4d2d] text-white px-5 sm:px-6 py-2 rounded-full font-medium shadow-md hover:bg-orange-600 transition-colors duration-200"
                onClick={() => navigate("/editshop")}
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      )}

      {/* If shop exists but no items */}
      {shop && shop?.items?.length === 0 && (
        <div className="w-full flex flex-col items-center gap-6 px-4 sm:px-6">
          <h1 className="text-2xl sm:text-3xl text-gray-900 flex items-center gap-3 mt-8 text-center">
            <FaUtensils className="text-[#ff4d2d]" /> Welcome to {shop.name}
          </h1>

          {/* Shop Card */}
          <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-orange-100 hover:shadow-2xl transition-all duration-300 w-full max-w-3xl relative">
            <button
              onClick={() => navigate("/editshop")}
              className="absolute top-4 right-4 bg-[#ff4d2d] text-white p-2 rounded-full shadow-md hover:bg-orange-600 transition-colors"
            >
              <FaPen />
            </button>
            <img
              src={shop.image}
              alt={shop.name}
              className="w-full h-48 sm:h-64 object-cover"
            />
            <div className="p-4 sm:p-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
                {shop.name}
              </h2>
              <p className="text-gray-500 mb-4">
                {shop.city}, {shop.state}
              </p>
              <p className="text-gray-700 mb-4">{shop.address}</p>
              <div className="text-xs sm:text-sm text-gray-400">
                <p>Created: {new Date(shop.createdAt).toLocaleString()}</p>
                <p>Last Updated: {new Date(shop.updatedAt).toLocaleString()}</p>
              </div>
            </div>
          </div>


          {/* Add Item Section */}
          <div className="flex items-center justify-center w-full mb-8">
            <div className="bg-white border border-orange-200 shadow-lg rounded-xl p-6 sm:p-8 w-full max-w-xl text-center hover:shadow-2xl transition-all duration-300">
              <FaUtensils className="text-orange-500 text-4xl sm:text-5xl mx-auto mb-4" />
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
                Add Your Food Items
              </h2>
              <p className="text-gray-600 mb-6 text-sm sm:text-base">
                Share your delicious creations with our customers by adding them
                to the menu.
              </p>
              <button
                className="inline-flex items-center gap-2 bg-orange-500 text-white px-5 sm:px-6 py-2 sm:py-3 rounded-full font-semibold shadow-md hover:bg-orange-600 transition-colors"
                onClick={() => navigate("/additem")}
              >
                <FaPlus /> Add Item
              </button>
            </div>
          </div>
        </div>
      )}


      {/* If shop and items exist */}
      {shop && shop?.items.length > 0 && (
        <div className="w-full flex flex-col gap-6 items-center px-4 sm:px-6 mb-[20px]">
          <h1 className="text-2xl sm:text-3xl text-gray-900 flex items-center gap-3 mt-8 text-center">
            <FaUtensils className="text-[#ff4d2d]" /> Welcome to {shop.name}
          </h1>

          {/* Shop Card */}
          <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-orange-100 hover:shadow-2xl transition-all duration-300 w-full max-w-3xl relative">
            <button
              onClick={() => navigate("/editshop")}
              className="absolute top-4 right-4 bg-[#ff4d2d] text-white p-2 rounded-full shadow-md hover:bg-orange-600 transition-colors"
            >
              <FaPen />
            </button>
            <img
              src={shop.image}
              alt={shop.name}
              className="w-full h-48 sm:h-64 object-cover"
            />
            <div className="p-4 sm:p-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
                {shop.name}
              </h2>
              <p className="text-gray-500 mb-4">
                {shop.city}, {shop.state}
              </p>
              <p className="text-gray-700 mb-4">{shop.address}</p>
              <div className="text-xs sm:text-sm text-gray-400">
                <p>Created: {new Date(shop.createdAt).toLocaleString()}</p>
                <p>Last Updated: {new Date(shop.updatedAt).toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Food Items - one per row */}
          <div className="flex flex-col items-center gap-4 w-full max-w-3xl mb-8">
            {shop.items.map((item, index) => (
              <div
                key={item._id || index}
                className="relative flex bg-white rounded-lg shadow-md overflow-hidden border border-[#ff4d2d] w-full max-w-2xl group"
                onMouseEnter={() => setHoveredItem(item._id)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                {/* IMAGE */}
                <div className="w-36 flex-shrink-0 bg-gray-50">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">No Image</div>
                  )}
                </div>
                {/* CONTENT */}
                <div className="flex flex-col justify-between p-3 flex-1">
                  <div>
                    <h3 className="text-base font-semibold text-[#ff4d2d]">
                      {item.name}
                    </h3>
                    <p className="text-xs text-gray-500 mb-1">₹{item.price}</p>
                    <div className="text-xs text-gray-700 mb-2">
                      <span className="font-medium">Category:</span> {item.category || "N/A"}
                    </div>
                    <div className="text-xs text-gray-600 mb-2">
                      <span className="font-medium">Description:</span> {item.description || "No description"}
                    </div>
                    <div className="text-xs text-gray-600 mb-2">
                      <span className="font-medium">Available:</span> {item.availability !== false ? "Yes" : "No"}
                    </div>
                  </div>
                </div>
                {/* Edit/Delete Icons on hover */}
                {hoveredItem === item._id && (
                  <div className="absolute top-2 right-2 flex gap-2 z-10">
                    <button
                      className="bg-blue-500 text-white p-2 rounded-full shadow hover:bg-blue-600 flex items-center justify-center"
                      onClick={() => navigate(`/edititem/${item._id}`)}
                      title="Edit"
                    >
                      <FaPen size={12} />
                    </button>
                    <button
                      className="bg-red-500 text-white p-2 rounded-full shadow hover:bg-red-600 flex items-center justify-center"
                      onClick={() => handleDeleteItem(item._id)}
                      title="Delete"
                    >
                      <RxCross2 size={14} />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default OwnerDashboard;
