import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

const Map = ({
  initialViewport,
  currentViewport,
  onViewportChange,
  markers,
  onMapClick,
  onMarkerClick,
}) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const markersRef = useRef([]);
  const viewportChangeHandled = useRef(false);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Initialize map
  useEffect(() => {
    if (map.current) return; // Initialize only once

    mapboxgl.accessToken =
      "pk.eyJ1Ijoicm9vb2Q0MzUiLCJhIjoiY204ZnhiazB0MGk5MzJxczVqYmNxdWRnNyJ9.VV4Eyzqw09tqzNiNZd_bfw";

    const initialCenter = [initialViewport.longitude, initialViewport.latitude];
    const initialZoom = initialViewport.zoom || 12;

    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/streets-v11",
        center: initialCenter,
        zoom: initialZoom,
      });

      // Add click handler to map
      map.current.on("click", (e) => {
        if (onMapClick) {
          onMapClick({
            longitude: e.lngLat.lng,
            latitude: e.lngLat.lat,
          });
        }
      });

      // Track viewport changes
      map.current.on("moveend", () => {
        if (!map.current || !onViewportChange) return;

        const center = map.current.getCenter();
        const zoom = map.current.getZoom();

        // Only update if this isn't a programmatic change we're already handling
        if (!viewportChangeHandled.current) {
          onViewportChange({
            longitude: center.lng,
            latitude: center.lat,
            zoom: zoom,
          });
        }

        viewportChangeHandled.current = false;
      });

      // Add controls
      map.current.addControl(new mapboxgl.NavigationControl());

      // Set initial viewport in parent component
      if (onViewportChange) {
        onViewportChange({
          longitude: initialCenter[0],
          latitude: initialCenter[1],
          zoom: initialZoom,
        });
      }

      // Handle map load
      map.current.on("load", () => {
        // console.log("Map loaded");
        setMapLoaded(true);
      });
    } catch (err) {
      console.error("Error initializing map:", err);
    }

    // Cleanup
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Handle external viewport changes
  useEffect(() => {
    if (!map.current || !currentViewport || !mapLoaded) return;

    try {
      // Prevent the moveend handler from updating state again
      viewportChangeHandled.current = true;

      // Fly to the new location smoothly
      map.current.flyTo({
        center: [currentViewport.longitude, currentViewport.latitude],
        zoom: currentViewport.zoom,
        essential: true,
      });
    } catch (err) {
      console.error("Error updating viewport:", err);
    }
  }, [currentViewport, mapLoaded]);

  // Update markers when they change
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    // Remove existing markers
    if (markersRef.current) {
      markersRef.current.forEach((marker) => marker.remove());
    }
    markersRef.current = [];

    // Add new markers
    markers.forEach((markerData) => {
      if (
        markerData.longitude === undefined ||
        markerData.latitude === undefined
      ) {
        console.warn("Invalid marker data:", markerData);
        return;
      }

      try {
        // Create marker element
        const el = document.createElement("div");
        el.className = "marker";

        // Style based on type
        if (markerData.type === "restaurant") {
          el.innerHTML = "🍴";
          el.classList.add("restaurant-marker");
        } else if (markerData.type === "delivery") {
          el.innerHTML = "🚁"; // Using helicopter as drone
          el.classList.add("delivery-marker");
        } else {
          // Default city marker
          el.innerHTML = "📍";
          el.classList.add("city-marker");
        }

        el.style.fontSize = `${markerData.size || 24}px`;
        el.style.color = markerData.color || "#FF5A5F";
        el.style.cursor = "pointer";

        // Add click handler
        el.addEventListener("click", (e) => {
          e.stopPropagation();
          if (onMarkerClick) {
            onMarkerClick(markerData);
          }
        });

        // Create marker
        const marker = new mapboxgl.Marker({
          element: el,
          anchor: "bottom",
        })
          .setLngLat([markerData.longitude, markerData.latitude])
          .addTo(map.current);

        // Store reference
        markersRef.current.push(marker);
      } catch (err) {
        console.error("Error adding marker:", err);
      }
    });
  }, [markers, mapLoaded]);

  return (
    <div
      className="map-container"
      ref={mapContainer}
      style={{ width: "100%", height: "400px" }}
    ></div>
  );
};

export default Map;
