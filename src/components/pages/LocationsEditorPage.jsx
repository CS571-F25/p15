import React, { useMemo, useState } from 'react';
import { useLocationData } from '../../context/LocationDataContext';
import { useRegions } from '../../context/RegionDataContext';
import { useAuth } from '../../context/AuthContext';
import './LocationsEditorPage.css';

const CATEGORY_TABS = [
  { id: 'all', label: 'All Features' },
  {
    id: 'cities',
    label: 'Cities',
    keywords: ['city', 'town', 'village', 'harbor', 'port', 'citadel', 'capital', 'settlement'],
  },
  {
    id: 'dungeons',
    label: 'Dungeons',
    keywords: ['dungeon', 'ruins', 'crypt', 'vault', 'catacomb', 'temple', 'cavern', 'lair'],
  },
  {
    id: 'monsters',
    label: 'Monsters',
    keywords: ['monster', 'beast', 'dragon', 'wyrm', 'den', 'nest', 'encounter', 'hunt'],
  },
  {
    id: 'landmarks',
    label: 'Landmarks',
    keywords: ['landmark', 'library', 'tower', 'monument', 'statue', 'grove', 'forest', 'mountain'],
  },
];

const INITIAL_FILTERS = {
  search: '',
  region: 'all',
  type: 'all',
};

const locationMatchesCategory = (location, tabId) => {
  if (tabId === 'all') return true;
  const tab = CATEGORY_TABS.find(({ id }) => id === tabId);
  if (!tab || !tab.keywords?.length) return true;

  const normalizedFields = [
    (location.type || '').toLowerCase(),
    (location.category || '').toLowerCase(),
    (location.subtype || '').toLowerCase(),
    (location.name || '').toLowerCase(),
    (location.description || '').toLowerCase(),
    (location.lore || '').toLowerCase(),
  ];

  if (Array.isArray(location.tags)) {
    location.tags.forEach((tag) => normalizedFields.push(String(tag).toLowerCase()));
  }

  return tab.keywords.some((keyword) =>
    normalizedFields.some((field) => field && field.includes(keyword.toLowerCase()))
  );
};

