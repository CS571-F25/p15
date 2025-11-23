import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

function ProgressionPage() {
  const { token, refreshUser } = useAuth();
  const [phrase, setPhrase] = useState('');
  const [unlocking, setUnlocking] = useState(false);
  const [progressLoading, setProgressLoading] = useState(false);
  const [progressError, setProgressError] = useState('');
  const [unlockedDetails, setUnlockedDetails] = useState([]);

  const fetchProgress = async () => {
    if (!token) {
      setUnlockedDetails([]);
      return;
    }
    setProgressLoading(true);
    setProgressError('');
    try {
      const response = await fetch(`${API_BASE_URL}/secrets/progress`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Unable to load progress.');
      }
      setUnlockedDetails(data.details || []);
    } catch (err) {
      setProgressError(err.message || 'Unable to load progress.');
    } finally {
      setProgressLoading(false);
    }
  };

  useEffect(() => {
    fetchProgress();
  }, [token]);

  const handleUnlock = async (event) => {
    event.preventDefault();
    if (!phrase.trim() || !token) return;
    setUnlocking(true);
    setProgressError('');
    try {
      const response = await fetch(`${API_BASE_URL}/secrets/unlock`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ phrase }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Unable to check secret.');
      }
      setUnlockedDetails(data.details || []);
      setPhrase('');
      await refreshUser();
    } catch (err) {
      setProgressError(err.message || 'Unable to check secret.');
    } finally {
      setUnlocking(false);
    }
  };

  return (
    <div className="page-container progression">
      <header className="progression__header">
        <div>
          <p className="progression__eyebrow">Progression</p>
          <h1>Hidden Paths</h1>
          <p className="progression__subtitle">
            Enter phrases to unlock secrets. The page grows as you uncover more.
          </p>
        </div>
      </header>

      <form className="progression__form" onSubmit={handleUnlock}>
        <input
          type="text"
          value={phrase}
          onChange={(e) => setPhrase(e.target.value)}
          placeholder="Enter a secret phrase"
          disabled={!token}
        />
        <button type="submit" disabled={!token || unlocking || !phrase.trim()}>
          {unlocking ? 'Checking...' : 'Submit'}
        </button>
        {progressError && <p className="progression__error">{progressError}</p>}
        {!token && <p className="progression__muted">Login to record your progress.</p>}
      </form>

      {!progressLoading && unlockedDetails.length === 0 && (
        <div className="progression__empty">
          <p>Nothing unlocked yet. Keep exploring.</p>
        </div>
      )}

      {progressLoading && <p className="progression__muted">Loading your progress...</p>}

      {unlockedDetails.length > 0 && (
        <>
          <section className="progression__grid">
            {unlockedDetails.map((secret) => (
              <article key={secret.id} className="progression__card">
                <p className="progression__badge">Unlocked</p>
                <h2>{secret.title}</h2>
                <p>{secret.description}</p>
              </article>
            ))}
          </section>
          {unlockedDetails.length >= 2 && (
            <section className="progression__steps">
              <h3>New paths available</h3>
              <p className="progression__muted">Sections appear as you progress.</p>
              <div className="progression__grid">
                <article className="progression__card subtle">
                  <p className="progression__badge">Lore</p>
                  <p>Unlocked fragments are now visible in their respective lore entries.</p>
                </article>
                {unlockedDetails.length >= 3 && (
                  <article className="progression__card subtle">
                    <p className="progression__badge">Clues</p>
                    <p>Future clues may surface as more secrets unlock.</p>
                  </article>
                )}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}

export default ProgressionPage;
