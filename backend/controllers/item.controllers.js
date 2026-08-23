import uploadOnCloudinary from "../config/cloudinary.js";
import Item from "../models/item.model.js";
import Shop from "../models/shop.model.js";
import { parsePagination, applyPagination } from "../utils/pagination.js";


export const addItem = async (req, res) => {
  try {
    const { 
      name, 
      category, 
      type, 
      price,
      description,
      availability
    } = req.body;
    
    const shop = await Shop.findOne({ owner: req.userId });
    if (!shop) {
      return res.status(404).json({
        message: "No shop found for this account. Please create a shop first."
      });
    }
    
    let image;

    if (req.file) {
      image = await uploadOnCloudinary(req.file.path);
    } else {
      return res.status(400).json({ message: "Image is required" });
    }

    // Parse ingredients and allergens from JSON string
    let parsedIngredients = [];
    let parsedAllergens = [];
    
    try {
      if (ingredients) {
        parsedIngredients = JSON.parse(ingredients);
      }
      if (allergens) {
        parsedAllergens = JSON.parse(allergens);
      }
    } catch (e) {
      console.log("Error parsing ingredients/allergens:", e);
    }
    
    const item = await Item.create({
      name,
      category,
      type,
      image,
      price,
      shop: shop._id,
      description: description || "",
      ingredients: parsedIngredients,
      preparationTime: preparationTime || 15,
      servingSize: servingSize || "1 serving",
      spiceLevel: spiceLevel || "",
      allergens: parsedAllergens,
      availability: availability !== "false"
    });

    shop.items.push(item._id);

    await shop.save();

    await shop.populate({
      path: "items",
      options: { sort: { createdAt: -1 } },
    });

    await item.populate("shop");

    return res.status(201).json({
      shop,
      item,
    });

  } catch (error) {
    console.error("Add Item error", error);
    return res.status(500).json({ success: false, message: "Something went wrong. Please try again." });
  }
};


export const getItemsByShop = async (req, res) => {
  try {
    const { shopId } = req.params;
    const items = await Item.find({ shop: shopId });
    
    if (!items.length) {
      return res.status(400).json({ message: "This shop does not have food items" });
    }

    return res.status(200).json(items);
  } catch (error) {
    console.error("Get item error", error);
    return res.status(500).json({ success: false, message: "Something went wrong. Please try again." });
  }
};


export const getItemsByCity = async (req, res) => {
  try {
    const city = req.params.city;
    // e.g., ?city=Mumbai
    if (!city) {
      return res.status(400).json({ message: "City is required" });
    }

    // Find all active shops in this city
    const shopsInCity = await Shop.find({
      city: { $regex: new RegExp(`^${city}$`, "i") },
    });

    if (!shopsInCity.length) {
      return res.status(404).json({ message: "No shops found in this city" });
    }

    const shopIds = shopsInCity.map((shop) => shop._id);

    // Find items for these shops
    const pagination = parsePagination(req.query);
    const items = await applyPagination(
      Item.find({
        shop: { $in: shopIds },
        availability: true,
      }),
      pagination
    );

    return res.status(200).json(items);
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
};


export const getItemById = async (req, res) => {
  try {
    const { itemId } = req.params;
    const item = await Item.findById(itemId).populate("shop", "name city address");
    
    if (!item) {
      return res.status(400).json({ message: "Item not found" });
    }

    return res.status(200).json(item);
  } catch (error) {
    console.error("Get item error", error);
    return res.status(500).json({ success: false, message: "Something went wrong. Please try again." });
  }
};


export const editItem = async (req, res) => {
  try {
    const { 
      name, 
      category, 
      type, 
      price,
      description,
      ingredients,
      preparationTime,
      servingSize,
      spiceLevel,
      allergens,
      availability
    } = req.body;
    const { itemId } = req.params;

    let image;
    if (req.file) {
      image = await uploadOnCloudinary(req.file.path);
    }

    // Parse ingredients and allergens from JSON string
    let parsedIngredients = [];
    let parsedAllergens = [];
    
    try {
      if (ingredients) {
        parsedIngredients = JSON.parse(ingredients);
      }
      if (allergens) {
        parsedAllergens = JSON.parse(allergens);
      }
    } catch (e) {
      console.log("Error parsing ingredients/allergens:", e);
    }

    const updateData = {
      name,
      category,
      type,
      price,
      description: description || "",
      ingredients: parsedIngredients,
      preparationTime: preparationTime || 15,
      servingSize: servingSize || "1 serving",
      spiceLevel: spiceLevel || "",
      allergens: parsedAllergens,
      ...(availability !== undefined && { availability: availability !== "false" })
    };

    if (image) {
      updateData.image = image;
    }

    const item = await Item.findByIdAndUpdate(
      itemId,
      updateData,
      { new: true }
    );

    if (!item) {
      return res.status(400).json({ message: "Item not found" });
    }

    await item.populate("shop");

    // --- Real-time emit for availability update ---
    const io = req.app.get("io");
    if (io) {
      io.emit("item:availabilityUpdated", {
        itemId: item._id,
        availability: item.availability,
        shopId: item.shop?._id,
        city: item.shop?.city,
      });
    }

    return res.status(200).json(item);
  } catch (error) {
    console.error("Edit item error", error);
    return res.status(500).json({ success: false, message: "Something went wrong. Please try again." });
  }
};


export const deleteItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const item = await Item.findByIdAndDelete(itemId);
    
    if (!item) {
      return res.status(400).json({ message: "Item not found" });
    }

    const shop = await Shop.findOne({ owner: req.userId });

    shop.items = shop.items.filter((i) => i !== item._id);
    
    await shop.save();
    
    await shop.populate({
      path: "items",
      options: { sort: { createdAt: -1 } },
    });

    return res.status(201).json({
      shop,
      item,
    });

  } catch (error) {
    console.error("Delete item error", error);
    return res.status(500).json({ success: false, message: "Something went wrong. Please try again." });
  }
};
