import axios from "axios";
import React, { useEffect } from "react";
import { serverUrl } from "../App";
import { useDispatch, useSelector } from "react-redux";
import { setShopsOfCity, setUserData } from "../redux/userSlice";


function getShopsByCity() {
  const dispatch = useDispatch();
  const { city, userData } = useSelector((state) => state.user);
  
  useEffect(() => {

  console.log("HOOK TRIGGERED — city =", city, "role =", userData?.role);

  if (!userData || userData.role !== "user") return;
  if (!city) return;

  const fetch = async () => {
    try {
      const res = await axios.get(
        `${serverUrl}/api/shop/getshopsbycity/${city}`,
        { withCredentials: true }
      );

      console.log("API SHOP RESULT =", res.data);

      dispatch(setShopsOfCity(res.data));

    } catch (err) {
      console.log("API ERROR", err);
    }
  };

  fetch();

}, [city, userData]);


}

export default getShopsByCity;
