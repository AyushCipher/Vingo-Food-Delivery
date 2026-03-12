import express from "express";
import isAuth from "../middlewares/isAuth.js";
import { upload } from "../middlewares/multer.js";
import {
    uploadReel,
    getAllReels,
    likeReel,
    commentReel,
    replyToComment,
    getShopReels,
    editReel,
    deleteReel,
    saveReel,
    getSavedReels
} from "../controllers/reel.controllers.js";

const reelRouter = express.Router();

reelRouter.post("/upload", isAuth, upload.single("video"), uploadReel);
reelRouter.get("/getAll", isAuth, getAllReels);
reelRouter.get("/shop/:shopId", isAuth, getShopReels);
reelRouter.get("/like/:reelId", isAuth, likeReel);
reelRouter.post("/comment/:reelId", isAuth, commentReel);
reelRouter.post("/reply/:reelId/:commentId", isAuth, replyToComment);
reelRouter.put("/edit/:reelId", isAuth, editReel);
reelRouter.delete("/delete/:reelId", isAuth, deleteReel);  // ✅ fixed
reelRouter.get("/save/:reelId", isAuth, saveReel);
reelRouter.get("/saved", isAuth, getSavedReels);

export default reelRouter;
