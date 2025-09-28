const express = require("express");
const router = express.Router();
const {
  getOptionsByCategory,
  getAllOptions,
  createOption,
  updateOption,
  deleteOption,
  seedOptions,
} = require("../controllers/optionController");
const {
  protect,
  admin,
  restaurateur,
} = require("../middleware/authMiddleware");

// Public routes
router.get("/", getAllOptions);
router.get("/category/:category", getOptionsByCategory);

// Admin routes
router.post("/", protect, restaurateur, createOption);
router.put("/:id", protect, restaurateur, updateOption);
router.delete("/:id", protect, restaurateur, deleteOption);

// SEED ROUTE - FOR DEVELOPMENT
router.post("/seed", protect, admin, seedOptions);

module.exports = router;
