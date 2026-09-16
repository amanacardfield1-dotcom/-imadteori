import { trafficSigns } from '../trafficSignsData';

export const IMAGE_EXAM_QUESTION_COUNT = 40;

const INCLUDED_CATEGORIES = new Set(['A', 'B', 'C', 'D', 'E', 'F', 'G', 'T']);

function shuffle(items) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function normalizeText(value) {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

function firstMeaningSentence(sign) {
  const meaning = normalizeText(sign.officialMeaning);
  const [first] = meaning.split(/[.!؟]/);
  return normalizeText(first || meaning || sign.arabicName);
}

const signPool = trafficSigns
  .filter((sign) => (
    INCLUDED_CATEGORIES.has(sign.category)
    && sign.image
    && sign.arabicName
    && sign.officialMeaning
  ))
  .map((sign, index) => ({ ...sign, bankOrder: index }));

const signsByCategory = signPool.reduce((acc, sign) => {
  if (!acc[sign.category]) acc[sign.category] = [];
  acc[sign.category].push(sign);
  return acc;
}, {});

function pickDistractors(sign, textGetter, count = 3) {
  const correct = textGetter(sign);
  const sameCategory = signsByCategory[sign.category] || [];
  const candidates = shuffle([
    ...sameCategory.filter((item) => item.code !== sign.code),
    ...signPool.filter((item) => item.category !== sign.category),
  ]);

  const seen = new Set([correct]);
  const result = [];
  for (const candidate of candidates) {
    const text = textGetter(candidate);
    if (!text || seen.has(text)) continue;
    seen.add(text);
    result.push(text);
    if (result.length === count) break;
  }
  return result;
}

function buildOptions(correctText, distractors) {
  return shuffle([
    { text: correctText, correct: true },
    ...distractors.map((text) => ({ text, correct: false })),
  ]);
}

function questionKindFor(sign) {
  const codeSum = String(sign.code)
    .split('')
    .reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return codeSum % 2 === 0 ? 'meaning' : 'use';
}

function buildQuestion(sign) {
  const kind = questionKindFor(sign);
  const correctText = kind === 'meaning' ? sign.arabicName : firstMeaningSentence(sign);
  const textGetter = kind === 'meaning' ? (item) => item.arabicName : firstMeaningSentence;
  const options = buildOptions(correctText, pickDistractors(sign, textGetter));
  const correctIndex = options.findIndex((option) => option.correct);
  const meaning = normalizeText(sign.officialMeaning);
  const note = normalizeText(sign.trainingNote);

  return {
    id: `image-${sign.code.toLowerCase()}-${kind}`,
    groupId: `sign-${sign.category}`,
    groupName: sign.categoryNameAr || 'الشاخصات المرورية',
    signCode: sign.code,
    text: kind === 'meaning'
      ? 'ما المعنى الأدق للشاخصة الظاهرة في الصورة؟'
      : 'أي توقع أو تصرف يطابق هذه الشاخصة بشكل أدق؟',
    imageUrl: sign.image,
    imageAlt: sign.imageAlt || sign.arabicName,
    options: options.map((option) => option.text),
    correctIndex,
    explanation: note ? `${meaning} ${note}` : meaning,
    difficulty: kind === 'meaning' ? 'medium' : 'hard',
  };
}

export function getImageQuestionBank() {
  return signPool.map(buildQuestion);
}

export function getImageQuestionBankStats() {
  const groups = new Set(signPool.map((sign) => sign.category));
  return {
    total: signPool.length,
    groups: groups.size,
  };
}

export function getLastImageExamQuestionIds(uid) {
  try {
    const raw = localStorage.getItem(`imagePracticeExam:last:${uid}`);
    const ids = raw ? JSON.parse(raw) : [];
    return new Set(Array.isArray(ids) ? ids : []);
  } catch {
    return new Set();
  }
}

export function saveImageExamAttempt(user, result, durationUsedSeconds) {
  try {
    const takenAt = new Date().toISOString();
    const key = `imagePracticeExam:attempts:${user.uid}`;
    const existing = JSON.parse(localStorage.getItem(key) || '[]');
    const attempt = {
      id: `image-attempt-${Date.now()}`,
      userId: user.uid,
      takenAt,
      durationUsedSeconds,
      score: result.score,
      total: result.total,
      percentage: result.percentage,
      passed: result.passed,
      questions: result.questions.map((q) => ({
        id: q.id,
        signCode: q.signCode,
        selectedIndex: q.selectedIndex,
        isCorrect: q.isCorrect,
      })),
    };
    localStorage.setItem(key, JSON.stringify([attempt, ...existing].slice(0, 20)));
    localStorage.setItem(
      `imagePracticeExam:last:${user.uid}`,
      JSON.stringify(result.questions.map((q) => q.id)),
    );
  } catch {
    /* التخزين المحلي اختياري ولا يجب أن يمنع ظهور النتيجة. */
  }
}

export function generateImagePracticeExam(recentIds = new Set()) {
  const bank = getImageQuestionBank();
  const fresh = shuffle(bank.filter((question) => !recentIds.has(question.id)));
  const repeated = shuffle(bank.filter((question) => recentIds.has(question.id)));
  const selected = [...fresh, ...repeated].slice(0, IMAGE_EXAM_QUESTION_COUNT);

  return {
    questions: selected.map((question, index) => ({ ...question, questionOrder: index + 1 })),
    totalQuestions: selected.length,
    bankSize: bank.length,
  };
}

export function gradeImagePracticeExam(examQuestions, answers) {
  let correct = 0;
  const categoryScores = {};
  const gradedQuestions = examQuestions.map((question) => {
    const selectedIndex = answers[question.id] ?? null;
    const isCorrect = selectedIndex !== null && selectedIndex === question.correctIndex;
    if (isCorrect) correct += 1;
    if (!categoryScores[question.groupId]) categoryScores[question.groupId] = { correct: 0, total: 0 };
    categoryScores[question.groupId].total += 1;
    if (isCorrect) categoryScores[question.groupId].correct += 1;
    return { ...question, selectedIndex, isCorrect };
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
    unansweredCount: gradedQuestions.filter((question) => question.selectedIndex === null).length,
    incorrectCount: gradedQuestions.filter((question) => question.selectedIndex !== null && !question.isCorrect).length,
  };
}
