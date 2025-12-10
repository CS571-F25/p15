import fs from 'node:fs/promises';
import path from 'node:path';
import { existsSync } from 'node:fs';
import { Minimatch } from 'minimatch';

function normalizeToPosix(value) {
  return value.replace(/\\/g, '/');
}

function createMatcher(patterns = []) {
  return patterns.map((pattern) => new Minimatch(pattern, { dot: true, nocase: true }));
}

function matchesAny(matchers, value) {
  if (!Array.isArray(matchers) || !matchers.length) return false;
  return matchers.some((matcher) => matcher.match(value));
}

function isHiddenEntry(name) {
  return name.startsWith('.');
}

function isBinaryBuffer(buffer) {
  if (!buffer) return false;
  for (let i = 0; i < buffer.length; i += 1) {
    if (buffer[i] === 0) {
      return true;
    }
  }
  return false;
}

export async function scanContentFiles(config) {
  const files = [];
  const includeMatchers = createMatcher(config.include || ['*']);
  const excludeMatchers = createMatcher(config.exclude || []);
  const rootDir = config.rootDir;

  if (!rootDir || !existsSync(rootDir)) {
    throw new Error(`Content import root does not exist: ${rootDir}`);
  }

  async function walk(currentPath, relative = '') {
    const entries = await fs.readdir(currentPath, { withFileTypes: true });
    for (const entry of entries) {
      const name = entry.name;
      if (name === '.obsidian') continue;
      if (isHiddenEntry(name)) continue;
      const nextRel = relative ? `${relative}/${name}` : name;
      const normalizedRel = normalizeToPosix(nextRel);
      const targetPath = path.join(currentPath, name);

      if (entry.isDirectory()) {
        if (!config.recursive) continue;
        if (matchesAny(excludeMatchers, normalizedRel)) continue;
        await walk(targetPath, normalizedRel);
        continue;
      }

      if (!entry.isFile()) continue;

      const ext = path.extname(name).toLowerCase();
      if (config.extensions && config.extensions.length && !config.extensions.includes(ext)) {
        continue;
      }
      if (config.excludeFiles?.some((filename) => filename.toLowerCase() === name.toLowerCase())) {
        continue;
      }
      if (!matchesAny(includeMatchers, normalizedRel)) continue;
      if (matchesAny(excludeMatchers, normalizedRel)) continue;

      files.push({
        absolutePath: targetPath,
        relativePath: normalizedRel,
      });
    }
  }

  await walk(rootDir, '');
  return files;
}
