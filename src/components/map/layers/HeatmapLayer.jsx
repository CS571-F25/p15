import L from 'leaflet';
import React, { useEffect, useRef } from 'react';

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

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

function HeatmapLayer({ enabled = true, map, locations = [], heatmapMode = 'none' }) {
  const canvasRef = useRef(null);
  const frameRef = useRef(null);

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
    if (!enabled || heatmapMode === 'none' || !locations.length) return;

    const radius = computeRadius(map);

    locations.forEach((location) => {
      const intensity = getLocationIntensity(location, heatmapMode);
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
    window.addEventListener('resize', resize);
    map.on('moveend', scheduleRedraw);
    map.on('zoomend', scheduleRedraw);

    return () => {
      window.removeEventListener('resize', resize);
      map.off('moveend', scheduleRedraw);
      map.off('zoomend', scheduleRedraw);
    };
  }, [map]);

  useEffect(() => {
    scheduleRedraw();
  }, [enabled, locations, heatmapMode]);

  if (!map) return null;

  return <canvas ref={canvasRef} className="map-layer map-layer--heatmap" aria-hidden="true" />;
}

export default HeatmapLayer;
