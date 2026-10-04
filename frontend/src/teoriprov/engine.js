// Generate 65 scored questions with fixed category quotas and shuffled options.

export const CATEGORY_COUNTS = { regler: 32, sakerhet: 16, fordon: 7, miljo: 5, personliga: 5 };
export const TOTAL_QUESTIONS = 65;
export const TOTAL_SCORED = TOTAL_QUESTIONS;
export const PASS_SCORE = 52;
export const EXAM_SECONDS = 50 * 60;

export const CATEGORY_LABELS = {
  regler: 'قواعد المرور',
  sakerhet: 'السلامة المرورية',
  fordon: 'معرفة المركبة',
  miljo: 'البيئة',
  personliga: 'العوامل الشخصية',
};

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function isCurrentExam(exam) {
  return Array.isArray(exam)
    && exam.length === TOTAL_QUESTIONS
    && exam.every((q) => q && !q.isTrial)
    && new Set(exam.map((q) => q.id)).size === TOTAL_QUESTIONS
    && Object.entries(CATEGORY_COUNTS).every(([category, count]) => (
      exam.filter((q) => q.category === category).length === count
    ));
}

/**
 * bankByCategory: { regler: [...], sakerhet: [...], ... } من بنك Firestore.
 * recentIds: مجموعة معرفات الأسئلة المستخدمة في آخر محاولة (لتفادي تكرارها قدر الإمكان).
 */
export function generateExam(bankByCategory, recentIds = new Set()) {
  let selected = [];

  for (const [cat, count] of Object.entries(CATEGORY_COUNTS)) {
    const pool = bankByCategory[cat] || [];
    if (pool.length < count) {
      throw new Error(`Insufficient questions for ${cat}: need ${count}, found ${pool.length}`);
    }
    const fresh = pool.filter((q) => !recentIds.has(q.id));
    const usable = fresh.length >= count ? fresh : pool; // fallback إن كان البنك صغيرًا جدًا
    selected.push(...shuffle(usable).slice(0, count));
  }

  selected = shuffle(selected);

  const exam = selected.map((q) => {
    const withFlag = q.options.map((text, idx) => ({ text, isCorrect: idx === q.correctIndex }));
    const shuffled = shuffle(withFlag);
    return {
      id: q.id,
      ...(q.edition ? { edition: q.edition } : {}),
      category: q.category,
      difficulty: q.difficulty,
      scenario: q.scenario,
      text: q.text,
      explanation: q.explanation,
      ...(q.imageUrl ? { imageUrl: q.imageUrl, imageAlt: q.imageAlt || '' } : {}),
      options: shuffled.map((o) => o.text),
      correctIndex: shuffled.findIndex((o) => o.isCorrect),
      isTrial: false,
    };
  });

  return exam;
}

export function gradeExam(exam, answers) {
  const scored = exam.filter((q) => !q.isTrial);
  const categoryScores = {};
  Object.keys(CATEGORY_COUNTS).forEach((cat) => {
    categoryScores[cat] = { correct: 0, total: 0 };
  });

  let correctCount = 0;
  const questionsResult = exam.map((q) => {
    const selectedIndex = typeof answers[q.id] === 'number' ? answers[q.id] : null;
    const isCorrect = selectedIndex === q.correctIndex;
    if (!q.isTrial) {
      categoryScores[q.category].total += 1;
      if (isCorrect) {
        categoryScores[q.category].correct += 1;
        correctCount += 1;
      }
    }
    return { ...q, selectedIndex, isCorrect };
  });

  return {
    score: correctCount,
    total: TOTAL_SCORED,
    passed: correctCount >= PASS_SCORE,
    percentage: Math.round((correctCount / TOTAL_SCORED) * 100),
    categoryScores,
    questions: questionsResult,
    scoredCount: scored.length,
  };
}
