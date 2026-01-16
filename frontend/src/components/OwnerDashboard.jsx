import React from "react";
import Nav from "./Nav";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { FaUtensils, FaPen, FaPlus } from "react-icons/fa";
import Footer from "./Footer";
import OwnerFoodCard from "./OwnerFoodCard";
import { useEffect } from "react";
import { setPendingOrdersCount, setOwnerPendingOrders } from "../redux/userSlice";
import axios from "axios";
import { serverUrl } from "../App";
import { toast } from "react-toastify";


function OwnerDashboard() {
  const { shop, ownerPendingOrders, socket, pendingOrdersCount } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const pending = ownerPendingOrders.filter(
      (order) => order.shopOrder.status === "pending"
    );
    dispatch(setPendingOrdersCount(pending.length));
  }, [ownerPendingOrders]);

  /* ---------------- Socket: New Order Received (for badge update) ---------------- */
  useEffect(() => {
    if (!socket) return;

    const handleNewOrder = (data) => {
      console.log("🆕 [OwnerDashboard] New order received:", data);
      
      // Check if the order data has all required populated fields
      if (data.order?.user?.fullName && data.order?.shopOrder?.items) {
        const newOrderEntry = {
          _id: data.order._id,
          user: data.order.user,
          address: data.order.address,
          paymentMethod: data.order.paymentMethod,
          createdAt: data.order.createdAt,
          shopOrder: data.order.shopOrder,
        };
        
        // Add to orders list
        dispatch(setOwnerPendingOrders([newOrderEntry, ...ownerPendingOrders]));
        
        toast.info("🔔 New order received!", {
          position: "top-right",
        });
      } else {
        // Fallback: re-fetch
        toast.info("🔔 New order received!", {
          position: "top-right",
        });
        
        setTimeout(async () => {
          try {
            const res = await axios.get(`${serverUrl}/api/order/shop-orders`, {
              withCredentials: true,
            });
            if (res.data.success) {
              dispatch(setOwnerPendingOrders(res.data.orders || []));
            }
          } catch (err) {
            console.error("Failed to fetch orders:", err);
          }
        }, 1500);
      }
    };

    socket.on("orders:new", handleNewOrder);

    return () => {
      socket.off("orders:new", handleNewOrder);
    };
  }, [socket, dispatch, ownerPendingOrders]);


  return (
    <div className="w-full min-h-screen bg-[#fff9f6] flex flex-col items-center">
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
              className="absolute top-4 right-4 bg-[#ff4d2d] text-white p-2 rounded-full shadow-md hover:bg-orange-600 transition-colors cursor-pointer"
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
            {shop?.items.map((item, index) => (
              <OwnerFoodCard key={index} item={item} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default OwnerDashboard;
