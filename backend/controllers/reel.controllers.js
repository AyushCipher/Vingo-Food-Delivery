import uploadOnCloudinary, { uploadReelVideo } from "../config/cloudinary.js";
import Reel from "../models/reel.model.js";
import Shop from "../models/shop.model.js";
import User from "../models/user.model.js";
import Item from "../models/item.model.js";

export const uploadReel = async (req, res) => {
    try {
        const { caption, shopId, itemId } = req.body;
        let video;

        if (req.file) {
            // Use uploadReelVideo to automatically trim to 2 minutes
            video = await uploadReelVideo(req.file.path);
        } else {
            return res.status(400).json({ message: "Video is required" });
        }

        if (!video) {
            return res.status(500).json({ message: "Failed to upload video to cloud" });
        }

        // Verify the shop belongs to the user
        const shop = await Shop.findById(shopId);
        if (!shop) {
            return res.status(404).json({ message: "Shop not found" });
        }

        if (shop.owner.toString() !== req.userId.toString()) {
            return res.status(403).json({ message: "Unauthorized to create reel for this shop" });
        }

        // Verify item if provided
        if (itemId) {
            const item = await Item.findById(itemId);
            if (!item || item.shop.toString() !== shopId.toString()) {
                return res.status(404).json({ message: "Item not found or doesn't belong to this shop" });
            }
        }

        const reel = await Reel.create({
            caption,
            video,
            shop: shopId,
            item: itemId || null,
            owner: req.userId
        });

        // Add reel to shop's reels array
        shop.reels.push(reel._id);
        await shop.save();

        const populatedReel = await Reel.findById(reel._id)
            .populate("owner", "fullName email profileImage")
            .populate({
                path: "shop",
                select: "name image city owner",
                populate: { path: "owner", select: "_id" }
            })
            .populate("item", "name price image")
            .populate({
                path: "comments.author",
                select: "fullName profileImage"
            })
            .populate({
                path: "comments.replies.author",
                select: "fullName profileImage"
            });

        return res.status(201).json(populatedReel);
    } catch (error) {
        console.error('Upload reel error:', error);
        return res.status(500).json({ 
            message: error.message || "Failed to upload reel",
            error: error.toString()
        });
    }
};

export const likeReel = async (req, res) => {
    try {
        const reelId = req.params.reelId;
        const reel = await Reel.findById(reelId);

        if (!reel) {
            return res.status(400).json({ message: "Reel not found" });
        }

        const alreadyLiked = reel.likes.some(id => id.toString() === req.userId.toString());

        if (alreadyLiked) {
            reel.likes = reel.likes.filter(id => id.toString() !== req.userId.toString());
        } else {
            reel.likes.push(req.userId);
        }

        await reel.save();
        await reel.populate("owner", "fullName email profileImage");
        await reel.populate({
            path: "shop",
            select: "name image city owner",
            populate: { path: "owner", select: "_id" }
        });
        await reel.populate("item", "name price image");
        await reel.populate({
            path: "comments.author",
            select: "fullName profileImage"
        });
        await reel.populate({
            path: "comments.replies.author",
            select: "fullName profileImage"
        });

        const io = req.app.get("io");
        io.emit("likedReel", {
            reelId: reel._id,
            likes: reel.likes
        });

        return res.status(200).json(reel);
    } catch (error) {
        return res.status(500).json({ message: `Like reel error ${error}` });
    }
};

export const commentReel = async (req, res) => {
    try {
        const { message } = req.body;
        const reelId = req.params.reelId;
        
        // Add comment to reel
        const reel = await Reel.findByIdAndUpdate(
            reelId,
            {
                $push: {
                    comments: {
                        author: req.userId,
                        message: message
                    }
                }
            },
            { new: true }
        )
        .populate("owner", "fullName email profileImage")
        .populate({
            path: "shop",
            select: "name image city owner",
            populate: { path: "owner", select: "_id" }
        })
        .populate("item", "name price image")
        .populate({
            path: "comments.author",
            select: "fullName profileImage"
        })
        .populate({
            path: "comments.replies.author",
            select: "fullName profileImage"
        });

        if (!reel) {
            return res.status(400).json({ message: "Reel not found" });
        }


        const io = req.app.get("io");
        io.emit("commentedReel", {
            reelId: reel._id,
            comments: reel.comments
        });

        return res.status(200).json(reel);
    } catch (error) {
        console.error('Comment reel error:', error);
        return res.status(500).json({ message: `Comment reel error: ${error}` });
    }
};

