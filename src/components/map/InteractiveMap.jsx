import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvent } from 'react-leaflet';
import SidePanel from '../UI/SidePanel';
import IntroOverlay from '../IntroOverlay';
import EditorInfoPanel from './EditorInfoPanel';
import { useAuth } from '../../context/AuthContext';
import { useMapEffects } from '../../context/MapEffectsContext';
import { useLocationData } from '../../context/LocationDataContext';
import VignetteLayer from './layers/VignetteLayer';
import FogLayer from './layers/FogLayer';
import CloudLayer from './layers/CloudLayer';
import HeatmapLayer from './layers/HeatmapLayer';
import RegionLayer from './layers/RegionLayer';
import ParallaxLayer from './layers/ParallaxLayer';
import MarkerPalette from './MarkerPalette';
import RegionInfoPanel from './RegionInfoPanel';
import EditorSidePanel from './EditorSidePanel';
import FilterHoverPanel from './FilterHoverPanel';
import { useRegions } from '../../context/RegionDataContext';
import {
  DEFAULT_REGION_CATEGORY,
  REGION_CATEGORIES,
  normalizeRegionEntry,
} from '../../constants/regionConstants';
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
  { id: 'landmark', label: 'Landmark', glowColor: '#FFDAB9' },
];

const GENERIC_MARKER_TYPE = { id: 'generic', label: 'Generic', glowColor: '#9ca3af' };
const TYPE_CONFIG = MARKER_TYPES.reduce(
  (acc, type) => ({ ...acc, [type.id]: type }),
  { [GENERIC_MARKER_TYPE.id]: GENERIC_MARKER_TYPE }
);

const LOCATION_FILTER_OPTIONS = [
  ...MARKER_TYPES.map((type) => ({ id: type.id, label: type.label })),
  { id: GENERIC_MARKER_TYPE.id, label: GENERIC_MARKER_TYPE.label },
];

const DEFAULT_TYPE_ICON = {
  city: 'city-gold',
  town: 'town-oak',
  dungeon: 'dungeon-abyss',
  landmark: 'landmark-spire',
  generic: 'city-gold',
};

const MARKER_ICON_OPTIONS = [
  { iconKey: 'city-gold', label: 'Gilded City', type: 'city' },
  { iconKey: 'city-blue', label: 'Azure City', type: 'city' },
  { iconKey: 'city-crimson', label: 'Crimson City', type: 'city' },
  { iconKey: 'city-emerald', label: 'Emerald City', type: 'city' },
  { iconKey: 'town-oak', label: 'Oak Town', type: 'town' },
  { iconKey: 'town-harbor', label: 'Harbor Town', type: 'town' },
  { iconKey: 'town-river', label: 'River Town', type: 'town' },
  { iconKey: 'dungeon-abyss', label: 'Abyss Dungeon', type: 'dungeon' },
  { iconKey: 'dungeon-ember', label: 'Ember Dungeon', type: 'dungeon' },
  { iconKey: 'landmark-spire', label: 'Sun Spire', type: 'landmark' },
  { iconKey: 'landmark-obelisk', label: 'Obelisk', type: 'landmark' },
  { iconKey: 'port-azure', label: 'Azure Port', type: 'city' },
  { iconKey: 'port-sunset', label: 'Sunset Port', type: 'city' },
  { iconKey: 'citadel-iron', label: 'Iron Citadel', type: 'city' },
  { iconKey: 'citadel-sun', label: 'Sun Citadel', type: 'city' },
  { iconKey: 'village-meadow', label: 'Meadow Village', type: 'town' },
  { iconKey: 'village-sand', label: 'Sand Village', type: 'town' },
  { iconKey: 'camp-northern', label: 'Northern Camp', type: 'landmark' },
  { iconKey: 'camp-jungle', label: 'Jungle Camp', type: 'landmark' },
  { iconKey: 'academy-star', label: 'Star Academy', type: 'landmark' },
];

const REGION_FILTER_OPTIONS = REGION_CATEGORIES.map((category) => ({
  id: category,
  label: category.charAt(0).toUpperCase() + category.slice(1),
}));

const createDefaultRegionFilters = () =>
  REGION_FILTER_OPTIONS.reduce((acc, option) => {
    acc[option.id] = true;
    return acc;
  }, {});

const normalizeCategoryId = (value) => {
  if (!value || typeof value !== 'string') return DEFAULT_REGION_CATEGORY;
  return value.toLowerCase();
};

