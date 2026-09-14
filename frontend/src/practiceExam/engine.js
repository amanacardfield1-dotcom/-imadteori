// محرك توليد الاختبارات التدريبية الديناميكية من questionBankV2: يختار
// أسئلة موزّعة على المجموعات المعرفية الـ26 حسب أوزان قابلة للتعديل من
// الإدارة، مع تدوير تكيفي يُفضّل الأسئلة الأقل ظهورًا، وضمان تمثيل كل
// مجموعة نشطة على الأقل بسؤال واحد، ثم يخلط ترتيب الأسئلة وترتيب خياراتها.

export const DEFAULT_EXAM_QUESTION_COUNT = 40;
export const DEFAULT_DIFFICULTY_MIX = { easy: 0.25, medium: 0.5, hard: 0.25 };

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Weighted Random Selection: يوزّع عدد الأسئلة الكلي على المجموعات النشطة
// حسب أوزانها، مع ضمان Minimum Coverage (سؤال واحد على الأقل لكل مجموعة
// نشطة طالما عدد الأسئلة الكلي يسمح بذلك).
export function allocateWeightedCounts(groups, weights, total) {
  const active = groups.filter((g) => (weights[g.id] ?? g.weight ?? 0) > 0);
  if (active.length === 0) return {};
  const sum = active.reduce((acc, g) => acc + (weights[g.id] ?? g.weight ?? 0), 0) || 1;

  const raw = active.map((g) => {
    const w = weights[g.id] ?? g.weight ?? 0;
    const exact = (w / sum) * total;
    return { id: g.id, count: Math.max(0, Math.floor(exact)), remainder: exact % 1 };
  });

  // Minimum Coverage Rule: كل مجموعة نشطة تحصل على سؤال واحد على الأقل إذا
  // كان عدد الأسئلة الكلي يكفي لتغطية كل المجموعات.
  if (total >= active.length) {
    raw.forEach((item) => { if (item.count === 0) item.count = 1; });
  }

  let assigned = raw.reduce((acc, item) => acc + item.count, 0);
  const sorted = [...raw].sort((a, b) => b.remainder - a.remainder);
  let i = 0;
  while (assigned < total && sorted.length) {
    sorted[i % sorted.length].count += 1;
    assigned += 1;
    i += 1;
  }
  while (assigned > total) {
    const donor = raw.filter((r) => r.count > (total >= active.length ? 1 : 0)).sort((a, b) => a.remainder - b.remainder)[0];
    if (!donor) break;
    donor.count -= 1;
    assigned -= 1;
  }

  return Object.fromEntries(raw.map((item) => [item.id, item.count]));
}

// Adaptive Rotation: نرتب أسئلة كل مجموعة حسب "نقاط اختيار" تُفضّل الأسئلة
// الأقل ظهورًا (Low Exposure Bonus)، مع تجنّب أسئلة المحاولة السابقة قدر
// الإمكان (Previous Attempt Awareness)، ثم نأخذ العدد المطلوب.
function pickFromPool(pool, count, recentIds) {
  if (count <= 0 || pool.length === 0) return [];
  const scored = pool.map((q) => ({
    q,
    score: (1 / (1 + (q.times_shown || 0))) * (recentIds.has(q.question_id) ? 0.35 : 1) * (0.85 + Math.random() * 0.3),
  }));
  scored.sort((a, b) => b.score - a.score);
  const preferred = scored.slice(0, Math.max(count * 3, count)).map((s) => s.q);
  return shuffle(preferred).slice(0, count);
}

function toExamQuestion(question, position, groupNamesById) {
  const shuffledAnswers = shuffle(question.answers.map((a) => ({ ...a })));
  return {
    id: question.question_id,
    groupId: question.group_id,
    groupName: question.group_name || groupNamesById[question.group_id] || question.group_id,
    conceptTopic: question.concept_topic || '',
    difficulty: question.difficulty,
    scenario: question.scenario_type === 'scenario',
    text: question.question_text,
    imageUrl: question.image_url || null,
    imageAlt: question.image_alt || '',
    explanation: question.explanation,
    options: shuffledAnswers.map((a) => a.text),
    optionIds: shuffledAnswers.map((a) => a.id),
    correctIndex: shuffledAnswers.findIndex((a) => a.correct),
    questionOrder: position + 1,
  };
}

/**
 * bank: { groups: [{id, number, name, weight, active, question_count}],
 *         byGroup: { [groupId]: [questionDoc, ...] }, settings: {...} }
 * recentIds: Set من معرفات أسئلة آخر محاولة (لتقليل احتمال تكرارها)
 */
export function generatePracticeExam(bank, recentIds = new Set()) {
  const settings = bank.settings || {};
  const totalQuestions = settings.exam_question_count || DEFAULT_EXAM_QUESTION_COUNT;
  const weights = settings.group_weights || {};
  const activeGroups = (bank.groups || []).filter((g) => g.active !== false && (bank.byGroup[g.id] || []).length > 0);

  const counts = allocateWeightedCounts(activeGroups, weights, totalQuestions);
  const groupNamesById = Object.fromEntries((bank.groups || []).map((g) => [g.id, g.group_name]));

  let selected = [];
  activeGroups.forEach((g) => {
    const pool = (bank.byGroup[g.id] || []).filter((q) => q.status === 'active');
    selected.push(...pickFromPool(pool, counts[g.id] || 0, recentIds));
  });

  selected = shuffle(selected).slice(0, totalQuestions);
  const examQuestions = shuffle(selected).map((q, i) => toExamQuestion(q, i, groupNamesById));

  const coverage = {};
  examQuestions.forEach((q) => { coverage[q.groupId] = (coverage[q.groupId] || 0) + 1; });

  return {
    questions: examQuestions,
    totalQuestions: examQuestions.length,
    groupCoverage: coverage,
    groupsRepresented: Object.keys(coverage).length,
    groupsAvailable: activeGroups.length,
  };
}

export function gradePracticeExam(examQuestions, answers) {
  let correct = 0;
  const categoryScores = {};
  const gradedQuestions = examQuestions.map((q) => {
    const selectedIndex = answers[q.id] ?? null;
    const isCorrect = selectedIndex !== null && selectedIndex === q.correctIndex;
    if (isCorrect) correct += 1;
    if (!categoryScores[q.groupId]) categoryScores[q.groupId] = { correct: 0, total: 0 };
    categoryScores[q.groupId].total += 1;
    if (isCorrect) categoryScores[q.groupId].correct += 1;
    return { ...q, selectedIndex, isCorrect };
  });

  const total = examQuestions.length;
  const percentage = total ? Math.round((correct / total) * 100) : 0;
  return {
    questions: gradedQuestions,
    score: correct,
    total,
    percentage,
    passed: percentage >= 70,
    categoryScores,
    unansweredCount: gradedQuestions.filter((q) => q.selectedIndex === null).length,
    incorrectCount: gradedQuestions.filter((q) => q.selectedIndex !== null && !q.isCorrect).length,
  };
}
