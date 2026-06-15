import axios from "axios";
import React, { useEffect, useRef } from "react";
import { serverUrl } from "../App";
import { useDispatch, useSelector } from "react-redux";
import { setShopsOfCity, setUserData } from "../redux/userSlice";

function updateLocation() {
  const { userData, socket } = useSelector((state) => state.user);
  const watchIdRef = useRef(null);

  useEffect(() => {
    // Don't run if user is not logged in
    if (!userData) return;

    async function updateMyLocation(lat, lng) {
      try {
        await axios.post(
          serverUrl + "/api/user/update-location",
          {
            latitude: lat,
            longitude: lng,
          },
          { withCredentials: true }
        );

        socket?.emit("user:location:update", {
          latitude: lat,
          longitude: lng,
        });
      } catch (error) {
        // Silently ignore location update errors
      }
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        updateMyLocation(pos.coords.latitude, pos.coords.longitude);
      },
      (err) => {
        // Silently ignore geolocation errors
      },
      { enableHighAccuracy: false }
    );

    // Cleanup: stop watching when userData changes or component unmounts
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, [userData]);
}

export default updateLocation;