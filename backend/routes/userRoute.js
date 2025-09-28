const express = require("express");
const router = express.Router();
const {
  loginUser,
  registerUser,
  getAllUsers,
  getUserById,
  updateUserRole,
  deleteUser,
  getProfile,
  updateProfile,
  changePassword,
  seedUsers,
} = require("../controllers/userController");
const { protect, admin } = require("../middleware/authMiddleware");

// Auth routes (public)
router.post("/login", loginUser);
router.post("/register", registerUser);

// User profile routes (protected)
router.get("/profile", protect, getProfile);
router.get("/me", protect, getProfile); // Add this line - alias for /profile
router.put("/profile", protect, updateProfile);
router.put("/change-password", protect, changePassword);

// Admin routes - protected by authentication and admin role check
// Get all users
router.get("/list", protect, admin, getAllUsers);

// Get user by ID
router.get("/:id", protect, admin, getUserById);

// Update user role
router.patch("/:id/role", protect, admin, updateUserRole);

// Delete user
router.delete("/:id", protect, admin, deleteUser);

// SEED ROUTE - FOR DEVELOPMENT
router.post("/seed", protect, admin, seedUsers);

// Seed route for database initialization
router.post("/seed", protect, admin, seedUsers);

// TEMPORARY DEVELOPMENT ROUTES - REMOVE BEFORE PRODUCTION
// These routes bypass authentication for development purposes
router.get("/dev/users", getAllUsers);
router.get("/dev/users/:id", getUserById);
router.patch("/dev/users/:id/role", updateUserRole);
router.delete("/dev/users/:id", deleteUser);

module.exports = router;
