import api from "./api";

const deliveryService = {
  // Get all deliveries with optional filters
  getDeliveries: async (filters = {}) => {
    try {
      // Build query parameters
      const queryParams = new URLSearchParams();

      if (filters.city) queryParams.append("city", filters.city);
      if (filters.status) queryParams.append("status", filters.status);
      if (filters.restaurantId)
        queryParams.append("restaurantId", filters.restaurantId);

      // Add optional date range filters if provided
      if (filters.startDate) queryParams.append("startDate", filters.startDate);
      if (filters.endDate) queryParams.append("endDate", filters.endDate);

      const query = queryParams.toString() ? `?${queryParams.toString()}` : "";
      const response = await api.get(`/orders${query}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching deliveries:", error);
      throw new Error(
        "Error fetching deliveries. Please check server connection."
      );
    }
  },

  getDeliveriesByCity: async (city) => {
    try {
      const response = await api.get(`/orders/by-city/${city}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching deliveries for city ${city}:`, error);
      throw new Error(
        `Error fetching deliveries for ${city}: ${error.message}`
      );
    }
  },

  // Get a specific delivery by ID
  getDeliveryById: async (id) => {
    try {
      const response = await api.get(`/orders/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching delivery:", error);
      throw new Error("Error fetching delivery details.");
    }
  },

  // Update delivery status
  updateDeliveryStatus: async (deliveryId, status) => {
    try {
      const response = await api.patch(`/orders/${deliveryId}/status`, {
        status,
      });
      return response.data;
    } catch (error) {
      console.error("Error updating delivery status:", error);
      throw new Error("Error updating delivery status.");
    }
  },

  // Update delivery location
  updateDeliveryLocation: async (deliveryId, coordinates) => {
    try {
      const response = await api.patch(
        `/orders/${deliveryId}/location`,
        coordinates
      );
      return response.data;
    } catch (error) {
      console.error("Error updating delivery location:", error);
      throw new Error("Error updating delivery location.");
    }
  },

  // Create a new delivery
  createDelivery: async (deliveryData) => {
    try {
      const response = await api.post("/orders", deliveryData);
      return response.data;
    } catch (error) {
      console.error("Error creating delivery:", error);
      throw new Error("Error creating delivery.");
    }
  },

  // Get delivery statistics (for dashboard)
  getDeliveryStats: async (timeRange = "week") => {
    try {
      const response = await api.get(`/orders/stats?timeRange=${timeRange}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching delivery statistics:", error);
      throw new Error("Error fetching delivery statistics.");
    }
  },

  getDeliveriesByRestaurant: async (restaurantId) => {
    try {
      const response = await api.get(`/deliveries/restaurant/${restaurantId}`);
      return response;
    } catch (error) {
      console.error("Error fetching restaurant deliveries:", error);
      throw error;
    }
  },
};

export default deliveryService;
