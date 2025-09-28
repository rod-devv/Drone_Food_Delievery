const Food = require("../models/foodModel");
const Restaurant = require("../models/restaurantModel");

// @desc    Get menu items for a restaurant
// @route   GET /api/foods/restaurant/:restaurantId
// @access  Public
const getFoodsByRestaurant = async (req, res) => {
  try {
    const { category } = req.query;
    const query = { restaurant: req.params.restaurantId };

    if (category) {
      query.category = category;
    }

    const foods = await Food.find(query)
      .populate("availableOptions", "name price")
      .sort({ category: 1, popular: -1 });

    res.json(foods);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Get food item by ID
// @route   GET /api/foods/:id
// @access  Public
const getFoodById = async (req, res) => {
  try {
    const food = await Food.findById(req.params.id).populate(
      "availableOptions",
      "name price"
    );

    if (!food) {
      return res.status(404).json({ message: "Food item not found" });
    }

    res.json(food);
  } catch (error) {
    console.error(error);
    if (error.kind === "ObjectId") {
      return res.status(404).json({ message: "Food item not found" });
    }
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Create new food item (admin only)
// @route   POST /api/foods
// @access  Private/Admin
// @desc    Create new food item
// @route   POST /api/foods
// @access  Private/Restaurateur
const createFood = async (req, res) => {
  console.log("Create Food Request Headers:", req.headers);
  console.log("Create Food Request Body:", req.body);
  console.log("Create Food Request File:", req.file);

  try {
    // Extract data from request
    const {
      name,
      description,
      price,
      category,
      popular,
      restaurant,
      availableOptions,
    } = req.body;

    console.log(name, description, price, category, restaurant);
    // Validate required fields
    if (!name || !description || !price || !category || !restaurant) {
      return res.status(400).json({
        message: "Missing required fields",
        received: {
          name: !!name,
          description: !!description,
          price: !!price,
          category: !!category,
          restaurant: !!restaurant,
        },
      });
    }

    // Check if restaurant exists
    const restaurantDoc = await Restaurant.findById(restaurant);
    if (!restaurantDoc) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    // Prepare the food object
    const foodData = {
      name,
      description,
      price: Number(price),
      category,
      popular: popular === "true" || popular === true,
      restaurant,
    };

    // Handle image upload if file exists
    if (req.file) {
      foodData.imageUrl = `/uploads/${req.file.filename}`;
    }

    // Handle available options
    if (availableOptions) {
      try {
        foodData.availableOptions = JSON.parse(availableOptions);
      } catch (e) {
        console.error("Error parsing availableOptions:", e);
        // If parsing fails, try to use it as is (if it's already an array)
        foodData.availableOptions = Array.isArray(availableOptions)
          ? availableOptions
          : [];
      }
    }

    console.log("Creating food with data:", foodData);

    const newFood = new Food(foodData);
    const savedFood = await newFood.save();

    // If the food has a category that doesn't exist in the restaurant's menu, add it
    if (savedFood.category && restaurantDoc.menu) {
      const categoryExists = restaurantDoc.menu.categories.some(
        (cat) => cat.name === savedFood.category
      );

      if (!categoryExists) {
        restaurantDoc.menu.categories.push({ name: savedFood.category });
        await restaurantDoc.save();
      }
    }

    console.log("Food created successfully:", savedFood._id);
    res.status(201).json(savedFood);
  } catch (error) {
    console.error("Error creating food:", error);
    res.status(500).json({
      message: "Server Error",
      error: error.message,
      stack: process.env.NODE_ENV === "production" ? "🥞" : error.stack,
    });
  }
};

// @desc    Update food item (admin only)
// @route   PUT /api/foods/:id
// @access  Private/Admin
// const updateFood = async (req, res) => {
//   try {
//     const food = await Food.findById(req.params.id);

//     if (!food) {
//       return res.status(404).json({ message: "Food item not found" });
//     }

//     const updatedFood = await Food.findByIdAndUpdate(req.params.id, req.body, {
//       new: true,
//     });

//     res.json(updatedFood);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Server Error" });
//   }
// };

// Add this to the updateFood function
const updateFood = async (req, res) => {
  try {
    // Get the updated food data from the request body
    const { name, price, description, category, popular, availableOptions } =
      req.body;

    // Find the food by ID
    const food = await Food.findById(req.params.id);

    if (!food) {
      return res.status(404).json({ message: "Food not found" });
    }

    // Update the food with the new values
    food.name = name || food.name;
    food.price = price || food.price;
    food.description = description || food.description;
    food.category = category || food.category;
    food.popular = popular !== undefined ? popular : food.popular;

    // Handle availableOptions - ensure they have the correct structure
    if (availableOptions && Array.isArray(availableOptions)) {
      // Filter out any invalid ObjectIds
      food.availableOptions = availableOptions.filter(
        (id) => typeof id === "string" && /^[0-9a-fA-F]{24}$/.test(id)
      );
    }

    // Save the updated food
    const updatedFood = await food.save();

    res.json(updatedFood);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Delete food item (admin only)
// @route   DELETE /api/foods/:id
// @access  Private/Admin
const deleteFood = async (req, res) => {
  try {
    const food = await Food.findById(req.params.id);

    if (!food) {
      return res.status(404).json({ message: "Food item not found" });
    }

    // Replace food.remove() with Food.deleteOne()
    await Food.deleteOne({ _id: req.params.id });

    res.json({ message: "Food item removed" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Get popular foods across all restaurants
// @route   GET /api/foods/popular
// @access  Public
const getPopularFoods = async (req, res) => {
  try {
    const popularFoods = await Food.find({ popular: true })
      .populate("restaurant", "name imageUrl")
      .limit(10);

    res.json(popularFoods);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

const uploadFoodImage = async (req, res) => {
  try {
    // Check if file exists
    if (!req.file) {
      return res.status(400).json({ message: "No image file provided" });
    }

    const foodId = req.params.id;

    // Get the path where the file was saved by multer
    const imageUrl = `/uploads/${req.file.filename}`;

    // Find the food item
    const food = await Food.findById(foodId);

    if (!food) {
      return res.status(404).json({ message: "Food not found" });
    }

    // Update the image URL
    food.imageUrl = imageUrl;
    await food.save();

    res.json({
      message: "Image uploaded successfully",
      imageUrl,
    });
  } catch (error) {
    console.error("Error uploading image:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Export this function

// @desc   Load initial food data from restaurants
// @route  POST /api/foods/seed
// @access Private (Admin)
const seedFoods = async (req, res) => {
  try {
    // Import restaurant data to extract food items
    const { restaurants } = require("../data/restaurants.js");

    console.log("Starting to seed food items from restaurants...");

    // Delete existing food items first
    await Food.deleteMany({});
    console.log("Cleared existing food items");

    // Get existing restaurants to map food items to them
    const existingRestaurants = await Restaurant.find({});
    
    if (existingRestaurants.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No restaurants found. Please seed restaurants first.",
      });
    }

    // Create a mapping from restaurant names to ObjectIds
    const restaurantMap = {};
    existingRestaurants.forEach(restaurant => {
      restaurantMap[restaurant.name] = restaurant._id;
    });

    const foodsToSeed = [];

    // Extract food items from each restaurant
    restaurants.forEach(restaurant => {
      const restaurantId = restaurantMap[restaurant.name];
      
      if (restaurantId && restaurant.menu && restaurant.menu.items) {
        restaurant.menu.items.forEach(item => {
          const { id, ...foodData } = item;
          foodsToSeed.push({
            ...foodData,
            restaurant: restaurantId,
            // Add any missing fields with defaults
            available: true,
            availableOptions: [], // Will be populated later if needed
          });
        });
      }
    });

    console.log(`Preparing to seed ${foodsToSeed.length} food items`);

    if (foodsToSeed.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No food items found in restaurant data",
      });
    }

    // Insert food items
    const seededFoods = await Food.insertMany(foodsToSeed);
    console.log(`Successfully seeded ${seededFoods.length} food items`);

    res.status(200).json({
      success: true,
      message: "Food items seeded successfully",
      count: seededFoods.length,
      data: seededFoods,
    });
  } catch (error) {
    console.error("Error seeding food items:", error);
    res.status(500).json({
      success: false,
      message: "Server error while seeding food items",
      error: error.message,
    });
  }
};

module.exports = {
  getFoodsByRestaurant,
  getFoodById,
  createFood,
  updateFood,
  deleteFood,
  getPopularFoods,
  uploadFoodImage,
  seedFoods,
};
