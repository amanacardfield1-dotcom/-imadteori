require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const testRoutes = require('./routes/tests');
const resultRoutes = require('./routes/results');
const adminRoutes = require('./routes/admin');
const { seedAdmin } = require('./seedAdmin');

if (!process.env.JWT_SECRET) {
  console.warn('تحذير: لم يتم ضبط JWT_SECRET في ملف .env، سيتم استخدام قيمة افتراضية غير آمنة للتطوير فقط.');
  process.env.JWT_SECRET = 'dev-only-insecure-secret';
}

const app = express();
app.use(cors());
app.use(express.json());

// On serverless (Vercel), each cold start needs the admin account ensured
// before serving requests; this runs once per warm instance and is cached.
let seedPromise = null;
app.use((req, res, next) => {
  if (!seedPromise) seedPromise = seedAdmin().catch((err) => console.error('seedAdmin failed:', err));
  seedPromise.then(() => next());
});

app.get('/api/health', (req, res) => res.json({ ok: true }));
app.use('/api/auth', authRoutes);
app.use('/api/tests', testRoutes);
app.use('/api/results', resultRoutes);
app.use('/api/admin', adminRoutes);

// Only listen on a port when run directly (local dev / `npm start`).
// On Vercel, this file is imported and the exported app is wrapped instead.
if (require.main === module) {
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    console.log(`Imad Teori Academy API يعمل على http://localhost:${PORT}`);
  });
}

module.exports = app;
