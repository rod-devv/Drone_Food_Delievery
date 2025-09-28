const Restaurant = require("../models/restaurantModel");
const Food = require("../models/foodModel");
const Review = require("../models/reviewModel");
const User = require("../models/userModel");

// @desc    Get all restaurants with filtering, sorting, and pagination
// @route   GET /api/restaurants
// @access  Public
const getRestaurants = async (req, res) => {
  try {
    const { city, category, search, sort, page = 1, limit = 10 } = req.query;

    // Build query
    const query = {};

    if (city) {
      query.city = city;
    }

    if (category) {
      query.category = category;
    }

    if (search) {
      query.$text = { $search: search };
    }

    // Count total results for pagination
    const total = await Restaurant.countDocuments(query);

    // Build sort options
    let sortOptions = {};
    if (sort === "rating") {
      sortOptions = { rating: -1 };
    } else if (sort === "price-asc") {
      sortOptions = { priceRange: 1 };
    } else if (sort === "price-desc") {
      sortOptions = { priceRange: -1 };
    } else {
      // Default sort
      sortOptions = { rating: -1 };
    }

    // Execute query with pagination
    const restaurants = await Restaurant.find(query)
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    res.json({
      restaurants,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error in getRestaurants:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc    Get restaurant by ID
// @route   GET /api/restaurants/:id
// @access  Public
const getRestaurantById = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);

    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    // Get menu items for this restaurant
    const menuItems = await Food.find({ restaurant: restaurant._id }).populate(
      "availableOptions",
      "name price"
    );

    // Get reviews for this restaurant
    const reviews = await Review.find({ restaurant: restaurant._id })
      .sort({ date: -1 })
      .limit(10);

    res.json({
      ...restaurant.toObject(),
      menuItems,
      reviews,
    });
  } catch (error) {
    console.error("Error in getRestaurantById:", error);
    if (error.kind === "ObjectId") {
      return res.status(404).json({ message: "Restaurant not found" });
    }
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc    Get nearby restaurants
// @route   GET /api/restaurants/nearby
// @access  Public
const getNearbyRestaurants = async (req, res) => {
  try {
    const { lng, lat, maxDistance = 5000 } = req.query; // maxDistance in meters

    if (!lng || !lat) {
      return res
        .status(400)
        .json({ message: "Longitude and latitude are required" });
    }

    // Find restaurants within specified distance
    const restaurants = await Restaurant.find({
      coordinates: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [parseFloat(lng), parseFloat(lat)],
          },
          $maxDistance: parseInt(maxDistance),
        },
      },
    }).limit(20);

    res.json(restaurants);
  } catch (error) {
    console.error("Error in getNearbyRestaurants:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc    Get restaurant categories
// @route   GET /api/restaurants/categories
// @access  Public
const getCategories = async (req, res) => {
  try {
    const categories = await Restaurant.distinct("category");
    res.json(categories);
  } catch (error) {
    console.error("Error in getCategories:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc    Get cities with restaurants
// @route   GET /api/restaurants/cities
// @access  Public
const getCities = async (req, res) => {
  try {
    const cities = await Restaurant.distinct("city");
    res.json(cities);
  } catch (error) {
    console.error("Error in getCities:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

const getRestaurantsByCity = async (req, res) => {
  try {
    const { city } = req.params;

    console.log("--- 1 ---", city);

    // Validate that city is provided
    if (!city) {
      return res.status(400).json({ error: "City parameter is required" });
    }

    // Query the database for restaurants in this city
    // Adjust the query based on your database schema
    const restaurants = await Restaurant.find({ city: city.toLowerCase() });

    console.log("--- 2 ---", restaurants);
    // Return the results
    res.json(restaurants);
  } catch (error) {
    console.error("Error fetching restaurants by city:", error);
    res.status(500).json({ error: "Failed to fetch restaurants by city" });
  }
};

// @desc    Get restaurants owned by the logged-in restaurateur
// @route   GET /api/restaurants/my/restaurants
// @access  Private/Restaurateur
const getMyRestaurants = async (req, res) => {
  try {
    // Ensure user is a restaurateur
    if (req.user.role !== "restaurateur") {
      return res
        .status(403)
        .json({ message: "Unauthorized. Restaurateur access required." });
    }

    // Get all restaurants owned by this user
    const restaurants = await Restaurant.find({
      _id: { $in: req.user.ownedRestaurants },
    });

    res.json(restaurants);
  } catch (error) {
    console.error("Error in getMyRestaurants:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc    Create new restaurant
// @route   POST /api/restaurants
// @access  Private/Admin or Restaurateur
const createRestaurant = async (req, res) => {
  console.log(req.body);
  try {
    // Create restaurant with owner set to current user (if they're a restaurateur)
    const restaurantData = { ...req.body };

    // Set the owner field if the user is a restaurateur
    if (req.user.role === "restaurateur") {
      restaurantData.owner = req.user._id;
    }

    const newRestaurant = new Restaurant(restaurantData);
    const restaurant = await newRestaurant.save();

    // If user is a restaurateur, add this restaurant to their owned restaurants
    if (req.user.role === "restaurateur") {
      // Update user's ownedRestaurants array
      await User.findByIdAndUpdate(
        req.user._id,
        { $push: { ownedRestaurants: restaurant._id } },
        { new: true }
      );
    }

    res.status(201).json(restaurant);
  } catch (error) {
    console.error("Error in createRestaurant:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc    Update restaurant
// @route   PUT /api/restaurants/:id
// @access  Private/Owner or Admin
const updateRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);

    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    // Update the restaurant
    const updatedRestaurant = await Restaurant.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json(updatedRestaurant);
  } catch (error) {
    console.error("Error in updateRestaurant:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc    Delete restaurant
// @route   DELETE /api/restaurants/:id
// @access  Private/Owner or Admin
const deleteRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);

    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    // Delete associated data
    await Food.deleteMany({ restaurant: req.params.id });
    await Review.deleteMany({ restaurant: req.params.id });

    // Remove the restaurant from the owner's list if it has an owner
    if (restaurant.owner) {
      await User.findByIdAndUpdate(restaurant.owner, {
        $pull: { ownedRestaurants: req.params.id },
      });
    }

    // Delete the restaurant
    await restaurant.deleteOne();

    res.json({ message: "Restaurant removed successfully" });
  } catch (error) {
    console.error("Error in deleteRestaurant:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc    Get restaurant categories
// @route   GET /api/restaurants/:id/categories
// @access  Public
const getRestaurantCategories = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);

    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    // Extract categories from restaurant menu
    const categories =
      restaurant.menu && restaurant.menu.categories
        ? restaurant.menu.categories
        : [];

    res.json(categories);
  } catch (error) {
    console.error("Error fetching restaurant categories:", error);
    if (error.kind === "ObjectId") {
      return res.status(404).json({ message: "Restaurant not found" });
    }
    res.status(500).json({
      message: "Failed to fetch restaurant categories",
      error: error.message,
    });
  }
};

// @desc    Add category to restaurant
// @route   POST /api/restaurants/:id/categories
// @access  Private/Restaurateur or Admin
const addCategoryToRestaurant = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Category name is required" });
    }

    const restaurant = await Restaurant.findById(req.params.id);

    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    // For restaurateurs, verify they own this restaurant
    if (
      req.user.role === "restaurateur" &&
      (!restaurant.owner || restaurant.owner.toString() !== req.user.id)
    ) {
      return res.status(403).json({
        message: "Not authorized - you can only modify your own restaurants",
      });
    }

    // Initialize menu if it doesn't exist
    if (!restaurant.menu) {
      restaurant.menu = { categories: [] };
    }

    // Check if category already exists
    if (restaurant.menu.categories && restaurant.menu.categories.length > 0) {
      const categoryExists = restaurant.menu.categories.some(
        (category) => category.name.toLowerCase() === name.toLowerCase()
      );

      if (categoryExists) {
        return res
          .status(400)
          .json({ message: "This category already exists" });
      }
    }

    // Generate a unique ID for the category
    const mongoose = require("mongoose");
    const newCategoryId = new mongoose.Types.ObjectId().toString();

    // Add the category
    restaurant.menu.categories.push({
      id: newCategoryId,
      name: name,
    });

    const updatedRestaurant = await restaurant.save();

    // Find the newly added category to return
    const newCategory = updatedRestaurant.menu.categories.find(
      (cat) => cat.id === newCategoryId
    );

    res.status(201).json(newCategory);
  } catch (error) {
    console.error("Error adding category to restaurant:", error);
    res.status(500).json({
      message: "Failed to add category",
      error: error.message,
    });
  }
};

// @desc   Load initial restaurant data
// @route  POST /api/restaurants/seed
// @access Private (Admin)
const seedRestaurants = async (req, res) => {
  try {
    // Import restaurant data from data file
    const { restaurants } = require("../data/restaurants.js");

    console.log(`Starting to seed ${restaurants.length} restaurants...`);

    // Delete existing restaurants first
    await Restaurant.deleteMany({});
    console.log("Cleared existing restaurants");

    // Get existing users to find owners if needed
    const users = await User.find({ role: "restaurateur" });
    
    // Prepare restaurants for seeding - we'll skip the menu items for now
    // as those need to be created as separate Food documents
    const restaurantsToSeed = restaurants.map((restaurant, index) => {
      const { id, menu, ...restaurantData } = restaurant;
      
      // Assign a random user as owner if available
      if (users.length > 0) {
        restaurantData.owner = users[index % users.length]._id;
      }
      
      // Keep only the menu categories, not the items
      if (menu) {
        restaurantData.menu = {
          categories: menu.categories || []
        };
      }
      
      return restaurantData;
    });

    // Insert restaurants
    const seededRestaurants = await Restaurant.insertMany(restaurantsToSeed);
    console.log(`Successfully seeded ${seededRestaurants.length} restaurants`);

    res.status(200).json({
      success: true,
      message: "Restaurants seeded successfully",
      count: seededRestaurants.length,
      data: seededRestaurants,
    });
  } catch (error) {
    console.error("Error seeding restaurants:", error);
    res.status(500).json({
      success: false,
      message: "Server error while seeding restaurants",
      error: error.message,
    });
  }
};

// Then update your module.exports to include the new functions
module.exports = {
  getRestaurants,
  getRestaurantById,
  getNearbyRestaurants,
  getCategories,
  getCities,
  getMyRestaurants,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
  getRestaurantsByCity,
  // Add these two new functions:
  getRestaurantCategories,
  addCategoryToRestaurant,
  seedRestaurants,
};
