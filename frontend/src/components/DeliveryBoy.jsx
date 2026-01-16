import React, { useEffect, useState } from "react";
import axios from "axios";
import { MdLocationOn, MdOutlineCheckCircle } from "react-icons/md";
import { useSelector } from "react-redux";
import Nav from "./Nav";
import { serverUrl } from "../App";
import DeliveryBoyTracking from "../pages/DeliveryBoyTracking";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { ClipLoader } from "react-spinners";
import { toast } from "react-toastify";

const PRIMARY = "#ff4d2d";

/* ---------------- FIX: BUILD 24-HOUR STATS ---------------- */
const buildHourlyStats = (rawStats = []) => {
  const base = Array.from({ length: 24 }, (_, hour) => ({
    hour,
    count: 0,
  }));

  rawStats.forEach(({ hour, count }) => {
    if (hour >= 0 && hour <= 23) {
      base[hour].count = count;
    }
  });

  return base;
};

export default function DeliveryBoy() {
  const { userData } = useSelector((state) => state.user);

  /* ROLE GUARD */
  if (userData?.role !== "deliveryBoy") return null;

  /* ================= STATE ================= */
  const [location, setLocation] = useState({ lat: null, lng: null });
  const [assignments, setAssignments] = useState([]);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [todayStats, setTodayStats] = useState([]);

  const [otp, setOtp] = useState("");
  const [showOtpBox, setShowOtpBox] = useState(false);

  const [loadingAssignments, setLoadingAssignments] = useState(true);
  const [loadingCurrent, setLoadingCurrent] = useState(true);
  const [acceptingOrder, setAcceptingOrder] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);

  /* ================= GPS ================= */
  useEffect(() => {
    if (!navigator.geolocation) {
      toast.error("Geolocation not supported");
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (pos) =>
        setLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        }),
      () => toast.error("Unable to access location"),
      { enableHighAccuracy: true }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  /* ================= UPDATE LOCATION ================= */
  useEffect(() => {
    if (!location.lat || !currentOrder) return;

    axios
      .post(
        `${serverUrl}/api/order/update-location`,
        {
          latitude: location.lat,
          longitude: location.lng,
          orderId: currentOrder._id,
          shopOrderId: currentOrder.shopOrder._id,
        },
        { withCredentials: true }
      )
      .catch(() => {});
  }, [location, currentOrder]);

  /* ================= ASSIGNMENTS ================= */
  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const res = await axios.get(`${serverUrl}/api/order/getassignments`, {
          withCredentials: true,
        });
        if (res.data.success) {
          setAssignments(res.data.assignments || []);
        }
      } catch (err) {
        // Only show error if it's a server error (500), not auth issues or network problems
        if (err?.response?.status >= 500) {
          toast.error("Failed to fetch assignments");
        }
        console.log("Assignment fetch error:", err?.response?.status || err.message);
      } finally {
        setLoadingAssignments(false);
      }
    };

    fetchAssignments();
    const i = setInterval(fetchAssignments, 8000);
    return () => clearInterval(i);
  }, []);

  /* ================= CURRENT ORDER ================= */
  useEffect(() => {
    const fetchCurrent = async () => {
      try {
        const res = await axios.get(`${serverUrl}/api/order/current-order`, {
          withCredentials: true,
        });
        setCurrentOrder(res.data.success ? res.data.order : null);
      } catch {
        setCurrentOrder(null);
      } finally {
        setLoadingCurrent(false);
        setAcceptingOrder(false); // Reset accepting state
      }
    };

    fetchCurrent();
    const i = setInterval(fetchCurrent, 8000);
    return () => clearInterval(i);
  }, []);

  /* ================= TODAY STATS (FIXED) ================= */
  useEffect(() => {
    axios
      .get(`${serverUrl}/api/order/stats/today`, { withCredentials: true })
      .then((res) => {
        if (res.data.success) {
          setTodayStats(buildHourlyStats(res.data.stats || []));
        }
      })
      .catch(() => {});
  }, []);

  /* ================= ACTIONS ================= */
  const acceptOrder = async (id) => {
    try {
      setAcceptingOrder(true);
      const res = await axios.get(
        `${serverUrl}/api/order/accept-assignment/${id}`,
        { withCredentials: true }
      );
      if (res.data.success) {
        setCurrentOrder(res.data.order);
        setAssignments((prev) => prev.filter((a) => a.assignmentId !== id));
        toast.success("Order accepted");
      }
    } catch {
      toast.error("Failed to accept order");
      setAcceptingOrder(false);
    }
  };

  const sendOtp = async () => {
    try {
      setSendingOtp(true);
      const res = await axios.post(
        `${serverUrl}/api/order/send-otp`,
        {
          orderId: currentOrder._id,
          shopOrderId: currentOrder.shopOrder._id,
        },
        { withCredentials: true }
      );
      if (res.data.success) {
        setShowOtpBox(true);
        toast.success("OTP sent to customer");
      }
    } catch {
      toast.error("Failed to send OTP");
    } finally {
      setSendingOtp(false);
    }
  };

  const verifyOtp = async () => {
    try {
      setVerifyingOtp(true);
      const res = await axios.post(
        `${serverUrl}/api/order/verify-otp`,
        {
          orderId: currentOrder._id,
          shopOrderId: currentOrder.shopOrder._id,
          otp,
        },
        { withCredentials: true }
      );

      if (res.data.success) {
        toast.success("Order delivered successfully");
        setCurrentOrder(null);
        setOtp("");
        setShowOtpBox(false);
      } else {
        toast.error("Invalid OTP");
      }
    } catch {
      toast.error("OTP verification failed");
    } finally {
      setVerifyingOtp(false);
    }
  };

  /* ================= UI ================= */
  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-[#fff1eb] to-[#fff9f6]">
      <Nav />

      <div className="w-full flex justify-center px-4 pb-14">
        <div className="w-full max-w-4xl space-y-6">
          {/* HEADER */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border">
            <h1 className="text-2xl font-bold text-[#ff4d2d]">
              Welcome, {userData.fullName}
            </h1>
            {location.lat && (
              <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                <MdLocationOn />
                {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
              </p>
            )}
          </div>

          {/* STATS */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border">
            <h2 className="font-bold mb-4 text-[#ff4d2d]">
              📊 Today's Deliveries
            </h2>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={todayStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="hour"
                  tickFormatter={(h) => `${h}:00`}
                  interval={2}
                />
                <YAxis
                  domain={[0, 20]}
                  ticks={[0, 5, 10, 15, 20]}
                  allowDecimals={false}
                />
                <Tooltip />
                <Bar dataKey="count" fill={PRIMARY} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* CURRENT / AVAILABLE */}
          {loadingCurrent || acceptingOrder ? (
            <div className="flex justify-center py-10">
              <ClipLoader color={PRIMARY} size={42} />
            </div>
          ) : currentOrder ? (
            <div className="bg-white rounded-3xl p-6 shadow-sm border">
              <h2 className="font-bold text-lg mb-2">🚴 Current Order</h2>
              <p className="text-sm text-gray-600 mb-3">
                {currentOrder.shopOrder.shop?.name}
              </p>

              <DeliveryBoyTracking currentOrder={currentOrder} />

              {!showOtpBox ? (
                <button
                  onClick={sendOtp}
                  disabled={sendingOtp}
                  className="mt-5 w-full bg-green-500 text-white py-3 rounded-xl font-semibold"
                >
                  {sendingOtp ? (
                    <ClipLoader size={18} color="#fff" />
                  ) : (
                    "Mark as Delivered"
                  )}
                </button>
              ) : (
                <div className="mt-5">
                  <input
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full border rounded-xl px-4 py-3 mb-3"
                    placeholder="Enter OTP"
                  />
                  <button
                    onClick={verifyOtp}
                    disabled={verifyingOtp}
                    className="w-full bg-[#ff4d2d] text-white py-3 rounded-xl font-semibold"
                  >
                    {verifyingOtp ? (
                      <ClipLoader size={18} color="#fff" />
                    ) : (
                      "Verify OTP"
                    )}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-6 shadow-sm border">
              <h2 className="font-bold mb-4 flex items-center gap-2">
                <MdOutlineCheckCircle color={PRIMARY} />
                Available Orders Nearby
              </h2>

              {loadingAssignments ? (
                <div className="flex justify-center py-6">
                  <ClipLoader color={PRIMARY} />
                </div>
              ) : assignments.length ? (
                assignments.map((o) => (
                  <div
                    key={o.assignmentId}
                    className="border rounded-2xl p-4 flex justify-between items-center mb-3"
                  >
                    <div className="max-w-[75%]">
                      <p className="font-semibold">{o.shopName}</p>

                      {o.address?.text && (
                        <p className="text-xs text-gray-500 flex gap-1 mt-1">
                          <MdLocationOn />
                          <span className="line-clamp-2">{o.address.text}</span>
                        </p>
                      )}

                      <p className="text-xs text-gray-500 mt-1">
                        {o.items.length} items • ₹{o.subtotal}
                      </p>
                    </div>

                    <button
                      onClick={() => acceptOrder(o.assignmentId)}
                      className="bg-[#ff4d2d] text-white px-5 py-2 rounded-xl font-semibold"
                    >
                      Accept
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-gray-400 text-sm">No new assignments</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