export const replyToComment = async (req, res) => {
    try {
        const { message } = req.body;
        const { reelId, commentId } = req.params;
        
        console.log('Reply request received:', { reelId, commentId, message });
        
        // Find the reel and add reply to specific comment
        const reel = await Reel.findById(reelId);
        
        if (!reel) {
            console.log('Reel not found:', reelId);
            return res.status(400).json({ message: "Reel not found" });
        }

        console.log('Reel found with comments:', reel.comments.length);

        // Find the comment and add reply
        const comment = reel.comments.id(commentId);
        if (!comment) {
            console.log('Comment not found:', commentId);
            console.log('Available comment IDs:', reel.comments.map(c => c._id.toString()));
            return res.status(400).json({ message: "Comment not found" });
        }

        console.log('Comment found, adding reply');

        comment.replies.push({
            author: req.userId,
            message: message
        });

        await reel.save();
        console.log('Reply saved successfully');

        // Populate all necessary fields
        const populatedReel = await Reel.findById(reelId)
            .populate("owner", "fullName email profileImage")
            .populate({
                path: "shop",
                select: "name image city owner",
                populate: { path: "owner", select: "_id" }
            })
            .populate("item", "name price image")
            .populate({
                path: "comments.author",
                select: "fullName profileImage"
            })
            .populate({
                path: "comments.replies.author",
                select: "fullName profileImage"
            });

        const io = req.app.get("io");
        io.emit("commentedReel", {
            reelId: populatedReel._id,
            comments: populatedReel.comments
        });

        console.log('Reply response sent successfully');
        return res.status(200).json(populatedReel);
    } catch (error) {
        console.error('Reply to comment error:', error);
        return res.status(500).json({ message: `Reply to comment error: ${error.message}` });
    }
};

export const getAllReels = async (req, res) => {
    try {
        const { city } = req.query;
        
        console.log('getAllReels - Received city:', city);
        
        // If city is provided, filter reels by shop city (case-insensitive)
        let reels;
        if (city) {
            // First find shops in the specified city (case-insensitive, trimmed)
            const shopsInCity = await Shop.find({ 
                city: { $regex: new RegExp(`^${city.trim()}$`, 'i') } 
            }).select('_id name city');
            
            console.log('Found shops in city:', shopsInCity.length, shopsInCity.map(s => ({ name: s.name, city: s.city })));
            
            const shopIds = shopsInCity.map(shop => shop._id);
            
            // Then find reels from those shops
            reels = await Reel.find({ shop: { $in: shopIds } })
                .populate("owner", "fullName email profileImage")
                .populate({
                    path: "shop",
                    select: "name image city owner",
                    populate: { path: "owner", select: "_id" }
                })
                .populate("item", "name price image")
                .populate({
                    path: "comments.author",
                    select: "fullName profileImage"
                })
                .populate({
                    path: "comments.replies.author",
                    select: "fullName profileImage"
                })
                .sort({ createdAt: -1 });
                
            console.log('Found reels:', reels.length);
        } else {
            // If no city provided, return all reels
            reels = await Reel.find({})
                .populate("owner", "fullName email profileImage")
                .populate({
                    path: "shop",
                    select: "name image city owner",
                    populate: { path: "owner", select: "_id" }
                })
                .populate("item", "name price image")
                .populate({
                    path: "comments.author",
                    select: "fullName profileImage"
                })
                .populate({
                    path: "comments.replies.author",
                    select: "fullName profileImage"
                })
                .sort({ createdAt: -1 });
        }
        
        return res.status(200).json(reels);
    } catch (error) {
        console.error('getAllReels error:', error);
        return res.status(500).json({ message: `Get all reels error: ${error}` });
    }
};

