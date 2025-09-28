// models/City.js
const mongoose = require("mongoose");

const CitySchema = new mongoose.Schema({
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
  imageUrl: {
    type: String,
    required: true,
  },
  coordinates: {
    type: [Number], // [longitude, latitude]
    required: true,
    validate: {
      validator: function (v) {
        return v.length === 2;
      },
      message: "Coordinates must be an array of longitude and latitude",
    },
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Create a text index for search capability
CitySchema.index({ name: "text" });

const City = mongoose.models.City || mongoose.model("City", CitySchema);

module.exports = City;
