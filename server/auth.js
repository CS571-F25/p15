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
  applyFriendState,
  verifyToken,
  writeUsers,
  updateUsers,
  verifySupabaseToken,
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
    profile: { bio: '', labelOne: '', labelTwo: '', documents: [], viewFavorites: [] },
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

    let userToReturn =
      existingUser ||
      applyFriendState({
        id: randomUUID(),
        email,
        googleName,
        username: '',
        favorites: [],
        featuredCharacter: null,
        characters: [],
        profile: { bio: '', labelOne: '', labelTwo: '', documents: [], viewFavorites: [] },
        role: 'pending',
        provider: 'google',
        googleId,
        unlockedSecrets: [],
        createdAt: new Date().toISOString(),
      });

    if (!existingUser) {
      await writeUsers([...users, userToReturn]);
    } else if (!existingUser.friends || !existingUser.friendRequests) {
      await updateUsers((list) => {
        const idx = list.findIndex((entry) => entry.id === existingUser.id);
        if (idx !== -1) {
          const updated = applyFriendState(list[idx]);
          list[idx] = updated;
          userToReturn = updated;
        }
        return list;
      });
    }

    const token = generateToken(userToReturn);
    return res.json({ success: true, token, user: sanitizeUser(userToReturn) });
  } catch (error) {
    return res.status(401).json({ error: 'Invalid Google credential.' });
  }
});

router.post('/supabase', async (req, res) => {
  if (!process.env.SUPABASE_JWT_SECRET) {
    return res.status(500).json({ error: 'Supabase Auth is not configured on the server.' });
  }
  const header = req.headers.authorization || '';
  const bearerToken = header.startsWith('Bearer ') ? header.slice(7) : '';
  const { accessToken = '', displayName = '' } = req.body || {};
  const token = accessToken || bearerToken;
  if (!token) {
    return res.status(400).json({ error: 'Supabase access token is required.' });
  }
  let payload;
  try {
    payload = verifySupabaseToken(token);
  } catch (error) {
    console.error('Failed to verify Supabase token:', error);
    return res.status(401).json({ error: 'Invalid Supabase token.' });
  }

  const supabaseId = payload?.sub;
  const email = (payload?.email || payload?.user?.email || '').toLowerCase();
  if (!supabaseId || !email) {
    return res.status(400).json({ error: 'Supabase token is missing required claims.' });
  }
  const meta = payload?.user_metadata || {};
  const normalizedDisplayName =
    (typeof displayName === 'string' && displayName.trim()) ||
    meta.full_name ||
    meta.name ||
    meta.preferred_username ||
    payload?.name ||
    email.split('@')[0] ||
    'Adventurer';

  const users = await readUsers();
  let existing = users.find((entry) => entry.supabaseId === supabaseId || entry.email === email);

  if (!existing) {
    existing = await addUser({
      email,
      name: normalizedDisplayName,
      username: typeof displayName === 'string' ? displayName.trim() : '',
      favorites: [],
      featuredCharacter: null,
      profilePicture: '',
      profile: { bio: '', labelOne: '', labelTwo: '', documents: [], viewFavorites: [] },
      unlockedSecrets: [],
      role: 'pending',
      provider: 'supabase',
      supabaseId,
      createdAt: new Date().toISOString(),
    });
  } else {
    await updateUsers((list) => {
      const index = list.findIndex((entry) => entry.id === existing.id);
      if (index === -1) {
        return list;
      }
      const current = applyFriendState(list[index]);
      const nextUser = { ...current };
      nextUser.supabaseId = supabaseId;
      nextUser.email = email;
      if (!nextUser.name) {
        nextUser.name = normalizedDisplayName;
      }
      if (typeof displayName === 'string' && displayName.trim()) {
        nextUser.username = displayName.trim();
      }
      list[index] = nextUser;
      existing = nextUser;
      return list;
    });
  }

  const tokenResponse = generateToken(existing);
  return res.json({ success: true, token: tokenResponse, user: sanitizeUser(existing) });
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
      const current = applyFriendState(users[index]);
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
          viewFavorites: Array.isArray(current.profile?.viewFavorites) ? current.profile.viewFavorites : [],
        };
      } else {
        nextUser.profile = {
          bio: current.profile?.bio || '',
          labelOne: current.profile?.labelOne || '',
          labelTwo: current.profile?.labelTwo || '',
          documents: Array.isArray(current.profile?.documents) ? current.profile.documents : [],
          viewFavorites: Array.isArray(current.profile?.viewFavorites) ? current.profile.viewFavorites : [],
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
