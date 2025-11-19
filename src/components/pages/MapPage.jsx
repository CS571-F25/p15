import React, { useState } from 'react';
import InteractiveMap from '../map/InteractiveMap';
import './MapPage.css';

export default function MapPage() {
  const [isEditorMode, setIsEditorMode] = useState(false);

  const toggleEditorMode = () => {
    setIsEditorMode((prev) => !prev);
  };

  return (
    <div className="map-page">
      <div className="map-page__controls">
        <button
          type="button"
          className={`editor-toggle ${isEditorMode ? 'editor-toggle--active' : ''}`}
          onClick={toggleEditorMode}
          aria-pressed={isEditorMode}
        >
          {isEditorMode ? 'Disable Editor Mode' : 'Enable Editor Mode'}
        </button>
        {isEditorMode && (
          <span className="editor-banner" role="status" aria-live="polite">
            Editor Mode Active
          </span>
        )}
      </div>
      <InteractiveMap isEditorMode={isEditorMode} />
    </div>
  );
}
