import React, { useState } from 'react';
import InteractiveMap from '../map/InteractiveMap';
import './MapPage.css';

export default function MapPage() {
  const [isEditorMode, setIsEditorMode] = useState(false);

  const toggleEditorMode = () => {
    setIsEditorMode((prev) => !prev);
  };

  return (
    <div className="map-page map-page--full">
      <div className="map-page__overlay-controls">
        <button
          type="button"
          className={`editor-toggle ${isEditorMode ? 'editor-toggle--active' : ''}`}
          onClick={toggleEditorMode}
          aria-pressed={isEditorMode}
        >
          {isEditorMode ? 'Disable Editor Mode' : 'Enable Editor Mode'}
        </button>
      </div>
      <InteractiveMap isEditorMode={isEditorMode} />
    </div>
  );
}
