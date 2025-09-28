import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useApp } from "../../context/AppContext";

import Map from "../../components/Map/Map";
import SearchBar from "../../components/SearchBar/SearchBar";
import CategorySelector from "../../components/CategorySelector/CategorySelector";
import RestaurantCard from "../../components/RestaurantCard/RestaurantCard";
import "./CityPage.css";

const CityPage = () => {
  const { cityId } = useParams();
  const navigate = useNavigate();
  const {
    selectedCategory,
    setSelectedCategory,
    userAddress,
    setUserAddress,
    selectedLocation,
    setSelectedLocation,
    getCityById,
    getRestaurants,
    getRestaurantsByCity,
  } = useApp();

  const [city, setCity] = useState(null);
  const [filteredRestaurants, setFilteredRestaurants] = useState([]);
  const [allRestaurants, setAllRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // In your CityPage component, add this state:
  const [currentViewport, setCurrentViewport] = useState(null);
  // State for marker placement checkbox
  const [canPlaceMarker, setCanPlaceMarker] = useState(true); // Default: enabled

  // Add a ref to track the current value of canPlaceMarker
  const canPlaceMarkerRef = useRef(true);

  // Selected restaurant for popup info
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);

  // We'll add a deliveryLocation state to track the delivery marker separately
  const [deliveryLocation, setDeliveryLocation] = useState(null);

  // Update ref whenever canPlaceMarker changes
  useEffect(() => {
    canPlaceMarkerRef.current = canPlaceMarker;
    // console.log("canPlaceMarker state updated to:", canPlaceMarker);
  }, [canPlaceMarker]);

  // Fetch city data when component mounts or cityId changes
  useEffect(() => {
    const fetchCityData = async () => {
      try {
        setLoading(true);

        // console.log("-----------Fetching city data for ID:", cityId);
        const cityData = await getCityById(cityId);
        // console.log("@@@@@@@@-Fetched city data:", cityData);
        setCity(cityData);
      } catch (error) {
        console.error("Error fetching city data:", error);
        setError("Failed to load city information. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    if (cityId) {
      fetchCityData();
    }
  }, [cityId, getCityById]);

  // Fetch restaurants when city data is loaded
  useEffect(() => {
    const fetchRestaurants = async () => {
      if (!city) return;

      try {
        setLoading(true);
        // You can modify this to fetch restaurants by city
        // const data = await getRestaurants(city._id || city.id);

        const data = await getRestaurantsByCity(city.id);

        // console.log("Fetched restaurants:", data);
        // console.log("city._id , city.id :", city._id, city.id);
        setAllRestaurants(data);
      } catch (error) {
        console.error("Error fetching restaurants:", error);
        setError("Failed to load restaurants. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, [city, getRestaurantsByCity]);

  // Filter restaurants when category changes
  useEffect(() => {
    if (!allRestaurants.length) return;

    // Filter restaurants by category if selected
    let filtered = [...allRestaurants];

    if (selectedCategory) {
      filtered = filtered.filter(
        (restaurant) => restaurant.category === selectedCategory
      );
    }

    // console.log("F=====================", filtered);

    setFilteredRestaurants(filtered);
  }, [allRestaurants, selectedCategory]);

  // Effect to update selectedLocation only when delivery location changes and marker placement is enabled
  useEffect(() => {
    if (canPlaceMarker && deliveryLocation) {
      setSelectedLocation(deliveryLocation);
    }
  }, [deliveryLocation, canPlaceMarker, setSelectedLocation]);

  const handleAddressSearch = (address) => {
    setUserAddress(address);
    // In a real app, this would geocode the address to get coordinates
    // For now, we'll just display the text
  };

  const handleMapClick = (coords) => {
    // Use the ref to get the most current value
    const currentCanPlaceMarker = canPlaceMarkerRef.current;

    // Only place marker if the checkbox is checked
    if (currentCanPlaceMarker) {
      setDeliveryLocation(coords); // Update the delivery location
      setUserAddress(
        `Selected location at lat: ${coords.latitude.toFixed(
          4
        )}, lng: ${coords.longitude.toFixed(4)}`
      );

      // Important: DON'T update the viewport here, it will cause a reset
      // Just let the map component handle its own viewport
    } else {
      console.log("Not placing marker - canPlaceMarker is false");
    }

    // Close any open restaurant popup when clicking elsewhere on the map
    setSelectedRestaurant(null);
  };

  const handleMarkerClick = (marker) => {
    // console.log("Marker clicked:", marker);

    // Only show restaurant popup when canPlaceMarker is FALSE
    if (marker.data && !canPlaceMarkerRef.current) {
      // Set the selected restaurant to show popup info
      setSelectedRestaurant(marker.data);
      // console.log("Restaurant clicked, showing popup for:", marker.data.name);
    } else {
      console.log(
        "Restaurant click ignored - marker placement mode is enabled"
      );
    }
  };

  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId === selectedCategory ? null : categoryId);
  };

  // Close restaurant popup
  const closeRestaurantPopup = () => {
    setSelectedRestaurant(null);
  };

  const handleCheckboxChange = (e) => {
    const isChecked = e.target.checked;

    // Update state
    setCanPlaceMarker(isChecked);

    // Update ref immediately
    canPlaceMarkerRef.current = isChecked;

    if (isChecked && deliveryLocation) {
      setSelectedLocation(deliveryLocation);
    } else if (!isChecked) {
      setSelectedLocation(null);
    }

    // Importantly, DON'T update the viewport here
  };

  if (loading && !city) {
    return <div className="loading">Loading city data...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!city) {
    return <div className="loading">City not found</div>;
  }

  // Helper function to get coordinates based on different possible formats
  const getCoordinates = (item) => {
    if (Array.isArray(item.coordinates)) {
      return {
        longitude: item.coordinates[0],
        latitude: item.coordinates[1],
      };
    } else if (item.coordinates && typeof item.coordinates === "object") {
      return {
        longitude: item.coordinates.longitude || item.coordinates.lng,
        latitude: item.coordinates.latitude || item.coordinates.lat,
      };
    } else if (item.location && item.location.coordinates) {
      return {
        longitude: item.location.coordinates[0],
        latitude: item.location.coordinates[1],
      };
    }
    // Default fallback
    return { longitude: 0, latitude: 0 };
  };

  // Prepare markers for the map
  const mapMarkers = [
    // Add delivery location marker only if selectedLocation exists
    ...(selectedLocation
      ? [
          {
            longitude: selectedLocation.longitude,
            latitude: selectedLocation.latitude,
            type: "delivery", // This type will tell the Map component to use the delivery emoji
            color: "#FF5722", // Orange color for delivery location
            size: 40,
          },
        ]
      : []),
    // Add all restaurant markers
    ...filteredRestaurants.map((restaurant) => {
      const coords = getCoordinates(restaurant);
      return {
        longitude: coords.longitude,
        latitude: coords.latitude,
        data: restaurant,
        type: "restaurant", // This type will tell the Map component to use the restaurant emoji
        color: "#2196F3", // Blue color for existing restaurants
        size: 35,
      };
    }),
  ];

  // Get city coordinates
  const cityCoords = getCoordinates(city);

  return (
    <div className="city-page">
      {/* <button className="back-button" onClick={() => navigate("/")}>
        ← Back to Homepage
      </button> */}

      <img id="mid_img" src="./images/mid_image.jpg" alt="" />
      <h1>Food Delivery in {city.name}</h1>

      <div className="address-search-section">
        <h2>Enter your delivery address</h2>
        <SearchBar
          placeholder="Enter your address..."
          onSearch={handleAddressSearch}
        />

        <div className="selected-address">
          {userAddress ? (
            <p>
              Delivery to: <strong>{userAddress}</strong>
            </p>
          ) : (
            <p>Select your location on the map or enter your address above</p>
          )}
        </div>

        {/* Single checkbox for marker placement mode */}
        <div className="map-options">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={canPlaceMarker}
              onChange={handleCheckboxChange}
            />
            Enable placing delivery location on map
          </label>
        </div>

        <p className="map-instructions">
          {canPlaceMarker
            ? "Click anywhere on the map to set your delivery location"
            : "Delivery location mode disabled. Click on restaurants to view information."}
        </p>

        <Map
          initialViewport={{
            latitude: cityCoords.latitude,
            longitude: cityCoords.longitude,
            zoom: 12,
          }}
          // These two props are key to preventing viewport reset
          currentViewport={currentViewport}
          onViewportChange={setCurrentViewport}
          markers={mapMarkers}
          onMapClick={handleMapClick}
          onMarkerClick={handleMarkerClick}
        />

        {/* Restaurant information popup - shows only when canPlaceMarker is FALSE */}
        {selectedRestaurant && !canPlaceMarkerRef.current && (
          <div className="restaurant-popup">
            <div className="restaurant-popup-content">
              <button className="close-popup" onClick={closeRestaurantPopup}>
                &times;
              </button>
              <h3>{selectedRestaurant.name}</h3>
              <p className="restaurant-category">
                {selectedRestaurant.category.charAt(0).toUpperCase() +
                  selectedRestaurant.category.slice(1).replace("-", " ")}
              </p>
              <div className="restaurant-details">
                <p>
                  <strong>Rating:</strong> {selectedRestaurant.rating} ⭐
                </p>
                <p>
                  <strong>Delivery time:</strong>{" "}
                  {selectedRestaurant.deliveryTime} min
                </p>
                <p>
                  <strong>Delivery fee:</strong> $
                  {typeof selectedRestaurant.deliveryFee === "number"
                    ? selectedRestaurant.deliveryFee.toFixed(2)
                    : selectedRestaurant.deliveryFee}
                </p>
              </div>
              <button
                className="view-restaurant-btn"
                onClick={() => {
                  // Navigate to restaurant page or open menu modal
                  // console.log(
                  //   "View restaurant:",
                  //   selectedRestaurant._id || selectedRestaurant.id
                  // );
                  closeRestaurantPopup();
                }}
              >
                View Menu
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="city-description">
        <h2>Food delivery in {city.name}</h2>
        <p>
          {city.description ||
            `Discover the best food ${city.name} has to offer! From fast food to
          fine dining, we have everything you need to satisfy your cravings.`}
        </p>
      </div>

      <CategorySelector
        selectedCategory={selectedCategory}
        onSelectCategory={handleCategorySelect}
      />

      <div className="restaurants-section">
        <h2>
          {selectedCategory
            ? `${
                selectedCategory.charAt(0).toUpperCase() +
                selectedCategory.slice(1).replace("-", " ")
              } in ${city.name}`
            : `All restaurants in ${city.name}`}
        </h2>

        {loading && <div className="loading">Loading restaurants...</div>}

        {!loading && filteredRestaurants.length > 0 ? (
          <div className="restaurant-list">
            {filteredRestaurants.map((restaurant) => (
              <RestaurantCard
                key={restaurant._id || restaurant.id}
                restaurant={restaurant}
              />
            ))}
          </div>
        ) : (
          !loading && (
            <p className="no-results">
              No restaurants found. Try selecting a different category.
            </p>
          )
        )}
      </div>
    </div>
  );
};

export default CityPage;
