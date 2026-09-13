const jwt = require('jsonwebtoken');
const db = require('../db');

function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: 'يلزم تسجيل الدخول للوصول إلى هذا المورد.' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = payload.userId;
    req.userRole = payload.role;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'جلسة غير صالحة أو منتهية، الرجاء تسجيل الدخول مجددًا.' });
  }
}

function requireAdmin(req, res, next) {
  if (req.userRole !== 'admin') {
    return res.status(403).json({ error: 'هذا الإجراء مخصص لصاحب المنصة فقط.' });
  }
  next();
}

// Content (tests/quizzes) requires an account approved by the platform owner.
async function requireApproved(req, res, next) {
  const user = await db.findUserById(req.userId);
  if (!user || (user.status !== 'approved')) {
    return res.status(403).json({ error: 'يجب أن يوافق عماد على طلب تسجيلك قبل الوصول إلى المحتوى.' });
  }
  next();
}

module.exports = { requireAuth, requireAdmin, requireApproved };
