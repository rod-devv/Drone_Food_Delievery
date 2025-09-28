const Order = require("../models/orderModel");
const Restaurant = require("../models/restaurantModel");

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
// @desc    Create new order
// @route   POST /api/orders
// @access  Private

// @@@@@ add distination coords
const createOrder = async (req, res) => {
  try {
    const {
      restaurant,
      items,
      subtotal,
      deliveryFee,
      total,
      deliveryAddress,
      paymentMethod,
      customer,
      estimatedDeliveryTime,
      city,
      droneDelivery, // Extract drone delivery information
    } = req.body;

    // Check if restaurant exists
    const restaurantExists = await Restaurant.findById(restaurant);
    if (!restaurantExists) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    // Validate items
    if (!items || items.length === 0) {
      return res.status(400).json({ message: "No order items" });
    }

    // Create a new order with prepared items
    const order = new Order({
      restaurant,
      items: items.map((item) => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        totalPrice: item.totalPrice,
        // If food ID exists, use it, otherwise it will be undefined
        ...(item.food && { food: item.food }),
      })),
      subtotal,
      deliveryFee,
      total,
      deliveryAddress,
      paymentMethod,
      customer,
      estimatedDeliveryTime,
      city,
      // If user is authenticated, set the user
      ...(req.user && { user: req.user._id }),
      // Add simplified drone delivery information if provided
      ...(droneDelivery && {
        droneDelivery: {
          startTime: droneDelivery.startTime,
          restaurantCoordinates: droneDelivery.restaurantCoordinates,
          destinationCoordinates: droneDelivery.destinationCoordinates,
          speed: droneDelivery.speed || 10, // Use provided speed or default to 10
        },
      }),
    });

    // Save the order
    const createdOrder = await order.save();
    res.status(201).json(createdOrder);
  } catch (error) {
    console.warn(error);
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("restaurant", "name imageUrl")
      .populate("user", "name email");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Check if user is authorized to view this order
    if (
      order.user._id.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(401).json({ message: "Not authorized" });
    }

    res.json(order);
  } catch (error) {
    console.error(error);
    if (error.kind === "ObjectId") {
      return res.status(404).json({ message: "Order not found" });
    }
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Get logged in user's orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate("restaurant", "name imageUrl")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Get restaurant orders (for restaurant owners/admins)
// @route   GET /api/orders/restaurant/:restaurantId
// @access  Private/Admin
const getRestaurantOrders = async (req, res) => {
  try {
    const { status } = req.query;
    const query = { restaurant: req.params.restaurantId };

    if (status) {
      query.status = status;
    }

    const orders = await Order.find(query)
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

/**
 * Get orders by city
 * @route GET /api/orders/by-city/:city
 * @access Private
 */
// Update the getOrdersByCity function:

const getOrdersByCity = async (req, res) => {
  try {
    const { city } = req.params;

    // Validate city parameter
    if (!city) {
      return res.status(400).json({
        success: false,
        message: "City parameter is required",
      });
    }

    console.log("City parameter------1 --- :", city);

    // First, try to find the city by ID to get the city name
    const City = require("../models/cityModel");
    let cityName = city;
    
    try {
      const cityDoc = await City.findById(city);
      if (cityDoc) {
        cityName = cityDoc.name;
        console.log("Found city by ID, using name:", cityName);
      } else {
        // If not found by ID, assume the parameter is already a city name
        console.log("City not found by ID, using parameter as name:", city);
      }
    } catch (err) {
      // If city ID is invalid, assume it's a city name
      console.log("Invalid city ID, using parameter as name:", city);
    }

    // Find orders for the specified city
    const orders = await Order.find({
      city: cityName,
    })
      .populate("restaurant")
      .populate("user", "name email");

    console.log(`Found ${orders.length} orders for city: ${cityName}`);
    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    console.error("Error fetching orders by city:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching orders by city",
      error: error.message,
    });
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentStatus } = req.body;

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Only allow cancellation if order is not already paid
    if (paymentStatus === "cancelled" && order.paymentStatus === "paid") {
      return res.status(400).json({ message: "Cannot cancel a paid order" });
    }

    // Update the order status
    order.paymentStatus = paymentStatus;
    await order.save();

    res.status(200).json({ success: true, order });
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Update payment status
// @route   PUT /api/orders/:id/payment
// @access  Private/Admin
const updatePaymentStatus = async (req, res) => {
  try {
    const { paymentStatus } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.paymentStatus = paymentStatus;

    const updatedOrder = await order.save();

    res.json(updatedOrder);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Get all orders with filtering options
// @route   GET /api/orders
// @access  Private/Admin
// const getDeliveries = async (req, res) => {
//   try {
//     const { status, city, startDate, endDate, restaurant } = req.query;

//     // Build filter object
//     const filter = {};

//     // Add status filter if provided
//     if (status) {
//       filter.status = status;
//     }

//     // Add restaurant filter if provided
//     if (restaurant) {
//       filter.restaurant = restaurant;
//     }

//     // Add date range filter if provided
//     if (startDate || endDate) {
//       filter.createdAt = {};
//       if (startDate) {
//         filter.createdAt.$gte = new Date(startDate);
//       }
//       if (endDate) {
//         filter.createdAt.$lte = new Date(endDate);
//       }
//     }

//     // If city filter is provided, need to join with Restaurant model
//     let orders;
//     if (city) {
//       // First find restaurants in the specified city
//       const restaurantsInCity = await Restaurant.find({ city });
//       const restaurantIds = restaurantsInCity.map((r) => r._id);

//       // Add restaurant IDs to filter
//       filter.restaurant = { $in: restaurantIds };
//     }

//     // Execute query with populated fields
//     orders = await Order.find(filter)
//       .populate(
//         "restaurant",
//         "name address city imageUrl rating priceRange deliveryTime"
//       )
//       .populate("user", "name email")
//       .populate("customer", "name phone")
//       .sort({ createdAt: -1 });

//     res.json({
//       success: true,
//       count: orders.length,
//       data: orders,
//     });
//   } catch (error) {
//     console.error("Error fetching orders:", error);
//     res.status(500).json({
//       success: false,
//       message: "Server error while fetching orders",
//       error: error.message,
//     });
//   }
// };

const getDeliveries = async (req, res) => {
  try {
    const {
      status,
      city,
      startDate,
      endDate,
      restaurant,
      restaurantId,
      skipCustomerPopulate,
    } = req.query;

    // Build filter object
    const filter = {};

    // Add status filter if provided
    if (status) {
      filter.status = status;
    }

    // Add restaurant filter if provided (support both restaurant and restaurantId params)
    if (restaurantId) {
      filter.restaurant = restaurantId;
    } else if (restaurant) {
      filter.restaurant = restaurant;
    }

    // Add date range filter if provided
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) {
        filter.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        filter.createdAt.$lte = new Date(endDate);
      }
    }

    // If city filter is provided, need to join with Restaurant model
    if (city) {
      // First find restaurants in the specified city
      const restaurantsInCity = await Restaurant.find({ city });
      const restaurantIds = restaurantsInCity.map((r) => r._id);

      // Add restaurant IDs to filter
      filter.restaurant = { $in: restaurantIds };
    }

    console.log("Query filter:", filter);

    // Create a query builder
    let query = Order.find(filter)
      .populate(
        "restaurant",
        "name address city imageUrl rating priceRange deliveryTime"
      )
      .populate("user", "name email");

    // Only populate customer if not explicitly skipped
    if (skipCustomerPopulate !== "true") {
      try {
        query = query.populate("customer", "name phone");
      } catch (populateError) {
        console.warn(
          "Skipped populating customer due to error:",
          populateError.message
        );
      }
    }

    // Add sorting
    query = query.sort({ createdAt: -1 });

    // Execute the query
    const orders = await query;

    res.json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching orders",
      error: error.message,
    });
  }
};
module.exports = {
  createOrder,
  getOrderById,
  getMyOrders,
  getRestaurantOrders,
  updateOrderStatus,
  updatePaymentStatus,
  getOrdersByCity,
  getDeliveries,
};
