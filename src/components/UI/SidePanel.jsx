import React from 'react';
import './UI.css';

function SidePanel({ location, onClose }) {
  if (!location) return null;

  return (
    <div className="side-panel custom-scrollbar">
      <div className="side-panel-header">
        <h2>{location.name}</h2>
        <button className="close-button" onClick={onClose}>×</button>
      </div>
      
      <div className="side-panel-content">
        <div className="location-info">
          <p className="location-type">{location.type}</p>
          <div className="lore-section">
            <h3>Lore</h3>
            <p>{location.lore}</p>
          </div>
          
          {location.description && (
            <div className="description-section">
              <h3>Description</h3>
              <p>{location.description}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SidePanel;
