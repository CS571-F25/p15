import React from 'react';
import '../UI/PageUI.css';

const formatList = (items) => (items && items.length ? items.join(', ') : '—');

function CharacterCard({ character, onToggleFavorite, isFavorite, onFeature, isFeatured }) {
  const initial = character.name ? character.name.charAt(0).toUpperCase() : '?';
  const accentHue = (character.id * 47) % 360;
  const accentColor = `hsl(${accentHue}, 70%, 60%)`;

  return (
    <article className="card-shell" style={{ '--portrait-accent': accentColor }}>
      <div className="card-portrait" aria-hidden="true">
        {character.image ? (
          <img src={character.image} alt={`${character.name} portrait`} />
        ) : (
          <span className="card-initial">{initial}</span>
        )}
        <div className="card-portrait-glow" />
      </div>

      <div className="card-summary">
        <div className="card-title-row">
          <h2 className="card-name">{character.name}</h2>
          {character.title && <div className="card-subtitle">{character.title}</div>}
        </div>
        
        <div className="card-stats-grid">
          <div className="stat-box">
            <span className="stat-label">Level</span>
            <span className="stat-value">{character.level}</span>
          </div>
          <div className="stat-box">
            <span className="stat-label">Race</span>
            <span className="stat-value">{character.race}</span>
          </div>
          <div className="stat-box">
            <span className="stat-label">Class</span>
            <span className="stat-value">{character.class}</span>
          </div>
        </div>

        <div className="card-actions">
          {(onToggleFavorite || onFeature) && (
            <div className="card-fav">
              {onToggleFavorite && (
                <button
                  type="button"
                  className={`fav-btn ${isFavorite ? 'fav-btn--active' : ''}`}
                  onClick={onToggleFavorite}
                >
                  {isFavorite ? '★ Favorite' : '☆ Favorite'}
                </button>
              )}
              {onFeature && (
                <button
                  type="button"
                  className={`feature-btn ${isFeatured ? 'feature-btn--active' : ''}`}
                  onClick={onFeature}
                >
                  {isFeatured ? 'Featured' : 'Set Featured'}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

export default CharacterCard;
