// Add this to your frontend services (e.g., cityService.js)
import api from "./api";

const cityService = {
  getCities: async () => {
    try {
      const response = await api.get("/cities");
      return response.data.data;
    } catch (error) {
      console.error("Error fetching cities:", error);
      throw new Error("Error fetching cities");
    }
  },

  getCityById: async (id) => {
    try {
      const response = await api.get(`/cities/${id}`);
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching city ${id}:`, error);
      throw new Error(`Error fetching city ${id}`);
    }
  },
};

export default cityService;
