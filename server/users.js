import { Router } from 'express';
import { applyFriendState, authRequired, readUsers, updateUsers } from './utils.js';

const router = Router();

const normalizeList = (list) => Array.isArray(list) ? list : [];

const buildResponse = (user) => ({
  friends: normalizeList(user.friends),
  incoming: normalizeList(user.friendRequests?.incoming),
  outgoing: normalizeList(user.friendRequests?.outgoing),
});

router.get('/friends', authRequired, async (req, res) => {
  const users = await readUsers();
  const current = applyFriendState(users.find((u) => u.id === req.user.id) || req.user);
  return res.json(buildResponse(current));
});

router.post('/friends/request', authRequired, async (req, res) => {
  const { targetId } = req.body || {};
  const parsedTarget = Number(targetId);
  if (!Number.isFinite(parsedTarget)) {
    return res.status(400).json({ error: 'A valid targetId is required.' });
  }
  if (parsedTarget === req.user.id) {
    return res.status(400).json({ error: 'You cannot friend yourself.' });
  }

  let payload = null;
  try {
    await updateUsers((users) => {
      const currentIdx = users.findIndex((u) => u.id === req.user.id);
      const targetIdx = users.findIndex((u) => u.id === parsedTarget);
      if (currentIdx === -1 || targetIdx === -1) {
        throw new Error('User not found.');
      }
      const current = applyFriendState(users[currentIdx]);
      const target = applyFriendState(users[targetIdx]);

      // Already friends or already requested
      if (current.friends.includes(parsedTarget)) {
        payload = { status: 'friends', current };
        users[currentIdx] = current;
        users[targetIdx] = target;
        return users;
      }
      if (current.friendRequests.outgoing.includes(parsedTarget)) {
        payload = { status: 'requested', current };
        users[currentIdx] = current;
        users[targetIdx] = target;
        return users;
      }

      // Auto-accept if they already requested you
      if (current.friendRequests.incoming.includes(parsedTarget)) {
        const nextCurrent = applyFriendState({
          ...current,
          friends: [...new Set([...current.friends, parsedTarget])],
          friendRequests: {
            incoming: current.friendRequests.incoming.filter((id) => id !== parsedTarget),
            outgoing: current.friendRequests.outgoing.filter((id) => id !== parsedTarget),
          },
        });
        const nextTarget = applyFriendState({
          ...target,
          friends: [...new Set([...target.friends, req.user.id])],
          friendRequests: {
            incoming: target.friendRequests.incoming.filter((id) => id !== req.user.id),
            outgoing: target.friendRequests.outgoing.filter((id) => id !== req.user.id),
          },
        });
        users[currentIdx] = nextCurrent;
        users[targetIdx] = nextTarget;
        payload = { status: 'accepted', current: nextCurrent };
        return users;
      }

      const nextCurrent = applyFriendState({
        ...current,
        friendRequests: {
          incoming: current.friendRequests.incoming,
          outgoing: [...new Set([...current.friendRequests.outgoing, parsedTarget])],
        },
      });
      const nextTarget = applyFriendState({
        ...target,
        friendRequests: {
          incoming: [...new Set([...target.friendRequests.incoming, req.user.id])],
          outgoing: target.friendRequests.outgoing,
        },
      });
      users[currentIdx] = nextCurrent;
      users[targetIdx] = nextTarget;
      payload = { status: 'requested', current: nextCurrent };
      return users;
    });
  } catch (error) {
    return res.status(400).json({ error: error.message || 'Unable to add friend.' });
  }

  return res.json({ success: true, status: payload?.status || 'requested', ...buildResponse(payload?.current || {}) });
});

router.post('/friends/respond', authRequired, async (req, res) => {
  const { requesterId, accept = false } = req.body || {};
  const parsedRequester = Number(requesterId);
  if (!Number.isFinite(parsedRequester)) {
    return res.status(400).json({ error: 'A valid requesterId is required.' });
  }

  let payload = null;
  try {
    await updateUsers((users) => {
      const currentIdx = users.findIndex((u) => u.id === req.user.id);
      const requesterIdx = users.findIndex((u) => u.id === parsedRequester);
      if (currentIdx === -1 || requesterIdx === -1) {
        throw new Error('User not found.');
      }
      const current = applyFriendState(users[currentIdx]);
      const requester = applyFriendState(users[requesterIdx]);

      const cleanedCurrent = {
        ...current,
        friendRequests: {
          incoming: current.friendRequests.incoming.filter((id) => id !== parsedRequester),
          outgoing: current.friendRequests.outgoing.filter((id) => id !== parsedRequester),
        },
      };
      const cleanedRequester = {
        ...requester,
        friendRequests: {
          incoming: requester.friendRequests.incoming.filter((id) => id !== req.user.id),
          outgoing: requester.friendRequests.outgoing.filter((id) => id !== req.user.id),
        },
      };

      if (accept) {
        cleanedCurrent.friends = [...new Set([...cleanedCurrent.friends, parsedRequester])];
        cleanedRequester.friends = [...new Set([...cleanedRequester.friends, req.user.id])];
      } else {
        cleanedCurrent.friends = normalizeList(cleanedCurrent.friends);
        cleanedRequester.friends = normalizeList(cleanedRequester.friends);
      }

      users[currentIdx] = applyFriendState(cleanedCurrent);
      users[requesterIdx] = applyFriendState(cleanedRequester);
      payload = { status: accept ? 'accepted' : 'declined', current: users[currentIdx] };
      return users;
    });
  } catch (error) {
    return res.status(400).json({ error: error.message || 'Unable to respond to request.' });
  }

  return res.json({ success: true, status: payload?.status, ...buildResponse(payload?.current || {}) });
});

router.post('/friends/remove', authRequired, async (req, res) => {
  const { targetId } = req.body || {};
  const parsedTarget = Number(targetId);
  if (!Number.isFinite(parsedTarget)) {
    return res.status(400).json({ error: 'A valid targetId is required.' });
  }

  let payload = null;
  try {
    await updateUsers((users) => {
      const currentIdx = users.findIndex((u) => u.id === req.user.id);
      const targetIdx = users.findIndex((u) => u.id === parsedTarget);
      if (currentIdx === -1 || targetIdx === -1) {
        throw new Error('User not found.');
      }
      const current = applyFriendState(users[currentIdx]);
      const target = applyFriendState(users[targetIdx]);

      const nextCurrent = applyFriendState({
        ...current,
        friends: current.friends.filter((id) => id !== parsedTarget),
        friendRequests: {
          incoming: current.friendRequests.incoming.filter((id) => id !== parsedTarget),
          outgoing: current.friendRequests.outgoing.filter((id) => id !== parsedTarget),
        },
      });
      const nextTarget = applyFriendState({
        ...target,
        friends: target.friends.filter((id) => id !== req.user.id),
        friendRequests: {
          incoming: target.friendRequests.incoming.filter((id) => id !== req.user.id),
          outgoing: target.friendRequests.outgoing.filter((id) => id !== req.user.id),
        },
      });

      users[currentIdx] = nextCurrent;
      users[targetIdx] = nextTarget;
      payload = { current: nextCurrent };
      return users;
    });
  } catch (error) {
    return res.status(400).json({ error: error.message || 'Unable to update friends.' });
  }

  return res.json({ success: true, status: 'removed', ...buildResponse(payload?.current || {}) });
});

export default router;
