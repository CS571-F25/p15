import React, { useEffect, useMemo, useRef, useState } from 'react';
import characters from '../../data/characters';
import '../UI/PageUI.css';
import ShaderBackgroundDualCrossfade from '../visuals/ShaderBackgroundDualCrossfade';
import CharacterCard from '../cards/CharacterCard';
import { useAuth } from '../../context/AuthContext';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
const ALL_TABS = ['all', 'yours', 'inventory', 'items', 'notes'];
const INNER_TABS = ['sheet', 'inventory', 'notes', 'spells'];

const defaultVisibleIds = characters.map((c) => c.id);

function loadLocal(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function saveLocal(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}

export default function CharactersPage() {
  const { user, role, token } = useAuth();
  const [activeTab, setActiveTab] = useState('all');
  const [visibleIds, setVisibleIds] = useState(defaultVisibleIds);
  const [favorites, setFavorites] = useState([]);
  const [featuredCharacter, setFeaturedCharacter] = useState(null);
  const [vanished, setVanished] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [innerTabs, setInnerTabs] = useState({});

  const [currentColor, setCurrentColor] = useState(characters[0].color);
  const [targetColor, setTargetColor] = useState(characters[0].color);
  const [fade, setFade] = useState(0);
  const animationRef = useRef(null);

  const storageKey = (suffix) => `${user?.id || 'anon'}-${suffix}`;
  const [inventory, setInventory] = useState([]);
  const [items, setItems] = useState([]);
  const [notes, setNotes] = useState('');
  const [charNotes, setCharNotes] = useState({});
  const [charInventory, setCharInventory] = useState({});

  useEffect(() => {
    setInventory(loadLocal(storageKey('inventory'), []));
    setItems(loadLocal(storageKey('items'), []));
    setNotes(loadLocal(storageKey('notes'), ''));
    setCharNotes(loadLocal(storageKey('char-notes'), {}));
    setCharInventory(loadLocal(storageKey('char-inventory'), {}));
    setInnerTabs({});
  }, [user]);

  useEffect(() => {
    saveLocal(storageKey('inventory'), inventory);
  }, [inventory, user]);

  useEffect(() => {
    saveLocal(storageKey('items'), items);
  }, [items, user]);

  useEffect(() => {
    saveLocal(storageKey('notes'), notes);
  }, [notes, user]);

  useEffect(() => {
    saveLocal(storageKey('char-notes'), charNotes);
  }, [charNotes, user]);

  useEffect(() => {
    saveLocal(storageKey('char-inventory'), charInventory);
  }, [charInventory, user]);

  useEffect(() => {
    const fetchVisible = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/characters/visible`);
        const data = await res.json();
        if (res.ok && Array.isArray(data.visibleIds)) {
          setVisibleIds(data.visibleIds);
        }
      } catch {
        setVisibleIds(defaultVisibleIds);
      }
    };
    fetchVisible();
  }, []);

  useEffect(() => {
    const fetchUserPrefs = async () => {
      if (!token) {
        setFavorites([]);
        setFeaturedCharacter(null);
        return;
      }
      try {
        const res = await fetch(`${API_BASE_URL}/characters/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) {
          setFavorites(Array.isArray(data.favorites) ? data.favorites : []);
          setFeaturedCharacter(data.featuredCharacter ?? null);
        }
      } catch {
        // ignore
      }
    };
    fetchUserPrefs();
  }, [token]);

  const visibleCharacters = useMemo(
    () => characters.filter((c) => visibleIds.includes(c.id)),
    [visibleIds]
  );

  const favoriteCharacters = useMemo(
    () => visibleCharacters.filter((c) => favorites.includes(c.id)),
    [favorites, visibleCharacters]
  );

  const featured = useMemo(
    () => visibleCharacters.find((c) => c.id === featuredCharacter) || null,
    [visibleCharacters, featuredCharacter]
  );

  const displayCharacters = activeTab === 'yours' ? favoriteCharacters : visibleCharacters;

  useEffect(() => {
    if (!displayCharacters.length) return;
    setActiveIndex((prev) => Math.min(prev, displayCharacters.length - 1));
  }, [displayCharacters.length]);

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === 'v' || event.key === 'V') {
        setVanished((v) => !v);
      } else if (event.key === 'ArrowLeft') {
        setActiveIndex((prev) => Math.max(prev - 1, 0));
      } else if (event.key === 'ArrowRight') {
        setActiveIndex((prev) => Math.min(prev + 1, displayCharacters.length - 1));
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [displayCharacters.length]);

  const startColorFade = (newColor) => {
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    const start = targetColor;
    setCurrentColor(start);
    setTargetColor(newColor);
    setFade(0);
    let t0 = performance.now();
    const step = (now) => {
      const f = Math.min(1, (now - t0) / 800);
      setFade(f);
      if (f < 1) {
        animationRef.current = requestAnimationFrame(step);
      } else {
        setCurrentColor(newColor);
        setFade(0);
        animationRef.current = null;
      }
    };
    animationRef.current = requestAnimationFrame(step);
  };

  useEffect(() => {
    if (!displayCharacters.length) return;
    const color = displayCharacters[activeIndex]?.color || [0, 0, 0, 1];
    startColorFade(color);
  }, [activeIndex, displayCharacters]);

  const handleToggleFavorite = async (id) => {
    if (!token) return;
    const isFav = favorites.includes(id);
    try {
      const res = await fetch(`${API_BASE_URL}/characters/favorite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ characterId: id, favorite: !isFav }),
      });
      const data = await res.json();
      if (res.ok) {
        setFavorites(data.favorites || []);
        setFeaturedCharacter(data.featuredCharacter ?? featuredCharacter);
      }
    } catch {
      // ignore
    }
  };

  const handleFeature = async (id) => {
    if (!token) return;
    const nextId = featuredCharacter === id ? null : id;
    try {
      const res = await fetch(`${API_BASE_URL}/characters/feature`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ characterId: nextId }),
      });
      const data = await res.json();
      if (res.ok) {
        setFavorites(data.favorites || favorites);
        setFeaturedCharacter(data.featuredCharacter ?? null);
      }
    } catch {
      // ignore
    }
  };

  const handleVisibilityChange = async (id, checked) => {
    if (role !== 'admin') return;
    const nextSet = new Set(visibleIds);
    if (checked) nextSet.add(id);
    else nextSet.delete(id);
    const nextList = Array.from(nextSet);
    setVisibleIds(nextList);
    try {
      await fetch(`${API_BASE_URL}/characters/visible`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ visibleIds: nextList }),
      });
    } catch {
      // ignore
    }
  };

  const setInnerTab = (charId, tab) => {
    setInnerTabs((prev) => ({ ...prev, [charId]: tab }));
  };

  const currentChar = displayCharacters[activeIndex];
  const currentInnerTab = currentChar ? innerTabs[currentChar.id] || 'sheet' : 'sheet';

  const currentInventory = (charInventory[currentChar?.id] || currentChar?.equipment || []).slice();
  const currentNotes = charNotes[currentChar?.id] || currentChar?.notes || '';

  const addInventoryItem = (value) => {
    if (!currentChar || !value.trim()) return;
    const next = [...currentInventory, value.trim()];
    setCharInventory((prev) => ({ ...prev, [currentChar.id]: next }));
  };

  const updateNotes = (value) => {
    if (!currentChar) return;
    setCharNotes((prev) => ({ ...prev, [currentChar.id]: value }));
  };

  const renderInnerContent = () => {
    if (!currentChar) return null;
    switch (currentInnerTab) {
      case 'inventory':
        return (
          <div className="list-panel">
            <div className="list-panel__controls">
              <input
                type="text"
                placeholder="Add item"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.target.value.trim()) {
                    addInventoryItem(e.target.value);
                    e.target.value = '';
                  }
                }}
              />
              <button type="button" onClick={() => setCharInventory((prev) => ({ ...prev, [currentChar.id]: [] }))}>
                Clear
              </button>
            </div>
            <ul className="simple-list">
              {currentInventory.map((entry, idx) => (
                <li key={`${entry}-${idx}`}>{entry}</li>
              ))}
            </ul>
          </div>
        );
      case 'notes':
        return (
          <div className="list-panel">
            <textarea
              value={currentNotes}
              onChange={(e) => updateNotes(e.target.value)}
              rows={6}
              placeholder="Session notes for this character..."
            />
          </div>
        );
      case 'spells':
        return (
          <div className="list-panel">
            <h3>Spells</h3>
            {currentChar.spells && currentChar.spells.length ? (
              <ul className="simple-list">
                {currentChar.spells.map((spell) => (
                  <li key={spell}>{spell}</li>
                ))}
              </ul>
            ) : (
              <p className="account-muted">No spells recorded.</p>
            )}
          </div>
        );
      case 'sheet':
      default:
        return (
          <CharacterCard
            character={{
              ...currentChar,
              equipment: currentInventory.length ? currentInventory : currentChar.equipment,
              notes: currentNotes || currentChar.notes,
            }}
            onToggleFavorite={token ? () => handleToggleFavorite(currentChar.id) : null}
            isFavorite={favorites.includes(currentChar.id)}
            onFeature={token ? () => handleFeature(currentChar.id) : null}
            isFeatured={featuredCharacter === currentChar.id}
          />
        );
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'yours':
      case 'all':
        if (!displayCharacters.length) {
          return <p className="characters-empty">No characters available.</p>;
        }
        return (
          <div className="outer-carousel">
            <button
              type="button"
              className="arrow-btn"
              onClick={() => setActiveIndex((prev) => Math.max(prev - 1, 0))}
              disabled={activeIndex === 0}
            >
              ‹
            </button>
            <div className="outer-frame">
              <div className="outer-track" style={{ transform: `translateX(-${activeIndex * 100}%)` }}>
                {displayCharacters.map((char) => (
                  <div className="outer-slide" key={char.id}>
                    <header className="slide-header">
                      <div>
                        <p className="account-card__eyebrow">Character</p>
                        <h2>{char.name}</h2>
                        <p className="account-muted">{char.race} · {char.class}</p>
                      </div>
                      <div className="slide-tags">
                        {featuredCharacter === char.id && <span className="tag">Featured</span>}
                        {favorites.includes(char.id) && <span className="tag">Favorite</span>}
                      </div>
                    </header>
                    <div className="inner-tabs">
                      {INNER_TABS.map((tab) => (
                        <button
                          key={tab}
                          type="button"
                          className={`tab-btn ${currentInnerTab === tab && currentChar?.id === char.id ? 'tab-btn--active' : ''}`}
                          onClick={() => setInnerTab(char.id, tab)}
                        >
                          {tab === 'sheet' && 'Character Sheet'}
                          {tab === 'inventory' && 'Inventory'}
                          {tab === 'notes' && 'Notes'}
                          {tab === 'spells' && 'Spell Sheet'}
                        </button>
                      ))}
                    </div>
                    <div className="inner-content">{currentChar?.id === char.id ? renderInnerContent() : null}</div>
                  </div>
                ))}
              </div>
            </div>
            <button
              type="button"
              className="arrow-btn"
              onClick={() => setActiveIndex((prev) => Math.min(prev + 1, displayCharacters.length - 1))}
              disabled={activeIndex === displayCharacters.length - 1}
            >
              ›
            </button>
          </div>
        );
      case 'inventory':
        return (
          <div className="list-panel">
            <h2>Inventory (personal)</h2>
            <div className="list-panel__controls">
              <input
                type="text"
                placeholder="Add item"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.target.value.trim()) {
                    setInventory([...inventory, e.target.value.trim()]);
                    e.target.value = '';
                  }
                }}
              />
              <button
                type="button"
                onClick={() => setInventory([])}
              >
                Clear
              </button>
            </div>
            <ul className="simple-list">
              {inventory.map((entry, idx) => (
                <li key={`${entry}-${idx}`}>{entry}</li>
              ))}
            </ul>
          </div>
        );
      case 'items':
        return (
          <div className="list-panel">
            <h2>Items</h2>
            <div className="list-panel__controls">
              <input
                type="text"
                placeholder="Add item"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.target.value.trim()) {
                    setItems([...items, e.target.value.trim()]);
                    e.target.value = '';
                  }
                }}
              />
              <button
                type="button"
                onClick={() => setItems([])}
              >
                Clear
              </button>
            </div>
            <ul className="simple-list">
              {items.map((entry, idx) => (
                <li key={`${entry}-${idx}`}>{entry}</li>
              ))}
            </ul>
          </div>
        );
      case 'notes':
        return (
          <div className="list-panel">
            <h2>Notes</h2>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Your notes..."
              rows={6}
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="characters-page">
      <ShaderBackgroundDualCrossfade modA={currentColor} modB={targetColor} fade={fade} />
      {!vanished && (
        <>
          <div className="characters-header">
            <div>
              <h1 className="page-title">Stars of Azterra</h1>
              <p className="nav-hint">
                Browse the roster with layered carousels. Visibility is controlled by admins.
              </p>
            </div>
            {featured && (
              <div className="featured-pill">
                <span>Featured</span>
                <strong>{featured.name}</strong>
              </div>
            )}
          </div>

          <div className="characters-tabs">
            {ALL_TABS.map((tab) => (
              <button
                key={tab}
                type="button"
                className={`tab-btn ${activeTab === tab ? 'tab-btn--active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab === 'all' && 'All Characters'}
                {tab === 'yours' && 'Your Characters'}
                {tab === 'inventory' && 'Inventory'}
                {tab === 'items' && 'Items'}
                {tab === 'notes' && 'Notes'}
              </button>
            ))}
          </div>

          <div className="characters-content">
            {renderTabContent()}
            {role === 'admin' && (
              <aside className="visibility-panel">
                <h3>Visibility (Admin)</h3>
                <p className="editor-warning">
                  Select which characters are visible to players in All Characters.
                </p>
                <div className="visibility-list">
                  {characters.map((char) => (
                    <label key={char.id} className="visibility-row">
                      <input
                        type="checkbox"
                        checked={visibleIds.includes(char.id)}
                        onChange={(e) => handleVisibilityChange(char.id, e.target.checked)}
                      />
                      <span>{char.name}</span>
                    </label>
                  ))}
                </div>
              </aside>
            )}
          </div>
        </>
      )}
    </div>
  );
}
