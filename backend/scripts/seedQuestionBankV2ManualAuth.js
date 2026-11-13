// Workaround seeder for questionBankV2 that bypasses firebase-admin's internal
// (system-clock-dependent) OAuth token minting. This sandbox's system clock runs
// ~8h ahead of real UTC, which makes every service-account JWT firebase-admin
// signs land outside Google's acceptable iat/exp window (invalid_grant). This
// script measures the real clock offset from Google's own Date response header,
// builds + signs the OAuth JWT-bearer assertion itself with corrected timestamps,
// exchanges it for a real access token, then writes via the Firestore REST API
// directly (same documents/paths/data the original seedQuestionBankV2.js writes).
//
// Run: node scripts/seedQuestionBankV2ManualAuth.js [--dry-run]

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const jwt = require('jsonwebtoken');
const { questionBankV2Groups } = require('../data/questionBankV2Groups');
const questionModules = require('../data/questionBankV2Questions');

const PROJECT_ID = process.env.FIREBASE_PROJECT_ID;
const CLIENT_EMAIL = process.env.FIREBASE_CLIENT_EMAIL;
const PRIVATE_KEY = (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n');

const now = () => new Date().toISOString();

async function getCorrectedAccessToken() {
  // Probe Google's real clock via the Date response header of a throwaway request.
  const probe = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', body: 'x=1' });
  const serverDate = new Date(probe.headers.get('date'));
  const localMs = Date.now();
  const offsetMs = serverDate.getTime() - localMs; // negative: local clock is ahead
  const correctedNowSec = Math.floor((localMs + offsetMs) / 1000);

  console.log(`Clock offset vs Google: ${(offsetMs / 3600000).toFixed(2)}h (local ${offsetMs < 0 ? 'ahead' : 'behind'})`);

  const assertion = jwt.sign(
    {
      iss: CLIENT_EMAIL,
      scope: 'https://www.googleapis.com/auth/datastore',
      aud: 'https://oauth2.googleapis.com/token',
      iat: correctedNowSec,
      exp: correctedNowSec + 3600,
    },
    PRIVATE_KEY,
    { algorithm: 'RS256' }
  );

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion,
    }),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(`Token exchange failed: ${JSON.stringify(body)}`);
  return body.access_token;
}

function toFirestoreValue(v) {
  if (v === null || v === undefined) return { nullValue: null };
  if (typeof v === 'boolean') return { booleanValue: v };
  if (typeof v === 'number') return Number.isInteger(v) ? { integerValue: String(v) } : { doubleValue: v };
  if (Array.isArray(v)) return { arrayValue: { values: v.map(toFirestoreValue) } };
  if (typeof v === 'object') {
    const fields = {};
    Object.entries(v).forEach(([k, val]) => {
      if (val !== undefined) fields[k] = toFirestoreValue(val);
    });
    return { mapValue: { fields } };
  }
  return { stringValue: String(v) };
}

function toFirestoreFields(data) {
  const fields = {};
  Object.entries(data).forEach(([k, v]) => {
    if (v !== undefined) fields[k] = toFirestoreValue(v);
  });
  return fields;
}

async function batchWrite(accessToken, writes) {
  const chunkSize = 400;
  for (let i = 0; i < writes.length; i += chunkSize) {
    const chunk = writes.slice(i, i + chunkSize);
    const res = await fetch(
      `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents:batchWrite`,
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          writes: chunk.map(({ docPath, data }) => ({
            update: {
              name: `projects/${PROJECT_ID}/databases/(default)/documents/${docPath}`,
              fields: toFirestoreFields(data),
            },
          })),
        }),
      }
    );
    const body = await res.json();
    if (!res.ok) throw new Error(`batchWrite failed: ${JSON.stringify(body)}`);
    const failed = (body.status || []).filter((s) => s && s.code);
    if (failed.length) throw new Error(`batchWrite had ${failed.length} failed writes: ${JSON.stringify(failed.slice(0, 3))}`);
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

  if (process.argv.includes('--test-auth')) {
    const token = await getCorrectedAccessToken();
    console.log('Auth OK, access token acquired:', token ? `${token.slice(0, 12)}...(len ${token.length})` : '(empty)');
    return;
  }

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

    const answers = q.options.map((text, i) => ({ id: answerIds[i], text, correct: i === q.correctIndex }));

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
      docPath: `questionBankV2/groups/items/${group.id}`,
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
    docPath: 'questionBankV2/settings',
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
    writes.push({ docPath: `questionBankV2/questions/items/${question_id}`, data });
  });

  writes.push({ docPath: `questionBankV2/importRuns/items/${report.import_run_id}`, data: report });

  console.log(`Obtaining corrected-clock access token...`);
  const accessToken = await getCorrectedAccessToken();

  console.log(`Writing ${writes.length} Firestore documents via REST batchWrite...`);
  await batchWrite(accessToken, writes);
  console.log('questionBankV2 seed completed successfully (manual-auth workaround).');
}

main().catch((err) => {
  console.error('Failed to seed questionBankV2:', err);
  process.exit(1);
});
