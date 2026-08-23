import express from "express"
import { googleAuth, resetPassword, sendOtp, signIn, signOut, signUp, verifyOtp  } from "../controllers/auth.controllers.js"
import { validate } from "../middlewares/validate.js"
import {
  signUpSchema,
  signInSchema,
  googleAuthSchema,
  sendOtpSchema,
  verifyOtpSchema,
  resetPasswordSchema,
} from "../validators/auth.validators.js"

const authRouter = express.Router()

authRouter.post("/signup", validate(signUpSchema), signUp)
authRouter.post("/signin", validate(signInSchema), signIn)
authRouter.get("/signout",signOut)
authRouter.post("/googleauth", validate(googleAuthSchema), googleAuth)
authRouter.post("/sendotp", validate(sendOtpSchema), sendOtp)
authRouter.post("/verifyotp", validate(verifyOtpSchema), verifyOtp)
authRouter.post("/resetpassword", validate(resetPasswordSchema), resetPassword)

export default authRouter
