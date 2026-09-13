const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { nanoid } = require('nanoid');
const db = require('../db');

const router = express.Router();

function issueToken(user) {
  return jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '30d' });
}

function publicUser(user) {
  return { id: user.id, name: user.name, email: user.email, role: user.role, status: user.status };
}

router.post('/register', async (req, res) => {
  const { name, email, password } = req.body || {};

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'الاسم والبريد الإلكتروني وكلمة المرور مطلوبة.' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'يجب أن تتكون كلمة المرور من 6 أحرف على الأقل.' });
  }
  if (db.findUserByEmail(email)) {
    return res.status(409).json({ error: 'يوجد حساب مسجل بهذا البريد الإلكتروني بالفعل.' });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = {
    id: nanoid(),
    name,
    email,
    passwordHash,
    role: 'trainee',
    status: 'pending', // ينتظر موافقة صاحب المنصة (عماد) قبل الدخول إلى المحتوى
    createdAt: new Date().toISOString(),
  };
  db.addUser(user);

  res.status(201).json({
    pending: true,
    message: 'تم إنشاء طلب التسجيل بنجاح. سيتم تفعيل حسابك بعد موافقة عماد، وسنعلمك عند تسجيل الدخول.',
  });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ error: 'البريد الإلكتروني وكلمة المرور مطلوبان.' });
  }

  const user = db.findUserByEmail(email);
  if (!user) {
    return res.status(401).json({ error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة.' });
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return res.status(401).json({ error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة.' });
  }

  // نسمح بتسجيل الدخول حتى لو كان الحساب قيد المراجعة أو مرفوضًا، لكن الواجهة
  // ستحوّله لصفحة "بانتظار الموافقة" بدل المحتوى — والخادم يمنع الوصول الفعلي
  // للاختبارات عبر requireApproved بغض النظر عما ترسله الواجهة.
  const token = issueToken(user);
  res.json({ token, user: publicUser(user) });
});

module.exports = router;
