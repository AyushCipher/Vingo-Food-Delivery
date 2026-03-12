import React, { useEffect } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import SignUp from './pages/SignUp'
import SignIn from './pages/SignIn'
import ForgotPassword from './pages/ForgotPassword'
import getCurrentUser from './hooks/getCurrentUser'
import { useDispatch, useSelector } from 'react-redux'
import Home from './pages/Home'
import getCity from './hooks/getCity'
import getAllShops from './hooks/getAllShops'
import EditShop from './pages/EditShop'
import { setShop } from './redux/userSlice'
import getCurrentShop from './hooks/getCurrentShop'

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import AddItem from './pages/AddItem'
import EditItem from './pages/EditItem'
import useGetShopsByCity from "./hooks/useGetShopsByCity";
import getItemsByCity from './hooks/getItemsByCity'
import CartPage from './pages/CartPage'
import CheckoutPage from './pages/CheckoutPage'
import OrderPlaced from './pages/OrderPlaced'
import MyOrders from './pages/MyOrders'
import getOwnerPendingOrders from './hooks/getOwnerPendingOrders'
import PendingOrders from './pages/PendingOrders'
import { getSocket } from './socket'
import updateLocation from './hooks/updateLocation'
import TrackOrderPage from './pages/TrackOrderPage'
import MyDeliveredOrders from './pages/MyDeliveredOrders'
import ShopItems from './pages/ShopItems'
import ProductDetails from './pages/ProductDetails'
import NotFound from './pages/NotFound';
import Reels from './pages/Reels'
import useGetAllReels from './hooks/useGetAllReels';
import UploadReel from './pages/UploadReel';
import SavedLoops from './pages/SavedLoops';
import MyReels from './pages/MyReels';
import EditReel from './pages/EditReel';
import DeliveryBoyPayment from './pages/DeliveryBoyPayment';

// Use Vite's built-in env detection - import.meta.env.DEV is true in development
export const serverUrl = import.meta.env.DEV 
  ? "http://localhost:8000" 
  : import.meta.env.VITE_SERVER_URL




function App() {
  const { userData } = useSelector(state => state.user);

  getCurrentUser();
  getCity();
  getCurrentShop();
  useGetShopsByCity();
  getItemsByCity();
  getOwnerPendingOrders();
  updateLocation();
<<<<<<< HEAD
  useGetAllReels();
=======
>>>>>>> 7880056c02b4aff0620d28eeb954bfcf26277297

  // Initialize socket singleton
  useEffect(() => {
    if (userData?._id) {
      getSocket(userData._id);
    }
  }, [userData?._id]);

  return (
   <>
      <Routes>
        <Route path="/signup" element={!userData ? <SignUp /> : <Navigate to="/" />} />
        <Route path="/signin" element={!userData ? <SignIn /> : <Navigate to="/" />} />
        <Route path="/forgot-password" element={!userData ? <ForgotPassword /> : <Navigate to="/" />} />
        <Route path="/" element={userData ? <Home /> : <Navigate to="/signin" />} />
        <Route path="/editshop" element={userData ? <EditShop /> : <Navigate to="/signin" />} />
        <Route path="/additem" element={userData ? <AddItem /> : <Navigate to="/signin" />} />
        <Route path="/edititem/:itemId" element={userData ? <EditItem /> : <Navigate to="/signin" />} />
        <Route path="/cart" element={userData ? <CartPage /> : <Navigate to="/signin" />} />
        <Route path="/checkout" element={userData ? <CheckoutPage /> : <Navigate to="/signin" />} />
        <Route path="/order-placed" element={userData ? <OrderPlaced /> : <Navigate to="/signin" />} />
        <Route path="/my-orders" element={userData ? <MyOrders /> : <Navigate to="/signin" />} />
        <Route path="/pending-orders" element={userData ? <PendingOrders /> : <Navigate to="/signin" />} />
        <Route path="/my-delivered-orders" element={userData ? <MyDeliveredOrders /> : <Navigate to="/signin" />} />
        <Route path="/track-order/:orderId" element={userData ? <TrackOrderPage /> : <Navigate to="/signin" />} />
        <Route path="/shop-items/:shopId" element={userData ? <ShopItems /> : <Navigate to="/signin" />} />
        <Route path="/reels" element={userData ? <Reels /> : <Navigate to="/signin" />} />
        <Route path="/upload-reel" element={userData ? <UploadReel /> : <Navigate to="/signin" />} />
        <Route path="/my-reels" element={userData ? <MyReels /> : <Navigate to="/signin" />} />
        <Route path="/edit-reel/:reelId" element={userData ? <EditReel /> : <Navigate to="/signin" />} />
        <Route path="/saved-loops" element={userData ? <SavedLoops /> : <Navigate to="/signin" />} />
        <Route path="/product/:itemId" element={userData ? <ProductDetails /> : <Navigate to="/signin" />} />
<<<<<<< HEAD
        <Route path="/delivery-payment" element={userData ? <DeliveryBoyPayment /> : <Navigate to="/signin" />} />
=======
>>>>>>> 7880056c02b4aff0620d28eeb954bfcf26277297

        {/* 404 Route - must be last */}
        <Route path="*" element={<NotFound />} />
      </Routes>

      {/* ⭐ Toast works globally */}
      <ToastContainer position="top-center" autoClose={2500} />
    </>
  )
}

export default App
