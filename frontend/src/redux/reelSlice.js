import { createSlice } from "@reduxjs/toolkit";

const reelSlice = createSlice({
    name: "reel",
    initialState: {
        reelData: []
    },
    reducers: {
        setReelData(state, action) {
            state.reelData = action.payload;
        }
    }
});

export const { setReelData } = reelSlice.actions;
export default reelSlice.reducer;
