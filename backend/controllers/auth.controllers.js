import { sendMail } from "../config/mail.js";
import genToken from "../config/token.js"
import User from "../models/user.model.js"
import bcrypt from "bcryptjs"

export const signUp = async (req,res)=>{
    try {
        const {fullName, email, password, role, mobile} = req.body

        const findByEmail = await User.findOne({email})
        if(findByEmail){
            return res.status(400).json({ message:"Email already exists !" })
        }

        if (!fullName || !email || !password) {
            return res.status(400).json({ message: "Required fields missing" });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if(!emailRegex.test(email)){
            return res.status(400).json({ message: "Invalid email format" });
        }

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_])[A-Za-z\d\W_]{8,}$/;
        if(!passwordRegex.test(password)){
            return res.status(400).json({
            message: "Password must be at least 8 characters & include 1 uppercase, 1 lowercase, 1 number, and 1 special character"
        });
        }

        if (mobile && !/^\d{10}$/.test(mobile)) {
            return res.status(400).json({ message: "Invalid mobile number" });
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

        res.cookie("token", token, {
            httpOnly: true,
            maxAge: 7 * 24 * 60 * 60 * 1000,
            secure: false,
            sameSite: "Strict"
        })

        return res.status(201).json(user) 

    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: `Signup error: ${error}` })
    }
    }


export const signIn = async (req,res)=>{
    try {
        const {password,email} = req.body
       
        const user = await User.findOne({email})
        if(!user){
            return res.status(400).json({ message: "User does not exist." })
        }

        const isMatch = await bcrypt.compare(password, user.password)

        if(!isMatch){
            return res.status(400).json({ message: "Incorrect Password !" })
        }

        const token = await genToken(user._id)

        res.cookie("token",token,{
            httpOnly: true,
            maxAge: 7 * 24 * 60 * 60 * 1000,
            secure: false,
            sameSite: "Strict"
        })

        return res.status(200).json(user)

    } catch (error) {
        return res.status(500).json({ message:`Signin error: ${error}` })
    }
}


export const signOut = async (req,res)=>{
    try {
        res.clearCookie("token")
        return res.status(200).json({ message:"Signed out successfully" })
    } catch (error) {
        return res.status(500).json({ message:`Signout error: ${error}` })
    }
}


export const googleAuth = async (req,res)=>{
    try {
        const {fullName, email, role, mobile} = req.body
        
        let user = await User.findOne({email})
        
        if(!user) {
            user = await User.create({
              fullName,
              email,
              role,
              mobile
          })
        }
        
        const token = await genToken(user._id)

        res.cookie("token",token,{
            httpOnly: true,
            maxAge: 7 * 24 * 60 * 60 * 1000,
            secure: false,
            sameSite: "Strict"
        })

        return res.status(201).json(user)

    } catch (error) {
        console.log(error)
        return res.status(500).json({message:`Signup with google error: ${error}`})
    }
}


export const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    user.resetOtp = otp;
    user.otpExpires = Date.now() + 5 * 60 * 1000;
    user.isOtpVerified = false;

    await user.save();
    await sendMail(email, otp);

    return res.status(200).json({ message: "Email Sent Successfully!" });
  } catch (error) {
    return res.status(500).json({ message: `Send OTP Error: ${error}` });
  }
};


export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });
    if (!user || user.resetOtp !== otp || user.otpExpires < Date.now()) {
      return res.status(400).json({ message: "Invalid OTP!" });
    }

    user.isOtpVerified = true;
    user.resetOtp = undefined;
    user.otpExpires = undefined;

    await user.save();

    return res.status(200).json({ message: "OTP verified !" });
  } catch (error) {
    return res.status(500).json({ message: `Verify OTP Error: ${error}` });
  }
};


export const resetPassword = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !user.isOtpVerified) {
      return res.status(404).json({ message: "OTP verification required" });
    }

    const isSamePassword = await bcrypt.compare(password, user.password);
    if (isSamePassword) {
      return res.status(400).json({ message: "New password cannot be same as old password" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.isOtpVerified = false;

    await user.save();

    return res.status(200).json({ message: "Password Reset Successfully" });
  } catch (error) {
    return res.status(500).json({ message: `Reset Password Error: ${error}` });
  }
};




