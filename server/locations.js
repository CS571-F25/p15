import { Router } from 'express';
import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { authRequired, editorRequired } from './utils.js';

const router = Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, 'data');
const LOCATIONS_FILE = path.join(DATA_DIR, 'locations.json');
const BACKUP_PREFIX = 'locations_backup_';
const BACKUP_LIMIT = 5;

async function ensureDataFile() {
  if (!existsSync(DATA_DIR)) {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }
  if (!existsSync(LOCATIONS_FILE)) {
    await fs.writeFile(LOCATIONS_FILE, JSON.stringify({ locations: [] }, null, 2));
  }
}

async function readLocationsFile() {
  await ensureDataFile();
  try {
    const raw = await fs.readFile(LOCATIONS_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed.locations)) {
      return { locations: parsed.locations };
    }
    return { locations: [] };
  } catch {
    return { locations: [] };
  }
}

async function backupCurrentLocations() {
  if (!existsSync(LOCATIONS_FILE)) return;
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = path.join(DATA_DIR, `${BACKUP_PREFIX}${timestamp}.json`);
  try {
    const raw = await fs.readFile(LOCATIONS_FILE, 'utf-8');
    await fs.writeFile(backupPath, raw, 'utf-8');
  } catch {
    // Ignore backup failures to avoid blocking saves
  }

  try {
    const entries = await fs.readdir(DATA_DIR);
    const backups = entries
      .filter((entry) => entry.startsWith(BACKUP_PREFIX) && entry.endsWith('.json'))
      .sort()
      .reverse();
    const stale = backups.slice(BACKUP_LIMIT);
    await Promise.all(stale.map((name) => fs.rm(path.join(DATA_DIR, name))));
  } catch {
    // Ignore cleanup errors
  }
}

async function writeLocations(locations) {
  await ensureDataFile();
  await backupCurrentLocations();
  await fs.writeFile(LOCATIONS_FILE, JSON.stringify({ locations }, null, 2));
  return { locations };
}

router.get('/', async (req, res) => {
  const data = await readLocationsFile();
  return res.json(data);
});

router.post('/save', authRequired, editorRequired, async (req, res) => {
  const payload = Array.isArray(req.body) ? req.body : req.body?.locations;
  if (!Array.isArray(payload)) {
    return res.status(400).json({ error: 'Locations payload must be an array.' });
  }

  const data = await writeLocations(payload);
  return res.json(data);
});

export default router;
