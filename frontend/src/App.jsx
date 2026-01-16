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
import { setShop, setSocket } from './redux/userSlice'
import getCurrentShop from './hooks/getCurrentShop'

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import AddItem from './pages/AddItem'
import EditItem from './pages/editItem'
import useGetShopsByCity from "./hooks/useGetShopsByCity";
import getItemsByCity from './hooks/getItemsByCity'
import CartPage from './pages/CartPage'
import CheckoutPage from './pages/CheckoutPage'
import OrderPlaced from './pages/OrderPlaced'
import MyOrders from './pages/MyOrders'
import getOwnerPendingOrders from './hooks/getOwnerPendingOrders'
import PendingOrders from './pages/PendingOrders'
import { io } from 'socket.io-client'
import updateLocation from './hooks/updateLocation'
import TrackOrderPage from './pages/TrackOrderPage'
import MyDeliveredOrders from './pages/MyDeliveredOrders'
import ShopItems from './pages/ShopItems'

export const serverUrl="http://localhost:8000"


function App() {
  const {userData, allShops, socket} = useSelector(state => state.user)
 
  getCurrentUser();
  getCity();
  getCurrentShop();
  useGetShopsByCity(); 
  getItemsByCity();
  getOwnerPendingOrders()
  updateLocation()
  
  const dispatch = useDispatch()

  useEffect(() => {
    const socketInstance = io(serverUrl, { withCredentials: true });
    dispatch(setSocket(socketInstance));

    socketInstance.on("connect", () => {
      console.log("Socket connected:", socketInstance.id);
      if (userData?._id) {
        console.log("Emitting identify for user:", userData._id);
        socketInstance.emit("identify", { userId: userData._id });
      }
    });

    // Also emit identify when userData becomes available after socket is connected
    if (socketInstance.connected && userData?._id) {
      console.log("Re-emitting identify for user:", userData._id);
      socketInstance.emit("identify", { userId: userData._id });
    }

    return () => {
      socketInstance.disconnect();
    };
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
      </Routes>

      {/* ⭐ Toast works globally */}
      <ToastContainer position="top-center" autoClose={2500} />
    </>
  )
}

export default App