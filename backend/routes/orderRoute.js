const express = require("express");
const router = express.Router();
const {
  createOrder,
  getOrderById,
  getMyOrders,
  getRestaurantOrders,
  updateOrderStatus,
  updatePaymentStatus,
  getOrdersByCity,
  getDeliveries,
} = require("../controllers/orderController");
const {
  protect,
  admin,
  adminOrRestaurateur,
} = require("../middleware/authMiddleware");

// User routes

router.post("/", protect, createOrder);
router.get("/myorders", protect, getMyOrders);
router.get("/:id", protect, getOrderById);
router.get("/by-city/:city", protect, getOrdersByCity);

// Admin routes
router.get("/", protect, adminOrRestaurateur, getDeliveries);
router.get("/restaurant/:restaurantId", protect, admin, getRestaurantOrders);
router.patch("/:id", protect, updateOrderStatus);
router.put("/:id/payment", protect, admin, updatePaymentStatus);

module.exports = router;
