import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './CampaignPage.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/.netlify/functions/api';

export default function CampaignPage() {
  const { user, role, token } = useAuth();
  const navigate = useNavigate();
  const isGuest = !token || role === 'guest';
  
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(() => !isGuest);
  const [error, setError] = useState('');
  
  // Selection state
  const [campaignSelectMode, setCampaignSelectMode] = useState(false);
  const [characterSelectMode, setCharacterSelectMode] = useState(false);
  const [selectedCampaigns, setSelectedCampaigns] = useState(new Set());
  const [selectedCharacters, setSelectedCharacters] = useState(new Set());
  
  // Delete confirmation
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteType, setDeleteType] = useState(null); // 'campaign' or 'character'
  const [deleting, setDeleting] = useState(false);

  // Guest preview data
  const guestCampaigns = useMemo(() => ([
    {
      id: 'guest-c1',
      name: 'Dormfall Arc',
      ownerName: 'Guest Preview',
      lastUsed: Date.now(),
      characters: [
        { id: 'g-1', name: 'Valen Arctis', class: 'Wayfarer', race: 'Human', level: 7, lastUsed: Date.now() },
        { id: 'g-2', name: 'Isolde Kelm', class: 'Battlemage', race: 'Elf', level: 6, lastUsed: Date.now() - 20000 },
      ],
    },
    {
      id: 'guest-c2',
      name: 'Sunspire Detour',
      ownerName: 'Guest Preview',
      lastUsed: Date.now() - 600000,
      characters: [
        { id: 'g-3', name: 'Merrick Thorne', class: 'Rogue', race: 'Halfling', level: 5, lastUsed: Date.now() - 600000 },
      ],
    },
  ]), []);

  // Fetch campaigns
  const fetchCampaigns = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE_URL}/campaigns/me`, { credentials: 'include' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load campaigns');
      setCampaigns(data.campaigns || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (isGuest) {
      setCampaigns(guestCampaigns);
      setLoading(false);
      return;
    }
    fetchCampaigns();
  }, [fetchCampaigns, guestCampaigns, isGuest]);

  // Get all characters from all campaigns (flattened)
  const allCharacters = campaigns.flatMap((campaign) =>
    (campaign.characters || []).map((char) => ({
      ...char,
      campaignId: campaign.id,
      campaignName: campaign.name,
    }))
  );

  // Sort by recency
  const sortedCampaigns = [...campaigns].sort((a, b) => (b.lastUsed || 0) - (a.lastUsed || 0));
  const sortedCharacters = [...allCharacters].sort((a, b) => (b.lastUsed || 0) - (a.lastUsed || 0));

  // Toggle selection
  const toggleCampaignSelect = (id) => {
    setSelectedCampaigns((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleCharacterSelect = (charKey) => {
    setSelectedCharacters((prev) => {
      const next = new Set(prev);
      if (next.has(charKey)) next.delete(charKey);
      else next.add(charKey);
      return next;
    });
  };

  // Handle delete
  const handleDeleteClick = (type) => {
    setDeleteType(type);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      if (deleteType === 'campaign') {
        for (const campaignId of selectedCampaigns) {
          await fetch(`${API_BASE_URL}/campaigns/${campaignId}`, {
            method: 'DELETE',
            credentials: 'include',
          });
        }
        setSelectedCampaigns(new Set());
        setCampaignSelectMode(false);
      } else if (deleteType === 'character') {
        for (const charKey of selectedCharacters) {
          const [campaignId, charId] = charKey.split('::');
          await fetch(`${API_BASE_URL}/campaigns/${campaignId}/character/${charId}`, {
            method: 'DELETE',
            credentials: 'include',
          });
        }
        setSelectedCharacters(new Set());
        setCharacterSelectMode(false);
      }
      await fetchCampaigns();
    } catch (err) {
      setError(err.message);
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  // Navigate to character sheet
  const handleCharacterClick = (char) => {
    if (characterSelectMode) {
      toggleCharacterSelect(`${char.campaignId}::${char.id}`);
    } else {
      navigate('/character-sheet', { state: { character: char } });
    }
  };

  const canEdit = !isGuest;

  return (
    <div className="campaigns-page custom-scrollbar">
      <h1 className="campaigns-title">Your Campaigns</h1>
      {isGuest && (
        <p className="campaigns-subtitle">
          Guest preview: browse sample campaigns and characters. Log in to create, edit, or delete your own.
        </p>
      )}
      
      {error && <p className="campaigns-error">{error}</p>}
      
      {loading ? (
        <p className="campaigns-loading">Loading your campaigns...</p>
      ) : (
        <div className="campaigns-split-layout">
          {/* Campaigns Section */}
          <section className="campaigns-section">
            <header className="campaigns-section-header">
              <h2>Campaigns</h2>
              <div className="campaigns-action-bar">
                <button
                  className="campaigns-btn campaigns-btn--add"
                  title="Create Campaign (Coming Soon)"
                  disabled
                >
                  +
                </button>
                <button
                  className={`campaigns-btn ${campaignSelectMode ? 'campaigns-btn--active' : ''}`}
                  disabled={!canEdit}
                  title={canEdit ? undefined : 'Log in to select campaigns'}
                  onClick={() => {
                    setCampaignSelectMode(!campaignSelectMode);
                    setSelectedCampaigns(new Set());
                  }}
                >
                  {campaignSelectMode ? 'Cancel' : 'Select'}
                </button>
                {canEdit && campaignSelectMode && selectedCampaigns.size > 0 && (
                  <button
                    className="campaigns-btn campaigns-btn--delete"
                    onClick={() => handleDeleteClick('campaign')}
                  >
                    Delete ({selectedCampaigns.size})
                  </button>
                )}
              </div>
            </header>
            
            <div className="campaigns-card-list">
              {sortedCampaigns.length === 0 ? (
                <p className="campaigns-empty">No campaigns yet. Create one to get started!</p>
              ) : (
                sortedCampaigns.map((campaign) => (
                  <div
                    key={campaign.id}
                    className={`campaigns-card campaigns-card--campaign ${
                      selectedCampaigns.has(campaign.id) ? 'campaigns-card--selected' : ''
                    }`}
                    onClick={() => campaignSelectMode && toggleCampaignSelect(campaign.id)}
                  >
                    {campaignSelectMode && (
                      <div className="campaigns-checkbox">
                        {selectedCampaigns.has(campaign.id) && '✓'}
                      </div>
                    )}
                    <h3 className="campaigns-card-name">{campaign.name}</h3>
                    <p className="campaigns-card-owner">Owned by {campaign.ownerName}</p>
                    <p className="heroes-card-meta">
                      {campaign.characters?.length || 0} character(s)
                    </p>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Characters Section */}
          <section className="campaigns-section">
            <header className="campaigns-section-header">
              <h2>Characters</h2>
              <div className="campaigns-action-bar">
                <button
                  className="campaigns-btn campaigns-btn--add"
                  title="Create Character (Coming Soon)"
                  disabled
                >
                  +
                </button>
                <button
                  className={`campaigns-btn ${characterSelectMode ? 'campaigns-btn--active' : ''}`}
                  disabled={!canEdit}
                  title={canEdit ? undefined : 'Log in to select characters'}
                  onClick={() => {
                    setCharacterSelectMode(!characterSelectMode);
                    setSelectedCharacters(new Set());
                  }}
                >
                  {characterSelectMode ? 'Cancel' : 'Select'}
                </button>
                {canEdit && characterSelectMode && selectedCharacters.size > 0 && (
                  <button
                    className="campaigns-btn campaigns-btn--delete"
                    onClick={() => handleDeleteClick('character')}
                  >
                    Delete ({selectedCharacters.size})
                  </button>
                )}
              </div>
            </header>
            
            <div className="campaigns-card-list">
              {sortedCharacters.length === 0 ? (
                <p className="campaigns-empty">No characters yet. Create one to get started!</p>
              ) : (
                sortedCharacters.map((char) => {
                  const charKey = `${char.campaignId}::${char.id}`;
                  return (
                    <div
                      key={charKey}
                      className={`campaigns-card campaigns-card--character ${
                        selectedCharacters.has(charKey) ? 'campaigns-card--selected' : ''
                      }`}
                      onClick={() => handleCharacterClick(char)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => e.key === 'Enter' && handleCharacterClick(char)}
                    >
                      {characterSelectMode && (
                        <div className="campaigns-checkbox">
                          {selectedCharacters.has(charKey) && '✓'}
                        </div>
                      )}
                      <h3 className="campaigns-card-name">{char.name}</h3>
                      <div className="campaigns-card-stats">
                        <span className="campaigns-stat">{char.class || 'Unknown Class'}</span>
                        <span className="campaigns-stat">{char.race || 'Unknown Race'}</span>
                        <span className="campaigns-stat">Lvl {char.level || 1}</span>
                      </div>
                      <p className="campaigns-card-meta">From: {char.campaignName}</p>
                    </div>
                  );
                })
              )}
            </div>
          </section>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="campaigns-modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="campaigns-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Confirm Deletion</h3>
            <p>
              Are you sure you want to delete {deleteType === 'campaign' ? selectedCampaigns.size : selectedCharacters.size}{' '}
              {deleteType}(s)? This action cannot be undone.
            </p>
            <div className="campaigns-modal-actions">
              <button
                className="campaigns-btn"
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                className="campaigns-btn campaigns-btn--delete"
                onClick={confirmDelete}
                disabled={deleting}
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
