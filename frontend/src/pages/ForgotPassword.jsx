import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { serverUrl } from "../App";

export default function ForgotPassword() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const primaryColor = "#ff4d2d";


  // STEP 1 — SEND OTP
  const handleSendOtp = async () => {
    if (!email) {
      return toast.error("Please enter your email");
    }

    setLoading(true);

    try {
      const res = await axios.post(`${serverUrl}/api/auth/sendotp`, { email }, { withCredentials: true });
      console.log(res);

      toast.success(res.data.message);
      setStep(2);
    } catch (error) {
      toast.error(error?.response?.data?.message || "OTP sending failed");
    }
    setLoading(false);
  };


  // STEP 2 — VERIFY OTP
  const handleVerifyOtp = async () => {
    if (!otp) return toast.error("Enter OTP");

    setLoading(true);
    try {
      const res = await axios.post(`${serverUrl}/api/auth/verifyotp`, { email, otp }, { withCredentials: true });
      
      toast.success(res.data.message);
      setStep(3);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Invalid OTP");
    }
    setLoading(false);
  };


  // STEP 3 — RESET PASSWORD
  const handleResetPassword = async () => {
    if (newPassword !== confirmPassword){
      return toast.error("Passwords do not match");
    }
    setLoading(true);
    
    try {
      const res = await axios.post(`${serverUrl}/api/auth/resetpassword`, { email, password:newPassword }, { withCredentials: true });

      toast.success(res.data.message);
      navigate("/signin");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Reset failed");
    }
    setLoading(false);
  };


  return (
    <div className="flex items-center justify-center min-h-screen bg-[#fff9f6] px-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-8 border border-gray-200">

        <h1 className="text-3xl font-bold mb-2 text-center" style={{ color: primaryColor }}>
          Forgot Password
        </h1>

        <p className="text-gray-600 text-center mb-8">
          Follow the steps to reset your password
        </p>


        {/* STEP 1 — EMAIL */}
        {step === 1 && (
          <>
            <label className="block text-gray-700 font-medium mb-1">
              Email
            </label>

            <input
              type="email"
              placeholder="Enter your email"
              className="w-full border rounded-lg px-3 py-2 mb-4 focus:outline-none focus:border-orange-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <button
              type="button"
              disabled={loading}
              onClick={handleSendOtp}
              className="w-full py-2 rounded-lg text-white font-semibold bg-[#ff4d2d] hover:bg-[#e64323]"
            >
              {loading ? "Sending..." : "Send OTP"}
            </button>
          </>
        )}


        {/* STEP 2 — OTP */}
        {step === 2 && (
          <>
            <label className="block text-gray-700 font-medium mb-1">
              Enter OTP
            </label>

            <input
              type="text"
              placeholder="Enter OTP"
              className="w-full border rounded-lg px-3 py-2 mb-4 focus:outline-none focus:border-orange-500"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />

            <button
              type="button"
              disabled={loading}
              onClick={handleVerifyOtp}
              className="w-full py-2 rounded-lg text-white font-semibold bg-[#ff4d2d] hover:bg-[#e64323]"
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </button>
          </>
        )}


        {/* STEP 3 — PASSWORD */}
        {step === 3 && (
          <>
            <label className="block text-gray-700 font-medium mb-1">
              New Password
            </label>

            <input
              type="password"
              placeholder="Enter new password"
              className="w-full border rounded-lg px-3 py-2 mb-4"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />

            <label className="block text-gray-700 font-medium mb-1">
              Confirm Password
            </label>

            <input
              type="password"
              placeholder="Confirm password"
              className="w-full border rounded-lg px-3 py-2 mb-4"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />

            <button
              type="button"
              disabled={loading}
              onClick={handleResetPassword}
              className="w-full py-2 rounded-lg text-white font-semibold bg-[#ff4d2d] hover:bg-[#e64323]"
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </>
        )}

        <p className="mt-6 text-center text-gray-600">
          Remember your password?{" "}
          <Link to="/signin" className="font-semibold" style={{ color: primaryColor }}>
            Back to Login
          </Link>
        </p>

      </div>
    </div>
  );
}
