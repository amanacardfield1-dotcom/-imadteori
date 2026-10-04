const test = require('node:test');
const assert = require('node:assert/strict');
const { questions, EDITION } = require('./originalQuestionBank');
const { validateBank, toFirestoreQuestion } = require('./validateOriginalBank');

test('first batch retains 156 valid questions and 52 distinct PNG assets', () => {
  const firstBatch = questions.filter((q) => q.id.startsWith('orig-g'));
  const report = validateBank(firstBatch);
  assert.deepEqual(report.errors, []);
  assert.equal(report.total, 156);
  assert.equal(report.illustrated, 52);
});
test('additive edition has all 26 groups, 208 questions and 78 distinct PNG assets', () => {
  const report = validateBank(questions);
  assert.deepEqual(report.errors, []);
  assert.equal(report.total, 208);
  assert.equal(report.illustrated, 78);
  assert.equal(Object.keys(report.groups).length, 26);
  assert.deepEqual(report.categories, { regler: 60, sakerhet: 50, fordon: 40, miljo: 30, personliga: 28 });
});
test('duplicate detection ignores option ordering', () => {
  const original = questions.find((q) => !q.imageUrl);
  const copy = { ...original, id: 'duplicate', options: [...original.options].reverse(), correctIndex: 3 };
  assert.ok(validateBank([...questions, copy], { checkAssets: false }).errors.some((e) => e.includes('duplicate question')));
});
test('missing source checks and fractional answer indices are rejected', () => {
  const copy = structuredClone(questions);
  copy[0].review.status = 'draft';
  copy[1].correctIndex = 0.5;
  copy[2].officialSources[0].url = 'https://example.com/';
  const errors = validateBank(copy, { checkAssets: false }).errors;
  assert.ok(errors.some((e) => e.includes('not source checked')));
  assert.ok(errors.some((e) => e.includes('invalid answer key')));
  assert.ok(errors.some((e) => e.includes('invalid source record')));
});
test('Firestore schema retains the exact key, edition and internal provenance', () => {
  for (const q of questions) {
    const row = toFirestoreQuestion(q);
    assert.equal(row.edition, EDITION);
    assert.equal(row.answers.filter((a) => a.correct).length, 1);
    assert.equal(row.answers.find((a) => a.correct).text, q.options[q.correctIndex]);
    assert.deepEqual(row.official_sources, q.officialSources);
    assert.equal(row.image_url, q.imageUrl || null);
  }
});
