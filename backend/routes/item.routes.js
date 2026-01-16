import express from "express"
import isAuth from "../middlewares/isAuth.js"
import { upload } from "../middlewares/multer.js"
import { addItem, deleteItem, editItem, getItemById, getItemsByCity, getItemsByShop } from "../controllers/item.controllers.js"

const itemRouter = express.Router()

itemRouter.get("/getitemsbyshop/:shopId",isAuth,getItemsByShop)
itemRouter.get("/getitemsbycity/:city",isAuth,getItemsByCity)
itemRouter.post("/additem",isAuth,upload.single("image"),addItem)
itemRouter.post("/edititem/:itemId",isAuth,upload.single("image"),editItem)
itemRouter.get("/delete/:itemId",isAuth,deleteItem)
itemRouter.get("/getbyid/:itemId",isAuth,getItemById)

export default itemRouter