import { createContext, useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import api from "./api";

const AppContext = createContext();

export function useApp() {
  return useContext(AppContext);
}

export function AppProvider({ children }) {
  const [selectedCity, setSelectedCity] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [userAddress, setUserAddress] = useState("");
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize token from localStorage
  const [token, setToken] = useState(() => localStorage.getItem("token") || "");
  const [selectedLocation, setSelectedLocation] = useState(null);

  const [cart, setCart] = useState({
    items: [],
    total: 0,
    deliveryFee: "$0.00",
    restaurantName: "",
  });

  const [restaurantId, setRestaurantId] = useState("");

  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  // const url = "http://localhost:5000";
  const url = import.meta.env.VITE_API_URL || "http://localhost:5000";

  // CRITICAL: Check for token and authenticate user when app loads
  useEffect(() => {
    const verifyAndLoadUser = async () => {
      const storedToken = localStorage.getItem("token");
      // console.log("Stored token:", storedToken);

      if (storedToken) {
        setToken(storedToken); // Set token in state
        api.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`;

        try {
          // Fetch user profile with the token
          const response = await api.get(`${url}/api/users/profile`);
          // console.log("User data loaded:", response.data);

          if (response.data) {
            // Set user data in state
            setUser({
              ...response.data,
              token: storedToken, // Ensure token is included
            });
          }
        } catch (error) {
          console.error("Error verifying token:", error);
          // If token is invalid, remove it
          if (error.response && [401, 403].includes(error.response.status)) {
            localStorage.removeItem("token");
            setToken("");
            delete api.defaults.headers.common["Authorization"];
          }
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };

    verifyAndLoadUser();
  }, [url]); // Only run once on mount

  // Ensure API always has the latest token in headers
  useEffect(() => {
    if (token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common["Authorization"];
    }
  }, [token]);

  const login = (userData) => {
    // console.log("Login with userData:", userData);

    // Extract token from userData
    if (userData.token) {
      // Set token in localStorage
      localStorage.setItem("token", userData.token);

      // Set token in state
      setToken(userData.token);

      // Set token in API headers
      api.defaults.headers.common["Authorization"] = `Bearer ${userData.token}`;
    }

    // Set user data in state
    setUser(userData);

    // Close modal
    setIsLoginModalOpen(false);
  };

  const signup = (userData) => {
    // console.log("Signup with userData:", userData);

    // Extract token from userData
    if (userData.token) {
      // Set token in localStorage
      localStorage.setItem("token", userData.token);

      // Set token in state
      setToken(userData.token);

      // Set token in API headers
      api.defaults.headers.common["Authorization"] = `Bearer ${userData.token}`;
    }

    // Set user data in state
    setUser(userData);

    // Close modal
    setIsSignupModalOpen(false);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("token");
    setToken("");
    delete api.defaults.headers.common["Authorization"];
    navigate("/");
  };

  const getRestaurantById = async (id) => {
    try {
      const response = await api.get(`/restaurants/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching restaurant:", error);
      throw new Error("Error fetching restaurant details");
    }
  };

  const getCities = async () => {
    try {
      const response = await api.get("/cities");
      return response.data.data;
    } catch (error) {
      console.error("Error fetching cities:", error);
      throw new Error("Error fetching cities");
    }
  };

  const getCityById = async (id) => {
    try {
      // console.log("id ==", id);
      const response = await api.get(`/cities/${id}`);
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching city ${id}:`, error);
      throw new Error(`Error fetching city ${id}`);
    }
  };

  const getRestaurantsByCity = async (cityId) => {
    try {
      const response = await api.get(`/restaurants/by-city/${cityId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching restaurants for city ${cityId}:`, error);
      throw new Error(
        `Error fetching restaurants for city ${cityId}: ${error.message}`
      );
    }
  };

  const getRestaurants = async (id) => {
    try {
      const response = await api.get("/restaurants");
      return response.data;
    } catch (error) {
      console.error("Error fetching restaurants:", error);
      throw new Error("Error fetching restaurants: " + error.message);
    }
  };

  const getAllOptions = async () => {
    try {
      const response = await api.get("/options");
      return response.data;
    } catch (error) {
      console.error("Error fetching options:", error);
      throw error;
    }
  };

  const value = {
    selectedCity,
    setSelectedCity,
    selectedCategory,
    setSelectedCategory,
    userAddress,
    setUserAddress,
    isLoginModalOpen,
    setIsLoginModalOpen,
    isSignupModalOpen,
    setIsSignupModalOpen,
    user,
    login,
    logout,
    signup,
    url,
    setToken,
    token,
    cart,
    setCart,
    setRestaurantId,
    restaurantId,
    selectedLocation,
    setSelectedLocation,
    getRestaurantById,
    getCities,
    getCityById,
    getRestaurants,
    getAllOptions,
    isLoading,
    getRestaurantsByCity,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
