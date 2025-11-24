import React from 'react';
import '../UI/PageUI.css';

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
          <span className="chip chip-level">Level {character.level}</span>
        </div>
        {character.title && <div className="card-subtitle">{character.title}</div>}

        <div className="card-stats-grid">
          <div className="stat-box">
            <span className="stat-label">Race</span>
            <span className="stat-value">{character.race}</span>
          </div>
          <div className="stat-box">
            <span className="stat-label">Class</span>
            <span className="stat-value">{character.class}</span>
          </div>
          <div className="stat-box">
            <span className="stat-label">Alignment</span>
            <span className="stat-value">{character.alignment}</span>
          </div>
        </div>

        {(onToggleFavorite || onFeature) && (
          <div className="card-fav">
            {onToggleFavorite && (
              <button
                type="button"
                className={`fav-btn ${isFavorite ? 'fav-btn--active' : ''}`}
                onClick={onToggleFavorite}
              >
                {isFavorite ? 'Unfavorite' : 'Favorite'}
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
    </article>
  );
}

export default CharacterCard;
