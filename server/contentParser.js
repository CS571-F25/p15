import fs from 'node:fs/promises';
import path from 'node:path';

const KNOWN_META_KEYS = new Set([
  'id',
  'type',
  'title',
  'status',
  'category',
  'unlockable',
  'secret',
  'secretkey',
  'requires',
  'regionid',
  'maplocationid',
  'relatedcharacters',
  'relatedevents',
  'relateditems',
  'relatedfactions',
  'tags',
]);

function toNumeric(value) {
  if (value === undefined || value === null) return null;
  const trimmed = String(value).trim();
  if (!trimmed) return null;
  const numeric = Number(trimmed);
  if (!Number.isNaN(numeric) && String(numeric) === trimmed) {
    return numeric;
  }
  return trimmed;
}

function toList(value) {
  if (!value) return [];
  return String(value)
    .split(/[;,]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseBoolean(value) {
  if (value === undefined || value === null) return false;
  const normalized = String(value).trim().toLowerCase();
  return ['true', 'yes', '1'].includes(normalized);
}

function extractTags(bodyText) {
  const tagMatches = new Set();
  const regex = /(^|\s)#([A-Za-z0-9_\-:]+)/gm;
  let match;
  while ((match = regex.exec(bodyText)) !== null) {
    if (match[2]) {
      tagMatches.add(match[2]);
    }
  }
  return Array.from(tagMatches);
}

function normalizeToPosix(value) {
  if (!value) return '';
  return value.replace(/\\/g, '/');
}

function splitSummary(bodyText) {
  if (!bodyText) return '';
  const paragraphs = bodyText
    .split(/\r?\n\s*\r?\n/)
    .map((chunk) => chunk.trim())
    .filter(Boolean);
  return paragraphs[0] || '';
}

export async function parseNoteFile(filePath, rootDir) {
  const raw = await fs.readFile(filePath, 'utf-8');
  if (raw.includes('\0')) {
    const error = new Error('Binary file');
    error.code = 'BINARY_FILE';
    throw error;
  }
  const lines = raw.split(/\r?\n/);
  const metadata = {};
  const metaExtras = {};
  let metaEnded = false;
  let bodyStartIndex = 0;

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const trimmed = line.trim();
    if (!metaEnded && trimmed.startsWith('#')) {
      const match = trimmed.match(/^#([A-Za-z0-9]+)\s*(.*)$/);
      if (match) {
        const key = match[1].toLowerCase();
        const value = match[2].trim();
        metadata[key] = value;
        if (!KNOWN_META_KEYS.has(key)) {
          metaExtras[key] = value;
        }
        continue;
      }
    }
    metaEnded = true;
    bodyStartIndex = index;
    break;
  }

  const bodyLines = metaEnded ? lines.slice(bodyStartIndex) : lines;
  const bodyText = bodyLines.join('\n').trim();

  const mappedFields = {
    id: metadata.id || metadata.slug || '',
    type: metadata.type || '',
    title: metadata.title || '',
    status: metadata.status || '',
    category: metadata.category || '',
    unlockable: parseBoolean(metadata.unlockable),
    secretKey: metadata.secretkey || metadata.secret || '',
    requires: toList(metadata.requires),
    regionId: toNumeric(metadata.regionid || metadata.region),
    mapLocationId: toNumeric(metadata.maplocationid || metadata.maplocation),
    relatedCharacters: toList(metadata.relatedcharacters),
    relatedEvents: toList(metadata.relatedevents),
    relatedItems: toList(metadata.relateditems),
    relatedFactions: toList(metadata.relatedfactions),
  };

  const metadataTags = toList(metadata.tags);
  const inlineTags = extractTags(bodyText);
  const uniqueTags = Array.from(new Set([...metadataTags, ...inlineTags]));

  const folder = normalizeToPosix(path.relative(rootDir, path.dirname(filePath))) || '';
  const obsidianPath = normalizeToPosix(path.relative(rootDir, filePath));

  return {
    ...mappedFields,
    summary: splitSummary(bodyText),
    body: bodyText,
    tags: uniqueTags,
    obsidianPath,
    folder,
    meta: {
      ...metaExtras,
    },
  };
}