const getDefaultIconKey = (typeId) => DEFAULT_TYPE_ICON[typeId] || DEFAULT_TYPE_ICON.generic;

const getTypeConfig = (type) => {
  if (!type) return GENERIC_MARKER_TYPE;
  const key = typeof type === 'string' ? type.toLowerCase() : type;
  return TYPE_CONFIG[key] || GENERIC_MARKER_TYPE;
};

const normalizeLocationEntry = (location) => {
  const typeConfig = getTypeConfig(location.type);
  const iconKey = location.iconKey || getDefaultIconKey(typeConfig.id);
  const lat = location.lat ?? location.x ?? 0;
  const lng = location.lng ?? location.y ?? 0;
  return {
    id: location.id,
    name: location.name || `${typeConfig.label}`,
    type: typeConfig.id,
    iconKey,
    lat,
    lng,
    x: location.x ?? lat,
    y: location.y ?? lng,
    description: location.description ?? '',
    category: location.category ?? typeConfig.label,
    tags: Array.isArray(location.tags) ? location.tags : [],
    regionId: location.regionId ?? null,
    glowColor: location.glowColor || typeConfig.glowColor,
  };
};

const normalizeLocations = (locations) => locations.map((location) => normalizeLocationEntry(location));

const getMarkerFilterKey = (typeId) => {
  const normalized = (typeId || '').toLowerCase();
  if (['city', 'town', 'dungeon', 'ruins', 'landmark', 'npc'].includes(normalized)) {
    return normalized;
  }
  if (normalized === 'generic') return 'generic';
  return 'custom';
};

const getPlacementConfig = ({ paletteItem, activeTypeId }) => {
  if (paletteItem) {
    return {
      typeId: paletteItem.type,
      label: paletteItem.label,
      iconKey: paletteItem.iconKey,
    };
  }
  if (activeTypeId) {
    const typeConfig = getTypeConfig(activeTypeId);
    return {
      typeId: typeConfig.id,
      label: typeConfig.label,
      iconKey: getDefaultIconKey(typeConfig.id),
    };
  }
  return null;
};

