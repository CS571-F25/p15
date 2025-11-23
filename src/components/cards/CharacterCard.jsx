import React from 'react';
import '../UI/PageUI.css';

export default function CharacterCard({ character }) {
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
        <p className="card-meta">
          {character.race} / {character.class}
        </p>
        <div className="card-tags">
          <span className="chip">HP {character.hp}</span>
          <span className="chip">AC {character.ac}</span>
          <span className="chip subtle">Speed {character.speed} ft</span>
        </div>
      </div>
    </article>
  );
}