export default function LocationsEditorPage() {
  const { locations, setLocations, selectLocation, selectedLocationId } = useLocationData();
  const { regions: regionList = [] } = useRegions();
  const { role, user } = useAuth();
  const [activeTab, setActiveTab] = useState('all');
  const [filters, setFilters] = useState(() => ({ ...INITIAL_FILTERS }));
  const [status, setStatus] = useState('');

  const sortedRegions = useMemo(
    () => [...regionList].sort((a, b) => a.name.localeCompare(b.name)),
    [regionList]
  );

  const typeOptions = useMemo(() => {
    const optionMap = new Map();
    locations.forEach((location) => {
      const rawType = (location.type || '').trim();
      if (!rawType) return;
      const normalized = rawType.toLowerCase();
      if (!optionMap.has(normalized)) {
        optionMap.set(normalized, rawType);
      }
    });
    return Array.from(optionMap.entries())
      .map(([value, label]) => ({ value, label }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [locations]);

  const tabCounts = useMemo(() => {
    const counts = CATEGORY_TABS.reduce(
      (acc, tab) => ({
        ...acc,
        [tab.id]: 0,
      }),
      {}
    );
    locations.forEach((location) => {
      CATEGORY_TABS.forEach((tab) => {
        if (locationMatchesCategory(location, tab.id)) {
          counts[tab.id] = (counts[tab.id] || 0) + 1;
        }
      });
    });
    return counts;
  }, [locations]);

  const filteredLocations = useMemo(() => {
    const searchValue = filters.search.trim().toLowerCase();
    return locations.filter((location) => {
      if (!locationMatchesCategory(location, activeTab)) {
        return false;
      }
      if (filters.type !== 'all') {
        const locationType = (location.type || '').toLowerCase();
        if (locationType !== filters.type) {
          return false;
        }
      }
      if (filters.region !== 'all') {
        if (String(location.regionId ?? '') !== filters.region) {
          return false;
        }
      }
      if (searchValue) {
        const haystack = [
          location.name,
          location.description,
          location.lore,
          location.type,
          location.category,
          Array.isArray(location.tags) ? location.tags.join(' ') : '',
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(searchValue)) {
          return false;
        }
      }
      return true;
    });
  }, [locations, activeTab, filters]);

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleClearFilters = () => {
    setFilters({ ...INITIAL_FILTERS });
  };

  const canClearFilters =
    Boolean(filters.search.trim()) || filters.region !== 'all' || filters.type !== 'all';

  const handleFieldChange = (id, field, value) => {
    setLocations((prev) =>
      prev.map((location) =>
        location.id === id
          ? {
              ...location,
              [field]: field === 'regionId' ? (value || null) : value,
            }
          : location
      )
    );
  };

  const handleSaveAll = async () => {
    if (!user || (role !== 'editor' && role !== 'admin')) {
      setStatus('Only editors/admins can save.');
      setTimeout(() => setStatus(''), 3000);
      return;
    }
    setStatus('Saving changes...');
    try {
      const response = await fetch('/api/locations/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ locations }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Save failed');
      }
      if (Array.isArray(data.locations)) {
        setLocations(data.locations);
      }
      setStatus('Saved.');
    } catch (error) {
      console.error('Save failed', error);
      setStatus(error.message || 'Save failed.');
    } finally {
      setTimeout(() => setStatus(''), 3000);
    }
  };

  const getRegionName = (regionId) => {
    if (!regionId) {
      return 'No region';
    }
    const region = regionList.find((entry) => String(entry.id) === String(regionId));
    return region?.name || 'Unknown Region';
  };

  return (
    <div className="locations-page">
      <header className="locations-header">
        <div className="locations-header__title">
          <h1>Atlas Editor</h1>
          <p className="locations-subtitle">
            Curate and organize every map feature before publishing it to the reader-friendly atlas.
          </p>
        </div>
        <div className="locations-header__cta">
          <button type="button" className="save-button" onClick={handleSaveAll}>
            Save Changes
          </button>
          {status && <p className="save-status">{status}</p>}
        </div>
      </header>

      <section className="locations-tabs" role="tablist" aria-label="Location categories">
        {CATEGORY_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            className={`locations-tab ${activeTab === tab.id ? 'locations-tab--active' : ''}`}
            tabIndex={activeTab === tab.id ? 0 : -1}
            onClick={() => setActiveTab(tab.id)}
          >
            <span>{tab.label}</span>
            <span className="locations-tab__count">{tabCounts[tab.id] ?? 0}</span>
          </button>
        ))}
      </section>

      <section className="locations-filter-panel" aria-label="Location filters">
        <div className="filter-field filter-field--search">
          <label htmlFor="locations-search">Search</label>
          <input
            id="locations-search"
            type="search"
            placeholder="Name, lore, description..."
            value={filters.search}
            onChange={(event) => handleFilterChange('search', event.target.value)}
          />
        </div>
        <div className="filter-field">
          <label htmlFor="locations-region">Region</label>
          <select
            id="locations-region"
            value={filters.region}
            onChange={(event) => handleFilterChange('region', event.target.value)}
          >
            <option value="all">All Regions</option>
            {sortedRegions.map((region) => (
              <option key={region.id} value={String(region.id)}>
                {region.name}
              </option>
            ))}
          </select>
        </div>
        <div className="filter-field">
          <label htmlFor="locations-type">Type</label>
          <select
            id="locations-type"
            value={filters.type}
            onChange={(event) => handleFilterChange('type', event.target.value)}
          >
            <option value="all">All Types</option>
            {typeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div className="filter-actions">
          <button
            type="button"
            className="filter-clear"
            onClick={handleClearFilters}
            disabled={!canClearFilters}
          >
            Clear Filters
          </button>
        </div>
      </section>

      <section className="locations-grid">
        {filteredLocations.map((location) => (
          <article
            key={location.id}
            className={`location-card ${
              selectedLocationId === location.id ? 'location-card--selected' : ''
            }`}
            onClick={() => selectLocation(location.id)}
            role="button"
            tabIndex={0}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                selectLocation(location.id);
              }
            }}
          >
            <div className="location-card__header">
              <input
                type="text"
                value={location.name || ''}
                onChange={(event) => handleFieldChange(location.id, 'name', event.target.value)}
                placeholder="Location name"
              />
              <select
                value={location.type || 'generic'}
                onChange={(event) => handleFieldChange(location.id, 'type', event.target.value)}
              >
                <option value="city">City</option>
                <option value="town">Town</option>
                <option value="dungeon">Dungeon</option>
                <option value="landmark">Landmark</option>
                <option value="generic">Generic</option>
              </select>
            </div>
            <textarea
              value={location.description || ''}
              onChange={(event) => handleFieldChange(location.id, 'description', event.target.value)}
              placeholder="Description"
              rows={3}
            />
            <p className="location-card__region">Region: {getRegionName(location.regionId)}</p>
          </article>
        ))}
        {!filteredLocations.length && (
          <p className="locations-empty">No locations match this filter.</p>
        )}
      </section>
    </div>
  );
}
