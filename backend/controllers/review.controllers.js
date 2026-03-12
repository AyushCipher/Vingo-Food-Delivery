import Review from "../models/review.model.js";
import Item from "../models/item.model.js";
import Order from "../models/order.model.js";
import mongoose from "mongoose";


// Add a review (only if user has ordered the item)
export const addReview = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { rating, review } = req.body;
    const userId = req.userId;

    // Check if user has ordered this item
    const userOrders = await Order.find({
      user: userId,
      "shopOrders.items.item": itemId,
      "shopOrders.status": "delivered",
    });

    if (!userOrders || userOrders.length === 0) {
      return res.status(403).json({
        message: "You can only review items you have ordered and received",
      });
    }

    // Check if user already reviewed this item
    const existingReview = await Review.findOne({ item: itemId, user: userId });
    if (existingReview) {
      return res.status(400).json({
        message: "You have already reviewed this item",
      });
    }

    // Get the order ID for reference
    const orderId = userOrders[0]._id;

    // Create review
    const newReview = await Review.create({
      item: itemId,
      user: userId,
      order: orderId,
      rating,
      review,
    });

    // Update item rating
    const allReviews = await Review.find({ item: itemId });
    const totalRating = allReviews.reduce((sum, r) => sum + r.rating, 0);
    const avgRating = totalRating / allReviews.length;

    await Item.findByIdAndUpdate(itemId, {
      rating: {
        average: Math.round(avgRating * 10) / 10,
        count: allReviews.length,
      },
    });

    await newReview.populate("user", "fullName profilePic");

    return res.status(201).json({
      message: "Review added successfully",
      review: newReview,
    });
  } catch (error) {
    console.error("Add review error:", error);
    return res.status(500).json({ message: `Add review error: ${error}` });
  }
};



// Get reviews for an item
export const getItemReviews = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { page = 1, limit = 10, sort = "newest" } = req.query;

    const sortOptions = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      highest: { rating: -1 },
      lowest: { rating: 1 },
    };

    const reviews = await Review.find({ item: itemId })
      .populate("user", "fullName profilePic")
      .sort(sortOptions[sort] || sortOptions.newest)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const totalReviews = await Review.countDocuments({ item: itemId });

    // Get rating distribution
    const ratingDistribution = await Review.aggregate([
      { $match: { item: new mongoose.Types.ObjectId(itemId) } },
      { $group: { _id: "$rating", count: { $sum: 1 } } },
      { $sort: { _id: -1 } },
    ]);

    // Convert to object format
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    ratingDistribution.forEach((r) => {
      distribution[r._id] = r.count;
    });

    return res.status(200).json({
      reviews,
      totalReviews,
      totalPages: Math.ceil(totalReviews / limit),
      currentPage: parseInt(page),
      ratingDistribution: distribution,
    });
  } catch (error) {
    console.error("Get reviews error:", error);
    return res.status(500).json({ message: `Get reviews error: ${error}` });
  }
};



// Check if user can review an item
export const canUserReview = async (req, res) => {
  try {
    const { itemId } = req.params;
    const userId = req.userId;

    // Check if user has ordered this item (delivered)
    const userOrders = await Order.find({
      user: userId,
      "shopOrders.items.item": itemId,
      "shopOrders.status": "delivered",
    });

    const hasOrdered = userOrders && userOrders.length > 0;

    // Check if user already reviewed
    const existingReview = await Review.findOne({ item: itemId, user: userId });
    const hasReviewed = !!existingReview;

    return res.status(200).json({
      canReview: hasOrdered && !hasReviewed,
      hasOrdered,
      hasReviewed,
      userReview: existingReview,
    });
  } catch (error) {
    console.error("Can review check error:", error);
    return res.status(500).json({ message: `Error checking review status: ${error}` });
  }
};



// Update a review
export const updateReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { rating, review } = req.body;
    const userId = req.userId;

    const existingReview = await Review.findById(reviewId);

    if (!existingReview) {
      return res.status(404).json({ message: "Review not found" });
    }

    if (existingReview.user.toString() !== userId) {
      return res.status(403).json({ message: "You can only edit your own review" });
    }

    existingReview.rating = rating;
    existingReview.review = review;
    await existingReview.save();

    // Update item rating
    const itemId = existingReview.item;
    const allReviews = await Review.find({ item: itemId });
    const totalRating = allReviews.reduce((sum, r) => sum + r.rating, 0);
    const avgRating = totalRating / allReviews.length;

    await Item.findByIdAndUpdate(itemId, {
      rating: {
        average: Math.round(avgRating * 10) / 10,
        count: allReviews.length,
      },
    });

    await existingReview.populate("user", "fullName profilePic");

    return res.status(200).json({
      message: "Review updated successfully",
      review: existingReview,
    });
  } catch (error) {
    console.error("Update review error:", error);
    return res.status(500).json({ message: `Update review error: ${error}` });
  }
};



// Delete a review
export const deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.userId;

    const review = await Review.findById(reviewId);

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    if (review.user.toString() !== userId) {
      return res.status(403).json({ message: "You can only delete your own review" });
    }

    const itemId = review.item;
    await Review.findByIdAndDelete(reviewId);

    // Update item rating
    const allReviews = await Review.find({ item: itemId });
    if (allReviews.length > 0) {
      const totalRating = allReviews.reduce((sum, r) => sum + r.rating, 0);
      const avgRating = totalRating / allReviews.length;

      await Item.findByIdAndUpdate(itemId, {
        rating: {
          average: Math.round(avgRating * 10) / 10,
          count: allReviews.length,
        },
      });
    } else {
      await Item.findByIdAndUpdate(itemId, {
        rating: { average: 0, count: 0 },
      });
    }

    return res.status(200).json({ message: "Review deleted successfully" });
  } catch (error) {
    console.error("Delete review error:", error);
    return res.status(500).json({ message: `Delete review error: ${error}` });
  }
};
