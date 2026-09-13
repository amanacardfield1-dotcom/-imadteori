const express = require('express');
const db = require('../db');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const router = express.Router();

router.use(requireAuth, requireAdmin);

function publicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
    createdAt: user.createdAt,
  };
}

router.get('/users', async (req, res) => {
  res.json((await db.getUsers()).map(publicUser));
});

router.get('/users/pending', async (req, res) => {
  res.json((await db.getPendingUsers()).map(publicUser));
});

router.post('/users/:id/approve', async (req, res) => {
  const user = await db.updateUser(req.params.id, { status: 'approved' });
  if (!user) return res.status(404).json({ error: 'المستخدم غير موجود.' });
  res.json(publicUser(user));
});

router.post('/users/:id/reject', async (req, res) => {
  const user = await db.updateUser(req.params.id, { status: 'rejected' });
  if (!user) return res.status(404).json({ error: 'المستخدم غير موجود.' });
  res.json(publicUser(user));
});

module.exports = router;
