const bcrypt = require('bcryptjs');
const { nanoid } = require('nanoid');
const db = require('./db');

// Creates (or promotes) the platform owner's account from env vars on startup,
// so only that person can approve new trainee registrations.
async function seedAdmin() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    console.warn('تحذير: ADMIN_EMAIL أو ADMIN_PASSWORD غير مضبوطين في .env — لن يتم إنشاء حساب صاحب المنصة.');
    return;
  }

  const existing = await db.findUserByEmail(email);
  if (existing) {
    if (existing.role !== 'admin' || existing.status !== 'approved') {
      await db.updateUser(existing.id, { role: 'admin', status: 'approved' });
    }
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await db.addUser({
    id: nanoid(),
    name: 'عماد (صاحب المنصة)',
    email,
    passwordHash,
    role: 'admin',
    status: 'approved',
    createdAt: new Date().toISOString(),
  });
  console.log(`تم إنشاء حساب صاحب المنصة: ${email}`);
}

module.exports = { seedAdmin };