export const getShopReels = async (req, res) => {
    try {
        const shopId = req.params.shopId;
        const reels = await Reel.find({ shop: shopId })
            .populate("owner", "fullName email profileImage")
            .populate({
                path: "shop",
                select: "name image city owner",
                populate: { path: "owner", select: "_id" }
            })
            .populate("item", "name price image")
            .populate({
                path: "comments.author",
                select: "fullName profileImage"
            })
            .populate({
                path: "comments.replies.author",
                select: "fullName profileImage"
            })
            .sort({ createdAt: -1 });
        return res.status(200).json(reels);
    } catch (error) {
        return res.status(500).json({ message: `Get shop reels error: ${error}` });
    }
};

export const editReel = async (req, res) => {
    try {
        const reelId = req.params.reelId;
        const { caption, itemId } = req.body;

        const reel = await Reel.findById(reelId);
        if (!reel) {
            return res.status(404).json({ message: "Reel not found" });
        }

        // Verify the user is the owner
        if (reel.owner.toString() !== req.userId.toString()) {
            return res.status(403).json({ message: "Unauthorized to edit this reel" });
        }

        // Update caption if provided
        if (caption !== undefined) {
            reel.caption = caption;
        }

        // Update item if provided
        if (itemId !== undefined) {
            if (itemId) {
                const item = await Item.findById(itemId);
                if (!item || item.shop.toString() !== reel.shop.toString()) {
                    return res.status(404).json({ message: "Item not found or doesn't belong to this shop" });
                }
                reel.item = itemId;
            } else {
                reel.item = null;
            }
        }

        await reel.save();

        const updatedReel = await Reel.findById(reelId)
            .populate("owner", "fullName email profileImage")
            .populate({
                path: "shop",
                select: "name image city owner",
                populate: { path: "owner", select: "_id" }
            })
            .populate("item", "name price image")
            .populate({
                path: "comments.author",
                select: "fullName profileImage"
            })
            .populate({
                path: "comments.replies.author",
                select: "fullName profileImage"
            });

        return res.status(200).json(updatedReel);
    } catch (error) {
        console.error('Edit reel error:', error);
        return res.status(500).json({ message: `Edit reel error: ${error}` });
    }
};

export const deleteReel = async (req, res) => {
    try {
        const reelId = req.params.reelId;
        const reel = await Reel.findById(reelId);

        if (!reel) {
            return res.status(404).json({ message: "Reel not found" });
        }

        // Verify the user is the owner
        if (reel.owner.toString() !== req.userId.toString()) {
            return res.status(403).json({ message: "Unauthorized to delete this reel" });
        }

        await Reel.findByIdAndDelete(reelId);
        return res.status(200).json({ message: "Reel deleted successfully" });
    } catch (error) {
        return res.status(500).json({ message: `Delete reel error: ${error}` });
    }
};

export const saveReel = async (req, res) => {
    try {
        const reelId = req.params.reelId;
        const user = await User.findById(req.userId);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const alreadySaved = user.savedReels.some(id => id.toString() === reelId.toString());

        if (alreadySaved) {
            user.savedReels = user.savedReels.filter(id => id.toString() !== reelId.toString());
        } else {
            user.savedReels.push(reelId);
        }

        await user.save();
        await user.populate("savedReels");
        return res.status(200).json(user);
    } catch (error) {
        return res.status(500).json({ message: `Save reel error: ${error}` });
    }
};

export const getSavedReels = async (req, res) => {
    try {
        const user = await User.findById(req.userId)
            .populate({
                path: "savedReels",
                populate: [
                    { path: "owner", select: "fullName email profileImage" },
                    { 
                        path: "shop", 
                        select: "name image city owner",
                        populate: { path: "owner", select: "_id" }
                    },
                    { path: "item", select: "name price image" },
                    { path: "comments.author", select: "fullName profileImage" },
                    { path: "comments.replies.author", select: "fullName profileImage" }
                ]
            });
        
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.status(200).json(user.savedReels);
    } catch (error) {
        return res.status(500).json({ message: `Get saved reels error: ${error}` });
    }
};
