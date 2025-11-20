import React, { useEffect, useState } from 'react';

const computeOpacity = (zoom = 0) => {
  if (zoom >= 6) return 0.02;
  if (zoom >= 4) return 0.04;
  return 0.06;
};

function CloudLayer({ enabled = true, map }) {
  const [opacity, setOpacity] = useState(() => computeOpacity(map?.getZoom?.() ?? 0));
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!map) return undefined;
    const handleZoom = () => setOpacity(computeOpacity(map.getZoom()));
    const handleMove = () => {
      const center = map.getCenter();
      setOffset({
        x: (center.lng % 5) * 0.5,
        y: (center.lat % 5) * 0.5,
      });
    };
    map.on('zoomend', handleZoom);
    map.on('move', handleMove);
    return () => {
      map.off('zoomend', handleZoom);
      map.off('move', handleMove);
    };
  }, [map]);

  if (!enabled || !map) return null;

  return (
    <div
      className="map-layer map-layer--clouds"
      style={{ opacity, transform: `translate(${offset.x}px, ${offset.y}px)` }}
      aria-hidden="true"
    />
  );
}

export default CloudLayer;
