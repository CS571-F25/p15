import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import SidePanel from '../UI/SidePanel';
import IntroOverlay from '../IntroOverlay';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './Map.css';
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

const TILE_SIZE = 256;
const MAX_ZOOM_LEVEL = 5;
const MIN_ZOOM_LEVEL = 0;
const MAP_PIXEL_WIDTH = TILE_SIZE * 20; // max zoom has 20 columns of tiles
const MAP_PIXEL_HEIGHT = TILE_SIZE * 15; // max zoom has 15 rows of tiles
const MAP_CENTER = [MAP_PIXEL_HEIGHT / 2, MAP_PIXEL_WIDTH / 2];
const MAP_BOUNDS = L.latLngBounds([0, 0], [MAP_PIXEL_HEIGHT, MAP_PIXEL_WIDTH]);
const TILE_URL = `${import.meta.env.BASE_URL}tiles/{z}/{x}/{y}.jpg`;
const PAN_STEP = 200;
const ZOOM_SNAP = 0.25;
const ZOOM_DELTA = 0.5;
const WHEEL_PX_PER_ZOOM_LEVEL = 100;
const MAX_SCALE = Math.pow(2, MAX_ZOOM_LEVEL);
const TILESET_CRS = L.extend({}, L.CRS.Simple, {
  scale: (zoom) => Math.pow(2, zoom) / MAX_SCALE,
  zoom: (scale) => Math.log(scale * MAX_SCALE) / Math.LN2,
  transformation: new L.Transformation(1, 0, -1, MAP_PIXEL_HEIGHT),
});

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
          map.panTo([center.lat - PAN_STEP, center.lng]);
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          map.panTo([center.lat + PAN_STEP, center.lng]);
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          map.panTo([center.lat, center.lng - PAN_STEP]);
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          map.panTo([center.lat, center.lng + PAN_STEP]);
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

function ZoomControls() {
  const map = useMap();

  return (
    <div className="zoom-controls">
      <button
        className="zoom-button"
        type="button"
        aria-label="Zoom in"
        onClick={() => map.zoomIn()}
      >
        +
      </button>
      <button
        className="zoom-button"
        type="button"
        aria-label="Zoom out"
        onClick={() => map.zoomOut()}
      >
        -
      </button>
    </div>
  );
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
  const [isIntroVisible, setIsIntroVisible] = useState(true);
  const [mapInstance, setMapInstance] = useState(null);
  const handleLocationClick = (location) => setSelectedLocation(location);
  const handleClosePanel = () => setSelectedLocation(null);
  const LOCATIONS = locationsData; // Load from JSON data
  const center = MAP_CENTER;
  const zoom = 2;

  useEffect(() => {
    if (!mapInstance) return;
    const handlers = [
      mapInstance.dragging,
      mapInstance.scrollWheelZoom,
      mapInstance.doubleClickZoom,
      mapInstance.boxZoom,
      mapInstance.keyboard,
      mapInstance.touchZoom,
    ];
    handlers.forEach((handler) => {
      if (!handler) return;
      if (isIntroVisible && handler.disable) {
        handler.disable();
      } else if (!isIntroVisible && handler.enable) {
        handler.enable();
      }
    });
  }, [mapInstance, isIntroVisible]);

  const handleIntroFinish = () => setIsIntroVisible(false);

  return (
    <div className={`map-wrapper ${isIntroVisible ? 'map-wrapper--locked' : ''}`}>
      <MapContainer
        center={center}
        zoom={zoom}
        minZoom={MIN_ZOOM_LEVEL}
        maxZoom={MAX_ZOOM_LEVEL}
        maxBounds={MAP_BOUNDS}
        crs={TILESET_CRS}
        className="leaflet-map"
        scrollWheelZoom={true}
        dragging={true}
        doubleClickZoom={true}
        zoomControl={true}
        zoomSnap={ZOOM_SNAP}
        zoomDelta={ZOOM_DELTA}
        wheelPxPerZoomLevel={WHEEL_PX_PER_ZOOM_LEVEL}
        whenCreated={setMapInstance}
        style={{ height: '80vh', width: '100%' }}
      >
        <TileLayer
          url={TILE_URL}
          tileSize={TILE_SIZE}
          minZoom={MIN_ZOOM_LEVEL}
          maxZoom={MAX_ZOOM_LEVEL}
          maxNativeZoom={MAX_ZOOM_LEVEL}
          minNativeZoom={MIN_ZOOM_LEVEL}
          noWrap={true}
          keepBuffer={4}
        />
        <KeyboardControls />
        <ZoomControls />
        {LOCATIONS.map((location) => (
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
      {isIntroVisible && (
        <IntroOverlay onFinish={handleIntroFinish} />
      )}
    </div>
  );
}

export default InteractiveMap;
