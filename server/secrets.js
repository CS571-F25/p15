import { Router } from 'express';
import { authRequired, sanitizeUser, updateUsers, readSecrets, writeSecrets } from './utils.js';

const router = Router();

function normalizePhrase(phrase = '') {
  return phrase.trim().toLowerCase();
}

function buildPhraseMap(secrets = []) {
  return secrets.reduce((acc, secret) => {
    if (secret.keyword) {
      acc[normalizePhrase(secret.keyword)] = secret.id;
    }
    return acc;
  }, {});
}

function getUnlockedDetails(unlockedIds = [], secrets = []) {
  const allowed = new Set(unlockedIds);
  return secrets.filter((secret) => allowed.has(secret.id));
}

router.get('/progress', authRequired, async (req, res) => {
  const secrets = await readSecrets();
  const isAdmin = req.user?.role === 'admin';
  const unlocked = Array.isArray(req.user?.unlockedSecrets) ? req.user.unlockedSecrets : [];
  const details = isAdmin ? secrets : getUnlockedDetails(unlocked, secrets);
  const unlockedList = isAdmin ? secrets.map((secret) => secret.id) : unlocked;
  return res.json({
    unlocked: unlockedList,
    details,
    user: sanitizeUser(req.user),
  });
});

router.post('/unlock', authRequired, async (req, res) => {
  const secrets = await readSecrets();
  const phraseMap = buildPhraseMap(secrets);
  const { phrase = '' } = req.body || {};
  const normalized = normalizePhrase(phrase);
  if (!normalized) {
    return res.status(400).json({ error: 'A secret phrase is required.' });
  }

  const secretId = phraseMap[normalized];
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
    details: getUnlockedDetails(unlockedList, secrets),
    user: sanitizeUser(updatedUser.user),
  });
});

router.put('/:id', authRequired, async (req, res) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required.' });
  }
  const { id } = req.params;
  const { title = '', description = '', keyword = '' } = req.body || {};
  const secrets = await readSecrets();
  const index = secrets.findIndex((secret) => secret.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Secret not found.' });
  }
  const trimmedTitle = title.trim();
  const trimmedDescription = description.trim();
  const trimmedKeyword = keyword.trim();
  const nextSecret = {
    ...secrets[index],
    title: trimmedTitle || secrets[index].title,
    description: trimmedDescription || secrets[index].description,
    keyword: trimmedKeyword,
    updatedAt: new Date().toISOString(),
  };
  secrets[index] = nextSecret;
  await writeSecrets(secrets);
  return res.json({ secret: nextSecret });
});

export default router;
