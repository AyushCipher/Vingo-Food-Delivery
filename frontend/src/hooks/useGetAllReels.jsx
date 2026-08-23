import { useEffect } from "react";
import axios from "axios";
import { serverUrl } from "../config";
import { useDispatch, useSelector } from "react-redux";
import { setReelData } from "../redux/reelSlice";

const useGetAllReels = () => {
    const dispatch = useDispatch();
    const { city, userData } = useSelector(state => state.user);

    useEffect(() => {
        // Only fetch reels if user is logged in and city is available
        if (!userData || !city) return;

        const getAllReels = async () => {
            try {
                const response = await axios.get(`${serverUrl}/api/reel/getAll?city=${encodeURIComponent(city)}`, { withCredentials: true });
                dispatch(setReelData(response.data));
            } catch {
                // Silently fail
            }
        };
        getAllReels();
    }, [dispatch, city, userData]);
};

export default useGetAllReels;