import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { mkdir, readFile, readdir, stat, unlink, writeFile } from 'node:fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_FILE_PATH = path.join(__dirname, '..', 'src', 'data', 'locations.json');
const BACKUP_DIR = path.join(__dirname, 'backups');
const BACKUP_LIMIT = 5;

async function ensureBackupDir() {
  await mkdir(BACKUP_DIR, { recursive: true });
}

async function createBackupSnapshot() {
  try {
    const currentData = await readFile(DATA_FILE_PATH, 'utf-8');
    if (!currentData) return null;
    await ensureBackupDir();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupName = `locations-${timestamp}.json`;
    const backupPath = path.join(BACKUP_DIR, backupName);
    await writeFile(backupPath, currentData, 'utf-8');
    return backupPath;
  } catch (error) {
    if (error.code === 'ENOENT') {
      return null;
    }
    throw error;
  }
}

async function pruneBackups() {
  try {
    const entries = await readdir(BACKUP_DIR, { withFileTypes: true });
    const backups = await Promise.all(
      entries
        .filter(
          (entry) =>
            entry.isFile() && entry.name.startsWith('locations-') && entry.name.endsWith('.json'),
        )
        .map(async (entry) => {
          const fullPath = path.join(BACKUP_DIR, entry.name);
          const stats = await stat(fullPath);
          return { path: fullPath, mtime: stats.mtimeMs };
        }),
    );

    backups.sort((a, b) => b.mtime - a.mtime);
    const stale = backups.slice(BACKUP_LIMIT);
    await Promise.all(stale.map((file) => unlink(file.path)));
  } catch (error) {
    if (error.code === 'ENOENT') {
      return;
    }
    throw error;
  }
}

async function parseRequestBody(req) {
  if (req.body) {
    return typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  }

  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }
  const raw = Buffer.concat(chunks).toString('utf-8');
  return raw ? JSON.parse(raw) : null;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.setHeader('Allow', 'POST');
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ success: false, error: 'Method Not Allowed' }));
    return;
  }

  try {
    const payload = await parseRequestBody(req);
    if (!Array.isArray(payload)) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ success: false, error: 'Payload must be an array.' }));
      return;
    }

    await createBackupSnapshot();
    await writeFile(DATA_FILE_PATH, JSON.stringify(payload, null, 2));
    await pruneBackups();

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ success: true, savedCount: payload.length }));
  } catch (error) {
    console.error('Failed to save locations', error);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ success: false, error: 'Failed to save locations.' }));
  }
}
