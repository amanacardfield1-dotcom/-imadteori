const express = require('express');
const { nanoid } = require('nanoid');
const { tests } = require('../../data/questions');
const db = require('../db');
const { requireAuth, requireApproved } = require('../middleware/auth');

const router = express.Router();

// Every test route requires an approved account — content is gated until
// عماد (the platform owner) approves the trainee's registration.
router.use(requireAuth, requireApproved);

// List all tests without revealing answers.
router.get('/', (req, res) => {
  const summary = tests.map((t) => ({
    id: t.id,
    title: t.title,
    description: t.description,
    questionCount: t.questions.length,
  }));
  res.json(summary);
});

// Get one test's questions without correct answers/explanations.
router.get('/:id', (req, res) => {
  const test = tests.find((t) => t.id === req.params.id);
  if (!test) {
    return res.status(404).json({ error: 'الاختبار غير موجود.' });
  }
  const questions = test.questions.map((q) => ({ id: q.id, text: q.text, options: q.options }));
  res.json({ id: test.id, title: test.title, description: test.description, questions });
});

// Submit answers, grade server-side, and store the result for this trainee.
router.post('/:id/submit', async (req, res) => {
  const test = tests.find((t) => t.id === req.params.id);
  if (!test) {
    return res.status(404).json({ error: 'الاختبار غير موجود.' });
  }

  const { answers } = req.body || {}; // { [questionId]: selectedIndex }
  if (!answers || typeof answers !== 'object') {
    return res.status(400).json({ error: 'يجب إرسال إجابات الاختبار.' });
  }

  let score = 0;
  const detailed = test.questions.map((q) => {
    const selected = answers[q.id];
    const isCorrect = selected === q.correctIndex;
    if (isCorrect) score += 1;
    return {
      id: q.id,
      text: q.text,
      options: q.options,
      correctIndex: q.correctIndex,
      selectedIndex: typeof selected === 'number' ? selected : null,
      isCorrect,
      explanation: q.explanation,
    };
  });

  await db.addResult({
    id: nanoid(),
    testId: test.id,
    testTitle: test.title,
    score,
    total: test.questions.length,
    takenAt: new Date().toISOString(),
    userId: req.userId,
  });

  res.json({ score, total: test.questions.length, questions: detailed });
});

module.exports = router;
