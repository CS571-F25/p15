import React, { useEffect, useMemo, useRef, useState } from 'react';

const FOG_TEXTURES = ['fog/fog-1.png', 'fog/fog-2.png', 'fog/fog-3.png'];

const computeOpacity = (zoom = 0) => {
  if (zoom >= 6) return 0;
  if (zoom >= 4) return 0.08;
  return 0.14;
};

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

function FogLayer({ enabled = true, map, intensity = 1, onDiagnostics }) {
  const layerRef = useRef(null);
  const [loaded, setLoaded] = useState(false);
  const [opacity, setOpacity] = useState(() => computeOpacity(map?.getZoom?.() ?? 0));
  const texture = useMemo(() => {
    const choice = FOG_TEXTURES[Math.floor(Math.random() * FOG_TEXTURES.length)];
    const base = import.meta.env.BASE_URL || '/';
    return `${base}${choice}`;
  }, []);

  useEffect(() => {
    if (!texture) return undefined;
    const img = new Image();
    img.onload = () => {
      setLoaded(true);
      onDiagnostics?.('fog', { status: 'ok', message: 'Fog texture loaded', src: texture });
    };
    img.onerror = () => {
      setLoaded(false);
      onDiagnostics?.('fog', { status: 'error', message: 'Fog texture missing', src: texture });
    };
    img.src = texture;
    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [texture, onDiagnostics]);

  useEffect(() => {
    if (!map) return undefined;
    const handleZoom = () => setOpacity(computeOpacity(map.getZoom()));
    map.on('zoomend', handleZoom);
    return () => map.off('zoomend', handleZoom);
  }, [map]);

  useEffect(() => {
    if (!enabled) {
      onDiagnostics?.('fog', { status: 'off', message: 'Fog layer disabled' });
      return;
    }
    if (!map) {
      onDiagnostics?.('fog', { status: 'pending', message: 'Fog layer waiting for map' });
      return;
    }
    if (loaded) {
      const finalOpacity = clamp(opacity * intensity, 0, 1);
      onDiagnostics?.('fog', {
        status: 'ok',
        message: `Fog layer active (opacity ${finalOpacity.toFixed(2)})`,
      });
    }
  }, [enabled, loaded, opacity, intensity, onDiagnostics, map]);

  if (!enabled || !map) return null;

  const finalOpacity = clamp(opacity * intensity, 0, 1);
  const visibleOpacity = loaded ? finalOpacity : 0;

  return (
    <div
      ref={layerRef}
      className="map-layer map-layer--fog"
      style={{
        '--layer-opacity': visibleOpacity,
        backgroundImage: `url(${texture}), radial-gradient(circle, rgba(255,255,255,0.12), transparent 65%)`,
        backgroundSize: '1200px auto, cover',
        backgroundRepeat: 'repeat, no-repeat',
        opacity: visibleOpacity,
      }}
      aria-hidden="true"
    />
  );
}

export default FogLayer;
