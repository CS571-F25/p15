import React from 'react';

function RegionLayer({ enabled = true }) {
  if (!enabled) return null;
  return (
    <svg className="map-layer map-layer--regions" aria-hidden="true">
      {/* TODO: Polygon rendering for regions (factions, provinces, danger zones, etc.) */}
      {/* TODO: Fill colors, outlines, editor mode integration will be implemented later. */}
    </svg>
  );
}

export default RegionLayer;
