import React, { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { Link } from "react-router-dom";
import axios from "axios";
import { serverUrl } from "../App";
import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../../utils/firebase";
import { useDispatch } from "react-redux";
import { setUserData } from "../redux/userSlice";
import { toast } from "react-toastify";
import ClipLoader from "react-spinners/ClipLoader";

export default function SignIn() {

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false); 
  const [googleLoading, setGoogleLoading] = useState(false);

  const primaryColor = "#ff4d2d";
  const hoverColor = "#e64323";
  const bgColor = "#fff9f6";
  const borderColor = "#ddd";

  const dispatch = useDispatch();

  // EMAIL SIGN IN
  const handleSignIn = async () => {
    setLoading(true);

    try {
      const result = await axios.post(
        `${serverUrl}/api/auth/signin`,
        { email, password },
        { withCredentials: true }
      );

      dispatch(setUserData(result.data));
      toast.success("Logged in successfully!", {
        position: "top-right",
      });

    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed. Try again.", {
        position: "top-right",
      });
      console.log(error);

    } finally {
      setLoading(false);
    }
  };

  // GOOGLE SIGN IN
  const handleGoogleAuth = async () => {
    setGoogleLoading(true);

    try {
      const result = await signInWithPopup(auth, provider);

      if (result) {
        const { data } = await axios.post(
          `${serverUrl}/api/auth/googleauth`,
          { email: result.user.email },
          { withCredentials: true }
        );

        dispatch(setUserData(data));
        toast.success("Logged in successfully!", {
          position: "top-right",
        });
      }

    } catch (error) {
      toast.error("Google Sign-In failed. Try again.", {
        position: "top-right",
      });
      console.log(error);

    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ backgroundColor: bgColor }}
    >
      <div
        className="bg-white rounded-xl shadow-lg w-full max-w-md p-8"
        style={{ border: `1px solid ${borderColor}` }}
      >
        <h1 className="text-3xl font-bold mb-2" style={{ color: primaryColor }}>
          Vingo
        </h1>

        <p className="text-gray-600 mb-8">
          Welcome back! Please sign in to continue enjoying delicious food
          deliveries.
        </p>

        {/* Email */}
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-1">Email</label>
          <input
            type="email"
            placeholder="Enter your email"
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:border-orange-500"
            style={{ borderColor }}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading || googleLoading}
          />
        </div>

        {/* Password */}
        <div className="mb-2">
          <label className="block text-gray-700 font-medium mb-1">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              className="w-full border rounded-lg px-3 py-2 pr-10 focus:outline-none focus:border-orange-500"
              style={{ borderColor }}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading || googleLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-2.5 text-gray-500"
            >
              {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
            </button>
          </div>
        </div>

        {/* Forgot Password */}
        <div className="text-right mb-4">
          <Link
            to="/forgot-password"
            style={{ color: primaryColor }}
            className="text-sm font-medium hover:underline"
          >
            Forgot Password?
          </Link>
        </div>

        {/* Sign In Button */}
        <button
          disabled={loading}
          onClick={handleSignIn}
          className="
            w-full font-semibold py-2 rounded-lg
            bg-[#ff4d2d] text-white
            hover:bg-[#e64323]
            transition duration-200
            disabled:opacity-60 disabled:cursor-not-allowed
          "
        >
          {loading ? <ClipLoader size={22} color="white" /> : "Sign In"}
        </button>


        {/* Google Auth */}
        <button
          disabled={loading || googleLoading}
          className="w-full mt-4 flex items-center justify-center gap-2 border rounded-lg px-4 py-2 transition duration-200"
          style={{ borderColor }}
          onClick={handleGoogleAuth}
        >
          {googleLoading ? (
            <ClipLoader size={22} />
          ) : (
            <>
              <FcGoogle size={20} />
              <span className="font-medium text-gray-700">
                Sign in with Google
              </span>
            </>
          )}
        </button>

        {/* Signup link */}
        <p className="mt-6 text-center text-gray-600">
          Don’t have an account?{" "}
          <Link
            to="/signup"
            className="font-semibold"
            style={{ color: primaryColor }}
          >
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}