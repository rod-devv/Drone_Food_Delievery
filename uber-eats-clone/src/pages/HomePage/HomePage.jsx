import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../../context/AppContext";
import Map from "../../components/Map/Map";
import SearchBar from "../../components/SearchBar/SearchBar";
import "./HomePage.css";

const HomePage = () => {
  const navigate = useNavigate();
  const { setSelectedCity, getCities } = useApp();
  const [cities, setCities] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Transform API city data to the expected format
  const transformCityData = (apiCity) => {
    return {
      id: apiCity._id || apiCity.id,
      name: apiCity.name,
      imageUrl: apiCity.imageUrl || "/images/cities/placeholder.jpg",
      // Handle various coordinate formats
      coordinates: Array.isArray(apiCity.coordinates)
        ? apiCity.coordinates
        : apiCity.location && apiCity.location.coordinates
        ? apiCity.location.coordinates
        : [apiCity.longitude || 0, apiCity.latitude || 0],
    };
  };

  const handleSearch = (query) => {
    if (!query) {
      setSearchResults(cities);
      return;
    }

    const filtered = cities.filter((city) =>
      city.name.toLowerCase().includes(query.toLowerCase())
    );
    setSearchResults(filtered);
  };

  const handleCityClick = (city) => {
    setSelectedCity(city);
    // Use either id or _id, whichever exists
    const cityId = city.id || city._id;
    navigate(`/city/${cityId}`);
  };

  const handleMapMarkerClick = (marker) => {
    // Find the city by comparing coordinates
    const city = cities.find((c) => {
      if (Array.isArray(c.coordinates)) {
        // Array format [longitude, latitude]
        return (
          c.coordinates[0] === marker.longitude &&
          c.coordinates[1] === marker.latitude
        );
      } else if (typeof c.coordinates === "object") {
        // Object format {longitude, latitude} or {lng, lat}
        const cityLng = c.coordinates.longitude || c.coordinates.lng;
        const cityLat = c.coordinates.latitude || c.coordinates.lat;
        return cityLng === marker.longitude && cityLat === marker.latitude;
      }
      return false;
    });

    if (city) {
      handleCityClick(city);
    }
  };

  useEffect(() => {
    const fetchCities = async () => {
      try {
        setLoading(true);
        const response = await getCities();
        // console.log("Cities fetched:", response);

        // Debug the first city's coordinates
        if (Array.isArray(response) && response.length > 0) {
          // console.log("First city data:", response[0]);
          // console.log("First city coordinates:", response[0].coordinates);
        }

        if (Array.isArray(response)) {
          const transformedCities = response.map(transformCityData);
          // console.log("Transformed cities:", transformedCities);
          setCities(transformedCities);
          setSearchResults(transformedCities);
        } else {
          console.error("Invalid cities data format:", response);
          setError("Invalid cities data received");
        }
      } catch (error) {
        console.error("Error fetching cities:", error);
        setError("Failed to load cities. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchCities();
  }, [getCities]);

  return (
    <div className="home-page">
      <div className="hero-section">
        <div className="hero-section-content">
          <h1>Order food to your door</h1>
          <SearchBar
            placeholder="Search for a city..."
            onSearch={handleSearch}
            className="search-bar"
          />
        </div>
      </div>

      {loading && <div className="loading">Loading cities...</div>}
      {error && <div className="error-message">{error}</div>}

      <div className="map-section">
        <h2>Select a city on the map</h2>
        <Map
          initialViewport={{
            latitude: 39.8283,
            longitude: -98.5795,
            zoom: 3.5,
          }}
          markers={cities
            .filter((city) => {
              // Filter out cities without valid coordinates
              const hasCoordinates =
                city.coordinates &&
                (Array.isArray(city.coordinates) ||
                  (typeof city.coordinates === "object" &&
                    "latitude" in city.coordinates &&
                    "longitude" in city.coordinates));

              if (!hasCoordinates) {
                console.warn(
                  `City ${city.name} has invalid coordinates:`,
                  city.coordinates
                );
              }
              return hasCoordinates;
            })
            .map((city) => {
              // Handle different coordinate formats
              let longitude, latitude;

              if (Array.isArray(city.coordinates)) {
                // Format: [longitude, latitude]
                longitude = city.coordinates[0];
                latitude = city.coordinates[1];
              } else if (typeof city.coordinates === "object") {
                // Format: {longitude, latitude} or {lng, lat}
                longitude = city.coordinates.longitude || city.coordinates.lng;
                latitude = city.coordinates.latitude || city.coordinates.lat;
              }

              return {
                longitude,
                latitude,
                data: city,
              };
            })}
          onMarkerClick={handleMapMarkerClick}
        />
      </div>

      <div className="cities-section">
        <h2>Popular Cities</h2>
        {searchResults.length > 0 ? (
          <div className="city-grid">
            {searchResults.map((city) => (
              <div
                key={city.id || city._id}
                className="city-card"
                onClick={() => handleCityClick(city)}
              >
                <div className="city-image">
                  <img
                    src={city.imageUrl || "/images/cities/placeholder.jpg"}
                    alt={city.name}
                  />
                </div>
                <h3>{city.name}</h3>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-results">
            {loading ? "Loading cities..." : "No cities found"}
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;
