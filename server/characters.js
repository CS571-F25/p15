import { Router } from 'express';
import {
  adminRequired,
  authRequired,
  readCharacterVisibility,
  readUsers,
  sanitizeUser,
  updateUsers,
  writeCharacterVisibility,
} from './utils.js';

const router = Router();

const normalizeVisibleIds = (input) => {
  if (!Array.isArray(input)) return [];
  return Array.from(
    new Set(
      input
        .map((id) => Number(id))
        .filter((id) => Number.isFinite(id) && id > 0)
    )
  );
};

router.get('/visible', async (_req, res) => {
  const visibleIds = await readCharacterVisibility();
  return res.json({ visibleIds });
});

router.post('/visible', authRequired, adminRequired, async (req, res) => {
  const { visibleIds = [] } = req.body || {};
  const normalized = normalizeVisibleIds(visibleIds);
  await writeCharacterVisibility(normalized);
  return res.json({ success: true, visibleIds: normalized });
});

router.get('/me', authRequired, async (req, res) => {
  return res.json({
    favorites: Array.isArray(req.user.favorites) ? req.user.favorites : [],
    featuredCharacter: req.user.featuredCharacter ?? null,
  });
});

router.post('/favorite', authRequired, async (req, res) => {
  const { characterId, favorite } = req.body || {};
  const parsedId = Number(characterId);
  if (!Number.isFinite(parsedId)) {
    return res.status(400).json({ error: 'A valid characterId is required.' });
  }
  const shouldFavorite = Boolean(favorite);
  let updatedUser = null;
  await updateUsers((users) => {
    const idx = users.findIndex((u) => u.id === req.user.id);
    if (idx === -1) throw new Error('User not found.');
    const current = users[idx];
    const set = new Set(Array.isArray(current.favorites) ? current.favorites.map(Number) : []);
    if (shouldFavorite) {
      set.add(parsedId);
    } else {
      set.delete(parsedId);
      if (current.featuredCharacter === parsedId) {
        current.featuredCharacter = null;
      }
    }
    const nextUser = {
      ...current,
      favorites: Array.from(set),
      featuredCharacter: current.featuredCharacter ?? null,
    };
    users[idx] = nextUser;
    updatedUser = nextUser;
    return users;
  });
  return res.json({
    success: true,
    favorites: updatedUser.favorites,
    featuredCharacter: updatedUser.featuredCharacter,
  });
});

router.post('/feature', authRequired, async (req, res) => {
  const { characterId } = req.body || {};
  const parsedId = characterId === null ? null : Number(characterId);
  if (parsedId !== null && !Number.isFinite(parsedId)) {
    return res.status(400).json({ error: 'A valid characterId or null is required.' });
  }
  let updatedUser = null;
  await updateUsers((users) => {
    const idx = users.findIndex((u) => u.id === req.user.id);
    if (idx === -1) throw new Error('User not found.');
    const current = users[idx];
    const favorites = Array.isArray(current.favorites) ? current.favorites.map(Number) : [];
    const nextUser = {
      ...current,
      favorites,
      featuredCharacter: parsedId,
    };
    users[idx] = nextUser;
    updatedUser = nextUser;
    return users;
  });
  return res.json({
    success: true,
    favorites: updatedUser.favorites,
    featuredCharacter: updatedUser.featuredCharacter,
  });
});

router.get('/player-view', authRequired, async (_req, res) => {
  const users = await readUsers();
  const visibleIds = await readCharacterVisibility();
  const allowedSet = new Set(normalizeVisibleIds(visibleIds));
  const payload = users.map((user) => {
    const favorites = Array.isArray(user.favorites) ? user.favorites.map(Number) : [];
    const filteredFavs = favorites.filter((id) => allowedSet.has(id));
    const featured = allowedSet.has(user.featuredCharacter) ? user.featuredCharacter : null;
    return {
      id: user.id,
      name: user.name || user.username || 'Player',
      username: user.username || '',
      role: user.role,
      profilePicture: user.profilePicture || '',
      favorites: filteredFavs,
      featuredCharacter: featured,
    };
  });
  return res.json({ users: payload });
});

export default router;
