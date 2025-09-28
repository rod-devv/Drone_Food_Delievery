const express = require("express");
const router = express.Router();
const {
  getReviewsByRestaurant,
  createReview,
  updateReview,
  deleteReview,
} = require("../controllers/reviewController");
const { protect } = require("../middleware/authMiddleware");

// Public routes
router.get("/restaurant/:restaurantId", getReviewsByRestaurant);

// Protected routes
router.post("/", protect, createReview);
router.put("/:id", protect, updateReview);
router.delete("/:id", protect, deleteReview);

module.exports = router;
