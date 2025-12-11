import React, { useEffect, useState } from 'react';

const TEXTURE_PRIMARY = 'cloud-4.png';
const TEXTURE_SECONDARY = 'cloud-5.png';

// Zoom Configuration
const ZOOM_FOG_START = 2; 
const ZOOM_FOG_END = 4;   
const MAX_OPACITY = 0.45; 

const computeOpacity = (zoom = 0) => {
  if (zoom <= ZOOM_FOG_START) return MAX_OPACITY;
  if (zoom >= ZOOM_FOG_END) return 0;
  const progress = (zoom - ZOOM_FOG_START) / (ZOOM_FOG_END - ZOOM_FOG_START);
  return MAX_OPACITY * (1 - progress);
};

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

function CloudLayer({ enabled = true, map, intensity = 1, onDiagnostics }) {
    const [zoomOpacity, setZoomOpacity] = useState(() => 
    map ? computeOpacity(map.getZoom()) : MAX_OPACITY
  );
  
  const base = import.meta.env.BASE_URL || '/';
  const cleanBase = base.endsWith('/') ? base.slice(0, -1) : base;
  const urlPrimary = `${cleanBase}/clouds/${TEXTURE_PRIMARY}`;
  const urlSecondary = `${cleanBase}/clouds/${TEXTURE_SECONDARY}`;

  useEffect(() => {
    onDiagnostics?.('clouds', { status: 'ok', message: 'Active (Dynamic Zoom)' });
  }, [onDiagnostics]);

  useEffect(() => {
    if (!map) return;

    const handleZoom = () => {
        const currentZoom = map.getZoom();
        setZoomOpacity(computeOpacity(currentZoom));
    };

    map.on('zoom', handleZoom);
    handleZoom();

    return () => {
      map.off('zoom', handleZoom);
    };
  }, [map]); 

  if (!enabled) return null;

  const finalOpacity = clamp(zoomOpacity * intensity, 0, 1);

  
  if (finalOpacity <= 0.01) return null;

  const sharedStyle = {
    position: 'absolute',
    inset: -500, 
    backgroundRepeat: 'repeat',
    mixBlendMode: 'screen', 
    pointerEvents: 'none',
  };

  return (
    <div
      style={{
        zIndex: 100,
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        opacity: finalOpacity,
        transition: 'opacity 0.3s ease-out', 
        overflow: 'hidden',
        filter: 'blur(2px) contrast(1.2) brightness(1.3)',
      }}
    >
      <div 
        className="animate-fog-primary"
        style={{
          ...sharedStyle,
          backgroundImage: `url(${urlPrimary})`,
          backgroundSize: '1600px auto', 
          opacity: 0.6, 
        }} 
      />
      <div 
        className="animate-fog-secondary"
        style={{
          ...sharedStyle,
          backgroundImage: `url(${urlSecondary})`,
          backgroundSize: '1200px auto',
          opacity: 0.4, 
        }} 
      />
    </div>
  );
}

export default CloudLayer;