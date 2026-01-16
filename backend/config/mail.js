import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASS,
  }
});


export const sendMail = async (to, otp) => {
  await transporter.sendMail({
    from: `"Vingo Support" <${process.env.EMAIL}>`,
    to,
    subject: "🔐 Reset Your Vingo Password – OTP Verification",

    html: `
    <div style="font-family: Arial, sans-serif; background:#f6f6f6; padding: 30px;">
      <div style="max-width: 500px; margin:auto; background:#ffffff;
                  border-radius:10px; padding:25px; box-shadow:0 5px 15px rgba(0,0,0,0.08)">
        
        <h2 style="color:#ff4d2d; text-align:center; margin-bottom:10px;">
          Vingo Password Reset
        </h2>

        <p style="text-align:center; color:#555; font-size:14px;">
          Use the One-Time Password (OTP) below to reset your account password.
        </p>

        <div style="text-align:center; margin:25px 0;">
          <div style="display:inline-block; 
                      padding:14px 28px; 
                      font-size:28px; 
                      font-weight:bold; 
                      color:#ffffff; 
                      background:#ff4d2d; 
                      border-radius:8px; 
                      letter-spacing:3px;">
            ${otp}
          </div>
        </div>

        <p style="color:#555; font-size:14px;">
          This OTP is valid for <strong>5 minutes</strong>. 
          Please do not share it with anyone for security reasons.
        </p>

        <p style="color:#777; font-size:12px; margin-top:18px;">
          If you did not request this password reset, please ignore this email or contact our support team.
        </p>

        <hr style="border:none; border-top:1px solid #eee; margin:20px 0;">
        
        <p style="text-align:center; color:#999; font-size:12px;">
          © 2025 Vingo • Your trusted food delivery partner 🍽️
        </p>
      </div>
    </div>
    `
  });
};


export const sendOtpToUser = async (user, otp) => {
  await transporter.sendMail({
    from: `"Vingo Orders" <${process.env.EMAIL}>`,
    to: user.email,
    subject: "🛵 Vingo Delivery OTP",

    html: `
    <div style="font-family: Arial, sans-serif; background:#f6f6f6; padding: 30px;">
      <div style="max-width: 500px; margin:auto; background:#ffffff;
                  border-radius:10px; padding:25px; box-shadow:0 5px 15px rgba(0,0,0,0.08)">
        
        <h2 style="color:#ff4d2d; text-align:center; margin-bottom:10px;">
          Delivery Verification OTP
        </h2>

        <p style="text-align:center; color:#555; font-size:14px;">
          Share this OTP with your delivery partner to confirm your order.
        </p>

        <div style="text-align:center; margin:25px 0;">
          <div style="display:inline-block; 
                      padding:14px 28px; 
                      font-size:28px; 
                      font-weight:bold; 
                      color:#ffffff; 
                      background:#ff4d2d; 
                      border-radius:8px; 
                      letter-spacing:3px;">
            ${otp}
          </div>
        </div>

        <p style="color:#777; font-size:12px;">
          Do not share this OTP with anyone except your delivery partner.
        </p>

        <hr style="border:none; border-top:1px solid #eee; margin:20px 0;">
        
        <p style="text-align:center; color:#999; font-size:12px;">
          Thank you for choosing Vingo 🍕
        </p>
      </div>
    </div>
    `
  });
};

