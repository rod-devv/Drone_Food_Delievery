import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";
import restaurantService from "../../services/restaurantService";
import deliveryService from "../../services/deliveryService";
import "./DataAnalytics.css";

// Custom tooltip component for better details
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    // Check what kind of data we're dealing with
    const data = payload[0].payload;

    // Handle different chart types
    if (data.restaurants) {
      // For charts with restaurant lists
      // console.log("label: ", label);
      return (
        <div className="custom-tooltip">
          {/* <p className="label">{`${label}: ${payload[0].value}`}</p> */}
          <p className="label">{`${label || data.name}: ${
            payload[0].value
          }`}</p>
          <p className="intro">Restaurants:</p>
          <ul className="restaurant-list">
            {data.restaurants.slice(0, 5).map((restaurant, i) => (
              <li key={i}>{restaurant}</li>
            ))}
            {data.restaurants.length > 5 && (
              <li>...and {data.restaurants.length - 5} more</li>
            )}
          </ul>
        </div>
      );
    } else if (data.orders !== undefined) {
      // For order charts
      return (
        <div className="custom-tooltip">
          <p className="label">{`${data.name}`}</p>
          <p>{`Orders: ${data.orders}`}</p>
          {data.revenue && <p>{`Revenue: $${data.revenue.toFixed(2)}`}</p>}
          {data.city && <p>{`City: ${data.city}`}</p>}
        </div>
      );
    }

    // Default tooltip
    return (
      <div className="custom-tooltip">
        <p className="label">{`${label}: ${payload[0].value}`}</p>
      </div>
    );
  }

  return null;
};

