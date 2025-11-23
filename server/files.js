import path from 'node:path';
import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { Router } from 'express';
import multer from 'multer';
import { adminRequired, authRequired, getUploadsDir, readUsers, updateUsers } from './utils.js';

const router = Router();

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    getUploadsDir()
      .then((dir) => cb(null, dir))
      .catch((err) => cb(err));
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || '';
    const base = path.basename(file.originalname, ext).replace(/[^\w.-]/g, '_');
    const unique = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    cb(null, `${base}-${unique}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (_req, file, cb) => {
    const allowed = ['application/pdf', 'text/plain'];
    if (allowed.includes(file.mimetype)) return cb(null, true);
    return cb(new Error('Unsupported file type.'));
  },
});

const ensureDocStructure = (profile = {}) => ({
  bio: profile.bio || '',
  labelOne: profile.labelOne || '',
  labelTwo: profile.labelTwo || '',
  documents: Array.isArray(profile.documents) ? profile.documents : [],
});

router.get('/list', authRequired, async (req, res) => {
  return res.json({ documents: ensureDocStructure(req.user.profile).documents });
});

router.post('/upload', authRequired, upload.array('files', 5), async (req, res) => {
  if (!req.files || !req.files.length) {
    return res.status(400).json({ error: 'No files uploaded.' });
  }

  const docs = req.files.map((file) => ({
    id: file.filename,
    originalName: file.originalname,
    mimeType: file.mimetype,
    size: file.size,
    uploadedAt: new Date().toISOString(),
  }));

  let updatedUser = null;
  await updateUsers((users) => {
    const idx = users.findIndex((u) => u.id === req.user.id);
    if (idx === -1) throw new Error('User not found.');
    const current = users[idx];
    const profile = ensureDocStructure(current.profile);
    const nextUser = {
      ...current,
      profile: {
        ...profile,
        documents: [...profile.documents, ...docs],
      },
    };
    users[idx] = nextUser;
    updatedUser = nextUser;
    return users;
  });

  return res.json({ success: true, documents: ensureDocStructure(updatedUser.profile).documents });
});

router.delete('/:id', authRequired, async (req, res) => {
  const { id } = req.params;
  if (!id) return res.status(400).json({ error: 'File id is required.' });
  let filePath = null;
  let updatedDocs = [];
  await updateUsers((users) => {
    const idx = users.findIndex((u) => u.id === req.user.id);
    if (idx === -1) throw new Error('User not found.');
    const current = users[idx];
    const profile = ensureDocStructure(current.profile);
    const remaining = profile.documents.filter((doc) => {
      if (doc.id === id) {
        filePath = doc;
        return false;
      }
      return true;
    });
    const nextUser = { ...current, profile: { ...profile, documents: remaining } };
    users[idx] = nextUser;
    updatedDocs = remaining;
    return users;
  });

  if (filePath) {
    const dir = await getUploadsDir();
    const abs = path.join(dir, filePath.id);
    if (existsSync(abs)) {
      await fs.rm(abs).catch(() => {});
    }
  }

  return res.json({ success: true, documents: updatedDocs });
});

router.get('/download/:id', authRequired, async (req, res) => {
  const { id } = req.params;
  if (!id) return res.status(400).json({ error: 'File id is required.' });

  const dir = await getUploadsDir();
  const abs = path.join(dir, id);
  let found = null;
  if (!existsSync(abs)) {
    return res.status(404).json({ error: 'File not found.' });
  }

  const users = await readUsers();
  const current = users.find((u) => u.id === req.user.id);
  const isAdmin = req.user.role === 'admin';
  const targetUser = isAdmin ? users.find((u) => (u.profile?.documents || []).some((doc) => doc.id === id)) : current;
  if (!targetUser) return res.status(404).json({ error: 'File not found.' });
  if (!isAdmin && targetUser.id !== req.user.id) {
    return res.status(403).json({ error: 'Not allowed.' });
  }

  const doc = (targetUser.profile?.documents || []).find((entry) => entry.id === id);
  found = doc;
  if (!found) return res.status(404).json({ error: 'File not found.' });

  res.setHeader('Content-Type', found.mimeType || 'application/octet-stream');
  res.setHeader('Content-Disposition', `attachment; filename="${found.originalName || 'file'}"`);
  return res.sendFile(abs);
});

// Admin-only browse list of all documents (metadata only)
router.get('/admin/metadata', authRequired, adminRequired, async (_req, res) => {
  const users = await readUsers();
  const payload = users.map((user) => ({
    id: user.id,
    email: user.email,
    username: user.username,
    documents: Array.isArray(user.profile?.documents) ? user.profile.documents : [],
  }));
  return res.json({ users: payload });
});

export default router;
