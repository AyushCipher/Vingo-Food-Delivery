import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Polyline, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import scooter from "../assets/scooter.png";
import home from "../assets/home.png";
import axios from "axios";
import { serverUrl } from "../App";

// Marker icons
const deliveryBoyIcon = new L.Icon({
  iconUrl: scooter,
  iconSize: [40, 40],
  iconAnchor: [20, 40],
});

const customerIcon = new L.Icon({
  iconUrl: home,
  iconSize: [40, 40],
  iconAnchor: [20, 40],
});

export default function UserDeliveryTracking({ orderId, userLocation, shopOrderId }) {
  const [deliveryLoc, setDeliveryLoc] = useState(null);

  // 🔹 Fetch delivery boy location every 5 seconds
  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const res = await axios.get(
          `${serverUrl}/api/order/delivery-location/${orderId}/${shopOrderId}`,
          { withCredentials: true }
        );

        if (res.data.success && res.data.deliveryBoyLocation) {
          setDeliveryLoc(res.data.deliveryBoyLocation);
        }
      } catch (err) {
        console.error("Error fetching delivery boy location:", err);
      }
    };

    fetchLocation();
    const interval = setInterval(fetchLocation, 5000);
    return () => clearInterval(interval);
  }, [orderId, shopOrderId]);

  if (!deliveryLoc) return <p className="text-center mt-10">Loading map...</p>;

  const polylinePath = [
    [deliveryLoc.lat, deliveryLoc.lng],
    [userLocation.lat, userLocation.lng],
  ];

  const center = [
    (deliveryLoc.lat + userLocation.lat) / 2,
    (deliveryLoc.lng + userLocation.lng) / 2,
  ];

  return (
    <div className="w-full h-[400px] rounded-2xl overflow-hidden shadow-md mt-3">
      <MapContainer center={center} zoom={14} style={{ height: "100%", width: "100%" }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {/* 🔹 Delivery boy marker */}
        <Marker position={[deliveryLoc.lat, deliveryLoc.lng]} icon={deliveryBoyIcon}>
          <Popup>Delivery Boy</Popup>
        </Marker>

        {/* 🔹 User marker */}
        <Marker position={[userLocation.lat, userLocation.lng]} icon={customerIcon}>
          <Popup>Your Address</Popup>
        </Marker>

        {/* 🔹 Route line */}
        <Polyline positions={polylinePath} color="blue" weight={4} />
      </MapContainer>
    </div>
  );
}
