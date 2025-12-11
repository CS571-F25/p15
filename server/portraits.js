import express from 'express';
import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { adminRequired, authRequired } from './utils.js';
import { normalizeContentList } from './contentSchema.js';

const router = express.Router();

const currentFile = fileURLToPath(import.meta.url);
const currentDir = path.dirname(currentFile);
const DATA_DIR = path.join(currentDir, 'data');
const CONTENT_FILE = path.join(DATA_DIR, 'content.json');
const PORTRAITS_DIR = path.join(DATA_DIR, 'portraits');
const IMAGE_API_KEY = process.env.IMAGE_API_KEY || process.env.OPENAI_API_KEY || '';
const IMAGE_MODEL = process.env.IMAGE_MODEL || 'gpt-image-1';

async function ensurePortraitDir() {
  await fs.mkdir(PORTRAITS_DIR, { recursive: true });
  return PORTRAITS_DIR;
}

async function readContentEntries() {
  try {
    const raw = await fs.readFile(CONTENT_FILE, 'utf-8');
    const parsed = JSON.parse(raw || '{}');
    const entries = Array.isArray(parsed.entries) ? parsed.entries : [];
    return normalizeContentList(entries);
  } catch {
    return [];
  }
}

function portraitPath(id) {
  return path.join(PORTRAITS_DIR, `${id}.png`);
}

function hasImageApiKey() {
  return Boolean(IMAGE_API_KEY);
}

function buildPrompt(description) {
  const base =
    'Half-body portrait, transparent background, League of Legends splash-art blended with Arcane painterly style, crisp focus, concept art quality.';
  return `${base} ${description || ''}`.trim();
}

async function generateImage({ prompt }) {
  const response = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${IMAGE_API_KEY}`,
    },
    body: JSON.stringify({
      model: IMAGE_MODEL,
      prompt,
      response_format: 'b64_json',
      size: '1024x1536',
    }),
  });
  if (!response.ok) {
    let message = 'Image generation failed.';
    try {
      const errJson = await response.json();
      message = errJson?.error?.message || message;
    } catch {
      // ignore parse errors
    }
    const error = new Error(message);
    error.status = response.status;
    throw error;
  }
  const data = await response.json();
  const b64 = data?.data?.[0]?.b64_json;
  if (!b64) throw new Error('Image generation returned no data.');
  return Buffer.from(b64, 'base64');
}

router.use('/files', express.static(PORTRAITS_DIR));

router.get('/config', async (_req, res) => {
  return res.json({ enabled: hasImageApiKey() });
});

router.get('/:id/status', async (req, res) => {
  const { id } = req.params;
  if (!id) return res.status(400).json({ error: 'id is required' });
  await ensurePortraitDir();
  const filePath = portraitPath(id);
  const exists = existsSync(filePath);
  const url = exists ? `/api/portraits/files/${encodeURIComponent(id)}.png` : null;
  return res.json({ exists, url });
});

router.post('/:id/generate', authRequired, adminRequired, async (req, res) => {
  const { id } = req.params;
  if (!id) return res.status(400).json({ error: 'id is required' });
  if (!hasImageApiKey()) {
    return res.status(503).json({ error: 'Image generation unavailable (no API key configured).' });
  }
  const entries = await readContentEntries();
  const entry = entries.find((item) => String(item.id) === String(id) && item.type === 'character');
  if (!entry) {
    return res.status(404).json({ error: 'Character not found.' });
  }
  if (!entry.imageDescription) {
    return res.status(400).json({ error: 'This character has no image description metadata.' });
  }

  try {
    await ensurePortraitDir();
    const prompt = buildPrompt(entry.imageDescription);
    const imageBuffer = await generateImage({ prompt });
    const filePath = portraitPath(id);
    await fs.writeFile(filePath, imageBuffer);
    const url = `/api/portraits/files/${encodeURIComponent(id)}.png`;
    return res.json({ success: true, url, id });
  } catch (error) {
    const status = error.status || 500;
    return res.status(status).json({ error: error.message || 'Failed to generate portrait.' });
  }
});

export default router;
