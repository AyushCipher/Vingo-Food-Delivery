import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
  item: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Item", 
    required: true 
  },
  name: String,
  price: Number,
  quantity: Number,
});




const shopOrderSchema = new mongoose.Schema({
  shop: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Shop", 
    required: true 
  },
  owner: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  items: [orderItemSchema],
  subtotal: Number,
  status: {
    type: String,
    enum: ["pending", "preparing", "out_for_delivery", "delivered"],
    default: "pending",
  },
  assignedDeliveryBoy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
  assignment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "DeliveryAssignment",
    default: null,
  },
  acceptedAt: Date,

  deliveryBoyLocation: {
    lat: { 
      type: Number, 
      default: undefined 
    },
    lng: { 
      type: Number, 
      default: undefined 
    },
  },

  deliveryOtp: { 
    type: String, 
    default: null 
  },
  otpExpiresAt: { 
    type: Date, 
    default: null 
  },
  deliveredAt: { 
    type: Date, 
    default: null 
  },
  deliveredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
});





const orderSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  address: {
    text: String,
    latitude: Number,
    longitude: Number,
  },
  paymentMethod: { 
    type: String, 
    enum: ["cod", "online"], 
    required: true 
  },
  totalAmount: Number,
  shopOrders: [shopOrderSchema],

  // Payment-related fields
  payment: { 
    type: Boolean, 
    default: false 
  },
  razorpayOrderId: { 
    type: String, 
    default: null 
  },
  razorpayPaymentId: { 
    type: String, 
    default: null 
  },
  createdAt: {
     type: Date, 
     default: Date.now 
  },
});

const Order = mongoose.model("Order", orderSchema);
export default Order;
