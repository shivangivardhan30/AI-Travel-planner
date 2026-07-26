import React, { useEffect, useRef } from 'react';

export default function MapComponent({ lat, lon, destinationName }) {
  const mapRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    // Ensure Leaflet is loaded on window and container exists
    if (window.L && containerRef.current && lat && lon) {
      // Clear container in case something remained
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }

      try {
        const latitude = parseFloat(lat);
        const longitude = parseFloat(lon);
        
        // Initialize Leaflet map
        const map = window.L.map(containerRef.current, {
          center: [latitude, longitude],
          zoom: 11,
          zoomControl: true,
          scrollWheelZoom: false
        });

        // Add standard tile layer (OpenStreetMap)
        window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        // Add custom marker
        const marker = window.L.marker([latitude, longitude]).addTo(map);
        marker.bindPopup(`<b>${destinationName}</b><br/>Enjoy your trip!`).openPopup();

        mapRef.current = map;
      } catch (err) {
        console.error("Leaflet map initialization failed:", err);
      }
    }

    return () => {
      // Clean up map instance on component unmount
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [lat, lon, destinationName]);

  return (
    <div className="relative w-full h-full min-h-[300px] rounded-2xl overflow-hidden border border-slate-900 bg-slate-950">
      <div ref={containerRef} className="w-full h-full absolute inset-0" />
      {(!lat || !lon || !window.L) && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-950 text-slate-500 text-sm">
          Map services are loading or coordinates are unavailable.
        </div>
      )}
    </div>
  );
}
