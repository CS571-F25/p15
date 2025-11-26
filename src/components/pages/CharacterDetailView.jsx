import React, { useEffect, useRef, useState } from 'react';
import '../UI/PageUI.css';

const tabs = ['details', 'logbook', 'inventory', 'showcase'];
const tabLabels = {
  details: 'Details',
  logbook: 'Logbook',
  inventory: 'Inventory',
  showcase: 'Mana',
};

export default function CharacterDetailView({ character, onClose, onNext, onPrev, nextName, prevName }) {
  const [activeTab, setActiveTab] = useState('details');
  const [isContentVisible, setIsContentVisible] = useState(true);
  const [isSwapLocked, setIsSwapLocked] = useState(false);
  const [showBackdropHint, setShowBackdropHint] = useState(false);
  const [hasAnimatedInfo, setHasAnimatedInfo] = useState(false);
  const [shouldAnimateInfo, setShouldAnimateInfo] = useState(false);
  const swapDelay = 240;
  const contentRef = useRef(null);

  if (!character) return null;

  useEffect(() => {
    setIsContentVisible(false);
    const timer = setTimeout(() => setIsContentVisible(true), 160);
    return () => clearTimeout(timer);
  }, [character?.id]);

  useEffect(() => {
    if (contentRef.current && isContentVisible) {
      contentRef.current.focus({ preventScroll: true });
    }
  }, [isContentVisible]);

  useEffect(() => {
    if (!isSwapLocked) return;
    const timer = setTimeout(() => setIsSwapLocked(false), swapDelay);
    return () => clearTimeout(timer);
  }, [isSwapLocked]);

  const handlePrevTab = () => {
    if (isSwapLocked) return;
    setIsSwapLocked(true);
    const currentIndex = tabs.indexOf(activeTab);
    const nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
    setActiveTab(tabs[nextIndex]);
  };

  const handleNextTab = () => {
    if (isSwapLocked) return;
    setIsSwapLocked(true);
    const currentIndex = tabs.indexOf(activeTab);
    const nextIndex = (currentIndex + 1) % tabs.length;
    setActiveTab(tabs[nextIndex]);
  };

  const handlePrevCharacter = () => {
    if (isSwapLocked) return;
    setIsSwapLocked(true);
    onPrev();
  };

  const handleNextCharacter = () => {
    if (isSwapLocked) return;
    setIsSwapLocked(true);
    onNext();
  };

  const currentTabIndex = tabs.indexOf(activeTab);
  const prevTabName = tabLabels[tabs[(currentTabIndex - 1 + tabs.length) % tabs.length]];
  const nextTabName = tabLabels[tabs[(currentTabIndex + 1) % tabs.length]];
  const slideOffset = -(100 / tabs.length) * currentTabIndex;

  useEffect(() => {
    if (activeTab === 'showcase' && !hasAnimatedInfo) {
      setShouldAnimateInfo(true);
      setHasAnimatedInfo(true);
      const t = setTimeout(() => setShouldAnimateInfo(false), 300);
      return () => clearTimeout(t);
    }
  }, [activeTab, hasAnimatedInfo]);

  return (
    <div className={`character-detail-overlay ${activeTab === 'showcase' ? 'is-showcase' : ''}`}>
      <div className="detail-header">
        <div className="detail-hero">
          <h1 className="detail-name">{character.name}</h1>
          <p className="detail-title">{character.title}</p>
          <p className="detail-meta">{character.race} {character.class} — Level {character.level}</p>
        </div>
        
        <div className="expanded-toolbar">
           <button type="button" className="back-btn" onClick={onClose}>
             ← Back to Codex
           </button>
          <div className="backdrop-info-wrapper">
            <button
              type="button"
              className={`backdrop-info ${shouldAnimateInfo ? 'backdrop-info--fade-in' : ''}`}
              aria-label="What is this glowing circle?"
              onClick={() => setShowBackdropHint((v) => !v)}
            >
              What is this glowing circle?
            </button>
            {showBackdropHint && (
              <div className="backdrop-tooltip" role="status">
                This is the color of your mana, visit the almanac to learn more!
              </div>
            )}
          </div>
          
          <div className="detail-nav">
            <button className="detail-nav-btn" onClick={handlePrevCharacter} title={`Previous: ${prevName}`}>
              ‹ <span className="detail-nav-label">{prevName}</span>
            </button>
            <span className="detail-nav-divider">◆</span>
            <button className="detail-nav-btn" onClick={handleNextCharacter} title={`Next: ${nextName}`}>
              <span className="detail-nav-label">{nextName}</span> ›
            </button>
          </div>

        </div>
      </div>

      <div
        className="detail-tab-bar"
        role="presentation"
        style={{
          gridTemplateColumns: `repeat(${tabs.length}, 1fr)`,
          '--detail-slide-count': tabs.length
        }}
      >
        {tabs.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`detail-tab-bar__segment ${activeTab === tab ? 'is-active' : ''}`}
          >
            <span>{tabLabels[tab]}</span>
          </button>
        ))}
        <div
          className="detail-tab-bar__indicator"
          style={{
            transform: `translateX(${currentTabIndex * 100}%)`,
            width: `${100 / tabs.length}%`
          }}
          aria-hidden="true"
        />
      </div>

      <div className="detail-viewport">
        <div 
          className="detail-track"
          data-state={isContentVisible ? 'visible' : 'fading'}
          style={{ 
            '--detail-slide-count': tabs.length,
            transform: `translateX(${slideOffset}%) translateY(var(--detail-shift, 0px))` 
          }}
        >
          {/* Slide 1: Details */}
          <div className="detail-slide" role="region" aria-label="Character details">
            <div className="detail-content" tabIndex={0} ref={contentRef}>
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

          {/* Slide 2: Logbook */}
          <div className="detail-slide" role="region" aria-label="Character logbook">
            <div className="detail-content" tabIndex={0}>
              <div className="detail-card">
                <h3>Character Logbook</h3>
                <p className="detail-line italic text-white/50">No entries recorded for {character.name} yet.</p>
              </div>
            </div>
          </div>

          {/* Slide 3: Inventory */}
          <div className="detail-slide" role="region" aria-label="Character inventory">
            <div className="detail-content" tabIndex={0}>
              <div className="detail-card">
                <h3>Character Inventory</h3>
                <div className="detail-block">
                  {character.equipment.length > 0 ? (
                    character.equipment.map(item => (
                      <div key={item} className="p-2 border-b border-white/10 flex justify-between">
                        <span>{item}</span>
                        <span className="text-white/50 text-sm">1</span>
                      </div>
                    ))
                  ) : (
                    <p className="detail-line italic text-white/50">Inventory is empty.</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Slide 4: Mana */}
          <div className="detail-slide backdrop-slide" role="region" aria-label="Mana view">
            <div className="detail-content backdrop-content" tabIndex={0}>
            </div>
          </div>
        </div>
        <div className="detail-carousel-bottom">
          <button type="button" onClick={handlePrevTab} aria-label={`Previous section: ${prevTabName}`}>
            {`< ${prevTabName}`}
          </button>
          <button type="button" onClick={handleNextTab} aria-label={`Next section: ${nextTabName}`}>
            {`${nextTabName} >`}
          </button>
        </div>
      </div>
    </div>
  );
}
