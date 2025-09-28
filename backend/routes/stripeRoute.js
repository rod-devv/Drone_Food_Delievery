const express = require("express");
const router = express.Router();
const stripeController = require("../controllers/stripeController");

// Create a Stripe checkout session
router.post("/create-checkout-session", stripeController.createCheckoutSession);

// Verify payment status
router.get("/verify-payment/:sessionId", stripeController.verifyPayment);

module.exports = router;
