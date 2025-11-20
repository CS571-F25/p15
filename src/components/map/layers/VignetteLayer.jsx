import React from 'react';

function VignetteLayer({ enabled = true }) {
  if (!enabled) return null;
  return <div className="map-layer map-layer--vignette" aria-hidden="true" />;
}

export default VignetteLayer;
