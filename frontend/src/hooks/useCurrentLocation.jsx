import { useEffect, useState } from "react";

export default function useCurrentLocation() {
  const [location, setLocation] = useState({ lat: null, lng: null });
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const GEOAPIFY_API_KEY = import.meta.env.VITE_GEOAPIKEY;

  useEffect(() => {
    if (!("geolocation" in navigator)) {
      setError("Geolocation not supported");
      return;
    }

    setLoading(true);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;

          setLocation({ lat, lng });

          const res = await fetch(
            `https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lng}&apiKey=${GEOAPIFY_API_KEY}`
          );

          const data = await res.json();
          const props = data?.features?.[0]?.properties || {};

          const fullAddress =
            [
              props.address_line1,
              props.address_line2,
              props.city,
              props.state,
              props.postcode,
              props.country,
            ]
              .filter(Boolean)
              .join(", ") || "Unknown Location";

          setAddress(fullAddress);
        } catch (err) {
          console.error("Location fetch error:", err);
          setError("Unable to fetch address");
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        console.error("Geolocation error:", err);
        setError("Location permission denied or unavailable");
        setLoading(false);
      },
      { enableHighAccuracy: true }
    );
  }, []);

  return {
    location,
    address,
    loading,
    error,
  };
}
