import React, { useMemo, useState } from 'react';

const statusOrder = ['error', 'warn', 'pending', 'off', 'ok'];

function DiagnosticsPanel({
  diagnostics = {},
  onRefresh,
  intensities,
  onIntensityChange,
}) {
  const [open, setOpen] = useState(false);

  const rows = useMemo(() => {
    return Object.entries(diagnostics).sort((a, b) => {
      const av = statusOrder.indexOf(a[1]?.status || 'pending');
      const bv = statusOrder.indexOf(b[1]?.status || 'pending');
      return av - bv || a[0].localeCompare(b[0]);
    });
  }, [diagnostics]);

  return (
    <div className={`diag-panel ${open ? 'diag-panel--open' : ''}`}>
      <button
        type="button"
        className="diag-panel__toggle"
        onClick={() => setOpen((prev) => !prev)}
      >
        {open ? 'Hide Diagnostics' : 'Show Diagnostics'}
      </button>
      {open && (
        <div className="diag-panel__body">
          <div className="diag-panel__header">
            <h4>Admin Diagnostics</h4>
            <button type="button" className="diag-panel__refresh" onClick={onRefresh}>
              Refresh
            </button>
          </div>
          <ul className="diag-panel__list">
            {rows.map(([key, entry]) => (
              <li key={key} className={`diag-panel__item diag-panel__item--${entry?.status || 'pending'}`}>
                <span className="diag-panel__label">{key}</span>
                <span className="diag-panel__status">{entry?.status || 'pending'}</span>
                {entry?.message ? <span className="diag-panel__message">{entry.message}</span> : null}
              </li>
            ))}
          </ul>
          {intensities && onIntensityChange && (
            <div className="diag-panel__controls">
              <div className="diag-panel__control">
                <label htmlFor="cloudIntensity">Clouds</label>
                <input
                  id="cloudIntensity"
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={intensities.clouds}
                  onChange={(e) => onIntensityChange('clouds', parseFloat(e.target.value))}
                />
              </div>
              <div className="diag-panel__control">
                <label htmlFor="fogIntensity">Fog</label>
                <input
                  id="fogIntensity"
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={intensities.fog}
                  onChange={(e) => onIntensityChange('fog', parseFloat(e.target.value))}
                />
              </div>
              <div className="diag-panel__control">
                <label htmlFor="vignetteIntensity">Vignette</label>
                <input
                  id="vignetteIntensity"
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={intensities.vignette}
                  onChange={(e) => onIntensityChange('vignette', parseFloat(e.target.value))}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default DiagnosticsPanel;
