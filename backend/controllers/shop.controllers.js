import uploadOnCloudinary from "../config/cloudinary.js";
import Shop from "../models/shop.model.js";
import { parsePagination, applyPagination } from "../utils/pagination.js";


export const getAllShops = async (req, res) => {
  try {
    const pagination = parsePagination(req.query);
    const shops = await applyPagination(Shop.find({}).populate("owner"), pagination);

    if (shops.length > 0) {
      return res.status(200).json(shops);
    }

    return;
  } catch (error) {
    console.error("Get all shops error", error);
    return res.status(500).json({ success: false, message: "Something went wrong. Please try again." });
  }
};


// ADD OR EDIT SHOP
export const addShop = async (req, res) => {
  try {
    const { name, city, state, address } = req.body;

    let image;
    if (req.file) {
      image = await uploadOnCloudinary(req.file.path);
    }

    // check if owner already has a shop
    let shop = await Shop.findOne({ owner: req.userId });

    // ---------------- CREATE SHOP ----------------
    if (!shop) {

      shop = await Shop.create({
        name,
        city,
        state,
        address,
        image,
        owner: req.userId
      });

    } 
    // ---------------- UPDATE SHOP ----------------
    else {

      shop.name = name;
      shop.city = city;
      shop.state = state;
      shop.address = address;

      if (image) {
        shop.image = image;
      }

      await shop.save();
    }

    await shop.populate("owner");
    await shop.populate({
      path: "items",
      options: { sort: { createdAt: -1 } },
    });

    return res.status(200).json(shop);

  } catch (error) {
    console.error("Add shop error", error);
    return res.status(500).json({ success: false, message: "Something went wrong. Please try again." });
  }
};



export const getCurrentShop = async (req, res) => {
  try {
    const shop = await Shop.findOne({ owner: req.userId })
      .populate("owner")
      .populate({
        path: "items",
        options: { sort: { createdAt: -1 } },
      });

    if (shop) {
      return res.status(200).json(shop);
    }

    return null;
  } catch (error) {
    console.error("Get current shop error", error);
    return res.status(500).json({ success: false, message: "Something went wrong. Please try again." });
  }
};


export const getShopsByCity = async (req, res) => {
  try {
    const { city } = req.params;

    if (!city) {
      return res.status(400).json({ message: "City parameter is required" });
    }

    // Case-insensitive search
    const pagination = parsePagination(req.query);
    const shops = await applyPagination(
      Shop.find({
        city: { $regex: new RegExp(`^${city}$`, "i") },
      }).populate("items"),
      pagination
    );

    return res.status(200).json(shops);
  } catch (error) {
    console.error("Get shop by city error", error);
    return res.status(500).json({ success: false, message: "Something went wrong. Please try again." });
  }
};


export const getShopById = async (req, res) => {
  try {
    const { shopId } = req.params;
    const shop = await Shop.findById(shopId);
    
    if (!shop) {
      return res.status(400).json({ message: "shop not found" });
    }
    
    return res.status(200).json(shop);
  } catch (error) {
    console.error("Get shop by id error", error);
    return res.status(500).json({ success: false, message: "Something went wrong. Please try again." });
  }
};
