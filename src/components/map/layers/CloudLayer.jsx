import React, { useEffect, useMemo, useState } from 'react';

const CLOUD_TEXTURES = ['clouds/cloud-1.png', 'clouds/cloud-2.png', 'clouds/cloud-3.png'];

const computeOpacity = (zoom = 0) => {
  if (zoom >= 6) return 0.05;
  if (zoom >= 4) return 0.08;
  return 0.12;
};

function CloudLayer({ enabled = true, map }) {
  const [opacity, setOpacity] = useState(() => computeOpacity(map?.getZoom?.() ?? 0));
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const texture = useMemo(() => {
    const choice = CLOUD_TEXTURES[Math.floor(Math.random() * CLOUD_TEXTURES.length)];
    const base = import.meta.env.BASE_URL || '/';
    return `${base}${choice}`;
  }, []);

  useEffect(() => {
    if (!map) return undefined;
    const handleZoom = () => setOpacity(computeOpacity(map.getZoom()));
    const handleMove = () => {
      const center = map.getCenter();
      setOffset({
        x: (center.lng % 10) * 0.3,
        y: (center.lat % 10) * 0.3,
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
      style={{
        opacity,
        transform: `translate(${offset.x}px, ${offset.y}px)`,
        backgroundImage: `url(${texture}), radial-gradient(circle at 20% 20%, rgba(255, 255, 255, 0.2), transparent 60%)`,
        backgroundSize: '900px auto, cover',
        backgroundRepeat: 'repeat, no-repeat',
      }}
      aria-hidden="true"
    />
  );
}

export default CloudLayer;
