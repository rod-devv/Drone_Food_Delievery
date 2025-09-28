import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useApp } from "../../context/AppContext";
import api from "../../context/api";
import "./OrderSuccess.css";

const OrderSuccessPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { setCart } = useApp();
  const [order, setOrder] = useState(null);
  const [foodItems, setFoodItems] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const orderId =
      queryParams.get("orderId") || location.pathname.split("/").pop();

    if (orderId) {
      const fetchOrder = async () => {
        try {
          const response = await api.get(`/orders/${orderId}`);
          const orderData = response.data;
          console.log("Order data:", orderData);
          setOrder(orderData);

          // Try to fetch food details, but don't block rendering if it fails
          try {
            const foodIds = orderData.items
              .map((item) => item.food)
              .filter((id) => id);

            if (foodIds.length > 0) {
              // Handle each food item fetch individually to prevent one failure from blocking all
              const foodDetailsMap = {};

              for (const id of foodIds) {
                try {
                  const foodResponse = await api.get(`/foods/${id}`);
                  if (foodResponse.data && foodResponse.data._id) {
                    foodDetailsMap[foodResponse.data._id] = foodResponse.data;
                  }
                } catch (foodError) {
                  console.warn(
                    `Could not fetch details for food ${id}:`,
                    foodError
                  );
                }
              }

              setFoodItems(foodDetailsMap);
            }
          } catch (foodsError) {
            console.error("Error fetching food details:", foodsError);
            // Continue without food details
          }
        } catch (error) {
          console.error("Error fetching order:", error);
        } finally {
          // Always exit loading state
          setLoading(false);
        }
      };

      fetchOrder();
    } else {
      setLoading(false);
      // If no orderId, we can show an error or redirect
    }
  }, [location, navigate, setCart]);

  if (loading) {
    return <div className="loading">Loading order details...</div>;
  }

  if (!order) {
    return (
      <div className="error-message">
        <h2>Order not found</h2>
        <p>We couldn't find your order. Please check your order ID.</p>
        <button onClick={() => navigate("/")}>Return to Home</button>
      </div>
    );
  }

  return (
    <div className="order-success">
      <div className="success-icon">✓</div>
      <h1>Thank You For Your Order!</h1>
      <p>Your payment was successful and your order is being prepared.</p>

      <div className="order-details">
        <h2>Order #{order._id.substring(0, 8)}</h2>
        <p>Estimated delivery time: {order.estimatedDeliveryTime} minutes</p>

        <div className="order-summary-box">
          <h3>Order Summary</h3>
          {order.items.map((item, index) => {
            const foodName = foodItems[item.food]?.name || `Item #${index + 1}`;

            return (
              <div key={index} className="order-item">
                <div className="item-details">
                  <span className="item-quantity">{item.quantity}x </span>
                  <span className="item-name">{foodName}</span>
                  {item.options && item.options.length > 0 && (
                    <div className="item-options">
                      {item.options.map((option, optIdx) => (
                        <span key={optIdx} className="item-option">
                          {option.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <span className="item-price">
                  ${item.totalPrice.toFixed(2)}
                </span>
              </div>
            );
          })}
          <div className="order-total">
            <span>Total</span>
            <span>${order.total.toFixed(2)}</span>
          </div>
        </div>

        <button onClick={() => navigate("/")}>Continue Shopping</button>
      </div>
    </div>
  );
};

export default OrderSuccessPage;
