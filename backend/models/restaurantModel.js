const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const hourSchema = new Schema(
  {
    monday: { type: String, required: true },
    tuesday: { type: String, required: true },
    wednesday: { type: String, required: true },
    thursday: { type: String, required: true },
    friday: { type: String, required: true },
    saturday: { type: String, required: true },
    sunday: { type: String, required: true },
  },
  { _id: false }
);

const categorySchema = new Schema(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
  },
  { _id: false }
);

const restaurantSchema = new Schema(
  {
    name: { type: String, required: true, index: true },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      // Not required initially, as restaurants might be created by admin
    },
    category: { type: String, required: true, index: true },
    city: { type: String, required: true, index: true },
    address: { type: String, required: true },
    description: { type: String, required: true },
    rating: {
      type: Number,
      required: true,
      min: 0,
      max: 5,
      default: 0,
    },
    reviewCount: {
      type: Number,
      required: true,
      default: 0,
    },
    priceRange: {
      type: String,
      required: true,
      enum: ["$", "$$", "$$$", "$$$$"],
    },
    deliveryTime: { type: String, required: true },
    deliveryFee: { type: String, required: true },
    imageUrl: { type: String, required: true },
    headerImage: { type: String },
    coordinates: {
      type: [Number],
      required: true,
      index: "2dsphere", // Supports geospatial queries
    },
    logo: { type: String },
    hours: { type: hourSchema, required: true },
    menu: {
      categories: [categorySchema],
      // food items are referenced from Food model
    },
    // Reviews are referenced from Review model
  },
  {
    timestamps: true,
  }
);

// Virtual populate for food items
restaurantSchema.virtual("menuItems", {
  ref: "Food",
  localField: "_id",
  foreignField: "restaurant",
});

// Virtual populate for reviews
restaurantSchema.virtual("reviews", {
  ref: "Review",
  localField: "_id",
  foreignField: "restaurant",
});

// Index for search operations
restaurantSchema.index({ name: "text", description: "text", category: "text" });

// Method to calculate average rating
restaurantSchema.methods.updateRating = async function () {
  const Review = mongoose.model("Review");
  const result = await Review.aggregate([
    { $match: { restaurant: this._id } },
    {
      $group: { _id: null, avgRating: { $avg: "$rating" }, count: { $sum: 1 } },
    },
  ]);

  if (result.length > 0) {
    this.rating = parseFloat(result[0].avgRating.toFixed(1));
    this.reviewCount = result[0].count;
    await this.save();
  }

  return this.rating;
};

const Restaurant =
  mongoose.models.Restaurant || mongoose.model("Restaurant", restaurantSchema);

module.exports = Restaurant;
