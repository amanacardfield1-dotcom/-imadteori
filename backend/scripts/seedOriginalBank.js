const path = require('node:path');
const { EDITION, questions } = require('../data/originalQuestionBank');
const { questionBankV2Groups } = require('../data/questionBankV2Groups');
const { validateBank, toFirestoreQuestion } = require('../data/validateOriginalBank');

async function main() {
  const report = validateBank(questions);
  console.log(JSON.stringify(report, null, 2));
  if (report.errors.length) throw new Error('Bank validation failed; nothing written.');
  if (process.argv.includes('--activate')) throw new Error('Replacement activation is disabled. Use --include for an additive release.');
  if (!process.argv.includes('--write') && !process.argv.includes('--include')) return;
  require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
  const admin = require('firebase-admin');
  const env = process.env;
  if (!env.FIREBASE_PROJECT_ID || !env.FIREBASE_CLIENT_EMAIL || !env.FIREBASE_PRIVATE_KEY) throw new Error('Firebase admin credentials unavailable.');
  if (env.FIREBASE_PROJECT_ID !== 'imadteori') throw new Error('Unexpected Firebase project; import refused.');
  const app = admin.initializeApp({ credential: admin.credential.cert({ projectId: env.FIREBASE_PROJECT_ID, clientEmail: env.FIREBASE_CLIENT_EMAIL, privateKey: env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') }) });
  try {
  const db = app.firestore();
  const settingsRef = db.doc('questionBankV2/settings');
  const editionRef = db.doc(`questionBankV2/editions/items/${EDITION}`);
  const now = new Date().toISOString();
  if (process.argv.includes('--write')) {
    const existing = await db.collection('questionBankV2/questions/items').where('edition', '==', EDITION).get();
    const previous = new Map(existing.docs.map((d) => [d.id, d.data()]));
    let batch = db.batch();
    let pending = 0;
    for (const q of questions) {
      const old = previous.get(q.id);
      batch.set(db.doc(`questionBankV2/questions/items/${q.id}`), {
        ...toFirestoreQuestion(q), updated_at: now,
        ...(old ? {} : { created_at: now, times_shown: 0, times_answered: 0, times_correct: 0, times_wrong: 0 }),
      }, { merge: true });
      if (++pending === 400) { await batch.commit(); batch = db.batch(); pending = 0; }
    }
    const previousEdition = await editionRef.get();
    batch.set(editionRef, { edition: EDITION, question_count: report.total, image_question_count: report.illustrated, category_counts: report.categories, checked_at: now, status: previousEdition.data()?.status === 'included' ? 'included' : 'staged' }, { merge: true });
    await batch.commit();
    console.log(`Staged ${report.total} questions; existing editions and attempts retained.`);
  }
  if (process.argv.includes('--include')) {
    // Verify the stored addition before enabling it alongside the legacy bank.
    const stored = await db.collection('questionBankV2/questions/items').where('edition', '==', EDITION).get();
    if (stored.size !== report.total) throw new Error('Incomplete stored edition.');
    for (const q of questions) {
      const storedQuestion = stored.docs.find((d) => d.id === q.id)?.data();
      if (!storedQuestion || JSON.stringify(toFirestoreQuestion(q)) !== JSON.stringify(Object.fromEntries(Object.keys(toFirestoreQuestion(q)).map((key) => [key, storedQuestion[key]])))) {
        // Firestore object key order is not stable: use a structural comparison below.
        const { isDeepStrictEqual } = require('node:util');
        if (!storedQuestion || !isDeepStrictEqual(toFirestoreQuestion(q), Object.fromEntries(Object.keys(toFirestoreQuestion(q)).map((key) => [key, storedQuestion[key]])))) throw new Error(`Stored content differs: ${q.id}`);
      }
    }
    const allQuestions = await db.collection('questionBankV2/questions/items').get();
    await db.runTransaction(async (tx) => {
      const settings = await tx.get(settingsRef);
      const groups = await tx.getAll(...questionBankV2Groups.map((g) => db.doc(`questionBankV2/groups/items/${g.id}`)));
      const oldSettings = settings.exists ? settings.data() : {};
      const includedEditions = [...new Set([...(oldSettings.included_editions || []), oldSettings.active_edition, EDITION].filter(Boolean))];
      const counts = {};
      allQuestions.docs.forEach((d) => {
        const q = d.data();
        const checked = !q.edition || (q.review?.status === 'source_checked' && (!q.image_url || q.review?.visualStatus === 'checked'));
        if (q.status === 'active' && checked && (!q.edition || includedEditions.includes(q.edition))) counts[q.group_id] = (counts[q.group_id] || 0) + 1;
      });
      tx.set(db.doc(`questionBankV2/importRuns/items/original-${Date.now()}`), { mode: 'additive', edition: EDITION, imported_at: now, previous_settings: oldSettings, total: report.total, illustrated: report.illustrated });
      questionBankV2Groups.forEach((group, i) => {
        tx.set(groups[i].ref, {
          group_id: group.id, group_number: group.number, group_name: group.name, group_slug: group.slug,
          legacy_category: group.legacyCategory, question_count: counts[group.id] || 0, updated_at: now,
          ...(groups[i].exists ? {} : { active: true, weight: group.weight, description: group.description }),
        }, { merge: true });
      });
      tx.set(settingsRef, { active_bank_id: 'questionBankV2', active_edition: null, included_editions: includedEditions, bank_mode: 'additive', exam_question_count: 40, updated_at: now }, { merge: true });
      tx.set(editionRef, { status: 'included', included_at: now }, { merge: true });
    });
    console.log(`Included ${EDITION} alongside legacy questions; no existing questions removed.`);
  }
  } finally { await app.delete(); }
}
main().catch((error) => { console.error(error.message); process.exitCode = 1; });
