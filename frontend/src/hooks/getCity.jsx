import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setCity } from "../redux/userSlice";

function getCity() {
  const dispatch = useDispatch();

  useEffect(() => {
    if (!("geolocation" in navigator)) return;

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const apiKey = import.meta.env.VITE_GEOAPIKEY;

          const res = await fetch(
            `https://api.geoapify.com/v1/geocode/reverse?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&apiKey=${apiKey}`
          );

          const data = await res.json();

          const city =
            data?.features?.[0]?.properties?.city ||
            data?.features?.[0]?.properties?.town ||
            data?.features?.[0]?.properties?.village ||
            data?.features?.[0]?.properties?.state ||
            "Unknown";

          dispatch(setCity(city));
        } catch (err) {
          console.log("City fetch error:", err);
        }
      },
      (err) => console.log("Location error:", err),
      { enableHighAccuracy: true }
    );
  }, [dispatch]);
}

export default getCity;
