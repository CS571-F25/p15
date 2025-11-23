import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const USERS_FILE_PATH = path.join(__dirname, 'users.json');
const BACKUP_DIR = path.join(__dirname, 'backups');
const CHARACTER_VISIBILITY_PATH = path.join(__dirname, 'characters-visibility.json');
const UPLOADS_DIR = path.join(__dirname, 'uploads');
const JWT_SECRET = process.env.JWT_SECRET || 'azterra_dev_secret_change_me';
const DEFAULT_ADMIN_EMAIL = process.env.DEFAULT_ADMIN_EMAIL || 'admin@azterra.com';
const DEFAULT_ADMIN_PASSWORD = process.env.DEFAULT_ADMIN_PASSWORD || 'admin12345';
const DEFAULT_ADMIN_NAME = process.env.DEFAULT_ADMIN_NAME || 'Azterra Admin';
const ALLOWED_ROLES = ['pending', 'editor', 'admin'];

async function ensureUsersFile() {
  if (!existsSync(USERS_FILE_PATH)) {
    await fs.writeFile(USERS_FILE_PATH, JSON.stringify([], null, 2));
  }
}

async function ensureVisibilityFile() {
  if (!existsSync(CHARACTER_VISIBILITY_PATH)) {
    // Default: allow all sample character IDs 1-12 (adjust as the roster grows)
    const defaultVisible = Array.from({ length: 12 }, (_, i) => i + 1);
    await fs.writeFile(CHARACTER_VISIBILITY_PATH, JSON.stringify(defaultVisible, null, 2));
  }
}

async function ensureUploadsDir() {
  if (!existsSync(UPLOADS_DIR)) {
    await fs.mkdir(UPLOADS_DIR, { recursive: true });
  }
}

async function ensureBackupDir() {
  if (!existsSync(BACKUP_DIR)) {
    await fs.mkdir(BACKUP_DIR, { recursive: true });
  }
}

async function createBackup() {
  if (!existsSync(USERS_FILE_PATH)) return;
  await ensureBackupDir();
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = path.join(BACKUP_DIR, `users-${timestamp}.json`);
  const data = await fs.readFile(USERS_FILE_PATH, 'utf-8');
  await fs.writeFile(backupPath, data, 'utf-8');
  const backups = await fs.readdir(BACKUP_DIR);
  if (backups.length > 10) {
    const sorted = backups
      .filter((file) => file.startsWith('users-'))
      .sort((a, b) => (a > b ? 1 : -1));
    const stale = sorted.slice(0, Math.max(0, sorted.length - 10));
    await Promise.all(stale.map((file) => fs.rm(path.join(BACKUP_DIR, file))));
  }
}

export async function readUsers() {
  await ensureUsersFile();
  const raw = await fs.readFile(USERS_FILE_PATH, 'utf-8');
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export async function writeUsers(users) {
  await ensureUsersFile();
  await createBackup();
  await fs.writeFile(USERS_FILE_PATH, JSON.stringify(users, null, 2));
}

export async function readCharacterVisibility() {
  await ensureVisibilityFile();
  const raw = await fs.readFile(CHARACTER_VISIBILITY_PATH, 'utf-8');
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export async function writeCharacterVisibility(list) {
  await ensureVisibilityFile();
  await fs.writeFile(CHARACTER_VISIBILITY_PATH, JSON.stringify(list, null, 2));
}

export async function getUploadsDir() {
  await ensureUploadsDir();
  return UPLOADS_DIR;
}

export async function ensureDefaultAdmin() {
  const users = await readUsers();
  const hasAdmin = users.some((user) => user.role === 'admin');
  if (hasAdmin) return;

  const passwordHash = await hashPassword(DEFAULT_ADMIN_PASSWORD);
  const adminUser = {
    id: 1,
    email: DEFAULT_ADMIN_EMAIL.toLowerCase(),
    passwordHash,
    name: DEFAULT_ADMIN_NAME,
    username: 'admin',
    favorites: [],
    featuredCharacter: null,
    profilePicture: '',
    profile: { bio: '', labelOne: '', labelTwo: '', documents: [] },
    unlockedSecrets: [],
    role: 'admin',
    createdAt: new Date().toISOString(),
  };
  await writeUsers([adminUser, ...users]);
}

export function sanitizeUser(user) {
  if (!user) return null;
  const { passwordHash, ...rest } = user;
  return rest;
}

export async function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password, hash) {
  return bcrypt.compare(password, hash);
}

function getNextUserId(users) {
  if (!users.length) return 1;
  return users.reduce((maxId, user) => Math.max(maxId, user.id || 0), 0) + 1;
}

export function generateToken(user) {
  return jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

function extractToken(req) {
  const header = req.headers.authorization || '';
  if (header.startsWith('Bearer ')) {
    return header.slice(7);
  }
  return null;
}

export const authRequired = async (req, res, next) => {
  try {
    const token = extractToken(req);
    if (!token) {
      return res.status(401).json({ error: 'Authentication required.' });
    }
    const payload = verifyToken(token);
    const users = await readUsers();
    const currentUser = users.find((user) => user.id === payload.id);
    if (!currentUser) {
      return res.status(401).json({ error: 'Invalid user.' });
    }
    req.user = {
      ...currentUser,
      favorites: Array.isArray(currentUser.favorites) ? currentUser.favorites : [],
      featuredCharacter: currentUser.featuredCharacter ?? null,
      profile: {
        bio: currentUser.profile?.bio || '',
        labelOne: currentUser.profile?.labelOne || '',
        labelTwo: currentUser.profile?.labelTwo || '',
        documents: Array.isArray(currentUser.profile?.documents) ? currentUser.profile.documents : [],
      },
      unlockedSecrets: Array.isArray(currentUser.unlockedSecrets) ? currentUser.unlockedSecrets : [],
    };
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
};

export const adminRequired = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin privileges required.' });
  }
  return next();
};

export const editorRequired = (req, res, next) => {
  if (!req.user || (req.user.role !== 'editor' && req.user.role !== 'admin')) {
    return res.status(403).json({ error: 'Only editors or admins can save changes.' });
  }
  return next();
};

export async function addUser(userData) {
  const users = await readUsers();
  const nextId = getNextUserId(users);
  const newUser = { ...userData, id: nextId };
  await writeUsers([...users, newUser]);
  return newUser;
}

export async function updateUsers(updater) {
  const users = await readUsers();
  const updatedUsers = await updater(users);
  await writeUsers(updatedUsers);
  return updatedUsers;
}

export { ALLOWED_ROLES };
