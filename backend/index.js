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
import http from "http"
import { Server } from "socket.io"
import socketHandler from "./socket.js"

import { sendMail } from "./config/mail.js";

dotenv.config()

const port = process.env.PORT || 5000
const app = express()
const server = http.createServer(app)
const io = new Server(server,{
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true  
  }
})

app.set("io", io);
const allowedOrigins = [
  "http://localhost:5173",
  "https://food-delivery-frontend.vercel.app",   
  "https://your-custom-domain.com"
];

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

socketHandler(io)

server.listen(port,()=>{
  console.log(`Server started at port no. ${port}`)
  connectDb()
})


