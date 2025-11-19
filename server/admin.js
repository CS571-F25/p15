import { Router } from 'express';
import {
  ALLOWED_ROLES,
  adminRequired,
  authRequired,
  readUsers,
  sanitizeUser,
  updateUsers,
} from './utils.js';

const router = Router();

router.use(authRequired);
router.use(adminRequired);

router.get('/users', async (req, res) => {
  const users = await readUsers();
  return res.json({
    users: users.map((user) => sanitizeUser(user)),
  });
});

router.post('/updateRole', async (req, res) => {
  const { userId, newRole } = req.body || {};
  const parsedId = Number(userId);

  if (!Number.isInteger(parsedId)) {
    return res.status(400).json({ error: 'Invalid user id.' });
  }

  if (!ALLOWED_ROLES.includes(newRole)) {
    return res.status(400).json({ error: 'Invalid role.' });
  }

  let updatedUser = null;
  try {
    await updateUsers((users) => {
      const index = users.findIndex((user) => user.id === parsedId);
      if (index === -1) {
        const error = new Error('not_found');
        throw error;
      }
      if (users[index].id === req.user.id && newRole !== 'admin') {
        const error = new Error('self_demote');
        throw error;
      }
      const nextUsers = [...users];
      updatedUser = { ...users[index], role: newRole };
      nextUsers[index] = updatedUser;
      return nextUsers;
    });
  } catch (error) {
    if (error.message === 'not_found') {
      return res.status(404).json({ error: 'User not found.' });
    }
    if (error.message === 'self_demote') {
      return res.status(400).json({ error: 'Admins cannot demote themselves.' });
    }
    return res.status(500).json({ error: 'Unable to update user role.' });
  }

  return res.json({ user: sanitizeUser(updatedUser) });
});

export default router;
