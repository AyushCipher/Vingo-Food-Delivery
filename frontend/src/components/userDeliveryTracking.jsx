import React, { useEffect, useState, useRef, useCallback } from "react";
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import scooter from "../assets/scooter.png";
import home from "../assets/home.png";
import axios from "axios";
import { serverUrl } from "../config";
import { ClipLoader } from "react-spinners";

const PRIMARY = "#ff4d2d";

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

function MapReadyHandler({ onReady }) {
  const map = useMap();
  useEffect(() => {
    if (map) map.whenReady(() => onReady());
  }, [map, onReady]);
  return null;
}

// ✅ Smooth moving marker - updates without re-render
function MovingMarker({ position, icon, children }) {
  const markerRef = useRef(null);
  useEffect(() => {
    if (markerRef.current && position) {
      markerRef.current.setLatLng(position);
    }
  }, [position]);
  if (!position) return null;
  return (
    <Marker position={position} icon={icon} ref={markerRef}>
      {children}
    </Marker>
  );
}

// ✅ Calculate distance between two coords in km
function getDistanceKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function UserDeliveryTracking({ orderId, userLocation, shopOrderId }) {
  const [deliveryLoc, setDeliveryLoc] = useState(null);
  const [routeCoords, setRouteCoords] = useState([]);
  const [eta, setEta] = useState(null);
  const [distance, setDistance] = useState(null);
  const [mapReady, setMapReady] = useState(false);

  // Track last location where route was fetched
  const lastRouteFetchRef = useRef({ lat: null, lng: null });
  const routeFetchedOnceRef = useRef(false);

  /* ---------- Fetch delivery boy location every 5s ---------- */
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

  /* ---------- Fetch route ONLY when delivery moves >200m ---------- */
  useEffect(() => {
    if (!deliveryLoc || !userLocation) return;

    const last = lastRouteFetchRef.current;
    const movedEnough =
      !routeFetchedOnceRef.current ||
      (last.lat &&
        getDistanceKm(last.lat, last.lng, deliveryLoc.lat, deliveryLoc.lng) > 0.2); // 200m threshold

    if (!movedEnough) return; // ✅ skip route recalc if barely moved

    lastRouteFetchRef.current = { lat: deliveryLoc.lat, lng: deliveryLoc.lng };
    routeFetchedOnceRef.current = true;

    const fetchRoute = async () => {
      try {
        const url = `https://router.project-osrm.org/route/v1/driving/${deliveryLoc.lng},${deliveryLoc.lat};${userLocation.lng},${userLocation.lat}?overview=full&geometries=geojson`;
        const res = await fetch(url);
        const data = await res.json();

        if (data?.routes?.length > 0) {
          const route = data.routes[0];
          const coords = route.geometry.coordinates.map(([lng, lat]) => [lat, lng]);
          setRouteCoords(coords);
          setDistance((route.distance / 1000).toFixed(1));
          setEta(Math.ceil(route.duration / 60));
        }
      } catch (err) {
        console.error("OSRM route error:", err);
        setRouteCoords([
          [deliveryLoc.lat, deliveryLoc.lng],
          [userLocation.lat, userLocation.lng],
        ]);
      }
    };

    fetchRoute();
  }, [deliveryLoc?.lat, deliveryLoc?.lng]);

  const handleMapReady = useCallback(() => setMapReady(true), []);

  if (!deliveryLoc) {
    return (
      <div className="w-full h-[400px] rounded-2xl overflow-hidden shadow-md mt-3 flex flex-col items-center justify-center bg-gray-50">
        <ClipLoader size={40} color={PRIMARY} />
        <p className="mt-3 text-gray-600">Locating delivery partner...</p>
      </div>
    );
  }

  const center = [
    (deliveryLoc.lat + userLocation.lat) / 2,
    (deliveryLoc.lng + userLocation.lng) / 2,
  ];

  return (
    <div className="w-full">
      {/* ✅ ETA BAR - fixed: eta > 0 prevents rendering "0" */}
      {eta > 0 && distance > 0 && (
        <div className="mb-2 px-4 py-2 rounded-xl bg-green-50 text-green-700 font-semibold text-sm flex items-center gap-2">
          📦 Estimated delivery in around {eta} mins · {distance} km away
        </div>
      )}

      <div className="w-full h-[400px] rounded-2xl overflow-hidden shadow-md relative">
        {/* Loading map spinner */}
        {!mapReady && (
          <div className="absolute inset-0 z-[1000] bg-white flex flex-col items-center justify-center">
            <ClipLoader size={45} color={PRIMARY} />
            <p className="mt-3 text-gray-600 font-medium text-sm">Loading map...</p>
          </div>
        )}

        <MapContainer center={center} zoom={14} style={{ height: "100%", width: "100%" }}>
          <MapReadyHandler onReady={handleMapReady} />
          <TileLayer
            attribution="© OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* ✅ Smooth moving delivery boy marker */}
          <MovingMarker
            position={[deliveryLoc.lat, deliveryLoc.lng]}
            icon={deliveryBoyIcon}
          >
            <Popup>Delivery Boy</Popup>
          </MovingMarker>

          {/* Customer marker */}
          <Marker position={[userLocation.lat, userLocation.lng]} icon={customerIcon}>
            <Popup>Your Address</Popup>
          </Marker>

          {/* Route */}
          {routeCoords.length > 0 && (
            <Polyline positions={routeCoords} color="#2563eb" weight={5} opacity={0.9} />
          )}
        </MapContainer>

        {/* ✅ Removed "Calculating route" overlay entirely - no more flicker */}
      </div>
    </div>
  );
}