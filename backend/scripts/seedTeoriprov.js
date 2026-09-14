// يرفع بنك أسئلة محاكاة Teoriprov (250 سؤالًا أصليًا) إلى مجموعة "teoriprovBank"
// في Firestore. آمن لإعادة التشغيل (يستبدل كل وثيقة بنفس المعرف).
// التشغيل: node backend/scripts/seedTeoriprov.js

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const admin = require('firebase-admin');
const bank = require('../data/teoriprovQuestions');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
    }),
  });
}

const db = admin.firestore();

async function main() {
  const allQuestions = Object.values(bank).flat();
  console.log(`رفع ${allQuestions.length} سؤالًا إلى مجموعة teoriprovBank...`);

  // Firestore batch يقبل حتى 500 عملية؛ نقسّم على دفعات آمنة.
  const chunkSize = 400;
  for (let i = 0; i < allQuestions.length; i += chunkSize) {
    const chunk = allQuestions.slice(i, i + chunkSize);
    const batch = db.batch();
    chunk.forEach((q) => {
      const { id, ...data } = q;
      batch.set(db.collection('teoriprovBank').doc(id), data);
    });
    await batch.commit();
    console.log(`  تم رفع ${Math.min(i + chunkSize, allQuestions.length)} / ${allQuestions.length}`);
  }

  console.log('اكتمل رفع بنك Teoriprov بنجاح ✅');
}

main().catch((err) => {
  console.error('فشل رفع البنك:', err);
  process.exit(1);
});
