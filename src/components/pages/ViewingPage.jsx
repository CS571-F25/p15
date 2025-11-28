import React, { useEffect, useMemo, useState } from 'react';
import ShaderBackgroundDualCrossfade from '../visuals/ShaderBackgroundDualCrossfade';
import characters from '../../data/characters';
import npcsData from '../../data/npcs';
import locationsData from '../../data/locations.json';
import { useAuth } from '../../context/AuthContext';
import { canView as canViewHelper } from '../../utils/permissions';
import '../UI/PageUI.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
const TABS = ['locations', 'npcs', 'players'];
const CAMPAIGNS = ['All', 'Main', 'Side'];
const SECRET_OPTIONS = [
  { id: 'aurora-ember', label: 'Aurora Ember' },
  { id: 'silent-archive', label: 'Silent Archive' },
  { id: 'gilded-horizon', label: 'Gilded Horizon' },
  { id: 'amber-archive', label: 'Amber Archive' },
  { id: 'shadow-court', label: 'Shadow Court' },
];
const ALL_SECRET_IDS = SECRET_OPTIONS.map((s) => s.id);

function ViewingPage() {
  const { role, token, user } = useAuth();
  const isAdmin = role === 'admin';
  const [tab, setTab] = useState('locations');
  const [campaign, setCampaign] = useState('All');
  const [adminView, setAdminView] = useState(false);
  const [visibleIds, setVisibleIds] = useState([]);
  const [npcVisibility, setNpcVisibility] = useState([]);
  const [locVisibility, setLocVisibility] = useState([]);
  const [npcItems, setNpcItems] = useState([]);
  const [locItems, setLocItems] = useState([]);
  const [npcTruesight, setNpcTruesight] = useState([]);
  const [locTruesight, setLocTruesight] = useState([]);
  const [players, setPlayers] = useState([]);
  const [activeCard, setActiveCard] = useState(null);
  const [colorA, setColorA] = useState([0, 0, 0, 1]);
  const [colorB, setColorB] = useState([0, 0, 0, 1]);
  const [fade, setFade] = useState(0);
  const [error, setError] = useState('');
  const [favPending, setFavPending] = useState(false);
  const [pendingNpcEdits, setPendingNpcEdits] = useState({});
  const [pendingLocEdits, setPendingLocEdits] = useState({});
  const [savingNpcId, setSavingNpcId] = useState(null);
  const [savingLocId, setSavingLocId] = useState(null);
  const [viewFavorites, setViewFavorites] = useState([]);
  const [expanded, setExpanded] = useState({});
  const [previewSecrets, setPreviewSecrets] = useState([]);

  useEffect(() => {
    const load = async () => {
      setError('');
      try {
        const visRes = await fetch(`${API_BASE_URL}/view/characters`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const visData = await visRes.json();
        if (visRes.ok) {
          setVisibleIds(visData.visibleIds || []);
        }
        const npcRes = await fetch(`${API_BASE_URL}/view/npcs`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const npcData = await npcRes.json();
        if (npcRes.ok) {
          const allNpc = npcData.items || [];
          const visibleNpcIds = allNpc.filter((n) => n.visible !== false).map((n) => n.id);
          setNpcVisibility(visibleNpcIds);
          setNpcItems(allNpc);
          setNpcTruesight(npcData.truesightIds || []);
        }
        const locRes = await fetch(`${API_BASE_URL}/view/locations`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const locData = await locRes.json();
        if (locRes.ok) {
          const allLoc = locData.items || [];
          const visibleLocIds = allLoc.filter((l) => l.visible !== false).map((l) => l.id);
          setLocVisibility(visibleLocIds);
          setLocItems(allLoc);
          setLocTruesight(locData.truesightIds || []);
        }

        if (token) {
          const favRes = await fetch(`${API_BASE_URL}/view/favorites`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const favData = await favRes.json();
          if (favRes.ok) setViewFavorites(favData.viewFavorites || []);

          const playerRes = await fetch(`${API_BASE_URL}/view/players`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const playerData = await playerRes.json();
          if (playerRes.ok) setPlayers(playerData.users || []);
        }
      } catch (err) {
        setError(err.message || 'Unable to load view data.');
      }
    };
    load();
  }, [token]);

  useEffect(() => {
    setAdminView(isAdmin);
  }, [isAdmin]);

  const palette = useMemo(
    () => [
      [255, 213, 128, 0.8],
      [247, 146, 86, 0.7],
      [255, 215, 0, 0.75],
    ],
    []
  );

  const passesVisibility = (entity, viewer) => {
    if (entity.truesight) return true;
    if (!entity.visible) return false;
    // Visible is true; now require secret to be unlocked if present
    return canViewHelper(viewer, {
      roles: ['guest', 'editor', 'admin', 'pending', 'player'],
      secretId: entity.secretId,
    });
  };

  const currentList = useMemo(() => {
    const campaignFilter = (itemCampaign = 'Main') =>
      campaign === 'All' || (itemCampaign || 'Main') === campaign;
    const isPreviewingUser = isAdmin && !adminView;
    const viewer = {
      role: adminView && isAdmin ? 'admin' : role,
      unlockedSecrets: isPreviewingUser
        ? previewSecrets
        : Array.isArray(user?.unlockedSecrets)
        ? user.unlockedSecrets
        : [],
    };
    if (tab === 'npcs') {
      const source = npcItems.length ? npcItems : npcsData;
      const base = source.map((n) => ({
        ...n,
        visible: n.visible !== false,
        truesight: npcTruesight.includes(n.id),
        campaign: n.campaign || 'Main',
      }));
      const filtered =
        adminView && isAdmin ? base : base.filter((n) => passesVisibility(n, viewer));
      return filtered.filter((n) => campaignFilter(n.campaign));
    }
    if (tab === 'locations') {
      const source = locItems.length ? locItems : locationsData.locations;
      const base = source.map((loc) => ({
        ...loc,
        visible: loc.visible !== false,
        truesight: locTruesight.includes(loc.id),
        campaign: loc.campaign || 'Main',
      }));
      const filtered =
        adminView && isAdmin ? base : base.filter((loc) => passesVisibility(loc, viewer));
      return filtered.filter((loc) => campaignFilter(loc.campaign));
    }
    if (tab === 'players') {
      const base =
        players.length && adminView && isAdmin
          ? players
          : players.length
          ? players.filter((p) => campaignFilter(p.campaign))
          : characters
              .filter((c) => (adminView && isAdmin) || visibleIds.includes(c.id))
              .map((c) => ({ id: c.id, name: c.name, character: c, campaign: c.campaign || 'Main' }))
              .filter((p) => campaignFilter(p.campaign));
      const filtered =
        adminView && isAdmin
          ? base
          : base.filter((p) =>
              canViewHelper(viewer, {
                roles: ['guest', 'editor', 'admin', 'pending', 'player'],
                secretId: p.secretId,
              })
            );
      return filtered;
    }
    return [];
  }, [tab, players, visibleIds, npcItems, locItems, npcVisibility, locVisibility, isAdmin, campaign, adminView, role, npcTruesight, locTruesight, previewSecrets, user]);

  useEffect(() => {
    if (!currentList.length) return;
    const choice = palette[(activeCard ?? 0) % palette.length];
    setColorA(colorB);
    setColorB(choice);
    setFade(0);
  }, [activeCard, currentList.length, palette, colorB]);

  const toggleVisible = async (id, type) => {
    if (!isAdmin || !token) return;
    const endpoint = type === 'npc' ? 'npcs/visible' : 'locations/visible';
    const state = type === 'npc' ? new Set(npcVisibility) : new Set(locVisibility);
    if (state.has(id)) state.delete(id);
    else state.add(id);
    const payload = { visibleIds: Array.from(state) };
    try {
      await fetch(`${API_BASE_URL}/view/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      if (type === 'npc') {
        setNpcVisibility(payload.visibleIds);
        setNpcItems((prev) => prev.map((n) => (n.id === id ? { ...n, visible: payload.visibleIds.includes(id) } : n)));
      } else {
        setLocVisibility(payload.visibleIds);
        setLocItems((prev) => prev.map((l) => (l.id === id ? { ...l, visible: payload.visibleIds.includes(id) } : l)));
      }
    } catch (err) {
      setError(err.message || 'Unable to update visibility.');
    }
  };

  const toggleTruesight = async (id, type) => {
    if (!isAdmin || !token) return;
    const endpoint = type === 'npc' ? 'npcs/truesight' : 'locations/truesight';
    const state = type === 'npc' ? new Set(npcTruesight) : new Set(locTruesight);
    if (state.has(id)) state.delete(id);
    else state.add(id);
    const payload = { truesightIds: Array.from(state) };
    try {
      await fetch(`${API_BASE_URL}/view/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      if (type === 'npc') {
        setNpcTruesight(payload.truesightIds);
        setNpcItems((prev) => prev.map((n) => (n.id === id ? { ...n, truesight: payload.truesightIds.includes(id) } : n)));
      } else {
        setLocTruesight(payload.truesightIds);
        setLocItems((prev) => prev.map((l) => (l.id === id ? { ...l, truesight: payload.truesightIds.includes(id) } : l)));
      }
    } catch (err) {
      setError(err.message || 'Unable to update truesight.');
    }
  };

  const setNpcDraft = (id, field, value) => {
    setPendingNpcEdits((prev) => ({
      ...prev,
      [id]: { ...(prev[id] || {}), [field]: value },
    }));
  };

  const setLocDraft = (id, field, value) => {
    setPendingLocEdits((prev) => ({
      ...prev,
      [id]: { ...(prev[id] || {}), [field]: value },
    }));
  };

  const handleLocationImageFile = (locationId, file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file (png, jpg, webp).');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setLocDraft(locationId, 'heroImage', reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleLocationImageDrop = (event, locationId) => {
    event.preventDefault();
    event.stopPropagation();
    const file = event.dataTransfer?.files?.[0];
    handleLocationImageFile(locationId, file);
  };

  const handleLocationImageBrowse = (event, locationId) => {
    const file = event.target.files?.[0];
    handleLocationImageFile(locationId, file);
    event.target.value = '';
  };

  const mergedNpc = (item) => ({
    ...item,
    ...(pendingNpcEdits[item.id] || {}),
  });

  const mergedLoc = (item) => ({
    ...item,
    ...(pendingLocEdits[item.id] || {}),
  });

  const saveNpc = async (id) => {
    if (!isAdmin || !token) return;
    const original = npcItems.find((n) => n.id === id);
    if (!original) return;
    const draft = mergedNpc(original);
    setSavingNpcId(id);
    setError('');
    try {
      const response = await fetch(`${API_BASE_URL}/entities/npcs/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...draft,
          id: draft.id,
          locationId: draft.locationId || null,
          campaign: draft.campaign || 'Main',
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Unable to save NPC.');
      }
      const nextItems = Array.isArray(data.items) ? data.items : [data.item].filter(Boolean);
      setNpcItems(
        nextItems.map((entry) => ({
          ...entry,
          visible: npcVisibility.includes(entry.id),
          truesight: npcTruesight.includes(entry.id),
        }))
      );
      setPendingNpcEdits((prev) => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      });
    } catch (err) {
      setError(err.message || 'Unable to save NPC.');
    } finally {
      setSavingNpcId(null);
    }
  };

  const saveLocation = async (id) => {
    if (!isAdmin || !token) return;
    const sanitizeLocation = (loc) => {
      const { visible, truesight, ...rest } = loc;
      return {
        ...rest,
        campaign: loc.campaign || 'Main',
        regionId: loc.regionId ?? null,
        markerId: loc.markerId ?? null,
      };
    };
    const merged = locItems.map((loc) =>
      loc.id === id ? sanitizeLocation(mergedLoc(loc)) : sanitizeLocation(loc)
    );
    setSavingLocId(id);
    setError('');
    try {
      const response = await fetch(`${API_BASE_URL}/locations/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ locations: merged }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Unable to save location.');
      }
      const saved = Array.isArray(data.locations) ? data.locations : [];
      setLocItems(
        saved.map((loc) => ({
          ...loc,
          visible: locVisibility.includes(loc.id),
          truesight: locTruesight.includes(loc.id),
        }))
      );
      setPendingLocEdits((prev) => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      });
    } catch (err) {
      setError(err.message || 'Unable to save location.');
    } finally {
      setSavingLocId(null);
    }
  };

  const toggleFavorite = async (itemId) => {
    if (!token) return;
    setFavPending(true);
    try {
      const type =
        tab === 'players' ? 'character' : tab === 'npcs' ? 'npc' : 'location';
      await fetch(`${API_BASE_URL}/view/favorite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ type, id: itemId, favorite: !viewFavorites.includes(`${type}:${itemId}`) }),
      });
      const favRes = await fetch(`${API_BASE_URL}/view/favorites`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const favData = await favRes.json();
      if (favRes.ok) setViewFavorites(favData.viewFavorites || []);
    } catch {
      /* ignore */
    } finally {
      setFavPending(false);
    }
  };

  const renderCard = (item, index) => {
    const isExpanded = adminView && isAdmin ? true : expanded[`${tab}-${item.id}`];
    const toggleExpanded = () => {
      setActiveCard(index);
      if (adminView && isAdmin) return;
      setExpanded((prev) => ({ ...prev, [`${tab}-${item.id}`]: !isExpanded }));
    };

    if (tab === 'players') {
      const character = item.character || characters.find((c) => c.id === item.featuredCharacter) || characters.find((c) => c.id === item.id);
      const visibleChars = characters.filter((c) => (adminView && isAdmin) || visibleIds.includes(c.id));
      return (
        <div className={`view-card ${isExpanded ? 'view-card--expanded' : ''}`} onClick={toggleExpanded} role="button" tabIndex={0}>
          <div className="view-card__header">
            <div>
              <p className="account-card__eyebrow">{item.username ? `@${item.username}` : 'Player'}</p>
              <h3>{item.name || character?.name}</h3>
            </div>
            {character && (
              <button
                type="button"
                className={`fav-btn ${viewFavorites.includes(`character:${character.id}`) ? 'fav-btn--active' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavorite(character.id);
                }}
                disabled={favPending}
              >
                {viewFavorites.includes(`character:${character.id}`) ? '★' : '☆'}
              </button>
            )}
          </div>
          {character && <p className="account-muted">{character.class} · {character.race}</p>}
          {isExpanded && (
            <div className="view-card__body">
              <p className="account-muted">Visible Characters</p>
              <div className="mini-list">
                {visibleChars.length ? visibleChars.map((c) => <span key={c.id}>{c.name}</span>) : <span>No characters visible.</span>}
              </div>
              {isAdmin && adminView && item.secretId && (
                <div className="secret-meta">
                  <p className="account-muted">Requires secret: {item.secretId}</p>
                </div>
              )}
            </div>
          )}
        </div>
      );
    }
    if (tab === 'npcs') {
      const npcDraft = adminView && isAdmin ? mergedNpc(item) : item;
      const locationOptions = (locItems.length ? locItems : locationsData.locations || []).sort((a, b) =>
        (a.name || '').localeCompare(b.name || '')
      );
      return (
        <div className={`view-card ${isExpanded ? 'view-card--expanded' : ''}`} onClick={toggleExpanded} role="button" tabIndex={0}>
          <div className="view-card__header">
            <div>
              {adminView && isAdmin ? (
                <>
                  <input
                    className="admin-inline-input"
                    value={npcDraft.type || ''}
                    onChange={(e) => setNpcDraft(item.id, 'type', e.target.value)}
                    placeholder="Type / Role"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <input
                    className="admin-inline-input"
                    value={npcDraft.name || ''}
                    onChange={(e) => setNpcDraft(item.id, 'name', e.target.value)}
                    placeholder="Name"
                    onClick={(e) => e.stopPropagation()}
                  />
                </>
              ) : (
                <>
                  <p className="account-card__eyebrow">{item.type}</p>
                  <h3>{item.name}</h3>
                </>
              )}
            </div>
            <div className="view-card__actions">
              {isAdmin && adminView && (
                <label className="visibility-toggle" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={npcDraft.visible}
                    onChange={() => toggleVisible(item.id, 'npc')}
                  />
                  <span>{npcDraft.visible ? 'Visible' : 'Hidden'}</span>
                </label>
              )}
              {isAdmin && adminView && (
                <label className="visibility-toggle" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={npcDraft.truesight}
                    onChange={() => toggleTruesight(item.id, 'npc')}
                  />
                  <span>{npcDraft.truesight ? 'Truesight' : 'No Truesight'}</span>
                </label>
              )}
              {token && (
                <button
                  type="button"
                  className={`fav-btn ${viewFavorites.includes(`npc:${item.id}`) ? 'fav-btn--active' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(item.id);
                  }}
                  disabled={favPending}
                >
                  {viewFavorites.includes(`npc:${item.id}`) ? '★' : '☆'}
                </button>
              )}
            </div>
          </div>
          {adminView && isAdmin ? (
            <div className="view-card__body view-card__body--form" onClick={(e) => e.stopPropagation()}>
              <label className="admin-field">
                <span>Blurb</span>
                <textarea
                  value={npcDraft.blurb || ''}
                  onChange={(e) => setNpcDraft(item.id, 'blurb', e.target.value)}
                  rows={2}
                />
              </label>
              <label className="admin-field">
                <span>Campaign</span>
                <input
                  value={npcDraft.campaign || ''}
                  onChange={(e) => setNpcDraft(item.id, 'campaign', e.target.value)}
                />
              </label>
              <label className="admin-field">
                <span>Linked Location</span>
                <select
                  value={npcDraft.locationId || ''}
                  onChange={(e) => setNpcDraft(item.id, 'locationId', e.target.value ? Number(e.target.value) : null)}
                >
                  <option value="">No location</option>
                  {locationOptions.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="admin-field">
                <span>Secret</span>
                <select
                  value={npcDraft.secretId || ''}
                  onChange={(e) => setNpcDraft(item.id, 'secretId', e.target.value || undefined)}
                >
                  <option value="">None (public when visible)</option>
                  {SECRET_OPTIONS.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </label>
              <button
                type="button"
                className={`admin-toggle-btn ${savingNpcId === item.id ? 'admin-toggle-btn--active' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  saveNpc(item.id);
                }}
                disabled={savingNpcId === item.id}
              >
                {savingNpcId === item.id ? 'Saving...' : 'Save NPC'}
              </button>
            </div>
          ) : (
            <>
              <p className="account-muted">{item.blurb}</p>
              {isExpanded && (
                <div className="view-card__body">
                  <p className="account-muted">Related Locations</p>
                  <div className="mini-list">
                    {locationOptions.length
                      ? locationOptions
                          .filter((loc) => npcDraft.locationId && String(loc.id) === String(npcDraft.locationId))
                          .map((loc) => <span key={loc.id}>{loc.name}</span>)
                      : <span>None linked.</span>}
                  </div>
                  {isAdmin && adminView && item.secretId && (
                    <div className="secret-meta">
                      <p className="account-muted">Requires secret: {item.secretId}</p>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      );
    }
    if (tab === 'locations') {
      const locDraft = adminView && isAdmin ? mergedLoc(item) : item;
      const relatedNpcs = (npcItems.length ? npcItems : npcsData).filter(
        (n) => n.locationId && String(n.locationId) === String(locDraft.id)
      );
      const relatedChars = players.filter((p) => p.locationId && String(p.locationId) === String(locDraft.id));
      const heroImage = locDraft.heroImage || locDraft.image || locDraft.imageUrl || '';
      const titleContent = adminView && isAdmin ? (
        <>
          <input
            className="admin-inline-input"
            value={locDraft.category || locDraft.type || ''}
            onChange={(e) => setLocDraft(item.id, 'category', e.target.value)}
            placeholder="Category"
            onClick={(e) => e.stopPropagation()}
          />
          <input
            className="admin-inline-input"
            value={locDraft.name || ''}
            onChange={(e) => setLocDraft(item.id, 'name', e.target.value)}
            placeholder="Location name"
            onClick={(e) => e.stopPropagation()}
          />
        </>
      ) : (
        <>
          <p className="account-card__eyebrow">{item.category || item.type}</p>
          <h3>{item.name}</h3>
        </>
      );
      return (
        <div className={`view-card view-card--media ${isExpanded ? 'view-card--expanded' : ''}`} onClick={toggleExpanded} role="button" tabIndex={0}>
          <div className="view-card__media">
            {heroImage ? (
              <img src={heroImage} alt={`${locDraft.name} illustration`} />
            ) : (
              <div className="view-card__media-placeholder">No image yet. Drop one in editor mode.</div>
            )}
            <div className="view-card__title-overlay">
              <div>{titleContent}</div>
              <div className="view-card__media-actions">
                {(isExpanded || (adminView && isAdmin)) && token && (
                  <button
                    type="button"
                    className={`fav-btn ${viewFavorites.includes(`location:${item.id}`) ? 'fav-btn--active' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(item.id);
                    }}
                    disabled={favPending}
                  >
                    {viewFavorites.includes(`location:${item.id}`) ? '★' : '☆'}
                  </button>
                )}
              </div>
            </div>
          </div>
          {isExpanded && (
            <div
              className={`view-card__expanded ${adminView && isAdmin ? 'view-card__expanded--admin' : ''}`}
              onClick={(e) => e.stopPropagation()}
            >
              {adminView && isAdmin ? (
                <div className="view-card__body view-card__body--form">
                  <div
                    className="view-card__image-drop"
                    onDrop={(e) => handleLocationImageDrop(e, item.id)}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                  >
                    <p>Drag & drop an image to update this location.</p>
                    <label className="view-card__image-upload">
                      Browse
                      <input type="file" accept="image/*" onChange={(e) => handleLocationImageBrowse(e, item.id)} />
                    </label>
                    {heroImage && <img src={heroImage} alt={`${locDraft.name} preview`} />}
                  </div>
                  <div className="view-card__admin-toggles">
                    <label className="visibility-toggle">
                      <input
                        type="checkbox"
                        checked={locDraft.visible}
                        onChange={() => toggleVisible(item.id, 'loc')}
                      />
                      <span>{locDraft.visible ? 'Visible' : 'Hidden'}</span>
                    </label>
                    <label className="visibility-toggle">
                      <input
                        type="checkbox"
                        checked={locDraft.truesight}
                        onChange={() => toggleTruesight(item.id, 'loc')}
                      />
                      <span>{locDraft.truesight ? 'Truesight' : 'No Truesight'}</span>
                    </label>
                  </div>
                  <label className="admin-field">
                    <span>Description</span>
                    <textarea
                      value={locDraft.description || ''}
                      onChange={(e) => setLocDraft(item.id, 'description', e.target.value)}
                      rows={3}
                    />
                  </label>
                  <label className="admin-field">
                    <span>Campaign</span>
                    <input value={locDraft.campaign || ''} onChange={(e) => setLocDraft(item.id, 'campaign', e.target.value)} />
                  </label>
                  <label className="admin-field">
                    <span>Region Id</span>
                    <input
                      value={locDraft.regionId ?? ''}
                      onChange={(e) => setLocDraft(item.id, 'regionId', e.target.value ? Number(e.target.value) : null)}
                    />
                  </label>
                  <label className="admin-field">
                    <span>Marker Id</span>
                    <input
                      value={locDraft.markerId ?? ''}
                      onChange={(e) => setLocDraft(item.id, 'markerId', e.target.value ? Number(e.target.value) : null)}
                    />
                  </label>
                  <label className="admin-field">
                    <span>Secret</span>
                    <select
                      value={locDraft.secretId || ''}
                      onChange={(e) => setLocDraft(item.id, 'secretId', e.target.value || undefined)}
                    >
                      <option value="">None (public when visible)</option>
                      {SECRET_OPTIONS.map((opt) => (
                        <option key={opt.id} value={opt.id}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <div className="mini-list">
                    <p className="account-muted">Linked NPCs</p>
                    {relatedNpcs.length ? relatedNpcs.map((n) => <span key={n.id}>{n.name}</span>) : <span>No NPCs linked.</span>}
                  </div>
                  <button
                    type="button"
                    className={`admin-toggle-btn ${savingLocId === item.id ? 'admin-toggle-btn--active' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      saveLocation(item.id);
                    }}
                    disabled={savingLocId === item.id}
                  >
                    {savingLocId === item.id ? 'Saving...' : 'Save Location'}
                  </button>
                </div>
              ) : (
                <div className="view-card__details">
                  <div className="view-card__detail-block">
                    <p className="detail-label">Description</p>
                    <p>{locDraft.description || 'No description provided.'}</p>
                  </div>
                  <div className="view-card__detail-block">
                    <p className="detail-label">NPCs here</p>
                    <div className="mini-list">
                      {relatedNpcs.length ? relatedNpcs.map((n) => <span key={n.id}>{n.name}</span>) : <span>No NPCs linked.</span>}
                    </div>
                  </div>
                  <div className="view-card__detail-block">
                    <p className="detail-label">Characters here</p>
                    <div className="mini-list">
                      {relatedChars.length ? relatedChars.map((c) => <span key={c.id}>{c.name}</span>) : <span>No characters linked.</span>}
                    </div>
                  </div>
                  {heroImage && (
                    <div className="view-card__detail-image">
                      <img src={heroImage} alt={`${locDraft.name} detail`} />
                    </div>
                  )}
                  {isAdmin && adminView && item.secretId && (
                    <div className="secret-meta">
                      <p className="account-muted">Requires secret: {item.secretId}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="page-container">
      <ShaderBackgroundDualCrossfade modA={colorA} modB={colorB} fade={fade} />
      <header className="characters-header">
        <div>
          <p className="account-card__eyebrow">Viewing</p>
          <h1>Campaign View</h1>
          <p className="nav-hint">Browse visible players, NPCs, and locations. Admins can toggle visibility.</p>
        </div>
        {isAdmin && (
          <div className="admin-toggle">
            <button
              type="button"
              className={`admin-toggle-btn ${adminView ? 'admin-toggle-btn--active' : ''}`}
              onClick={() => setAdminView((v) => !v)}
            >
              {adminView ? 'Admin View' : 'User View'}
            </button>
            {!adminView && (
              <div className="mini-list" aria-label="Preview secrets">
                {SECRET_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    className={`secret-preview-button ${previewSecrets.includes(opt.id) ? 'secret-preview-button--active' : ''}`}
                    onClick={() =>
                      setPreviewSecrets((prev) =>
                        prev.includes(opt.id) ? prev.filter((id) => id !== opt.id) : [...prev, opt.id]
                      )
                    }
                  >
                    {previewSecrets.includes(opt.id) ? '★' : '☆'} {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </header>

      <div className="characters-tabs">
        {TABS.map((name) => (
          <button
            key={name}
            className={`tab-btn ${tab === name ? 'tab-btn--active' : ''}`}
            type="button"
            onClick={() => setTab(name)}
          >
            {name === 'players' && 'Players / Characters'}
            {name === 'npcs' && 'NPCs'}
            {name === 'locations' && 'Locations'}
          </button>
        ))}
        <div className="campaign-tabs">
          {CAMPAIGNS.map((c) => (
            <button
              key={c}
              className={`tab-btn ${campaign === c ? 'tab-btn--active' : ''}`}
              type="button"
              onClick={() => setCampaign(c)}
            >
              {c} Campaign
            </button>
          ))}
        </div>
      </div>

      {error && <p className="account-error">{error}</p>}

      <div className="view-grid">
        {currentList.map((item, idx) => (
          <div key={`${tab}-${item.id}`}>{renderCard(item, idx)}</div>
        ))}
      </div>
    </div>
  );
}

export default ViewingPage;
