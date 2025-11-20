import React, { useMemo, useState } from 'react';
import { useLocationData } from '../../context/LocationDataContext';
import { useRegions } from '../../context/RegionDataContext';
import { useAuth } from '../../context/AuthContext';
import './LocationsPage.css';

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'city', label: 'Cities' },
  { id: 'town', label: 'Towns' },
  { id: 'dungeon', label: 'Dungeons' },
];

export default function LocationsPage() {
  const { locations, setLocations, selectLocation, selectedLocationId } = useLocationData();
  const { regions } = useRegions();
  const { token, role } = useAuth();
  const [filter, setFilter] = useState('all');
  const [status, setStatus] = useState('');

  const filteredLocations = useMemo(() => {
    if (filter === 'all') return locations;
    return locations.filter((location) => (location.type || '').toLowerCase() === filter);
  }, [locations, filter]);

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
    if (!token || (role !== 'editor' && role !== 'admin')) {
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
          Authorization: `Bearer ${token}`,
        },
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

  const getRegionName = (regionId) =>
    regionId ? regions.find((region) => region.id === regionId)?.name || 'Unknown Region' : 'No region';

  return (
    <div className="locations-page">
      <header className="locations-header">
        <h1>Locations</h1>
        <div className="locations-actions">
          <div className="location-filters">
            {FILTERS.map(({ id, label }) => (
              <button
                key={id}
                type="button"
                className={`filter-button ${filter === id ? 'filter-button--active' : ''}`}
                onClick={() => setFilter(id)}
              >
                {label}
              </button>
            ))}
          </div>
          <button type="button" className="save-button" onClick={handleSaveAll}>
            Save Changes
          </button>
        </div>
        {status && <p className="save-status">{status}</p>}
      </header>
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
