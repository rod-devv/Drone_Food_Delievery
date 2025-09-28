import React from "react";
import { FaShoppingBag, FaTrash } from "react-icons/fa";
import "./Cart.css";
import { useNavigate } from "react-router-dom";
import { useApp } from "../../context/AppContext";

const Cart = ({ items, total, deliveryFee, restaurantName, onRemoveItem }) => {
  // Convert delivery fee string like "$2.99" to a number
  const deliveryFeeNumber = parseFloat(deliveryFee.replace("$", ""));
  const navigate = useNavigate();
  // Calculate the total with delivery fee
  const grandTotal = total + deliveryFeeNumber;

  // Count total items
  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);

  const { setCart } = useApp();
  const cartHandler = () => {
    setCart({ items, total, deliveryFee, restaurantName });

    navigate("/cart");
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

          <div className="cart-items">
            {items.map((item, index) => (
              <div key={index} className="cart-item">
                <div className="item-quantity">{item.quantity}×</div>
                <div className="item-details">
                  <div className="item-name">{item.name}</div>
                  {item.options && item.options.length > 0 && (
                    <div className="item-options">
                      {item.options.map((option, i) => (
                        <span key={i} className="item-option">
                          {option.name}{" "}
                          {option.price > 0 && `(+$${option.price.toFixed(2)})`}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="item-price">${item.totalPrice.toFixed(2)}</div>
                <button
                  className="remove-item"
                  onClick={() => onRemoveItem(index)}
                  aria-label="Remove item"
                >
                  <FaTrash />
                </button>
              </div>
            ))}
          </div>

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
            Proceed to Cart
          </button>
        </>
      )}
    </div>
  );
};

export default Cart;
