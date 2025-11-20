import React, { useEffect, useState } from 'react';

const computeOpacity = (zoom = 0) => {
  if (zoom >= 6) return 0;
  if (zoom >= 4) return 0.05;
  return 0.1;
};

function FogLayer({ enabled = true, map }) {
  const [opacity, setOpacity] = useState(() => computeOpacity(map?.getZoom?.() ?? 0));

  useEffect(() => {
    if (!map) return undefined;
    const handleZoom = () => {
      setOpacity(computeOpacity(map.getZoom()));
    };
    map.on('zoomend', handleZoom);
    return () => map.off('zoomend', handleZoom);
  }, [map]);

  if (!enabled || !map) return null;

  return (
    <div
      className="map-layer map-layer--fog"
      style={{ opacity }}
      aria-hidden="true"
    />
  );
}

export default FogLayer;
