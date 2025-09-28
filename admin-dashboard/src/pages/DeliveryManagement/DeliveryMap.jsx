import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import "./DeliveryMap.css";

const DeliveryMap = ({
  centerPosition,
  restaurants,
  deliveries,
  selectedDelivery,
  selectedRestaurant,
  onSelectDelivery,
  onSelectRestaurant,
  isRestaurateurView = false,
  filters,
}) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [mapInitialized, setMapInitialized] = useState(false);
  const markers = useRef({
    restaurants: [],
    deliveries: [],
    drones: {}, // Store drone markers by delivery ID
  });
  const [currentCenter, setCurrentCenter] = useState(centerPosition);
  const [styleIndex, setStyleIndex] = useState(15); // 4,7,12
  const intervalRef = useRef(null); // Reference for the interval timer

  const styles = [
    "mapbox://styles/mapbox/standard",
    "mapbox://styles/mapbox/light-v11",
    "mapbox://styles/mapbox/dark-v11",
    "mapbox://styles/mapbox/streets-v12",
    "mapbox://styles/mapbox/outdoors-v12", // good
    "mapbox://styles/mapbox/satellite-v9", /// -- arial
    "mapbox://styles/mapbox/satellite-streets-v12",
    "mapbox://styles/mapbox/navigation-day-v1",
    "mapbox://styles/mapbox/navigation-night-v1",
    "mapbox://styles/mapbox/monochrome",
    "mapbox://styles/mapbox/monochrome-dark",
    "mapbox://styles/mapbox/monochrome-light",
  ];

  // Calculate drone position along route
  const calculateDronePosition = (droneDelivery) => {
    if (!droneDelivery || !droneDelivery.startTime) return null;

    const now = new Date();
    const startTime = new Date(droneDelivery.startTime);

    // If drone hasn't started yet, return restaurant position
    if (now < startTime) {
      return droneDelivery.restaurantCoordinates;
    }

    const [startLng, startLat] = droneDelivery.restaurantCoordinates;
    const [endLng, endLat] = droneDelivery.destinationCoordinates;

    // Calculate total distance
    const totalDistance = calculateDistance(
      droneDelivery.restaurantCoordinates,
      droneDelivery.destinationCoordinates
    );

    // Calculate duration in milliseconds
    const speed = droneDelivery.speed || 10; // meters per second
    const durationMs = (totalDistance / speed) * 1000;
    const endTime = new Date(startTime.getTime() + durationMs);

    const elapsedMs = now.getTime() - startTime.getTime();
    const fraction = Math.min(elapsedMs / durationMs, 1);

    // Log only first calculation for each drone to avoid spam
    if (Math.round(elapsedMs / 1000) % 10 === 0) {
      console.log("🚁 Drone progress:", {
        elapsedMs: Math.round(elapsedMs / 1000) + "s",
        durationMs: Math.round(durationMs / 1000) + "s", 
        fraction: fraction.toFixed(2),
        speed: droneDelivery.speed + "m/s"
      });
    }

    // If delivery is complete, return the destination
    if (now >= endTime) {
      return droneDelivery.destinationCoordinates;
    }

    // Interpolate position
    const currentLng = startLng + (endLng - startLng) * fraction;
    const currentLat = startLat + (endLat - startLat) * fraction;

    return [currentLng, currentLat];
  };

  // Calculate distance between two coordinates in meters
  const calculateDistance = (coord1, coord2) => {
    if (!coord1 || !coord2) return 0;

    const [lng1, lat1] = coord1;
    const [lng2, lat2] = coord2;

    // Convert to radians
    const toRad = (deg) => (deg * Math.PI) / 180;
    const lat1Rad = toRad(lat1);
    const lat2Rad = toRad(lat2);
    const deltaLat = toRad(lat2 - lat1);
    const deltaLng = toRad(lng2 - lng1);

    // Haversine formula
    const a =
      Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
      Math.cos(lat1Rad) *
        Math.cos(lat2Rad) *
        Math.sin(deltaLng / 2) *
        Math.sin(deltaLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const R = 6371000; // Earth's radius in meters

    return R * c;
  };

  // Initialize map with more colorful style
  useEffect(() => {
    if (map.current) return; // Already initialized

    try {
      console.log("Initializing map with center:", centerPosition);

      // Set mapbox token
      mapboxgl.accessToken =
        "pk.eyJ1Ijoicm9vb2Q0MzUiLCJhIjoiY204ZnhiazB0MGk5MzJxczVqYmNxdWRnNyJ9.VV4Eyzqw09tqzNiNZd_bfw";

      // Create map instance with a cleaner style
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        // Use monochrome style instead of navigation-day-v1
        style: styles[styleIndex], // Much cleaner base style
        center: centerPosition,
        zoom: 12,
        renderWorldCopies: true,
        antialias: true,
        showTileBoundaries: false,
      });

      // Wait for map to load before setting initialized flag
      map.current.on("load", () => {
        console.log("Mapbox map loaded successfully");

        // Customize map appearance - hide POIs but keep a clean look
        if (map.current.getStyle().layers) {
          const layers = map.current.getStyle().layers;

          // Hide unwanted layers and modify road colors
          layers.forEach((layer) => {
            // Hide POIs, buildings, and minor labels
            if (
              (layer.id.includes("poi") &&
                !layer.id.includes("poi-label-major")) ||
              layer.id.includes("place-label-minor") ||
              layer.id.includes("building")
            ) {
              map.current.setLayoutProperty(layer.id, "visibility", "none");
            }

            // Tone down the road colors to neutral grays
            if (layer.id.includes("road")) {
              // For road lines/casings
              if (layer.type === "line" && map.current.getLayer(layer.id)) {
                try {
                  // Set all road colors to a subtle gray
                  map.current.setPaintProperty(
                    layer.id,
                    "line-color",
                    "#bbbbbb"
                  );

                  // Make highways slightly darker but still neutral
                  if (
                    layer.id.includes("motorway") ||
                    layer.id.includes("trunk")
                  ) {
                    map.current.setPaintProperty(
                      layer.id,
                      "line-color",
                      "#999999"
                    );
                  }
                } catch (err) {
                  console.warn(`Couldn't update color for ${layer.id}`, err);
                }
              }
            }
          });
        }

        // Add subtle terrain if available
        if (map.current.getSource("mapbox-dem")) {
          map.current.addLayer({
            id: "hillshading",
            source: "mapbox-dem",
            type: "hillshade",
            layout: { visibility: "visible" },
            paint: {
              "hillshade-accent-color": "#ebebeb",
              "hillshade-exaggeration": 0.15,
              "hillshade-shadow-color": "#dfdfe5",
              "hillshade-highlight-color": "#ffffff",
            },
          });
        }

        // Add source for delivery routes
        map.current.addSource("delivery-routes", {
          type: "geojson",
          data: {
            type: "FeatureCollection",
            features: [],
          },
        });

        // Add layer for current delivery routes
        map.current.addLayer({
          id: "current-delivery-routes",
          type: "line",
          source: "delivery-routes",
          filter: ["==", ["get", "isPending"], true],
          layout: {
            "line-join": "round",
            "line-cap": "round",
          },
          paint: {
            "line-color": "#FF5722", // Orange for current deliveries
            "line-width": 3,
            "line-opacity": 0.8,
          },
        });

        // Add layer for past delivery routes
        map.current.addLayer({
          id: "past-delivery-routes",
          type: "line",
          source: "delivery-routes",
          filter: ["==", ["get", "isDelivered"], true],
          layout: {
            "line-join": "round",
            "line-cap": "round",
          },
          paint: {
            "line-color": "#4CAF50", // Green for past deliveries
            "line-width": 2,
            "line-opacity": 0.6,
            "line-dasharray": [2, 2], // Dashed line for past deliveries
          },
        });

        setMapInitialized(true);
        setCurrentCenter(centerPosition);
      });

      // Add navigation controls
      map.current.addControl(new mapboxgl.NavigationControl());
    } catch (error) {
      console.error("Error initializing map:", error);
    }

    // Cleanup on unmount
    return () => {
      if (map.current) {
        console.log("Cleaning up map (COMPONENT UNMOUNTING)");

        // Clear the interval for drone updates
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }

        // Remove drone markers
        Object.values(markers.current.drones).forEach((marker) => {
          if (marker) marker.remove();
        });

        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Update drone positions every second - depends on deliveries
  useEffect(() => {
    if (!map.current || !mapInitialized) return;



    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Function to update drone positions using current deliveries data
    const updateDronePositions = () => {
      // Track if there are any active drones
      let activeDroneCount = 0;
      
      // First, remove drone markers that are no longer in the filtered deliveries
      const currentDeliveryIds = new Set(deliveries.map(d => d._id));
      Object.keys(markers.current.drones).forEach(deliveryId => {
        if (!currentDeliveryIds.has(deliveryId)) {
          // Remove marker that's no longer in filtered deliveries
          if (markers.current.drones[deliveryId]) {
            markers.current.drones[deliveryId].remove();
            delete markers.current.drones[deliveryId];
          }
        }
      });

      // Update each drone marker for filtered deliveries
      deliveries.forEach((delivery) => {
        if (delivery.droneDelivery) {
          // Check if drone has completed its journey
          const now = new Date();
          const startTime = new Date(delivery.droneDelivery.startTime);
          const totalDistance = calculateDistance(
            delivery.droneDelivery.restaurantCoordinates,
            delivery.droneDelivery.destinationCoordinates
          );
          const speed = delivery.droneDelivery.speed || 10;
          const durationMs = (totalDistance / speed) * 1000;
          const endTime = new Date(startTime.getTime() + durationMs);

          // Always show drone - calculate position regardless of completion
          activeDroneCount++;
          const position = calculateDronePosition(delivery.droneDelivery);

          if (position) {
            // Get existing drone marker or create a new one
            let droneMarker = markers.current.drones[delivery._id];

            if (!droneMarker) {
              // Create drone marker element
              const el = document.createElement("div");
              el.className = "drone-marker";
              el.innerHTML = "🚁"; // Helicopter emoji as drone
              el.style.fontSize = "24px";

              // Create the marker
              droneMarker = new mapboxgl.Marker({
                element: el,
              })
                .setLngLat(position)
                .addTo(map.current);

              // Store in markers ref
              markers.current.drones[delivery._id] = droneMarker;
            } else {
              // Update existing marker position
              droneMarker.setLngLat(position);
            }
          }
        }
      });

      // Keep interval running as long as there are any drones to display
      if (activeDroneCount === 0) {
        console.log("No active drones found");
      }
    };

    // Set up the interval to update drone positions every second
    intervalRef.current = setInterval(updateDronePositions, 1000);

    // Run once immediately
    updateDronePositions();

    // Cleanup
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [mapInitialized, deliveries]);

  // Handle centerPosition changes
  useEffect(() => {
    if (!map.current || !mapInitialized) return;

    // Only update if the center has actually changed
    if (JSON.stringify(centerPosition) !== JSON.stringify(currentCenter)) {
      console.log("Map center changing to:", centerPosition);

      try {
        // Use flyTo for smooth transition
        map.current.flyTo({
          center: centerPosition,
          zoom: 12,
          essential: true,
          duration: 1000,
        });

        setCurrentCenter(centerPosition);
      } catch (err) {
        console.error("Error updating map center:", err);
        map.current.setCenter(centerPosition);
      }
    }
  }, [centerPosition, mapInitialized, currentCenter]);

  // Center map on selected restaurant
  useEffect(() => {
    if (!map.current || !mapInitialized || !selectedRestaurant) return;

    // Get restaurant location
    if (selectedRestaurant.coordinates) {
      let lng, lat;

      // Extract coordinates based on data format
      if (
        selectedRestaurant.coordinates &&
        Array.isArray(selectedRestaurant.coordinates)
      ) {
        [lng, lat] = selectedRestaurant.coordinates;
      } else if (
        selectedRestaurant.longitude !== undefined &&
        selectedRestaurant.latitude !== undefined
      ) {
        lng = selectedRestaurant.longitude;
        lat = selectedRestaurant.latitude;
      } else {
        console.warn("Invalid location format for selected restaurant");
        return;
      }

      // Fly to restaurant location
      map.current.flyTo({
        center: [lng, lat],
        zoom: 14, // Zoom in closer for restaurant view
        essential: true,
        duration: 800,
      });
    }
  }, [selectedRestaurant, mapInitialized]);

  // Restaurant markers
  useEffect(() => {
    if (!map.current || !mapInitialized) return;

    console.log("Updating restaurant markers. Count:", restaurants.length);
    console.log("restaurant markers:", restaurants);
    console.log(
      "Restaurant data:",
      restaurants.map((r) => ({
        id: r._id,
        name: r.name,
        // location: r.location,
        coordinates: r.coordinates,
      }))
    );

    // Clear existing restaurant markers
    markers.current.restaurants.forEach((marker) => {
      if (marker && typeof marker.remove === "function") {
        marker.remove();
      }
    });
    markers.current.restaurants = [];

    // Add new markers
    restaurants.forEach((restaurant) => {
      // Skip restaurants without location data
      if (!restaurant.coordinates) {
        console.warn(
          `Restaurant ${
            restaurant.name || restaurant._id
          } missing location coordinates data`
        );
        return;
      }

      // Extract coordinates
      let lng, lat;

      if (
        restaurant.coordinates &&
        Array.isArray(restaurant.coordinates) &&
        restaurant.coordinates.length === 2
      ) {
        // Fixed ordering: MongoDB stores as [longitude, latitude]
        [lng, lat] = restaurant.coordinates;
      } else if (
        restaurant.longitude !== undefined &&
        restaurant.latitude !== undefined
      ) {
        lng = restaurant.longitude;
        lat = restaurant.latitude;
      } else {
        console.warn(
          `Invalid location format for ${restaurant.name}:`,
          restaurant.coordinates
        );
        return;
      }

      // Validate coordinates
      const parsedLng = parseFloat(lng);
      const parsedLat = parseFloat(lat);

      if (isNaN(parsedLng) || isNaN(parsedLat)) {
        console.warn(
          `Invalid coordinates for restaurant ${restaurant.name}: [${lng}, ${lat}]`
        );
        return;
      }

      // Log valid coordinates being used
      console.log(
        `Adding restaurant marker for ${restaurant.name} at [${parsedLng}, ${parsedLat}]`
      );

      // Create HTML element for marker
      const markerElement = document.createElement("div");
      markerElement.className = "restaurant-marker-container"; // Use a completely different class
      markerElement.style.fontSize = "30px";
      markerElement.style.cursor = "pointer";
      markerElement.style.background = "white"; // Explicitly remove background
      markerElement.style.padding = "5px";
      markerElement.style.borderRadius = "10px";
      markerElement.style.border = "none"; // Explicitly remove border
      markerElement.innerHTML = "🍽️"; // Just the icon without any wrapper divs

      // Add selected styling if this is the selected restaurant
      if (restaurant._id === selectedRestaurant?._id) {
        markerElement.style.transform = "scale(1.2)";
      }

      // Create popup
      const popup = new mapboxgl.Popup({
        offset: 25,
        closeButton: false,
        maxWidth: "300px",
      }).setHTML(`
      <div class="custom-popup">
        <h3>${restaurant.name}</h3>
        <p>${restaurant.cuisineType || "No cuisine info"}</p>
        <p>Rating: ${restaurant.rating || "N/A"} ⭐</p>
        <p>${restaurant.address || "No address"}</p>
      </div>
    `);

      // Add marker to map
      const marker = new mapboxgl.Marker({
        element: markerElement,
      })
        .setLngLat([parsedLng, parsedLat])
        .setPopup(popup)
        .addTo(map.current);

      // Add click handler
      markerElement.addEventListener("click", (e) => {
        e.stopPropagation();
        onSelectRestaurant(restaurant);
      });

      // Store marker reference
      markers.current.restaurants.push(marker);
    });

    console.log(
      `Added ${markers.current.restaurants.length}/${restaurants.length} restaurant markers`
    );
  }, [restaurants, selectedRestaurant, mapInitialized, onSelectRestaurant]);

  // Delivery markers with same fixed-to-map approach
  useEffect(() => {
    if (!map.current || !mapInitialized) return;

    console.log("Updating delivery markers:", deliveries.length);

    // Clear existing delivery markers
    markers.current.deliveries.forEach((marker) => marker.remove());
    markers.current.deliveries = [];

    // Add new markers
    deliveries.forEach((delivery) => {
      // Skip if delivery doesn't have coordinates
      if (
        !delivery.deliveryAddress ||
        !delivery.deliveryAddress.coordinates ||
        !Array.isArray(delivery.deliveryAddress.coordinates)
      ) {
        console.warn(`Delivery ${delivery._id} missing valid coordinates`);
        return;
      }

      const [lng, lat] = delivery.deliveryAddress.coordinates;
      const isPending = [
        "preparing",
        "on-the-way",
      ].includes(delivery.status);
      const isCompleted = delivery.status === "delivered";

      // Create HTML element for marker
      const markerElement = document.createElement("div");
      markerElement.className = `delivery-marker ${
        isCompleted ? "completed" : "active"
      }`;
      markerElement.innerHTML = `
        <div class="marker-inner">
          <span class="marker-icon">${isCompleted ? "📦" : "🚚"}</span>
        </div>
      `;

      // Add selected styling if this is the selected delivery
      if (delivery._id === selectedDelivery?._id) {
        markerElement.classList.add("selected");
      }

      // Create popup content - adapt this based on your data structure
      const popupContent = `
        <div class="custom-popup">
          <h3>Order ID: ${delivery._id.substring(delivery._id.length - 8)}</h3>
          <p>Status: ${delivery.status || "Unknown"}</p>
          <p>Customer: ${delivery.deliveryAddress?.firstName || "Unknown"} ${
        delivery.deliveryAddress?.lastName || ""
      }</p>
          <p>Address: ${delivery.deliveryAddress?.address || "No address"}</p>
          ${
            delivery.estimatedDeliveryTime
              ? `<p>Est. Delivery: ${delivery.estimatedDeliveryTime} min</p>`
              : ""
          }
        </div>
      `;

      // Create popup
      const popup = new mapboxgl.Popup({
        offset: 25,
        closeButton: false,
      }).setHTML(popupContent);

      // Add marker to map
      const marker = new mapboxgl.Marker({
        element: markerElement,
        anchor: "bottom",
      })
        .setLngLat([lng, lat])
        .setPopup(popup)
        .addTo(map.current);

      // Add click handler
      markerElement.addEventListener("click", (e) => {
        e.stopPropagation();
        onSelectDelivery(delivery);
      });

      // Store marker reference
      markers.current.deliveries.push(marker);
    });

    console.log(`Added ${markers.current.deliveries.length} delivery markers`);
  }, [deliveries, selectedDelivery, mapInitialized, onSelectDelivery]);

  // Update delivery routes based on filters
  useEffect(() => {
    if (
      !map.current ||
      !mapInitialized ||
      !map.current.getSource("delivery-routes")
    )
      return;

    console.log("Updating delivery routes based on filters");

    // Create GeoJSON for delivery routes
    const routeFeatures = [];

    // Add routes for filtered deliveries
    deliveries.forEach((delivery) => {
      // Only add if we have both restaurant and delivery coordinates
      if (
        delivery.restaurant?.coordinates &&
        delivery.deliveryAddress?.coordinates
      ) {
        const isPending = [
          "preparing",
          "on-the-way",
        ].includes(delivery.status);
        const isDelivered = delivery.status === "delivered";

        // Check if we should show this delivery based on filters
        const showCurrentDelivery = isPending && filters?.showCurrentDeliveries;
        const showPastDelivery = isDelivered && filters?.showPastDeliveries;

        // Apply restaurant filter
        const matchesRestaurantFilter =
          !filters?.restaurantId ||
          (delivery.restaurant &&
            delivery.restaurant._id === filters.restaurantId);

        if (
          (showCurrentDelivery || showPastDelivery) &&
          matchesRestaurantFilter
        ) {
          // Create line geometry
          const feature = {
            type: "Feature",
            properties: {
              id: delivery._id,
              status: delivery.status,
              isPending: isPending,
              isDelivered: isDelivered,
            },
            geometry: {
              type: "LineString",
              coordinates: [
                delivery.restaurant.coordinates,
                delivery.deliveryAddress.coordinates,
              ],
            },
          };

          routeFeatures.push(feature);
        }
      }
    });

    // Update the routes source
    map.current.getSource("delivery-routes").setData({
      type: "FeatureCollection",
      features: routeFeatures,
    });

    console.log(`Added ${routeFeatures.length} delivery routes to map`);
  }, [deliveries, filters, mapInitialized]);

  // Add CSS for markers - using a more integrated approach
  useEffect(() => {
    // Inject CSS for markers if not already added
    if (!document.getElementById("map-marker-styles")) {
      const style = document.createElement("style");
      style.id = "map-marker-styles";
      style.innerHTML = `
        /* Base marker styles */
        .restaurant-marker, .delivery-marker {
          cursor: pointer;
        }
        
        /* Inner container for better styling control */
        .marker-inner {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 3px 6px rgba(0,0,0,0.3);
          transform: translateY(-2px);
          transition: all 0.2s ease;
        }
        
        /* Restaurant marker styling */
        .restaurant-marker .marker-inner {
          background-color: white;
         
        }
        
        .restaurant-marker.selected .marker-inner {
          background-color: #fff9c4;
          border: 1px solid #f39c12;
          box-shadow: 0 0 0 4px rgba(243, 156, 18, 0.4);
          transform: translateY(-4px) scale(1.1);
        }
        
        /* Delivery marker styling */
        .delivery-marker .marker-inner {
          background-color: white;
        }
        
        .delivery-marker.active .marker-inner {
          border: 1px solid #f39c12;
        }
        
        .delivery-marker.completed .marker-inner {
          border: 1px solid #2ecc71;
        }
        
        .delivery-marker.selected .marker-inner {
          background-color: #fff9c4;
          box-shadow: 0 0 0 4px rgba(243, 156, 18, 0.4);
          transform: translateY(-4px) scale(1.1);
        }
        
        /* Icons inside markers */
        .marker-icon {
          font-size: 20px;
          line-height: 1;
        }
        
        /* Hover effects */
        .marker-inner:hover {
          transform: translateY(-4px) scale(1.05);
          box-shadow: 0 4px 8px rgba(0,0,0,0.4);
        }
        
        /* Drone marker styling */
        .drone-marker {
          font-size: 24px;
          cursor: pointer;
          filter: drop-shadow(0 0 5px white);
        }
        
        /* Custom popup styling */
        .custom-popup {
          padding: 5px;
        }
        
        .custom-popup h3 {
          margin: 0 0 5px 0;
          color: #e74c3c;
          font-size: 14px;
        }
        
        .custom-popup p {
          margin: 3px 0;
          font-size: 12px;
        }
        
        /* Debug info styling */
        .map-debug-info {
          position: absolute;
          bottom: 10px;
          left: 10px;
          background: rgba(255, 255, 255, 0.8);
          padding: 5px 10px;
          border-radius: 4px;
          font-size: 12px;
          z-index: 1000;
          box-shadow: 0 1px 4px rgba(0,0,0,0.2);
          pointer-events: none;
        }
        
        /* Make Mapbox popups prettier */
        .mapboxgl-popup-content {
          padding: 10px;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  // // Debug information
  // useEffect(() => {
  //   if (!map.current || !mapInitialized) return;

  //   // Create or update debug info panel
  //   let debugEl = document.getElementById("map-debug-info");
  //   if (!debugEl) {
  //     debugEl = document.createElement("div");
  //     debugEl.id = "map-debug-info";
  //     debugEl.className = "map-debug-info";
  //     mapContainer.current.appendChild(debugEl);
  //   }

  //   // Update debug info
  //   const center = map.current.getCenter();
  //   debugEl.innerHTML = `
  //     <div>
  //       <strong>Map Debug:</strong>
  //       <div>Center: [${center.lng.toFixed(4)}, ${center.lat.toFixed(4)}]</div>
  //       <div>Target: [${centerPosition[0].toFixed(
  //         4
  //       )}, ${centerPosition[1].toFixed(4)}]</div>
  //       <div>Zoom: ${map.current.getZoom().toFixed(2)}</div>
  //       <div>Restaurants: ${restaurants.length} (Markers: ${
  //     markers.current.restaurants.length
  //   })</div>
  //       <div>Deliveries: ${deliveries.length} (Markers: ${
  //     markers.current.deliveries.length
  //   })</div>
  //       <div>Drone Deliveries: ${
  //         Object.keys(markers.current.drones).length
  //       }</div>
  //       ${
  //         selectedRestaurant
  //           ? `<div>Selected Restaurant: ${selectedRestaurant.name}</div>`
  //           : ""
  //       }
  //       ${
  //         selectedDelivery
  //           ? `<div>Selected Delivery: ${selectedDelivery._id}</div>`
  //           : ""
  //       }
  //       <div>Filters: ${JSON.stringify(filters)}</div>
  //     </div>
  //   `;
  // }, [
  //   centerPosition,
  //   restaurants,
  //   deliveries,
  //   selectedRestaurant,
  //   selectedDelivery,
  //   filters,
  //   mapInitialized,
  // ]);

  return (
    <div
      ref={mapContainer}
      className="delivery-map"
      style={{ width: "100%", height: "100%", minHeight: "500px" }}
    />
  );
};

export default DeliveryMap;
