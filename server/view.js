import express from 'express';
import path from 'node:path';
import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import {
  adminRequired,
  authRequired,
  readCharacterVisibility,
  readLocationVisibility,
  readNpcVisibility,
  readUsers,
  writeLocationVisibility,
  writeNpcVisibility,
} from './utils.js';
import { verifyToken } from './utils.js';
import { fileURLToPath } from 'node:url';

const router = express.Router();

async function optionalAuth(req) {
  try {
    const header = req.headers.authorization || '';
    if (!header.startsWith('Bearer ')) return null;
    const token = header.slice(7);
    return verifyToken(token);
  } catch {
    return null;
  }
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const getNpcs = async () => {
  try {
    const raw = await fs.readFile(path.join(__dirname, 'data', 'npcs.json'), 'utf-8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
};

const getLocations = async () => {
  try {
    const raw = await fs.readFile(path.join(__dirname, 'data', 'locations.json'), 'utf-8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed.locations) ? parsed.locations : [];
  } catch {
    return [];
  }
};

const getRegions = async () => {
  try {
    const raw = await fs.readFile(path.join(__dirname, 'regions.json'), 'utf-8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const readEntities = async (filename) => {
  try {
    const raw = await fs.readFile(path.join(__dirname, 'data', filename), 'utf-8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

async function ensureListFile(filename) {
  const target = path.join(__dirname, 'data', filename);
  if (!existsSync(target)) {
    await fs.writeFile(target, JSON.stringify([], null, 2));
  }
  return target;
}

async function readList(filename) {
  const target = await ensureListFile(filename);
  try {
    const raw = await fs.readFile(target, 'utf-8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeList(filename, list) {
  const target = await ensureListFile(filename);
  await fs.writeFile(target, JSON.stringify(list, null, 2));
}

router.get('/characters', async (req, res) => {
  const auth = await optionalAuth(req);
  const isAdmin = auth?.role === 'admin';
  const visibleIds = await readCharacterVisibility();
  // characters data lives client-side; we only share visibility here
  return res.json({ visibleIds, admin: isAdmin });
});

router.post('/locations/visible', authRequired, adminRequired, async (req, res) => {
  const { visibleIds = [] } = req.body || {};
  await writeLocationVisibility(visibleIds);
  return res.json({ success: true, visibleIds });
});

router.post('/locations/truesight', authRequired, adminRequired, async (req, res) => {
  const { truesightIds = [] } = req.body || {};
  await writeList('location-truesight.json', truesightIds);
  return res.json({ success: true, truesightIds });
});

router.get('/locations', async (req, res) => {
  const auth = await optionalAuth(req);
  const isAdmin = auth?.role === 'admin';
  const visibility = new Set(await readLocationVisibility());
  const truesight = new Set(await readList('location-truesight.json'));
  const locations = await getLocations();
  const payload = locations
    .filter((loc) => isAdmin || visibility.has(loc.id) || truesight.has(loc.id))
    .map((loc) => ({
      id: loc.id,
      name: loc.name,
      type: loc.type,
      category: loc.category,
      description: loc.description || '',
      glowColor: loc.glowColor || '#ffd700',
      visible: visibility.has(loc.id),
      truesight: truesight.has(loc.id),
      secretId: loc.secretId,
    }));
  return res.json({ items: payload, admin: isAdmin, truesightIds: Array.from(truesight) });
});

router.post('/npcs/visible', authRequired, adminRequired, async (req, res) => {
  const { visibleIds = [] } = req.body || {};
  await writeNpcVisibility(visibleIds);
  return res.json({ success: true, visibleIds });
});

router.post('/npcs/truesight', authRequired, adminRequired, async (req, res) => {
  const { truesightIds = [] } = req.body || {};
  await writeList('npc-truesight.json', truesightIds);
  return res.json({ success: true, truesightIds });
});

router.get('/npcs', async (req, res) => {
  const auth = await optionalAuth(req);
  const isAdmin = auth?.role === 'admin';
  const visibility = new Set(await readNpcVisibility());
  const truesight = new Set(await readList('npc-truesight.json'));
  const npcs = await getNpcs();
  const payload = npcs
    .filter((npc) => isAdmin || visibility.has(npc.id) || truesight.has(npc.id))
    .map((npc) => ({
      ...npc,
      visible: visibility.has(npc.id),
      truesight: truesight.has(npc.id),
    }));
  return res.json({ items: payload, admin: isAdmin, truesightIds: Array.from(truesight) });
});

router.get('/players', authRequired, async (req, res) => {
  const users = await readUsers();
  const visibility = new Set(await readCharacterVisibility());
  const payload = users.map((user) => {
    const favorites = Array.isArray(user.favorites) ? user.favorites : [];
    return {
      id: user.id,
      name: user.name || user.username || 'Player',
      username: user.username || '',
      profilePicture: user.profilePicture || '',
      favorites: favorites.filter((id) => visibility.has(id)),
      featuredCharacter: visibility.has(user.featuredCharacter) ? user.featuredCharacter : null,
      role: user.role,
    };
  });
  return res.json({ users: payload });
});

router.get('/favorites', authRequired, async (req, res) => {
  const current = req.user;
  const viewFavorites = Array.isArray(current.profile?.viewFavorites) ? current.profile.viewFavorites : [];
  return res.json({ viewFavorites });
});

router.post('/favorite', authRequired, async (req, res) => {
  const { type, id, favorite } = req.body || {};
  const parsedId = Number(id);
  if (!['character', 'npc', 'location'].includes(type)) {
    return res.status(400).json({ error: 'Invalid type.' });
  }
  if (!Number.isFinite(parsedId)) {
    return res.status(400).json({ error: 'A valid id is required.' });
  }
  let updated = [];
  await (await import('./utils.js')).updateUsers((users) => {
    const idx = users.findIndex((u) => u.id === req.user.id);
    if (idx === -1) throw new Error('User not found.');
    const currentUser = users[idx];
    const viewFavorites = Array.isArray(currentUser.profile?.viewFavorites)
      ? [...currentUser.profile.viewFavorites]
      : [];
    const key = `${type}:${parsedId}`;
    const set = new Set(viewFavorites);
    if (favorite) set.add(key);
    else set.delete(key);
    const profile = {
      bio: currentUser.profile?.bio || '',
      labelOne: currentUser.profile?.labelOne || '',
      labelTwo: currentUser.profile?.labelTwo || '',
      documents: Array.isArray(currentUser.profile?.documents) ? currentUser.profile.documents : [],
      viewFavorites: Array.from(set),
    };
    users[idx] = { ...currentUser, profile };
    updated = profile.viewFavorites;
    return users;
  });
  return res.json({ success: true, viewFavorites: updated });
});

function filterVisibility(items, visibilitySet, isAdmin) {
  if (isAdmin) return items;
  return items.filter((item) => visibilitySet.has(item.id));
}

router.get('/region/:id', async (req, res) => {
  const auth = await optionalAuth(req);
  const isAdmin = auth?.role === 'admin';
  const { id } = req.params;
  const regions = await getRegions();
  const region = regions.find((r) => String(r.id) === String(id));
  if (!region) return res.status(404).json({ error: 'Region not found.' });
  const locations = await getLocations();
  const locationVisibility = new Set(await readLocationVisibility());
  const visibleLocations = filterVisibility(locations, locationVisibility, isAdmin).filter(
    (loc) => loc.regionId && String(loc.regionId) === String(id)
  );
  const npcs = await getNpcs();
  const npcVisibility = new Set(await readNpcVisibility());
  const linkedNpcs = filterVisibility(npcs, npcVisibility, isAdmin).filter(
    (npc) => npc.regionId && String(npc.regionId) === String(id)
  );
  const players = await readEntities('playerCharacters.json');
  const majors = await readEntities('majorEntities.json');
  const visiblePlayers = filterVisibility(players, npcVisibility, isAdmin).filter(
    (pc) => pc.regionId && String(pc.regionId) === String(id)
  );
  const visibleMajors = filterVisibility(majors, npcVisibility, isAdmin).filter(
    (pc) => pc.regionId && String(pc.regionId) === String(id)
  );
  return res.json({
    region,
    locations: visibleLocations,
    npcs: linkedNpcs,
    players: visiblePlayers,
    majors: visibleMajors,
  });
});

router.get('/location/:id', async (req, res) => {
  const auth = await optionalAuth(req);
  const isAdmin = auth?.role === 'admin';
  const { id } = req.params;
  const locations = await getLocations();
  const locationVisibility = new Set(await readLocationVisibility());
  const location = locations.find((loc) => String(loc.id) === String(id));
  if (!location || (!isAdmin && !locationVisibility.has(location.id))) {
    return res.status(404).json({ error: 'Location not found.' });
  }
  const npcs = await getNpcs();
  const npcVisibility = new Set(await readNpcVisibility());
  const linkedNpcs = filterVisibility(npcs, npcVisibility, isAdmin).filter(
    (npc) => (npc.markerId && String(npc.markerId) === String(id)) || (npc.regionId && npc.regionId === location.regionId)
  );
  const players = await readEntities('playerCharacters.json');
  const majors = await readEntities('majorEntities.json');
  const visiblePlayers = filterVisibility(players, npcVisibility, isAdmin).filter(
    (pc) => (pc.markerId && String(pc.markerId) === String(id)) || (pc.regionId && pc.regionId === location.regionId)
  );
  const visibleMajors = filterVisibility(majors, npcVisibility, isAdmin).filter(
    (pc) => (pc.markerId && String(pc.markerId) === String(id)) || (pc.regionId && pc.regionId === location.regionId)
  );
  return res.json({
    location,
    npcs: linkedNpcs,
    players: visiblePlayers,
    majors: visibleMajors,
  });
});

export default router;
