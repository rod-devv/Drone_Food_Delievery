const express = require("express");
const cors = require("cors");
const connectDB = require("./utils/db");
const restaurantRoutes = require("./routes/restaurantRoute");
const foodRoutes = require("./routes/foodRoute");
const reviewRoutes = require("./routes/reviewRoute");
const optionRoutes = require("./routes/optionRoute");
const orderRoutes = require("./routes/orderRoute");
const userRoutes = require("./routes/userRoute"); // You'd need to create this
const cityRoutes = require("./routes/cityRoute");
const stripeRoutes = require("./routes/stripeRoute");
const categoryRoutes = require("./routes/categoryRoute");
require("dotenv").config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
// app.use(cors());
// app.use(express.json());
// app.use("/api/webhook", express.raw({ type: "application/json" }));

// Middleware
app.use(cors());

// Raw body parser for Stripe webhook must come BEFORE JSON parser
app.use("/api/webhook", express.raw({ type: "application/json" }));

// JSON parser for regular routes
app.use(express.json());

// Routes
app.use("/api/restaurants", restaurantRoutes);
app.use("/api/foods", foodRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/options", optionRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/users", userRoutes);
app.use("/api/cities", cityRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api", stripeRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
