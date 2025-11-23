import React, { useRef, useEffect, useState, useCallback } from 'react';
import characters from '../../data/characters';
import '../UI/PageUI.css';
import ShaderBackgroundDualCrossfade from '../visuals/ShaderBackgroundDualCrossfade';
import CharacterCard from '../cards/CharacterCard';

// Clamp utility
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

// Card class for carousel
const getCardClass = (index, activeIndex) => {
  if (index === activeIndex) return 'card card-active';
  if (index === activeIndex - 1) return 'card card-left';
  if (index === activeIndex + 1) return 'card card-right';
  return 'card card-hidden';
};

export default function CharactersPage() {
  const [vanished, setVanished] = useState(false);

  const [currentColor, setCurrentColor] = useState(characters[0].color);
  const [targetColor, setTargetColor] = useState(characters[0].color);
  const [fade, setFade] = useState(0);
  const animationRef = useRef();

  const [activeIndex, setActiveIndex] = useState(0);

  // Utility to start fade to new color, always from visual color AT THAT MOMENT
  function startColorFade(newColor) {
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    // Interpolate from actual visible color if in progress
    let start;
    if (fade > 0 && fade < 1) {
      start = [
        currentColor[0] + (targetColor[0] - currentColor[0]) * fade,
        currentColor[1] + (targetColor[1] - currentColor[1]) * fade,
        currentColor[2] + (targetColor[2] - currentColor[2]) * fade,
        currentColor[3] + (targetColor[3] - currentColor[3]) * fade,
      ];
    } else {
      start = targetColor;
    }
    setCurrentColor(start);
    setTargetColor(newColor);
    setFade(0);

    let t0 = performance.now();
    function stepFade(now) {
      let f = Math.min(1, (now - t0) / 800); // 800ms fade
      setFade(f);
      if (f < 1) {
        animationRef.current = requestAnimationFrame(stepFade);
      } else {
        setCurrentColor(newColor);
        setFade(0);
        animationRef.current = null;
      }
    }
    animationRef.current = requestAnimationFrame(stepFade);
  }

  // Update target color on activeIndex change
  useEffect(() => {
    startColorFade(characters[activeIndex].color);
  }, [activeIndex]);

  // Navigation handlers use callback to ensure correct activeIndex
  const goPrev = useCallback(() => {
    setActiveIndex(prev => clamp(prev - 1, 0, characters.length - 1));
  }, []);

  const goNext = useCallback(() => {
    setActiveIndex(prev => clamp(prev + 1, 0, characters.length - 1));
  }, []);

  const handleCardClick = useCallback((index) => {
    setActiveIndex(index);
  }, []);

  const handleCardKeyDown = useCallback((event, index) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setActiveIndex(index);
    }
  }, []);

  // Arrow keys navigation
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

  // Vanish tool: press 'v' to toggle
  useEffect(() => {
    const onKey = (event) => {
      if (event.key === 'v' || event.key === 'V') {
        setVanished((v) => !v);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className="characters-page">
      <ShaderBackgroundDualCrossfade
        modA={currentColor}
        modB={targetColor}
        fade={fade}
      />
      {!vanished && (
        <>
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
                  {characters.map((char, index) => {
                    const isActive = index === activeIndex;
                    return (
                      <div
                        key={char.id}
                        className={getCardClass(index, activeIndex)}
                        role="button"
                        tabIndex={isActive ? 0 : -1}
                        aria-label={`Select ${char.name}`}
                        aria-pressed={isActive}
                        onClick={() => handleCardClick(index)}
                        onKeyDown={(event) => handleCardKeyDown(event, index)}
                      >
                        <CharacterCard character={char} />
                      </div>
                    );
                  })}
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
        </>
      )}
    </div>
  );
}
