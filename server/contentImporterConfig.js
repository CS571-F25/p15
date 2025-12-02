import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const CONFIG_FILENAME = 'content-importer.config.json';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CONFIG_PATH = path.resolve(path.join(__dirname, '..', CONFIG_FILENAME));

const DEFAULT_CONFIG = {
  rootFolder: '../AZTERRA/DM NOTES',
  include: ['**/*'],
  exclude: [],
  excludeFiles: [],
  extensions: ['.md'],
  recursive: true,
};

async function safeReadConfig() {
  try {
    if (!existsSync(CONFIG_PATH)) return null;
    const raw = await fs.readFile(CONFIG_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch (error) {
    console.warn('Unable to load content importer config:', error.message);
    return null;
  }
}

function normalizeExtensions(list = []) {
  return Array.isArray(list)
    ? list
        .map((ext) => (ext && typeof ext === 'string' ? ext.trim() : ''))
        .filter(Boolean)
        .map((ext) => (ext.startsWith('.') ? ext.toLowerCase() : `.${ext.toLowerCase()}`))
    : [];
}

function normalizePatterns(list = [], fallback = ['**/*']) {
  if (!Array.isArray(list) || !list.length) return fallback;
  return list
    .map((pattern) => {
      if (typeof pattern !== 'string') return '';
      const trimmed = pattern.trim();
      if (!trimmed) return '';
      if (trimmed === '*') return '**/*';
      return trimmed;
    })
    .filter(Boolean);
}

function resolveRoot(rootValue) {
  if (!rootValue) return null;
  const candidates = [];
  if (path.isAbsolute(rootValue)) {
    candidates.push(rootValue);
  } else {
    const base = process.cwd();
    candidates.push(path.resolve(base, rootValue));
    candidates.push(path.resolve(base, '..', rootValue));
    candidates.push(path.resolve(base, '..', 'AZTERRA', rootValue));
    candidates.push(path.resolve(base, '..', '..', rootValue));
    candidates.push(path.resolve(base, '..', '..', 'AZTERRA', rootValue));
  }
  for (const candidate of candidates) {
    if (!candidate) continue;
    if (existsSync(candidate)) {
      return candidate;
    }
  }
  return null;
}

export async function loadImporterConfig() {
  const raw = (await safeReadConfig()) || {};
  const merged = {
    ...DEFAULT_CONFIG,
    ...raw,
    include: normalizePatterns(raw.include, DEFAULT_CONFIG.include),
    exclude: normalizePatterns(raw.exclude, DEFAULT_CONFIG.exclude),
    excludeFiles: Array.isArray(raw.excludeFiles)
      ? raw.excludeFiles
      : DEFAULT_CONFIG.excludeFiles,
    extensions: normalizeExtensions(raw.extensions || DEFAULT_CONFIG.extensions),
    recursive:
      typeof raw.recursive === 'boolean' ? raw.recursive : DEFAULT_CONFIG.recursive,
  };

  let rootDir = resolveRoot(merged.rootFolder);
  if (!rootDir) {
    console.warn(
      `Content importer root folder "${merged.rootFolder}" not found. Falling back to default path.`,
    );
    rootDir = resolveRoot(DEFAULT_CONFIG.rootFolder);
  }
  if (!rootDir) {
    throw new Error('Unable to resolve DM NOTES root folder for content importer.');
  }

  return {
    ...merged,
    rootFolder: merged.rootFolder,
    rootDir,
    configPath: existsSync(CONFIG_PATH) ? CONFIG_PATH : null,
  };
}
