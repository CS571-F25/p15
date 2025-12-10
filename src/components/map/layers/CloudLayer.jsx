import React, { useEffect, useMemo, useRef, useState } from 'react';

const CLOUD_TEXTURES = ['clouds/cloud-1.png', 'clouds/cloud-2.png', 'clouds/cloud-3.png'];

const computeOpacity = (zoom = 0) => {
  if (zoom >= 6) return 0.05;
  if (zoom >= 4) return 0.08;
  return 0.12;
};

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

function CloudLayer({ enabled = true, map, intensity = 1, onDiagnostics }) {
  const layerRef = useRef(null);
  const [loaded, setLoaded] = useState(false);
  const [opacity, setOpacity] = useState(() => computeOpacity(map?.getZoom?.() ?? 0));
  const texture = useMemo(() => {
    const choice = CLOUD_TEXTURES[Math.floor(Math.random() * CLOUD_TEXTURES.length)];
    const base = import.meta.env.BASE_URL || '/';
    return `${base}${choice}`;
  }, []);

  useEffect(() => {
    if (!texture) return undefined;
    const img = new Image();
    img.onload = () => {
      setLoaded(true);
      onDiagnostics?.('clouds', { status: 'ok', message: 'Cloud texture loaded', src: texture });
    };
    img.onerror = () => {
      setLoaded(false);
      onDiagnostics?.('clouds', { status: 'error', message: 'Cloud texture missing', src: texture });
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
      onDiagnostics?.('clouds', { status: 'off', message: 'Cloud layer disabled' });
      return;
    }
    if (!map) {
      onDiagnostics?.('clouds', { status: 'pending', message: 'Cloud layer waiting for map' });
      return;
    }
    if (loaded) {
      const finalOpacity = clamp(opacity * intensity, 0, 1);
      onDiagnostics?.('clouds', {
        status: 'ok',
        message: `Cloud layer active (opacity ${finalOpacity.toFixed(2)})`,
      });
    }
  }, [enabled, loaded, opacity, intensity, onDiagnostics, map]);

  if (!enabled || !map) return null;

  const finalOpacity = clamp(opacity * intensity, 0, 1);
  const visibleOpacity = loaded ? finalOpacity : 0;

  return (
    <div
      ref={layerRef}
      className="map-layer map-layer--clouds"
      style={{
        '--layer-opacity': visibleOpacity,
        backgroundImage: `url(${texture}), radial-gradient(circle at 20% 20%, rgba(255, 255, 255, 0.2), transparent 60%)`,
        backgroundSize: '900px auto, cover',
        backgroundRepeat: 'repeat, no-repeat',
        opacity: visibleOpacity,
      }}
      aria-hidden="true"
    />
  );
}

export default CloudLayer;
