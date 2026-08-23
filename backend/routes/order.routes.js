import express from "express"
import isAuth from "../middlewares/isAuth.js"
import { upload } from "../middlewares/multer.js"
import { 
  acceptAssignment, 
  getCurrentOrder, 
  getDeliveryBoyAssignments, 
  getDeliveryBoyLocation, 
  getMonthStats, 
  getMyDeliveredOrders, 
  getMyOrders, 
  getOrderById, 
  getOwnerOrders, 
  getTodayStats, 
  myLocation, 
  placeOrder, 
  sendDeliveryOtp, 
  updateDeliveryBoyLocation, 
  updateOwnerOrderStatus, 
  verifyDeliveryOtp,
    verifyRazorpay,
    getDailyPayment,
    getWeeklyPayment,
    getMonthlyPayment
} from "../controllers/order.controller.js"

const orderRouter = express.Router()

// Orders
orderRouter.post("/placeorder", isAuth, placeOrder)
orderRouter.post("/verify-razorpay", isAuth, verifyRazorpay) // 👈 Razorpay verify route

orderRouter.get("/getmy", isAuth, getMyOrders)
orderRouter.get("/shop-orders", isAuth, getOwnerOrders)
orderRouter.post("/update-order-status/:orderId/:shopId", isAuth, updateOwnerOrderStatus)

// Delivery boy
orderRouter.get("/getassignments", isAuth, getDeliveryBoyAssignments);
orderRouter.post("/accept-assignment/:assignmentId", isAuth, acceptAssignment);
orderRouter.get("/current-order", isAuth, getCurrentOrder);
orderRouter.post("/update-location", isAuth, updateDeliveryBoyLocation);
orderRouter.get("/delivery-location/:orderId/:shopOrderId", isAuth, getDeliveryBoyLocation);

// OTP
orderRouter.post("/send-otp", isAuth, sendDeliveryOtp);
orderRouter.post("/verify-otp", isAuth, verifyDeliveryOtp);

// Stats
orderRouter.get("/stats/today", isAuth, getTodayStats);
orderRouter.get("/stats/month", isAuth, getMonthStats);
orderRouter.get("/my-delivered-orders", isAuth, getMyDeliveredOrders);

// Payment
orderRouter.get("/payment/daily", isAuth, getDailyPayment);
orderRouter.get("/payment/weekly", isAuth, getWeeklyPayment);
orderRouter.get("/payment/monthly", isAuth, getMonthlyPayment);

// Others
orderRouter.get("/my-location", isAuth, myLocation);
orderRouter.get("/:orderId", isAuth, getOrderById);

export default orderRouter
