import api from "./api";

const deliveryService = {
  // Get all deliveries with optional filters
  // getDeliveries: async (filters = {}) => {
  //   try {
  //     // Build query parameters
  //     const queryParams = new URLSearchParams();

  //     if (filters.city) queryParams.append("city", filters.city);
  //     if (filters.status) queryParams.append("status", filters.status);
  //     if (filters.restaurantId)
  //       queryParams.append("restaurantId", filters.restaurantId);

  //     // Add optional date range filters if provided
  //     if (filters.startDate) queryParams.append("startDate", filters.startDate);
  //     if (filters.endDate) queryParams.append("endDate", filters.endDate);

  //     // Add skipCustomerPopulate option to avoid schema errors
  //     if (filters.skipCustomerPopulate)
  //       queryParams.append("skipCustomerPopulate", "true");

  //     const query = queryParams.toString() ? `?${queryParams.toString()}` : "";
  //     const response = await api.get(`/orders${query}`);
  //     return response.data;
  //   } catch (error) {
  //     console.error("Error fetching deliveries:", error);
  //     throw new Error(
  //       "Error fetching deliveries. Please check server connection."
  //     );
  //   }
  // },

  // In the getDeliveries function, modify to always include skipCustomerPopulate
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

      // Always include skipCustomerPopulate to avoid schema errors
      queryParams.append("skipCustomerPopulate", "true");

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

  getDeliveriesByCity: async (city, options = {}) => {
    try {
      // Build query parameters for options
      const queryParams = new URLSearchParams();

      // Add skipCustomerPopulate option to avoid schema errors
      if (options.skipCustomerPopulate)
        queryParams.append("skipCustomerPopulate", "true");

      const query = queryParams.toString() ? `?${queryParams.toString()}` : "";
      const response = await api.get(`/orders/by-city/${city}${query}`);
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

  getDeliveriesByRestaurant: async (restaurantId, options = {}) => {
    try {
      // Build query parameters for options
      const queryParams = new URLSearchParams();

      // Add skipCustomerPopulate option to avoid schema errors
      if (options.skipCustomerPopulate)
        queryParams.append("skipCustomerPopulate", "true");

      const query = queryParams.toString() ? `?${queryParams.toString()}` : "";
      const response = await api.get(
        `/deliveries/restaurant/${restaurantId}${query}`
      );
      return response.data;
    } catch (error) {
      console.error(
        `Error fetching deliveries for restaurant ${restaurantId}:`,
        error
      );
      throw error;
    }
  },

  // If no orders are returned by city, this backup method will fetch them by restaurant's city
  getDeliveriesByCityViaRestaurants: async (city, options = {}) => {
    try {
      // First get all restaurants in this city
      const restaurantsResponse = await api.get(`/restaurants?city=${city}`);
      const restaurants = restaurantsResponse.data.data || [];

      if (restaurants.length === 0) {
        console.log(`No restaurants found in city: ${city}`);
        return { success: true, count: 0, data: [] };
      }

      // Get restaurant IDs
      const restaurantIds = restaurants.map((restaurant) => restaurant._id);

      // Now get deliveries for these restaurants
      const queryParams = new URLSearchParams();
      queryParams.append("restaurants", restaurantIds.join(","));

      // Add skipCustomerPopulate option to avoid schema errors
      if (options.skipCustomerPopulate)
        queryParams.append("skipCustomerPopulate", "true");

      const query = queryParams.toString() ? `?${queryParams.toString()}` : "";
      const response = await api.get(`/orders${query}`);
      return response.data;
    } catch (error) {
      console.error(
        `Error fetching deliveries via restaurants for city ${city}:`,
        error
      );
      throw new Error(
        `Error fetching deliveries for ${city}: ${error.message}`
      );
    }
  },
};

export default deliveryService;
