import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvent } from 'react-leaflet';
import SidePanel from '../UI/SidePanel';
import IntroOverlay from '../IntroOverlay';
import EditorInfoPanel from './EditorInfoPanel';
import { useAuth } from '../../context/AuthContext';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './Map.css';
import locationsData from '../../data/locations.json';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
const getFallbackLocations = () => locationsData.map((location) => ({ ...location }));

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

const MARKER_TYPES = [
  { id: 'city', label: 'City', glowColor: '#F7B267' },
  { id: 'town', label: 'Town', glowColor: '#74c2e1' },
  { id: 'dungeon', label: 'Dungeon', glowColor: '#8E7CC3' },
];

const TILE_SIZE = 256;
const TILE_MIN_ZOOM_LEVEL = 0;
const TILE_MAX_ZOOM_LEVEL = 5;
const INTERACTIVE_MAX_ZOOM_LEVEL = 7;
const INTERACTIVE_MIN_ZOOM_LEVEL = 3;
const MAP_PIXEL_WIDTH = TILE_SIZE * 20; // max zoom has 20 columns of tiles
const MAP_PIXEL_HEIGHT = TILE_SIZE * 15; // max zoom has 15 rows of tiles
const MAP_CENTER = [MAP_PIXEL_HEIGHT / 2, MAP_PIXEL_WIDTH / 2];
const MAP_BOUNDS_PADDING = TILE_SIZE * .8; // allow slight overscroll to reveal background
const MAP_BOUNDS = L.latLngBounds(
  [-MAP_BOUNDS_PADDING, -MAP_BOUNDS_PADDING],
  [MAP_PIXEL_HEIGHT + MAP_BOUNDS_PADDING, MAP_PIXEL_WIDTH + MAP_BOUNDS_PADDING],
);
const TILE_URL = `${import.meta.env.BASE_URL}tiles/{z}/{x}/{y}.jpg`;
const PAN_STEP = 200;
const ZOOM_SNAP = 0.25;
const ZOOM_DELTA = 0.5;
const WHEEL_PX_PER_ZOOM_LEVEL = 100;
const MAX_SCALE = Math.pow(2, TILE_MAX_ZOOM_LEVEL);
const TILESET_CRS = L.extend({}, L.CRS.Simple, {
  scale: (zoom) => Math.pow(2, zoom) / MAX_SCALE,
  zoom: (scale) => Math.log(scale * MAX_SCALE) / Math.LN2,
  transformation: new L.Transformation(1, 0, -1, MAP_PIXEL_HEIGHT),
});

let introShownThisSession = false;

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

function EditorToolbox({
  isEditorMode,
  selectedTypeId,
  onSelectType,
  jsonBuffer,
  onJsonChange,
  onExportJson,
  onImportJson,
  importError,
}) {
  if (!isEditorMode) return null;

  const selectedType = MARKER_TYPES.find((type) => type.id === selectedTypeId);

  return (
    <div className="editor-toolbox" aria-label="Editor toolbox">
      <div className="editor-toolbox__header">
        <p>Editor Toolbox</p>
        <span className="editor-toolbox__status">
          {selectedType ? `Placing: ${selectedType.label}` : 'Select a marker type'}
        </span>
      </div>
      <div className="editor-toolbox__buttons">
        {MARKER_TYPES.map((type) => (
          <button
            key={type.id}
            type="button"
            className={`toolbox-button ${selectedTypeId === type.id ? 'toolbox-button--active' : ''}`}
            onClick={() => onSelectType(selectedTypeId === type.id ? null : type.id)}
          >
            {type.label}
          </button>
        ))}
      </div>
      {selectedType && (
        <p className="editor-toolbox__hint">
          Click anywhere on the map to place a {selectedType.label}.
        </p>
      )}
      <div className="editor-toolbox__data">
        <div className="editor-toolbox__data-actions">
          <button
            type="button"
            className="toolbox-button toolbox-button--ghost"
            onClick={onExportJson}
          >
            Export JSON
          </button>
          <button
            type="button"
            className="toolbox-button toolbox-button--primary"
            onClick={onImportJson}
          >
            Import JSON
          </button>
        </div>
        <textarea
          className="editor-toolbox__textarea"
          placeholder="Paste JSON array here..."
          value={jsonBuffer}
          onChange={(event) => onJsonChange(event.target.value)}
          rows={6}
        />
        {importError && <p className="editor-toolbox__error">{importError}</p>}
      </div>
    </div>
  );
}

