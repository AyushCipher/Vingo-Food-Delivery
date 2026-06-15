import axios from "axios";
import React, { useEffect } from "react";
import { serverUrl } from "../App";
import { useDispatch, useSelector } from "react-redux";
import { setShopsOfCity, setUserData } from "../redux/userSlice";


function getShopsByCity() {
  const dispatch = useDispatch();
  const { city, userData } = useSelector((state) => state.user);
  
  useEffect(() => {
    if (!userData || userData.role !== "user" || !city) return;
    const fetch = async () => {
      try {
        const res = await axios.get(
          `${serverUrl}/api/shop/getshopsbycity/${city}`,
          { withCredentials: true }
        );
        dispatch(setShopsOfCity(res.data));
      } catch (err) {
        // API error (silently fail)
      }
    };
    fetch();
  }, [city, userData]);
  return null;


}

export default getShopsByCity;
