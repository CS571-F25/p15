import React from 'react';
import '../UI/PageUI.css';

export default function CharacterDetailView({ character, onClose, onNext, onPrev, nextName, prevName }) {
  if (!character) return null;

  return (
    <div className="character-detail-overlay">
      <div className="detail-header">
        <div className="detail-hero">
          <h1 className="detail-name">{character.name}</h1>
          <p className="detail-title">{character.title}</p>
          <p className="detail-meta">{character.race} {character.class} • Level {character.level}</p>
        </div>
        
        <div className="expanded-toolbar">
           <button type="button" className="back-btn" onClick={onClose}>
             ← Back to Codex
           </button>
           
           <div className="detail-nav">
             <button className="detail-nav-btn" onClick={onPrev} title={`Previous: ${prevName}`}>
               ‹ <span className="detail-nav-label">{prevName}</span>
             </button>
             <span className="detail-nav-divider">♦</span>
             <button className="detail-nav-btn" onClick={onNext} title={`Next: ${nextName}`}>
               <span className="detail-nav-label">{nextName}</span> ›
             </button>
           </div>

        </div>
      </div>

      <div className="detail-content">
        <div className="detail-columns">
          <div className="detail-card">
            <h3>Attributes</h3>
            <div className="stat-grid expanded-stat-grid">
              {Object.entries(character.stats).map(([key, value]) => (
                <div key={key} className="stat-pill">
                  <span className="stat-pill__label">{key.toUpperCase()}</span>
                  <span className="stat-pill__value">{value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="detail-card">
            <h3>Vitals</h3>
            <div className="stat-grid">
              <div className="stat-pill">
                <span className="stat-pill__label">HP</span>
                <span className="stat-pill__value">{character.hp}</span>
              </div>
              <div className="stat-pill">
                <span className="stat-pill__label">AC</span>
                <span className="stat-pill__value">{character.ac}</span>
              </div>
              <div className="stat-pill">
                <span className="stat-pill__label">SPD</span>
                <span className="stat-pill__value">{character.speed}</span>
              </div>
              <div className="stat-pill">
                <span className="stat-pill__label">PROF</span>
                <span className="stat-pill__value">+{character.profBonus}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="detail-card">
          <h3>Lore & Background</h3>
          <p className="detail-line">{character.lore}</p>
          {character.background && (
            <p className="detail-line" style={{ marginTop: '1rem', fontStyle: 'italic', opacity: 0.8 }}>
              Background: {character.background}
            </p>
          )}
        </div>

        <div className="detail-columns">
           <div className="detail-card">
            <h3>Abilities</h3>
            <div className="detail-block">
              {character.abilities.map(ability => (
                <span key={ability} className="detail-line">• {ability}</span>
              ))}
            </div>
          </div>

          <div className="detail-card">
            <h3>Equipment</h3>
            <div className="detail-block">
              {character.equipment.map(item => (
                <span key={item} className="detail-line">• {item}</span>
              ))}
            </div>
          </div>
        </div>
        
        {character.notes && (
           <div className="detail-card">
            <h3>Notes</h3>
            <p className="detail-line">{character.notes}</p>
           </div>
        )}
      </div>
    </div>
  );
}
