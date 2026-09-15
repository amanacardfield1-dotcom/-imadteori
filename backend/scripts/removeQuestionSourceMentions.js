// يزيل حقول وعبارات المصادر من بنوك الأسئلة والمحاولات المحفوظة.
// التشغيل:
//   node backend/scripts/removeQuestionSourceMentions.js --dry-run
//   node backend/scripts/removeQuestionSourceMentions.js

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const admin = require('firebase-admin');

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
const DELETE = admin.firestore.FieldValue.delete();
const dryRun = process.argv.includes('--dry-run');

const SOURCE_FIELDS = new Set([
  'source',
  'sources',
  'source_basis',
  'sourceBasis',
  'source_url',
  'sourceUrl',
  'reference',
  'references',
  'originality_note',
  'originalityNote',
]);

function cleanText(value) {
  if (typeof value !== 'string') return value;
  return value
    .replace(/وفق\s+(?:Transportstyrelsen|Trafikverket)\s*،?\s*/gi, '')
    .replace(/\b(?:Transportstyrelsen|Trafikverket|Sweden4\.com|sweden4\.com|Sweden4)\b/gi, '')
    .replace(/\s+([،.؟])/g, '$1')
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function cleanValue(value) {
  if (typeof value === 'string') return cleanText(value);
  if (Array.isArray(value)) return value.map(cleanValue);
  if (!value || typeof value !== 'object' || value instanceof Date) return value;

  const cleaned = {};
  Object.entries(value).forEach(([key, nestedValue]) => {
    if (SOURCE_FIELDS.has(key)) return;
    cleaned[key] = cleanValue(nestedValue);
  });
  return cleaned;
}

function buildPatch(data) {
  const patch = {};
  Object.entries(data).forEach(([key, value]) => {
    if (SOURCE_FIELDS.has(key)) {
      patch[key] = DELETE;
      return;
    }
    const cleaned = cleanValue(value);
    if (JSON.stringify(cleaned) !== JSON.stringify(value)) patch[key] = cleaned;
  });
  return patch;
}

async function commitPatches(patches) {
  const chunkSize = 400;
  for (let i = 0; i < patches.length; i += chunkSize) {
    const batch = db.batch();
    patches.slice(i, i + chunkSize).forEach(({ ref, patch }) => batch.update(ref, patch));
    await batch.commit();
    console.log(`  committed ${Math.min(i + chunkSize, patches.length)} / ${patches.length}`);
  }
}

async function scanCollection(label, collectionRef) {
  const snap = await collectionRef.get();
  const patches = [];
  snap.docs.forEach((doc) => {
    const patch = buildPatch(doc.data());
    if (Object.keys(patch).length) patches.push({ ref: doc.ref, id: doc.id, patch });
  });

  console.log(`${label}: ${patches.length} / ${snap.size} documents need cleanup`);
  if (patches.length) console.log(`  sample ids: ${patches.slice(0, 8).map((p) => p.id).join(', ')}`);
  if (!dryRun && patches.length) await commitPatches(patches);
  return patches.length;
}

async function main() {
  const targets = [
    ['tests', db.collection('tests')],
    ['teoriprovBank', db.collection('teoriprovBank')],
    ['teoriprovAttempts', db.collection('teoriprovAttempts')],
    ['practiceExamAttempts', db.collection('practiceExamAttempts')],
    ['questionBankV2/groups/items', db.collection('questionBankV2').doc('groups').collection('items')],
    ['questionBankV2/questions/items', db.collection('questionBankV2').doc('questions').collection('items')],
    ['questionBankV2/importRuns/items', db.collection('questionBankV2').doc('importRuns').collection('items')],
  ];

  let total = 0;
  for (const [label, ref] of targets) total += await scanCollection(label, ref);
  console.log(`${dryRun ? 'Dry run' : 'Cleanup'} complete. Updated documents: ${dryRun ? 0 : total}. Matched documents: ${total}.`);
}

main().catch((err) => {
  console.error('Failed to remove source mentions:', err);
  process.exit(1);
});
