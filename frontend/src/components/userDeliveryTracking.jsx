import React, { useEffect, useState, useCallback } from "react";
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import scooter from "../assets/scooter.png";
import home from "../assets/home.png";
import axios from "axios";
import { serverUrl } from "../App";
import { ClipLoader } from "react-spinners";

const PRIMARY = "#ff4d2d";

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

/* ---------------- MAP READY HANDLER ---------------- */
function MapReadyHandler({ onReady }) {
  const map = useMap();
  
  useEffect(() => {
    if (map) {
      map.whenReady(() => {
        onReady();
      });
    }
  }, [map, onReady]);
  
  return null;
}

export default function UserDeliveryTracking({ orderId, userLocation, shopOrderId }) {
  const [deliveryLoc, setDeliveryLoc] = useState(null);
  const [routeCoords, setRouteCoords] = useState([]);
  const [eta, setEta] = useState(null);
  const [distance, setDistance] = useState(null);
  const [loadingRoute, setLoadingRoute] = useState(false);
  const [mapReady, setMapReady] = useState(false);

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

  // 🔹 Fetch route from OSRM when delivery location changes
  useEffect(() => {
    if (!deliveryLoc || !userLocation) return;

    const fetchRoute = async () => {
      try {
        setLoadingRoute(true);
        
        const url = `https://router.project-osrm.org/route/v1/driving/${deliveryLoc.lng},${deliveryLoc.lat};${userLocation.lng},${userLocation.lat}?overview=full&geometries=geojson`;
        
        const res = await fetch(url);
        const data = await res.json();

        if (data?.routes?.length > 0) {
          const route = data.routes[0];

          // polyline coords
          const coords = route.geometry.coordinates.map(
            ([lng, lat]) => [lat, lng]
          );
          setRouteCoords(coords);

          // distance (meters → km)
          setDistance((route.distance / 1000).toFixed(1));

          // duration (seconds → minutes)
          setEta(Math.ceil(route.duration / 60));
        }
      } catch (err) {
        console.error("OSRM route error:", err);
        // Fallback to straight line if OSRM fails
        setRouteCoords([
          [deliveryLoc.lat, deliveryLoc.lng],
          [userLocation.lat, userLocation.lng]
        ]);
      } finally {
        setLoadingRoute(false);
      }
    };

    fetchRoute();
  }, [deliveryLoc?.lat, deliveryLoc?.lng, userLocation?.lat, userLocation?.lng]);

  if (!deliveryLoc) {
    return (
      <div className="w-full h-[400px] rounded-2xl overflow-hidden shadow-md mt-3 flex flex-col items-center justify-center bg-gray-50">
        <ClipLoader size={40} color={PRIMARY} />
        <p className="mt-3 text-gray-600">Loading map...</p>
      </div>
    );
  }

  const center = [
    (deliveryLoc.lat + userLocation.lat) / 2,
    (deliveryLoc.lng + userLocation.lng) / 2,
  ];

  return (
    <div className="w-full">
      {/* ETA BAR */}
      {eta && distance && (
        <div className="mb-2 px-4 py-2 rounded-xl bg-green-50 text-green-700 font-semibold text-sm flex items-center gap-2">
          📦 Estimated delivery in around {eta} mins :- {distance} km away
        </div>
      )}

      <div className="w-full h-[400px] rounded-2xl overflow-hidden shadow-md relative">
        {/* Loading spinner overlay */}
        {!mapReady && (
          <div className="absolute inset-0 z-[1000] bg-white flex flex-col items-center justify-center">
            <ClipLoader size={45} color={PRIMARY} />
            <p className="mt-3 text-gray-600 font-medium text-sm">Loading map...</p>
          </div>
        )}

        <MapContainer center={center} zoom={14} style={{ height: "100%", width: "100%" }}>
          <MapReadyHandler onReady={() => setMapReady(true)} />
          
          <TileLayer 
            attribution="© OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" 
          />

          {/* 🔹 Delivery boy marker */}
          <Marker position={[deliveryLoc.lat, deliveryLoc.lng]} icon={deliveryBoyIcon}>
            <Popup>Delivery Boy</Popup>
          </Marker>

          {/* 🔹 User marker */}
          <Marker position={[userLocation.lat, userLocation.lng]} icon={customerIcon}>
            <Popup>Your Address</Popup>
          </Marker>

          {/* 🔹 Route line - now uses road path from OSRM */}
          {routeCoords.length > 0 && (
            <Polyline 
              positions={routeCoords} 
              color="#2563eb" 
              weight={5} 
              opacity={0.9}
            />
          )}
        </MapContainer>

        {/* Route calculation overlay */}
        {mapReady && loadingRoute && (
          <div className="absolute inset-0 z-[999] bg-white/70 flex flex-col items-center justify-center">
            <ClipLoader size={35} color={PRIMARY} />
            <p className="mt-2 text-gray-600 font-medium text-sm">Calculating route...</p>
          </div>
        )}
      </div>
    </div>
  );
}
