const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { questionBankV2Groups } = require('./questionBankV2Groups');
const { EDITION } = require('./originalQuestionBank');
const officialHosts = new Set(['data.riksdagen.se', 'www.riksdagen.se', 'www.transportstyrelsen.se', 'transportstyrelsen.se', 'www.trafikverket.se', 'polisen.se', 'www.naturvardsverket.se', 'www.elsakerhetsverket.se', 'trafik.stockholm']);
const normalize = (text) => String(text).normalize('NFKC').replace(/[\u064b-\u065f\u0670\u0640]/g, '').replace(/\s+/g, ' ').trim();

function validateBank(questions, { checkAssets = true } = {}) {
  const errors = [];
  const ids = new Set();
  const fingerprints = new Set();
  const totals = {};
  const groupTotals = {};
  let illustrated = 0;
  const hashes = new Set();
  for (const q of questions) {
    const fail = (message) => errors.push(`${q.id || 'missing-id'}: ${message}`);
    if (ids.has(q.id)) fail('duplicate ID');
    ids.add(q.id);
    const group = questionBankV2Groups.find((g) => g.id === q.groupId);
    if (!group || q.category !== group.legacyCategory) fail('invalid group/category');
    if (q.edition !== EDITION || q.authorship !== 'independent') fail('invalid edition/authorship');
    if (!q.text?.endsWith('؟') || q.text.length < 12 || !q.explanation || q.explanation.length < 60) fail('missing question/explanation');
    if (!Array.isArray(q.options) || q.options.length !== 4 || q.options.some((o) => !o?.trim()) || new Set(q.options.map(normalize)).size !== 4) fail('four distinct options required');
    if (!Number.isInteger(q.correctIndex) || q.correctIndex < 0 || q.correctIndex >= 4) fail('invalid answer key');
    const fingerprint = normalize(q.text) + JSON.stringify((q.options || []).map(normalize).sort()) + (q.imageUrl || '');
    if (fingerprints.has(fingerprint)) fail('duplicate question (option order ignored)');
    fingerprints.add(fingerprint);
    if (!q.concept?.subtopic) fail('missing concept');
    if (q.review?.status !== 'source_checked') fail('not source checked');
    if (!q.officialSources?.length) fail('missing official source');
    for (const source of q.officialSources || []) {
      try { if (!officialHosts.has(new URL(source.url).hostname) || !source.locator || !/^\d{4}-\d{2}-\d{2}$/.test(source.checkedAt)) fail('invalid source record'); }
      catch { fail('invalid source URL'); }
    }
    if (q.imageUrl) {
      illustrated++;
      if (q.imageUrl !== `/question-scenes/${q.id}.png` || !q.imageAlt || q.review.visualStatus !== 'checked') fail('invalid/unreviewed visual');
      if (checkAssets) {
        const file = path.resolve(__dirname, '../../frontend/public', q.imageUrl.slice(1));
        if (!fs.existsSync(file)) fail('missing image asset');
        else { const bytes = fs.readFileSync(file); if (bytes.toString('hex', 0, 8) !== '89504e470d0a1a0a') fail('not PNG'); hashes.add(crypto.createHash('sha256').update(bytes).digest('hex')); }
      }
    }
    totals[q.category] = (totals[q.category] || 0) + 1;
    groupTotals[q.groupId] = (groupTotals[q.groupId] || 0) + 1;
  }
  for (const group of questionBankV2Groups) if ((groupTotals[group.id] || 0) < 6) errors.push(`${group.id}: coverage below six questions`);
  for (const [category, count] of Object.entries({ regler: 32, sakerhet: 16, fordon: 7, miljo: 5, personliga: 5 })) if ((totals[category] || 0) < count) errors.push(`${category}: insufficient quota`);
  if (illustrated < 40) errors.push('fewer than forty illustrated questions');
  if (checkAssets && hashes.size !== illustrated) errors.push('duplicate image assets');
  return { edition: EDITION, total: questions.length, illustrated, categories: totals, groups: groupTotals, errors };
}

function toFirestoreQuestion(q) {
  return {
    question_id: q.id, bank_id: 'questionBankV2', edition: q.edition, legacy_category: q.category,
    group_id: q.groupId, concept_topic: q.concept.topic, concept_subtopic: q.concept.subtopic, concept_skill: q.concept.skill,
    question_text: q.text, question_type: 'single_choice',
    answers: q.options.map((text, i) => ({ id: String.fromCharCode(65 + i), text, correct: i === q.correctIndex })),
    correct_answer_ids: [String.fromCharCode(65 + q.correctIndex)], explanation: q.explanation,
    image_url: q.imageUrl || null, image_alt: q.imageAlt || '', visual_kind: q.visual?.kind || null,
    difficulty: q.difficulty, scenario_type: q.scenario ? 'scenario' : 'knowledge',
    status: 'active', authorship: q.authorship, official_sources: q.officialSources, review: q.review,
  };
}
module.exports = { validateBank, toFirestoreQuestion };
