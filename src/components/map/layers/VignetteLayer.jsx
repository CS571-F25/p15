import React, { useEffect } from 'react';

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

function VignetteLayer({ enabled = true, intensity = 1, onDiagnostics }) {
  const strength = clamp(intensity, 0, 1.25);
  const opacity = clamp(strength, 0, 1);

  useEffect(() => {
    if (!enabled) {
      onDiagnostics?.('vignette', { status: 'off', message: 'Vignette disabled' });
      return;
    }
    onDiagnostics?.('vignette', { status: 'ok', message: `Vignette strength ${strength.toFixed(2)}` });
  }, [enabled, strength, onDiagnostics]);

  if (!enabled) return null;

  return (
    <div
      className="map-layer map-layer--vignette"
      style={{
        '--layer-opacity': opacity,
        '--vignette-strength': strength,
        opacity,
      }}
      aria-hidden="true"
    />
  );
}

export default VignetteLayer;