const TILE_SIZE = 256;
const TILE_MIN_ZOOM_LEVEL = 0;
const TILE_MAX_ZOOM_LEVEL = 5;
const INTERACTIVE_MAX_ZOOM_LEVEL = 7;
const INTERACTIVE_MIN_ZOOM_LEVEL = 3;
const MAP_PIXEL_WIDTH = TILE_SIZE * 20; // max zoom has 20 columns of tiles
const MAP_PIXEL_HEIGHT = TILE_SIZE * 15; // max zoom has 15 rows of tiles
const MAP_CENTER = [MAP_PIXEL_HEIGHT / 2, MAP_PIXEL_WIDTH / 2];
const MAP_PADDING_DEFAULT = {
  top: TILE_SIZE * 0.8,
  right: TILE_SIZE * 0.8,
  bottom: TILE_SIZE * 0.8,
  left: TILE_SIZE * 0.8,
};
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
const createGlowingIcon = (color = '#FFD700', typeId = 'generic', isHovered = false) => (
  L.divIcon({
    className: `custom-marker custom-marker--${typeId}`,
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
  showTypeButtons = true,
}) {
  if (!isEditorMode) return null;

  const selectedType = MARKER_TYPES.find((type) => type.id === selectedTypeId);

  return (
    <div className="editor-toolbox" aria-label="Editor toolbox">
      <div className="editor-toolbox__header">
        <p>Editor Toolbox</p>
        {showTypeButtons && (
          <span className="editor-toolbox__status">
            {selectedType ? `Placing: ${selectedType.label}` : 'Select a marker type'}
          </span>
        )}
      </div>
      {showTypeButtons && (
        <>
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
        </>
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

function EditorPlacementHandler({ isEnabled, onPlaceMarker }) {
  useMapEvent('click', (event) => {
    if (!isEnabled) return;
    onPlaceMarker(event.latlng);
  });
  return null;
}

function RegionDrawingHandler({ isActive, onAddPoint, onFinish }) {
  useMapEvent('click', (event) => {
    if (!isActive) return;
    onAddPoint(event.latlng);
  });

  useMapEvent('dblclick', (event) => {
    if (!isActive) return;
    event.originalEvent?.preventDefault();
    onFinish();
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
  zoomLevel,
}) {
  const [isHovered, setIsHovered] = useState(false);

  const iconSize = (() => {
    const base = 36;
    const scale = 1 + (zoomLevel - 4) * 0.08;
    return Math.min(Math.max(base * scale, 20), 60);
  })();

  return (
    <Marker
      position={[location.lat, location.lng]}
      draggable={isEditorMode}
      icon={L.divIcon({
        className: `custom-marker custom-marker--${location.type} ${
          isSelected ? 'custom-marker--selected' : ''
        }`,
        html: `
          <div class="custom-marker__wrapper ${isHovered ? 'is-hovered' : ''}">
            <img src="/icons/cities/${location.iconKey}.png" alt="${location.name}"
              class="custom-marker__image" style="width:${iconSize}px;height:${iconSize}px;" />
          </div>
        `,
        iconSize: [iconSize, iconSize],
        iconAnchor: [iconSize / 2, iconSize],
      })}
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
  const { cloudsEnabled, fogEnabled, vignetteEnabled, heatmapMode } = useMapEffects();
  const { locations, setLocations, selectedLocationId, selectLocation } = useLocationData();
  const { regions, setRegions, selectedRegionId: activeRegionId, selectRegion } = useRegions();
  const [editorSelection, setEditorSelection] = useState(null);
  const [activePlacementTypeId, setActivePlacementTypeId] = useState(null);
  const [selectedPaletteItem, setSelectedPaletteItem] = useState(null);
  const [jsonBuffer, setJsonBuffer] = useState('');
  const [importError, setImportError] = useState('');
  const [isIntroVisible, setIsIntroVisible] = useState(() => !introShownThisSession);
  const [mapInstance, setMapInstance] = useState(null);
  const [mapZoom, setMapZoom] = useState(2);
  const [isRegionMode, setIsRegionMode] = useState(false);
  const [regionDraftPoints, setRegionDraftPoints] = useState([]);
  const [showMarkers, setShowMarkers] = useState(true);
  const [markerFilters, setMarkerFilters] = useState({
    city: true,
    town: true,
    dungeon: true,
    ruins: true,
    landmark: true,
    npc: true,
    custom: true,
    generic: true,
  });
  const [showRegionsLayer, setShowRegionsLayer] = useState(true);
  const [regionFilters, setRegionFilters] = useState(() => createDefaultRegionFilters());
  const [particleFilters, setParticleFilters] = useState({
    snow: true,
    leaves: true,
    embers: true,
    magic: true,
    weather: true,
  });
  const saveTimeoutRef = useRef(null);
  const lastSavedSnapshotRef = useRef('[]');
  const skipNextAutoSaveRef = useRef(false);
  const regionSaveTimeoutRef = useRef(null);
  const lastRegionSnapshotRef = useRef('[]');
  const [saveWarning, setSaveWarning] = useState('');
  const center = MAP_CENTER;
  const zoom = 2;
  const activeMarkerType = MARKER_TYPES.find((type) => type.id === activePlacementTypeId) || null;
  const serializedLocations = useMemo(() => JSON.stringify(locations), [locations]);
  const serializedRegions = useMemo(() => JSON.stringify(regions), [regions]);
  const canAutoSave = role === 'editor' || role === 'admin';
  const filteredLocations = useMemo(
    () =>
      !showMarkers
        ? []
        : locations.filter((location) => {
            const key = getMarkerFilterKey(location.type);
            const flag = markerFilters[key];
            return flag !== false;
          }),
    [locations, markerFilters, showMarkers]
  );
  const filteredRegions = useMemo(
    () =>
      !showRegionsLayer && !isRegionMode
        ? []
        : regions.filter((region) => {
            if (isRegionMode && region.id === activeRegionId) return true;
            const categoryId = normalizeCategoryId(region.category);
            const flag = regionFilters[categoryId];
            return flag !== false;
          }),
    [regions, regionFilters, isRegionMode, activeRegionId, showRegionsLayer]
  );
  const regionLabelsEnabled = filteredRegions.some((region) => region.labelEnabled !== false);
  const mapBounds = useMemo(() => {
    const pad = MAP_PADDING_DEFAULT;
    return L.latLngBounds(
      [-pad.top, -pad.left],
      [MAP_PIXEL_HEIGHT + pad.bottom, MAP_PIXEL_WIDTH + pad.right]
    );
  }, []);
  const boundsViscosity = 0.95;
  useEffect(() => {
    let isMounted = true;
    const fetchLocations = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/locations`);
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'Failed to load locations.');
        }
        const nextLocations = Array.isArray(data.locations)
          ? normalizeLocations(data.locations)
          : normalizeLocations(getFallbackLocations());
        if (isMounted) {
          setLocations(nextLocations);
          lastSavedSnapshotRef.current = JSON.stringify(nextLocations);
          skipNextAutoSaveRef.current = true;
        }
      } catch (error) {
        console.error('Unable to load locations', error);
        if (isMounted) {
          const fallbackLocations = normalizeLocations(getFallbackLocations());
          setLocations(fallbackLocations);
          lastSavedSnapshotRef.current = JSON.stringify(fallbackLocations);
          skipNextAutoSaveRef.current = true;
        }
      }
    };
    fetchLocations();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    const fetchRegions = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/regions`);
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'Failed to load regions.');
        }
        if (isMounted) {
          const normalized = Array.isArray(data.regions) ? data.regions.map(normalizeRegionEntry) : [];
          setRegions(normalized);
          lastRegionSnapshotRef.current = JSON.stringify(normalized);
        }
      } catch (error) {
        console.error('Unable to load regions', error);
        if (isMounted) {
          setRegions([]);
          lastRegionSnapshotRef.current = '[]';
        }
      }
    };
    fetchRegions();
    return () => {
      isMounted = false;
    };
  }, [setRegions]);

  useEffect(() => {
    setRegionFilters((prev) => {
      let changed = false;
      const next = { ...prev };
      regions.forEach((region) => {
        const categoryId = normalizeCategoryId(region.category);
        if (!(categoryId in next)) {
          next[categoryId] = true;
          changed = true;
        }
      });
      return changed ? next : prev;
    });
  }, [regions]);

  const handleLocationClick = (location) => {
    selectLocation(location.id);
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
    const base = import.meta.env.BASE_URL || '/';
    window.location.href = `${base}location/${location.id}`;
  };

  const handleClosePanel = () => selectLocation(null);

  const handleMarkerDragEnd = (id, coords) => {
    setLocations((prev) =>
      prev.map((location) =>
        location.id === id ? { ...location, lat: coords.lat, lng: coords.lng } : location
      )
    );
  };

  const handleRegionPointAdd = (latlng) => {
    setRegionDraftPoints((prev) => [...prev, [latlng.lng, latlng.lat]]);
  };

  const focusRegionOnMap = (regionId) => {
    if (!mapInstance) return;
    const region = regions.find((entry) => entry.id === regionId);
    if (!region || !Array.isArray(region.points) || !region.points.length) return;
    const latLngs = region.points.map(([x, y]) => L.latLng(y, x));
    mapInstance.fitBounds(L.latLngBounds(latLngs).pad(0.2));
  };

  const updateRegionField = (regionId, field, value) => {
    setRegions((prev) =>
      prev.map((region) =>
        region.id === regionId
          ? {
              ...region,
              [field]:
                field === 'opacity'
                  ? Math.min(Math.max(Number(value) || 0, 0), 1)
                  : field === 'labelEnabled'
                  ? Boolean(value)
                  : value,
            }
          : region
      )
    );
  };

  const handleRegionFinish = () => {
    setRegionDraftPoints((prevPoints) => {
      if (prevPoints.length < 3) return prevPoints;
      const regionId = crypto.randomUUID ? crypto.randomUUID() : `region-${Date.now()}`;
    const newRegion = {
      id: regionId,
      name: 'New Region',
      color: '#f97316',
      borderColor: '#ea580c',
      opacity: 0.3,
      category: DEFAULT_REGION_CATEGORY,
      labelEnabled: true,
      points: prevPoints.map(([x, y]) => [x, y]),
    };
      setRegions((existing) => [...existing, newRegion]);
      selectRegion(regionId);
      return [];
    });
  };

  const handleRegionDraftReset = () => {
    setRegionDraftPoints([]);
  };

  const handleSelectPaletteItem = (item) => {
    setSelectedPaletteItem((prev) => {
      const next = prev && prev.iconKey === item.iconKey ? null : item;
      setActivePlacementTypeId(next ? next.type : null);
      return next;
    });
  };

  const handleToggleRegionMode = () => {
    if (!canAutoSave) return;
    setIsRegionMode((prev) => {
      const next = !prev;
      if (!next) {
        setRegionDraftPoints([]);
        selectRegion(null);
      } else {
        setSelectedPaletteItem(null);
        setActivePlacementTypeId(null);
      }
      return next;
    });
  };

  const handleRegionFieldChange = (field, value) => {
    if (!activeRegionId) return;
    updateRegionField(activeRegionId, field, value);
  };

  const handleDeleteRegion = (targetId = activeRegionId) => {
    if (!targetId) return;
    if (!window.confirm('Delete this region?')) return;
    setRegions((prev) => prev.filter((region) => region.id !== targetId));
    if (activeRegionId === targetId) {
      selectRegion(null);
    }
  };

  const handleRegionClick = (regionId) => {
    if (isEditorMode) {
      selectRegion(regionId);
      setRegionDraftPoints([]);
    } else {
      const base = import.meta.env.BASE_URL || '/';
      window.location.href = `${base}region/${regionId}`;
    }
  };

  const handleAssignLocationToRegion = () => {
    if (!selectedLocation || !activeRegionId) return;
    setLocations((prev) =>
      prev.map((location) =>
        location.id === selectedLocation.id ? { ...location, regionId: activeRegionId } : location
      )
    );
  };

  const handleSelectPlacementType = (typeId) => {
    setActivePlacementTypeId(typeId);
    if (typeId) {
      setSelectedPaletteItem(null);
    }
  };

  const handlePlaceMarker = (latlng) => {
    const placementConfig = getPlacementConfig({
      paletteItem: selectedPaletteItem,
      activeTypeId: activePlacementTypeId,
    });
    if (!placementConfig) return;
    const typeConfig = getTypeConfig(placementConfig.typeId);
    const nextId =
      locations.reduce(
        (maxId, location) => (typeof location.id === 'number' ? Math.max(maxId, location.id) : maxId),
        0
      ) + 1;
    const newLocation = normalizeLocationEntry({
      id: nextId,
      name: placementConfig.label ? `New ${placementConfig.label}` : `New ${typeConfig.label}`,
      type: placementConfig.typeId,
      iconKey: placementConfig.iconKey,
      description: '',
      category: typeConfig.label,
      tags: [],
      regionId: null,
      lat: latlng.lat,
      lng: latlng.lng,
    });
    setLocations((prev) => [...prev, newLocation]);
    selectLocation(newLocation.id);
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
      const parsedLocations = parsed.map((entry, index) => ({
        id: typeof entry.id === 'number' ? entry.id : index + 1,
        name: entry.name ?? `Location ${index + 1}`,
        type: entry.type ?? 'generic',
        description: entry.description ?? '',
        lore: entry.lore ?? '',
        lat: typeof entry.lat === 'number' ? entry.lat : 0,
        lng: typeof entry.lng === 'number' ? entry.lng : 0,
        glowColor: entry.glowColor,
      }));
      const normalized = normalizeLocations(parsedLocations);
      setLocations(normalized);
      skipNextAutoSaveRef.current = true;
      selectLocation(null);
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
        const normalized = normalizeLocations(data.locations);
        setLocations(normalized);
        lastSavedSnapshotRef.current = JSON.stringify(normalized);
        setSaveWarning('');
      } catch (error) {
        console.error('Unable to save locations', error);
        setSaveWarning(error.message || 'Unable to save locations right now.');
      }
    },
    [token]
  );

  const handleRegionSave = useCallback(
    async (nextRegions) => {
      if (!token) return;
      try {
        const response = await fetch(`${API_BASE_URL}/regions/save`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ regions: nextRegions }),
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'Failed to save regions.');
        }
        const normalized = Array.isArray(data.regions)
          ? data.regions.map(normalizeRegionEntry)
          : [];
        setRegions(normalized);
        lastRegionSnapshotRef.current = JSON.stringify(normalized);
      } catch (error) {
        console.error('Unable to save regions', error);
      }
    },
    [token, setRegions]
  );

  useEffect(() => {
    if (isEditorMode) {
      selectLocation(null);
    } else {
      setEditorSelection(null);
      setActivePlacementTypeId(null);
      setIsRegionMode(false);
      setRegionDraftPoints([]);
      selectRegion(null);
    }
  }, [isEditorMode, selectLocation, selectRegion]);

  useEffect(() => {
    if (!isEditorMode) return;
    return () => {
      setIsRegionMode(false);
      setRegionDraftPoints([]);
    };
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

  useEffect(() => {
    if (!canAutoSave || !token) return;
    if (serializedRegions === lastRegionSnapshotRef.current) return;

    if (regionSaveTimeoutRef.current) {
      clearTimeout(regionSaveTimeoutRef.current);
    }

    regionSaveTimeoutRef.current = setTimeout(() => {
      regionSaveTimeoutRef.current = null;
      handleRegionSave(regions);
    }, 500);

    return () => {
      if (regionSaveTimeoutRef.current) {
        clearTimeout(regionSaveTimeoutRef.current);
        regionSaveTimeoutRef.current = null;
      }
    };
  }, [serializedRegions, canAutoSave, handleRegionSave, regions, token]);

  useEffect(() => () => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    if (regionSaveTimeoutRef.current) {
      clearTimeout(regionSaveTimeoutRef.current);
    }
  }, []);

  const selectedLocation =
    locations.find((location) => location.id === selectedLocationId) || null;
  const selectedRegion = regions.find((region) => region.id === activeRegionId) || null;

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
        location.id === editorSelection.id
          ? normalizeLocationEntry({ ...location, ...editorSelection.draft })
          : location
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

  const handleDeleteLocation = () => {
    if (!editorSelection) return;
    if (!canAutoSave) {
      setSaveWarning('Only approved editors can save changes to the shared map.');
      return;
    }
    const confirmed = typeof window === 'undefined' ? true : window.confirm('Are you sure you want to delete this location?');
    if (!confirmed) return;
    const targetId = editorSelection.id;
    setLocations((prev) => prev.filter((location) => location.id !== targetId));
    setEditorSelection(null);
    if (selectedLocationId === targetId) {
      selectLocation(null);
    }
  };

  const editorDraft = editorSelection?.draft ?? null;
  const markerPaletteNode = (
    <MarkerPalette
      isEditorMode={isEditorMode}
      options={MARKER_ICON_OPTIONS}
      selectedOption={selectedPaletteItem}
      onSelect={handleSelectPaletteItem}
      categoryOptions={MARKER_TYPES}
      groupByCategory
    />
  );
  const markerToolboxNode = (
    <EditorToolbox
      isEditorMode={isEditorMode}
      selectedTypeId={activePlacementTypeId}
      onSelectType={handleSelectPlacementType}
      jsonBuffer={jsonBuffer}
      onJsonChange={handleJsonBufferChange}
      onExportJson={handleExportJson}
      onImportJson={handleImportJson}
      importError={importError}
      showTypeButtons={false}
    />
  );
  const locationEditorNode = isEditorMode ? (
    <EditorInfoPanel
      isOpen={Boolean(editorSelection)}
      draft={editorDraft}
      onFieldChange={handleEditorFieldChange}
      onSave={handleEditorSave}
      onCancel={handleEditorCancel}
      canAutoSave={canAutoSave}
      saveWarning={saveWarning}
      canDelete={canAutoSave}
      onDelete={handleDeleteLocation}
    />
  ) : null;
  const regionInfoPanelNode = isEditorMode ? (
    <RegionInfoPanel
      isOpen={Boolean(activeRegionId)}
      onFieldChange={handleRegionFieldChange}
      onDelete={handleDeleteRegion}
      onClose={() => selectRegion(null)}
    />
  ) : null;

  useEffect(() => {
    if (!mapInstance) return;
    setMapZoom(mapInstance.getZoom());
    const handleZoomLevel = () => {
      setMapZoom(mapInstance.getZoom());
    };
    mapInstance.on('zoomend', handleZoomLevel);
    return () => mapInstance.off('zoomend', handleZoomLevel);
  }, [mapInstance]);

  useEffect(() => {
    if (!mapInstance) return;
    mapInstance.invalidateSize();
  }, [mapInstance, isEditorMode]);

  useEffect(() => {
    if (!mapInstance || !mapInstance.doubleClickZoom) return;
    if (isRegionMode) {
      mapInstance.doubleClickZoom.disable();
    } else {
      mapInstance.doubleClickZoom.enable();
    }
  }, [isRegionMode, mapInstance]);

  useEffect(() => {
    if (!isRegionMode) return undefined;
    const handleKey = (event) => {
      if (event.key === 'Escape') {
        setRegionDraftPoints([]);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isRegionMode]);

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

  useEffect(() => {
    if (mapInstance && mapBounds) {
      mapInstance.setMaxBounds(mapBounds);
      mapInstance.options.maxBoundsViscosity = boundsViscosity;
      mapInstance.panInsideBounds(mapBounds, { animate: false });
    }
  }, [mapInstance, mapBounds, boundsViscosity]);

  return (
    <div className={`map-wrapper ${isIntroVisible ? 'map-wrapper--locked' : ''}`}>
      <div className="map-layout">
        {isEditorMode && (
          <EditorSidePanel
            isEditorMode={isEditorMode}
            markerPalette={markerPaletteNode}
            markerToolbox={markerToolboxNode}
            locationEditor={locationEditorNode}
            regionInfoPanel={regionInfoPanelNode}
            regions={regions}
            activeRegionId={activeRegionId}
            onSelectRegion={selectRegion}
            onFocusRegion={focusRegionOnMap}
            onDeleteRegion={handleDeleteRegion}
            canAutoSave={canAutoSave}
            isRegionMode={isRegionMode}
            onToggleRegionMode={handleToggleRegionMode}
            regionDraftPoints={regionDraftPoints}
            onFinishRegion={handleRegionFinish}
            onResetRegionDraft={handleRegionDraftReset}
            canAssignSelection={Boolean(isEditorMode && selectedLocation && activeRegionId)}
            onAssignSelection={handleAssignLocationToRegion}
            selectedRegionName={selectedRegion?.name || ''}
            selectedLocationName={selectedLocation?.name || ''}
          />
        )}
        <div className="map-layout__canvas">
          <div className="map-container-wrapper">
            <MapContainer
              center={center}
              zoom={zoom}
              minZoom={INTERACTIVE_MIN_ZOOM_LEVEL}
              maxZoom={INTERACTIVE_MAX_ZOOM_LEVEL}
              {...(!isEditorMode ? { maxBounds: mapBounds, maxBoundsViscosity: boundsViscosity } : {})}
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
              style={{ height: '100%', width: '100%' }}
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
                isEnabled={
                  isEditorMode &&
                  !editorSelection &&
                  !isRegionMode &&
                  Boolean(selectedPaletteItem || activePlacementTypeId)
                }
                onPlaceMarker={handlePlaceMarker}
              />
              <RegionDrawingHandler
                isActive={isEditorMode && isRegionMode}
                onAddPoint={handleRegionPointAdd}
                onFinish={handleRegionFinish}
              />
              <KeyboardControls />
              <ZoomControls />
              {filteredLocations.map((location) => (
                <LocationMarker
                  key={location.id}
                  location={location}
                  onLocationClick={handleLocationClick}
                  isSelected={selectedLocation && selectedLocation.id === location.id}
                  isEditorMode={isEditorMode}
                  onDragEnd={handleMarkerDragEnd}
                  zoomLevel={mapZoom}
                />
              ))}
              <RegionLayer
                regions={filteredRegions}
                draftPoints={regionDraftPoints}
                selectedRegionId={activeRegionId}
                onRegionClick={handleRegionClick}
                interactionEnabled={isRegionMode}
                showLabels={regionLabelsEnabled}
                zoomLevel={mapZoom}
              />
            </MapContainer>
            <VignetteLayer enabled={vignetteEnabled} />
            <FogLayer enabled={fogEnabled} map={mapInstance} />
            <CloudLayer enabled={cloudsEnabled} map={mapInstance} />
            <HeatmapLayer
              enabled={heatmapMode !== 'none'}
              map={mapInstance}
              locations={filteredLocations}
              heatmapMode={heatmapMode}
            />
            <ParallaxLayer enabled />
          </div>
        </div>
      </div>
      {selectedLocation && (
        <SidePanel
          location={selectedLocation}
          onClose={handleClosePanel}
        />
      )}
      {isIntroVisible && (
        <IntroOverlay onFinish={handleIntroFinish} />
      )}
      <FilterHoverPanel
        showMarkers={showMarkers}
        markerFilters={markerFilters}
        onToggleMarkers={() => setShowMarkers((prev) => !prev)}
        onToggleMarkerCategory={(key, value) =>
          setMarkerFilters((prev) => ({ ...prev, [key]: value }))
        }
        showRegions={showRegionsLayer}
        onToggleRegions={() => setShowRegionsLayer((prev) => !prev)}
        particleFilters={particleFilters}
        onToggleParticle={(key, value) =>
          setParticleFilters((prev) => ({ ...prev, [key]: value }))
        }
      />
    </div>
  );
}

export default InteractiveMap;
