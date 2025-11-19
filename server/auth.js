import { Router } from 'express';
import {
  addUser,
  comparePassword,
  ensureDefaultAdmin,
  generateToken,
  hashPassword,
  readUsers,
  sanitizeUser,
  verifyToken,
} from './utils.js';

const router = Router();

router.post('/signup', async (req, res) => {
  await ensureDefaultAdmin();
  const { email = '', name = '', password = '' } = req.body || {};

  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Email, name, and password are required.' });
  }

  const normalizedEmail = email.trim().toLowerCase();

  const users = await readUsers();
  const existing = users.find((user) => user.email === normalizedEmail);
  if (existing) {
    return res.status(409).json({ error: 'Email already in use.' });
  }

  const passwordHash = await hashPassword(password);
  const newUser = await addUser({
    email: normalizedEmail,
    passwordHash,
    name: name.trim(),
    role: 'pending',
    createdAt: new Date().toISOString(),
  });

  return res.status(201).json({ user: sanitizeUser(newUser) });
});

router.post('/login', async (req, res) => {
  const { email = '', password = '' } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const users = await readUsers();
  const user = users.find((entry) => entry.email === normalizedEmail);
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials.' });
  }

  const isValid = await comparePassword(password, user.passwordHash);
  if (!isValid) {
    return res.status(401).json({ error: 'Invalid credentials.' });
  }

  const token = generateToken(user);
  return res.json({ user: sanitizeUser(user), token });
});

router.get('/me', async (req, res) => {
  try {
    const header = req.headers.authorization || '';
    if (!header.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing token.' });
    }
    const token = header.slice(7);
    const payload = verifyToken(token);
    const users = await readUsers();
    const user = users.find((entry) => entry.id === payload.id);
    if (!user) {
      return res.status(401).json({ error: 'User not found.' });
    }
    return res.json({ user: sanitizeUser(user) });
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
});

export default router;
