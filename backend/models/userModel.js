const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, default: "" },
    password: { type: String, required: true },
    cartData: { type: Object, default: {} },
    ownedRestaurants: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Restaurant",
        },
      ],
      default: [], // Default to empty array for all users
    },
    role: {
      type: String,
      enum: ["user", "restaurateur", "admin"],
      default: "user",
    },
    restaurantId: {
      type: String,
      default: null,
    },
    // createdAt: {
    //   type: Date,
    //   default: Date.now,
    // },
  },
  { minimize: false }
);

// Custom validation for ownedRestaurants
userSchema.pre("save", function (next) {
  // If the user is a restaurateur and doesn't have any owned restaurants,
  // set it to an empty array (rather than null)
  if (this.role === "restaurateur" && !this.ownedRestaurants) {
    this.ownedRestaurants = [];
  }

  next();
});

// Create a virtual property to check if user is a restaurant owner
userSchema.virtual("isRestaurateur").get(function () {
  return this.role === "restaurateur";
});

// Method to add a restaurant to ownedRestaurants
userSchema.methods.addRestaurant = async function (restaurantId) {
  if (this.role !== "restaurateur") {
    throw new Error("Only restaurateurs can own restaurants");
  }

  // Check if the restaurant is already in the list
  if (!this.ownedRestaurants.includes(restaurantId)) {
    this.ownedRestaurants.push(restaurantId);
    await this.save();
  }

  return this.ownedRestaurants;
};

// Method to remove a restaurant from ownedRestaurants
userSchema.methods.removeRestaurant = async function (restaurantId) {
  if (this.role !== "restaurateur") {
    throw new Error("Only restaurateurs can manage restaurants");
  }

  this.ownedRestaurants = this.ownedRestaurants.filter(
    (id) => id.toString() !== restaurantId.toString()
  );

  await this.save();
  return this.ownedRestaurants;
};

// Method to check if a user owns a specific restaurant
userSchema.methods.ownsRestaurant = function (restaurantId) {
  return this.ownedRestaurants.some(
    (id) => id.toString() === restaurantId.toString()
  );
};

// Create model
const User = mongoose.models.User || mongoose.model("User", userSchema);

module.exports = User;
