import React from 'react';
import '../UI/PageUI.css';

const formatList = (items) => (items && items.length ? items.join(', ') : '—');

function CharacterCard({ character, onToggleFavorite, isFavorite, onFeature, isFeatured }) {
  return (
    <>
      <header className="card-header">
        <div>
          <h2 className="card-name">
            {character.name} <span className="char-level">Lv {character.level}</span>
          </h2>
          <div className="char-subhead">
            {character.race} <span className="card-divider">|</span> {character.class}{' '}
            <span className="card-divider">|</span> {character.background}
          </div>
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
      </header>

      <section className="card-section info-row">
        <div>
          <p>
            <span>Alignment</span> {character.alignment}
          </p>
          <p>
            <span>Passive Perception</span> {character.passivePerception}
          </p>
        </div>
        <div>
          <p>
            <span>Inspiration</span> {character.inspiration ? 'Yes' : 'No'}
          </p>
          {character.profBonus && (
            <p>
              <span>Prof. Bonus</span> +{character.profBonus}
            </p>
          )}
        </div>
      </section>

      <section className="card-section">
        <h3>Ability Scores</h3>
        <div className="stat-grid">
          {Object.entries(character.stats).map(([key, value]) => (
            <div key={key} className="stat-pill">
              <span>{key.toUpperCase()}</span>
              <strong>{value}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="card-section">
        <h3>Equipment</h3>
        <p>{formatList(character.equipment)}</p>
      </section>

      <section className="card-section">
        <h3>Abilities</h3>
        <p>{formatList(character.abilities)}</p>
      </section>

      <section className="card-section">
        <h3>Skills</h3>
        <div className="list-row">
          {character.skills.map((skill) => (
            <span key={skill} className="list-pill">
              {skill}
            </span>
          ))}
        </div>
      </section>

      {character.spells.length > 0 && (
        <section className="card-section">
          <h3>Spells</h3>
          <div className="list-row">
            {character.spells.map((spell) => (
              <span key={spell} className="list-pill subtle">
                {spell}
              </span>
            ))}
          </div>
        </section>
      )}

      {character.notes && (
        <section className="card-section">
          <h3>Notes</h3>
          <p className="card-notes">{character.notes}</p>
        </section>
      )}
    </>
  );
}

export default CharacterCard;
