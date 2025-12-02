import React, { useEffect, useRef, useState } from 'react';
import '../UI/PageUI.css';

const tabs = ['details', 'logbook', 'inventory', 'showcase'];
const tabLabels = {
  details: 'Details',
  logbook: 'Logbook',
  inventory: 'Inventory',
  showcase: 'Mana',
};

export default function CharacterDetailView({ character: propCharacter, onClose, onNext, onPrev, nextName, prevName }) {
  const [activeTab, setActiveTab] = useState('details');
  const [isContentVisible, setIsContentVisible] = useState(true);
  const [isSwapLocked, setIsSwapLocked] = useState(false);
  const [showBackdropHint, setShowBackdropHint] = useState(false);
  const [hasAnimatedInfo, setHasAnimatedInfo] = useState(false);
  const [shouldAnimateInfo, setShouldAnimateInfo] = useState(false);
  const [expandedPanel, setExpandedPanel] = useState(null);
  const [displayCharacter, setDisplayCharacter] = useState(propCharacter);
  const swapDelay = 250;
  const contentRef = useRef(null);
  const modalCloseRef = useRef(null);

  if (!propCharacter || !displayCharacter) return null;

  useEffect(() => {
    setIsContentVisible(false);
    const timer = setTimeout(() => {
      setDisplayCharacter(propCharacter);
      setIsContentVisible(true);
    }, swapDelay);
    return () => clearTimeout(timer);
  }, [propCharacter?.id]);

  useEffect(() => {
    setIsContentVisible(false);
    const timer = setTimeout(() => setIsContentVisible(true), swapDelay);
    return () => clearTimeout(timer);
  }, [activeTab]);

  useEffect(() => {
    if (activeTab !== 'showcase') {
      setShowBackdropHint(false);
    }
  }, [activeTab]);

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

  useEffect(() => {
    if (!expandedPanel) return;
    const onKey = (event) => {
      if (event.key === 'Escape') {
        setExpandedPanel(null);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [expandedPanel]);

  useEffect(() => {
    if (expandedPanel && modalCloseRef.current) {
      modalCloseRef.current.focus({ preventScroll: true });
    }
  }, [expandedPanel]);

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

  const handlePanelOpen = (panelId) => {
    setExpandedPanel(panelId);
  };

  const handlePanelKeyDown = (event, panelId) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handlePanelOpen(panelId);
    }
  };

  const panelTitles = {
    attributes: 'Attributes',
    vitals: 'Vitals',
    lore: 'Lore & Background',
    abilities: 'Abilities',
    equipment: 'Equipment',
    notes: 'Notes',
    logbook: 'Character Logbook',
    inventory: 'Character Inventory',
  };

  const renderPanelContent = (panelId) => {
    switch (panelId) {
      case 'attributes':
        return (
          <>
            <h3>Attributes</h3>
            <div className="stat-grid custom-scrollbar">
              {Object.entries(displayCharacter.stats).map(([key, value]) => (
                <div key={key} className="stat-pill">
                  <span className="stat-pill__label">{key.toUpperCase()}</span>
                  <span className="stat-pill__value">{value}</span>
                </div>
              ))}
            </div>
          </>
        );
      case 'vitals':
        return (
          <>
            <h3>Vitals</h3>
            <div className="stat-grid custom-scrollbar">
              <div className="stat-pill">
                <span className="stat-pill__label">HP</span>
                <span className="stat-pill__value">{displayCharacter.hp}</span>
              </div>
              <div className="stat-pill">
                <span className="stat-pill__label">AC</span>
                <span className="stat-pill__value">{displayCharacter.ac}</span>
              </div>
              <div className="stat-pill">
                <span className="stat-pill__label">SPD</span>
                <span className="stat-pill__value">{displayCharacter.speed}</span>
              </div>
              <div className="stat-pill">
                <span className="stat-pill__label">PROF</span>
                <span className="stat-pill__value">+{displayCharacter.profBonus}</span>
              </div>
            </div>
          </>
        );
      case 'lore':
        return (
          <>
            <h3>Lore & Background</h3>
            <p className="detail-line">{displayCharacter.lore}</p>
            {displayCharacter.background && (
              <p className="detail-line detail-line--muted" style={{ marginTop: '1rem' }}>
                Background: {displayCharacter.background}
              </p>
            )}
          </>
        );
      case 'abilities':
        return (
          <>
            <h3>Abilities</h3>
            <div className="detail-block">
              {displayCharacter.abilities.map((ability) => (
                <span key={ability} className="detail-line">- {ability}</span>
              ))}
            </div>
          </>
        );
      case 'equipment':
        return (
          <>
            <h3>Equipment</h3>
            <div className="detail-block">
              {displayCharacter.equipment.map((item) => (
                <span key={item} className="detail-line">- {item}</span>
              ))}
            </div>
          </>
        );
      case 'notes':
        return (
          <>
            <h3>Notes</h3>
            <p className="detail-line">{displayCharacter.notes}</p>
          </>
        );
      case 'logbook':
        return (
          <>
            <h3>Character Logbook</h3>
            <p className="detail-line italic text-white/50">No entries recorded for {displayCharacter.name} yet.</p>
          </>
        );
      case 'inventory':
        return (
          <>
            <h3>Character Inventory</h3>
            <div className="detail-block">
              {displayCharacter.equipment.length > 0 ? (
                displayCharacter.equipment.map((item) => (
                  <div key={item} className="p-2 border-b border-white/10 flex justify-between">
                    <span>{item}</span>
                    <span className="text-white/50 text-sm">1</span>
                  </div>
                ))
              ) : (
                <p className="detail-line italic text-white/50">Inventory is empty.</p>
              )}
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`character-detail-overlay custom-scrollbar ${activeTab === 'showcase' ? 'is-showcase' : ''}`}>
      <div className="detail-header">
        <div className="detail-hero">
          <h1 className="detail-name">{displayCharacter.name}</h1>
          <p className="detail-title">{displayCharacter.title}</p>
          <p className="detail-meta">{displayCharacter.race} {displayCharacter.class} - Level {displayCharacter.level}</p>
        </div>
        
        <div className="expanded-toolbar">
          <button type="button" className="back-btn" onClick={onClose}>
            &lt; Back to Character List
          </button>
          
          <div className="detail-nav">
            <button className="detail-nav-btn" onClick={handlePrevCharacter} title={`Previous: ${prevName}`}>
              &lt; <span className="detail-nav-label">{prevName}</span>
            </button>
            <span className="detail-nav-divider">◆</span>
            <button className="detail-nav-btn" onClick={handleNextCharacter} title={`Next: ${nextName}`}>
              <span className="detail-nav-label">{nextName}</span> &gt;
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
          data-fade={isContentVisible ? 'in' : 'out'}
          style={{ 
            '--detail-slide-count': tabs.length,
            transform: `translateX(${slideOffset}%) translateY(var(--detail-shift, 0px))` 
          }}
        >
          {/* Slide 1: Details */}
          <div
            className="detail-slide custom-scrollbar"
            role="region"
            aria-label="Character details"
            data-visible={isContentVisible ? 'in' : 'out'}
          >
            <div className="detail-content" tabIndex={0} ref={contentRef} >
              <div className="detail-columns">
                <div
                  className="detail-card detail-card--interactive"
                  role="button"
                  tabIndex={0}
                  aria-label="Expand attributes panel"
                  onClick={() => handlePanelOpen('attributes')}
                  onKeyDown={(event) => handlePanelKeyDown(event, 'attributes')}
                >
                  {renderPanelContent('attributes')}
                  <span className="detail-card__hint">Click to zoom</span>
                </div>

                <div
                  className="detail-card detail-card--interactive"
                  role="button"
                  tabIndex={0}
                  aria-label="Expand vitals panel"
                  onClick={() => handlePanelOpen('vitals')}
                  onKeyDown={(event) => handlePanelKeyDown(event, 'vitals')}
                >
                  {renderPanelContent('vitals')}
                  <span className="detail-card__hint">Click to zoom</span>
                </div>
              </div>

              <div
                className="detail-card detail-card--interactive"
                role="button"
                tabIndex={0}
                aria-label="Expand lore panel"
                onClick={() => handlePanelOpen('lore')}
                onKeyDown={(event) => handlePanelKeyDown(event, 'lore')}
              >
                {renderPanelContent('lore')}
                <span className="detail-card__hint">Click to zoom</span>
              </div>

              <div className="detail-columns">
                <div
                  className="detail-card detail-card--interactive"
                  role="button"
                  tabIndex={0}
                  aria-label="Expand abilities panel"
                  onClick={() => handlePanelOpen('abilities')}
                  onKeyDown={(event) => handlePanelKeyDown(event, 'abilities')}
                >
                  {renderPanelContent('abilities')}
                  <span className="detail-card__hint">Click to zoom</span>
                </div>

                <div
                  className="detail-card detail-card--interactive"
                  role="button"
                  tabIndex={0}
                  aria-label="Expand equipment panel"
                  onClick={() => handlePanelOpen('equipment')}
                  onKeyDown={(event) => handlePanelKeyDown(event, 'equipment')}
                >
                  {renderPanelContent('equipment')}
                  <span className="detail-card__hint">Click to zoom</span>
                </div>
              </div>
              
              {displayCharacter.notes && (
                <div
                  className="detail-card detail-card--interactive"
                  role="button"
                  tabIndex={0}
                  aria-label="Expand notes panel"
                  onClick={() => handlePanelOpen('notes')}
                  onKeyDown={(event) => handlePanelKeyDown(event, 'notes')}
                >
                  {renderPanelContent('notes')}
                  <span className="detail-card__hint">Click to zoom</span>
                </div>
              )}
            </div>
          </div>

          {/* Slide 2: Logbook */}
          <div
            className="detail-slide custom-scrollbar"
            role="region"
            aria-label="Character logbook"
            data-visible={isContentVisible ? 'in' : 'out'}
          >
            <div className="detail-content" tabIndex={0} >
              <div
                className="detail-card detail-card--interactive"
                role="button"
                tabIndex={0}
                aria-label="Expand logbook panel"
                onClick={() => handlePanelOpen('logbook')}
                onKeyDown={(event) => handlePanelKeyDown(event, 'logbook')}
              >
                {renderPanelContent('logbook')}
                <span className="detail-card__hint">Click to zoom</span>
              </div>
            </div>
          </div>

          {/* Slide 3: Inventory */}
          <div
            className="detail-slide custom-scrollbar"
            role="region"
            aria-label="Character inventory"
            data-visible={isContentVisible ? 'in' : 'out'}
          >
            <div className="detail-content" tabIndex={0} >
              <div
                className="detail-card detail-card--interactive"
                role="button"
                tabIndex={0}
                aria-label="Expand inventory panel"
                onClick={() => handlePanelOpen('inventory')}
                onKeyDown={(event) => handlePanelKeyDown(event, 'inventory')}
              >
                {renderPanelContent('inventory')}
                <span className="detail-card__hint">Click to zoom</span>
              </div>
            </div>
          </div>

          {/* Slide 4: Mana */}
          <div
            className="detail-slide backdrop-slide custom-scrollbar"
            role="region"
            aria-label="Mana view"
            data-visible={isContentVisible ? 'in' : 'out'}
          >
            <div className="detail-content backdrop-content" tabIndex={0} >
            </div>
          </div>
        </div>
        {activeTab === 'showcase' && (
          <div className="detail-backdrop-info">
            <div className="backdrop-info-wrapper">
              <button
                type="button"
                className="backdrop-info"
                aria-label="What is this glowing circle?"
                aria-describedby="backdrop-info-desc"
                onClick={() => setShowBackdropHint((v) => !v)}
              >
                What is this glowing circle?
              </button>
              <span id="backdrop-info-desc" className="sr-only">
                This is the color of your mana, visit the almanac to learn more!
              </span>
              {showBackdropHint && (
                <div className="backdrop-tooltip" role="status">
                  This is the color of your mana, visit the almanac to learn more!
                </div>
              )}
            </div>
          </div>
        )}
        <div className="detail-carousel-bottom">
          <button type="button" onClick={handlePrevTab} aria-label={`Previous section: ${prevTabName}`}>
            {`< ${prevTabName}`}
          </button>
          <button type="button" onClick={handleNextTab} aria-label={`Next section: ${nextTabName}`}>
            {`${nextTabName} >`}
          </button>
        </div>
      </div>

      {expandedPanel && (
        <div className="detail-modal" role="dialog" aria-modal="true" aria-label={`Expanded view of ${panelTitles[expandedPanel]}`}>
          <div className="detail-modal__backdrop" onClick={() => setExpandedPanel(null)} />
          <div className="detail-modal__body" role="document">
            <header className="detail-modal__header">
              <div>
                <p className="detail-eyebrow">Expanded View</p>
                <h2 className="detail-modal__title">{panelTitles[expandedPanel]}</h2>
              </div>
              <button
                type="button"
                className="detail-modal__close"
                onClick={() => setExpandedPanel(null)}
                aria-label="Close expanded panel"
                ref={modalCloseRef}
              >
                Close
              </button>
            </header>
            <div className="detail-modal__content custom-scrollbar">
              {renderPanelContent(expandedPanel)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
