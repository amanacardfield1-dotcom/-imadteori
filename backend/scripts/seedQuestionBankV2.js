// يبني ويرفع بنك الأسئلة الجديد (questionBankV2) إلى Firestore من ملفي:
//   backend/data/questionBankV2Groups.js    — 26 مجموعة معرفية حقيقية
//   backend/data/questionBankV2Questions.js — أسئلة أصلية مؤلَّفة بالكامل،
//     كل سؤال محمَّل مسبقًا بحقل groupId الصحيح (لا يوجد أي تعيين عشوائي
//     أو round-robin هنا — كل سؤال أُلِّف ورُبط بمجموعته الفعلية وقت الكتابة).
// Run: node backend/scripts/seedQuestionBankV2.js [--dry-run]

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const admin = require('firebase-admin');
const { questionBankV2Groups } = require('../data/questionBankV2Groups');
const questionModules = require('../data/questionBankV2Questions');

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
const now = () => new Date().toISOString();

async function commitChunks(writes) {
  const chunkSize = 400;
  for (let i = 0; i < writes.length; i += chunkSize) {
    const batch = db.batch();
    writes.slice(i, i + chunkSize).forEach(({ ref, data }) => batch.set(ref, data, { merge: true }));
    await batch.commit();
    console.log(`  committed ${Math.min(i + chunkSize, writes.length)} / ${writes.length}`);
  }
}

function validateQuestion(q) {
  const problems = [];
  if (!q.text || q.text.trim().length < 10) problems.push('missing/short text');
  if (!Array.isArray(q.options) || q.options.length !== 4) problems.push('must have exactly 4 options');
  if (typeof q.correctIndex !== 'number' || q.correctIndex < 0 || q.correctIndex > 3) problems.push('invalid correctIndex');
  if (!q.explanation) problems.push('missing explanation');
  if (!q.groupId) problems.push('missing groupId');
  if (!q.concept || !q.concept.topic) problems.push('missing concept record');
  return problems;
}

async function main() {
  const dryRun = process.argv.includes('--dry-run');
  const allQuestions = Object.values(questionModules).flat();
  const groupIds = new Set(questionBankV2Groups.map((g) => g.id));

  const answerIds = ['A', 'B', 'C', 'D'];
  const validated = [];
  const reviewRequired = [];
  const duplicateHashes = new Map();
  const duplicates = [];

  const normalize = (s) => String(s || '').trim().replace(/\s+/g, ' ').replace(/[؟?!.،,؛;]/g, '').toLowerCase();

  allQuestions.forEach((q) => {
    const problems = validateQuestion(q);
    if (!groupIds.has(q.groupId)) problems.push(`unknown groupId: ${q.groupId}`);

    const hash = normalize(q.text) + '|' + q.options.map(normalize).join('|');
    if (duplicateHashes.has(hash)) {
      duplicates.push({ id: q.id, duplicateOf: duplicateHashes.get(hash) });
      problems.push(`duplicate of ${duplicateHashes.get(hash)}`);
    } else {
      duplicateHashes.set(hash, q.id);
    }

    const status = problems.length ? 'review_required' : 'active';
    if (status === 'review_required') reviewRequired.push({ id: q.id, problems });

    const answers = q.options.map((text, i) => ({
      id: answerIds[i],
      text,
      correct: i === q.correctIndex,
    }));

    validated.push({
      question_id: q.id,
      bank_id: 'questionBankV2',
      group_id: q.groupId,
      concept_topic: q.concept?.topic || '',
      concept_subtopic: q.concept?.subtopic || '',
      concept_skill: q.concept?.skill || '',
      question_text: q.text,
      question_type: 'single_choice',
      image_url: q.imageUrl || null,
      image_alt: q.imageAlt || '',
      answers,
      correct_answer_ids: answers.filter((a) => a.correct).map((a) => a.id),
      explanation: q.explanation,
      difficulty: q.difficulty || 'medium',
      scenario_type: q.scenario ? 'scenario' : 'knowledge',
      status,
      source_basis: q.sourceBasis || '',
      originality_note: 'Original question authored via concept-extraction from a sampled review of sweden4.com structure, then independently written against Trafikverket/Transportstyrelsen sources; not copied or paraphrased from sweden4.com.',
      times_shown: 0,
      times_answered: 0,
      times_correct: 0,
      times_wrong: 0,
      created_at: now(),
      updated_at: now(),
    });
  });

  const questionsByGroup = validated.reduce((acc, q) => {
    acc[q.group_id] = (acc[q.group_id] || 0) + 1;
    return acc;
  }, {});

  const report = {
    import_run_id: `v2-${Date.now()}`,
    started_at: now(),
    completed_at: now(),
    source: 'original-authored-concept-extraction-sweden4-taxonomy',
    total_groups: questionBankV2Groups.length,
    total_questions_found: validated.length,
    imported: validated.filter((q) => q.status === 'active').length,
    duplicates: duplicates.length,
    review_required: reviewRequired.length,
    questions_by_group: questionsByGroup,
    duplicate_details: duplicates,
    review_required_details: reviewRequired,
  };

  console.log(JSON.stringify(report, null, 2));

  const missingCoverage = questionBankV2Groups.filter((g) => !questionsByGroup[g.id]);
  if (missingCoverage.length) {
    console.error('ERROR: groups with zero questions:', missingCoverage.map((g) => g.id));
    process.exit(1);
  }

  if (dryRun) {
    console.log('Dry run complete — no data written.');
    return;
  }

  const writes = [];
  questionBankV2Groups.forEach((group) => {
    writes.push({
      ref: db.collection('questionBankV2').doc('groups').collection('items').doc(group.id),
      data: {
        group_id: group.id,
        group_number: group.number,
        group_name: group.name,
        group_slug: group.slug,
        description: group.description,
        weight: group.weight,
        question_count: questionsByGroup[group.id] || 0,
        active: true,
        updated_at: now(),
      },
    });
  });

  writes.push({
    ref: db.collection('questionBankV2').doc('settings'),
    data: {
      active_bank_id: 'questionBankV2',
      exam_question_count: 40,
      difficulty_mix: { easy: 0.25, medium: 0.5, hard: 0.25 },
      group_weights: Object.fromEntries(questionBankV2Groups.map((g) => [g.id, g.weight])),
      min_coverage_groups: questionBankV2Groups.length,
      updated_at: now(),
    },
  });

  validated.forEach((q) => {
    const { question_id, ...data } = q;
    writes.push({
      ref: db.collection('questionBankV2').doc('questions').collection('items').doc(question_id),
      data,
    });
  });

  writes.push({
    ref: db.collection('questionBankV2').doc('importRuns').collection('items').doc(report.import_run_id),
    data: report,
  });

  console.log(`Writing ${writes.length} Firestore documents...`);
  await commitChunks(writes);
  console.log('questionBankV2 seed completed successfully.');
}

main().catch((err) => {
  console.error('Failed to seed questionBankV2:', err);
  process.exit(1);
});
