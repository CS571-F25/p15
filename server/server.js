import express from 'express';
import cors from 'cors';
import { registerRoutes } from './routes/index.js';
import { loadEnv, getConfig } from './config/env.js';
import { ensureDefaultAdmin } from './utils.js';
import { requireSupabaseAuth } from './middleware/supabaseAuth.js';

loadEnv();

const { port, allowedOrigins } = getConfig();
const app = express();

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);
app.use(express.json());

app.get('/', (req, res) => res.send('API up 🟢'));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', usersSeeded: true });
});

app.get('/api/hello', requireSupabaseAuth, (req, res) => {
  res.json({ message: 'Hello from Azterra API', user: req.user });
});

registerRoutes(app);

await ensureDefaultAdmin();

app.listen(port, '0.0.0.0', () => {
  console.log(`Azterra backend listening on port ${port}`);
});
