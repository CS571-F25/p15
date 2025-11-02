import React, { useRef, useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, ImageOverlay } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './Map.css';

// Fix for default marker icons in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom marker with glow effect
const createGlowingIcon = (color = '#FFD700', isHovered = false) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div class="marker-pin ${isHovered ? 'marker-hover' : ''}" 
           style="--glow-color: ${color}">
        <div class="marker-glow"></div>
      </div>
    `,
    iconSize: [30, 30],
    iconAnchor: [15, 30],
  });
};

// Component to handle keyboard controls
function KeyboardControls() {
  const map = useMap();

  useEffect(() => {
    const handleKeyDown = (e) => {
      const panAmount = 50;
      const center = map.getCenter();

      switch(e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          map.panTo([center.lat + 0.01, center.lng]);
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          map.panTo([center.lat - 0.01, center.lng]);
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          map.panTo([center.lat, center.lng - 0.01]);
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          map.panTo([center.lat, center.lng + 0.01]);
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [map]);

  return null;
}

// Individual Location Marker Component
function LocationMarker({ location, onLocationClick, isSelected }) {
  const [isHovered, setIsHovered] = useState(false);

  const eventHandlers = {
    mouseover: () => setIsHovered(true),
    mouseout: () => setIsHovered(false),
    click: () => onLocationClick(location),
  };

  return (
    <Marker
      position={[location.lat, location.lng]}
      icon={createGlowingIcon(location.glowColor, isHovered || isSelected)}
      eventHandlers={eventHandlers}
    >
      {isHovered && (
        <Popup>
          <div className="location-popup">
            <h3>{location.name}</h3>
          </div>
        </Popup>
      )}
    </Marker>
  );
}

function InteractiveMap({ locations, onLocationClick, selectedLocation }) {
  const mapRef = useRef(null);
  
  // Default center and zoom
  const center = [51.505, -0.09];
  const zoom = 13;

  return (
    <div className="map-wrapper">
      <MapContainer
        center={center}
        zoom={zoom}
        ref={mapRef}
        className="leaflet-map"
        scrollWheelZoom={true}
        dragging={true}
        doubleClickZoom={true}
        zoomControl={true}
      >
        {/* Option 1: Use OpenStreetMap tiles (default for testing) */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
          minZoom={3}
        />

        {/* Option 2: Uncomment to use custom image overlay instead */}
        {/* <ImageOverlay
          url="/sample-map.jpg"
          bounds={[[51.49, -0.12], [51.52, -0.06]]}
        /> */}

        <KeyboardControls />

        {/* Render location markers */}
        {locations.map((location) => (
          <LocationMarker
            key={location.id}
            location={location}
            onLocationClick={onLocationClick}
            isSelected={selectedLocation?.id === location.id}
          />
        ))}
      </MapContainer>
    </div>
  );
}

export default InteractiveMap;
