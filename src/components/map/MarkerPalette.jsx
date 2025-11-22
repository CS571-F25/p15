import React from 'react';

function MarkerPalette({ isEditorMode, options, selectedOption, onSelect }) {
  if (!isEditorMode) return null;

  return (
    <div className="marker-palette">
      <div className="marker-palette__header">
        <h3>Marker Palette</h3>
        <p>Select an icon, then click the map to place it.</p>
      </div>
      <div className="marker-palette__grid">
        {options.map((option) => (
          <button
            key={option.iconKey}
            type="button"
            className={`marker-palette__item ${
              selectedOption && selectedOption.iconKey === option.iconKey
                ? 'marker-palette__item--active'
                : ''
            }`}
            onClick={() => onSelect(option)}
          >
            <img
              src={`/icons/cities/${option.iconKey}.png`}
              alt={option.label}
              width={32}
              height={32}
              loading="lazy"
            />
            <span>{option.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default MarkerPalette;
