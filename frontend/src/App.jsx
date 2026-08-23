import React, { useEffect, Suspense, lazy } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import useGetCurrentUser from './hooks/getCurrentUser'
import { useSelector } from 'react-redux'
import getCity from './hooks/getCity'
import useGetCurrentShop from './hooks/getCurrentShop'

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import useGetShopsByCity from "./hooks/useGetShopsByCity";
import useGetItemsByCity from './hooks/getItemsByCity'
import getOwnerPendingOrders from './hooks/getOwnerPendingOrders'
import { getSocket } from './socket'
import useUpdateLocation from './hooks/updateLocation'
import useGetAllReels from './hooks/useGetAllReels';
import ChatWidget from './components/ChatWidget';
import { ClipLoader } from 'react-spinners';

// Route-level code splitting: each page loads its own chunk on first visit
// instead of all of them (plus their dependencies like Recharts/Leaflet)
// being bundled into the single initial download.
const SignUp = lazy(() => import('./pages/SignUp'))
const SignIn = lazy(() => import('./pages/SignIn'))
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'))
const Home = lazy(() => import('./pages/Home'))
const EditShop = lazy(() => import('./pages/EditShop'))
const DeliveryBoy = lazy(() => import('./components/DeliveryBoy'))
const AddItem = lazy(() => import('./pages/AddItem'))
const EditItem = lazy(() => import('./pages/EditItem'))
const CartPage = lazy(() => import('./pages/CartPage'))
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'))
const OrderPlaced = lazy(() => import('./pages/OrderPlaced'))
const MyOrders = lazy(() => import('./pages/MyOrders'))
const PendingOrders = lazy(() => import('./pages/PendingOrders'))
const TrackOrderPage = lazy(() => import('./pages/TrackOrderPage'))
const MyDeliveredOrders = lazy(() => import('./pages/MyDeliveredOrders'))
const ShopItems = lazy(() => import('./pages/ShopItems'))
const ProductDetails = lazy(() => import('./pages/ProductDetails'))
const NotFound = lazy(() => import('./pages/NotFound'))
const Reels = lazy(() => import('./pages/Reels'))
const UploadReel = lazy(() => import('./pages/UploadReel'))
const SavedLoops = lazy(() => import('./pages/SavedLoops'))
const MyReels = lazy(() => import('./pages/MyReels'))
const EditReel = lazy(() => import('./pages/EditReel'))
const DeliveryBoyPayment = lazy(() => import('./pages/DeliveryBoyPayment'))

const RouteFallback = () => (
  <div className="w-screen h-screen flex items-center justify-center">
    <ClipLoader size={45} color="#ff4d2d" />
  </div>
)

function App() {
  const { userData, authChecked } = useSelector(state => state.user);

  useGetCurrentUser();
  getCity();
  useGetCurrentShop();
  useGetShopsByCity();
  useGetItemsByCity();
  getOwnerPendingOrders();
  useUpdateLocation();
  useGetAllReels();

  // Initialize socket singleton
  useEffect(() => {
    if (userData?._id) {
      getSocket(userData._id);
    }
  }, [userData?._id]);

  // Wait for the initial /api/user/current check before evaluating any
  // route guard. Without this, userData starts out null (indistinguishable
  // from "logged out"), so a hard refresh or deep link into a protected
  // route bounces a genuinely logged-in user to /signin and then, once the
  // check resolves, cascades again to /.
  if (!authChecked) {
    return <RouteFallback />;
  }

  return (
   <>
      <Suspense fallback={<RouteFallback />}>
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
          <Route path="/delivery-payment" element={userData ? <DeliveryBoyPayment /> : <Navigate to="/signin" />} />
          <Route path="/delivery" element={userData ? <DeliveryBoy /> : <Navigate to="/signin" />} />


          {/* 404 Route - must be last */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>

      {/* Chat Widget */}
      {userData && (
        <ChatWidget
          userId={userData?._id}
          userRole={userData?.role}
        />
      )}

      {/* ⭐ Toast works globally */}
      <ToastContainer position="top-center" autoClose={2500} />
    </>
  )
}

export default App
