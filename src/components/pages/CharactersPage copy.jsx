import React, { useCallback, useEffect, useState } from 'react';
import characters from '../../data/characters';
import '../UI/PageUI.css';
import ShaderBackgroundThreeWayCrossfade from '../visuals/ShaderBackgroundDualCrossfade';
import ShaderBackground from '../visuals/ShaderBackground';
import CharacterCard from '../cards/CharacterCard';

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

const getCardClass = (index, activeIndex) => {
  if (index === activeIndex) return 'card card-active';
  if (index === activeIndex - 1) return 'card card-left';
  if (index === activeIndex + 1) return 'card card-right';
  return 'card card-hidden';
};

export default function CharactersPage() {
  const [fade, setFade] = useState(0);

  // Example: animate fade on button click
  function crossfade() {
    let t0 = performance.now();
    function animate(now) {
      let f = Math.min(1, (now - t0) / 1200); // 1.2s fade
      setFade(f);
      if (f < 1) requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);
  }

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

  return (
    <div className="characters-page">
      <ShaderBackgroundThreeWayCrossfade
        modA={[0, 4, 2, 0]}
        modB={[3, 1, 3, 2]}
        modC={[6, 2, 8, 4]}
        from={0}
        to={1}
        fade={fade}
      />
      <button className="crossfade-btn" onClick={crossfade} aria-label="Crossfade background">⟳</button>
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
                  <CharacterCard character={char} />
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
