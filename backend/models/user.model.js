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

  // No defaults here on purpose: a new user has no location yet (it's set
  // later via /api/user/update-location). Defaulting `type` to "Point"
  // while `coordinates` stays unset creates a partial GeoJSON object that
  // the 2dsphere index below can't extract keys from, which fails the
  // insert outright. Leaving both undefined keeps the field absent until a
  // real coordinate pair is set, which the index handles as unindexed.
  location: {
    type: {
      type: String,
      enum: ["Point"]
    },
    coordinates: {
      type: [Number]
    }
  },

  isOnline: { 
    type: Boolean, 
    default: false 
  },
   
  socketId: { 
    type: String, 
    default: null 
  },

  savedReels: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Reel"
  }]

}, { timestamps: true });

userSchema.index({ location: "2dsphere" });

export default mongoose.model("User", userSchema);
