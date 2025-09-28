import React, { useState, useEffect, use } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaStripe,
  FaCreditCard,
  FaClock,
  FaMapMarkerAlt,
} from "react-icons/fa";
import { useApp } from "../../context/AppContext";
import Map from "../../components/Map/Map";
import "./OrderPage.css";
import { restaurants } from "../../data/restaurants"; // to get restaurant coordinates
import { cities } from "../../data/cities"; // to get city coordinates
import { toast } from "react-toastify";
import api from "../../context/api"; // Assuming you have an api.js file for API calls

const OrderPage = () => {
  const navigate = useNavigate();
  const {
    cart,
    userAddress,
    restaurantId,
    selectedLocation,
    setSelectedLocation,
    token,
    getRestaurantById,
  } = useApp();

  // Delivery information form state
  const [deliveryInfo, setDeliveryInfo] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });

  // get the restaurant
  // const current_restaurant = restaurants.find((r) => r.id === restaurantId);

  const [current_restaurant, setCurrentRestaurant] = useState(null);
  const [timeMakingFood, setTimeMakingFood] = useState(10); // 10 min for food to be ready
  const [timeDeliveryDrone, setTimeDeliveryDrone] = useState(1); // 1 min per km
  const [restaurantLocation, setRestaurantLocation] = useState(null); // Initialize as null, not empty array
  const [deliveryFeeDrone, setDeliveryFeeDrone] = useState(0); // Initialize as 0
  const [grandTotal, setGrandTotal] = useState(0); // Initialize as 0
  // console.log("restaurantId==", restaurantId);
  // Validation state
  const [errors, setErrors] = useState({});

  const { items, total, deliveryFee, restaurantName } = cart;
  useEffect(() => {
    // console.log("restaurantId==", restaurantId);
    if (!token) {
      toast.error("to place an order login in first");
      // console.log("navigate to cart page");
      navigate("/cart");
    }

    //  else if (getTotalCartAmount() === 0) {
    //   navigate("/cart");
    // }
  }, [token]);

  // Split the restaurant fetch and coordinate setting into separate useEffects
  useEffect(() => {
    const getAndUpdateRestaurantById = async () => {
      try {
        const res = await getRestaurantById(restaurantId);
        // console.log("res==", res);

        if (res) {
          setCurrentRestaurant(res);

          // Set restaurant location right after we get the data
          let coordsLng, coordsLat;

          // Check various possible coordinate formats
          if (
            res.coordinates &&
            Array.isArray(res.coordinates) &&
            res.coordinates.length >= 2
          ) {
            // Format: [longitude, latitude]
            coordsLng = res.coordinates[0];
            coordsLat = res.coordinates[1];
          } else if (res.coordinates && typeof res.coordinates === "object") {
            // Format: {longitude, latitude}
            coordsLng = res.coordinates.longitude || res.coordinates.lng;
            coordsLat = res.coordinates.latitude || res.coordinates.lat;
          } else if (
            res.location &&
            res.location.coordinates &&
            Array.isArray(res.location.coordinates)
          ) {
            // MongoDB GeoJSON format: location.coordinates = [longitude, latitude]
            coordsLng = res.location.coordinates[0];
            coordsLat = res.location.coordinates[1];
          } else {
            // Default fallback coordinates (New York City)
            console.warn(
              "No valid coordinates found for restaurant, using defaults"
            );
            coordsLng = -73.9855;
            coordsLat = 40.758;
          }

          // Now that we have coordinates, set the restaurant location
          setRestaurantLocation({
            longitude: coordsLng,
            latitude: coordsLat,
          });
        }
      } catch (error) {
        console.error("Error fetching restaurant:", error);
      }
    };

    if (restaurantId) {
      getAndUpdateRestaurantById();
    }
  }, [getRestaurantById, restaurantId]);

  const [estimatedTime, setEstimatedTime] = useState(null);

  // Check if cart exists and redirect if not
  useEffect(() => {
    if (!cart || !cart.items || cart.items.length === 0) {
      navigate("/cart");
    }
    // Don't set restaurant location here, we already set it in the previous effect
  }, [cart, navigate]);

  // Set delivery location from userAddress context
  useEffect(() => {
    // This would normally use geocoding to convert the address to coordinates
    // For demo purposes, we'll set a location near the restaurant if we have restaurant coordinates
    if (restaurantLocation && !selectedLocation) {
      // Default: Set customer location 1km away from restaurant for demo
      const newLocation = {
        longitude: restaurantLocation.longitude + 0.01,
        latitude: restaurantLocation.latitude + 0.01,
      };

      setSelectedLocation(newLocation);

      // Calculate proper estimated time using the same logic we use elsewhere
      const distance = getDistance(newLocation);
      const droneTime = Math.round(timeDeliveryDrone * distance);
      setTimeDeliveryDrone(droneTime);
      const time = Math.round(timeMakingFood + timeDeliveryDrone * distance);
      setEstimatedTime(time);
      setDeliveryFeeDrone(distance * 0.5); // Example: $0.5 per km
    }
  }, [restaurantLocation, selectedLocation, setSelectedLocation]);

  useEffect(() => {
    // Calculate grand total whenever cart or delivery fee changes
    const newGrandTotal = (total || 0) + deliveryFeeDrone;
    setGrandTotal(newGrandTotal);
  }, [total, deliveryFeeDrone]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setDeliveryInfo({
      ...deliveryInfo,
      [name]: value,
    });

    // Clear the error for this field when user types
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null,
      });
    }
  };

  // Handle map click to update delivery location
  const handleMapClick = (coords) => {
    // console.log("Map clicked at^^^^^^^^^^^^^^^^:", coords);
    setSelectedLocation(coords);

    // Recalculate delivery time when location changes
    if (restaurantLocation) {
      // Calculate distance (simplified for demo)
      // const latDiff = Math.abs(coords.latitude - restaurantLocation.latitude);
      // const lngDiff = Math.abs(coords.longitude - restaurantLocation.longitude);
      // const distance = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff) * 111; // Rough km conversion

      const distance = getDistance(coords); // Use the new getDistance function
      // // Estimate time drone arival time:
      // //  10 min for food to be ready
      // //  + 1 min per km
      const droneTime = Math.round(timeDeliveryDrone * distance);
      setTimeDeliveryDrone(droneTime);
      const time = Math.round(timeMakingFood + timeDeliveryDrone * distance);

      setEstimatedTime(time);
      setDeliveryFeeDrone(distance * 0.5); // Example: $0.5 per km

      // console.log("=== time =-=== ", time);
    }
  };

  const getDistance = (coords) => {
    // Calculate distance (simplified for demo)

    const latDiff = Math.abs(coords.latitude - restaurantLocation.latitude);
    const lngDiff = Math.abs(coords.longitude - restaurantLocation.longitude);
    const distance = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff) * 111; // Rough km conversion
    return distance;
  };

  // Validate form before submission
  const validateForm = () => {
    const newErrors = {};

    if (!deliveryInfo.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }

    if (!deliveryInfo.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }

    if (!deliveryInfo.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(deliveryInfo.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!deliveryInfo.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\d{10,15}$/.test(deliveryInfo.phone.replace(/\D/g, ""))) {
      newErrors.phone = "Phone number is invalid";
    }

    if (!selectedLocation) {
      newErrors.location = "Delivery location is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle order placement
  // Inside the handlePlaceOrder function:
  const handlePlaceOrder = async () => {
    if (validateForm()) {
      try {
        // Calculate distance in meters for the drone delivery
        const latDiff = Math.abs(
          selectedLocation.latitude - restaurantLocation.latitude
        );
        const lngDiff = Math.abs(
          selectedLocation.longitude - restaurantLocation.longitude
        );
        const distanceInKm =
          Math.sqrt(latDiff * latDiff + lngDiff * lngDiff) * 111; // Rough km conversion
        const distanceInMeters = distanceInKm * 1000;

        // Calculate drone speed (average 10 m/s)
        const droneSpeed = 10; // meters per second

        // Calculate start and end times
        const currentTime = new Date();
        const startTime = new Date(
          currentTime.getTime() + timeMakingFood * 60000
        ); // Add food prep time
        const endTime = new Date(
          startTime.getTime() + (distanceInMeters / droneSpeed) * 1000
        ); // Add flight time

        // 1. Create an order in your backend
        const orderData = {
          restaurant: restaurantId,
          items: cart.items.map((item) => ({
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            totalPrice: item.totalPrice,
            food: item.id || item._id || null, // Add the food ID here
          })),
          subtotal: cart.total,
          deliveryFee: deliveryFeeDrone,
          total: grandTotal,
          city: current_restaurant.city,
          deliveryAddress: {
            firstName: deliveryInfo.firstName,
            lastName: deliveryInfo.lastName,
            address: userAddress || "Custom map location",
            city: current_restaurant.city,
            phone: deliveryInfo.phone,
            email: deliveryInfo.email,
            coordinates: [
              selectedLocation.longitude,
              selectedLocation.latitude,
            ],
          },
          paymentMethod: "stripe",
          estimatedDeliveryTime: estimatedTime,

          // Add drone delivery information
          droneDelivery: {
            startTime: startTime,
            endTime: endTime,
            restaurantCoordinates: [
              restaurantLocation.longitude,
              restaurantLocation.latitude,
            ],
            destinationCoordinates: [
              selectedLocation.longitude,
              selectedLocation.latitude,
            ],
            distance: distanceInMeters,
            speed: droneSpeed,
          },
        };

        // console.log("Order data:--->", orderData);
        // Make API call to create order
        const response = await api.post("/orders", orderData);
        const order = response.data;
        // console.log("Order created--->:", order);

        // 2. Create a checkout session
        const checkoutResponse = await api.post("/create-checkout-session", {
          orderId: order._id,
          items: cart.items,
          customerEmail: deliveryInfo.email,
        });
        // console.log("Checkout session:====>", checkoutResponse.data);

        // 3. Redirect to Stripe checkout
        window.location.href = checkoutResponse.data.url;
      } catch (error) {
        console.error("Error creating order:", error);
        toast.error(
          "There was a problem processing your order. Please try again."
        );
      }
    } else {
      // Scroll to the first error
      const firstError = document.querySelector(".error-message");
      if (firstError) {
        firstError.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  };

  if (!cart || !cart.items || !restaurantLocation) {
    return <div className="loading">Loading order details...</div>;
  }

  // Convert delivery fee string like "$2.99" to a number for calculations
  // const deliveryFeeNumber = parseFloat((deliveryFee || "$0").replace("$", ""));
  // const grandTotal = (total || 0) + deliveryFeeNumber;

  // Prepare markers for the map
  const mapMarkers = [
    // Restaurant marker
    {
      longitude: restaurantLocation.longitude,
      latitude: restaurantLocation.latitude,
      type: "restaurant",
      color: "#2196F3",
      size: 35,
      data: {
        name: restaurantName || current_restaurant?.name || "Restaurant",
      },
    },
    // Delivery location marker
    ...(selectedLocation
      ? [
          {
            longitude: selectedLocation.longitude,
            latitude: selectedLocation.latitude,
            type: "delivery",
            color: "#FF5722",
            size: 40,
          },
        ]
      : []),
  ];

  // Prepare route line between restaurant and delivery location
  const routeLine = selectedLocation
    ? {
        type: "line",
        coordinates: [
          [restaurantLocation.longitude, restaurantLocation.latitude],
          [selectedLocation.longitude, selectedLocation.latitude],
        ],
        color: "#4CAF50",
        width: 3,
      }
    : null;

  return (
    <div className="order-page">
      <h1>Complete Your Order</h1>

      <div className="order-section">
        <h2>Delivery Information</h2>
        <div className="delivery-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="firstName">First Name</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={deliveryInfo.firstName}
                onChange={handleInputChange}
                className={errors.firstName ? "error" : ""}
              />
              {errors.firstName && (
                <div className="error-message">{errors.firstName}</div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="lastName">Last Name</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={deliveryInfo.lastName}
                onChange={handleInputChange}
                className={errors.lastName ? "error" : ""}
              />
              {errors.lastName && (
                <div className="error-message">{errors.lastName}</div>
              )}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={deliveryInfo.email}
                onChange={handleInputChange}
                className={errors.email ? "error" : ""}
              />
              {errors.email && (
                <div className="error-message">{errors.email}</div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="phone">Phone</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={deliveryInfo.phone}
                onChange={handleInputChange}
                className={errors.phone ? "error" : ""}
              />
              {errors.phone && (
                <div className="error-message">{errors.phone}</div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="order-section">
        <h2>Delivery Location</h2>
        <p className="map-instructions">
          Click anywhere on the map to update your delivery location
        </p>

        <div className="delivery-map">
          <Map
            initialViewport={{
              latitude: restaurantLocation.latitude,
              longitude: restaurantLocation.longitude,
              zoom: 13,
            }}
            markers={mapMarkers}
            routeLine={routeLine}
            onMapClick={handleMapClick}
            onMarkerClick={(marker) => {
              // console.log("Marker clicked:", marker);
            }}
          />

          {errors.location && (
            <div className="error-message">{errors.location}</div>
          )}

          <div className="delivery-address">
            <FaMapMarkerAlt />
            <p>
              {userAddress || "Click on the map to set your delivery address"}
            </p>
          </div>
        </div>
      </div>

      <div className="order-section">
        <h2>Delivery Time Estimation from restaurant to your location:</h2>
        <div className="estimation-box">
          <FaClock className="clock-icon" />
          <div className="estimation-details">
            <p
              className="estimation-note"
              style={{ fontSize: 30, fontWeight: "bold", lineHeight: "1.6" }}
            >
              🍳{" "}
              <span
                style={{
                  color: "black",
                  backgroundColor: "gold",
                  borderRadius: 10,
                  padding: "5px 10px",
                  display: "inline-block",
                  marginBottom: 8,
                }}
              >
                {timeMakingFood} minutes for food preparation
              </span>
              <br />
              🚁{" "}
              <span
                style={{
                  color: "white",
                  backgroundColor: "orange",
                  borderRadius: 10,
                  padding: "5px 10px",
                  display: "inline-block",
                  marginBottom: 8,
                }}
              >
                {timeDeliveryDrone} minutes for Drone delivery
              </span>
              <br />
              📦
              <span
                style={{
                  color: "darkgreen",
                  backgroundColor: "lightgreen",
                  borderRadius: 10,
                  padding: "5px 10px",
                  display: "inline-block",
                }}
              >
                {estimatedTime} minutes to deliver
              </span>
            </p>
          </div>
        </div>
      </div>

      <div className="order-section">
        <h2>Order Summary</h2>
        <div className="order-summary">
          <div className="restaurant-info">
            <h3>Order from: {restaurantName}</h3>
            <p>{items.length} item(s)</p>
          </div>

          <div className="summary-items">
            {items.map((item, index) => (
              <div key={index} className="summary-item">
                <div className="item-details">
                  <span className="item-quantity">{item.quantity}×</span>
                  <span className="item-name">{item.name}</span>
                </div>
                <span className="item-price">
                  ${item.totalPrice.toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          <div className="price-summary">
            <div className="summary-row">
              <span>Subtotal</span>
              <span>${total.toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Delivery Fee</span>
              <span>{deliveryFeeDrone.toFixed(2)}</span>
            </div>
            <div className="summary-row total">
              <span>Total</span>
              <span>${grandTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="order-section">
        <h2>Payment Method</h2>
        <div className="payment-methods">
          <div className="payment-method selected">
            <input
              type="radio"
              id="stripe"
              name="paymentMethod"
              value="stripe"
              checked
              readOnly
            />
            <label htmlFor="stripe">
              <FaStripe className="payment-icon stripe" />
              <span>Pay with Stripe</span>
            </label>
          </div>

          <div className="payment-method disabled">
            <input
              type="radio"
              id="creditCard"
              name="paymentMethod"
              value="creditCard"
              disabled
            />
            <label htmlFor="creditCard" className="disabled">
              <FaCreditCard className="payment-icon" />
              <span>Credit Card (Coming Soon)</span>
            </label>
          </div>
        </div>
      </div>

      <div className="order-actions">
        {/* <button className="back-button" onClick={() => navigate("/cart")}>
          Back to Cart
        </button> */}
        <button className="place-order-button" onClick={handlePlaceOrder}>
          Place Order
        </button>
      </div>
    </div>
  );
};

export default OrderPage;
