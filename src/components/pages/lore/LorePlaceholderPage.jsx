import React from 'react';
import SecretGate from '../../auth/SecretGate';
import { Link } from 'react-router-dom';

const PLACEHOLDER_COPY = {
  'aurora-ember': {
    title: 'Aurora Ember - PLACEHOLDER',
    body: 'PLACEHOLDER: A faint ember in the northern sky awaits completed lore text.',
  },
  'silent-archive': {
    title: 'Silent Archive - PLACEHOLDER',
    body: "PLACEHOLDER: A sealed folio in the archivists' stacks will be described here.",
  },
  'gilded-horizon': {
    title: 'Gilded Horizon - PLACEHOLDER',
    body: 'PLACEHOLDER: A distant golden horizon mark hides further narrative.',
  },
};

function LorePlaceholderPage({ secretId }) {
  const copy = PLACEHOLDER_COPY[secretId] || {
    title: 'Hidden Lore - PLACEHOLDER',
    body: 'PLACEHOLDER: Content to be filled in later.',
  };

  return (
    <div className="page-container">
      <SecretGate
        secretId={secretId}
        fallback={
          <div className="lore-locked">
            <h1>Hidden Lore</h1>
            <p>This section remains locked. Discover and enter the right phrase to reveal it.</p>
            <Link to="/progress" className="lore-locked__link">
              Go to Progression
            </Link>
          </div>
        }
      >
        <div className="lore-placeholder">
          <p className="lore-placeholder__eyebrow">Unlocked Secret</p>
          <h1>{copy.title}</h1>
          <p className="lore-placeholder__body">{copy.body}</p>
          <p className="lore-placeholder__note">This is a placeholder template for future lore content.</p>
        </div>
      </SecretGate>
    </div>
  );
}

export default LorePlaceholderPage;
