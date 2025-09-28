import React, { useState, useEffect } from "react";
import DeliveryMap from "./DeliveryMap";
import deliveryService from "../../services/deliveryService";
import restaurantService from "../../services/restaurantService";
import cityService from "../../services/cityService";
import userService from "../../services/userService"; // Import userService
import "./DeliveryManagement.css";

const DeliveryManagement = () => {
  // Get current user role
  const userRole = userService.getUserRole();
  const isRestaurateur = userRole === "restaurateur";

  const [cities, setCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState("");
  const [centerPosition, setCenterPosition] = useState([-74.006, 40.7128]); // Default to NYC coordinates

  const [restaurants, setRestaurants] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [filters, setFilters] = useState({
    showRestaurants: true,
    showPastDeliveries: false,
    showCurrentDeliveries: true,
    restaurantId: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // For restaurateur's restaurant ID
  const [restaurateurRestaurantId, setRestaurateurRestaurantId] =
    useState(null);

  // Helper function to determine actual delivery status based on drone position
  const getActualDeliveryStatus = (delivery) => {
    // If not on-the-way or doesn't have drone delivery, return original status
    if (delivery.status !== "on-the-way" || !delivery.droneDelivery || !delivery.droneDelivery.startTime) {
      return delivery.status;
    }

    const now = new Date();
    const startTime = new Date(delivery.droneDelivery.startTime);

    // If drone hasn't started yet, return original status
    if (now < startTime) {
      return delivery.status;
    }

    // Calculate distance and delivery duration
    const [startLng, startLat] = delivery.droneDelivery.restaurantCoordinates;
    const [endLng, endLat] = delivery.droneDelivery.destinationCoordinates;
    
    // Calculate total distance using Haversine formula
    const calculateDistance = (coord1, coord2) => {
      const [lng1, lat1] = coord1;
      const [lng2, lat2] = coord2;
      const toRad = (deg) => (deg * Math.PI) / 180;
      const lat1Rad = toRad(lat1);
      const lat2Rad = toRad(lat2);
      const deltaLat = toRad(lat2 - lat1);
      const deltaLng = toRad(lng2 - lng1);
      const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
        Math.cos(lat1Rad) * Math.cos(lat2Rad) * Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const R = 6371000; // Earth's radius in meters
      return R * c;
    };

    const totalDistance = calculateDistance(
      delivery.droneDelivery.restaurantCoordinates,
      delivery.droneDelivery.destinationCoordinates
    );

    // Calculate duration in milliseconds
    const speed = delivery.droneDelivery.speed || 10; // meters per second
    const durationMs = (totalDistance / speed) * 1000;
    const endTime = new Date(startTime.getTime() + durationMs);

    // If current time is past the delivery end time, show as delivered
    if (now >= endTime) {
      return "delivered";
    }

    // Otherwise, return the original status
    return delivery.status;
  };

  useEffect(() => {
    // For restaurateurs, get their restaurant ID first
    const loadRestaurateurData = async () => {
      if (isRestaurateur) {
        try {
          console.log("Loading restaurateur restaurant data");

          // Get all restaurants owned by this restaurateur
          const restaurantsResponse =
            await restaurantService.getUserRestaurants();

          console.log("restaurantsResponse@@@@@@@@=", restaurantsResponse);
          // Use restaurantsResponse directly as it's already the array
          const userRestaurants = restaurantsResponse || [];

          console.log("Restaurateur restaurants:", userRestaurants);

          // If there are no restaurants, show a message
          if (!userRestaurants || userRestaurants.length === 0) {
            setError(
              "You don't have any restaurants to manage. Please add a restaurant first."
            );
            return;
          }

          // Use the first restaurant as default
          const userRestaurant = userRestaurants[0];

          if (userRestaurant && userRestaurant._id) {
            // Only set the restaurant ID, but don't restrict the view
            setRestaurateurRestaurantId(userRestaurant._id);

            // If restaurant has location, center map on it
            if (
              userRestaurant.location &&
              userRestaurant.location.coordinates
            ) {
              setCenterPosition(userRestaurant.location.coordinates);
            }

            // Select the city of this restaurant (will be set after cities are loaded)
            if (userRestaurant.cityId) {
              // Store the city ID to set after cities are loaded
              setSelectedCity(userRestaurant.cityId);
            } else if (userRestaurant.city) {
              // If cityId is not available, try to match by city name
              console.log("Restaurant city name:", userRestaurant.city);
            }
          }
        } catch (err) {
          console.error("Error loading restaurateur data:", err);
          setError(
            "Failed to load your restaurant data. Please try again later."
          );
        }
      }
    };

    loadRestaurateurData();

    // Load cities from the database
    const loadCities = async () => {
      try {
        setLoading(true);
        const data = await cityService.getCities();

        if (data && Array.isArray(data)) {
          // Use cities directly from MongoDB
          const formattedCities = data.map((city) => ({
            _id: city.id || city._id,
            name: city.name,
            coordinates: city.coordinates,
          }));

          setCities(formattedCities);

          if (formattedCities.length > 0 && !isRestaurateur) {
            // Only set default city for admins, restaurateurs will use their restaurant's city
            const firstCity = formattedCities[0];
            setSelectedCity(firstCity._id);

            // Set initial center position if coordinates exist
            if (firstCity.coordinates) {
              setCenterPosition(firstCity.coordinates);
            }
          }
        } else {
          setCities([
            {
              _id: "default-city",
              name: "Default City",
              coordinates: [-95.7129, 37.0902], // USA center as fallback
            },
          ]);
          if (!isRestaurateur) {
            setSelectedCity("default-city");
            setCenterPosition([-95.7129, 37.0902]);
          }
          console.error("Invalid cities data received:", data);
        }
      } catch (err) {
        setError("Failed to load cities");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadCities();
  }, [isRestaurateur]);

  // Ensure proper city selection for restaurateurs after cities are loaded
  useEffect(() => {
    const setRestaurateurCity = async () => {
      if (isRestaurateur && cities.length > 0 && !selectedCity) {
        try {
          // Get the restaurant data directly
          const restaurantsResponse = await restaurantService.getUserRestaurants();
          const userRestaurants = restaurantsResponse || [];
          
          if (userRestaurants.length > 0) {
            const userRestaurant = userRestaurants[0];
            console.log("Setting city from restaurant:", userRestaurant);
            
            // Try to match by cityId first
            if (userRestaurant.cityId) {
              const matchingCity = cities.find(city => city._id === userRestaurant.cityId);
              if (matchingCity) {
                console.log("Matching city found by ID:", matchingCity);
                setSelectedCity(matchingCity._id);
                if (matchingCity.coordinates) {
                  setCenterPosition(matchingCity.coordinates);
                }
                return;
              }
            }
            
            // If no cityId match, try to match by city name
            if (userRestaurant.city) {
              const matchingCity = cities.find(city => 
                city.name.toLowerCase() === userRestaurant.city.toLowerCase()
              );
              if (matchingCity) {
                console.log("Matching city found by name:", matchingCity);
                setSelectedCity(matchingCity._id);
                if (matchingCity.coordinates) {
                  setCenterPosition(matchingCity.coordinates);
                }
              } else {
                console.log("No matching city found for:", userRestaurant.city);
              }
            }
          }
        } catch (error) {
          console.error("Error setting restaurateur city:", error);
        }
      }
    };
    
    setRestaurateurCity();
  }, [isRestaurateur, cities, selectedCity]);

  // Update center position when selected city changes
  useEffect(() => {
    if (selectedCity) {
      updateCenterPosition();
    }
  }, [selectedCity]);

  // Function to update center position based on selected city
  const updateCenterPosition = async () => {
    try {
      const selectedCityInfo = await getSelectedCityInfo();
      if (selectedCityInfo && selectedCityInfo.coordinates) {
        setCenterPosition(selectedCityInfo.coordinates);
      }
    } catch (err) {
      console.error("Error updating center position:", err);
    }
  };

  useEffect(() => {
    if (selectedCity) {
      const loadData = async () => {
        try {
          setLoading(true);

          try {
            let restaurantsData;

            if (isRestaurateur) {
              // For restaurateurs, load all their restaurants using getUserRestaurants
              console.log("Fetching restaurateur's restaurants");
              const response = await restaurantService.getUserRestaurants();

              // Use response directly - no need for .data
              restaurantsData = response || [];

              console.log(
                `Loaded ${restaurantsData.length} restaurateur restaurants`
              );
            } else {
              // For admins, load all restaurants in the city
              console.log("Fetching all restaurants for city:", selectedCity);
              restaurantsData = await restaurantService.getRestaurantsByCity(
                selectedCity
              );
            }

            console.log(
              `restaurants --------------------------------------`,
              restaurantsData
            );
            setRestaurants(restaurantsData);

            // Get deliveries - use same approach for both roles
            let deliveriesData;

            // Both roles will see all deliveries for the city
            console.log("Fetching all deliveries for city:", selectedCity);
            deliveriesData = await deliveryService.getDeliveriesByCity(
              selectedCity,
              { skipCustomerPopulate: true }
            );

            console.log("===== Deliveries for city ======", deliveriesData);

            const deliveriesArray = deliveriesData.data || [];
            console.log(`Loaded ${deliveriesArray.length} deliveries`);
            setDeliveries(deliveriesArray);
          } catch (err) {
            console.error("Error loading data:", err);
            setError("Failed to load data. Please try again later.");
            setRestaurants([]);
            setDeliveries([]);
          }
        } catch (err) {
          setError("Failed to load data");
          console.error(err);
        } finally {
          setLoading(false);
        }
      };

      loadData();
    }
  }, [selectedCity, isRestaurateur]);

  // Periodic data refresh to keep UI synchronized
  useEffect(() => {
    if (!selectedCity) return;

    const refreshData = async () => {
      try {
        console.log("🔄 Refreshing delivery data...");
        const deliveriesData = await deliveryService.getDeliveriesByCity(
          selectedCity,
          { skipCustomerPopulate: true }
        );
        
        const deliveriesArray = deliveriesData.data || [];
        setDeliveries(deliveriesArray);
        console.log(`🔄 Refreshed ${deliveriesArray.length} deliveries`);
      } catch (err) {
        console.warn("Failed to refresh data:", err);
      }
    };

    // Refresh every 60 seconds if there are active orders
    const hasActiveOrders = deliveries.some(d => 
      ['preparing', 'on-the-way'].includes(d.status)
    );

    if (hasActiveOrders) {
      const refreshInterval = setInterval(refreshData, 60000); // 60 seconds
      return () => clearInterval(refreshInterval);
    }
  }, [selectedCity, deliveries]);

  const getSelectedCityInfo = () => {
    const city = cities.find((c) => c._id === selectedCity);
    if (city) {
      return city;
    }
    return null;
  };

  // Add to DeliveryManagement.jsx
  // Add this function after the getSelectedCityInfo function

  // Calculate drone distance between coordinates
  const calculateDroneDistance = (droneDelivery) => {
    if (
      !droneDelivery ||
      !droneDelivery.restaurantCoordinates ||
      !droneDelivery.destinationCoordinates
    )
      return 0;

    const [lng1, lat1] = droneDelivery.restaurantCoordinates;
    const [lng2, lat2] = droneDelivery.destinationCoordinates;

    // Convert to radians
    const toRad = (deg) => (deg * Math.PI) / 180;
    const lat1Rad = toRad(lat1);
    const lat2Rad = toRad(lat2);
    const deltaLat = toRad(lat2 - lat1);
    const deltaLng = toRad(lng2 - lng1);

    // Haversine formula
    const a =
      Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
      Math.cos(lat1Rad) *
        Math.cos(lat2Rad) *
        Math.sin(deltaLng / 2) *
        Math.sin(deltaLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = 6371000 * c; // Earth's radius in meters

    return Math.round(distance);
  };

  // Calculate end time for drone delivery
  const calculateDroneEndTime = (droneDelivery) => {
    if (!droneDelivery || !droneDelivery.startTime) return null;

    const distance = calculateDroneDistance(droneDelivery);
    const speed = droneDelivery.speed || 10; // Default 10 m/s
    const durationMs = (distance / speed) * 1000; // Convert to milliseconds

    const startTime = new Date(droneDelivery.startTime);
    return new Date(startTime.getTime() + durationMs);
  };

  // Handle city change - for both roles
  const handleCityChange = (e) => {
    setSelectedCity(e.target.value);
    setSelectedDelivery(null);
    setSelectedRestaurant(null);
  };

  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;

    // When changing restaurant filter - available for both roles
    if (name === "restaurantId" && value !== "") {
      // Find the selected restaurant
      const selectedRestaurant = restaurants.find((r) => r._id === value);
      if (selectedRestaurant && selectedRestaurant.location) {
        console.log("Filter changed to restaurant:", selectedRestaurant.name);

        // Set as selected restaurant
        setSelectedRestaurant(selectedRestaurant);

        // Get coordinates
        let coords;
        if (
          selectedRestaurant.location.coordinates &&
          Array.isArray(selectedRestaurant.location.coordinates)
        ) {
          coords = selectedRestaurant.location.coordinates;
        } else if (
          selectedRestaurant.location.longitude !== undefined &&
          selectedRestaurant.location.latitude !== undefined
        ) {
          coords = [
            selectedRestaurant.location.longitude,
            selectedRestaurant.location.latitude,
          ];
        }

        // Update map center if we have coordinates
        if (coords) {
          console.log("Updating center position to restaurant:", coords);
          setCenterPosition(coords);
        }
      }
    } else if (name === "restaurantId" && value === "") {
      // When returning to "All Restaurants"
      setSelectedRestaurant(null);

      // Return to city view if a city is selected
      updateCenterPosition();
    }

    // Update filters
    setFilters((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSelectDelivery = (delivery) => {
    // Toggle functionality: if clicking the same delivery, close it
    if (selectedDelivery && selectedDelivery._id === delivery._id) {
      setSelectedDelivery(null);
    } else {
      setSelectedDelivery(delivery);

      // Center map on the delivery address if coordinates exist
      if (
        delivery.deliveryAddress?.coordinates &&
        Array.isArray(delivery.deliveryAddress.coordinates) &&
        delivery.deliveryAddress.coordinates.length === 2
      ) {
        // Update map center position to delivery coordinates
        setCenterPosition(delivery.deliveryAddress.coordinates);

        console.log(
          "Centering map on delivery:",
          delivery.deliveryAddress.coordinates
        );
      } else {
        // If delivery doesn't have coordinates but has a restaurant with coordinates, center on restaurant
        if (
          delivery.restaurant?.location?.coordinates &&
          Array.isArray(delivery.restaurant.location.coordinates)
        ) {
          setCenterPosition(delivery.restaurant.location.coordinates);
          console.log(
            "Centering map on restaurant:",
            delivery.restaurant.location.coordinates
          );
        }
      }

      // Both admin and restaurateur can clear selected restaurant
      setSelectedRestaurant(null);
    }
  };

  const handleSelectRestaurant = (restaurant) => {
    setSelectedRestaurant(restaurant);
    setSelectedDelivery(null);
  };

  // Filter restaurants based on filters - same logic for both roles
  const filteredRestaurants = filters.showRestaurants ? restaurants : [];

  // Filter deliveries based on status and restaurant filters - different logic for roles
  const filteredDeliveries = deliveries.filter((delivery) => {
    // Define delivery types based on their status
    const isPendingDelivery = [
      "preparing",
      "on-the-way",
    ].includes(delivery.status);
    const isCompletedDelivery = delivery.status === "delivered";

    // Check if it should be shown based on status filter
    const showBasedOnStatus =
      (isPendingDelivery && filters.showCurrentDeliveries) ||
      (isCompletedDelivery && filters.showPastDeliveries);

    // Check if it should be shown based on restaurant filter
    let showBasedOnRestaurant = true;
    
    if (isRestaurateur) {
      // For restaurateurs, always filter to only their restaurants
      const userData = localStorage.getItem('user');
      let currentUserId = null;
      if (userData) {
        try {
          const user = JSON.parse(userData);
          currentUserId = user._id || user.id;
        } catch (e) {
          console.error('Error parsing user data:', e);
        }
      }
      
      // Check if delivery belongs to user's restaurant
      const belongsToUser = delivery.restaurant && (
        delivery.restaurant.owner === currentUserId ||
        delivery.restaurant.owner?._id === currentUserId ||
        (typeof delivery.restaurant.owner === 'string' && delivery.restaurant.owner === currentUserId)
      );
      
      if (filters.restaurantId) {
        // Specific restaurant selected - show only that restaurant AND it must belong to user
        showBasedOnRestaurant = belongsToUser && delivery.restaurant._id === filters.restaurantId;
      } else {
        // "All My Restaurants" selected - show only user's restaurants
        showBasedOnRestaurant = belongsToUser;
      }
    } else {
      // For admins, use original logic
      showBasedOnRestaurant = !filters.restaurantId ||
        (delivery.restaurant && delivery.restaurant._id === filters.restaurantId);
    }

    const result = showBasedOnStatus && showBasedOnRestaurant;
    

    
    return result;
  });

  // Quick summary for restaurateurs
  if (isRestaurateur) {
    const dronesFiltered = filteredDeliveries.filter(d => d.droneDelivery);
    console.log(`🚁 Showing ${dronesFiltered.length} drones from ${filteredDeliveries.length} deliveries`);
  }

  if (loading && !cities.length) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="delivery-management">
      <div className="filters">
        {/* City selector - for both roles */}
        <div className="filter-item">
          <label className="filter-label">Select City:</label>
          <select
            className="filter-input"
            value={selectedCity}
            onChange={handleCityChange}
          >
            {cities.map((city, index) => (
              <option key={city._id || `city-${index}`} value={city._id}>
                {city.name}
              </option>
            ))}
          </select>
        </div>

        {/* Show restaurants checkbox - for both roles */}
        <div className="filter-item">
          <label className="filter-label">
            <input
              type="checkbox"
              name="showRestaurants"
              checked={filters.showRestaurants}
              onChange={handleFilterChange}
            />
            Show Restaurants
          </label>
        </div>

        {/* These filters are shown to both roles */}
        <div className="filter-item">
          <label className="filter-label">
            <input
              type="checkbox"
              name="showCurrentDeliveries"
              checked={filters.showCurrentDeliveries}
              onChange={handleFilterChange}
            />
            Show Current Deliveries
          </label>
        </div>

        <div className="filter-item">
          <label className="filter-label">
            <input
              type="checkbox"
              name="showPastDeliveries"
              checked={filters.showPastDeliveries}
              onChange={handleFilterChange}
            />
            Show Past Deliveries
          </label>
        </div>

        {/* Restaurant filter dropdown - for both roles */}
        <div className="filter-item">
          <label className="filter-label">Filter by Restaurant:</label>
          <select
            className="filter-input"
            name="restaurantId"
            value={filters.restaurantId}
            onChange={handleFilterChange}
          >
            <option key="all-restaurants" value="">
              {isRestaurateur ? "All My Restaurants" : "All Restaurants"}
            </option>
            {(isRestaurateur 
              ? restaurants.filter(restaurant => {
                  // Get current user ID from localStorage
                  const userData = localStorage.getItem('user');
                  let currentUserId = null;
                  if (userData) {
                    try {
                      const user = JSON.parse(userData);
                      currentUserId = user._id || user.id;
                    } catch (e) {
                      console.error('Error parsing user data:', e);
                    }
                  }
                  
                  // Check if restaurant belongs to current user
                  return restaurant.owner === currentUserId || 
                         restaurant.owner?._id === currentUserId ||
                         (typeof restaurant.owner === 'string' && restaurant.owner === currentUserId);
                })
              : restaurants
            ).map((restaurant) => (
              <option key={restaurant._id} value={restaurant._id}>
                {restaurant.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="map-container">
        <DeliveryMap
          centerPosition={centerPosition}
          restaurants={filteredRestaurants}
          deliveries={filteredDeliveries}
          selectedDelivery={selectedDelivery}
          selectedRestaurant={selectedRestaurant}
          onSelectDelivery={handleSelectDelivery}
          onSelectRestaurant={handleSelectRestaurant}
          isRestaurateurView={isRestaurateur}
          filters={filters}
        />
      </div>

      {selectedDelivery && (
        <div className="detail-panel">
          <h3>Delivery Details</h3>
          <p>Order ID: {selectedDelivery._id}</p>
          <p>
            Status:{" "}
            <span className={`status-badge ${getActualDeliveryStatus(selectedDelivery)}`}>
              {getActualDeliveryStatus(selectedDelivery)}
            </span>
          </p>
          <p>
            Restaurant:{" "}
            {selectedDelivery.restaurant?.name || "Unknown Restaurant"}
          </p>
          <p>
            Customer:{" "}
            {`${selectedDelivery.deliveryAddress?.firstName || ""} ${
              selectedDelivery.deliveryAddress?.lastName || ""
            }`}
          </p>
          <p>
            Delivery Address:{" "}
            {selectedDelivery.deliveryAddress?.address || "N/A"}
          </p>
          <p>
            Estimated Delivery Time:{" "}
            {selectedDelivery.estimatedDeliveryTime
              ? `${selectedDelivery.estimatedDeliveryTime} minutes`
              : "N/A"}
          </p>
          <p>Total: ${selectedDelivery.total?.toFixed(2) || "0.00"}</p>

          {/* Order Items Section */}
          <div className="order-items">
            <h4>Order Items:</h4>
            <ul>
              {selectedDelivery.items &&
                selectedDelivery.items.map((item, index) => (
                  <li key={index}>
                    {item.quantity}x {item.food?.name || "Item"} - $
                    {item.totalPrice?.toFixed(2) || "0.00"}
                    {item.options && item.options.length > 0 && (
                      <ul className="item-options">
                        {item.options.map((option, optIndex) => (
                          <li key={optIndex}>
                            {option.name} (+$
                            {option.price?.toFixed(2) || "0.00"})
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
            </ul>
          </div>

          {/* Add restaurant-specific actions for restaurateurs */}
          {/* {isRestaurateur && (
            <div className="delivery-actions">
              <button className="action-btn">Update Status</button>
              <button className="action-btn">Contact Customer</button>
            </div>
          )} */}
        </div>
      )}

      {/* Drone Delivery Information */}
      {selectedDelivery && selectedDelivery.droneDelivery && (
        <div className="detail-panel">
          <h4>Drone Delivery</h4>
          <p>
            Start Time:{" "}
            {new Date(
              selectedDelivery.droneDelivery.startTime
            ).toLocaleTimeString()}
          </p>
          <p>Speed: {selectedDelivery.droneDelivery.speed || 10} m/s</p>
          <p>
            Distance: {calculateDroneDistance(selectedDelivery.droneDelivery)}{" "}
            meters
          </p>
          <p>
            Estimated End Time:{" "}
            {calculateDroneEndTime(
              selectedDelivery.droneDelivery
            )?.toLocaleTimeString() || "N/A"}
          </p>
        </div>
      )}

      {selectedRestaurant && !selectedDelivery && (
        <div className="detail-panel">
          <h3>Restaurant Details</h3>
          <p>Name: {selectedRestaurant.name}</p>
          <p>Cuisine: {selectedRestaurant.cuisineType}</p>
          <p>Rating: {selectedRestaurant.rating}</p>
          <p>Address: {selectedRestaurant.address}</p>
        </div>
      )}

      {/* Orders List Section */}
      <div className="orders-list-section">
        <h3>
          {filters.showCurrentDeliveries && !filters.showPastDeliveries
            ? "Current Orders"
            : !filters.showCurrentDeliveries && filters.showPastDeliveries
            ? "Past Orders"
            : "All Orders"}
          {filters.restaurantId &&
            ` - ${
              restaurants.find((r) => r._id === filters.restaurantId)?.name ||
              ""
            }`}
        </h3>

        {filteredDeliveries.length === 0 ? (
          <p className="no-orders-message">
            No orders match the current filters.
          </p>
        ) : (
          <div className="orders-list">
            <table className="orders-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Restaurant</th>
                  <th>Items</th>
                  <th>Delivery Fee</th>
                  <th>Est. Delivery Time</th>
                  <th>Status</th>
                  <th>Total</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredDeliveries.map((order) => (
                  <tr
                    key={order._id}
                    className={
                      selectedDelivery && selectedDelivery._id === order._id
                        ? "selected-row"
                        : ""
                    }
                    onClick={() => handleSelectDelivery(order)}
                  >
                    <td>{order._id.substring(order._id.length - 8)}</td>
                    <td>{order.restaurant?.name || "Unknown"}</td>
                    <td>{order.items?.length || 0} items</td>
                    <td>${order.deliveryFee?.toFixed(2) || "0.00"}</td>
                    <td>
                      {order.estimatedDeliveryTime
                        ? `${order.estimatedDeliveryTime} min`
                        : "N/A"}
                    </td>
                    <td>
                      <span className={`status-badge ${getActualDeliveryStatus(order)}`}>
                        {getActualDeliveryStatus(order)}
                      </span>
                    </td>
                    <td>${order.total?.toFixed(2) || "0.00"}</td>
                    <td>
                      <button
                        className="view-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectDelivery(order);
                        }}
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeliveryManagement;
