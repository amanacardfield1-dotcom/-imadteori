// محرك توليد اختبار Teoriprov: يختار 70 سؤالًا عشوائيًا موزّعة على المجالات
// الخمسة الرسمية، يخلط ترتيب الأسئلة وترتيب خياراتها، ويحدد 5 أسئلة تجريبية
// غير محتسبة بشكل عشوائي وخفي عن المستخدم — تمامًا كآلية الاختبار الحقيقي.

export const CATEGORY_COUNTS = { regler: 20, sakerhet: 16, fordon: 14, miljo: 10, personliga: 10 };
export const TOTAL_QUESTIONS = 70;
export const TRIAL_COUNT = 5;
export const TOTAL_SCORED = 65;
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

/**
 * bankByCategory: { regler: [...], sakerhet: [...], ... } من بنك Firestore.
 * recentIds: مجموعة معرفات الأسئلة المستخدمة في آخر محاولة (لتفادي تكرارها قدر الإمكان).
 */
export function generateExam(bankByCategory, recentIds = new Set()) {
  let selected = [];

  for (const [cat, count] of Object.entries(CATEGORY_COUNTS)) {
    const pool = bankByCategory[cat] || [];
    const fresh = pool.filter((q) => !recentIds.has(q.id));
    const usable = fresh.length >= count ? fresh : pool; // fallback إن كان البنك صغيرًا جدًا
    selected.push(...shuffle(usable).slice(0, count));
  }

  selected = shuffle(selected);

  const trialPositions = new Set(shuffle(selected.map((_, i) => i)).slice(0, TRIAL_COUNT));

  const exam = selected.map((q, i) => {
    const withFlag = q.options.map((text, idx) => ({ text, isCorrect: idx === q.correctIndex }));
    const shuffled = shuffle(withFlag);
    return {
      id: q.id,
      category: q.category,
      difficulty: q.difficulty,
      scenario: q.scenario,
      text: q.text,
      explanation: q.explanation,
      options: shuffled.map((o) => o.text),
      correctIndex: shuffled.findIndex((o) => o.isCorrect),
      isTrial: trialPositions.has(i),
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
