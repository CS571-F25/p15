import fs from 'node:fs';
import path from 'node:path';

function loadEnvFile(filename) {
  const filepath = path.resolve(process.cwd(), filename);
  if (!fs.existsSync(filepath)) return;
  const content = fs.readFileSync(filepath, 'utf-8');
  content
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#') && line.includes('='))
    .forEach((line) => {
      const [key, ...rest] = line.split('=');
      const value = rest.join('=').trim().replace(/^['"]|['"]$/g, '');
      if (!process.env[key]) {
        process.env[key] = value;
      }
    });
}

export function loadEnv() {
  loadEnvFile('.env.local');
  loadEnvFile('.env');
}

function parseAllowedOrigins(value = '') {
  return value
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}

export function getConfig() {
  const port = Number.parseInt(process.env.PORT, 10) || 3000;
  const parsedOrigins = parseAllowedOrigins(process.env.ALLOWED_ORIGINS);
  const allowedOrigins =
    parsedOrigins.length > 0 ? parsedOrigins : ['http://localhost:5173', 'http://localhost:4173'];

  return {
    port,
    allowedOrigins,
    nodeEnv: process.env.NODE_ENV || 'development',
  };
}
