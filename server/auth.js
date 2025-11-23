import { Router } from 'express';
import { OAuth2Client } from 'google-auth-library';
import { randomUUID } from 'node:crypto';
import {
  addUser,
  comparePassword,
  ensureDefaultAdmin,
  generateToken,
  hashPassword,
  readUsers,
  sanitizeUser,
  verifyToken,
  writeUsers,
  updateUsers,
} from './utils.js';

const router = Router();
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const googleClient = GOOGLE_CLIENT_ID ? new OAuth2Client(GOOGLE_CLIENT_ID) : null;

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
    username: '',
    favorites: [],
    featuredCharacter: null,
    profilePicture: '',
    profile: { bio: '', labelOne: '', labelTwo: '', documents: [] },
    unlockedSecrets: [],
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

router.post('/google', async (req, res) => {
  if (!googleClient || !GOOGLE_CLIENT_ID) {
    return res.status(500).json({ error: 'Google Sign-In is not configured.' });
  }

  const { credential = '' } = req.body || {};
  if (!credential) {
    return res.status(400).json({ error: 'Google credential is required.' });
  }

  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const email = (payload?.email || '').toLowerCase();
    const googleName = payload?.name || payload?.given_name || '';
    const googleId = payload?.sub;

    if (!email) {
      return res.status(400).json({ error: 'Google account email is required.' });
    }

    const users = await readUsers();
    const existingUser = users.find((entry) => entry.email === email);

    const userToReturn =
      existingUser ||
      {
        id: randomUUID(),
        email,
        googleName,
        username: '',
        favorites: [],
        featuredCharacter: null,
        characters: [],
        profile: { bio: '', labelOne: '', labelTwo: '', documents: [] },
        role: 'pending',
        provider: 'google',
        googleId,
        unlockedSecrets: [],
        createdAt: new Date().toISOString(),
      };

    if (!existingUser) {
      await writeUsers([...users, userToReturn]);
    }

    const token = generateToken(userToReturn);
    return res.json({ success: true, token, user: sanitizeUser(userToReturn) });
  } catch (error) {
    return res.status(401).json({ error: 'Invalid Google credential.' });
  }
});

router.put('/me', async (req, res) => {
  try {
    const header = req.headers.authorization || '';
    if (!header.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing token.' });
    }
    const token = header.slice(7);
    const payload = verifyToken(token);
    const { username, profilePicture, profile } = req.body || {};

    let updatedUser = null;
    await updateUsers((users) => {
      const index = users.findIndex((entry) => entry.id === payload.id);
      if (index === -1) {
        throw new Error('User not found.');
      }
      const current = users[index];
      const nextUser = { ...current };
      if (username !== undefined) {
        nextUser.username = typeof username === 'string' ? username.trim() : current.username;
      }
      if (profilePicture !== undefined) {
        nextUser.profilePicture =
          typeof profilePicture === 'string' ? profilePicture.trim() : current.profilePicture;
      }
      if (profile && typeof profile === 'object') {
        nextUser.profile = {
          bio: typeof profile.bio === 'string' ? profile.bio.slice(0, 1000) : current.profile?.bio || '',
          labelOne: typeof profile.labelOne === 'string' ? profile.labelOne.slice(0, 120) : current.profile?.labelOne || '',
          labelTwo: typeof profile.labelTwo === 'string' ? profile.labelTwo.slice(0, 120) : current.profile?.labelTwo || '',
          documents: Array.isArray(current.profile?.documents) ? current.profile.documents : [],
        };
      } else {
        nextUser.profile = {
          bio: current.profile?.bio || '',
          labelOne: current.profile?.labelOne || '',
          labelTwo: current.profile?.labelTwo || '',
          documents: Array.isArray(current.profile?.documents) ? current.profile.documents : [],
        };
      }
      if (!Array.isArray(nextUser.unlockedSecrets)) {
        nextUser.unlockedSecrets = Array.isArray(current.unlockedSecrets) ? current.unlockedSecrets : [];
      }
      users[index] = nextUser;
      updatedUser = nextUser;
      return users;
    });

    return res.json({ user: sanitizeUser(updatedUser) });
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
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
