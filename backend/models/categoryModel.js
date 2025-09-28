// models/Category.js
const mongoose = require("mongoose");

const CategorySchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  icon: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: "",
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  sortOrder: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Create a text index for search capability
CategorySchema.index({ name: "text" });

const Category =
  mongoose.models.Category || mongoose.model("Category", CategorySchema);

module.exports = Category;