function EditorPlacementHandler({ isEnabled, selectedType, onPlaceMarker }) {
  useMapEvent('click', (event) => {
    if (!isEnabled || !selectedType) return;
    onPlaceMarker(event.latlng, selectedType);
  });
  return null;
}

// LocationMarker handles its own hover/selection state
function LocationMarker({
  location,
  onLocationClick,
  isSelected,
  isEditorMode,
  onDragEnd,
}) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Marker
      position={[location.lat, location.lng]}
      draggable={isEditorMode}
      icon={createGlowingIcon(location.glowColor, isHovered || isSelected)}
      eventHandlers={{
        mouseover: () => setIsHovered(true),
        mouseout: () => setIsHovered(false),
        click: () => onLocationClick(location),
        dragend: (event) => {
          if (!isEditorMode || !onDragEnd) return;
          const { lat, lng } = event.target.getLatLng();
          onDragEnd(location.id, { lat, lng });
        },
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

function InteractiveMap({ isEditorMode = false }) {
  const { role, token } = useAuth();
  const initialLocations = useMemo(() => getFallbackLocations(), []);
  const [locations, setLocations] = useState(initialLocations);
  const [selectedLocationId, setSelectedLocationId] = useState(null);
  const [editorSelection, setEditorSelection] = useState(null);
  const [activePlacementTypeId, setActivePlacementTypeId] = useState(null);
  const [jsonBuffer, setJsonBuffer] = useState('');
  const [importError, setImportError] = useState('');
  const [isIntroVisible, setIsIntroVisible] = useState(() => !introShownThisSession);
  const [mapInstance, setMapInstance] = useState(null);
  const saveTimeoutRef = useRef(null);
  const lastSavedSnapshotRef = useRef(JSON.stringify(initialLocations));
  const skipNextAutoSaveRef = useRef(false);
  const [saveWarning, setSaveWarning] = useState('');
  const center = MAP_CENTER;
  const zoom = 2;
  const activeMarkerType = MARKER_TYPES.find((type) => type.id === activePlacementTypeId) || null;
  const serializedLocations = useMemo(() => JSON.stringify(locations), [locations]);
  const canAutoSave = role === 'editor' || role === 'admin';

  useEffect(() => {
    let isMounted = true;
    const fetchLocations = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/locations`);
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'Failed to load locations.');
        }
        const nextLocations = Array.isArray(data.locations) ? data.locations : [];
        if (isMounted) {
          setLocations(nextLocations);
          lastSavedSnapshotRef.current = JSON.stringify(nextLocations);
          skipNextAutoSaveRef.current = true;
        }
      } catch (error) {
        console.error('Unable to load locations', error);
        if (isMounted) {
          const fallback = getFallbackLocations();
          setLocations(fallback);
          lastSavedSnapshotRef.current = JSON.stringify(fallback);
          skipNextAutoSaveRef.current = true;
        }
      }
    };
    fetchLocations();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleLocationClick = (location) => {
    if (isEditorMode) {
      setEditorSelection({
        id: location.id,
        draft: {
          name: location.name || '',
          type: location.type || '',
          description: location.description || '',
        },
      });
      return;
    }
    setSelectedLocationId(location.id);
  };

  const handleClosePanel = () => setSelectedLocationId(null);

  const handleMarkerDragEnd = (id, coords) => {
    setLocations((prev) =>
      prev.map((location) =>
        location.id === id ? { ...location, lat: coords.lat, lng: coords.lng } : location
      )
    );
  };

  const handleSelectPlacementType = (typeId) => {
    setActivePlacementTypeId(typeId);
  };

  const handlePlaceMarker = (latlng, markerType) => {
    if (!markerType) return;
    const newLocation = (() => {
      const nextId =
        locations.reduce(
          (maxId, location) => (typeof location.id === 'number' ? Math.max(maxId, location.id) : maxId),
          0
        ) + 1;
      return {
        id: nextId,
        name: `New ${markerType.label}`,
        type: markerType.label,
        description: '',
        lore: '',
        lat: latlng.lat,
        lng: latlng.lng,
        glowColor: markerType.glowColor,
      };
    })();
    setLocations((prev) => [...prev, newLocation]);
    setSelectedLocationId(null);
    setEditorSelection({
      id: newLocation.id,
      draft: {
        name: newLocation.name,
        type: newLocation.type,
        description: newLocation.description,
      },
    });
  };

  const handleJsonBufferChange = (value) => {
    setJsonBuffer(value);
    setImportError('');
  };

  const handleExportJson = () => {
    setJsonBuffer(JSON.stringify(locations, null, 2));
    setImportError('');
  };

  const handleImportJson = () => {
    try {
      const trimmed = jsonBuffer.trim();
      if (!trimmed) {
        throw new Error('Please provide JSON to import.');
      }
      const parsed = JSON.parse(trimmed);
      if (!Array.isArray(parsed)) {
        throw new Error('JSON must be an array of locations.');
      }
      const normalized = parsed.map((entry, index) => ({
        id: typeof entry.id === 'number' ? entry.id : index + 1,
        name: entry.name ?? `Location ${index + 1}`,
        type: entry.type ?? 'Unknown',
        description: entry.description ?? '',
        lore: entry.lore ?? '',
        lat: typeof entry.lat === 'number' ? entry.lat : 0,
        lng: typeof entry.lng === 'number' ? entry.lng : 0,
        glowColor: entry.glowColor ?? '#FFD700',
      }));
      setLocations(normalized);
      skipNextAutoSaveRef.current = true;
      setSelectedLocationId(null);
      setEditorSelection(null);
      setImportError('');
      setJsonBuffer(JSON.stringify(normalized, null, 2));
    } catch (error) {
      setImportError(error.message || 'Unable to import JSON.');
    }
  };

  const handleServerSave = useCallback(
    async (nextLocations) => {
      if (!token) {
        setSaveWarning('Please sign in again to save changes.');
        return;
      }
      try {
        const response = await fetch(`${API_BASE_URL}/locations/save`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ locations: nextLocations }),
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'Failed to save locations.');
        }
        skipNextAutoSaveRef.current = true;
        setLocations(data.locations);
        lastSavedSnapshotRef.current = JSON.stringify(data.locations);
        setSaveWarning('');
      } catch (error) {
        console.error('Unable to save locations', error);
        setSaveWarning(error.message || 'Unable to save locations right now.');
      }
    },
    [token]
  );

  useEffect(() => {
    if (isEditorMode) {
      setSelectedLocationId(null);
    } else {
      setEditorSelection(null);
      setActivePlacementTypeId(null);
    }
  }, [isEditorMode]);

  useEffect(() => {
    if (!isEditorMode) {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = null;
      }
      lastSavedSnapshotRef.current = serializedLocations;
      setSaveWarning('');
      return;
    }

    if (!canAutoSave) {
      if (serializedLocations !== lastSavedSnapshotRef.current) {
        setSaveWarning('Only approved editors can save changes to the shared map.');
        lastSavedSnapshotRef.current = serializedLocations;
      }
      return;
    }

    if (!token) {
      setSaveWarning('Please sign in again to save changes.');
      return;
    }

    setSaveWarning('');

    if (skipNextAutoSaveRef.current) {
      skipNextAutoSaveRef.current = false;
      lastSavedSnapshotRef.current = serializedLocations;
      return;
    }

    if (serializedLocations === lastSavedSnapshotRef.current) return;

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      saveTimeoutRef.current = null;
      handleServerSave(locations);
    }, 400);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = null;
      }
    };
  }, [serializedLocations, isEditorMode, canAutoSave, handleServerSave, locations, token]);

  const selectedLocation =
    locations.find((location) => location.id === selectedLocationId) || null;

  const editorDraft = editorSelection?.draft ?? null;
  const editorMarkerName =
    editorSelection
      ? locations.find((location) => location.id === editorSelection.id)?.name || ''
      : '';

  const handleEditorFieldChange = (field, value) => {
    setEditorSelection((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        draft: {
          ...prev.draft,
          [field]: value,
        },
      };
    });
  };

  const handleEditorSave = () => {
    if (!editorSelection) return;
    setLocations((prev) =>
      prev.map((location) =>
        location.id === editorSelection.id ? { ...location, ...editorSelection.draft } : location
      )
    );
    setEditorSelection(null);
    if (!canAutoSave) {
      setSaveWarning('Only approved editors can save changes to the shared map.');
    }
  };

  const handleEditorCancel = () => {
    setEditorSelection(null);
  };

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

  useEffect(() => {
    if (!isIntroVisible) return;

    const preventWheelZoom = (event) => {
      if (event.ctrlKey) {
        event.preventDefault();
      }
    };

    const preventKeyZoom = (event) => {
      if (
        (event.ctrlKey || event.metaKey) &&
        ['+', '-', '=', '_', '0'].includes(event.key)
      ) {
        event.preventDefault();
      }
    };

    const preventGesture = (event) => {
      event.preventDefault();
    };

    window.addEventListener('wheel', preventWheelZoom, { passive: false });
    window.addEventListener('keydown', preventKeyZoom, { passive: false });
    window.addEventListener('gesturestart', preventGesture, { passive: false });
    window.addEventListener('gesturechange', preventGesture, { passive: false });

    return () => {
      window.removeEventListener('wheel', preventWheelZoom);
      window.removeEventListener('keydown', preventKeyZoom);
      window.removeEventListener('gesturestart', preventGesture);
      window.removeEventListener('gesturechange', preventGesture);
    };
  }, [isIntroVisible]);

  const handleIntroFinish = () => {
    introShownThisSession = true;
    setIsIntroVisible(false);
  };

  return (
    <div className={`map-wrapper ${isIntroVisible ? 'map-wrapper--locked' : ''}`}>
      <MapContainer
        center={center}
        zoom={zoom}
        minZoom={INTERACTIVE_MIN_ZOOM_LEVEL}
        maxZoom={INTERACTIVE_MAX_ZOOM_LEVEL}
        maxBounds={MAP_BOUNDS}
        maxBoundsViscosity={0.8}
        crs={TILESET_CRS}
        className="leaflet-map"
        scrollWheelZoom={true}
        dragging={true}
        doubleClickZoom={true}
        zoomControl={false}
        zoomSnap={ZOOM_SNAP}
        zoomDelta={ZOOM_DELTA}
        wheelPxPerZoomLevel={WHEEL_PX_PER_ZOOM_LEVEL}
        whenCreated={setMapInstance}
        style={{ height: '80vh', width: '100%' }}
      >
        <TileLayer
          url={TILE_URL}
          tileSize={TILE_SIZE}
          minZoom={INTERACTIVE_MIN_ZOOM_LEVEL}
          maxZoom={INTERACTIVE_MAX_ZOOM_LEVEL}
          maxNativeZoom={TILE_MAX_ZOOM_LEVEL}
          minNativeZoom={TILE_MIN_ZOOM_LEVEL}
          noWrap={true}
          keepBuffer={4}
        />
        <EditorPlacementHandler
          isEnabled={isEditorMode && !editorSelection}
          selectedType={activeMarkerType}
          onPlaceMarker={handlePlaceMarker}
        />
        <KeyboardControls />
        <ZoomControls />
        {locations.map((location) => (
          <LocationMarker
            key={location.id}
            location={location}
            onLocationClick={handleLocationClick}
            isSelected={selectedLocation && selectedLocation.id === location.id}
            isEditorMode={isEditorMode}
            onDragEnd={handleMarkerDragEnd}
          />
        ))}
      </MapContainer>
      <EditorToolbox
        isEditorMode={isEditorMode}
        selectedTypeId={activePlacementTypeId}
        onSelectType={handleSelectPlacementType}
        jsonBuffer={jsonBuffer}
        onJsonChange={handleJsonBufferChange}
        onExportJson={handleExportJson}
        onImportJson={handleImportJson}
        importError={importError}
      />
      {selectedLocation && (
        <SidePanel
          location={selectedLocation}
          onClose={handleClosePanel}
        />
      )}
      {isEditorMode && (
        <EditorInfoPanel
          isOpen={Boolean(editorSelection)}
          draft={editorDraft}
          markerName={editorMarkerName}
          onFieldChange={handleEditorFieldChange}
          onSave={handleEditorSave}
          onCancel={handleEditorCancel}
          canAutoSave={canAutoSave}
          saveWarning={saveWarning}
        />
      )}
      {isIntroVisible && (
        <IntroOverlay onFinish={handleIntroFinish} />
      )}
    </div>
  );
}

export default InteractiveMap;
