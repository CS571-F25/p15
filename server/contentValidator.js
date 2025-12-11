import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { CONTENT_TYPES } from './contentSchema.js';

const currentDir =
  typeof import.meta !== 'undefined' && import.meta.url
    ? path.dirname(fileURLToPath(import.meta.url))
    : path.resolve(process.cwd(), 'server');
const DATA_DIR = path.join(currentDir, 'data');
const LOCATIONS_FILE = path.join(DATA_DIR, 'locations.json');
const REGIONS_FILE = path.join(DATA_DIR, 'regions.json');

async function readJson(filePath, key) {
  try {
    const raw = await fs.readFile(filePath, 'utf-8');
    const parsed = JSON.parse(raw || '{}');
    const list = key ? parsed[key] : parsed;
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

async function loadLocationIds() {
  const locations = await readJson(LOCATIONS_FILE, 'locations');
  return new Set(locations.map((location) => String(location.id)));
}

async function loadRegionIds() {
  const regions = await readJson(REGIONS_FILE, 'regions');
  return new Set(regions.map((region) => String(region.id)));
}

export async function validateEntries(entries, options = {}) {
  const locationIds =
    options.locationIds && !(options.locationIds instanceof Set)
      ? new Set(Array.from(options.locationIds).map((value) => String(value)))
      : options.locationIds || (await loadLocationIds());
  const regionIds =
    options.regionIds && !(options.regionIds instanceof Set)
      ? new Set(Array.from(options.regionIds).map((value) => String(value)))
      : options.regionIds || (await loadRegionIds());
  const knownTypes = new Set(CONTENT_TYPES);

  const missingIds = [];
  const duplicateSet = new Set();
  const seenIds = new Set();
  const invalidTypes = [];
  const invalidRegions = [];
  const invalidLocations = [];

  entries.forEach((entry) => {
    const id = entry?.id;
    if (!id) {
      missingIds.push(entry?.obsidianPath || '(missing id)');
    } else if (seenIds.has(String(id))) {
      duplicateSet.add(String(id));
    } else {
      seenIds.add(String(id));
    }

    const type = entry?.type ? String(entry.type).toLowerCase() : '';
    if (type && !knownTypes.has(type)) {
      invalidTypes.push({ id: entry?.id || '(missing)', type });
    }

    const regionValue = entry?.regionId;
    if (regionValue !== null && regionValue !== undefined && regionValue !== '') {
      const normalized = String(regionValue);
      if (!regionIds.has(normalized)) {
        invalidRegions.push({ id: entry?.id || '(missing)', regionId: normalized });
      }
    }

    const locationValue = entry?.mapLocationId;
    if (locationValue !== null && locationValue !== undefined && locationValue !== '') {
      const normalized = String(locationValue);
      if (!locationIds.has(normalized)) {
        invalidLocations.push({ id: entry?.id || '(missing)', mapLocationId: normalized });
      }
    }
  });

  const duplicateIds = Array.from(duplicateSet);

  const unreadableFiles = Array.isArray(options.unreadableFiles)
    ? options.unreadableFiles
    : [];

  const issueCount =
    missingIds.length +
    duplicateIds.length +
    invalidTypes.length +
    invalidRegions.length +
    invalidLocations.length +
    unreadableFiles.length;
  let status = 'ok';
  if (issueCount) {
    status = missingIds.length || duplicateIds.length ? 'error' : 'warn';
  }
  return {
    missingIds,
    duplicateIds,
    invalidTypes,
    invalidRegions,
    invalidLocations,
    unreadableFiles,
    issueCount,
    status,
    entryCount: entries.length,
  };
}
