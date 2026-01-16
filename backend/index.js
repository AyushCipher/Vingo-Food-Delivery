import express from "express"
import dotenv from "dotenv"
import connectDb from "./config/db.js"
import cookieParser from "cookie-parser"
import cors from "cors"
import authRouter from "./routes/auth.routes.js"
import userRouter from "./routes/user.routes.js"
import shopRouter from "./routes/shop.routes.js"
import itemRouter from "./routes/item.routes.js"
import orderRouter from "./routes/order.routes.js"
import reviewRouter from "./routes/review.routes.js"
import http from "http"
import { Server } from "socket.io"
import socketHandler from "./socket.js"

import { sendMail } from "./config/mail.js";

dotenv.config()

const port = process.env.PORT || 5000
const frontendUrl = "https://vingo-8134.onrender.com" || "http://localhost:5173"
const app = express()
const server = http.createServer(app)

const allowedOrigins = [
  "http://localhost:5173",
  "https://vingo-8134.onrender.com",
  frontendUrl
].filter(Boolean);

const io = new Server(server,{
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true  
  }
})

app.set("io", io);

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));


app.use(express.json())
app.use(cookieParser())
app.use("/api/auth", authRouter)
app.use("/api/user", userRouter)
app.use("/api/shop", shopRouter)
app.use("/api/item", itemRouter)
app.use("/api/order", orderRouter)
app.use("/api/review", reviewRouter)

socketHandler(io)

server.listen(port,()=>{
  console.log(`Server started at port no. ${port}`)
  connectDb()
})


