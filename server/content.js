import { Router } from 'express';
import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { normalizeContentList } from './contentSchema.js';

const router = Router();

const currentFile = fileURLToPath(import.meta.url);
const currentDir = path.dirname(currentFile);
const DATA_DIR = path.join(currentDir, 'data');
const CONTENT_FILE = path.join(DATA_DIR, 'content.json');

async function ensureContentFile() {
  if (!existsSync(DATA_DIR)) {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }
  if (!existsSync(CONTENT_FILE)) {
    await fs.writeFile(CONTENT_FILE, JSON.stringify({ entries: [] }, null, 2));
  }
}

async function readDiagnosticsFile() {
  try {
    const raw = await fs.readFile(path.join(DATA_DIR, 'content-diagnostics.json'), 'utf-8');
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

async function readContentFile() {
  await ensureContentFile();
  try {
    const raw = await fs.readFile(CONTENT_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    const entries = Array.isArray(parsed.entries) ? parsed.entries : [];
    const diagnostics = await readDiagnosticsFile();
    return { entries: normalizeContentList(entries), diagnostics };
  } catch {
    return { entries: [], diagnostics: null };
  }
}

router.get('/', async (req, res) => {
  const data = await readContentFile();
  return res.json(data);
});

router.get('/:id', async (req, res) => {
  const { id } = req.params;
  const data = await readContentFile();
  const entry = data.entries.find((item) => String(item.id) === String(id));
  if (!entry) {
    return res.status(404).json({ error: 'Content not found.' });
  }
  return res.json({ entry });
});

export default router;

