const express = require('express');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/me', requireAuth, async (req, res) => {
  const results = (await db.getResultsByUser(req.userId)).sort(
    (a, b) => new Date(b.takenAt) - new Date(a.takenAt)
  );
  res.json(results);
});

module.exports = router;
