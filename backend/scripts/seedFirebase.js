// سكريبت لمرة واحدة (وقابل لإعادة التشغيل بأمان) لتهيئة مشروع Firebase:
// - ينشئ حساب المصادقة والوثيقة الخاصة بصاحب المنصة (عماد)
// - يرفع بنك الأسئلة الأصلي (20 اختبارًا) إلى مجموعة "tests" في Firestore
//
// التشغيل: node backend/scripts/seedFirebase.js
// يحتاج نفس متغيرات .env (FIREBASE_PROJECT_ID/CLIENT_EMAIL/PRIVATE_KEY, ADMIN_EMAIL/PASSWORD)

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const admin = require('firebase-admin');
const { tests } = require('../data/questions');

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
  }),
});

const auth = admin.auth();
const db = admin.firestore();

async function seedAdmin() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) throw new Error('ADMIN_EMAIL/ADMIN_PASSWORD غير مضبوطين في .env');

  let userRecord;
  try {
    userRecord = await auth.getUserByEmail(email);
    console.log(`حساب المصادقة موجود بالفعل: ${email} (${userRecord.uid})`);
  } catch (e) {
    userRecord = await auth.createUser({ email, password, displayName: 'عماد (صاحب المنصة)' });
    console.log(`تم إنشاء حساب مصادقة جديد: ${email} (${userRecord.uid})`);
  }

  await db.collection('users').doc(userRecord.uid).set(
    {
      name: 'عماد (صاحب المنصة)',
      email,
      role: 'admin',
      status: 'approved',
      createdAt: new Date().toISOString(),
    },
    { merge: true }
  );
  console.log('تم ضبط وثيقة صاحب المنصة في Firestore.');
}

async function seedTests() {
  const batch = db.batch();
  tests.forEach((t) => {
    const ref = db.collection('tests').doc(t.id);
    batch.set(ref, { title: t.title, description: t.description, questions: t.questions });
  });
  await batch.commit();
  console.log(`تم رفع ${tests.length} اختبارًا (${tests.reduce((n, t) => n + t.questions.length, 0)} سؤال) إلى Firestore.`);
}

(async () => {
  try {
    await seedAdmin();
    await seedTests();
    console.log('اكتملت التهيئة بنجاح ✅');
    process.exit(0);
  } catch (err) {
    console.error('فشلت التهيئة:', err);
    process.exit(1);
  }
})();
