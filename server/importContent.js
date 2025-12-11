import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { normalizeContentEntry } from './contentSchema.js';
import { scanContentFiles } from './contentScanner.js';
import { parseNoteFile } from './contentParser.js';
import { validateEntries } from './contentValidator.js';
import { loadImporterConfig } from './contentImporterConfig.js';

const currentFile = fileURLToPath(import.meta.url);
const currentDir = path.dirname(currentFile);
const DATA_DIR = path.join(currentDir, 'data');
const CONTENT_FILE = path.join(DATA_DIR, 'content.json');
const DIAGNOSTICS_FILE = path.join(DATA_DIR, 'content-diagnostics.json');
const BACKUP_LIMIT = 5;

async function ensureDataDir() {
  if (!existsSync(DATA_DIR)) {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }
}

async function rotateBackups() {
  for (let index = BACKUP_LIMIT - 1; index >= 1; index -= 1) {
    const source = path.join(DATA_DIR, `content_${index}.json`);
    const target = path.join(DATA_DIR, `content_${index + 1}.json`);
    if (existsSync(source)) {
      await fs.rm(target, { force: true });
      await fs.rename(source, target);
    }
  }
  if (existsSync(CONTENT_FILE)) {
    const firstBackup = path.join(DATA_DIR, 'content_1.json');
    await fs.copyFile(CONTENT_FILE, firstBackup);
  }
}

async function saveContent(entries, diagnostics) {
  await ensureDataDir();
  await rotateBackups();
  const payload = {
    entries,
    updatedAt: new Date().toISOString(),
  };
  await fs.writeFile(CONTENT_FILE, JSON.stringify(payload, null, 2), 'utf-8');
  await fs.writeFile(DIAGNOSTICS_FILE, JSON.stringify(diagnostics, null, 2), 'utf-8');
}

async function loadDiagnostics() {
  try {
    const raw = await fs.readFile(DIAGNOSTICS_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function buildSummaryReport({
  entries,
  filesDiscovered,
  diagnostics,
  unreadableFiles = [],
}) {
  console.log('Content import summary:');
  console.log(`  - Source folder: ${diagnostics.rootDir}`);
  console.log(`  - Config path: ${diagnostics.configPath || 'default'}`);
  console.log(`  - Files scanned: ${filesDiscovered}`);
  console.log(`  - Entries generated: ${entries.length}`);
  console.log(
    `  - Validation status: ${diagnostics.status} (${diagnostics.issueCount} issues)`,
  );
  if (diagnostics.missingIds.length) {
    console.log(`    • Missing IDs: ${diagnostics.missingIds.join(', ')}`);
  }
  if (diagnostics.duplicateIds.length) {
    console.log(`    • Duplicate IDs: ${diagnostics.duplicateIds.join(', ')}`);
  }
  if (diagnostics.invalidRegions.length) {
    console.log(
      `    • Invalid regions (${diagnostics.invalidRegions.length}) referencing ${diagnostics.invalidRegions
        .map((entry) => entry.regionId)
        .join(', ')}`,
    );
  }
  if (diagnostics.invalidLocations.length) {
    console.log(
      `    • Invalid map locations (${diagnostics.invalidLocations.length}) referencing ${diagnostics.invalidLocations
        .map((entry) => entry.mapLocationId)
        .join(', ')}`,
    );
  }
  if (unreadableFiles.length) {
    console.log(
      `  - Unreadable files (${unreadableFiles.length}): ${unreadableFiles
        .map((file) => file.path)
        .join(', ')}`,
    );
  }
}

async function runImporter() {
  const config = await loadImporterConfig();
  const discoveredFiles = await scanContentFiles(config);
  const parsedEntries = [];
  const unreadableFiles = [];

  for (const file of discoveredFiles) {
    try {
      const parsed = await parseNoteFile(file.absolutePath, config.rootDir);
      parsedEntries.push(parsed);
    } catch (error) {
      unreadableFiles.push({
        path: file.relativePath,
        message: error.message,
      });
    }
  }

  const normalizedEntries = parsedEntries.map((entry) =>
    normalizeContentEntry({
      ...entry,
      folder: entry.folder || '',
      obsidianPath: entry.obsidianPath || '',
    }),
  );

  const validation = await validateEntries(normalizedEntries, {
    unreadableFiles,
  });

  const diagnosticsPayload = {
    rootDir: config.rootDir,
    configPath: config.configPath,
    timestamp: new Date().toISOString(),
    filesDiscovered: discoveredFiles.length,
    entriesGenerated: normalizedEntries.length,
    ...validation,
  };

  await saveContent(normalizedEntries, diagnosticsPayload);
  buildSummaryReport({
    entries: normalizedEntries,
    filesDiscovered: discoveredFiles.length,
    diagnostics: diagnosticsPayload,
    unreadableFiles,
  });
}

runImporter().catch((error) => {
  console.error('Content importer failed:', error);
  process.exit(1);
});
