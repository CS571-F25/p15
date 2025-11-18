import React, { useRef, useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import SidePanel from '../UI/SidePanel'; // <-- import your side panel
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './Map.css';
import MenuButton from '../UI/MenuButton';
import locationsData from '../../data/locations.json';


// Fix for default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Demo locations
const DEMO_LOCATIONS = [
  { id: 1, name: 'London', lat: 51.505, lng: -0.09, glowColor: '#FFD700' },
  { id: 2, name: 'Paris', lat: 48.8566, lng: 2.3522, glowColor: '#74c2e1' }
  // Add more if desired
];




// Marker with glow
const createGlowingIcon = (color = '#FFD700', isHovered = false) => (
  L.divIcon({
    className: 'custom-marker',
    html: `
      <div class="marker-pin ${isHovered ? 'marker-hover' : ''}" 
           style="--glow-color: ${color}">
        <div class="marker-glow"></div>
      </div>
    `,
    iconSize: [30, 30],
    iconAnchor: [15, 30],
  })
);

// Keyboard controls remain as-is
function KeyboardControls() {
  const map = useMap();
  useEffect(() => {
    const handleKeyDown = (e) => {
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

// LocationMarker handles its own hover/selection state
function LocationMarker({ location, onLocationClick, isSelected }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Marker
      position={[location.lat, location.lng]}
      icon={createGlowingIcon(location.glowColor, isHovered || isSelected)}
      eventHandlers={{
        mouseover: () => setIsHovered(true),
        mouseout: () => setIsHovered(false),
        click: () => onLocationClick(location),
      }}
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

function InteractiveMap() {
  // demo set, no props required
  const [selectedLocation, setSelectedLocation] = useState(null);
  const handleLocationClick = (location) => setSelectedLocation(location);
  const handleClosePanel = () => setSelectedLocation(null);
  const LOCATIONS = locationsData; // Load from JSON data
  const center = [51.505, -0.09];
  const zoom = 5;
  return (
    <div className="map-wrapper">
      <MenuButton />
      <MapContainer
        center={center}
        zoom={zoom}
        className="leaflet-map"
        scrollWheelZoom={true}
        dragging={true}
        doubleClickZoom={true}
        zoomControl={true}
        style={{ height: "80vh", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
          minZoom={3}
        />
        <KeyboardControls />
        {locationsData.map((location) => (
          <LocationMarker
            key={location.id}
            location={location}
            onLocationClick={handleLocationClick}
            isSelected={selectedLocation && selectedLocation.id === location.id}
          />
        ))}
      </MapContainer>
      {selectedLocation && (
          <SidePanel
            location={selectedLocation}
            onClose={handleClosePanel}
          />
        )}
    </div>
  );
}

export default InteractiveMap;
