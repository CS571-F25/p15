import React, { useState } from 'react';
import '../UI/PageUI.css';

const tabs = ['details', 'logbook', 'inventory'];
const tabLabels = {
  details: 'Details',
  logbook: 'Logbook',
  inventory: 'Inventory',
};

export default function CharacterDetailView({ character, onClose, onNext, onPrev, nextName, prevName }) {
  const [activeTab, setActiveTab] = useState('details');

  if (!character) return null;

  const handlePrevTab = () => {
    const currentIndex = tabs.indexOf(activeTab);
    const nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
    setActiveTab(tabs[nextIndex]);
  };

  const handleNextTab = () => {
    const currentIndex = tabs.indexOf(activeTab);
    const nextIndex = (currentIndex + 1) % tabs.length;
    setActiveTab(tabs[nextIndex]);
  };

  const currentTabIndex = tabs.indexOf(activeTab);
  const prevTabName = tabLabels[tabs[(currentTabIndex - 1 + tabs.length) % tabs.length]];
  const nextTabName = tabLabels[tabs[(currentTabIndex + 1) % tabs.length]];

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

      <div
        className="detail-tab-bar"
        role="presentation"
        style={{ gridTemplateColumns: `repeat(${tabs.length}, 1fr)` }}
      >
        {tabs.map((tab) => (
          <div
            key={tab}
            className={`detail-tab-bar__segment ${activeTab === tab ? 'is-active' : ''}`}
          >
            <span>{tabLabels[tab]}</span>
          </div>
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
          style={{ 
            transform: `translateX(${activeTab === 'details' ? '0%' : activeTab === 'logbook' ? '-33.333%' : '-66.666%'})` 
          }}
        >
          {/* Slide 1: Details */}
          <div className="detail-slide">
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

          {/* Slide 2: Logbook */}
          <div className="detail-slide">
            <div className="detail-content">
              <div className="detail-card">
                <h3>Character Logbook</h3>
                <p className="detail-line italic text-white/50">No entries recorded for {character.name} yet.</p>
              </div>
            </div>
          </div>

          {/* Slide 3: Inventory */}
          <div className="detail-slide">
            <div className="detail-content">
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
