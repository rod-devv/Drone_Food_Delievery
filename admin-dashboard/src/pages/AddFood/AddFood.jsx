// Fix the getUserRestaurants line and add restaurant selection functionality
import React, { useState, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import foodService from "../../services/foodService";
import optionService from "../../services/optionService";
import restaurantService from "../../services/restaurantService";
import userService from "../../services/userService";
import "./AddFood.css";

const AddFood = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [restaurantId, setRestaurantId] = useState("");
  const [userRestaurants, setUserRestaurants] = useState([]);
  const [imagePreview, setImagePreview] = useState(null);
  const [categories, setCategories] = useState([]);
  const [customCategory, setCustomCategory] = useState("");
  const [availableOptions, setAvailableOptions] = useState([]);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [optionCategories, setOptionCategories] = useState([]);
  const [newOption, setNewOption] = useState({
    name: "",
    choices: [],
    additionalPrice: 0,
    category: "",
    customCategory: "",
  });
  const [showOptionForm, setShowOptionForm] = useState(false);
  const [optionChoices, setOptionChoices] = useState("");

  // Fetch user's restaurants and existing data
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);

        // Get all user's restaurants
        const restaurants = await restaurantService.getUserRestaurants();
        console.log("User restaurants:", restaurants);

        if (
          restaurants &&
          Array.isArray(restaurants) &&
          restaurants.length > 0
        ) {
          setUserRestaurants(restaurants);

          // Select the first restaurant by default
          handleRestaurantSelection(restaurants[0]._id);
        } else {
          setError(
            "No restaurants associated with your account. Please contact admin."
          );
        }

        setLoading(false);
      } catch (err) {
        console.error("Error fetching initial data:", err);
        setError("Failed to load data. Please try again later.");
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  // Update the handleRestaurantSelection function to use getRestaurantCategories
  const handleRestaurantSelection = async (restaurantId) => {
    if (!restaurantId) return;

    try {
      setLoading(true);
      setRestaurantId(restaurantId);

      // Load restaurant categories from backend
      const categoriesData = await restaurantService.getRestaurantCategories(
        restaurantId
      );
      if (categoriesData && Array.isArray(categoriesData)) {
        // Extract category names
        setCategories(categoriesData.map((cat) => cat.name));
      } else {
        setCategories([]);
      }

      // Load existing options for this restaurant
      const options = await optionService.getOptionsByRestaurant(restaurantId);
      if (options && Array.isArray(options)) {
        // Ensure every option has a choices array to prevent errors
        const cleanedOptions = options.map((option) => ({
          ...option,
          choices: Array.isArray(option.choices) ? option.choices : [],
          category: option.category || "Uncategorized",
        }));

        setAvailableOptions(cleanedOptions);

        // Extract unique option categories
        const uniqueCategories = [
          ...new Set(cleanedOptions.map((option) => option.category)),
        ];
        setOptionCategories(
          uniqueCategories.filter((cat) => cat && cat.trim() !== "")
        );
      } else {
        setAvailableOptions([]);
        setOptionCategories([]);
      }

      // Reset selected options when changing restaurants
      setSelectedOptions([]);

      setLoading(false);
    } catch (err) {
      console.error("Error loading restaurant data:", err);
      setError("Failed to load restaurant data. Please try again.");
      setLoading(false);
    }
  };

  // Form validation schema using Yup
  const validationSchema = Yup.object({
    name: Yup.string()
      .required("Food name is required")
      .min(2, "Name too short")
      .max(50, "Name too long"),
    description: Yup.string()
      .required("Description is required")
      .min(10, "Description too short")
      .max(500, "Description too long"),
    price: Yup.number()
      .required("Price is required")
      .positive("Price must be positive")
      .max(1000, "Price too high"),
    category: Yup.string().required("Category is required"),
    popular: Yup.boolean(),
  });

  // Initialize form with Formik
  const formik = useFormik({
    initialValues: {
      name: "",
      description: "",
      price: "",
      category: "",
      popular: false,
      imageUrl: "",
      image: null,
    },
    validationSchema,
    onSubmit: async (values) => {
      if (!restaurantId) {
        setError("Please select a restaurant first");
        return;
      }

      setLoading(true);
      setError(null);
      setSuccess(false);

      try {
        // Create form data for file upload
        const formData = new FormData();

        // Add all form fields to the formData
        formData.append("name", values.name);
        formData.append("description", values.description);
        formData.append("price", values.price);
        formData.append("category", values.category);
        formData.append("popular", values.popular);
        formData.append("restaurant", restaurantId);

        // Only append the image if one is selected
        if (values.image) {
          formData.append("image", values.image);
        }

        // Add selected options
        formData.append("availableOptions", JSON.stringify(selectedOptions));

        // Debug FormData contents
        console.log("==== FormData Content Before Sending ====");
        for (let pair of formData.entries()) {
          console.log(
            pair[0] + ": " + (pair[0] === "image" ? "[File Object]" : pair[1])
          );
        }

        // Send to the API
        const response = await foodService.addFood(formData);

        console.log("=====2 ===");
        setSuccess(true);
        setLoading(false);

        // Reset form after successful submission
        formik.resetForm();
        setImagePreview(null);
        setSelectedOptions([]);

        // Since we're now getting categories from the API, we don't need to add custom categories
        // to our local state anymore, so this can be removed:
        // if (customCategory && !categories.includes(customCategory)) {
        //   setCategories([...categories, customCategory]);
        //   setCustomCategory("");
        // }

        console.log("Food item added successfully:", response);

        // Clear success message after 5 seconds
        setTimeout(() => setSuccess(false), 5000);
      } catch (err) {
        console.error("Error adding food:", err);
        setError(
          err.response?.data?.message ||
            "Failed to add food item. Please try again."
        );
        setLoading(false);
      }
    },
  });

  // Handle image selection and preview
  const handleImageChange = (event) => {
    const file = event.currentTarget.files[0];
    if (file) {
      formik.setFieldValue("image", file);

      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle category selection or custom category
  const handleCategoryChange = (e) => {
    const value = e.target.value;

    if (value === "custom") {
      formik.setFieldValue("category", "");
    } else {
      formik.setFieldValue("category", value);
      setCustomCategory("");
    }
  };

  // Handle option category selection or custom category
  const handleOptionCategoryChange = (e) => {
    const value = e.target.value;

    if (value === "custom") {
      setNewOption({
        ...newOption,
        category: "",
        customCategory: "",
      });
    } else {
      setNewOption({
        ...newOption,
        category: value,
        customCategory: "",
      });
    }
  };

  // Handle custom category input
  const handleCustomCategoryChange = (e) => {
    const value = e.target.value;
    setCustomCategory(value);
    formik.setFieldValue("category", value);
  };

  // Handle custom option category input
  const handleCustomOptionCategoryChange = (e) => {
    const value = e.target.value;
    setNewOption({
      ...newOption,
      category: value,
      customCategory: value,
    });
  };

  // Toggle option selection
  const handleOptionToggle = (optionId) => {
    if (selectedOptions.includes(optionId)) {
      setSelectedOptions(selectedOptions.filter((id) => id !== optionId));
    } else {
      setSelectedOptions([...selectedOptions, optionId]);
    }
  };

  // Handle new option form fields
  const handleOptionInputChange = (e) => {
    const { name, value } = e.target;
    setNewOption({ ...newOption, [name]: value });
  };

  // Add a choice to the new option
  const addChoice = () => {
    if (!optionChoices.trim()) return;

    const choicesArray = optionChoices
      .split(",")
      .map((choice) => choice.trim())
      .filter((choice) => choice.length > 0);

    setNewOption({
      ...newOption,
      choices: [...newOption.choices, ...choicesArray],
    });
    setOptionChoices("");
  };

  // Save the new option
  const saveNewOption = async () => {
    if (!newOption.name || newOption.choices.length === 0) {
      setError("Option name and at least one choice are required");
      return;
    }

    if (!restaurantId) {
      setError("Please select a restaurant first");
      return;
    }

    if (!newOption.category) {
      setError("Option category is required");
      return;
    }

    try {
      setLoading(true);

      // Create the option in the database
      const createdOption = await optionService.addOption({
        name: newOption.name,
        choices: newOption.choices,
        additionalPrice: parseFloat(newOption.additionalPrice) || 0,
        restaurant: restaurantId,
        category: newOption.category,
      });

      // Add to available options
      setAvailableOptions([...availableOptions, createdOption]);

      // Add to selected options
      setSelectedOptions([...selectedOptions, createdOption._id]);

      // If we added a new category, add it to our option categories list
      if (!optionCategories.includes(newOption.category)) {
        setOptionCategories([...optionCategories, newOption.category]);
      }

      // Reset form
      setNewOption({
        name: "",
        choices: [],
        additionalPrice: 0,
        category: "",
        customCategory: "",
      });
      setOptionChoices("");
      setShowOptionForm(false);
      setLoading(false);
    } catch (err) {
      console.error("Error creating option:", err);
      setError(
        "Failed to create option. Please try again: " +
          (err.response?.data?.message || err.message)
      );
      setLoading(false);
    }
  };

  // Group options by category for display
  const groupedOptions = availableOptions.reduce((acc, option) => {
    // Ensure the category exists
    const category = option.category || "Uncategorized";

    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(option);
    return acc;
  }, {});

  return (
    <div className="add-food-page">
      <h1>Add New Food Item</h1>

      {error && <div className="error-message">{error}</div>}
      {success && (
        <div className="success-message">Food item added successfully!</div>
      )}

      {/* Restaurant Selection Dropdown */}
      <div className="restaurant-selector">
        <label htmlFor="restaurant">Select Restaurant</label>
        <select
          id="restaurant"
          value={restaurantId}
          onChange={(e) => handleRestaurantSelection(e.target.value)}
          disabled={loading || userRestaurants.length === 0}
          className={!restaurantId ? "input-error" : ""}
        >
          <option value="">-- Select a Restaurant --</option>
          {userRestaurants.map((restaurant) => (
            <option key={restaurant._id} value={restaurant._id}>
              {restaurant.name}
            </option>
          ))}
        </select>
        {!restaurantId && (
          <div className="error-text">Please select a restaurant</div>
        )}
      </div>

      <form onSubmit={formik.handleSubmit} className="add-food-form">
        <div className="form-columns">
          <div className="form-column">
            <div className="form-group">
              <label htmlFor="name">Food Name*</label>
              <input
                type="text"
                id="name"
                name="name"
                placeholder="Enter food item name"
                value={formik.values.name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={
                  formik.touched.name && formik.errors.name ? "input-error" : ""
                }
              />
              {formik.touched.name && formik.errors.name && (
                <div className="error-text">{formik.errors.name}</div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="description">Description*</label>
              <textarea
                id="description"
                name="description"
                placeholder="Describe this food item"
                rows="4"
                value={formik.values.description}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={
                  formik.touched.description && formik.errors.description
                    ? "input-error"
                    : ""
                }
              />
              {formik.touched.description && formik.errors.description && (
                <div className="error-text">{formik.errors.description}</div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="price">Price (USD)*</label>
              <input
                type="number"
                id="price"
                name="price"
                placeholder="0.00"
                step="0.01"
                min="0"
                value={formik.values.price}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={
                  formik.touched.price && formik.errors.price
                    ? "input-error"
                    : ""
                }
              />
              {formik.touched.price && formik.errors.price && (
                <div className="error-text">{formik.errors.price}</div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="category">Food Category*</label>
              <select
                id="category"
                name="category"
                value={formik.values.category}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={
                  formik.touched.category && formik.errors.category
                    ? "input-error"
                    : ""
                }
              >
                <option value="">Select a category</option>
                {categories.map((category, index) => (
                  <option key={index} value={category}>
                    {category}
                  </option>
                ))}
              </select>

              {formik.touched.category && formik.errors.category && (
                <div className="error-text">{formik.errors.category}</div>
              )}
            </div>

            <div className="form-group">
              <div className="checkbox-group">
                <p>Mark as Popular Item</p>
                <input
                  type="checkbox"
                  name="popular"
                  checked={formik.values.popular}
                  onChange={formik.handleChange}
                />
              </div>
            </div>
          </div>

          <div className="form-column">
            <div className="form-group">
              <label htmlFor="image">Food Image</label>
              <input
                type="file"
                id="image"
                name="image"
                accept="image/*"
                onChange={handleImageChange}
                className="file-input"
              />
              <div className="image-preview-container">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Food preview"
                    className="image-preview"
                  />
                ) : (
                  <div className="no-image">No image selected</div>
                )}
              </div>
            </div>

            <div className="form-group options-section">
              <label>Available Options</label>

              {/* Display options grouped by category with error handling */}
              <div className="options-container">
                {availableOptions.length > 0 ? (
                  Object.entries(groupedOptions).map(([category, options]) => (
                    <div key={category} className="option-category-group">
                      <h5 className="option-category-title">{category}</h5>
                      {options.map((option) => (
                        <div key={option._id} className="option-item">
                          <label className="checkbox-label">
                            <input
                              type="checkbox"
                              checked={selectedOptions.includes(option._id)}
                              onChange={() => handleOptionToggle(option._id)}
                            />
                            <span className="option-name">{option.name}</span>
                          </label>
                          <div className="option-details">
                            <span className="option-choices">
                              {Array.isArray(option.choices)
                                ? option.choices.join(", ")
                                : "No choices available"}
                            </span>
                            {option.additionalPrice > 0 && (
                              <span className="option-price">
                                +${option.additionalPrice.toFixed(2)}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ))
                ) : (
                  <div className="no-options">
                    {restaurantId
                      ? "No options available for this restaurant"
                      : "Please select a restaurant first"}
                  </div>
                )}
              </div>

              {restaurantId &&
                (!showOptionForm ? (
                  <button
                    type="button"
                    className="add-option-btn"
                    onClick={() => setShowOptionForm(true)}
                  >
                    + Add New Option
                  </button>
                ) : (
                  <div className="new-option-form">
                    <h4>Create New Option</h4>
                    <div className="form-group">
                      <label>Option Name</label>
                      <input
                        type="text"
                        name="name"
                        placeholder="e.g. Size, Toppings, Spice Level"
                        value={newOption.name}
                        onChange={handleOptionInputChange}
                      />
                    </div>

                    {/* Option category - dropdown or custom */}
                    <div className="form-group">
                      <label>Option Category</label>
                      <select
                        name="category"
                        value={
                          optionCategories.includes(newOption.category)
                            ? newOption.category
                            : newOption.customCategory
                            ? "custom"
                            : ""
                        }
                        onChange={handleOptionCategoryChange}
                        className="option-category-select"
                      >
                        <option value="">Select a category</option>
                        {optionCategories.map((category, index) => (
                          <option key={index} value={category}>
                            {category}
                          </option>
                        ))}
                        <option value="custom">Add custom category</option>
                      </select>

                      {(!optionCategories.includes(newOption.category) ||
                        newOption.category === "custom") && (
                        <input
                          type="text"
                          name="customCategory"
                          placeholder="Enter custom option category"
                          className="custom-category-input"
                          value={newOption.customCategory}
                          onChange={handleCustomOptionCategoryChange}
                        />
                      )}
                    </div>

                    <div className="form-group">
                      <label>Choices (comma separated)</label>
                      <div className="choices-input-group">
                        <input
                          type="text"
                          placeholder="e.g. Small, Medium, Large"
                          value={optionChoices}
                          onChange={(e) => setOptionChoices(e.target.value)}
                        />
                        <button
                          type="button"
                          onClick={addChoice}
                          className="add-choice-btn"
                        >
                          Add
                        </button>
                      </div>

                      {newOption.choices.length > 0 && (
                        <div className="choices-preview">
                          {newOption.choices.map((choice, idx) => (
                            <span key={idx} className="choice-tag">
                              {choice}
                              <button
                                type="button"
                                onClick={() => {
                                  const updatedChoices = [...newOption.choices];
                                  updatedChoices.splice(idx, 1);
                                  setNewOption({
                                    ...newOption,
                                    choices: updatedChoices,
                                  });
                                }}
                                className="remove-choice-btn"
                              >
                                ×
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="form-group">
                      <label>Additional Price (if applicable)</label>
                      <input
                        type="number"
                        name="additionalPrice"
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                        value={newOption.additionalPrice}
                        onChange={handleOptionInputChange}
                      />
                    </div>

                    <div className="option-form-actions">
                      <button
                        type="button"
                        onClick={saveNewOption}
                        className="save-option-btn"
                        disabled={
                          !newOption.name ||
                          !newOption.category ||
                          newOption.choices.length === 0
                        }
                      >
                        Save Option
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowOptionForm(false);
                          setNewOption({
                            name: "",
                            choices: [],
                            additionalPrice: 0,
                            category: "",
                            customCategory: "",
                          });
                          setOptionChoices("");
                        }}
                        className="cancel-option-btn"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button
            type="submit"
            className="submit-btn"
            disabled={loading || !restaurantId}
          >
            {loading ? "Adding..." : "Add Food Item"}
          </button>
          <button
            type="button"
            className="reset-btn"
            onClick={() => {
              formik.resetForm();
              setImagePreview(null);
              setSelectedOptions([]);
              setError(null);
              setSuccess(false);
            }}
            disabled={loading}
          >
            Reset Form
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddFood;
