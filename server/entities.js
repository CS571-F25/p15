import { Router } from 'express';
import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';
import { adminRequired, authRequired } from './utils.js';

const router = Router();
const currentDir =
  typeof import.meta !== 'undefined' && import.meta.url
    ? path.dirname(fileURLToPath(import.meta.url))
    : path.resolve(process.cwd(), 'server');
const DATA_DIR = path.join(currentDir, 'data');

const FILES = {
  players: 'playerCharacters.json',
  npcs: 'npcs.json',
  majors: 'majorEntities.json',
};

async function ensureFile(file) {
  if (!existsSync(DATA_DIR)) {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }
  const target = path.join(DATA_DIR, file);
  if (!existsSync(target)) {
    await fs.writeFile(target, JSON.stringify([], null, 2));
  }
  return target;
}

async function readFileByType(type) {
  const filename = FILES[type];
  if (!filename) return [];
  const target = await ensureFile(filename);
  try {
    const raw = await fs.readFile(target, 'utf-8');
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

async function writeFileByType(type, data) {
  const filename = FILES[type];
  if (!filename) return;
  const target = await ensureFile(filename);
  await fs.writeFile(target, JSON.stringify(data, null, 2));
}

function sanitize(item) {
  const { secretDetails, ...rest } = item;
  return rest;
}

router.get('/:type', async (req, res) => {
  const { type } = req.params;
  const items = await readFileByType(type);
  const isAdmin = req.user?.role === 'admin';
  const visible = isAdmin ? items : items.filter((i) => i.visible !== false);
  return res.json({ items: visible.map((entry) => (isAdmin ? entry : sanitize(entry))) });
});

router.post('/:type/save', authRequired, adminRequired, async (req, res) => {
  const { type } = req.params;
  const payload = req.body || {};
  const items = await readFileByType(type);
  let updated = null;
  if (payload.id) {
    const idx = items.findIndex((entry) => entry.id === payload.id);
    if (idx !== -1) {
      items[idx] = { ...items[idx], ...payload };
      updated = items[idx];
    }
  }
  if (!updated) {
    updated = {
      id: randomUUID(),
      name: payload.name || 'Untitled',
      description: payload.description || '',
      type: payload.entityType || payload.type || '',
      campaign: payload.campaign || 'Main',
      regionId: payload.regionId || null,
      markerId: payload.markerId || null,
      image: payload.image || '',
      visible: payload.visible !== false,
      createdAt: new Date().toISOString(),
    };
    items.push(updated);
  }
  await writeFileByType(type, items);
  return res.json({ item: updated, items });
});

router.post('/:type/visibility', authRequired, adminRequired, async (req, res) => {
  const { type } = req.params;
  const { id, visible } = req.body || {};
  const items = await readFileByType(type);
  const idx = items.findIndex((entry) => entry.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Not found.' });
  items[idx].visible = !!visible;
  await writeFileByType(type, items);
  return res.json({ item: items[idx] });
});

export default router;
