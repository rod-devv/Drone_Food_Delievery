import api from "./api";

const foodService = {
  getAllFoods: async () => {
    try {
      const response = await api.get("/foods");
      return response.data;
    } catch (error) {
      console.error("Error fetching foods:", error);
      throw error;
    }
  },

  getFoodsByRestaurant: async (restaurantId) => {
    try {
      const response = await api.get(`/foods/restaurant/${restaurantId}`);
      return response.data;
    } catch (error) {
      console.error(
        `Error fetching foods for restaurant ${restaurantId}:`,
        error
      );
      return []; // Return empty array instead of throwing to prevent breaking the UI
    }
  },

  getFoodById: async (foodId) => {
    try {
      const response = await api.get(`/foods/${foodId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching food ${foodId}:`, error);
      throw error;
    }
  },

  addFood: async (foodData) => {
    try {
      const isFormData = foodData instanceof FormData;

      // THIS IS THE KEY FIX - don't manually set Content-Type for FormData
      const config = {};

      if (!isFormData) {
        // Only set Content-Type for JSON data
        config.headers = {
          "Content-Type": "application/json",
        };
      }

      // Debug what we're sending
      if (isFormData) {
        console.log("Sending FormData with entries:");
        for (let pair of foodData.entries()) {
          console.log(
            "-----------" +
              pair[0] +
              ": " +
              (pair[0] === "image" ? "[File Object]" : pair[1])
          );
        }
      }

      const response = await api.post("/foods", foodData, config);
      return response.data;
    } catch (error) {
      console.error("Error adding food:", error);
      throw error;
    }
  },
  updateFood: async (foodId, foodData) => {
    try {
      // Handle FormData or JSON
      const isFormData = foodData instanceof FormData;

      const config = {
        headers: {
          "Content-Type": isFormData
            ? "multipart/form-data"
            : "application/json",
        },
      };

      const response = await api.put(`/foods/${foodId}`, foodData, config);
      return response.data;
    } catch (error) {
      console.error(`Error updating food ${foodId}:`, error);
      throw error;
    }
  },

  deleteFood: async (foodId) => {
    try {
      const response = await api.delete(`/foods/${foodId}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting food ${foodId}:`, error);
      throw error;
    }
  },

  togglePopular: async (foodId, isPopular) => {
    try {
      const response = await api.patch(`/foods/${foodId}/popular`, {
        popular: isPopular,
      });
      return response.data;
    } catch (error) {
      console.error(`Error updating popular status for food ${foodId}:`, error);
      throw error;
    }
  },

  // Ensure uploadFoodImage is implemented correctly
  // Replace the uploadFoodImage function with this:
  uploadFoodImage: async (foodId, formData) => {
    try {
      const response = await api.post(
        `/foods/${foodId}/upload-image`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error uploading image:", error);
      throw error;
    }
  },
};

export default foodService;
