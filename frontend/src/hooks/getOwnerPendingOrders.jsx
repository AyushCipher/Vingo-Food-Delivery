import axios from "axios";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setOwnerPendingOrders, setPendingOrdersCount } from "../redux/userSlice";
import { serverUrl } from "../App";

function useOwnerPendingOrders() {
  const dispatch = useDispatch();
  const { userData, socket } = useSelector((state) => state.user);

  useEffect(() => {
    if (userData?.role === "owner") {
      // initial fetch
      const fetchOrders = async () => {
        const result = await axios.get(`${serverUrl}/api/order/shop-orders`, {
          withCredentials: true,
        });
        dispatch(setOwnerPendingOrders(result.data.orders));
    
      };
      fetchOrders();

      // realtime socket listener
      socket?.on("orders:new", (data) => {
        if (data.ownerId === userData._id) {
          dispatch(setOwnerPendingOrders(data.order));
         
        }
      });

      return () => {
        socket?.off("orders:new");
      };
    }
  }, [userData, socket, dispatch]);
}

export default useOwnerPendingOrders;
