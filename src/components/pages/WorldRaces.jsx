import React, { useState } from 'react';
import races from '../../data/races';

export default function WorldRaces() {
  const [expandedId, setExpandedId] = useState(null);

  const handleCardClick = (id) => {
    setExpandedId((current) => (current === id ? null : id));
  };

  return (
    <div className="world-page">
      <h1>Races of Azterra</h1>
      <p className="world-intro">
        Explore the peoples of Azterra. Click a race to reveal more detailed lore and traits.
      </p>

      <div className="race-grid">
        {races.map((race) => {
          const isExpanded = expandedId === race.id;

          return (
            <article
              key={race.id}
              className={`race-card ${isExpanded ? 'race-card--expanded' : ''}`}
              onClick={() => handleCardClick(race.id)}>
                {race.image && (
                  <div className="race-image-wrapper">
                    <img src={race.image} alt={race.name} className="race-image" />
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
                  onClick={(e) => {
                    e.stopPropagation(); 
                    handleCardClick(race.id);
                  }}
                >
                  {isExpanded ? 'Hide details' : 'View details'}
                </button>
              </div>

              {race.tags && race.tags.length > 0 && (
                <div className="race-tags">
                  {race.tags.map((tag) => (
                    <span key={tag} className="race-tag">
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <div
                className="race-details"
                style={{
                  maxHeight: isExpanded ? '500px' : '0px',
                  opacity: isExpanded ? 1 : 0,
                }}
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

      <style>{`
        .world-page {
          padding: 1rem 2rem 2.5rem 2rem;
        }

        .world-page h1 {
          margin-bottom: 0.5rem;
        }

        .world-intro {
          max-width: 720px;
          margin-bottom: 1.5rem;
          color: #4b4632;
          font-size: 0.98rem;
        }

        .race-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1.5rem;
          align-items: start; 
        }

        .race-card {
          background: #f7f2e6;
          border-radius: 12px;
          border: 1.5px solid #b0aa98;
          box-shadow: 0 2px 6px #bbb4a333;
          overflow: hidden;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        }

        .race-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 10px #aaa28d55;
        }

        .race-image-wrapper {
            background: #1d1b16;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 0.75rem;
        }

        .race-image {
            width: 100%;
            height: auto;
            max-height: 260px;    
            object-fit: contain;   
            border-radius: 10px;
        }

        .race-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 0.75rem;
          padding: 0.9rem 1.1rem 0.3rem 1.1rem;
        }

        .race-header h2 {
          font-size: 1.3rem;
          margin-bottom: 0.15rem;
        }

        .race-blurb {
          font-size: 0.95rem;
          color: #6b6244;
        }

        .race-toggle {
          border: none;
          border-radius: 999px;
          padding: 0.3rem 0.85rem;
          font-size: 0.78rem;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          background: #cbb58a;
          color: #2b2415;
          cursor: pointer;
          flex-shrink: 0;
        }

        .race-toggle:hover {
          background: #d9c294;
        }

        .race-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.35rem;
          padding: 0 1.1rem 0.5rem 1.1rem;
        }

        .race-tag {
          background: #e1d8c2;
          border-radius: 999px;
          padding: 0.15rem 0.55rem;
          font-size: 0.78rem;
          color: #4c432b;
        }

        .race-details {
          padding: 0 1.1rem 0.95rem 1.1rem;
          font-size: 0.92rem;
          color: #3f3a26;
          transition: max-height 0.25s ease, opacity 0.25s ease;
          overflow: hidden;
        }

        .race-details p {
          margin-bottom: 0.45rem;
        }

        .race-traits {
          padding-left: 1.1rem;
        }

        .race-traits li {
          margin-bottom: 0.1rem;
        }

        @media (max-width: 600px) {
          .world-page {
            padding: 0.75rem 1rem 1.75rem 1rem;
          }
        }
      `}</style>
    </div>
  );
}
