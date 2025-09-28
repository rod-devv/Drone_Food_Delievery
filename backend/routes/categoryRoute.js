// routes/categoryRoutes.js
const express = require("express");
const router = express.Router();
const {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  seedCategories,
} = require("../controllers/categoryController");

const {
  protect,
  admin,
  adminOrRestaurateur,
} = require("../middleware/authMiddleware");

// Public routes
router.get("/", getAllCategories);
router.get("/:id", getCategoryById);

// Admin-only routes
router.post("/", protect, admin, createCategory);
router.put("/:id", protect, admin, updateCategory);
router.delete("/:id", protect, admin, deleteCategory);
router.post("/seed", protect, admin, seedCategories);

module.exports = router;
