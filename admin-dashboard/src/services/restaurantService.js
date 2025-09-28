import api from "./api";

// Using object syntax to match userService.js style
const restaurantService = {
  // Fetch all cities
  getCities: async () => {
    try {
      const response = await api.get("/restaurants/cities");
      return response.data;
    } catch (error) {
      console.error("Error fetching cities:", error);
      throw new Error("Error fetching cities. Please check server connection.");
    }
  },

  getRestaurants: async () => {
    try {
      const response = await api.get("/restaurants");
      return response.data;
    } catch (error) {
      console.error("Error fetching restaurants:", error);
      throw new Error("Error fetching restaurants: " + error.message);
    }
  },
  getUserRestaurants: async () => {
    try {
      const response = await api.get("/restaurants/my/restaurants");
      return response.data;
    } catch (error) {
      console.error("Error fetching user restaurants:", error);
      throw new Error("Error fetching user restaurants: " + error.message);
    }
  },

  // Add this new function to restaurantService.js right after getRestaurants
  getRestaurantsByCity: async (city) => {
    try {
      const response = await api.get(`/restaurants/by-city/${city}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching restaurants for city ${city}:`, error);
      throw new Error(
        `Error fetching restaurants for ${city}: ${error.message}`
      );
    }
  },

  getRestaurantById: async (id) => {
    try {
      const response = await api.get(`/restaurants/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching restaurant:", error);
      throw new Error("Error fetching restaurant details");
    }
  },

  addRestaurant: async (restaurantData) => {
    try {
      const response = await api.post("/restaurants", restaurantData);
      return response.data;
    } catch (error) {
      console.error("Error adding restaurant:", error);
      throw new Error("Error adding restaurant: " + error.message);
    }
  },

  updateRestaurant: async (restaurantId, restaurantData) => {
    try {
      const response = await api.put(
        `/restaurants/${restaurantId}`,
        restaurantData
      );
      return response.data;
    } catch (error) {
      console.error("Error updating restaurant:", error);
      throw new Error("Error updating restaurant: " + error.message);
    }
  },

  deleteRestaurant: async (restaurantId) => {
    try {
      const response = await api.delete(`/restaurants/${restaurantId}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting restaurant:", error);
      throw new Error("Error deleting restaurant: " + error.message);
    }
  },

  // New function to get restaurant categories
  getRestaurantCategories: async (restaurantId) => {
    try {
      const response = await api.get(`/restaurants/${restaurantId}/categories`);
      return response.data;
    } catch (error) {
      console.error(
        `Error fetching categories for restaurant ID ${restaurantId}:`,
        error
      );
      throw new Error(`Error fetching restaurant categories: ${error.message}`);
    }
  },

  // Add a single category to a restaurant menu
  addCategoryToRestaurant: async (restaurantId, categoryName) => {
    try {
      const response = await api.post(
        `/restaurants/${restaurantId}/categories`,
        { name: categoryName }
      );
      return response.data;
    } catch (error) {
      console.error(
        `Error adding category "${categoryName}" to restaurant:`,
        error
      );
      throw new Error(`Error adding category to restaurant: ${error.message}`);
    }
  },
};

export default restaurantService;
