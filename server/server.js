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
import usersRoutes from './users.js';
import campaignsRoutes from './campaigns.js';
import { ensureDefaultAdmin } from './utils.js';
import { requireSupabaseAuth } from './supabaseAuth.js';

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
const PORT = process.env.PORT || 3000;
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173,http://localhost:4173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);
app.use(express.json());

app.get('/', (req, res) => res.send('API up'));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', usersSeeded: true });
});

app.get('/api/hello', requireSupabaseAuth, (req, res) => {
  res.json({ message: 'Hello from Azterra API', user: req.user });
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
app.use('/api/users', usersRoutes);
app.use('/api/campaigns', campaignsRoutes);

await ensureDefaultAdmin();

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Azterra backend listening on port ${PORT}`);
});
