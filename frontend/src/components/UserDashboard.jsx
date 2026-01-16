import React, { useRef, useState, useEffect } from "react";
import Nav from "./Nav";
import { categories } from "../category";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import CategoryCard from "./categoryCard";
import FoodCard from "./FoodCard";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import ClipLoader from "react-spinners/ClipLoader";
import { toast } from "react-toastify";

function UserDashboard() {
  const { city, shopsOfCity, itemsOfCity, searchItems } = useSelector(
    (state) => state.user
  );

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
    setUpdatedItems(itemsOfCity);

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

  return (
    <div className="w-screen min-h-screen flex flex-col gap-6 items-center bg-[#fff9f6]">
      <Nav />

      {/* SEARCH RESULTS */}
      {searchItems?.length > 0 && (
        <div className="w-full max-w-6xl bg-white shadow-md rounded-2xl p-5 mt-4">
          <h1 className="text-2xl font-semibold border-b pb-2">
            Search Results
          </h1>

          <div className="flex flex-wrap gap-6 justify-center mt-4">
            {searchItems.map((item, i) => (
              <FoodCard key={i} data={item} />
            ))}
          </div>
        </div>
      )}

      {/* CATEGORIES */}
      <div className="w-full max-w-6xl p-3">
        <h1 className="text-2xl font-semibold mb-3">
          Inspiration for your first order
        </h1>

        <div className="relative px-6">

          {cateBtns.left && (
            <button
              onClick={() => scroll(cateRef, "left")}
              className="
                absolute -left-1 top-1/2 -translate-y-1/2
                bg-[#ff4d2d] text-white p-3 rounded-full shadow
                z-20 pointer-events-auto
              "
            >
              <FaChevronLeft />
            </button>
          )}

          <div
            ref={cateRef}
            className="flex gap-4 overflow-x-auto scroll-smooth pb-2"
          >
            {categories.map((c, i) => (
              <CategoryCard
                key={i}
                name={c.category}
                image={c.image}
                onClick={() => handleFilter(c.category)}
              />
            ))}
          </div>

          {cateBtns.right && (
            <button
              onClick={() => scroll(cateRef, "right")}
              className="
                absolute -right-1 top-1/2 -translate-y-1/2
                bg-[#ff4d2d] text-white p-3 rounded-full shadow
                z-20 pointer-events-auto
              "
            >
              <FaChevronRight />
            </button>
          )}
        </div>
      </div>

      {/* SHOPS */}
      <div className="w-full max-w-6xl p-3">
        <h1 className="text-2xl font-semibold mb-3">
          Best shops in {city}
        </h1>

        {loadingShops ? (
          <div className="flex justify-center py-10">
            <ClipLoader size={45} color="#ff4d2d" />
          </div>
        ) : (
          <div className="relative px-6">

            {shopBtns.left && (
              <button
                onClick={() => scroll(shopRef, "left")}
                className="
                  absolute -left-1 top-1/2 -translate-y-1/2
                  bg-[#ff4d2d] text-white p-3 rounded-full shadow
                  z-20 pointer-events-auto
                "
              >
                <FaChevronLeft />
              </button>
            )}

            <div
              ref={shopRef}
              className="flex gap-4 overflow-x-auto scroll-smooth pb-2"
            >
              {shopsOfCity?.map((shop, i) => (
                <CategoryCard
                  key={i}
                  name={shop.name}
                  image={shop.image}
                  onClick={() => navigate(`/shop-items/${shop._id}`)}
                />
              ))}
            </div>

            {shopBtns.right && (
              <button
                onClick={() => scroll(shopRef, "right")}
                className="
                  absolute -right-1 top-1/2 -translate-y-1/2
                  bg-[#ff4d2d] text-white p-3 rounded-full shadow
                  z-20 pointer-events-auto
                "
              >
                <FaChevronRight />
              </button>
            )}
          </div>
        )}
      </div>

      {/* ITEMS */}
      <div className="w-full max-w-6xl p-3 mb-10">
        <h1 className="text-2xl font-semibold mb-3">Suggested items</h1>

        {loadingItems ? (
          <div className="flex justify-center py-10">
            <ClipLoader size={45} color="#ff4d2d" />
          </div>
        ) : updatedItems?.length > 0 ? (
          <div className="flex flex-wrap gap-6 justify-center">
            {updatedItems.map((item, i) => (
              <FoodCard key={i} data={item} />
            ))}
          </div>
        ) : (
          <div className="text-center font-semibold text-gray-600">
            No items available
          </div>
        )}
      </div>
    </div>
  );
}

export default UserDashboard;
