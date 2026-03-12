import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { ClipLoader } from "react-spinners";

import home from "../assets/home.png";
import scooter from "../assets/scooter.png";

const PRIMARY = "#ff4d2d";

/* ---------------- ICONS ---------------- */
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

/* ---------------- SMOOTH MARKER MOVER ---------------- */
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

/* ---------------- MAP READY HANDLER ---------------- */
function MapReadyHandler({ onReady }) {
  const map = useMap();
  useEffect(() => {
    if (map) {
      map.whenReady(() => onReady());
    }
  }, [map, onReady]);
  return null;
}

/* ---------------- COMPONENT ---------------- */
export default function DeliveryBoyTracking({ currentOrder }) {
  const [routeCoords, setRouteCoords] = useState([]);
  const [eta, setEta] = useState(null);
  const [distance, setDistance] = useState(null);
  const [loadingRoute, setLoadingRoute] = useState(false);
  const [mapReady, setMapReady] = useState(false);

  // Track previous customer coords to avoid re-fetching route
  const prevCustomerRef = useRef({ lat: null, lng: null });
  const routeFetchedRef = useRef(false);

  if (!currentOrder) return null;

  /* ---------------- COORDS ---------------- */
  const deliveryLat = currentOrder?.deliveryBoyLocation?.lat;
  const deliveryLng = currentOrder?.deliveryBoyLocation?.lng;
  const customerLat = currentOrder?.customer?.lat;
  const customerLng = currentOrder?.customer?.lng;

  const hasDeliveryCoords = deliveryLat && deliveryLng;
  const hasCustomerCoords = customerLat && customerLng;
  const hasCoords = hasDeliveryCoords && hasCustomerCoords;

  const center = hasDeliveryCoords
    ? [deliveryLat, deliveryLng]
    : [28.6139, 77.209];

  /* ---------------- FETCH ROUTE (only when customer location changes) ---------------- */
  useEffect(() => {
    if (!hasCoords) return;

    const prev = prevCustomerRef.current;
    const customerChanged =
      prev.lat !== customerLat || prev.lng !== customerLng;

    // Only fetch if customer location changed or first time
    if (!routeFetchedRef.current || customerChanged) {
      prevCustomerRef.current = { lat: customerLat, lng: customerLng };
      routeFetchedRef.current = true;

      const fetchRoute = async () => {
        try {
          setLoadingRoute(true);
          const url = `https://router.project-osrm.org/route/v1/driving/${deliveryLng},${deliveryLat};${customerLng},${customerLat}?overview=full&geometries=geojson`;
          const res = await fetch(url);
          const data = await res.json();

          if (data?.routes?.length > 0) {
            const route = data.routes[0];
            const coords = route.geometry.coordinates.map(
              ([lng, lat]) => [lat, lng]
            );
            setRouteCoords(coords);
            setDistance((route.distance / 1000).toFixed(1));
            setEta(Math.ceil(route.duration / 60));
          }
        } catch (err) {
          console.error("OSRM route error:", err);
        } finally {
          setLoadingRoute(false);
        }
      };

      fetchRoute();
    }
  }, [customerLat, customerLng]); // ✅ only re-fetch when CUSTOMER changes, not delivery boy

  const handleMapReady = useCallback(() => setMapReady(true), []);

  /* ---------------- UI ---------------- */
  return (
    <div className="w-full relative">
      {/* ETA BAR */}
      {eta > 0 && distance > 0 && (
        <div className="mb-2 px-4 py-2 rounded-xl bg-blue-50 text-blue-700 font-semibold text-sm flex items-center gap-2">
          📦 Estimated delivery in around {eta} mins :- {distance} km away
        </div>
      )}

      <div className="w-full h-[420px] rounded-xl overflow-hidden shadow-md border relative">
        {/* Loading spinner - until map is ready */}
        {!mapReady && (
          <div className="absolute inset-0 z-[1000] bg-white flex flex-col items-center justify-center">
            <ClipLoader size={45} color={PRIMARY} />
            <p className="mt-3 text-gray-600 font-medium text-sm">Loading map...</p>
          </div>
        )}

        <MapContainer
          center={center}
          zoom={14}
          style={{ height: "100%", width: "100%" }}
        >
          <MapReadyHandler onReady={handleMapReady} />

          <TileLayer
            attribution="© OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* ✅ Delivery Boy - moves smoothly without re-render */}
          <MovingMarker
            position={hasDeliveryCoords ? [deliveryLat, deliveryLng] : null}
            icon={deliveryBoyIcon}
          >
            <Popup>Delivery Boy</Popup>
          </MovingMarker>

          {/* Customer */}
          {hasCustomerCoords && (
            <Marker
              position={[customerLat, customerLng]}
              icon={customerIcon}
            >
              <Popup>Customer</Popup>
            </Marker>
          )}

          {/* Route */}
          {routeCoords.length > 0 && (
            <Polyline
              positions={routeCoords}
              color="#2563eb"
              weight={5}
              opacity={0.9}
            />
          )}
        </MapContainer>

        {/* Route calculating overlay */}
        {mapReady && loadingRoute && (
          <div className="absolute inset-0 z-[999] bg-white/70 flex flex-col items-center justify-center">
            <ClipLoader size={35} color={PRIMARY} />
            <p className="mt-2 text-gray-600 font-medium text-sm">Calculating best route…</p>
          </div>
        )}
      </div>
    </div>
  );
}