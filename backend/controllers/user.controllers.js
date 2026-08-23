import Item from "../models/item.model.js"
import Shop from "../models/shop.model.js"
import User from "../models/user.model.js"

export const getCurrentUser = async (req,res)=>{
  try {
    const userId = req.userId;
    if (!userId) {
      console.error("getCurrentUser error: userId missing from request. Possible auth/token issue.");
      return res.status(401).json({ message: "Unauthorized: userId missing" });
    }
    const user = await User.findById(userId).populate("savedReels");
    if(!user){
        return res.status(404).json({ message: "User not found"})
    }
    return res.status(200).json(user);
  } catch (error) {
    console.error("getCurrentUser error:", error);
    return res.status(500).json({ success: false, message: "Something went wrong. Please try again." })
  }
}


export const updateUserLocation = async (req, res) => {
  try {
    const { latitude, longitude } = req.body;
    const userId = req.userId;
    if (!userId) {
      console.error("updateUserLocation error: userId missing from request. Possible auth/token issue.");
      return res.status(401).json({ success: false, message: "Unauthorized: userId missing" });
    }
    // Convert to numbers and validate
    const lat = Number(latitude);
    const lng = Number(longitude);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return res.status(400).json({
        success: false,
        message: "Invalid coordinates"
      });
    }
    console.log("📍 Location update for user:", userId, "coords:", { lat, lng });
    await User.findByIdAndUpdate(userId, {
      location: {
        type: "Point",
        coordinates: [lng, lat]  // GeoJSON is [longitude, latitude]
      }
    },{new:true});
    // Socket se broadcast karo (agar real-time chahiye)
    const io = req.app.get("io");
    if (io) {
      io.emit("user:location:update", {
        userId,
        latitude,
        longitude,
        at: new Date()
      });
    }
    return res.json({
      success: true,
      message: "Location updated"
    });
  } catch (err) {
    console.error("Update location error:", err);
    return res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again."
    });
  }
};




export const searchItems = async (req, res) => {
  try {
    const { query, city } = req.query;
  console.log(query)
   console.log(city)
    if (!query) {
      return res.status(400).json({ message: "Search query is required" });
    }
    if (!city) {
      return res.status(400).json({ message: "City is required" });
    }

    // पहले उस city के सारे shop IDs निकालो
    const shopsInCity = await Shop.find({
  city: { $regex: new RegExp(`^${city}$`, "i") }
});


    if (shopsInCity.length === 0) {
      return res.status(200).json([]); // उस city में कोई shop नहीं
    }

    const shopIds = shopsInCity.map((s) => s._id);

    // अब उन shops के अंदर items filter करो जो query से match करें
    const items = await Item.find({
      shop: { $in: shopIds },
      $or: [
        { name: { $regex: query, $options: "i" } },
        { category: { $regex: query, $options: "i" } },
      ],
    }).populate("shop", "name city state");

    return res.status(200).json(items);
  } catch (error) {
    console.error("Search error:", error);
    return res.status(500).json({ success: false, message: "Something went wrong. Please try again." });
  }
};
