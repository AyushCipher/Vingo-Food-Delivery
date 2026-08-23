import { z } from "zod";

// Same rule the controller enforced inline: 8+ chars, upper, lower, digit, symbol.
const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[a-z]/, "Password must include a lowercase letter")
  .regex(/[A-Z]/, "Password must include an uppercase letter")
  .regex(/\d/, "Password must include a number")
  .regex(/[\W_]/, "Password must include a special character");

const mobileSchema = z
  .string()
  .regex(/^\d{10}$/, "Mobile number must be 10 digits")
  .optional()
  .or(z.literal(""));

export const signUpSchema = z.object({
  fullName: z.string().trim().min(1, "Full name is required"),
  email: z.string().trim().toLowerCase().email("Invalid email format"),
  password: passwordSchema,
  role: z.enum(["user", "owner", "deliveryBoy"]),
  mobile: mobileSchema,
});

export const signInSchema = z.object({
  email: z.string().trim().toLowerCase().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

export const googleAuthSchema = z.object({
  idToken: z.string().min(1, "Google ID token is required"),
  fullName: z.string().trim().optional(),
  role: z.enum(["user", "owner", "deliveryBoy"]).optional(),
  mobile: mobileSchema,
});

export const sendOtpSchema = z.object({
  email: z.string().trim().toLowerCase().email("Invalid email format"),
});

export const verifyOtpSchema = z.object({
  email: z.string().trim().toLowerCase().email("Invalid email format"),
  otp: z.string().min(1, "OTP is required"),
});

export const resetPasswordSchema = z.object({
  email: z.string().trim().toLowerCase().email("Invalid email format"),
  password: passwordSchema,
});
