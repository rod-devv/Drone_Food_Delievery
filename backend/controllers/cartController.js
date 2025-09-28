import userModel from "../models/userModel.js";

// On your backend
export const sync = async (req, res) => {
  try {
    const { cartItems } = req.body;
    const userId = req.user.id;

    // Clear the existing cart
    await Cart.deleteMany({ userId });

    // Create new cart entries
    const cartEntries = [];
    for (const [itemId, quantity] of Object.entries(cartItems)) {
      if (quantity > 0) {
        cartEntries.push({
          userId,
          foodId: itemId,
          quantity,
        });
      }
    }

    if (cartEntries.length > 0) {
      await Cart.insertMany(cartEntries);
    }

    res.json({ success: true });
  } catch (error) {
    console.error("Error syncing cart:", error);
    res.status(500).json({ success: false, error: "Failed to sync cart" });
  }
};

// add to user cart
const addToCart = async (req, res) => {
  try {
    let userData = await userModel.findOne({ _id: req.body.userId });
    let cartData = await userData.cartData;
    if (!cartData[req.body.itemId]) {
      cartData[req.body.itemId] = 1;
    } else {
      cartData[req.body.itemId] += 1;
    }
    await userModel.findByIdAndUpdate(req.body.userId, { cartData });
    res.json({ success: true, message: "Added To Cart" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

// remove food from user cart
const removeFromCart = async (req, res) => {
  try {
    let userData = await userModel.findById(req.body.userId);
    let cartData = await userData.cartData;
    if (cartData[req.body.itemId] > 0) {
      cartData[req.body.itemId] -= 1;
    }
    await userModel.findByIdAndUpdate(req.body.userId, { cartData });
    res.json({ success: true, message: "Removed From Cart" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

// get user cart
const getCart = async (req, res) => {
  try {
    let userData = await userModel.findById(req.body.userId);
    let cartData = await userData.cartData;
    res.json({ success: true, cartData: cartData });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

export { addToCart, removeFromCart, getCart };
