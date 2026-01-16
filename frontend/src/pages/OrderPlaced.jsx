import React from "react";
import { useNavigate } from "react-router-dom";
import { FaCheckCircle } from "react-icons/fa";

export default function OrderPlaced() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#fff1eb] via-[#fff9f6] to-[#ffe5dd] px-4">
      {/* Card */}
      <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full px-8 py-10 text-center animate-fadeIn">
        {/* Glow Ring */}
        <div className="absolute -top-16 left-1/2 -translate-x-1/2">
          <div className="w-28 h-28 rounded-full bg-green-100 flex items-center justify-center shadow-md">
            <FaCheckCircle className="text-green-500 text-6xl" />
          </div>
        </div>

        {/* Content */}
        <div className="mt-14">
          <h1 className="text-3xl font-bold text-gray-800 mb-3">
            Order Placed Successfully
          </h1>

          <p className="text-gray-600 text-sm leading-relaxed mb-8">
            Thank you for your purchase! Your order is currently being prepared.
            You can track real-time updates in the{" "}
            <span className="font-semibold text-gray-800">My Orders</span>{" "}
            section.
          </p>

          {/* CTA */}
          <button
            onClick={() => navigate("/my-orders")}
            className="w-full bg-gradient-to-r from-[#ff4d2d] to-[#ff6a3d] 
                       hover:from-[#e64526] hover:to-[#ff4d2d]
                       text-white py-3 rounded-xl text-base font-semibold
                       shadow-md hover:shadow-lg transition-all duration-300"
          >
            Go to My Orders →
          </button>
        </div>
      </div>

      {/* Animation */}
      <style>
        {`
          .animate-fadeIn {
            animation: fadeIn 0.6s ease-out forwards;
          }
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}
      </style>
    </div>
  );
}
