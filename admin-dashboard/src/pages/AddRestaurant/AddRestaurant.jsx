import React, { useState, useEffect, useRef } from "react";
import restaurantService from "../../services/restaurantService";
import deliveryService from "../../services/deliveryService";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import "./AddRestaurant.css";
import cityService from "../../services/cityService";

// Add your Mapbox access token
mapboxgl.accessToken =
  "pk.eyJ1Ijoicm9vb2Q0MzUiLCJhIjoiY204ZnhiazB0MGk5MzJxczVqYmNxdWRnNyJ9.VV4Eyzqw09tqzNiNZd_bfw";

const AddRestaurant = () => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    cuisine: "",
    address: "",
    city: "",
    phone: "",
    email: "",
    website: "",
    priceRange: "$", // Valid enum value: $, $$, $$$, $$$$
    category: "restaurants", // Required field
    deliveryTime: "30-45 min", // Required field
    deliveryFee: "$2.99", // Required field
    imageUrl: "/images/default-restaurant.jpg", // Required field
    headerImage: "/images/default-restaurant-header.jpg",
    rating: 4.0,
    reviewCount: 0,
  });

  // Add state for restaurant hours - required object
  const [hours, setHours] = useState({
    monday: "10:00 AM - 10:00 PM",
    tuesday: "10:00 AM - 10:00 PM",
    wednesday: "10:00 AM - 10:00 PM",
    thursday: "10:00 AM - 10:00 PM",
    friday: "10:00 AM - 11:00 PM",
    saturday: "10:00 AM - 11:00 PM",
    sunday: "11:00 AM - 9:00 PM",
  });

  // Required coordinates array
  const [coordinates, setCoordinates] = useState([-74.006, 40.7128]);

  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const mapContainer = useRef(null);
  const map = useRef(null);
  const marker = useRef(null);

  useEffect(() => {
    const loadCities = async () => {
      try {
        const data = await cityService.getCities();
        console.log("Cities loaded:", data);
        setCities(data);
        if (data.length > 0) {
          setFormData((prev) => ({ ...prev, city: data[0]._id }));
        }
      } catch (err) {
        setError("Failed to load cities");
        console.error(err);
      }
    };

    loadCities();
  }, []);

  // Fix the marker anchor and zooming issue
  // Update your map initialization code

  useEffect(() => {
    if (mapContainer.current && !map.current) {
      // Initialize the map
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/streets-v12",
        center: coordinates,
        zoom: 13,
        attributionControl: false,
        pitchWithRotate: false, // Prevent diagonal zooming
        dragRotate: false, // Prevent map rotation (which can cause diagonal zooming)
        touchZoomRotate: { around: "center" }, // Zoom around center point
      });

      // Add navigation controls
      map.current.addControl(
        new mapboxgl.NavigationControl({
          showCompass: false, // Hide compass to prevent rotation
        }),
        "top-right"
      );

      // Wait for map to load before adding marker
      map.current.on("load", () => {
        console.log("Map loaded successfully");

        // Create a draggable marker element
        const el = document.createElement("div");
        el.className = "restaurant-marker";
        el.innerHTML = "🍽️";

        // Add marker to map with center anchor point to fix placement
        marker.current = new mapboxgl.Marker({
          element: el,
          draggable: true,
          anchor: "center", // This is the key fix - align marker center with clicked point
        })
          .setLngLat(coordinates)
          .addTo(map.current);

        // Update coordinates when marker is dragged
        marker.current.on("dragend", () => {
          const lngLat = marker.current.getLngLat();
          setCoordinates([lngLat.lng, lngLat.lat]);
          console.log("Marker dragged to:", lngLat);
        });

        // Allow clicking on map to place marker (with exact position)
        map.current.on("click", (e) => {
          const newCoords = [e.lngLat.lng, e.lngLat.lat];
          marker.current.setLngLat(newCoords);
          setCoordinates(newCoords);
          console.log("Map clicked, new coordinates:", newCoords);
        });
      });

      // Disable map rotation using keyboard shortcuts
      map.current.keyboard.disableRotation();
    }

    // Handle changes to coordinates from inputs
    if (map.current && marker.current) {
      const currentMarkerPosition = marker.current.getLngLat();
      if (
        currentMarkerPosition.lng !== coordinates[0] ||
        currentMarkerPosition.lat !== coordinates[1]
      ) {
        marker.current.setLngLat(coordinates);
        map.current.flyTo({
          center: coordinates,
          zoom: map.current.getZoom(), // Maintain current zoom level
          essential: true,
          animate: true,
        });
      }
    }

    // Cleanup
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
        marker.current = null;
      }
    };
  }, [coordinates]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Update the handleCoordinateChange function
  const handleCoordinateChange = (index, value) => {
    try {
      const newCoordinates = [...coordinates];
      // Handle empty string or invalid input
      const parsedValue = value === "" ? 0 : parseFloat(value);
      newCoordinates[index] = isNaN(parsedValue)
        ? coordinates[index]
        : parsedValue;

      // Update coordinates state
      setCoordinates(newCoordinates);

      // Update marker position if it exists
      if (marker.current) {
        marker.current.setLngLat(newCoordinates);
      }

      // Update map center if it exists
      if (map.current) {
        map.current.easeTo({
          center: newCoordinates,
          duration: 500,
          essential: true,
        });
      }
    } catch (err) {
      console.error("Error updating coordinates:", err);
    }
  };

  const handleHoursChange = (day, value) => {
    setHours((prev) => ({
      ...prev,
      [day]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError(null);

      // Prepare complete restaurant data
      const restaurantData = {
        ...formData,
        coordinates: coordinates,
        hours: hours,
        // Add empty menu structure
        menu: {
          categories: [],
          items: [],
        },
        // Add empty reviews array
        reviews: [],
      };

      console.log("Submitting restaurant data:", restaurantData);

      // Use restaurantService
      const response = await restaurantService.addRestaurant(restaurantData);
      console.log("Restaurant created:", response);

      setSuccess(true);

      // Reset form
      setFormData({
        name: "",
        description: "",
        cuisine: "",
        address: "",
        city: "",
        phone: "",
        email: "",
        website: "",
        priceRange: "$",
        category: "restaurants",
        deliveryTime: "30-45 min",
        deliveryFee: "$2.99",
        imageUrl: "/images/default-restaurant.jpg",
        headerImage: "/images/default-restaurant-header.jpg",
        rating: 4.0,
        reviewCount: 0,
      });

      // Reset coordinates
      setCoordinates([-74.006, 40.7128]);

      // Reset hours to default
      setHours({
        monday: "10:00 AM - 10:00 PM",
        tuesday: "10:00 AM - 10:00 PM",
        wednesday: "10:00 AM - 10:00 PM",
        thursday: "10:00 AM - 10:00 PM",
        friday: "10:00 AM - 11:00 PM",
        saturday: "10:00 AM - 11:00 PM",
        sunday: "11:00 AM - 9:00 PM",
      });

      // Reset marker position
      if (marker.current) {
        marker.current.setLngLat([-74.006, 40.7128]);
        map.current.flyTo({
          center: [-74.006, 40.7128],
          zoom: 12,
        });
      }
    } catch (err) {
      console.error("Error adding restaurant:", err);
      setError(
        `Failed to add restaurant: ${
          err.response?.data?.message || err.message
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-restaurant">
      <h1>Add New Restaurant</h1>

      {success && (
        <div className="success-message">Restaurant added successfully!</div>
      )}

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-layout">
          <div className="form-column">
            <div className="form-group">
              <label htmlFor="name">Restaurant Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="3"
              />
            </div>

            <div className="form-group">
              <label htmlFor="cuisine">Cuisine Type *</label>
              <input
                type="text"
                id="cuisine"
                name="cuisine"
                value={formData.cuisine}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="address">Address *</label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="city">City *</label>
              <select
                id="city"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                required
              >
                {cities.map((city) => (
                  <option key={city._id} value={city.id}>
                    {city.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="phone">Phone Number</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="website">Website</label>
              <input
                type="text"
                id="website"
                name="website"
                value={formData.website}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="imageUrl">Image URL *</label>
              <input
                type="text"
                id="imageUrl"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="headerImage">Header Image URL</label>
              <input
                type="text"
                id="headerImage"
                name="headerImage"
                value={formData.headerImage}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="category">Category *</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                required
              >
                <option value="restaurants">Restaurants</option>
                <option value="fast-food">Fast Food</option>
                <option value="cafe">Cafe</option>
                <option value="ethnic">Ethnic</option>
                <option value="pizza">Pizza</option>
                <option value="sushi">Sushi</option>
                <option value="italian">Italian</option>
                <option value="mexican">Mexican</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="priceRange">Price Range *</label>
              <select
                id="priceRange"
                name="priceRange"
                value={formData.priceRange}
                onChange={handleInputChange}
                required
              >
                <option value="$">$ (Inexpensive)</option>
                <option value="$$">$$ (Moderate)</option>
                <option value="$$$">$$$ (Expensive)</option>
                <option value="$$$$">$$$$ (Very Expensive)</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="deliveryTime">Delivery Time *</label>
              <input
                type="text"
                id="deliveryTime"
                name="deliveryTime"
                value={formData.deliveryTime}
                onChange={handleInputChange}
                placeholder="30-45 min"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="deliveryFee">Delivery Fee *</label>
              <input
                type="text"
                id="deliveryFee"
                name="deliveryFee"
                value={formData.deliveryFee}
                onChange={handleInputChange}
                placeholder="$2.99"
                required
              />
            </div>
          </div>

          <div className="form-column">
            <div className="form-group">
              <label>Business Hours *</label>
              <div className="hours-container">
                {Object.keys(hours).map((day) => (
                  <div key={day} className="hour-item">
                    <label className="day-label">
                      {day.charAt(0).toUpperCase() + day.slice(1)}
                    </label>
                    <input
                      type="text"
                      value={hours[day]}
                      onChange={(e) => handleHoursChange(day, e.target.value)}
                      placeholder="10:00 AM - 10:00 PM"
                      className="hour-input"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>Location on Map *</label>
              <p className="map-help">
                Click on the map or drag the marker to set the restaurant
                location
              </p>
              <div
                ref={mapContainer}
                className="map-container"
                style={{ width: "100%", height: "300px" }}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="longitude">Longitude *</label>
                <input
                  type="number"
                  id="longitude"
                  step="0.000001"
                  value={coordinates[0]}
                  onChange={(e) => handleCoordinateChange(0, e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="latitude">Latitude *</label>
                <input
                  type="number"
                  id="latitude"
                  step="0.000001"
                  value={coordinates[1]}
                  onChange={(e) => handleCoordinateChange(1, e.target.value)}
                  required
                />
              </div>
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? "Adding..." : "Add Restaurant"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddRestaurant;
