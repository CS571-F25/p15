import L from 'leaflet';
import React, { useEffect, useRef, useState } from 'react';

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
const computeVisibility = (zoom = 0) => {
  if (zoom <= 3.5) return 0;
  if (zoom >= 5.5) return 1;
  return clamp((zoom - 3.5) / 2, 0, 1);
};

const getLocationIntensity = (location, mode) => {
  const heatField = location.heat || {};
  const fromField = heatField?.[mode];
  if (typeof fromField === 'number') {
    return clamp(fromField > 1 ? fromField / 100 : fromField, 0, 1);
  }

  const type = (location.type || 'generic').toLowerCase();
  if (mode === 'magic') return 1;
  if (mode === 'danger') {
    if (type === 'dungeon' || type === 'ruins') return 1;
    if (type === 'city' || type === 'town') return 0.3;
    return 0.5;
  }
  if (mode === 'population') {
    if (type === 'city') return 1;
    if (type === 'town') return 0.7;
    return 0.2;
  }
  return 0;
};

const getHeatColor = (t) => {
  const stops = [
    { stop: 0, color: [59, 130, 246] }, // blue
    { stop: 0.5, color: [34, 197, 94] }, // green
    { stop: 0.75, color: [245, 158, 11] }, // orange
    { stop: 1, color: [239, 68, 68] }, // red
  ];
  for (let i = 0; i < stops.length - 1; i += 1) {
    const current = stops[i];
    const next = stops[i + 1];
    if (t >= current.stop && t <= next.stop) {
      const ratio = (t - current.stop) / (next.stop - current.stop);
      const r = Math.round(current.color[0] + (next.color[0] - current.color[0]) * ratio);
      const g = Math.round(current.color[1] + (next.color[1] - current.color[1]) * ratio);
      const b = Math.round(current.color[2] + (next.color[2] - current.color[2]) * ratio);
      return `rgba(${r}, ${g}, ${b}, 0.7)`;
    }
  }
  const last = stops[stops.length - 1];
  return `rgba(${last.color[0]}, ${last.color[1]}, ${last.color[2]}, 0.7)`;
};

const computeRadius = (map, base = 60) => {
  const zoom = map?.getZoom?.() ?? 4;
  const radius = base * Math.pow(0.75, zoom - 4);
  return clamp(radius, 15, 140);
};

function HeatmapLayer({ enabled = true, map, locations = [], heatmapMode = 'none', onDiagnostics }) {
  const canvasRef = useRef(null);
  const frameRef = useRef(null);
  const [visibility, setVisibility] = useState(() => computeVisibility(map?.getZoom?.() ?? 0));
  const visibilityRef = useRef(visibility);
  const propsRef = useRef({ enabled, heatmapMode, locations });

  useEffect(() => {
    visibilityRef.current = visibility;
  }, [visibility]);

  useEffect(() => {
    propsRef.current = { enabled, heatmapMode, locations };
  }, [enabled, heatmapMode, locations]);

  const scheduleRedraw = () => {
    if (frameRef.current) cancelAnimationFrame(frameRef.current);
    frameRef.current = requestAnimationFrame(() => drawHeatmap());
  };

  const drawHeatmap = () => {
    const canvas = canvasRef.current;
    if (!canvas || !map) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const size = map.getSize();
    if (canvas.width !== size.x * dpr || canvas.height !== size.y * dpr) {
      canvas.width = size.x * dpr;
      canvas.height = size.y * dpr;
      canvas.style.width = `${size.x}px`;
      canvas.style.height = `${size.y}px`;
      ctx.scale(dpr, dpr);
    }

    ctx.clearRect(0, 0, size.x, size.y);
    const { enabled: layerEnabled, heatmapMode: currentMode, locations: currentLocations } =
      propsRef.current;
    const visible = layerEnabled && currentMode !== 'none' && visibilityRef.current > 0;
    if (!visible || !currentLocations.length) return;

    const radius = computeRadius(map);

    currentLocations.forEach((location) => {
      const intensity = getLocationIntensity(location, currentMode);
      if (intensity <= 0) return;
      const latLng = L.latLng(location.lat, location.lng);
      const point = map.latLngToContainerPoint(latLng);
      if (
        point.x < -radius ||
        point.y < -radius ||
        point.x > size.x + radius ||
        point.y > size.y + radius
      ) {
        return;
      }
      const gradient = ctx.createRadialGradient(point.x, point.y, 0, point.x, point.y, radius);
      gradient.addColorStop(0, getHeatColor(intensity));
      gradient.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(point.x - radius, point.y - radius, radius * 2, radius * 2);
    });
  };

  useEffect(() => {
    if (!map) return undefined;
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const handleVisibility = () => {
      const zoomLevel = map.getZoom();
      const next = computeVisibility(zoomLevel);
      setVisibility(next);
      const heatmapDisabled = !enabled || heatmapMode === 'none';
      const active = !heatmapDisabled && next > 0;
      onDiagnostics?.('heatmap', {
        status: heatmapDisabled ? 'off' : active ? 'ok' : 'warn',
        message: heatmapDisabled
          ? 'Heatmap disabled'
          : active
            ? `Heatmap (${heatmapMode}) active @ zoom ${zoomLevel.toFixed(2)} (opacity ${next.toFixed(2)})`
            : `Heatmap (${heatmapMode}) ready, awaiting closer zoom`,
      });
    };

    const resize = () => {
      if (!map) return;
      const size = map.getSize();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = size.x * dpr;
      canvas.height = size.y * dpr;
      canvas.style.width = `${size.x}px`;
      canvas.style.height = `${size.y}px`;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.scale(dpr, dpr);
      }
      scheduleRedraw();
    };

    resize();
    handleVisibility();
    window.addEventListener('resize', resize);
    const handleMove = () => scheduleRedraw();
    const handleZoom = () => {
      handleVisibility();
      scheduleRedraw();
    };

    map.on('moveend', handleMove);
    map.on('zoomend', handleZoom);

    return () => {
      window.removeEventListener('resize', resize);
      map.off('moveend', handleMove);
      map.off('zoomend', handleZoom);
    };
  }, [map, enabled, heatmapMode, onDiagnostics]);

  useEffect(() => {
    scheduleRedraw();
  }, [enabled, locations, heatmapMode, visibility]);

  useEffect(
    () => () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    },
    []
  );

  if (!map) return null;

  return (
    <canvas
      ref={canvasRef}
      className="map-layer map-layer--heatmap"
      style={{ opacity: enabled && heatmapMode !== 'none' ? visibility : 0 }}
      aria-hidden="true"
    />
  );
}

export default HeatmapLayer;
