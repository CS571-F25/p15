import { normalizeContentEntry } from './contentSchema.js';

export async function readRawText(filePath) {
  // Placeholder: future implementation will read note text from disk or vault sync.
  return { path: filePath, raw: '' };
}

export async function extractFrontmatter(rawText) {
  // Placeholder: future implementation will parse YAML frontmatter and return body text.
  return { attributes: {}, body: rawText || '' };
}

export async function convertToContentEntry(frontmatter, bodyText) {
  // Placeholder: future implementation will map Obsidian fields into the unified content entry.
  return normalizeContentEntry({
    ...(frontmatter || {}),
    body: bodyText || '',
  });
}

export async function updateContentFile(nextEntries) {
  // Placeholder: future implementation will merge entries into the persisted content file.
  return Array.isArray(nextEntries) ? nextEntries.map((entry) => normalizeContentEntry(entry)) : [];
}

