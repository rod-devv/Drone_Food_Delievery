import React, { useState, useEffect } from "react";
import restaurantService from "../../services/restaurantService";
import "./RestaurantManagement.css";

const RestaurantManagement = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [sortDirection, setSortDirection] = useState("asc");
  const [filters, setFilters] = useState({
    minRating: "",
    city: "",
  });
  const [cities, setCities] = useState([]);
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => {
    const loadRestaurants = async () => {
      try {
        setLoading(true);
        // Replace fetchRestaurants with restaurantService.getRestaurants
        let data = await restaurantService.getRestaurants();

        // Ensure data is an array
        if (!Array.isArray(data)) {
          console.warn("API returned non-array data:", data);
          // Check if data has a restaurants property that might be the array
          if (data && Array.isArray(data.restaurants)) {
            data = data.restaurants;
          } else {
            // If no valid array found, default to empty array
            data = [];
          }
        }

        setRestaurants(data);

        // Extract unique cities for filters
        // Only if we have restaurant data
        if (data.length > 0) {
          // Safely extract city values
          const extractCities = data
            .map((r) => r.city || "Unknown")
            .filter(Boolean);

          const uniqueCities = [...new Set(extractCities)];

          setCities(uniqueCities);
        }
      } catch (err) {
        setError("Failed to load restaurants");
        console.error("Error details:", err);
      } finally {
        setLoading(false);
      }
    };

    loadRestaurants();
  }, []);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSortChange = (field) => {
    if (sortBy === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortDirection("asc");
    }
  };

  const handleDeleteClick = (id) => {
    setConfirmDelete(id);
  };

  const confirmDeleteRestaurant = async () => {
    if (!confirmDelete) return;

    try {
      // Replace deleteRestaurant with restaurantService.deleteRestaurant
      await restaurantService.deleteRestaurant(confirmDelete);
      setRestaurants(restaurants.filter((r) => r._id !== confirmDelete));
      setConfirmDelete(null);
    } catch (err) {
      setError("Failed to delete restaurant");
      console.error(err);
    }
  };

  const cancelDelete = () => {
    setConfirmDelete(null);
  };

  // Safe filtering to handle cases where restaurants may not be an array
  const filteredRestaurants = Array.isArray(restaurants)
    ? restaurants
        .filter((restaurant) => {
          const nameMatch =
            restaurant.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            false;
          const ratingMatch =
            !filters.minRating ||
            (restaurant.rating &&
              restaurant.rating >= parseFloat(filters.minRating));
          const cityMatch = !filters.city || restaurant.city === filters.city;

          return nameMatch && ratingMatch && cityMatch;
        })
        .sort((a, b) => {
          let comparison = 0;

          switch (sortBy) {
            case "name":
              comparison = (a.name || "").localeCompare(b.name || "");
              break;
            case "rating":
              comparison = (a.rating || 0) - (b.rating || 0);
              break;

            default:
              comparison = 0;
          }

          return sortDirection === "asc" ? comparison : -comparison;
        })
    : [];

  if (loading && !restaurants.length) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="restaurant-management">
      <h1>Restaurant Management</h1>
      <hr />
      <br />

      {error && <div className="error">{error}</div>}

      <div className="search-filters">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search restaurants..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="search-input"
          />
        </div>
        <br />

        <div className="filters-container">
          <div className="filter">
            <label>Min Rating:</label>
            <select
              name="minRating"
              value={filters.minRating}
              onChange={handleFilterChange}
            >
              <option value="">Any Rating</option>
              <option value="4.5">4.5+</option>
              <option value="4">4+</option>
              <option value="3.5">3.5+</option>
              <option value="3">3+</option>
            </select>
          </div>

          <div className="filter">
            <label>City:</label>
            <select
              name="city"
              value={filters.city}
              onChange={handleFilterChange}
            >
              <option value="">All Cities</option>
              {cities.map((city, index) => (
                <option key={index} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="restaurant-list">
        {filteredRestaurants.length === 0 ? (
          <div className="no-data">
            {loading ? "Loading restaurants..." : "No restaurants found."}
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th onClick={() => handleSortChange("name")}>
                  Name
                  {sortBy === "name" && (
                    <span className="sort-indicator">
                      {sortDirection === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </th>
                <th onClick={() => handleSortChange("rating")}>
                  Rating
                  {sortBy === "rating" && (
                    <span className="sort-indicator">
                      {sortDirection === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </th>
                <th>Address</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRestaurants.map((restaurant, index) => (
                <tr key={restaurant._id || index}>
                  <td>{restaurant.name || "N/A"}</td>
                  <td>{restaurant.rating || "N/A"}</td>
                  <td>{restaurant.address || "N/A"}</td>
                  <td>
                    <button
                      className="delete-btn"
                      onClick={() => handleDeleteClick(restaurant._id)}
                      disabled={!restaurant._id}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {confirmDelete && (
        <div className="delete-modal">
          <div className="modal-content">
            <h3>Confirm Delete</h3>
            <p>Are you sure you want to delete this restaurant?</p>
            <div className="modal-buttons">
              <button onClick={confirmDeleteRestaurant}>Yes, Delete</button>
              <button onClick={cancelDelete}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RestaurantManagement;
