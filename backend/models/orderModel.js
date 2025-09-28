const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const orderItemSchema = new Schema(
  {
    food: {
      type: Schema.Types.ObjectId,
      ref: "Food",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    price: {
      type: Number,
      required: true,
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    options: [
      {
        option: {
          type: Schema.Types.ObjectId,
          ref: "Option",
        },
        name: String,
        price: Number,
      },
    ],
  },
  { _id: false }
);

const orderSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    restaurant: {
      type: Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
    },
    items: [orderItemSchema],
    subtotal: {
      type: Number,
      required: true,
    },
    deliveryFee: {
      type: Number,
      required: true,
    },
    total: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: [
        "preparing",
        "on-the-way",
        "delivered",
        "cancelled",
      ],
      default: "preparing",
    },
    paymentMethod: {
      type: String,
      required: true,
      enum: ["stripe", "cash", "credit-card"],
    },
    paymentStatus: {
      type: String,
      required: true,
      enum: ["pending", "completed", "failed", "refunded"],
      default: "pending",
    },
    deliveryAddress: {
      firstName: String,
      lastName: String,
      address: String,
      city: String,
      state: String,
      zipCode: String,
      phone: String,
      email: String,
      coordinates: {
        type: [Number],
        index: "2dsphere",
      },
    },
    estimatedDeliveryTime: {
      type: Number, // in minutes
    },
    city: {
      type: String,
    },

    /// added drone delivery fields
    droneDelivery: {
      startTime: Date, // When the drone starts the delivery
      restaurantCoordinates: {
        type: [Number], // [longitude, latitude]
        index: "2dsphere",
      },
      destinationCoordinates: {
        type: [Number], // [longitude, latitude]
        index: "2dsphere",
      },
      speed: {
        type: Number, // meters per second
        default: 10,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Index for finding orders by user and status
orderSchema.index({ user: 1, status: 1 });
orderSchema.index({ restaurant: 1, status: 1 });

const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);

module.exports = Order;
