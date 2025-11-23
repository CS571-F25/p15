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
          <span className="chip chip-level">Level {character.level}</span>
        </div>
        <div className="card-actions">
          <div className="card-vitals">
            <div>
              <span>HP</span>
              <strong>{character.hp}</strong>
            </div>
            <div>
              <span>AC</span>
              <strong>{character.ac}</strong>
            </div>
            <div>
              <span>Speed</span>
              <strong>{character.speed} ft</strong>
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
