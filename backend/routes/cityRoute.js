// routes/cityRoutes.js
const express = require("express");
const router = express.Router();
const {
  getAllCities,
  getCityById,
  createCity,
  updateCity,
  deleteCity,
  seedCities,
} = require("../controllers/cityController");

const {
  protect,
  admin,
  adminOrRestaurateur,
} = require("../middleware/authMiddleware");

// Public routes
router.get("/", getAllCities);
router.get("/:id", getCityById);

// Admin-only routes
router.post("/", protect, admin, createCity);
router.put("/:id", protect, admin, updateCity);
router.delete("/:id", protect, admin, deleteCity);
router.post("/seed", protect, admin, seedCities);

module.exports = router;
