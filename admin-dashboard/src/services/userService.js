import api from "./api";

const userService = {
  // Get all users (for admin dashboard)
  getUsers: async () => {
    try {
      const response = await api.get("/users/list");
      return response.data;
    } catch (error) {
      console.error("Error fetching users:", error);
      throw new Error("Error fetching users. Please check server connection.");
    }
  },

  getUserById: async (userId) => {
    try {
      const response = await api.get(`/users/${userId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching user:", error);
      throw new Error("Error fetching user details.");
    }
  },

  createUser: async (userData) => {
    try {
      const response = await api.post("/users/register", userData);
      return response.data;
    } catch (error) {
      console.error("Error creating user:", error);
      throw new Error("Error creating user. Please check the form data.");
    }
  },

  updateUser: async (userId, userData) => {
    try {
      const response = await api.put(`/users/${userId}`, userData);
      return response.data;
    } catch (error) {
      console.error("Error updating user:", error);
      throw new Error("Error updating user details.");
    }
  },

  // Update user role (for admin dashboard)
  updateUserRole: async (userId, role) => {
    try {
      const response = await api.patch(`/users/${userId}/role`, { role });
      return response.data;
    } catch (error) {
      console.error("Error updating user role:", error);
      throw new Error(
        "Error updating user role. Please check server connection."
      );
    }
  },

  deleteUser: async (userId) => {
    try {
      const response = await api.delete(`/users/${userId}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting user:", error);
      throw new Error("Error deleting user. Please check server connection.");
    }
  },

  // User authentication
  login: async (credentials) => {
    try {
      const response = await api.post("/users/login", credentials);
      console.log("Login response:", response.data);

      if (response.data.token) {
        console.log("User role========:", response.data.role);
        // Store token
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("userRole", response.data.role);
        api.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${response.data.token}`;

        // Fetch user profile to get role
        try {
          const profileResponse = await api.get("/users/profile");

          // Store user info including role
          localStorage.setItem("user", JSON.stringify(profileResponse.data));

          // Return merged data
          return {
            ...response.data,
            ...profileResponse.data, // This should include the role
          };
        } catch (profileError) {
          console.error("Error fetching profile after login:", profileError);
          // If we can't get the profile, still return login data
          return response.data;
        }
      }

      return response.data;
    } catch (error) {
      console.error("Login error:", error);
      throw new Error("Login failed. Please check your credentials.");
    }
  },

  logout: () => {
    // Remove all authentication-related items
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userId");
    
    // Clear the authorization header
    delete api.defaults.headers.common["Authorization"];
    
    console.log("User data cleared from localStorage");
  },

  // Get the current user profile
  getProfile: async () => {
    try {
      const response = await api.get("/users/profile");
      return response.data;
    } catch (error) {
      console.error("Error fetching profile:", error);
      throw new Error("Error fetching user profile.");
    }
  },

  // Update user profile
  updateProfile: async (profileData) => {
    try {
      const response = await api.put("/users/profile", profileData);
      return response.data;
    } catch (error) {
      console.error("Error updating profile:", error);
      throw new Error("Error updating user profile.");
    }
  },

  // Change password
  changePassword: async (passwordData) => {
    try {
      const response = await api.put("/users/change-password", passwordData);
      return response.data;
    } catch (error) {
      console.error("Error changing password:", error);
      throw new Error(
        "Error changing password. Please check your current password."
      );
    }
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem("token");
  },

  // Check if user is admin
  isAdmin: async () => {
    try {
      const user = await userService.getProfile();
      return user && user.role === "admin";
    } catch (error) {
      return false;
    }
  },

  getUserRole: () => {
    // Get user role from localStorage directly (synchronously)
    const userRole = localStorage.getItem("userRole");
    return userRole || null;
  },

  getUserRestaurant: async () => {
    try {
      // Get profile which should include restaurant ID for restaurateurs
      const profile = await userService.getProfile();
      console.log("User profile1111111111111111:", profile);
      if (profile && profile.restaurantId) {
        // Get restaurant details
        const restaurant = await api.get(
          `/restaurants/${profile.restaurantId}`
        );

        return restaurant.data;
      }
      return null;
    } catch (error) {
      console.error("Error getting user restaurant:", error);
      return null;
    }
  },
};

export default userService;
