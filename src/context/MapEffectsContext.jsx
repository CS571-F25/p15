import React, { createContext, useContext, useMemo, useState } from 'react';

const MapEffectsContext = createContext({
  cloudsEnabled: true,
  fogEnabled: true,
  vignetteEnabled: true,
  heatmapMode: 'none',
  setCloudsEnabled: () => {},
  setFogEnabled: () => {},
  setVignetteEnabled: () => {},
  setHeatmapMode: () => {},
});

export function MapEffectsProvider({ children }) {
  const [cloudsEnabled, setCloudsEnabled] = useState(true);
  const [fogEnabled, setFogEnabled] = useState(true);
  const [vignetteEnabled, setVignetteEnabled] = useState(true);
  const [heatmapMode, setHeatmapMode] = useState('none');

  const value = useMemo(
    () => ({
      cloudsEnabled,
      fogEnabled,
      vignetteEnabled,
      heatmapMode,
      setCloudsEnabled,
      setFogEnabled,
      setVignetteEnabled,
      setHeatmapMode,
    }),
    [cloudsEnabled, fogEnabled, vignetteEnabled, heatmapMode]
  );

  return <MapEffectsContext.Provider value={value}>{children}</MapEffectsContext.Provider>;
}

export function useMapEffects() {
  return useContext(MapEffectsContext);
}
