import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import characters from '../../data/characters_heroes';
import {
  getAbilityModifier,
  formatModifier,
  getSavingThrow,
  getSkillModifier,
  getPassiveScore,
  getInitiative,
  SKILL_ABILITIES,
  ABILITY_NAMES,
  getAllSkills
} from '../../utils/dnd-calculations';
import './CharacterSheetPage.css';

// Action type tabs
const ACTION_TABS = ['Actions', 'Spells', 'Inventory', 'Features', 'Description', 'Notes'];
const ACTION_FILTERS = ['Attack', 'Action', 'Bonus', 'Reaction', 'Other'];

// Icons for attacks
const AttackIcon = ({ type }) => {
  const icons = {
    melee: '⚔️',
    ranged: '🏹',
    spell: '✨',
    default: '⚡'
  };
  return <span>{icons[type] || icons.default}</span>;
};

export default function CharacterSheetPage() {
  // Use first character as sample data
  const [characterId, setCharacterId] = useState(1);
  const [activeTab, setActiveTab] = useState('Actions');
  const [activeFilter, setActiveFilter] = useState('Attack');
  
  // HP state for interaction demo
  const [currentHp, setCurrentHp] = useState(null);
  const [tempHp, setTempHp] = useState(0);
  
  // Hit Dice state
  const [usedHitDice, setUsedHitDice] = useState(0);
  
  // Settings modal state
  const [showSettings, setShowSettings] = useState(false);
  
  // Toast notification state
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const character = useMemo(() => 
    characters.find(c => c.id === characterId) || characters[0],
    [characterId]
  );

  // Extract character data
  const sheet = character.sheet || {};
  const abilityScores = sheet.abilityScores || character.stats || {};
  const proficiencies = sheet.proficiencies || {};
  const combat = sheet.combat || {};
  const profBonus = character.profBonus || 2;

  // Initialize HP from character data
  const maxHp = parseInt(combat.hitPoints || character.hp) || 0;
  const displayHp = currentHp !== null ? currentHp : maxHp;

  // Calculate all modifiers
  const abilityMods = useMemo(() => {
    const mods = {};
    Object.entries(abilityScores).forEach(([key, value]) => {
      mods[key] = getAbilityModifier(value);
    });
    return mods;
  }, [abilityScores]);

  // Saving throw proficiencies
  const saveProficiencies = useMemo(() => {
    const saves = proficiencies.savingThrows || [];
    return {
      str: saves.some(s => s.toLowerCase().includes('strength')),
      dex: saves.some(s => s.toLowerCase().includes('dexterity')),
      con: saves.some(s => s.toLowerCase().includes('constitution')),
      int: saves.some(s => s.toLowerCase().includes('intelligence')),
      wis: saves.some(s => s.toLowerCase().includes('wisdom')),
      cha: saves.some(s => s.toLowerCase().includes('charisma'))
    };
  }, [proficiencies.savingThrows]);

  // Skill proficiencies
  const skillProficiencies = useMemo(() => {
    const skills = proficiencies.skills || character.skills || [];
    const profSet = new Set(skills.map(s => s.toLowerCase()));
    return profSet;
  }, [proficiencies.skills, character.skills]);

  // Calculate passive scores
  const passives = useMemo(() => {
    const perceptionMod = getSkillModifier(
      abilityScores.wis || 10, 
      profBonus, 
      skillProficiencies.has('perception')
    );
    const investigationMod = getSkillModifier(
      abilityScores.int || 10, 
      profBonus, 
      skillProficiencies.has('investigation')
    );
    const insightMod = getSkillModifier(
      abilityScores.wis || 10, 
      profBonus, 
      skillProficiencies.has('insight')
    );
    return {
      perception: getPassiveScore(perceptionMod),
      investigation: getPassiveScore(investigationMod),
      insight: getPassiveScore(insightMod)
    };
  }, [abilityScores, profBonus, skillProficiencies]);

  // Get attacks from sheet
  const attacks = sheet.attacks || [];

  // Parse hit dice for tracking
  const hitDiceMatch = (combat.hitDice || '').match(/(\d+)d(\d+)/);
  const totalHitDice = hitDiceMatch ? parseInt(hitDiceMatch[1]) : character.level || 1;
  const hitDieType = hitDiceMatch ? parseInt(hitDiceMatch[2]) : 8;
  const availableHitDice = Math.max(0, totalHitDice - usedHitDice);

  // Short Rest handler - can spend hit dice to heal
  const handleShortRest = () => {
    if (availableHitDice > 0) {
      // Roll a hit die (simplified: use average)
      const conMod = abilityMods.con || 0;
      const healAmount = Math.floor(hitDieType / 2) + 1 + conMod;
      const newHp = Math.min(maxHp, displayHp + healAmount);
      setCurrentHp(newHp);
      setUsedHitDice(prev => prev + 1);
      showToast(`☀️ Short Rest: Healed ${healAmount} HP (${availableHitDice - 1} hit dice remaining)`, 'success');
    } else {
      showToast('☀️ Short Rest: No hit dice available to spend', 'warning');
    }
  };

  // Long Rest handler - restore HP and half hit dice
  const handleLongRest = () => {
    setCurrentHp(maxHp);
    setTempHp(0);
    const hitDiceRecovered = Math.max(1, Math.floor(totalHitDice / 2));
    setUsedHitDice(prev => Math.max(0, prev - hitDiceRecovered));
    showToast(`🌙 Long Rest: HP fully restored, ${hitDiceRecovered} hit dice recovered`, 'success');
  };

  return (
    <div className="character-sheet-page custom-scrollbar">
      {/* Toast Notification */}
      {toast && (
        <div className={`sheet-toast sheet-toast--${toast.type}`}>
          {toast.message}
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="sheet-modal-backdrop" onClick={() => setShowSettings(false)}>
          <div className="sheet-modal" onClick={e => e.stopPropagation()}>
            <header className="sheet-modal__header">
              <h2>⚙️ Sheet Settings</h2>
              <button className="sheet-modal__close" onClick={() => setShowSettings(false)}>✕</button>
            </header>
            <div className="sheet-modal__content">
              <div className="sheet-modal__section">
                <h3 className="sheet-card__title">Character Info</h3>
                <p><strong>Name:</strong> {character.name}</p>
                <p><strong>Class:</strong> {character.class} (Level {character.level})</p>
                <p><strong>Race:</strong> {character.race}</p>
                <p><strong>Background:</strong> {character.background}</p>
                <p><strong>Alignment:</strong> {character.alignment}</p>
              </div>
              <div className="sheet-modal__section">
                <h3 className="sheet-card__title">Resources</h3>
                <p><strong>Hit Dice:</strong> {availableHitDice} / {totalHitDice} (d{hitDieType})</p>
                <p><strong>HP:</strong> {displayHp} / {maxHp}</p>
                {tempHp > 0 && <p><strong>Temp HP:</strong> {tempHp}</p>}
              </div>
              <div className="sheet-modal__section">
                <h3 className="sheet-card__title">Quick Actions</h3>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <button className="sheet-header__btn" onClick={() => { setCurrentHp(maxHp); showToast('HP reset to max', 'info'); }}>
                    Reset HP
                  </button>
                  <button className="sheet-header__btn" onClick={() => { setUsedHitDice(0); showToast('Hit dice reset', 'info'); }}>
                    Reset Hit Dice
                  </button>
                  <button className="sheet-header__btn" onClick={() => { setTempHp(0); showToast('Temp HP cleared', 'info'); }}>
                    Clear Temp HP
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header Bar */}
      <header className="sheet-header">
        <div className="sheet-header__profile">
          <div>
            <h1 className="sheet-header__name">{character.name}</h1>
            <p className="sheet-header__meta">
              {character.race} {character.class} — Level {character.level}
            </p>
          </div>
        </div>
        
        <div className="sheet-header__actions">
          <select 
            className="sheet-header__btn"
            value={characterId}
            onChange={(e) => {
              setCharacterId(parseInt(e.target.value));
              setCurrentHp(null);
              setUsedHitDice(0);
              setTempHp(0);
            }}
          >
            {characters.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <button 
            className="sheet-header__btn sheet-header__btn--rest"
            onClick={handleShortRest}
            title={`Spend a hit die to heal (${availableHitDice} available)`}
          >
            ☀️ Short Rest
          </button>
          <button 
            className="sheet-header__btn sheet-header__btn--rest"
            onClick={handleLongRest}
            title="Restore all HP and recover half your hit dice"
          >
            🌙 Long Rest
          </button>
          <button 
            className="sheet-header__btn"
            onClick={() => setShowSettings(true)}
            title="Open settings"
          >
            ⚙️
          </button>
          <Link to="/campaign" className="sheet-header__btn">
            ← Back
          </Link>
        </div>
      </header>

      {/* Main 3-Column Grid */}
      <div className="sheet-grid">
        {/* Column 1: Core Stats */}
        <div className="sheet-column sheet-column--stats">
          {/* Ability Scores */}
          <div className="sheet-card">
            <h2 className="sheet-card__title">Ability Scores</h2>
            <div className="ability-scores">
              {Object.entries(abilityScores).map(([key, value]) => (
                <div key={key} className="ability-card">
                  <span className="ability-card__abbr">{key.toUpperCase()}</span>
                  <span className="ability-card__mod">{formatModifier(abilityMods[key])}</span>
                  <span className="ability-card__score">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Saving Throws */}
          <div className="sheet-card">
            <h2 className="sheet-card__title">Saving Throws</h2>
            <div className="saving-throws">
              {Object.entries(ABILITY_NAMES).map(([key, name]) => {
                const isProficient = saveProficiencies[key];
                const save = getSavingThrow(abilityScores[key] || 10, profBonus, isProficient);
                return (
                  <div key={key} className="save-row">
                    <span className={`save-row__prof ${isProficient ? 'save-row__prof--active' : ''}`} />
                    <span className="save-row__name">{name}</span>
                    <span className="save-row__mod">{formatModifier(save)}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Passive Senses */}
          <div className="sheet-card">
            <h2 className="sheet-card__title">Passive Senses</h2>
            <div className="passive-senses">
              <div className="passive-row">
                <span className="passive-row__label">Perception</span>
                <span className="passive-row__value">{passives.perception}</span>
              </div>
              <div className="passive-row">
                <span className="passive-row__label">Investigation</span>
                <span className="passive-row__value">{passives.investigation}</span>
              </div>
              <div className="passive-row">
                <span className="passive-row__label">Insight</span>
                <span className="passive-row__value">{passives.insight}</span>
              </div>
            </div>
            {sheet.core?.raceTraits?.includes('Darkvision') && (
              <div className="passive-row" style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <span className="passive-row__label">Darkvision</span>
                <span className="passive-row__value">60 ft</span>
              </div>
            )}
          </div>

          {/* Proficiencies Summary */}
          <div className="sheet-card">
            <h2 className="sheet-card__title">Proficiencies</h2>
            <div className="proficiency-list">
              {(proficiencies.armorWeapons || []).map((prof, i) => (
                <span key={i} className="proficiency-chip">{prof}</span>
              ))}
              {(proficiencies.tools || []).map((prof, i) => (
                <span key={`tool-${i}`} className="proficiency-chip">{prof}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Column 2: Skills & Combat */}
        <div className="sheet-column sheet-column--skills">
          {/* Combat Stats Row */}
          <div className="sheet-card">
            <div className="combat-stats">
              <div className="combat-stat combat-stat--shield">
                <span className="combat-stat__label">AC</span>
                <span className="combat-stat__value">{combat.armorClass || character.ac}</span>
              </div>
              <div className="combat-stat combat-stat--shield">
                <span className="combat-stat__label">Initiative</span>
                <span className="combat-stat__value">{formatModifier(getInitiative(abilityScores.dex || 10))}</span>
              </div>
              <div className="combat-stat">
                <span className="combat-stat__label">Speed</span>
                <span className="combat-stat__value">{character.speed || 30}</span>
              </div>
            </div>
          </div>

          {/* Hit Points */}
          <div className="sheet-card">
            <h2 className="sheet-card__title">Hit Points</h2>
            <div className="hp-panel">
              <div className="hp-display">
                <input
                  type="number"
                  className="hp-input hp-input--current"
                  value={displayHp}
                  onChange={(e) => setCurrentHp(parseInt(e.target.value) || 0)}
                  min={0}
                />
                <span className="hp-divider">/</span>
                <input
                  type="number"
                  className="hp-input"
                  value={maxHp}
                  readOnly
                />
                <span className="hp-divider">+</span>
                <input
                  type="number"
                  className="hp-input"
                  value={tempHp}
                  onChange={(e) => setTempHp(parseInt(e.target.value) || 0)}
                  min={0}
                  placeholder="0"
                />
              </div>
              <div className="hp-labels">
                <span>Current</span>
                <span>Max</span>
                <span>Temp</span>
              </div>
            </div>
          </div>

          {/* Proficiency Bonus & Hit Dice */}
          <div className="sheet-card">
            <div className="combat-stats" style={{ gridTemplateColumns: '1fr 1fr' }}>
              <div className="combat-stat">
                <span className="combat-stat__label">Proficiency</span>
                <span className="combat-stat__value">+{profBonus}</span>
              </div>
              <div className="combat-stat">
                <span className="combat-stat__label">Hit Dice</span>
                <span className="combat-stat__value" style={{ fontSize: '1rem' }}>{combat.hitDice || '—'}</span>
              </div>
            </div>
          </div>

          {/* Skills */}
          <div className="sheet-card" style={{ flex: 1 }}>
            <h2 className="sheet-card__title">Skills</h2>
            <div className="skills-table custom-scrollbar">
              {getAllSkills().map(skill => {
                const ability = SKILL_ABILITIES[skill];
                const isProficient = skillProficiencies.has(skill.toLowerCase());
                const mod = getSkillModifier(abilityScores[ability] || 10, profBonus, isProficient);
                return (
                  <div key={skill} className="skill-row">
                    <span className={`skill-row__prof ${isProficient ? 'skill-row__prof--active' : ''}`} />
                    <span className="skill-row__ability">{ability.toUpperCase()}</span>
                    <span className="skill-row__name">{skill}</span>
                    <span className="skill-row__mod">{formatModifier(mod)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Column 3: Actions & Tabs */}
        <div className="sheet-column sheet-column--actions">
          <div className="sheet-card actions-panel">
            {/* Tab Navigation */}
            <div className="actions-tabs">
              {ACTION_TABS.map(tab => (
                <button
                  key={tab}
                  className={`actions-tab ${activeTab === tab ? 'actions-tab--active' : ''}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="actions-content custom-scrollbar">
              {activeTab === 'Actions' && (
                <>
                  {/* Filter Chips */}
                  <div className="action-filters">
                    {ACTION_FILTERS.map(filter => (
                      <button
                        key={filter}
                        className={`action-chip ${activeFilter === filter ? 'action-chip--active' : ''}`}
                        onClick={() => setActiveFilter(filter)}
                      >
                        {filter}
                      </button>
                    ))}
                  </div>

                  {/* Attack List */}
                  <div className="attack-list">
                    {attacks.length > 0 ? attacks.map((attack, i) => (
                      <div key={i} className="attack-item">
                        <div className="attack-item__icon">
                          <AttackIcon type={attack.tags?.includes('Melee') ? 'melee' : attack.tags?.includes('Ranged') ? 'ranged' : attack.tags?.includes('Spell') ? 'spell' : 'default'} />
                        </div>
                        <span className="attack-item__name">{attack.name}</span>
                        <span className="attack-item__range">{attack.tags?.join(', ')}</span>
                        <span className="attack-item__hit">{attack.bonus}</span>
                        <span className="attack-item__damage">{attack.damage}</span>
                      </div>
                    )) : (
                      <p style={{ color: 'var(--sheet-text-muted)', fontStyle: 'italic' }}>
                        No attacks configured.
                      </p>
                    )}
                  </div>

                  {/* Combat Actions Cheat Sheet */}
                  <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    <h3 className="sheet-card__title">Actions in Combat</h3>
                    <div className="proficiency-list" style={{ gap: '0.5rem' }}>
                      {['Attack', 'Cast a Spell', 'Dash', 'Disengage', 'Dodge', 'Help', 'Hide', 'Ready', 'Search', 'Use an Object'].map(action => (
                        <span key={action} className="proficiency-chip">{action}</span>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {activeTab === 'Spells' && (
                <div>
                  {sheet.spellsDetail?.ability && sheet.spellsDetail.ability !== 'None' ? (
                    <>
                      <div className="combat-stats" style={{ marginBottom: '1rem' }}>
                        <div className="combat-stat">
                          <span className="combat-stat__label">Spell DC</span>
                          <span className="combat-stat__value">{sheet.spellsDetail.saveDC}</span>
                        </div>
                        <div className="combat-stat">
                          <span className="combat-stat__label">Attack</span>
                          <span className="combat-stat__value">{sheet.spellsDetail.attackBonus}</span>
                        </div>
                        <div className="combat-stat">
                          <span className="combat-stat__label">Ability</span>
                          <span className="combat-stat__value" style={{ fontSize: '0.9rem' }}>{sheet.spellsDetail.ability?.slice(0, 3).toUpperCase()}</span>
                        </div>
                      </div>
                      <p style={{ fontSize: '0.85rem', color: 'var(--sheet-text-muted)', marginBottom: '0.75rem' }}>
                        {sheet.spellsDetail.slots}
                      </p>
                      <div className="proficiency-list">
                        {(sheet.spellsDetail.known || character.spells || []).map((spell, i) => (
                          <span key={i} className="proficiency-chip">{spell}</span>
                        ))}
                      </div>
                    </>
                  ) : (
                    <p style={{ color: 'var(--sheet-text-muted)', fontStyle: 'italic' }}>
                      This character does not cast spells.
                    </p>
                  )}
                </div>
              )}

              {activeTab === 'Inventory' && (
                <div className="proficiency-list" style={{ gap: '0.5rem' }}>
                  {(sheet.equipmentDetail?.starting || character.equipment || []).map((item, i) => (
                    <span key={i} className="proficiency-chip">{item}</span>
                  ))}
                  {sheet.equipmentDetail?.wealth && (
                    <span className="proficiency-chip" style={{ background: 'rgba(207, 170, 104, 0.15)', borderColor: 'var(--sheet-accent)' }}>
                      💰 {sheet.equipmentDetail.wealth}
                    </span>
                  )}
                </div>
              )}

              {activeTab === 'Features' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <h3 className="sheet-card__title">Class Features</h3>
                    <div className="proficiency-list">
                      {(sheet.features?.classFeatures || character.abilities || []).map((feat, i) => (
                        <span key={i} className="proficiency-chip">{feat}</span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="sheet-card__title">Racial Traits</h3>
                    <div className="proficiency-list">
                      {(sheet.features?.racialTraits || sheet.core?.raceTraits || []).map((trait, i) => (
                        <span key={i} className="proficiency-chip">{trait}</span>
                      ))}
                    </div>
                  </div>
                  {sheet.features?.feats?.length > 0 && (
                    <div>
                      <h3 className="sheet-card__title">Feats</h3>
                      <div className="proficiency-list">
                        {sheet.features.feats.map((feat, i) => (
                          <span key={i} className="proficiency-chip">{feat}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'Description' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <h3 className="sheet-card__title">Appearance</h3>
                    <p style={{ color: 'var(--sheet-text)', lineHeight: 1.6, margin: 0 }}>
                      {sheet.core?.appearance || 'No appearance description.'}
                    </p>
                  </div>
                  <div>
                    <h3 className="sheet-card__title">Backstory</h3>
                    <p style={{ color: 'var(--sheet-text)', lineHeight: 1.6, margin: 0 }}>
                      {sheet.core?.backstory || character.lore || 'No backstory written.'}
                    </p>
                  </div>
                  {sheet.personality && (
                    <div>
                      <h3 className="sheet-card__title">Personality</h3>
                      <div className="proficiency-list">
                        {sheet.personality.traits?.map((t, i) => <span key={i} className="proficiency-chip">{t}</span>)}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'Notes' && (
                <div>
                  <p style={{ color: 'var(--sheet-text)', lineHeight: 1.6, margin: 0 }}>
                    {sheet.extras?.notes || character.notes || 'No notes.'}
                  </p>
                  {proficiencies.languages && (
                    <div style={{ marginTop: '1rem' }}>
                      <h3 className="sheet-card__title">Languages</h3>
                      <div className="proficiency-list">
                        {proficiencies.languages.map((lang, i) => (
                          <span key={i} className="proficiency-chip">{lang}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
