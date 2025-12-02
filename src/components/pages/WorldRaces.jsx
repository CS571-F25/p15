import React, { useState } from 'react';
import races from '../../data/races';
import '../UI/PageUI.css';
import './WorldRaces.css';
import ShaderBackground from '../visuals/ShaderBackground';

export default function WorldRaces() {
  const [expandedId, setExpandedId] = useState(null);

  const handleCardClick = (id) => {
    setExpandedId((current) => (current === id ? null : id));
  };

  return (
    <div className="characters-page world-races-page custom-scrollbar">
      <div className="sun-overlay" aria-hidden="true" />
      <div className="world-races-content">
        <h1 className="page-title">Races of Azterra</h1>
        <p className="world-intro">
          Explore the peoples of Azterra. Select a race to reveal deeper lore, cultural roots, and
          the gifts that shape their place in the realm.
        </p>

        <div className="race-grid" role="list">
          {races.map((race) => {
            const isExpanded = expandedId === race.id;
            const detailId = `race-details-${race.id}`;

            return (
              <article
                key={race.id}
                role="listitem"
                className={`race-card ${isExpanded ? 'race-card--expanded' : ''}`}
                onClick={() => handleCardClick(race.id)}
              >
                {race.image && (
                  <div className="race-image-wrapper">
                    <img src={race.image} alt={race.name} className="race-image" loading="lazy" />
                  </div>
                )}

                <div className="race-header">
                  <div>
                    <h2>{race.name}</h2>
                    {race.blurb && <p className="race-blurb">{race.blurb}</p>}
                  </div>
                  <button
                    type="button"
                    className="race-toggle"
                    aria-expanded={isExpanded}
                    aria-controls={detailId}
                    onClick={(event) => {
                      event.stopPropagation();
                      handleCardClick(race.id);
                    }}
                  >
                    {isExpanded ? 'Hide details' : 'View details'}
                  </button>
                </div>

                {race.tags && race.tags.length > 0 && (
                  <div className="race-tags" aria-label="Race quick facts">
                    {race.tags.map((tag) => (
                      <span key={tag} className="race-tag">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <div
                  id={detailId}
                  className="race-details"
                  aria-hidden={!isExpanded}
                >
                  {race.description && (
                    <p className="race-description">{race.description}</p>
                  )}

                  {race.traits && race.traits.length > 0 && (
                    <ul className="race-traits">
                      {race.traits.map((trait, idx) => (
                        <li key={idx}>{trait}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}
