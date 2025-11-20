import express from 'express';
import cors from 'cors';
import authRoutes from './auth.js';
import adminRoutes from './admin.js';
import locationsRoutes from './locations.js';
import regionsRoutes from './regions.js';
import { ensureDefaultAdmin } from './utils.js';

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

await ensureDefaultAdmin();

app.listen(PORT, () => {
  console.log(`Azterra backend listening on http://localhost:${PORT}`);
});
