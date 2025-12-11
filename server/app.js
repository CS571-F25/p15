import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { registerRoutes } from './routes/index.js';
import { loadEnv, getConfig } from './config/env.js';
import { authRequired, ensureDefaultAdmin } from './utils.js';

export async function createApp() {
  // Load env from local files when running outside managed hosts (Netlify will inject env directly).
  loadEnv();

  const { allowedOrigins } = getConfig();
  const app = express();

  app.set('trust proxy', 1);
  app.use(
    cors({
      origin: allowedOrigins,
      credentials: true,
    })
  );
  app.use(express.json());
  app.use(cookieParser(process.env.COOKIE_SECRET || ''));

  app.get('/', (req, res) => res.send('API up dYY'));

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', usersSeeded: true });
  });

  app.get('/api/hello', authRequired, (req, res) => {
    res.json({ message: 'Hello from Azterra API', user: req.user });
  });

  registerRoutes(app);

  await ensureDefaultAdmin();

  return app;
}
