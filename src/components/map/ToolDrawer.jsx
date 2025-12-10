import React from "react";

function ToggleRow({ label, checked, onChange, hint }) {
  return (
    <label className="tool-drawer__row">
      <span>
        {label}
        {hint ? <em className="tool-drawer__hint">{hint}</em> : null}
      </span>
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
    </label>
  );
}

function ToolDrawer({
  isOpen,
  onToggle,
  showMarkers,
  showRegions,
  showLabels,
  onToggleMarkers,
  onToggleRegions,
  onToggleLabels,
  particleFilters,
  onToggleParticle,
  onStartPlaceLabel,
  isPlacingLabel,
  labels = [],
  onLabelChange,
  onDeleteLabel,
  zoomLevel,
}) {
  return (
    <div className={`tool-drawer ${isOpen ? 'tool-drawer--open' : ''}`}>
      <button
        type="button"
        className="tool-drawer__tab"
        aria-expanded={isOpen}
        onClick={onToggle}
      >
        Tools
      </button>

      {isOpen && (
        <div className="tool-drawer__panel custom-scrollbar">
          <div className="tool-drawer__section">
            <div className="tool-drawer__section-header">
              <h4>Visibility</h4>
              <p>Quickly declutter the canvas.</p>
            </div>
            <ToggleRow label="Show markers" checked={showMarkers} onChange={onToggleMarkers} />
            <ToggleRow label="Show regions" checked={showRegions} onChange={onToggleRegions} />
            <ToggleRow label="Show labels" checked={showLabels} onChange={onToggleLabels} />
          </div>

          <div className="tool-drawer__section">
            <div className="tool-drawer__section-header">
              <h4>Particles</h4>
              <p>Disable layers when editing to save focus.</p>
            </div>
            {Object.entries(particleFilters || {}).map(([key, value]) => (
              <ToggleRow
                key={key}
                label={key}
                checked={value}
                onChange={(next) => onToggleParticle?.(key, next)}
              />
            ))}
          </div>

          <div className="tool-drawer__section">
            <div className="tool-drawer__section-header tool-drawer__section-header--inline">
              <div>
                <h4>Map Labels</h4>
                <p>Place curved labels for regions, castles, or notes.</p>
              </div>
              <button
                type="button"
                className={`tool-drawer__action ${isPlacingLabel ? 'is-active' : ''}`}
                onClick={onStartPlaceLabel}
              >
                {isPlacingLabel ? 'Click map to place...' : 'Add label'}
              </button>
            </div>
            <p className="tool-drawer__hint">Current zoom: {zoomLevel.toFixed(2)}</p>
            <div className="tool-drawer__labels-list">
              {labels.length === 0 && <p className="tool-drawer__empty">No labels yet.</p>}
              {labels.map((label) => (
                <div className="tool-drawer__label-card" key={label.id}>
                  <div className="tool-drawer__label-row">
                    <label>
                      <span>Text</span>
                      <input
                        type="text"
                        value={label.text || ''}
                        onChange={(event) => onLabelChange(label.id, 'text', event.target.value)}
                      />
                    </label>
                    <label className="tool-drawer__color">
                      <span>Color</span>
                      <input
                        type="color"
                        value={label.color || '#fef3c7'}
                        onChange={(event) => onLabelChange(label.id, 'color', event.target.value)}
                      />
                    </label>
                  </div>
                  <label className="tool-drawer__slider">
                    <span>Base size: {Math.round((label.size || 1) * 100)}%</span>
                    <input
                      type="range"
                      min="0.5"
                      max="3"
                      step="0.05"
                      value={label.size || 1}
                      onChange={(event) =>
                        onLabelChange(label.id, 'size', parseFloat(event.target.value))
                      }
                    />
                  </label>
                  <label className="tool-drawer__slider">
                    <span>Zoom scaling: {Math.round((label.zoomScale || 1) * 100)}%</span>
                    <input
                      type="range"
                      min="0.5"
                      max="2"
                      step="0.05"
                      value={label.zoomScale || 1}
                      onChange={(event) =>
                        onLabelChange(label.id, 'zoomScale', parseFloat(event.target.value))
                      }
                    />
                  </label>
                  <label className="tool-drawer__slider">
                    <span>Fade in start: {label.fadeInStart ?? 3}</span>
                    <input
                      type="range"
                      min="0"
                      max="8"
                      step="0.1"
                      value={label.fadeInStart ?? 3}
                      onChange={(event) =>
                        onLabelChange(label.id, 'fadeInStart', parseFloat(event.target.value))
                      }
                    />
                  </label>
                  <label className="tool-drawer__slider">
                    <span>Fade in end: {label.fadeInEnd ?? 5}</span>
                    <input
                      type="range"
                      min="0"
                      max="8"
                      step="0.1"
                      value={label.fadeInEnd ?? 5}
                      onChange={(event) =>
                        onLabelChange(label.id, 'fadeInEnd', parseFloat(event.target.value))
                      }
                    />
                  </label>
                  <button
                    type="button"
                    className="tool-drawer__delete"
                    onClick={() => onDeleteLabel(label.id)}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ToolDrawer;
