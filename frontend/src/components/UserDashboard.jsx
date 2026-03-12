import React, { useRef, useState, useEffect } from "react";
import Nav from "./Nav";
import UserHomeTabs from "./UserHomeTabs";
import { categories } from "../category";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import CategoryCard from "./CategoryCard";
import FoodCard from "./FoodCard";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import ClipLoader from "react-spinners/ClipLoader";
import { toast } from "react-toastify";
import { getSocket } from "../socket";

function UserDashboard() {
  const { city, shopsOfCity, itemsOfCity, searchItems } = useSelector(
    (state) => state.user
  );
  const dispatch = useDispatch();

  const navigate = useNavigate();

  const cateRef = useRef(null);
  const shopRef = useRef(null);

  const [updatedItems, setUpdatedItems] = useState([]);

  const [cateBtns, setCateBtns] = useState({ left: false, right: false });
  const [shopBtns, setShopBtns] = useState({ left: false, right: false });

  const [loadingShops, setLoadingShops] = useState(true);
  const [loadingItems, setLoadingItems] = useState(true);

  const [shopsFetched, setShopsFetched] = useState(false);
  const [itemsFetched, setItemsFetched] = useState(false);

  // ---------- FILTER ----------
  const handleFilter = (category) => {
    if (!itemsOfCity) return;
    if (category === "All") setUpdatedItems(itemsOfCity);
    else setUpdatedItems(itemsOfCity.filter((i) => i.category === category));
  };

  // ---------- UPDATE BUTTONS ----------
  const updateButtons = (ref, setFn) => {
    const el = ref.current;
    if (!el) return;

    setFn({
      left: el.scrollLeft > 5,
      right: el.scrollLeft + el.clientWidth < el.scrollWidth - 10,
    });
  };

  // ---------- SCROLL ----------
  const scroll = (ref, dir) => {
    ref.current?.scrollBy({
      left: dir === "left" ? -300 : 300,
      behavior: "smooth",
    });
  };

  // ---------- SHOPS FETCH WATCH ----------
  useEffect(() => {
    if (shopsOfCity === null) return;

    setLoadingShops(false);
    setShopsFetched(true);

    if (shopsFetched && shopsOfCity.length === 0) {
      toast.error("No shops found in this city", { position: "top-right" });
    }

    updateButtons(shopRef, setShopBtns);
  }, [shopsOfCity, shopsFetched]);

  // ---------- ITEMS FETCH WATCH ----------
  useEffect(() => {
    if (itemsOfCity === null) return;
    setLoadingItems(false);
    setItemsFetched(true);
    // Only show available items
    setUpdatedItems(itemsOfCity.filter(item => item.availability !== false));
    if (itemsFetched && itemsOfCity.length === 0) {
      toast.error("No food items available in this city", {
        position: "top-right",
      });
    }
  }, [itemsOfCity, itemsFetched]);

  // ---------- SCROLL BUTTON LOGIC ----------
  useEffect(() => {
    const cate = cateRef.current;
    const shop = shopRef.current;

    const updateCate = () => updateButtons(cateRef, setCateBtns);
    const updateShop = () => updateButtons(shopRef, setShopBtns);

    cate?.addEventListener("scroll", updateCate);
    shop?.addEventListener("scroll", updateShop);

    updateCate();
    updateShop();

    return () => {
      cate?.removeEventListener("scroll", updateCate);
      shop?.removeEventListener("scroll", updateShop);
    };
  }, []);

  // ---------- SOCKET LISTENER ----------
  useEffect(() => {
    const socket = getSocket();
    const handleAvailabilityUpdate = (data) => {
      if (!city || data.city !== city) return;
      // Update local state for UI
      setUpdatedItems((prev) =>
        prev.map((item) =>
          item._id === data.itemId
            ? { ...item, availability: data.availability }
            : item
        )
      );
      // Update Redux state for itemsOfCity
      dispatch({
        type: "user/setItemsOfCity",
        payload: itemsOfCity.map((item) =>
          item._id === data.itemId
            ? { ...item, availability: data.availability }
            : item
        ),
      });
    };
    socket.on("item:availabilityUpdated", handleAvailabilityUpdate);
    return () => {
      socket.off("item:availabilityUpdated", handleAvailabilityUpdate);
    };
  }, [city, itemsOfCity, dispatch]);

  return (
    <div className="w-screen min-h-screen flex flex-col gap-6 items-center bg-[#fff9f6]">
      <Nav />
      <UserHomeTabs />
    </div>
  );
}

export default UserDashboard;
