import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { toCategoryBank, originalImageQuestions, toExamQuestion, isQuestionIncluded, mergeCategoryBanks } from './bankAdapters.js';
import { generatePracticeExam, gradePracticeExam } from './engine.js';
import { generateExam, gradeExam, CATEGORY_COUNTS } from '../teoriprov/engine.js';
import { generateImagePracticeExam, gradeImagePracticeExam, combinedImageQuestionBank, getImageQuestionBank } from '../imagePracticeExam/bank.js';
const require = createRequire(import.meta.url);
const { questions, EDITION } = require('../../../backend/data/originalQuestionBank.js');
const { questionBankV2Groups } = require('../../../backend/data/questionBankV2Groups.js');
const { toFirestoreQuestion } = require('../../../backend/data/validateOriginalBank.js');
const groups = questionBankV2Groups.map((g) => ({ id: g.id, group_name: g.name, group_number: g.number, weight: g.weight, active: true, legacy_category: g.legacyCategory }));
const bank = { groups, byGroup: Object.fromEntries(groups.map((g) => [g.id, questions.filter((q) => q.groupId === g.id).map(toFirestoreQuestion)])), settings: { active_edition: EDITION, exam_question_count: 40 } };
const canonical = new Map(questions.map((q) => [q.id, q]));

test('additive inclusion retains legacy rows, excludes staged editions and deduplicates IDs', () => {
  const legacy = { status: 'active', question_id: 'legacy-1' };
  const original = toFirestoreQuestion(questions[0]);
  assert.equal(isQuestionIncluded(legacy, {}), true);
  assert.equal(isQuestionIncluded(original, {}), false);
  assert.equal(isQuestionIncluded(original, { included_editions: [EDITION] }), true);
  assert.equal(isQuestionIncluded({ ...original, edition: 'future' }, { included_editions: [EDITION] }), false);
  assert.equal(isQuestionIncluded({ ...original, status: 'draft' }, { included_editions: [EDITION] }), false);
  const addition = toCategoryBank(bank, { editionsOnly: true });
  const existing = { regler: [{ id: 'legacy-1' }, addition.regler[0]] };
  const merged = mergeCategoryBanks(existing, addition);
  assert.equal(merged.regler.length, addition.regler.length + 1);
  assert.ok(merged.regler.some((q) => q.id === 'legacy-1'));
  const scenes = originalImageQuestions(bank);
  const combined = combinedImageQuestionBank(scenes);
  const old = getImageQuestionBank();
  assert.ok(old.every((q) => combined.some((item) => item.id === q.id)));
  assert.ok(scenes.every((q) => combined.some((item) => item.id === q.id)));
  assert.equal(new Set(combined.map((q) => q.id)).size, combined.length);
  assert.equal(combinedImageQuestionBank([...scenes, scenes[0]]).length, combined.length);
});
function assertCorrectKeys(exam) {
  for (const q of exam) {
    assert.equal(q.options[q.correctIndex], canonical.get(q.id).options[0]);
    assert.equal(Object.hasOwn(q, 'officialSources'), false);
    assert.equal(Object.hasOwn(q, 'official_sources'), false);
  }
}
test('100 simulation attempts keep all quotas, unique IDs, pictures and shuffled answer keys', () => {
  const byCategory = toCategoryBank(bank);
  const positions = new Set();
  let recent = new Set();
  for (let n = 0; n < 100; n++) {
    const exam = generateExam(byCategory, recent);
    assert.equal(exam.length, 65);
    assert.equal(new Set(exam.map((q) => q.id)).size, 65);
    for (const [category, count] of Object.entries(CATEGORY_COUNTS)) assert.equal(exam.filter((q) => q.category === category).length, count);
    assert.ok(exam.some((q) => q.imageUrl));
    assertCorrectKeys(exam);
    exam.forEach((q) => positions.add(q.correctIndex));
    const result = gradeExam(exam, Object.fromEntries(exam.map((q) => [q.id, q.correctIndex])));
    assert.equal(result.score, 65);
    recent = new Set(exam.map((q) => q.id));
  }
  assert.equal(positions.size, 4);
});
test('practice attempts have 40 unique questions and cover all 26 active groups', () => {
  for (let n = 0; n < 50; n++) {
    const exam = generatePracticeExam(bank);
    assert.equal(exam.questions.length, 40);
    assert.equal(new Set(exam.questions.map((q) => q.id)).size, 40);
    assert.equal(new Set(exam.questions.map((q) => q.groupId)).size, 26);
    assertCorrectKeys(exam.questions);
    assert.equal(gradePracticeExam(exam.questions, Object.fromEntries(exam.questions.map((q) => [q.id, q.correctIndex]))).score, 40);
  }
});
test('image attempts select 40 of 78 original scenes, no duplicated image and correct scoring', () => {
  const pool = originalImageQuestions(bank);
  assert.equal(pool.length, 78);
  let recent = new Set();
  for (let n = 0; n < 50; n++) {
    const exam = generateImagePracticeExam(recent, pool);
    assert.equal(exam.questions.length, 40);
    assert.equal(new Set(exam.questions.map((q) => q.imageUrl)).size, 40);
    assert.ok(exam.questions.every((q) => q.id.startsWith('orig-')));
    assertCorrectKeys(exam.questions);
    assert.equal(gradeImagePracticeExam(exam.questions, Object.fromEntries(exam.questions.map((q) => [q.id, q.correctIndex]))).score, 40);
    assert.equal(gradeImagePracticeExam(exam.questions, {}).unansweredCount, 40);
    recent = new Set(exam.questions.map((q) => q.id));
  }
  assert.throws(() => generateImagePracticeExam(new Set(), pool.slice(0, 39)), /Insufficient/);
  assert.throws(() => generateImagePracticeExam(new Set(), Array.from({ length: 40 }, () => pool[0])), /unique/);
});
test('practice redistributes quota overflow without returning an incomplete exam', () => {
  const skewed = { ...bank, settings: { ...bank.settings, group_weights: { 'group-01': 1000 } } };
  const exam = generatePracticeExam(skewed);
  assert.equal(exam.questions.length, 40);
  assert.equal(new Set(exam.questions.map((q) => q.id)).size, 40);
  assert.equal(exam.groupsRepresented, 26);
  const insufficient = { ...bank, groups: groups.slice(0, 2) };
  assert.throws(() => generatePracticeExam(insufficient), /Insufficient/);
});
test('adapters exclude drafts, withdrawn questions, multiple keys and unchecked visuals', () => {
  const row = toFirestoreQuestion(questions[0]);
  assert.equal(toExamQuestion({ ...row, status: 'review_required' }), null);
  assert.equal(toExamQuestion({ ...row, review: { ...row.review, status: 'draft' } }), null);
  assert.equal(toExamQuestion({ ...row, review: { ...row.review, visualStatus: 'pending' } }), null);
  assert.equal(toExamQuestion({ ...row, answers: row.answers.map((a) => ({ ...a, correct: true })) }), null);
  const inactive = { ...bank, groups: groups.map((g, i) => ({ ...g, active: i !== 0 })) };
  assert.equal(originalImageQuestions(inactive).length, 75);
});
