// In your Map.jsx file
import React, { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

const Map = ({ initialViewport, markers, onMapClick, onMarkerClick }) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const markersRef = useRef([]);

  // Initialize map
  useEffect(() => {
    if (map.current) return; // Initialize only once

    mapboxgl.accessToken =
      "pk.eyJ1Ijoicm9vb2Q0MzUiLCJhIjoiY204ZnhiazB0MGk5MzJxczVqYmNxdWRnNyJ9.VV4Eyzqw09tqzNiNZd_bfw"; // Replace with your token

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: [initialViewport.longitude, initialViewport.latitude],
      zoom: initialViewport.zoom || 12,
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

    // Add controls
    map.current.addControl(new mapboxgl.NavigationControl());
  }, []);

  // Update markers when the markers prop changes
  useEffect(() => {
    console.log("==================");

    if (!map.current || !markers || markers.length === 0) return;

    // Remove all existing markers first
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    // In Map.jsx - Inside the useEffect for markers
    markers.forEach((markerData) => {
      // Create marker element
      const el = document.createElement("div");
      el.className = "marker";

      // Style based on type
      if (markerData.type === "restaurant") {
        el.innerHTML = "🍴";
        el.classList.add("restaurant-marker"); // Add class for styling
      } else if (markerData.type === "delivery") {
        el.innerHTML = "📍";
        el.classList.add("delivery-marker"); // Add class for styling
      }

      el.style.fontSize = `${markerData.size || 30}px`;
      el.style.color = markerData.color || "#000";

      // Add click handler
      el.addEventListener("click", (e) => {
        e.stopPropagation(); // Prevent map click from being triggered
        console.log("Marker element clicked", markerData);
        if (onMarkerClick) {
          onMarkerClick(markerData);
        }
      });

      // Create and add the marker to the map
      const marker = new mapboxgl.Marker(el)
        .setLngLat([markerData.longitude, markerData.latitude])
        .addTo(map.current);

      // Store reference to remove later
      markersRef.current.push(marker);
    });
  }, [markers]); // This ensures this effect runs when markers change

  // Update viewport when initialViewport changes
  useEffect(() => {
    if (map.current) {
      map.current.flyTo({
        center: [initialViewport.longitude, initialViewport.latitude],
        zoom: initialViewport.zoom || map.current.getZoom(),
        essential: true,
      });
    }
  }, [initialViewport]);

  return <div ref={mapContainer} className="map-container" />;
};

export default Map;
