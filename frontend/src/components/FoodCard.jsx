import React, { useState } from "react";
import {
  FaMinus,
  FaPlus,
  FaShoppingCart,
  FaDrumstickBite,
  FaLeaf,
  FaStar,
  FaRegStar,
} from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { addToCart, updateQuantity } from "../redux/userSlice";


function FoodCard({ data }) {
  const [quantity, setQuantity] = useState(0);
  const { cartItems } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  
  const handleIncrease = () => {
    const newQty = quantity + 1;
    setQuantity(newQty);
    dispatch(updateQuantity({ id: data._id, quantity: newQty }));
  };

  const handleDecrease = () => {
    if (quantity > 0) {
      const newQty = quantity - 1;
      setQuantity(newQty);
      dispatch(updateQuantity({ id: data._id, quantity: newQty }));
    }
  };

  const handleAddToCart = () => {
    if (quantity > 0) {
      dispatch(
        addToCart({
          id: data._id,
          name: data.name,
          shop: data.shop,
          price: data.price,
          quantity,
          image: data.image,
          type: data.type,
        })
      );
    }
  };

  // Render star rating
  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        i <= rating ? (
          <FaStar key={i} className="text-yellow-400" />
        ) : (
          <FaRegStar key={i} className="text-yellow-400" />
        )
      );
    }
    return stars;
  };

  return (
    <div className="w-[250px] rounded-2xl border-2 border-[#ff4d2d] bg-white shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col">
      {/* Image & top icons */}
      <div className="relative w-full h-[170px] flex justify-center items-center bg-white">
        {/* Veg/Non-Veg Icon */}
        <div className="absolute top-3 right-3 bg-white rounded-full p-1 shadow">
          {data.type === "veg" ? (
            <FaLeaf className="text-green-600 text-lg" />
          ) : (
            <FaDrumstickBite className="text-red-600 text-lg" />
          )}
        </div>

        <img
          src={data.image}
          alt={data.name}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
        />
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col p-4">
        <h3 className="font-semibold text-gray-900 text-base truncate">
          {data.name}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-1 mt-1">
          {renderStars(Math.round(data.rating?.average || 0))}
          <span className="text-xs text-gray-500">
            ({data.rating?.count || 0})
          </span>
        </div>

        {/* Price & Add to Cart */}
        <div className="flex items-center justify-between mt-auto pt-3">
          <span className="font-bold text-gray-900 text-lg">₹{data.price}</span>

          {/* Quantity & Cart Button */}
          <div className="flex items-center border rounded-full overflow-hidden shadow-sm">
            <button
              onClick={handleDecrease}
              className="px-2 py-1 hover:bg-gray-100 transition"
            >
              <FaMinus size={12} />
            </button>
            <span className="px-2 text-sm">{quantity}</span>
            <button
              onClick={handleIncrease}
              className="px-2 py-1 hover:bg-gray-100 transition"
            >
              <FaPlus size={12} />
            </button>
            <button
              className={`${
                cartItems.some((i) => i.id == data._id)
                  ? "bg-gray-700"
                  : "bg-[#ff4d2d]"
              } text-white px-3 py-2 transition-colors`}
              onClick={handleAddToCart}
            >
              <FaShoppingCart size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FoodCard;
