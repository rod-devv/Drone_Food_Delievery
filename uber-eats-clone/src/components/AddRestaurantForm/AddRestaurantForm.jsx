import React, { useState } from "react";
import "./AddRestaurantForm.css";

const AddRestaurantForm = ({ location, onSubmit, onCancel }) => {
  const [restaurantData, setRestaurantData] = useState({
    name: "",
    address: "",
    category: "restaurants", // Default to restaurants category
    description: "",
    imageUrl: "",
    rating: 4.0,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setRestaurantData({
      ...restaurantData,
      [name]: name === "rating" ? parseFloat(value) : value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Combine form data with location
    onSubmit({
      ...restaurantData,
      coordinates: [location.longitude, location.latitude],
    });
  };

  return (
    <div className="add-restaurant-form">
      <h3>Add New Restaurant</h3>
      <p className="location-info">
        Location: {location.latitude.toFixed(5)},{" "}
        {location.longitude.toFixed(5)}
      </p>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Restaurant Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={restaurantData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="address">Address</label>
          <input
            type="text"
            id="address"
            name="address"
            value={restaurantData.address}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="category">Category</label>
          <select
            id="category"
            name="category"
            value={restaurantData.category}
            onChange={handleChange}
            required
          >
            <option value="restaurants">Restaurant</option>
            <option value="fast-food">Fast Food</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={restaurantData.description}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="imageUrl">Image URL</label>
          <input
            type="text"
            id="imageUrl"
            name="imageUrl"
            value={restaurantData.imageUrl}
            onChange={handleChange}
            placeholder="http://example.com/image.jpg"
          />
        </div>

        <div className="form-group">
          <label htmlFor="rating">Rating (0-5)</label>
          <input
            type="number"
            id="rating"
            name="rating"
            min="0"
            max="5"
            step="0.1"
            value={restaurantData.rating}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-buttons">
          <button type="button" className="cancel-btn" onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" className="submit-btn">
            Add Restaurant
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddRestaurantForm;
