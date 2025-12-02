import React from 'react';

function MapFiltersPanel({
  isOpen,
  onToggleOpen,
  showLocations,
  onToggleLocations,
  locationOptions = [],
  locationFilters = {},
  onToggleLocationFilter,
  showRegions,
  onToggleRegions,
  regionOptions = [],
  regionFilters = {},
  onToggleRegionFilter,
}) {
  const renderLocationOptions = () =>
    locationOptions.map((option) => (
      <label key={option.id} className="filter-option">
        <input
          type="checkbox"
          checked={locationFilters[option.id] !== false}
          onChange={(event) => onToggleLocationFilter(option.id, event.target.checked)}
          disabled={!showLocations}
        />
        <span>{option.label}</span>
      </label>
    ));

  const renderRegionOptions = () =>
    regionOptions.map((option) => (
      <label key={option.id} className="filter-option">
        <input
          type="checkbox"
          checked={regionFilters[option.id] !== false}
          onChange={(event) => onToggleRegionFilter(option.id, event.target.checked)}
          disabled={!showRegions}
        />
        <span>{option.label}</span>
      </label>
    ));

  return (
    <div className={`map-filters-panel ${isOpen ? 'map-filters-panel--open' : ''}`}>
      <button
        type="button"
        className="map-filters-panel__toggle"
        onClick={onToggleOpen}
        aria-expanded={isOpen}
      >
        {isOpen ? 'Close Filters' : 'Filters'}
      </button>
      <div className="map-filters-panel__content custom-scrollbar" aria-hidden={!isOpen}>
        <section className="map-filters-panel__section">
          <header>
            <h3>Locations</h3>
            <label className="filter-toggle">
              <input type="checkbox" checked={showLocations} onChange={onToggleLocations} />
              <span>Show</span>
            </label>
          </header>
          <div className="filter-options">{renderLocationOptions()}</div>
        </section>
        <section className="map-filters-panel__section">
          <header>
            <h3>Regions</h3>
            <label className="filter-toggle">
              <input type="checkbox" checked={showRegions} onChange={onToggleRegions} />
              <span>Show</span>
            </label>
          </header>
          <div className="filter-options">{renderRegionOptions()}</div>
        </section>
      </div>
    </div>
  );
}

export default MapFiltersPanel;
