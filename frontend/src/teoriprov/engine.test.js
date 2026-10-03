import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import test from 'node:test';
import { generateExam, gradeExam, isCurrentExam } from './engine.js';

const require = createRequire(import.meta.url);
const bank = require('../../../backend/data/teoriprovQuestions.js');
const expectedCounts = { regler: 32, sakerhet: 16, fordon: 7, miljo: 5, personliga: 5 };
const byId = new Map(Object.values(bank).flat().map((question) => [question.id, question]));

test('each randomized attempt has exactly 65 scored questions with the requested distribution', () => {
  for (let attempt = 0; attempt < 20; attempt++) {
    const exam = generateExam(bank);
    assert.equal(exam.length, 65);
    assert.equal(new Set(exam.map((question) => question.id)).size, 65);
    assert.ok(exam.every((question) => question.isTrial === false));
    for (const [category, count] of Object.entries(expectedCounts)) {
      assert.equal(exam.filter((question) => question.category === category).length, count);
    }
    for (const question of exam) {
      const original = byId.get(question.id);
      assert.equal(question.options[question.correctIndex], original.options[original.correctIndex]);
    }
  }
});

test('all 65 questions count towards the score and the pass boundary is 52', () => {
  const exam = generateExam(bank);
  const correctAnswers = (count) => Object.fromEntries(exam.slice(0, count).map((question) => [question.id, question.correctIndex]));
  const perfect = gradeExam(exam, correctAnswers(65));
  assert.equal(perfect.score, 65);
  assert.equal(perfect.total, 65);
  assert.equal(perfect.scoredCount, 65);
  assert.equal(perfect.percentage, 100);
  assert.deepEqual(Object.fromEntries(Object.entries(perfect.categoryScores).map(([category, score]) => [category, score.total])), expectedCounts);
  assert.equal(gradeExam(exam, correctAnswers(52)).passed, true);
  assert.equal(gradeExam(exam, correctAnswers(51)).passed, false);
  assert.equal(gradeExam(exam, {}).score, 0);
});

test('an undersized category cannot silently produce an incomplete exam', () => {
  assert.throws(() => generateExam({ ...bank, regler: bank.regler.slice(0, 31) }), /Insufficient questions for regler/);
  assert.throws(() => generateExam({ ...bank, miljo: [] }), /Insufficient questions for miljo/);
});

test('saved attempts must match the current size, quotas, scoring, and unique questions', () => {
  const exam = generateExam(bank);
  assert.equal(isCurrentExam(exam), true);
  assert.equal(isCurrentExam(null), false);
  assert.equal(isCurrentExam([...exam, ...exam.slice(0, 5)]), false);
  assert.equal(isCurrentExam(exam.map((question, index) => index === 0 ? { ...question, isTrial: true } : question)), false);
  assert.equal(isCurrentExam(exam.map((question) => question.category === 'regler' ? { ...question, category: 'fordon' } : question)), false);
  assert.equal(isCurrentExam(exam.map((question, index) => index === 1 ? { ...question, id: exam[0].id } : question)), false);
});
