import axios from "axios";
import React, { useEffect, useRef } from "react";
import { serverUrl } from "../config";
import { useSelector } from "react-redux";

function useUpdateLocation() {
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
      } catch {
        // Silently ignore location update errors
      }
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        updateMyLocation(pos.coords.latitude, pos.coords.longitude);
      },
      () => {
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

export default useUpdateLocation;