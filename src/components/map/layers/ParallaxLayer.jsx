import React from 'react';

function ParallaxLayer({ enabled = true }) {
  if (!enabled) return null;
  return (
    <div className="map-layer map-layer--parallax" aria-hidden="true">
      {/* TODO: Implement parallax layers based on map position */}
      {/* TODO: Future heightmap integration point */}
    </div>
  );
}

export default ParallaxLayer;
