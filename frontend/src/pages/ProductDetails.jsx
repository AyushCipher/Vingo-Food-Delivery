import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import {
  addToCart,
  updateItemRating,
} from "../redux/userSlice";
import { serverUrl } from "../config";
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import { toast } from "react-toastify";
import { MdKeyboardBackspace } from "react-icons/md";
import {
  FaMinus,
  FaPlus,
  FaShoppingCart,
  FaDrumstickBite,
  FaLeaf,
  FaStar,
  FaStarHalfAlt,
  FaRegStar,
  FaArrowLeft,
  FaEdit,
  FaTrash,
  FaHome,
} from "react-icons/fa";
import { ClipLoader } from "react-spinners";

function ProductDetails() {
  const { itemId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { userData } = useSelector((state) => state.user);

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);

  // Reviews state
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [canReview, setCanReview] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);
  const [userReview, setUserReview] = useState(null);
  const [ratingDistribution, setRatingDistribution] = useState({
    5: 0,
    4: 0,
    3: 0,
    2: 0,
    1: 0,
  });
  const [totalReviews, setTotalReviews] = useState(0);
  const [reviewSort, setReviewSort] = useState("newest");

  // Review form state
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newReview, setNewReview] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [editingReview, setEditingReview] = useState(false);

  // Fetch item details
  useEffect(() => {
    const fetchItem = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${serverUrl}/api/item/getbyid/${itemId}`, {
          withCredentials: true,
        });
        setItem(res.data);
      } catch (error) {
        console.error("Error fetching item:", error);
        toast.error("Failed to load product details");
      } finally {
        setLoading(false);
      }
    };

    if (itemId) {
      fetchItem();
    }
  }, [itemId]);

  // Check if user can review
  useEffect(() => {
    const checkCanReview = async () => {
      try {
        const res = await axios.get(
          `${serverUrl}/api/review/can-review/${itemId}`,
          { withCredentials: true },
        );
        setCanReview(res.data.canReview);
        setHasReviewed(res.data.hasReviewed);
        setUserReview(res.data.userReview);
      } catch (error) {
        console.error("Error checking review status:", error);
      }
    };

    if (itemId && userData) {
      checkCanReview();
    }
  }, [itemId, userData]);

  // Fetch reviews
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setReviewsLoading(true);
        const res = await axios.get(
          `${serverUrl}/api/review/item/${itemId}?sort=${reviewSort}`,
          { withCredentials: true },
        );
        setReviews(res.data.reviews);
        setTotalReviews(res.data.totalReviews);
        setRatingDistribution(res.data.ratingDistribution);
      } catch (error) {
        console.error("Error fetching reviews:", error);
      } finally {
        setReviewsLoading(false);
      }
    };

    if (itemId) {
      fetchReviews();
    }
  }, [itemId, reviewSort]);

  const handleIncrease = () => {
    setQuantity((prev) => prev + 1);
  };

  const handleDecrease = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  const handleAddToCart = () => {
    if (quantity > 0) {
      dispatch(
        addToCart({
          id: item._id,
          name: item.name,
          shop: item.shop,
          price: item.price,
          quantity,
          image: item.image,
          type: item.type,
        }),
      );
      toast.success(`${item.name} added to cart!`);
    }
  };

  const handleSubmitReview = async () => {
    if (!newReview.trim()) {
      toast.error("Please write a review");
      return;
    }

    try {
      setSubmittingReview(true);

      if (editingReview && userReview) {
        // Update existing review
        const res = await axios.put(
          `${serverUrl}/api/review/update/${userReview._id}`,
          { rating: newRating, review: newReview },
          { withCredentials: true },
        );
        toast.success("Review updated successfully!");
        setUserReview(res.data.review);
      } else {
        // Add new review
        const res = await axios.post(
          `${serverUrl}/api/review/add/${itemId}`,
          { rating: newRating, review: newReview },
          { withCredentials: true },
        );
        toast.success("Review added successfully!");
        setHasReviewed(true);
        setCanReview(false);
        setUserReview(res.data.review);
      }

      // Refresh reviews
      const reviewsRes = await axios.get(
        `${serverUrl}/api/review/item/${itemId}?sort=${reviewSort}`,
        { withCredentials: true },
      );
      setReviews(reviewsRes.data.reviews);
      setTotalReviews(reviewsRes.data.totalReviews);
      setRatingDistribution(reviewsRes.data.ratingDistribution);

      // Refresh item to get updated rating
      const itemRes = await axios.get(
        `${serverUrl}/api/item/getbyid/${itemId}`,
        {
          withCredentials: true,
        },
      );
      setItem(itemRes.data);

      // Update Redux state for home page
      dispatch(
        updateItemRating({
          itemId: itemId,
          rating: itemRes.data.rating,
        }),
      );

      setShowReviewForm(false);
      setEditingReview(false);
      setNewRating(5);
      setNewReview("");
    } catch (error) {
      console.error("Error submitting review:", error);
      toast.error(error.response?.data?.message || "Failed to submit review");
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleDeleteReview = async () => {
    if (!userReview) return;

    if (!window.confirm("Are you sure you want to delete your review?")) return;

    try {
      await axios.delete(`${serverUrl}/api/review/delete/${userReview._id}`, {
        withCredentials: true,
      });
      toast.success("Review deleted successfully!");
      setUserReview(null);
      setHasReviewed(false);
      setCanReview(true);

      // Refresh reviews
      const reviewsRes = await axios.get(
        `${serverUrl}/api/review/item/${itemId}?sort=${reviewSort}`,
        { withCredentials: true },
      );
      setReviews(reviewsRes.data.reviews);
      setTotalReviews(reviewsRes.data.totalReviews);
      setRatingDistribution(reviewsRes.data.ratingDistribution);

      // Refresh item
      const itemRes = await axios.get(
        `${serverUrl}/api/item/getbyid/${itemId}`,
        {
          withCredentials: true,
        },
      );
      setItem(itemRes.data);

      // Update Redux state for home page
      dispatch(
        updateItemRating({
          itemId: itemId,
          rating: itemRes.data.rating,
        }),
      );
    } catch (error) {
      console.error("Error deleting review:", error);
      toast.error("Failed to delete review");
    }
  };

  const handleEditReview = () => {
    if (userReview) {
      setNewRating(userReview.rating);
      setNewReview(userReview.review);
      setEditingReview(true);
      setShowReviewForm(true);
    }
  };

  const renderStars = (rating, size = "text-lg") => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<FaStar key={i} className={`text-yellow-400 ${size}`} />);
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(
          <FaStarHalfAlt key={i} className={`text-yellow-400 ${size}`} />,
        );
      } else {
        stars.push(<FaRegStar key={i} className={`text-yellow-400 ${size}`} />);
      }
    }
    return stars;
  };

  const renderInteractiveStars = () => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setNewRating(star)}
            className="focus:outline-none"
            aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
          >
            {star <= newRating ? (
              <FaStar className="text-yellow-400 text-2xl hover:scale-110 transition-transform" />
            ) : (
              <FaRegStar className="text-yellow-400 text-2xl hover:scale-110 transition-transform" />
            )}
          </button>
        ))}
      </div>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Nav />
        <div className="flex justify-center items-center h-[60vh]">
          <ClipLoader color="#ff4d2d" size={50} />
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Nav />
        <div className="flex flex-col justify-center items-center h-[60vh]">
          <h2 className="text-2xl font-bold text-gray-700">
            Product not found
          </h2>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 px-6 py-2 bg-[#ff4d2d] text-white rounded-lg hover:bg-[#e63e1f]"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const allImages = [item.image, ...(item.images || [])].filter(Boolean);

  return (
    <div className="min-h-screen bg-gray-50">
      <Nav />

      <div className="max-w-7xl mx-auto px-4 py-8 mt-5">
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-[#ff4d2d] mb-6 transition-colors"
        >
          <FaArrowLeft />
          <span>Back</span>
        </button>

        {/* Product Section */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="grid md:grid-cols-2 gap-8 p-6 md:p-10">
            {/* Image Section */}
            <div className="space-y-4">
              <div className="relative w-full h-[350px] md:h-[450px] rounded-2xl overflow-hidden bg-gray-100">
                <img
                  src={allImages[activeImage] || item.image}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
                {/* Items Button - Top Left */}
                <button
                  onClick={() => navigate(-1)}
                  className="absolute top-4 left-4 p-2 text-[#ff4d2d] hover:scale-110 transition-transform"
                  aria-label="Go back"
                >
                  <MdKeyboardBackspace size={26} />
                </button>
                {/* Veg/Non-Veg Badge */}
                <div className="absolute top-4 right-4 bg-white rounded-full p-2 shadow-lg">
                  {item.type === "veg" ? (
                    <FaLeaf className="text-green-600 text-xl" />
                  ) : (
                    <FaDrumstickBite className="text-red-600 text-xl" />
                  )}
                </div>
                {/* Best Seller Badge */}
                {item.bestSeller && (
                  <div className="absolute top-16 left-4 bg-yellow-400 text-black px-3 py-1 rounded-full text-sm font-semibold">
                    Best Seller
                  </div>
                )}
              </div>

              {/* Thumbnail Images */}
              {allImages.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {allImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImage(idx)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                        activeImage === idx
                          ? "border-[#ff4d2d] shadow-lg"
                          : "border-gray-200"
                      }`}
                    >
                      <img
                        src={img}
                        alt={`${item.name} ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Details Section */}
            <div className="space-y-6">
              {/* Category Badge */}
              <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                {item.category}
              </span>

              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                {item.name}
              </h1>

              {/* Rating */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  {renderStars(item.rating?.average || 0)}
                </div>
                <span className="text-gray-600">
                  {item.rating?.average?.toFixed(1) || "0.0"} (
                  {item.rating?.count || 0} reviews)
                </span>
              </div>

              {/* Price */}
              <div className="text-3xl font-bold text-[#ff4d2d]">
                ₹{item.price}
              </div>

              {/* Description */}
              <p className="text-gray-600 leading-relaxed">
                {item.description ||
                  "Delicious food item prepared with fresh ingredients and love."}
              </p>

              {/* Nutrition Info */}
              {item.nutritionInfo && item.nutritionInfo.calories > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">
                    Nutrition Info:
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="bg-gray-50 p-3 rounded-lg text-center">
                      <p className="text-sm text-gray-500">Calories</p>
                      <p className="font-bold text-gray-800">
                        {item.nutritionInfo.calories}
                      </p>
                    </div>
                    {item.nutritionInfo.protein && (
                      <div className="bg-gray-50 p-3 rounded-lg text-center">
                        <p className="text-sm text-gray-500">Protein</p>
                        <p className="font-bold text-gray-800">
                          {item.nutritionInfo.protein}
                        </p>
                      </div>
                    )}
                    {item.nutritionInfo.carbs && (
                      <div className="bg-gray-50 p-3 rounded-lg text-center">
                        <p className="text-sm text-gray-500">Carbs</p>
                        <p className="font-bold text-gray-800">
                          {item.nutritionInfo.carbs}
                        </p>
                      </div>
                    )}
                    {item.nutritionInfo.fat && (
                      <div className="bg-gray-50 p-3 rounded-lg text-center">
                        <p className="text-sm text-gray-500">Fat</p>
                        <p className="font-bold text-gray-800">
                          {item.nutritionInfo.fat}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Quantity & Add to Cart */}
              <div className="flex items-center gap-6 pt-4">
                <div className="flex items-center gap-4">
                  <button
                    onClick={handleDecrease}
                    className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                    aria-label="Decrease quantity"
                  >
                    <FaMinus className="text-gray-600" />
                  </button>
                  <span className="text-xl font-bold w-8 text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={handleIncrease}
                    className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                    aria-label="Increase quantity"
                  >
                    <FaPlus className="text-gray-600" />
                  </button>
                </div>

                <button
                  onClick={handleAddToCart}
                  className="flex-1 flex items-center justify-center gap-3 bg-[#ff4d2d] text-white py-4 px-8 rounded-xl font-semibold text-lg hover:bg-[#e63e1f] transition-colors shadow-lg hover:shadow-xl"
                >
                  <FaShoppingCart />
                  Add to Cart - ₹{item.price * quantity}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-10 bg-white rounded-2xl shadow-lg p-6 md:p-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Customer Reviews
          </h2>

          {/* Rating Summary */}
          <div className="grid md:grid-cols-3 gap-8 mb-8 pb-8 border-b border-gray-200">
            {/* Average Rating */}
            <div className="text-center">
              <div className="text-5xl font-bold text-gray-900">
                {item.rating?.average?.toFixed(1) || "0.0"}
              </div>
              <div className="flex justify-center mt-2">
                {renderStars(item.rating?.average || 0, "text-xl")}
              </div>
              <p className="text-gray-500 mt-2">
                Based on {totalReviews} reviews
              </p>
            </div>

            {/* Rating Distribution */}
            <div className="md:col-span-2 space-y-2">
              {[5, 4, 3, 2, 1].map((star) => (
                <div key={star} className="flex items-center gap-3">
                  <span className="w-8 text-sm text-gray-600">{star} ★</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-yellow-400 h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${
                          totalReviews > 0
                            ? (ratingDistribution[star] / totalReviews) * 100
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                  <span className="w-12 text-sm text-gray-500">
                    {ratingDistribution[star]}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Write Review Button / User Review */}
          <div className="mb-8">
            {hasReviewed && userReview ? (
              <div className="bg-purple-50 border border-purple-200 rounded-xl p-6">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-semibold text-purple-800">Your Review</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={handleEditReview}
                      className="text-purple-600 hover:text-purple-800 p-2"
                      aria-label="Edit review"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={handleDeleteReview}
                      className="text-red-500 hover:text-red-700 p-2"
                      aria-label="Delete review"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  {renderStars(userReview.rating, "text-base")}
                </div>
                <p className="text-gray-700">{userReview.review}</p>
                <p className="text-sm text-gray-500 mt-2">
                  {formatDate(userReview.createdAt)}
                </p>
              </div>
            ) : canReview ? (
              <button
                onClick={() => setShowReviewForm(true)}
                className="w-full md:w-auto px-8 py-3 bg-[#ff4d2d] text-white rounded-xl font-semibold hover:bg-[#e63e1f] transition-colors"
              >
                Write a Review
              </button>
            ) : (
              <p className="text-gray-500 italic">
                You can only review items you have ordered and received.
              </p>
            )}
          </div>

          {/* Review Form Modal */}
          {showReviewForm && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  {editingReview ? "Edit Your Review" : "Write a Review"}
                </h3>

                <div className="mb-4">
                  <label className="block text-gray-700 font-medium mb-2">
                    Rating
                  </label>
                  {renderInteractiveStars()}
                </div>

                <div className="mb-6">
                  <label className="block text-gray-700 font-medium mb-2">
                    Your Review
                  </label>
                  <textarea
                    value={newReview}
                    onChange={(e) => setNewReview(e.target.value)}
                    placeholder="Share your experience with this item..."
                    className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#ff4d2d] focus:border-transparent resize-none"
                    rows={4}
                    maxLength={500}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    {newReview.length}/500 characters
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowReviewForm(false);
                      setEditingReview(false);
                      setNewRating(5);
                      setNewReview("");
                    }}
                    className="flex-1 py-3 border border-gray-300 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmitReview}
                    disabled={submittingReview}
                    className="flex-1 py-3 bg-[#ff4d2d] text-white rounded-xl font-semibold hover:bg-[#e63e1f] transition-colors disabled:opacity-50"
                  >
                    {submittingReview ? (
                      <ClipLoader color="#fff" size={20} />
                    ) : editingReview ? (
                      "Update Review"
                    ) : (
                      "Submit Review"
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Sort Options */}
          {reviews.length > 0 && (
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-semibold text-gray-800">
                All Reviews ({totalReviews})
              </h3>
              <select
                value={reviewSort}
                onChange={(e) => setReviewSort(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff4d2d] focus:border-transparent"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="highest">Highest Rated</option>
                <option value="lowest">Lowest Rated</option>
              </select>
            </div>
          )}

          {/* Reviews List */}
          {reviewsLoading ? (
            <div className="flex justify-center py-10">
              <ClipLoader color="#ff4d2d" size={40} />
            </div>
          ) : reviews.length > 0 ? (
            <div className="space-y-6">
              {reviews.map((review) => (
                <div
                  key={review._id}
                  className="border-b border-gray-100 pb-6 last:border-0"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                      {review.user?.profilePic ? (
                        <img
                          src={review.user.profilePic}
                          alt={review.user.fullName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-500 font-bold text-lg">
                          {review.user?.fullName?.charAt(0) || "U"}
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="font-semibold text-gray-900">
                          {review.user?.fullName || "Anonymous"}
                        </span>
                        <span className="text-sm text-gray-500">
                          {formatDate(review.createdAt)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 mb-2">
                        {renderStars(review.rating, "text-sm")}
                      </div>
                      <p className="text-gray-600">{review.review}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-gray-500">
                No reviews yet. Be the first to review!
              </p>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default ProductDetails;
