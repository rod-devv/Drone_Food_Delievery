const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(" ")[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from the token (excluding password)
      req.user = await User.findById(decoded.id).select("-password");

      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: "Not authorized, token failed" });
    }
  }

  if (!token) {
    res.status(401).json({ message: "Not authorized, no token" });
  }
};

// Admin middleware - only allows admins
const admin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(401).json({ message: "Not authorized as an admin" });
  }
};

// Restaurateur middleware - only allows restaurant owners
const restaurateur = (req, res, next) => {
  console.log("restaurateur middleware called === ", req.user);

  if (req.user && req.user.role === "restaurateur") {
    console.log("restaurateur next()");
    next();
  } else {
    res.status(401).json({ message: "Not authorized as a restaurant owner" });
  }
};

// Combined middleware - allows both admins and restaurateurs
const adminOrRestaurateur = (req, res, next) => {
  if (
    req.user &&
    (req.user.role === "admin" || req.user.role === "restaurateur")
  ) {
    next();
  } else {
    res.status(401).json({
      message: "Not authorized - admin or restaurant owner access required",
    });
  }
};

const restaurantOwner = (req, res, next) => {
  // First check if user is admin (admins can access all restaurants)
  if (req.user && req.user.role === "admin") {
    return next();
  }

  // For restaurateurs, check if they own the specific restaurant
  if (req.user && req.user.role === "restaurateur") {
    // Get restaurantId either from params, body or query
    const restaurantId =
      req.params.restaurantId ||
      req.params.id ||
      req.body.restaurantId ||
      req.body.restaurant ||
      req.query.restaurantId;

    // If no restaurant ID found in the request, we can't verify ownership
    if (!restaurantId) {
      return res.status(400).json({
        message: "Restaurant ID is required but was not provided",
      });
    }

    // Check if this restaurant is in the user's ownedRestaurants array
    if (
      req.user.ownedRestaurants &&
      req.user.ownedRestaurants.some(
        (id) => id.toString() === restaurantId.toString()
      )
    ) {
      return next();
    }
  }

  // If we reach here, user doesn't have permission
  res.status(401).json({ message: "Not authorized to access this restaurant" });
};

module.exports = {
  protect,
  admin,
  restaurateur,
  adminOrRestaurateur,
  restaurantOwner,
};
