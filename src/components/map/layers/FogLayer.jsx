import React, { useEffect, useMemo, useState } from 'react';

const FOG_TEXTURES = ['fog/fog-1.png', 'fog/fog-2.png', 'fog/fog-3.png'];

const computeOpacity = (zoom = 0) => {
  if (zoom >= 6) return 0;
  if (zoom >= 4) return 0.08;
  return 0.14;
};

function FogLayer({ enabled = true, map }) {
  const [opacity, setOpacity] = useState(() => computeOpacity(map?.getZoom?.() ?? 0));
  const texture = useMemo(() => {
    const choice = FOG_TEXTURES[Math.floor(Math.random() * FOG_TEXTURES.length)];
    const base = import.meta.env.BASE_URL || '/';
    return `${base}${choice}`;
  }, []);

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
      style={{
        opacity,
        backgroundImage: `url(${texture}), radial-gradient(circle, rgba(255,255,255,0.12), transparent 65%)`,
        backgroundSize: '1200px auto, cover',
        backgroundRepeat: 'repeat, no-repeat',
      }}
      aria-hidden="true"
    />
  );
}

export default FogLayer;
