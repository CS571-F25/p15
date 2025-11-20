import React, { createContext, useContext, useMemo, useState } from 'react';

const MapEffectsContext = createContext({
  cloudsEnabled: true,
  fogEnabled: true,
  vignetteEnabled: true,
  heatmapMode: 'none',
});

export function MapEffectsProvider({ children }) {
  const [cloudsEnabled] = useState(true);
  const [fogEnabled] = useState(true);
  const [vignetteEnabled] = useState(true);
  const [heatmapMode] = useState('none');

  const value = useMemo(
    () => ({ cloudsEnabled, fogEnabled, vignetteEnabled, heatmapMode }),
    [cloudsEnabled, fogEnabled, vignetteEnabled, heatmapMode]
  );

  return <MapEffectsContext.Provider value={value}>{children}</MapEffectsContext.Provider>;
}

export function useMapEffects() {
  return useContext(MapEffectsContext);
}
