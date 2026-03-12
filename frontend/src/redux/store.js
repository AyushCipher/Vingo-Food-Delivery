import { configureStore } from "@reduxjs/toolkit"
import userSlice from "./userSlice"
import reelSlice from "./reelSlice"

const store = configureStore({
    reducer: {
        user: userSlice,
        reel: reelSlice
    }
})

export default store