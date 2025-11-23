import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import characters from '../../data/characters';
import { Link } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

function PlayersPage() {
  const { token } = useAuth();
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const charMap = useMemo(() => {
    const map = new Map();
    characters.forEach((c) => map.set(c.id, c));
    return map;
  }, []);

  useEffect(() => {
    const fetchPlayers = async () => {
      if (!token) {
        setPlayers([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`${API_BASE_URL}/characters/player-view`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Unable to load players.');
        }
        setPlayers(data.users || []);
      } catch (err) {
        setError(err.message || 'Unable to load players.');
      } finally {
        setLoading(false);
      }
    };
    fetchPlayers();
  }, [token]);

  if (!token) {
    return (
      <div className="page-container">
        <h1>Players</h1>
        <p>Please log in to view player info.</p>
      </div>
    );
  }

  return (
    <div className="page-container">
      <h1>Players</h1>
      <p className="progression__muted">Visible profiles, favorites, and featured characters. Secrets stay hidden.</p>
      {loading && <p className="progression__muted">Loading...</p>}
      {error && <p className="account-error">{error}</p>}
      <div className="players-grid">
        {players.map((player) => {
          const featured = player.featuredCharacter ? charMap.get(player.featuredCharacter) : null;
          return (
            <div key={player.id} className="player-card">
              <div className="player-card__header">
                <div className="player-avatar">
                  {player.profilePicture ? <img src={player.profilePicture} alt="" /> : <span>{(player.username || player.name || '?')[0]}</span>}
                </div>
                <div>
                  <p className="player-eyebrow">{player.role}</p>
                  <h3>{player.name}</h3>
                  {player.username && <p className="player-username">@{player.username}</p>}
                </div>
              </div>
              <div className="player-actions">
                <Link to={`/players/${player.id}`} className="lore-locked__link">
                  View profile
                </Link>
              </div>
              {featured && (
                <div className="player-featured">
                  <span>Featured</span>
                  <strong>{featured.name}</strong>
                </div>
              )}
              <div>
                <p className="player-eyebrow">Favorites</p>
                {player.favorites && player.favorites.length ? (
                  <ul className="simple-list">
                    {player.favorites.map((id) => {
                      const fav = charMap.get(id);
                      return <li key={`${player.id}-${id}`}>{fav ? fav.name : `Character ${id}`}</li>;
                    })}
                  </ul>
                ) : (
                  <p className="progression__muted">No favorites yet.</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default PlayersPage;
