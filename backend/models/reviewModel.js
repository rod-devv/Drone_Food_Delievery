const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const reviewSchema = new Schema(
  {
    userName: { type: String, required: true },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    date: {
      type: Date,
      default: Date.now,
      required: true,
    },
    comment: { type: String, required: true },
    profileImage: { type: String },

    // Reference to restaurant
    restaurant: {
      type: Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
      index: true,
    },

    // Optional reference to user (if you have user authentication)
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

// Hook to update restaurant rating when a review is added/updated
reviewSchema.post("save", async function () {
  // Update the restaurant's average rating
  const Restaurant = mongoose.model("Restaurant");
  const restaurant = await Restaurant.findById(this.restaurant);
  if (restaurant) {
    await restaurant.updateRating();
  }
});

// Hook to update restaurant rating when a review is deleted
reviewSchema.post("remove", async function () {
  const Restaurant = mongoose.model("Restaurant");
  const restaurant = await Restaurant.findById(this.restaurant);
  if (restaurant) {
    await restaurant.updateRating();
  }
});

const Review = mongoose.models.Review || mongoose.model("Review", reviewSchema);

module.exports = Review;
