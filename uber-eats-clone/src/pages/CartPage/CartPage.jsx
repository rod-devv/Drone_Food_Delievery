import React, { useEffect } from "react";
import { FaShoppingBag, FaTrash } from "react-icons/fa";
import "./CartPage.css";
import { useApp } from "../../context/AppContext";
import { useNavigate } from "react-router-dom";

const CartPage = () => {
  const { cart, setCart, selectedLocation } = useApp();

  const navigate = useNavigate();

  // Check if cart exists and has the expected properties
  // useEffect(() => {
  //   console.log("cartpage=====", cart);
  // }, [cart]);

  useEffect(() => {}, []);

  // Guard clause in case cart is undefined or empty
  if (!cart || !cart.items) {
    return (
      <div className="cart-container">
        <div className="cart-header">
          <FaShoppingBag />
          <h3>Your Order</h3>
        </div>
        <div className="empty-cart">
          <p>Your cart is empty</p>
          <p className="empty-cart-sub">
            Add items from the menu to get started
          </p>
        </div>
      </div>
    );
  }

  const { items, total, deliveryFee, restaurantName } = cart;

  // Convert delivery fee string like "$2.99" to a number for calculations
  const deliveryFeeNumber = parseFloat((deliveryFee || "$0").replace("$", ""));
  const grandTotal = (total || 0) + deliveryFeeNumber;

  // Total number of items in the cart
  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);

  // Function to remove an item from cart
  const onRemoveItem = (index) => {
    const newItems = [...items];
    newItems.splice(index, 1);

    // Update cart with new items and recalculate total
    const newTotal = newItems.reduce((sum, item) => sum + item.totalPrice, 0);

    setCart({
      ...cart,
      items: newItems,
      total: newTotal,
    });
  };

  const cartHandler = () => {
    // @@ add quatity increment and decrement latter
    // setCart({ items, total, deliveryFee, restaurantName });

    // if(token){
    //   console.log("navigate to order page");
    navigate("/order");
    // }else{
    //   console.log("navigate to login page");
    //   navigate("/login");
    // }
  };

  return (
    <div className="cart-container">
      <div className="cart-header">
        <FaShoppingBag />
        <h3>Your Order</h3>
        {itemCount > 0 && <span className="item-count">{itemCount}</span>}
      </div>

      {items.length === 0 ? (
        <div className="empty-cart">
          <p>Your cart is empty</p>
          <p className="empty-cart-sub">
            Add items from the menu to get started
          </p>
        </div>
      ) : (
        <>
          <div className="restaurant-name">
            <p>From: {restaurantName}</p>
          </div>

          {/* Cart Items Table */}
          <table className="cart-table">
            <thead>
              <tr>
                <th>Item</th>

                <th>Options</th>
                <th>Quantity</th>
                <th>Price</th>
                <th>Remove</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={index}>
                  <td>{item.name}</td>

                  <td>
                    {item.options && item.options.length > 0
                      ? item.options.map((option, i) => (
                          <div key={i} className="item-option">
                            {option.name}
                            {option.price > 0 &&
                              ` (+$${option.price.toFixed(2)})`}
                          </div>
                        ))
                      : "-"}
                  </td>
                  <td>{item.quantity}</td>
                  <td>${item.totalPrice.toFixed(2)}</td>
                  <td>
                    <button
                      className="remove-item"
                      onClick={() => onRemoveItem(index)}
                      aria-label="Remove item"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Price Summary */}
          <div className="cart-summary">
            <div className="summary-row">
              <span>Subtotal</span>
              <span>${total.toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Delivery Fee</span>
              <span>{deliveryFee}</span>
            </div>
            <div className="summary-row total">
              <span>Total</span>
              <span>${grandTotal.toFixed(2)}</span>
            </div>
          </div>

          <button className="cart-button" onClick={cartHandler}>
            Proceed to Checkout
          </button>
        </>
      )}
    </div>
  );
};

export default CartPage;
