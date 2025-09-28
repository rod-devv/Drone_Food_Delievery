import api from "./api";

const optionService = {
  getAllOptions: async () => {
    try {
      const response = await api.get("/options");
      return response.data;
    } catch (error) {
      console.error("Error fetching options:", error);
      throw error;
    }
  },

  getOptionsByRestaurant: async (restaurantId) => {
    try {
      const response = await api.get(`/options/restaurant/${restaurantId}`);
      return response.data;
    } catch (error) {
      console.error(
        `Error fetching options for restaurant ${restaurantId}:`,
        error
      );
      return []; // Return empty array instead of throwing to prevent breaking the UI
    }
  },

  getOptionById: async (optionId) => {
    try {
      const response = await api.get(`/options/${optionId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching option ${optionId}:`, error);
      throw error;
    }
  },

  addOption: async (optionData) => {
    try {
      const response = await api.post("/options", optionData);
      return response.data;
    } catch (error) {
      console.error("Error adding option:", error);
      throw error;
    }
  },
  // Add this method to optionService
  createBatchOptions: async (optionsArray) => {
    try {
      // If it's just one option, use the existing addOption method
      if (optionsArray.length === 1) {
        return [await optionService.addOption(optionsArray[0])];
      }

      // For multiple options, use a batch endpoint
      const response = await api.post("/options/batch", {
        options: optionsArray,
      });
      return response.data;
    } catch (error) {
      console.error("Error creating multiple options:", error);
      throw error;
    }
  },

  updateOption: async (optionId, optionData) => {
    try {
      const response = await api.put(`/options/${optionId}`, optionData);
      return response.data;
    } catch (error) {
      console.error(`Error updating option ${optionId}:`, error);
      throw error;
    }
  },

  deleteOption: async (optionId) => {
    try {
      const response = await api.delete(`/options/${optionId}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting option ${optionId}:`, error);
      throw error;
    }
  },
};

export default optionService;
