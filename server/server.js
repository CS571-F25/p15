import fs from 'fs';
import path from 'path';
import express from 'express';
import cors from 'cors';
import authRoutes from './auth.js';
import adminRoutes from './admin.js';
import locationsRoutes from './locations.js';
import regionsRoutes from './regions.js';
import secretsRoutes from './secrets.js';
import charactersRoutes from './characters.js';
import filesRoutes from './files.js';
import viewRoutes from './view.js';
import entitiesRoutes from './entities.js';
import contentRoutes from './content.js';
import portraitsRoutes from './portraits.js';
import { ensureDefaultAdmin } from './utils.js';

const loadEnvFile = (filename) => {
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
};

// Load environment variables from local files if not already set.
loadEnvFile('.env.local');
loadEnvFile('.env');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(
  cors({
    origin: ['http://localhost:5173', 'http://localhost:4173'],
  })
);
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', usersSeeded: true });
});

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/locations', locationsRoutes);
app.use('/api/regions', regionsRoutes);
app.use('/api/secrets', secretsRoutes);
app.use('/api/characters', charactersRoutes);
app.use('/api/files', filesRoutes);
app.use('/api/view', viewRoutes);
app.use('/api/entities', entitiesRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/portraits', portraitsRoutes);

await ensureDefaultAdmin();

app.listen(PORT, () => {
  console.log(`Azterra backend listening on http://localhost:${PORT}`);
});
