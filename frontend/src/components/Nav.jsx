import React, { useEffect, useState } from "react";
import { FaLocationDot } from "react-icons/fa6";
import { useDispatch, useSelector } from "react-redux";
import { IoIosSearch } from "react-icons/io";
import { LuShoppingCart } from "react-icons/lu";
import { RxCross2 } from "react-icons/rx";
import axios from "axios";
import { serverUrl } from "../App";
import { setSearchItems, setShop, setUserData } from "../redux/userSlice";
import { FiPlus } from "react-icons/fi";
import { TbReceipt2 } from "react-icons/tb";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

function Nav() {
  // ---- REDUX STATE ----
  const {
    city,
    userData,
    cartItems,
    pendingOrdersCount,
    shop: myShopData,
  } = useSelector((state) => state.user);

  // ---- LOCAL STATE ----
  const [showSearch, setShowSearch] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [input, setInput] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();

  // ---- CLOSE SEARCH WHEN DESKTOP ----
  useEffect(() => {
    const resize = () => {
      if (window.innerWidth >= 768) setShowSearch(false);
    };
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  // ---- LOGOUT ----
  const handleLogOut = async () => {
    try {
      await axios.get(`${serverUrl}/api/auth/signout`, {
        withCredentials: true,
      });

      dispatch(setUserData(null));
      dispatch(setShop(null));

      toast.success("Logged out successfully");
      navigate("/signin");
    } catch (error) {
      toast.error("Logout failed. Please try again");
    }
  };

  // ---- SEARCH ----
  const handleSearchItems = async () => {
    try {
      const result = await axios.get(
        `${serverUrl}/api/user/search-items?city=${city}&query=${input}`,
        { withCredentials: true }
      );

      dispatch(setSearchItems(result.data));
    } catch {
      dispatch(setSearchItems(null));
    }
  };

  useEffect(() => {
    if (input) handleSearchItems();
    else dispatch(setSearchItems(null));
  }, [input]);

  return (
    <>
      {/* NAVBAR */}
      <div
        className="w-full h-[80px] fixed top-0 z-[9999]
        flex items-center justify-between md:justify-center gap-6 px-5
        bg-white/80 backdrop-blur-xl border-b border-white/30
        shadow-[0_6px_30px_rgba(0,0,0,0.05)]
      "
      >
        {/* LOGO */}
        <h1 className="text-3xl font-extrabold text-[#ff4d2d] tracking-wide">
          Vingo
        </h1>

        {/* DESKTOP SEARCH BAR */}
        {userData?.role === "user" && (
          <div className="hidden md:flex w-[45%] h-[65px] bg-white rounded-2xl shadow-lg items-center gap-5 px-5 border border-gray-200">
            <FaLocationDot className="text-[#ff4d2d] text-[22px]" />
            <div className="truncate text-gray-500 font-medium w-[30%]">
              {city || "Searching..."}
            </div>
            <div className="w-[1px] h-6 bg-gray-300" />
            <IoIosSearch className="text-[#ff4d2d] text-[22px]" />
            <input
              placeholder="Search delicious foods..."
              className="flex-1 outline-none text-gray-700"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
          </div>
        )}

        {/* RIGHT SECTION */}
        <div className="flex items-center gap-5">
          {/* MOBILE SEARCH ICON */}
          {userData?.role === "user" && !showSearch && (
            <IoIosSearch
              className="text-[#ff4d2d] text-[24px] md:hidden cursor-pointer"
              onClick={() => setShowSearch(true)}
            />
          )}

          {/* ================= OWNER ================= */}
          {userData?.role === "owner" && (
            <>
              {/* DESKTOP BUTTONS */}
              <div className="hidden md:flex items-center gap-7 ml-5">
                {/* ADD FOOD BUTTON — only if shop exists */}
                {myShopData && (
                  <button
                    onClick={() => navigate("/additem")}
                    className="
                      flex items-center gap-2 px-5 py-2.5 
                      rounded-full bg-gradient-to-r from-[#ff7a45] to-[#ff4d2d]
                      text-white font-semibold
                      shadow-[0_8px_18px_rgba(255,77,45,0.35)]
                      hover:-translate-y-[1px]
                      active:scale-[.98]
                      transition-all duration-300
                    "
                  >
                    <FiPlus className="text-lg" />
                    Add Food Item
                  </button>
                )}

                {/* MY ORDERS */}
                <button
                  onClick={() => navigate("/pending-orders")}
                  className="
                    flex items-center gap-2 px-5 py-2.5 
                    rounded-full border border-[#ff4d2d]/30 bg-white
                    text-[#ff4d2d] font-semibold shadow-sm
                    hover:bg-[#ff4d2d] hover:text-white
                    active:scale-[.98]
                    transition-all relative
                  "
                >
                  <TbReceipt2 className="text-lg" />
                  My Orders
                  <span className="absolute -right-2 -top-2 bg-[#ff4d2d] text-white text-xs px-2 py-[2px] rounded-full">
                    {pendingOrdersCount}
                  </span>
                </button>
              </div>

              {/* MOBILE ICON BUTTONS */}
              <div className="md:hidden flex items-center gap-3">
                {/* ADD FOOD ICON */}
                {myShopData && (
                  <button
                    onClick={() => navigate("/additem")}
                    className="p-2.5 rounded-full bg-gradient-to-r from-[#ff7a45] to-[#ff4d2d] text-white shadow-md active:scale-95"
                  >
                    <FiPlus size={18} />
                  </button>
                )}

                {/* MY ORDERS ICON */}
                <button
                  onClick={() => navigate("/pending-orders")}
                  className="p-2.5 rounded-full bg-white border border-[#ff4d2d]/30 text-[#ff4d2d] shadow relative active:scale-95"
                >
                  <TbReceipt2 size={18} />
                  <span className="absolute -right-1 -top-1 bg-[#ff4d2d] text-white text-[10px] px-[6px] py-[1px] rounded-full">
                    {pendingOrdersCount}
                  </span>
                </button>
              </div>
            </>
          )}

          {/* ================= DELIVERY BOY ================= */}
          {userData?.role === "deliveryBoy" && (
            <button
              onClick={() => navigate("/my-delivered-orders")}
              className="
                flex items-center gap-2 px-6 py-2.5 rounded-full
                bg-gradient-to-r from-[#ff7a45] to-[#ff4d2d]
                text-white font-semibold shadow-md
                active:scale-[.98] hover:-translate-y-[1px]
              "
            >
              🚚 My Deliveries
            </button>
          )}

          {/* ================= USER CART ================= */}
          {userData?.role === "user" && (
            <>
              <div
                className="relative cursor-pointer"
                onClick={() => navigate("/cart")}
              >
                <LuShoppingCart className="text-[#ff4d2d] text-[26px]" />
                <span className="absolute -right-2 -top-2 bg-[#ff4d2d] text-white text-xs px-2 rounded-full shadow">
                  {cartItems?.length}
                </span>
              </div>

              <button
                onClick={() => navigate("/my-orders")}
                className="hidden md:block px-5 py-2 rounded-2xl border border-[#ff4d2d]/30 text-[#ff4d2d] hover:bg-[#ff4d2d] hover:text-white"
              >
                My Orders
              </button>
            </>
          )}

          {/* PROFILE */}
          <div className="relative ml-4">
            <div
              className="w-[42px] h-[42px] rounded-full bg-gradient-to-r from-[#ff6a3d] to-[#ff4d2d] text-white flex items-center justify-center cursor-pointer"
              onClick={() => setShowInfo(!showInfo)}
            >
              {userData?.fullName?.slice(0, 1)}
            </div>

            {showInfo && (
              <div className="absolute right-0 mt-3 w-[200px] bg-white rounded-2xl shadow-xl p-4 space-y-2">
                {/* USER NAME */}
                <div className="font-semibold text-gray-800">
                  {userData?.fullName}
                </div>

                {userData?.role === "user" && (
                  <div
                    className="md:hidden text-[#ff4d2d] font-medium cursor-pointer"
                    onClick={() => {
                      navigate("/my-orders");
                      setShowInfo(false);
                    }}
                  >
                    My Orders
                  </div>
                )}

                {/* LOGOUT */}
                <div
                  className="text-red-500 font-semibold cursor-pointer pt-1"
                  onClick={handleLogOut}
                >
                  Log Out
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MOBILE SEARCH BAR */}
      {showSearch && userData?.role === "user" && (
        <div className="md:hidden fixed top-[80px] left-0 w-full z-[9998] flex justify-center">
          <div className="w-[92%] h-[60px] bg-white rounded-2xl shadow-lg border flex items-center gap-4 px-4">
            <FaLocationDot className="text-[#ff4d2d] text-[22px]" />
            <div className="truncate w-[30%] text-gray-500 font-medium">
              {city || "Searching..."}
            </div>
            <IoIosSearch className="text-[#ff4d2d] text-[22px]" />
            <input
              placeholder="Search delicious foods..."
              className="flex-1 outline-none"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <RxCross2
              className="text-gray-500 text-[22px] cursor-pointer"
              onClick={() => setShowSearch(false)}
            />
          </div>
        </div>
      )}

      {/* SPACER */}
      {showSearch && userData?.role === "user" && (
        <div className="md:hidden h-[70px]" />
      )}
    </>
  );
}

export default Nav;
