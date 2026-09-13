const express = require('express');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/me', requireAuth, (req, res) => {
  const results = db
    .getResultsByUser(req.userId)
    .sort((a, b) => new Date(b.takenAt) - new Date(a.takenAt));
  res.json(results);
});

module.exports = router;
