import { Router } from 'express';
import { authRequired, sanitizeUser, updateUsers } from './utils.js';

const router = Router();

// Secret definitions are kept server-side only. Phrases are never exposed to clients.
const SECRET_DEFINITIONS = [
  {
    id: 'aurora-ember',
    title: 'Aurora Ember',
    description: 'A faint ember reveals a hidden stanza in the night sky.',
  },
  {
    id: 'silent-archive',
    title: 'Silent Archive',
    description: 'You have located a sealed folio in the Archivists’ stacks.',
  },
  {
    id: 'gilded-horizon',
    title: 'Gilded Horizon',
    description: 'A map pin now glows faint gold at the edge of the world.',
  },
  {
    id: 'amber-archive',
    title: 'Amber Archive',
    description: 'An amber seal cracks to reveal forgotten correspondence.',
  },
  {
    id: 'shadow-court',
    title: 'Shadow Court',
    description: 'Whispers from the Shadow Court mark a new allegiance.',
  },
];

// Map normalized phrases to secret IDs. Values stay backend-only.
const SECRET_PHRASES = {
  'light the northern flame': 'aurora-ember',
  'quiet books speak': 'silent-archive',
  'beyond the western gold': 'gilded-horizon',
  'amber light endures': 'amber-archive',
  'the court waits in dusk': 'shadow-court',
};

function normalizePhrase(phrase = '') {
  return phrase.trim().toLowerCase();
}

function getUnlockedDetails(unlockedIds = []) {
  const allowed = new Set(unlockedIds);
  return SECRET_DEFINITIONS.filter((secret) => allowed.has(secret.id));
}

router.get('/progress', authRequired, async (req, res) => {
  const unlocked = Array.isArray(req.user?.unlockedSecrets) ? req.user.unlockedSecrets : [];
  return res.json({
    unlocked,
    details: getUnlockedDetails(unlocked),
    user: sanitizeUser(req.user),
  });
});

router.post('/unlock', authRequired, async (req, res) => {
  const { phrase = '' } = req.body || {};
  const normalized = normalizePhrase(phrase);
  if (!normalized) {
    return res.status(400).json({ error: 'A secret phrase is required.' });
  }

  const secretId = SECRET_PHRASES[normalized];
  if (!secretId) {
    return res.status(404).json({ error: 'No secret matched that phrase.' });
  }

  let updatedUser = null;
  await updateUsers((users) => {
    const index = users.findIndex((entry) => entry.id === req.user.id);
    if (index === -1) {
      throw new Error('User not found.');
    }
    const current = users[index];
    const unlocked = new Set(Array.isArray(current.unlockedSecrets) ? current.unlockedSecrets : []);
    const newlyUnlocked = !unlocked.has(secretId);
    unlocked.add(secretId);
    const nextUser = { ...current, unlockedSecrets: Array.from(unlocked) };
    users[index] = nextUser;
    updatedUser = { user: nextUser, newlyUnlocked };
    return users;
  });

  const unlockedList = updatedUser.user.unlockedSecrets || [];
  return res.json({
    success: true,
    newlyUnlocked: updatedUser.newlyUnlocked,
    unlocked: unlockedList,
    details: getUnlockedDetails(unlockedList),
    user: sanitizeUser(updatedUser.user),
  });
});

export default router;
