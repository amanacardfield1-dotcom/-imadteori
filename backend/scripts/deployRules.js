// ينشر قواعد أمان Firestore مباشرة عبر Firebase Rules REST API، متجاوزًا فحص
// صلاحيات serviceusage الذي يعطّل أمر `firebase deploy --only firestore:rules`.
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');

const projectId = process.env.FIREBASE_PROJECT_ID;

admin.initializeApp({
  credential: admin.credential.cert({
    projectId,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
  }),
});

async function main() {
  const token = (await admin.credential.cert({
    projectId,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
  }).getAccessToken()).access_token;

  const rulesContent = fs.readFileSync(path.join(__dirname, '..', '..', 'firestore.rules'), 'utf-8');

  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  console.log('إنشاء مجموعة قواعد جديدة (ruleset)...');
  const rulesetRes = await fetch(`https://firebaserules.googleapis.com/v1/projects/${projectId}/rulesets`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ source: { files: [{ name: 'firestore.rules', content: rulesContent }] } }),
  });
  const rulesetData = await rulesetRes.json();
  if (!rulesetRes.ok) throw new Error('فشل إنشاء ruleset: ' + JSON.stringify(rulesetData));
  const rulesetName = rulesetData.name;
  console.log('تم إنشاء:', rulesetName);

  console.log('تحديث الإصدار المفعّل (release) cloud.firestore...');
  const releaseRes = await fetch(
    `https://firebaserules.googleapis.com/v1/projects/${projectId}/releases/cloud.firestore`,
    {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ release: { name: `projects/${projectId}/releases/cloud.firestore`, rulesetName } }),
    }
  );
  const releaseData = await releaseRes.json();
  if (!releaseRes.ok) throw new Error('فشل تحديث release: ' + JSON.stringify(releaseData));

  console.log('تم نشر قواعد الأمان بنجاح ✅');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
