import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FaMinus, FaPlus, FaTrash } from "react-icons/fa";
import { MdKeyboardBackspace } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import ClipLoader from "react-spinners/ClipLoader";

import { updateQuantity, removeFromCart } from "../redux/userSlice";

function CartPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { cartItems, totalAmount } = useSelector((state) => state.user);

  const [loadingItemId, setLoadingItemId] = useState(null);

  /* ================= HANDLERS ================= */

  const increaseQty = (id, qty) => {
    dispatch(updateQuantity({ id, quantity: qty + 1 }));
    toast.success("Quantity increased");
  };

  const decreaseQty = (id, qty) => {
    if (qty === 1) return toast.info("Minimum quantity reached");

    dispatch(updateQuantity({ id, quantity: qty - 1 }));
    toast.info("Quantity decreased");
  };

  const removeItem = (id) => {
    setLoadingItemId(id);

    setTimeout(() => {
      dispatch(removeFromCart(id));
      setLoadingItemId(null);
      toast.error("Item removed from cart");
    }, 500);
  };

  const deliveryFee = totalAmount < 1000 ? 40 : 0;
  const finalTotal = totalAmount + deliveryFee;


  /* ================= UI ================= */

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fff2ec] to-[#ffe6df] p-4 md:p-10">
      <div className="max-w-6xl mx-auto">

        {/* HEADER */}
        <div className="flex items-center gap-3 mb-6 ml-5">
          <button
            onClick={() => navigate("/")}
            className="p-2 rounded-full bg-white shadow hover:scale-105 transition"
          >
            <MdKeyboardBackspace size={22} className="text-[#ff4d2d]" />
          </button>

          <h1 className="text-3xl font-extrabold text-gray-800 pl-5">
            Your Cart
          </h1>
        </div>

        {/* EMPTY CART */}
        {cartItems.length === 0 ? (
          <div className="flex justify-center items-center min-h-[70vh]">
            <div className="bg-white p-10 rounded-2xl shadow text-center max-w-xl w-full">
              <img
                src="https://cdn-icons-png.flaticon.com/512/2038/2038854.png"
                className="w-36 mx-auto opacity-80"
                alt="Empty cart"
              />

              <p className="mt-5 text-gray-500 text-lg">
                Your cart is empty
              </p>

              <button
                onClick={() => navigate("/")}
                className="mt-6 bg-[#ff4d2d] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#e64526]"
              >
                Browse Food Items
              </button>
            </div>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-8">

            {/* CART ITEMS */}
            <div className="md:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-white p-4 rounded-2xl shadow flex justify-between items-center"
                >
                  {/* ITEM INFO */}
                  <div className="flex gap-4 items-center">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded-xl border"
                    />

                    <div>
                      <h3 className="font-bold text-gray-800">
                        {item.name}
                      </h3>

                      <p className="text-sm text-gray-500">
                        ₹{item.price} × {item.quantity}
                      </p>

                      <p className="font-bold text-[#ff4d2d] mt-1">
                        ₹{item.price * item.quantity}
                      </p>
                    </div>
                  </div>

                  {/* ACTIONS */}
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-full">
                      <button onClick={() => decreaseQty(item.id, item.quantity)}>
                        <FaMinus size={10} />
                      </button>

                      <span className="font-semibold">
                        {item.quantity}
                      </span>

                      <button onClick={() => increaseQty(item.id, item.quantity)}>
                        <FaPlus size={10} />
                      </button>
                    </div>

                    <button
                      onClick={() => removeItem(item.id)}
                      className="p-2 rounded-full bg-red-100 text-red-600 hover:bg-red-200 flex items-center justify-center"
                      disabled={loadingItemId === item.id}
                    >
                      {loadingItemId === item.id ? (
                        <ClipLoader size={14} color="#dc2626" />
                      ) : (
                        <FaTrash size={12} />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* ORDER SUMMARY */}
            <div className="bg-white p-6 rounded-2xl shadow-xl h-fit sticky top-8">
              <h2 className="text-xl font-bold border-b pb-3">
                Order Summary
              </h2>

              <div className="mt-4 space-y-2 text-gray-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₹{totalAmount}</span>
                </div>

                <div className="flex justify-between">
                  <span>Delivery Fee</span>
                  <span>
                    {deliveryFee === 0 ? "Free" : `₹${deliveryFee}`}
                  </span>
                </div>

                <div className="flex justify-between font-bold text-lg border-t pt-3">
                  <span>Total</span>
                  <span className="text-[#ff4d2d]">
                    ₹{(totalAmount + 40).toFixed(2)}
                  </span>
                </div>
              </div>

              <button
                onClick={() => navigate("/checkout")}
                className="w-full mt-6 bg-[#ff4d2d] text-white py-3 rounded-xl font-semibold hover:bg-[#e64526]"
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CartPage;
