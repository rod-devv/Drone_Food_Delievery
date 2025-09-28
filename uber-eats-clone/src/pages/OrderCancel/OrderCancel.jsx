import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../context/api";
import "./OrderCancel.css";

const OrderCancelPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const orderId = queryParams.get("orderId");

    if (orderId) {
      const fetchAndUpdateOrder = async () => {
        try {
          // Fetch the order details
          const response = await api.get(`/orders/${orderId}`);
          setOrder(response.data);

          // Update order status to cancelled if it's not already paid
          if (response.data.paymentStatus !== "paid") {
            await api.patch(`/orders/${orderId}`, {
              paymentStatus: "cancelled",
            });
          }
        } catch (error) {
          console.error("Error fetching or updating order:", error);
          toast.error("Could not retrieve order details");
        } finally {
          setLoading(false);
        }
      };

      fetchAndUpdateOrder();
    } else {
      setLoading(false);
    }
  }, [location]);

  const handleReturnToCart = () => {
    navigate("/cart");
  };

  const handleReturnHome = () => {
    navigate("/");
  };

  if (loading) {
    return <div className="loading">Loading order details...</div>;
  }

  return (
    <div className="order-cancel">
      <div className="cancel-icon">✕</div>
      <h1>Order Not Completed</h1>
      <p>Your order was not processed and you have not been charged.</p>

      {order && (
        <div className="order-details">
          <h2>Order #{order._id.substring(0, 8)}</h2>

          <div className="order-summary-box">
            <h3>Order Summary</h3>
            {order.items.map((item, index) => (
              <div key={index} className="order-item">
                <span>
                  {item.quantity}x {item.name}
                </span>
                <span>${item.totalPrice.toFixed(2)}</span>
              </div>
            ))}
            <div className="order-total">
              <span>Total</span>
              <span>${order.total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}

      <div className="cancel-actions">
        <button className="return-cart-button" onClick={handleReturnToCart}>
          Return to Cart
        </button>
        <button className="return-home-button" onClick={handleReturnHome}>
          Return to Home
        </button>
      </div>
    </div>
  );
};

export default OrderCancelPage;
