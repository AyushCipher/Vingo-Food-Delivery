import uploadOnCloudinary from "../config/cloudinary.js";
import Shop from "../models/shop.model.js";


export const getAllShops = async (req, res) => {
  try {
    const shops = await Shop.find({}).populate("owner");
    
    if (shops.length > 0) {
      return res.status(200).json(shops);
    }

    return;
  } catch (error) {
    return res.status(500).json({ message: `Get all shops error: ${error}` });
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
    return res.status(500).json({ message: `Add shop error: ${error}` });
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
    return res.status(500).json({ message: `Get current shop error: ${error}` });
  }
};


export const getShopsByCity = async (req, res) => {
  try {
    const { city } = req.params;

    if (!city) {
      return res.status(400).json({ message: "City parameter is required" });
    }

    // Case-insensitive search
    const shops = await Shop.find({
      city: { $regex: new RegExp(`^${city}$`, "i") },
    }).populate("items");

    return res.status(200).json(shops);
  } catch (error) {
    return res.status(500).json({ message: `Get shop by city error: ${error}` });
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
    return res.status(500).json({ message: `Get shop by id error: ${error}` });
  }
};
