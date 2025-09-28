require("dotenv").config();

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

// For debugging, add this (temporarily):
console.log(
  "Stripe key provided----------:",
  process.env.STRIPE_SECRET_KEY ? "Yes (masked)" : "No"
);
const Order = require("../models/orderModel");

// @desc    Create a Stripe checkout session
// @route   POST /api/create-checkout-session
// @access  Private
const createCheckoutSession = async (req, res) => {
  try {
    const { orderId, items, customerEmail } = req.body;

    // Get the order from database
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Format line items for Stripe
    const lineItems = items.map((item) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: item.name,
        },
        unit_amount: Math.round(item.price * 100), // Stripe uses cents
      },
      quantity: item.quantity,
    }));

    // Add delivery fee as a line item if it exists and is a number
    if (order.deliveryFee && !isNaN(order.deliveryFee)) {
      lineItems.push({
        price_data: {
          currency: "usd",
          product_data: {
            name: "Delivery Fee",
          },
          unit_amount: Math.round(parseFloat(order.deliveryFee) * 100),
        },
        quantity: 1,
      });
    }

    // Create the checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      customer_email: customerEmail,
      mode: "payment",
      success_url: `${
        process.env.FRONTEND_URL || "http://localhost:3000"
      }/order-success?session_id={CHECKOUT_SESSION_ID}&orderId=${orderId}`,
      cancel_url: `${
        process.env.FRONTEND_URL || "http://localhost:3000"
      }/order-cancel?orderId=${orderId}`,
      metadata: {
        orderId: orderId.toString(),
      },
    });

    // Return the session ID and URL
    res.json({ id: session.id, url: session.url });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    res.status(500).json({
      message: "Failed to create checkout session",
      error: error.message,
    });
  }
};

// @desc    Verify a payment was successful
// @route   GET /api/verify-payment/:sessionId
// @access  Private
const verifyPayment = async (req, res) => {
  try {
    const { sessionId } = req.params;

    // Retrieve the session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === "paid") {
      // Get the order ID from the session metadata
      const orderId = session.metadata.orderId;

      // Update the order in your database
      await Order.findByIdAndUpdate(orderId, {
        paymentStatus: "paid",
        paymentDetails: {
          paymentId: session.payment_intent,
          paymentMethod: "stripe",
          paidAt: new Date(),
        },
      });

      return res.json({ success: true, paid: true });
    }

    return res.json({ success: true, paid: false });
  } catch (error) {
    console.error("Error verifying payment:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  createCheckoutSession,
  verifyPayment,
};
