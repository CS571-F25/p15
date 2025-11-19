import React, { useCallback, useEffect, useState } from 'react';
import characters from '../../data/characters';
import '../UI/CharactersPage.css';
import ShaderBackground from '../visuals/ShaderBackground';

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

const getCardClass = (index, activeIndex) => {
  if (index === activeIndex) return 'card card-active';
  if (index === activeIndex - 1) return 'card card-left';
  if (index === activeIndex + 1) return 'card card-right';
  return 'card card-hidden';
};

const formatList = (items) => (items && items.length ? items.join(', ') : '—');

export default function CharactersPage() {
  const [activeIndex, setActiveIndex] = useState(0);

  const goPrev = useCallback(() => {
    setActiveIndex((prev) => clamp(prev - 1, 0, characters.length - 1));
  }, []);

  const goNext = useCallback(() => {
    setActiveIndex((prev) => clamp(prev + 1, 0, characters.length - 1));
  }, []);

  useEffect(() => {
    const handleKey = (event) => {
      if (event.key === 'ArrowLeft') {
        goPrev();
      } else if (event.key === 'ArrowRight') {
        goNext();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [goNext, goPrev]);

  const renderCardSections = (char) => (
    <>
      <header className="card-header">
        <div>
          <h2 className="card-name">
            {char.name} <span className="char-level">Lv {char.level}</span>
          </h2>
          <div className="char-subhead">
            {char.race} <span className="card-divider">|</span> {char.class}{' '}
            <span className="card-divider">|</span> {char.background}
          </div>
        </div>
        <div className="card-vitals">
          <div>
            <span>HP</span>
            <strong>{char.hp}</strong>
          </div>
          <div>
            <span>AC</span>
            <strong>{char.ac}</strong>
          </div>
          <div>
            <span>Speed</span>
            <strong>{char.speed} ft</strong>
          </div>
        </div>
      </header>

      <section className="card-section info-row">
        <div>
          <p>
            <span>Alignment</span> {char.alignment}
          </p>
          <p>
            <span>Passive Perception</span> {char.passivePerception}
          </p>
        </div>
        <div>
          <p>
            <span>Inspiration</span> {char.inspiration ? 'Yes' : 'No'}
          </p>
          {char.profBonus && (
            <p>
              <span>Prof. Bonus</span> +{char.profBonus}
            </p>
          )}
        </div>
      </section>

      <section className="card-section">
        <h3>Ability Scores</h3>
        <div className="stat-grid">
          {Object.entries(char.stats).map(([key, value]) => (
            <div key={key} className="stat-pill">
              <span>{key.toUpperCase()}</span>
              <strong>{value}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="card-section">
        <h3>Equipment</h3>
        <p>{formatList(char.equipment)}</p>
      </section>

      <section className="card-section">
        <h3>Abilities</h3>
        <p>{formatList(char.abilities)}</p>
      </section>

      <section className="card-section">
        <h3>Skills</h3>
        <div className="list-row">
          {char.skills.map((skill) => (
            <span key={skill} className="list-pill">
              {skill}
            </span>
          ))}
        </div>
      </section>

      {char.spells.length > 0 && (
        <section className="card-section">
          <h3>Spells</h3>
          <div className="list-row">
            {char.spells.map((spell) => (
              <span key={spell} className="list-pill subtle">
                {spell}
              </span>
            ))}
          </div>
        </section>
      )}

      {char.notes && (
        <section className="card-section">
          <h3>Notes</h3>
          <p className="card-notes">{char.notes}</p>
        </section>
      )}
    </>
  );

  return (
    <div className="characters-page">
      <ShaderBackground />
      <h1 className="page-title">Stars of Azterra</h1>
      <div className="characters-wrapper">
        <p className="nav-hint">Use the arrow keys or buttons to browse the codex</p>
        <div className="carousel-controls">
          <button
            className="arrow-btn arrow-left"
            onClick={goPrev}
            aria-label="Previous character"
            disabled={activeIndex === 0}
          >
            ‹
          </button>
          <div className="carousel-frame" role="region" aria-live="polite">
            <div className="sun-overlay" aria-hidden="true" />
            <div className="carousel-track">
              {characters.map((char, index) => (
                <div key={char.id} className={getCardClass(index, activeIndex)}>
                  {renderCardSections(char)}
                </div>
              ))}
            </div>
          </div>
          <button
            className="arrow-btn arrow-right"
            onClick={goNext}
            aria-label="Next character"
            disabled={activeIndex === characters.length - 1}
          >
            ›
          </button>
        </div>
      </div>
    </div>
  );
}
