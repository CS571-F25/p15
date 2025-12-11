import { Router } from 'express';
import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { authRequired, editorRequired } from './utils.js';

const router = Router();
const currentFile = fileURLToPath(import.meta.url);
const currentDir = path.dirname(currentFile);
const DATA_DIR = path.join(currentDir, 'data');
const REGIONS_FILE = path.join(DATA_DIR, 'regions.json');
const BACKUP_PREFIX = 'regions_backup_';
const BACKUP_LIMIT = 5;

async function ensureRegionsFile() {
  if (!existsSync(DATA_DIR)) {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }
  if (!existsSync(REGIONS_FILE)) {
    await fs.writeFile(REGIONS_FILE, JSON.stringify({ regions: [] }, null, 2));
  }
}

async function readRegionsFile() {
  await ensureRegionsFile();
  try {
    const raw = await fs.readFile(REGIONS_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed.regions)) {
      return { regions: parsed.regions };
    }
    return { regions: [] };
  } catch {
    return { regions: [] };
  }
}

async function backupRegionsFile() {
  if (!existsSync(REGIONS_FILE)) return;
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = path.join(DATA_DIR, `${BACKUP_PREFIX}${timestamp}.json`);
  try {
    const raw = await fs.readFile(REGIONS_FILE, 'utf-8');
    await fs.writeFile(backupPath, raw, 'utf-8');
  } catch {
    // ignore backup failures
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
    // ignore cleanup failures
  }
}

async function writeRegions(regions) {
  await ensureRegionsFile();
  await backupRegionsFile();
  await fs.writeFile(REGIONS_FILE, JSON.stringify({ regions }, null, 2));
  return { regions };
}

router.get('/', async (req, res) => {
  const data = await readRegionsFile();
  return res.json(data);
});

router.post('/save', authRequired, editorRequired, async (req, res) => {
  const payload = Array.isArray(req.body) ? req.body : req.body?.regions;
  if (!Array.isArray(payload)) {
    return res.status(400).json({ error: 'Regions payload must be an array.' });
  }

  const data = await writeRegions(payload);
  return res.json(data);
});

export default router;
