// controllers/categoryController.js
const Category = require("../models/categoryModel");

// @desc   Get all categories
// @route  GET /api/categories
// @access Public
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true }).sort(
      "sortOrder name"
    );

    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories,
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching categories",
    });
  }
};

// @desc   Get category by ID
// @route  GET /api/categories/:id
// @access Public
exports.getCategoryById = async (req, res) => {
  try {
    const category = await Category.findOne({
      id: req.params.id,
      isActive: true,
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    res.status(200).json({
      success: true,
      data: category,
    });
  } catch (error) {
    console.error("Error fetching category:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching category",
    });
  }
};

// @desc   Create a new category
// @route  POST /api/categories
// @access Private (Admin)
exports.createCategory = async (req, res) => {
  try {
    // Check if category ID already exists
    const existingCategory = await Category.findOne({ id: req.body.id });
    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: "A category with this ID already exists",
      });
    }

    const category = await Category.create(req.body);

    res.status(201).json({
      success: true,
      data: category,
    });
  } catch (error) {
    console.error("Error creating category:", error);

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({
        success: false,
        message: messages.join(", "),
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error while creating category",
    });
  }
};

// @desc   Update a category
// @route  PUT /api/categories/:id
// @access Private (Admin)
exports.updateCategory = async (req, res) => {
  try {
    let category = await Category.findOne({ id: req.params.id });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    category = await Category.findOneAndUpdate(
      { id: req.params.id },
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: category,
    });
  } catch (error) {
    console.error("Error updating category:", error);

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({
        success: false,
        message: messages.join(", "),
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error while updating category",
    });
  }
};

// @desc   Delete a category (soft delete by setting isActive to false)
// @route  DELETE /api/categories/:id
// @access Private (Admin)
exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findOne({ id: req.params.id });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    // Soft delete - set isActive to false
    await Category.findOneAndUpdate({ id: req.params.id }, { isActive: false });

    res.status(200).json({
      success: true,
      message: "Category successfully deleted",
    });
  } catch (error) {
    console.error("Error deleting category:", error);
    res.status(500).json({
      success: false,
      message: "Server error while deleting category",
    });
  }
};

// @desc   Load initial category data
// @route  POST /api/categories/seed
// @access Private (Admin)
exports.seedCategories = async (req, res) => {
  try {
    // Import categories data from data file
    const { categories } = require("../data/categories.js");

    console.log(`Starting to seed ${categories.length} categories...`);

    // Add sortOrder to categories
    const categoriesWithOrder = categories.map((category, index) => ({
      ...category,
      sortOrder: index + 1,
    }));

    // Delete existing categories first
    await Category.deleteMany({});
    console.log("Cleared existing categories");

    // Insert the categories from data file
    const seededCategories = await Category.insertMany(categoriesWithOrder);
    console.log(`Successfully seeded ${seededCategories.length} categories`);

    res.status(200).json({
      success: true,
      message: "Categories seeded successfully",
      count: seededCategories.length,
      data: seededCategories,
    });
  } catch (error) {
    console.error("Error seeding categories:", error);
    res.status(500).json({
      success: false,
      message: "Server error while seeding categories",
      error: error.message,
    });
  }
};
