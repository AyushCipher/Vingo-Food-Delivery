import mongoose from "mongoose";

const userSchema = new mongoose.Schema({

  fullName: {
    type: String,
    required: true
  },

  email: {
    type: String,
    required: true,
    unique: true
  },

  password: {
    type: String
  },

  mobile: {
    type: String,
    required: true
  },

  role: {
    type: String,
    enum: ["user", "owner", "deliveryBoy"],
    required: true
  },

  resetOtp: String,
  otpExpires: Date,
  isOtpVerified: { type: Boolean, default: false },

  orders: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order"
  }],

  location: {
    type: { 
      type: String, 
      enum: ["Point"], 
      default: "Point" 
    },
    coordinates: {
      type: [Number],
      default: undefined
    }
  },

  isOnline: { 
    type: Boolean, 
    default: false 
  },
   
  socketId: { 
    type: String, 
    default: null 
  }

}, { timestamps: true });

userSchema.index({ location: "2dsphere" });

export default mongoose.model("User", userSchema);
