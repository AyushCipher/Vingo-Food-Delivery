import { sendMail } from "../config/mail.js";
import genToken from "../config/token.js"
import User from "../models/user.model.js"
import bcrypt from "bcryptjs"
import { verifyFirebaseIdToken } from "../config/firebaseAdmin.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"

// Body shape (fullName, email, password, role, mobile) is already validated
// by the signUpSchema zod middleware on this route.
const setAuthCookie = (res, token) => {
    const isProduction = process.env.NODE_ENV === "production";
    res.cookie("token", token, {
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax"
    })
}

export const signUp = asyncHandler(async (req, res) => {
    const { fullName, email, password, role, mobile } = req.body

    const findByEmail = await User.findOne({ email })
    if (findByEmail) {
        throw new ApiError(400, "Email already exists !")
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await User.create({
        fullName,
        email,
        role,
        mobile,
        password: hashedPassword
    })

    const token = await genToken(user._id)
    setAuthCookie(res, token)

    return res.status(201).json(user)
})

export const signIn = asyncHandler(async (req, res) => {
    const { password, email } = req.body

    const user = await User.findOne({ email })
    if (!user) {
        throw new ApiError(400, "User does not exist.")
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
        throw new ApiError(400, "Incorrect Password !")
    }

    const token = await genToken(user._id)
    setAuthCookie(res, token)

    return res.status(200).json(user)
})

export const signOut = asyncHandler(async (req, res) => {
    res.clearCookie("token")
    return res.status(200).json({ success: true, message: "Signed out successfully" })
})

export const googleAuth = asyncHandler(async (req, res) => {
    const { idToken, fullName, role, mobile } = req.body

    let decoded;
    try {
        decoded = await verifyFirebaseIdToken(idToken);
    } catch (err) {
        throw new ApiError(401, "Invalid or expired Google sign-in")
    }

    const email = decoded.email;
    if (!email) {
        throw new ApiError(400, "Google account has no email")
    }

    let user = await User.findOne({ email })

    if (!user) {
        if (!role) {
            throw new ApiError(400, "Role is required to create a new account")
        }
        user = await User.create({
            fullName: fullName || decoded.name || email.split("@")[0],
            email,
            role,
            mobile
        })
    }

    const token = await genToken(user._id)
    setAuthCookie(res, token)

    return res.status(201).json(user)
})

export const sendOtp = asyncHandler(async (req, res) => {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) throw new ApiError(404, "User not found")

    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    user.resetOtp = otp;
    user.otpExpires = Date.now() + 5 * 60 * 1000;
    user.isOtpVerified = false;

    await user.save();
    await sendMail(email, otp);

    return res.status(200).json({ success: true, message: "Email Sent Successfully!" });
})

export const verifyOtp = asyncHandler(async (req, res) => {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });
    if (!user || user.resetOtp !== otp || user.otpExpires < Date.now()) {
        throw new ApiError(400, "Invalid OTP!")
    }

    user.isOtpVerified = true;
    user.resetOtp = undefined;
    user.otpExpires = undefined;

    await user.save();

    return res.status(200).json({ success: true, message: "OTP verified !" });
})

export const resetPassword = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !user.isOtpVerified) {
        throw new ApiError(404, "OTP verification required")
    }

    // Only check if password is same when user has an existing password (not Google auth users)
    if (user.password) {
        const isSamePassword = await bcrypt.compare(password, user.password);
        if (isSamePassword) {
            throw new ApiError(400, "New password cannot be same as old password")
        }
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.isOtpVerified = false;

    await user.save();

    return res.status(200).json({ success: true, message: "Password Reset Successfully" });
})
