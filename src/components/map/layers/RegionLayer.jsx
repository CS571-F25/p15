import React, { useEffect, useState } from 'react';
import L from 'leaflet';

function RegionLayer({
  enabled = true,
  map,
  regions = [],
  draftPoints = [],
  selectedRegionId = null,
  onRegionClick,
  interactionEnabled = false,
}) {
  const [projectedRegions, setProjectedRegions] = useState([]);
  const [projectedDraft, setProjectedDraft] = useState('');

  useEffect(() => {
    if (!enabled || !map) {
      setProjectedRegions([]);
      setProjectedDraft('');
      return undefined;
    }

    const project = () => {
      const projected = regions.map((region) => {
        if (!Array.isArray(region.points)) return region;
        const points = region.points
          .map(([x, y]) => {
            const latLng = L.latLng(y, x);
            const point = map.latLngToContainerPoint(latLng);
            return `${point.x},${point.y}`;
          })
          .join(' ');
        return { ...region, projectedPoints: points };
      });
      setProjectedRegions(projected);

      if (draftPoints.length) {
        const draftProjected = draftPoints
          .map(([x, y]) => {
            const latLng = L.latLng(y, x);
            const point = map.latLngToContainerPoint(latLng);
            return `${point.x},${point.y}`;
          })
          .join(' ');
        setProjectedDraft(draftProjected);
      } else {
        setProjectedDraft('');
      }
    };

    project();
    map.on('move', project);
    map.on('zoom', project);
    return () => {
      map.off('move', project);
      map.off('zoom', project);
    };
  }, [enabled, map, regions, draftPoints]);

  if (!enabled || !map) return null;

  return (
    <svg
      className="map-layer map-layer--regions"
      aria-hidden="true"
      style={{ pointerEvents: interactionEnabled ? 'auto' : 'none' }}
    >
      {projectedRegions.map((region) => {
        if (!region.projectedPoints) return null;
        const isSelected = region.id === selectedRegionId;
        return (
          <polygon
            key={region.id}
            points={region.projectedPoints}
            fill={region.color || 'rgba(255, 215, 0, 0.2)'}
            stroke={region.borderColor || '#ffd700'}
            strokeWidth={isSelected ? 3 : 2}
            fillOpacity={region.opacity ?? 0.25}
            onClick={(event) => {
              if (!interactionEnabled || !onRegionClick) return;
              event.stopPropagation();
              onRegionClick(region.id);
            }}
          />
        );
      })}
      {projectedDraft && (
        <polygon
          points={projectedDraft}
          fill="rgba(255, 255, 255, 0.2)"
          stroke="#f97316"
          strokeWidth={2}
          strokeDasharray="6"
          fillOpacity={0.3}
        />
      )}
    </svg>
  );
}

export default RegionLayer;
