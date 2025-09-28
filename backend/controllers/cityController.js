// controllers/cityController.js
const City = require("../models/cityModel");

// @desc   Get all cities
// @route  GET /api/cities
// @access Public
exports.getAllCities = async (req, res) => {
  try {
    const cities = await City.find({ isActive: true }).sort("name");

    res.status(200).json({
      success: true,
      count: cities.length,
      data: cities,
    });
  } catch (error) {
    console.error("Error fetching cities:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching cities",
    });
  }
};

// @desc   Get city by ID
// @route  GET /api/cities/:id
// @access Public
exports.getCityById = async (req, res) => {
  console.log("req.params==", req.params.id);
  try {
    // test admin frontend with id ??? instead of _id
    const city = await City.findOne({ _id: req.params.id });

    if (!city) {
      return res.status(404).json({
        success: false,
        message: "City not found",
      });
    }

    res.status(200).json({
      success: true,
      data: city,
    });
  } catch (error) {
    console.error("Error fetching city:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching city",
    });
  }
};

// @desc   Create a new city
// @route  POST /api/cities
// @access Private (Admin)
exports.createCity = async (req, res) => {
  try {
    // Check if city ID already exists
    const existingCity = await City.findOne({ id: req.body.id });
    if (existingCity) {
      return res.status(400).json({
        success: false,
        message: "A city with this ID already exists",
      });
    }

    const city = await City.create(req.body);

    res.status(201).json({
      success: true,
      data: city,
    });
  } catch (error) {
    console.error("Error creating city:", error);

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({
        success: false,
        message: messages.join(", "),
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error while creating city",
    });
  }
};

// @desc   Update a city
// @route  PUT /api/cities/:id
// @access Private (Admin)
exports.updateCity = async (req, res) => {
  try {
    let city = await City.findOne({ id: req.params.id });

    if (!city) {
      return res.status(404).json({
        success: false,
        message: "City not found",
      });
    }

    city = await City.findOneAndUpdate({ id: req.params.id }, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: city,
    });
  } catch (error) {
    console.error("Error updating city:", error);

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({
        success: false,
        message: messages.join(", "),
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error while updating city",
    });
  }
};

// @desc   Delete a city (soft delete by setting isActive to false)
// @route  DELETE /api/cities/:id
// @access Private (Admin)
exports.deleteCity = async (req, res) => {
  try {
    const city = await City.findOne({ id: req.params.id });

    if (!city) {
      return res.status(404).json({
        success: false,
        message: "City not found",
      });
    }

    // Soft delete - set isActive to false
    await City.findOneAndUpdate({ id: req.params.id }, { isActive: false });

    res.status(200).json({
      success: true,
      message: "City successfully deleted",
    });
  } catch (error) {
    console.error("Error deleting city:", error);
    res.status(500).json({
      success: false,
      message: "Server error while deleting city",
    });
  }
};

// @desc   Load initial city data
// @route  POST /api/cities/seed
// @access Private (Admin)
exports.seedCities = async (req, res) => {
  try {
    // Import cities data from data file
    const { cities } = require("../data/cities.js");

    console.log(`Starting to seed ${cities.length} cities...`);

    // Delete existing cities first
    await City.deleteMany({});
    console.log("Cleared existing cities");

    // Insert the cities from data file
    const seededCities = await City.insertMany(cities);
    console.log(`Successfully seeded ${seededCities.length} cities`);

    res.status(200).json({
      success: true,
      message: "Cities seeded successfully",
      count: seededCities.length,
      data: seededCities,
    });
  } catch (error) {
    console.error("Error seeding cities:", error);
    res.status(500).json({
      success: false,
      message: "Server error while seeding cities",
      error: error.message,
    });
  }
};
