import { Router } from 'express';
import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { normalizeContentList } from './contentSchema.js';

const router = Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, 'data');
const CONTENT_FILE = path.join(DATA_DIR, 'content.json');

async function ensureContentFile() {
  if (!existsSync(DATA_DIR)) {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }
  if (!existsSync(CONTENT_FILE)) {
    await fs.writeFile(CONTENT_FILE, JSON.stringify({ entries: [] }, null, 2));
  }
}

async function readContentFile() {
  await ensureContentFile();
  try {
    const raw = await fs.readFile(CONTENT_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    const entries = Array.isArray(parsed.entries) ? parsed.entries : [];
    return { entries: normalizeContentList(entries) };
  } catch {
    return { entries: [] };
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

