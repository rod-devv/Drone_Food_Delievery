const Review = require("../models/reviewModel");
const Restaurant = require("../models/restaurantModel");

// @desc    Get reviews for a restaurant
// @route   GET /api/reviews/restaurant/:restaurantId
// @access  Public
const getReviewsByRestaurant = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const reviews = await Review.find({ restaurant: req.params.restaurantId })
      .sort({ date: -1 })
      .limit(limit)
      .skip((page - 1) * limit);

    const total = await Review.countDocuments({
      restaurant: req.params.restaurantId,
    });

    res.json({
      reviews,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Create new review
// @route   POST /api/reviews
// @access  Private
const createReview = async (req, res) => {
  try {
    const { restaurant: restaurantId, rating, comment } = req.body;

    // Check if restaurant exists
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    // Check if user already submitted a review for this restaurant
    const existingReview = await Review.findOne({
      user: req.user._id,
      restaurant: restaurantId,
    });

    if (existingReview) {
      return res
        .status(400)
        .json({ message: "You already reviewed this restaurant" });
    }

    const newReview = new Review({
      restaurant: restaurantId,
      rating,
      comment,
      userName: req.user.name,
      profileImage: req.user.avatar,
      user: req.user._id,
    });

    const review = await newReview.save();

    // Update restaurant rating
    await restaurant.updateRating();

    res.status(201).json(review);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Update review
// @route   PUT /api/reviews/:id
// @access  Private
const updateReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    // Check if user owns the review
    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "User not authorized" });
    }

    const { rating, comment } = req.body;

    review.rating = rating || review.rating;
    review.comment = comment || review.comment;
    review.date = Date.now();

    const updatedReview = await review.save();

    // Update restaurant rating
    const restaurant = await Restaurant.findById(review.restaurant);
    if (restaurant) {
      await restaurant.updateRating();
    }

    res.json(updatedReview);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Delete review
// @route   DELETE /api/reviews/:id
// @access  Private
const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    // Check if user owns the review or is admin
    if (
      review.user.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(401).json({ message: "User not authorized" });
    }

    const restaurantId = review.restaurant;

    await review.remove();

    // Update restaurant rating
    const restaurant = await Restaurant.findById(restaurantId);
    if (restaurant) {
      await restaurant.updateRating();
    }

    res.json({ message: "Review removed" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports = {
  getReviewsByRestaurant,
  createReview,
  updateReview,
  deleteReview,
};
