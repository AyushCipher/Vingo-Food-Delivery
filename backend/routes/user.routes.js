import express from "express"
import isAuth from "../middlewares/isAuth.js"
import { getCurrentUser, searchItems, updateUserLocation } from "../controllers/user.controllers.js"


const userRouter=express.Router();

userRouter.get("/current",isAuth,getCurrentUser);
userRouter.post("/update-location",isAuth,updateUserLocation);
userRouter.get("/search-items",isAuth,searchItems);

export default userRouter