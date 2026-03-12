import { useEffect } from "react";
import axios from "axios";
import { serverUrl } from "../App";
import { useDispatch, useSelector } from "react-redux";
import { setReelData } from "../redux/reelSlice";

const useGetAllReels = () => {
    const dispatch = useDispatch();
    const { city } = useSelector(state => state.user);

    useEffect(() => {
        // Only fetch reels if city is available
        if (!city) {
            console.log('Waiting for city to be detected...');
            return;
        }

        console.log('Fetching reels for city:', city);

        const getAllReels = async () => {
            try {
                const response = await axios.get(`${serverUrl}/api/reel/getAll?city=${encodeURIComponent(city)}`, { withCredentials: true });
                console.log('Received reels:', response.data.length, 'reels');
                dispatch(setReelData(response.data));
            } catch (error) {
                console.error('Error fetching reels:', error);
            }
        };
        
        getAllReels();
    }, [dispatch, city]);
};

export default useGetAllReels;
