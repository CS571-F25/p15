import React, { useEffect, useRef } from 'react';

function HeatmapLayer({ enabled = true, map }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!enabled || !map) return undefined;

    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const resizeCanvas = () => {
      const size = map.getSize();
      canvas.width = size.x;
      canvas.height = size.y;
    };

    const redraw = () => {
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      // TODO: Implement real heatmap drawing in future phases.
    };

    resizeCanvas();
    redraw();

    const handleResize = () => {
      resizeCanvas();
      redraw();
    };

    map.on('zoomend', redraw);
    map.on('move', redraw);
    window.addEventListener('resize', handleResize);

    return () => {
      map.off('zoomend', redraw);
      map.off('move', redraw);
      window.removeEventListener('resize', handleResize);
    };
  }, [enabled, map]);

  if (!enabled || !map) return null;

  return <canvas ref={canvasRef} className="map-layer map-layer--heatmap" aria-hidden="true" />;
}

export default HeatmapLayer;
