const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const foodSchema = new Schema(
  {
    name: { type: String, required: true, index: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    imageUrl: { type: String },
    category: { type: String, required: true, index: true },
    popular: { type: Boolean, default: false },

    // Reference to restaurant
    restaurant: {
      type: Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
    },

    // Available options for this food item
    availableOptions: [
      {
        type: Schema.Types.ObjectId,
        ref: "Option",
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Index for search operations
foodSchema.index({ name: "text", description: "text" });

const Food = mongoose.models.Food || mongoose.model("Food", foodSchema);

module.exports = Food;
