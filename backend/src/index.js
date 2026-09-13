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

app.get('/api/health', (req, res) => res.json({ ok: true }));
app.use('/api/auth', authRoutes);
app.use('/api/tests', testRoutes);
app.use('/api/results', resultRoutes);
app.use('/api/admin', adminRoutes);

const PORT = process.env.PORT || 4000;

seedAdmin().finally(() => {
  app.listen(PORT, () => {
    console.log(`Imad Teori Academy API يعمل على http://localhost:${PORT}`);
  });
});
