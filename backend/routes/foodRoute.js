const express = require("express");
const router = express.Router();
const {
  getFoodsByRestaurant,
  getFoodById,
  createFood,
  updateFood,
  deleteFood,
  getPopularFoods,
  uploadFoodImage,
  seedFoods,
} = require("../controllers/foodController");
const {
  protect,
  admin,
  restaurateur,
} = require("../middleware/authMiddleware");

// Add this to your imports
const multer = require("multer");
const path = require("path");

// Set up multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Make sure this directory exists
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

// Configure file filter to only accept images
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed!"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

// Public routes
router.get("/popular", getPopularFoods);
router.get("/restaurant/:restaurantId", getFoodsByRestaurant);
router.get("/:id", getFoodById);

// Admin routes
router.post("/", protect, restaurateur, createFood);
router.put("/:id", protect, updateFood);
router.delete("/:id", protect, deleteFood);
// Add this route for uploading food images
router.post(
  "/:id/upload-image",
  protect,
  upload.single("image"),
  uploadFoodImage
);

// SEED ROUTE - FOR DEVELOPMENT
router.post("/seed", protect, admin, seedFoods);

module.exports = router;
