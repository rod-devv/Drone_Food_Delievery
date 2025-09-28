import { useState, useEffect, useRef } from "react";
import restaurantService from "../../services/restaurantService";
import foodService from "../../services/foodService";
import "./RestaurantManagementOwner.css";
import optionService from "../../services/optionService";

function RestaurantManagementOwner() {
  // State for restaurants, selected restaurant, and menu items
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [isEditingRestaurant, setIsEditingRestaurant] = useState(false);
  const [editedRestaurant, setEditedRestaurant] = useState(null);
  const [editingFoodId, setEditingFoodId] = useState(null);
  const [editedFood, setEditedFood] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fileInputRef = useRef(null);

  const getImageFilename = (name) => {
    // Convert to lowercase for case-insensitive matching
    const nameLower = name.toLowerCase();

    const foodKeywords = ["fries", "cola", "soda", "pie"];

    // Check each keyword against the item name
    for (const keyword of foodKeywords) {
      if (nameLower.includes(keyword)) {
        return keyword;
      }
    }

    return name;
  };

  // Fetch owner's restaurants on component mount
  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        setLoading(true);
        const data = await restaurantService.getUserRestaurants();
        setRestaurants(data);
        if (data.length > 0) {
          setSelectedRestaurant(data[0]);
          setEditedRestaurant(data[0]);
        }
        setLoading(false);
      } catch (err) {
        console.error("Error fetching restaurants:", err);
        setError("Failed to fetch restaurants");
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, []);

  // Fetch menu items when selected restaurant changes
  useEffect(() => {
    if (selectedRestaurant) {
      const fetchMenuItems = async () => {
        try {
          const data = await foodService.getFoodsByRestaurant(
            selectedRestaurant._id
          );
          setMenuItems(data);
        } catch (err) {
          console.error("Error fetching menu items:", err);
          setError("Failed to fetch menu items");
        }
      };

      fetchMenuItems();
    }
  }, [selectedRestaurant]);

  // Handle restaurant selection change
  const handleRestaurantChange = (e) => {
    const restaurant = restaurants.find((r) => r._id === e.target.value);
    setSelectedRestaurant(restaurant);
    setEditedRestaurant(restaurant);
    setIsEditingRestaurant(false);
    setEditingFoodId(null);
  };

  // Handle restaurant update
  const handleUpdateRestaurant = () => {
    setIsEditingRestaurant(true);
  };

  // Handle restaurant save
  const handleSaveRestaurant = async () => {
    try {
      await restaurantService.updateRestaurant(
        selectedRestaurant._id,
        editedRestaurant
      );

      // Update the restaurant in the list
      const updatedRestaurants = restaurants.map((r) =>
        r._id === selectedRestaurant._id ? editedRestaurant : r
      );

      setRestaurants(updatedRestaurants);
      setSelectedRestaurant(editedRestaurant);
      setIsEditingRestaurant(false);
    } catch (err) {
      console.error("Error updating restaurant:", err);
      setError("Failed to update restaurant");
    }
  };

  // Handle restaurant input changes
  const handleRestaurantInputChange = (e) => {
    const { name, value } = e.target;
    setEditedRestaurant({
      ...editedRestaurant,
      [name]: value,
    });
  };

  // Handle image selection
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Trigger file input click
  const handleImageButtonClick = () => {
    fileInputRef.current.click();
  };

  // Handle food edit mode
  const handleEditFood = (food) => {
    setEditingFoodId(food._id);

    // Create a deep copy of the food object
    const foodCopy = {
      ...food,
      price:
        typeof food.price === "number"
          ? food.price
          : parseFloat(food.price || 0),
    };

    // Ensure options have all required fields
    if (foodCopy.availableOptions) {
      // Make a deep copy to avoid direct mutation
      foodCopy.availableOptions = foodCopy.availableOptions.map((option) => ({
        _id: option._id, // Important: keep the original _id
        name: option.name || "",
        price:
          typeof option.price === "number"
            ? option.price
            : parseFloat(option.price || 0),
      }));
    } else {
      foodCopy.availableOptions = [];
    }

    setEditedFood(foodCopy);

    // Set image preview
    setImagePreview(food.imageUrl || null);
    setImageFile(null);
  };

  // Add a new option
  const handleAddOption = () => {
    setEditedFood({
      ...editedFood,
      availableOptions: [
        ...(editedFood.availableOptions || []),
        { name: "", price: 0 },
      ],
    });
  };

  // Update an option
  const handleOptionChange = (index, field, value) => {
    const updatedOptions = [...editedFood.availableOptions];
    updatedOptions[index] = {
      ...updatedOptions[index],
      [field]: field === "price" ? parseFloat(value) : value,
    };

    setEditedFood({
      ...editedFood,
      availableOptions: updatedOptions,
    });
  };

  // Remove an option
  const handleRemoveOption = (index) => {
    const updatedOptions = [...editedFood.availableOptions];
    updatedOptions.splice(index, 1);

    setEditedFood({
      ...editedFood,
      availableOptions: updatedOptions,
    });
  };

  // Handle food delete
  const handleDeleteFood = async (foodId) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      try {
        await foodService.deleteFood(foodId);
        setMenuItems(menuItems.filter((item) => item._id !== foodId));
      } catch (err) {
        console.error("Error deleting food item:", err);
        setError("Failed to delete menu item");
      }
    }
  };

  // Handle food input changes
  const handleFoodChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditedFood({
      ...editedFood,
      [name]:
        type === "checkbox"
          ? checked
          : name === "price"
          ? parseFloat(value)
          : value,
    });
  };

  const handleSaveFood = async (foodId) => {
    try {
      // First, process options: create new ones and collect existing ones
      const optionIds = [];

      // Process each option
      if (
        editedFood.availableOptions &&
        editedFood.availableOptions.length > 0
      ) {
        // Process each option one by one
        for (const option of editedFood.availableOptions) {
          // Skip empty options
          if (!option.name || option.name.trim() === "") continue;

          if (option._id) {
            // This is an existing option - update it
            await optionService.updateOption(option._id, {
              name: option.name,
              price: parseFloat(option.price || 0),
            });
            // Add the ID to our list
            optionIds.push(option._id);
          } else {
            // This is a new option - create it
            try {
              const newOption = await optionService.addOption({
                name: option.name,
                price: parseFloat(option.price || 0),
              });
              // Add the new ID to our list
              optionIds.push(newOption._id);
            } catch (optionError) {
              console.error("Error creating option:", optionError);
            }
          }
        }
      }

      // Create a clean version of the food with only the option IDs
      const updatedFood = {
        ...editedFood,
        availableOptions: optionIds, // Only send the option IDs
        price: parseFloat(editedFood.price || 0),
      };

      // Handle image upload if needed
      if (imageFile) {
        try {
          const formData = new FormData();
          formData.append("image", imageFile);

          const imageResponse = await foodService.uploadFoodImage(
            foodId,
            formData
          );

          if (imageResponse && imageResponse.imageUrl) {
            updatedFood.imageUrl = imageResponse.imageUrl;
          }
        } catch (imageError) {
          console.error("Error uploading image:", imageError);
          // Continue with saving other data even if image upload fails
        }
      }

      // Update the food with the option IDs
      await foodService.updateFood(foodId, updatedFood);

      // Get the updated food with populated options
      const refreshedFood = await foodService.getFoodById(foodId);

      // Update the food in the list
      setMenuItems(
        menuItems.map((item) => (item._id === foodId ? refreshedFood : item))
      );

      setEditingFoodId(null);
      setImagePreview(null);
      setImageFile(null);
    } catch (err) {
      console.error("Error updating food item:", err);
      setError("Failed to update menu item");
    }
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingFoodId(null);
    setImagePreview(null);
    setImageFile(null);
  };

  if (loading) return <div className="loading">Loading restaurants...</div>;
  if (error)
    return (
      <div className="error" onClick={() => setError("")}>
        {error}
      </div>
    );
  if (restaurants.length === 0) return <div>No restaurants found.</div>;

  return (
    <div className="restaurant-management">
      <h1>Restaurant Management</h1>

      {/* Restaurant Selection */}
      <div className="restaurant-selector">
        <label htmlFor="restaurant-select">Select Restaurant:</label>
        <select
          id="restaurant-select"
          value={selectedRestaurant?._id || ""}
          onChange={handleRestaurantChange}
        >
          {restaurants.map((restaurant) => (
            <option key={restaurant._id} value={restaurant._id}>
              {restaurant.name}
            </option>
          ))}
        </select>
      </div>

      {selectedRestaurant && (
        <>
          {/* Restaurant Details */}
          <div className="restaurant-details">
            <h2>Restaurant Information</h2>
            <div className="restaurant-info">
              {isEditingRestaurant ? (
                <div className="edit-restaurant-form">
                  <div className="form-group">
                    <label>Name:</label>
                    <input
                      type="text"
                      name="name"
                      value={editedRestaurant.name}
                      onChange={handleRestaurantInputChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Address:</label>
                    <input
                      type="text"
                      name="address"
                      value={editedRestaurant.address}
                      onChange={handleRestaurantInputChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Description:</label>
                    <textarea
                      name="description"
                      value={editedRestaurant.description}
                      onChange={handleRestaurantInputChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Phone:</label>
                    <input
                      type="text"
                      name="phone"
                      value={editedRestaurant.phone}
                      onChange={handleRestaurantInputChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Cuisine Type:</label>
                    <input
                      type="text"
                      name="cuisineType"
                      value={editedRestaurant.cuisineType}
                      onChange={handleRestaurantInputChange}
                    />
                  </div>
                  <button className="save-btn" onClick={handleSaveRestaurant}>
                    Save Changes
                  </button>
                </div>
              ) : (
                <div className="restaurant-display">
                  <p>
                    <strong>Name:</strong> {selectedRestaurant.name}
                  </p>
                  <p>
                    <strong>Address:</strong> {selectedRestaurant.address}
                  </p>
                  <p>
                    <strong>Description:</strong>{" "}
                    {selectedRestaurant.description}
                  </p>
                  <p>
                    <strong>Phone:</strong> {selectedRestaurant.phone}
                  </p>
                  <p>
                    <strong>Cuisine Type:</strong>{" "}
                    {selectedRestaurant.cuisineType}
                  </p>
                  <button className="edit-btn" onClick={handleUpdateRestaurant}>
                    Update Information
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Menu Items */}
          <div className="menu-management">
            <h2>Menu Items</h2>
            {menuItems.length === 0 ? (
              <p>No menu items found for this restaurant.</p>
            ) : (
              <div className="menu-list">
                {menuItems.map((food) => (
                  <div key={food._id} className="menu-item">
                    {editingFoodId === food._id ? (
                      <div className="edit-food-form">
                        <div className="form-group">
                          <label>Name:</label>
                          <input
                            type="text"
                            name="name"
                            value={editedFood.name}
                            onChange={handleFoodChange}
                          />
                        </div>
                        <div className="form-group">
                          <label>Price ($):</label>
                          <input
                            type="number"
                            name="price"
                            value={editedFood.price}
                            onChange={handleFoodChange}
                            step="0.01"
                          />
                        </div>
                        <div className="form-group">
                          <label>Description:</label>
                          <textarea
                            name="description"
                            value={editedFood.description}
                            onChange={handleFoodChange}
                          />
                        </div>

                        {/* Image Upload Section */}
                        <div className="form-group image-upload">
                          <label>Food Image:</label>
                          <div className="image-preview-container">
                            {imagePreview ? (
                              <img
                                src={imagePreview}
                                alt="Preview"
                                className="image-preview"
                              />
                            ) : (
                              <div className="no-image">No image selected</div>
                            )}
                            <input
                              type="file"
                              ref={fileInputRef}
                              onChange={handleImageSelect}
                              accept="image/*"
                              style={{ display: "none" }}
                            />
                            <button
                              type="button"
                              className="upload-btn"
                              onClick={handleImageButtonClick}
                            >
                              {imagePreview ? "Change Image" : "Upload Image"}
                            </button>
                          </div>
                        </div>

                        {/* Available Options Section */}
                        <div className="form-group options-section">
                          <label>Available Options:</label>
                          {editedFood.availableOptions &&
                          editedFood.availableOptions.length > 0 ? (
                            <div className="options-list">
                              {editedFood.availableOptions.map(
                                (option, index) => (
                                  <div key={index} className="option-item">
                                    <input
                                      type="text"
                                      placeholder="Option Name"
                                      value={option.name}
                                      onChange={(e) =>
                                        handleOptionChange(
                                          index,
                                          "name",
                                          e.target.value
                                        )
                                      }
                                      className="option-name"
                                    />
                                    <input
                                      type="number"
                                      placeholder="Price"
                                      value={option.price}
                                      onChange={(e) =>
                                        handleOptionChange(
                                          index,
                                          "price",
                                          e.target.value
                                        )
                                      }
                                      step="0.01"
                                      className="option-price"
                                    />
                                    <button
                                      type="button"
                                      className="remove-option"
                                      onClick={() => handleRemoveOption(index)}
                                    >
                                      ✕
                                    </button>
                                  </div>
                                )
                              )}
                            </div>
                          ) : (
                            <p>No options added</p>
                          )}
                          <button
                            type="button"
                            className="add-option-btn"
                            onClick={handleAddOption}
                          >
                            + Add Option
                          </button>
                        </div>

                        <div className="form-group checkbox">
                          <label>
                            <input
                              type="checkbox"
                              name="popular"
                              checked={editedFood.popular}
                              onChange={handleFoodChange}
                            />
                            Popular Item
                          </label>
                        </div>
                        <div className="food-actions">
                          <button
                            className="save-btn"
                            onClick={() => handleSaveFood(food._id)}
                          >
                            Save
                          </button>
                          <button
                            className="cancel-btn"
                            onClick={handleCancelEdit}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="food-display">
                        <div className="food-info">
                          <div className="food-image">
                            {food.imageUrl ? (
                              <img
                                // src={food.imageUrl}
                                src={`https://res.cloudinary.com/dynoujkny/image/upload/images/item-names/${getImageFilename(
                                  food.name
                                )}.jpg`}
                                alt={food.name}
                              />
                            ) : (
                              <div className="no-image-small">No Image</div>
                            )}
                          </div>
                          <div className="food-details">
                            <h3>{food.name}</h3>
                            <p className="price">
                              $
                              {typeof food.price === "number"
                                ? food.price.toFixed(2)
                                : parseFloat(food.price || 0).toFixed(2)}
                            </p>
                            <p className="description">{food.description}</p>
                            {food.popular && (
                              <span className="popular-tag">Popular</span>
                            )}
                            {food.availableOptions &&
                              food.availableOptions.length > 0 && (
                                <div className="options">
                                  <p>
                                    <strong>Available Options:</strong>
                                  </p>
                                  <ul>
                                    {food.availableOptions.map(
                                      (option, idx) => (
                                        <li key={option._id || `option-${idx}`}>
                                          {option.name}{" "}
                                          {option.price > 0 &&
                                            `(+$${parseFloat(
                                              option.price
                                            ).toFixed(2)})`}
                                        </li>
                                      )
                                    )}
                                  </ul>
                                </div>
                              )}
                          </div>
                        </div>
                        <div className="food-actions">
                          <button
                            className="edit-btn"
                            onClick={() => handleEditFood(food)}
                          >
                            Update
                          </button>
                          <button
                            className="delete-btn"
                            onClick={() => handleDeleteFood(food._id)}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default RestaurantManagementOwner;
