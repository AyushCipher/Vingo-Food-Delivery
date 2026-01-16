import React, { useEffect, useState } from "react";
import axios from "axios";
import { serverUrl } from "../App";
import { MdKeyboardBackspace } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { ClipLoader } from "react-spinners";
import { toast } from "react-toastify";

const PRIMARY = "#ff4d2d";

export default function MyDeliveredOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDeliveredOrders = async () => {
      try {
        const res = await axios.get(
          `${serverUrl}/api/order/my-delivered-orders`,
          { withCredentials: true }
        );

        if (res.data.success) {
          setOrders(res.data.orders);
          toast.success("Delivered orders loaded successfully", { 
            position: "top-right" 
          });
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch delivered orders", { 
          position: "top-right" 
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDeliveredOrders();
  }, []);

  /* ------------------ LOADER ------------------ */
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh]">
        <ClipLoader size={55} color={PRIMARY} />
        <p className="mt-4 text-gray-500 font-medium">
          Loading delivered orders...
        </p>
      </div>
    );
  }

  /* ------------------ EMPTY STATE ------------------ */
  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] text-gray-500">
        <img
          src="https://cdn-icons-png.flaticon.com/512/2038/2038854.png"
          alt="No orders"
          className="w-32 mb-6 opacity-80"
        />
        <p className="text-xl font-semibold mb-1">
          No delivered orders yet
        </p>
        <p className="text-sm text-gray-400">
          Once you deliver orders, they will appear here
        </p>

        <button
          onClick={() => navigate("/")}
          className="mt-6 px-6 py-2 rounded-xl bg-gradient-to-r from-[#ff7a45] to-[#ff4d2d] text-white font-semibold shadow-md hover:scale-[1.02] active:scale-95 transition"
        >
          Go Back Home
        </button>
      </div>
    );
  }

  /* ------------------ MAIN UI ------------------ */
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fff1eb] to-[#fff9f6] py-10 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate("/")}>
            <MdKeyboardBackspace
              className="w-7 h-7"
              style={{ color: PRIMARY }}
            />
          </button>
          <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
            📦 <span style={{ color: PRIMARY }}>My Delivered Orders</span>
          </h2>
        </div>

        {/* Orders */}
        <div className="space-y-8">
          {orders.map((order) => (
            <div
              key={order._id}
              className="
                bg-white rounded-3xl shadow-lg p-6
                hover:shadow-xl transition-all
              "
            >
              {/* Order Header */}
              <div className="flex flex-wrap justify-between items-center border-b pb-4 mb-4 gap-3">
                <p className="text-sm text-gray-500">
                  Order ID:{" "}
                  <span className="font-mono text-gray-700">
                    {order._id}
                  </span>
                </p>

                <span className="px-4 py-1.5 rounded-full text-sm font-semibold bg-green-100 text-green-600">
                  Delivered
                </span>
              </div>

              {/* Shop Orders */}
              <div className="space-y-5">
                {order.shopOrders
                  .filter((so) => so.status === "delivered")
                  .map((so) => (
                    <div
                      key={so._id}
                      className="bg-gray-50 rounded-2xl p-5 border"
                    >
                      <h3
                        className="font-bold text-lg mb-3 flex items-center gap-2"
                        style={{ color: PRIMARY }}
                      >
                        🏪 {so.shop?.name}
                      </h3>

                      {/* Items */}
                      <div className="space-y-2">
                        {so.items.map((it) => (
                          <div
                            key={it._id}
                            className="flex justify-between items-center text-sm border-b last:border-0 pb-2"
                          >
                            <span className="text-gray-700 font-medium">
                              {it.name} × {it.quantity}
                            </span>
                            <span
                              className="font-semibold"
                              style={{ color: PRIMARY }}
                            >
                              ₹{it.price}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Footer */}
                      <div className="flex justify-between items-center mt-4">
                        <span className="text-sm text-gray-500">
                          Total Items: {so.items.length}
                        </span>
                        <span
                          className="text-xl font-bold"
                          style={{ color: PRIMARY }}
                        >
                          ₹{so.subtotal}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