function DataAnalytics() {
  // State for analytics data
  const [cities, setCities] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [orders, setOrders] = useState([]);
  const [cityRestaurants, setCityRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter states
  const [selectedCity, setSelectedCity] = useState("");
  const [orderStatus, setOrderStatus] = useState("delivered");

  // Charts data
  const [restaurantsByCity, setRestaurantsByCity] = useState([]);
  const [restaurantsByRating, setRestaurantsByRating] = useState([]);
  const [priceRangeDistribution, setPriceRangeDistribution] = useState([]);
  const [deliveryTimeDistribution, setDeliveryTimeDistribution] = useState([]);
  const [ordersByRestaurant, setOrdersByRestaurant] = useState([]);

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Get all cities
        const citiesData = await restaurantService.getCities();
        setCities(citiesData);

        // Get all restaurants
        const restaurantsData = await restaurantService.getRestaurants();
        setRestaurants(restaurantsData);

        // Process restaurant data for charts
        processRestaurantData(restaurantsData.restaurants);

        // Set default city if available
        if (citiesData.length > 0) {
          setSelectedCity(citiesData[0]);
        }

        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load analytics data. Please try again later.");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Fetch filtered data when city or status changes
  useEffect(() => {
    if (selectedCity) {
      fetchCityData();
      fetchOrderData();
    }
  }, [selectedCity, orderStatus]);

  // Process restaurant data for visualizations with restaurant names
  const processRestaurantData = (data) => {
    // 1. Restaurants by city with names
    const cityDetails = {};
    data.forEach((restaurant) => {
      if (!cityDetails[restaurant.city]) {
        cityDetails[restaurant.city] = [];
      }
      cityDetails[restaurant.city].push(restaurant.name);
    });

    const cityData = Object.keys(cityDetails).map((city) => ({
      name: city,
      value: cityDetails[city].length,
      restaurants: cityDetails[city],
    }));

    setRestaurantsByCity(cityData);

    // 2. Restaurants by rating with names
    const ratingGroups = {
      "5 ⭐": [],
      "4.5 ⭐": [],
      "4 ⭐": [],
      "3.5 ⭐": [],
      "3 ⭐": [],
      "2.5 ⭐": [],
      "2 ⭐": [],
      "1.5 ⭐": [],
      "1 ⭐": [],
      "0.5 ⭐": [],
      "0 ⭐": [],
    };

    data.forEach((restaurant) => {
      const roundedRating = Math.round(restaurant.rating * 2) / 2;
      const ratingKey = `${roundedRating} ⭐`;
      if (ratingGroups[ratingKey]) {
        ratingGroups[ratingKey].push(restaurant.name);
      }
    });

    const ratingData = Object.keys(ratingGroups)
      .filter((key) => ratingGroups[key].length > 0)
      .map((rating) => ({
        name: rating,
        value: ratingGroups[rating].length,
        restaurants: ratingGroups[rating],
      }));

    setRestaurantsByRating(ratingData);

    // 3. Price range distribution with restaurant names
    const priceGroups = { $: [], $$: [], $$$: [], $$$$: [] };
    data.forEach((restaurant) => {
      if (priceGroups[restaurant.priceRange]) {
        priceGroups[restaurant.priceRange].push(restaurant.name);
      }
    });

    const priceData = Object.keys(priceGroups).map((price) => ({
      name: price,
      value: priceGroups[price].length,
      restaurants: priceGroups[price],
    }));

    setPriceRangeDistribution(priceData);

    // 4. Delivery time distribution with restaurant names
    const deliveryGroups = {};
    data.forEach((restaurant) => {
      const time = restaurant.deliveryTime;
      if (!deliveryGroups[time]) {
        deliveryGroups[time] = [];
      }
      deliveryGroups[time].push(restaurant.name);
    });

    const deliveryData = Object.keys(deliveryGroups).map((time) => ({
      name: time,
      value: deliveryGroups[time].length,
      restaurants: deliveryGroups[time],
    }));

    setDeliveryTimeDistribution(deliveryData);
  };

  const fetchCityData = async () => {
    try {
      if (!selectedCity) return;

      const cityRestaurantsData = await restaurantService.getRestaurantsByCity(
        selectedCity
      );
      setCityRestaurants(cityRestaurantsData);
    } catch (err) {
      console.error(`Error fetching restaurants for ${selectedCity}:`, err);
      setError(`Failed to load restaurants for ${selectedCity}.`);
    }
  };

  const fetchOrderData = async () => {
    try {
      if (!selectedCity) return;

      console.log(
        `-- Fetching orders for ${selectedCity} with status ${orderStatus}`
      );
      // Get orders filtered by status and city
      const ordersData = await deliveryService.getDeliveries({
        city: selectedCity,
        status: orderStatus,
      });
      // console.log("--!!! ", ordersData);

      setOrders(ordersData);
      // console.log("---- 1------");

      // Process orders by restaurant
      processOrdersData(ordersData.data);

      // console.log("---- 21111111------");
    } catch (err) {
      console.error(`Error fetching orders for ${selectedCity}:`, err);
      setError(`Failed to load orders for ${selectedCity}.`);
    }
  };

  // Process orders data for visualizations with detailed restaurant info
  const processOrdersData = (data) => {
    // Restaurant order counts with additional details
    const restaurantOrders = {};
    // console.log("---- 1------");
    data.forEach((order) => {
      // Get restaurant details

      // console.log("---- 2------");
      const restaurantId = order.restaurant._id || order.restaurant;

      // console.log("---- 3------", restaurants);
      // Find restaurant in our restaurants list
      const restaurantData =
        restaurants.restaurants.find((r) => r._id === restaurantId) || {};

      // console.log("---- 4 ------", restaurantData);
      const restaurantName = restaurantData.name || "Unknown Restaurant";
      const restaurantCity = restaurantData.city || "Unknown City";

      // console.log("---- 4 ------");
      if (!restaurantOrders[restaurantName]) {
        restaurantOrders[restaurantName] = {
          name: restaurantName,
          orders: 0,
          city: restaurantCity,
          revenue: 0,
          id: restaurantId,
        };
      }
      // console.log("---- 5 ------");
      restaurantOrders[restaurantName].orders++;

      // console.log("---- 6 ------");
      // Add order total to revenue if available
      if (order.totalAmount) {
        restaurantOrders[restaurantName].revenue += parseFloat(
          order.totalAmount
        );
      }
      // console.log("---- 7 ------");
    });

    // console.log("---- 8 ------");
    // Convert to array for chart
    const orderData = Object.values(restaurantOrders);

    // console.log("---- 9 ------");
    // Sort by order count (descending)
    orderData.sort((a, b) => b.orders - a.orders);

    // console.log("---- 10 ------");
    // Take top 10
    setOrdersByRestaurant(orderData.slice(0, 10));
  };

  // Handle filter changes
  const handleCityChange = (e) => {
    setSelectedCity(e.target.value);
  };

  const handleStatusChange = (e) => {
    setOrderStatus(e.target.value);
  };

  // Colors for charts
  const COLORS = [
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#8884d8",
    "#82ca9d",
    "#ffc658",
    "#A4DE6C",
    "#8DD1E1",
    "#D0ED57",
  ];

  if (loading) return <div className="loading">Loading analytics data...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="data-analytics">
      <h1>Platform Analytics</h1>

      <section className="analytics-section">
        <h2>Restaurant Distribution</h2>
        <div className="charts-container">
          <div className="chart-wrapper">
            <h3>Restaurants by City</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={restaurantsByCity}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar
                  dataKey="value"
                  name="Number of Restaurants"
                  fill="#8884d8"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-wrapper">
            <h3>Restaurant Ratings</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={restaurantsByRating}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar
                  dataKey="value"
                  name="Number of Restaurants"
                  fill="#82ca9d"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="charts-container">
          <div className="chart-wrapper">
            <h3>Price Range Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={priceRangeDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {priceRangeDistribution.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-wrapper">
            <h3>Delivery Time Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={deliveryTimeDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar
                  dataKey="value"
                  name="Number of Restaurants"
                  fill="#ffc658"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      <section className="analytics-section">
        <h2>Order Analytics</h2>

        <div className="filters">
          <div className="filter-group">
            <label>Filter by City:</label>
            <select value={selectedCity} onChange={handleCityChange}>
              <option value="">All Cities</option>
              {cities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Order Status:</label>
            <select value={orderStatus} onChange={handleStatusChange}>
              <option value="delivered">Past (Delivered)</option>
              <option value="preparing">Current (Preparing)</option>
            </select>
          </div>
        </div>

        <div className="chart-wrapper full-width">
          <h3>Top Restaurants by Order Volume</h3>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={ordersByRestaurant} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis
                dataKey="name"
                type="category"
                tick={{ fontSize: 12 }}
                width={150}
                tickFormatter={(value) => {
                  // Limit the length of restaurant names for display
                  return value.length > 18
                    ? `${value.substring(0, 18)}...`
                    : value;
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="orders" name="Number of Orders" fill="#FF8042" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}

export default DataAnalytics;
