import { trafficSigns } from '../trafficSignsData.js';

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

const conciseOverrides = {
  C1: 'ممنوع دخول المركبات',
  C2: 'ممنوع حركة السير',
  C3: 'ممنوع مرور المركبات الآلية',
  C35: 'الركن Parkera ممنوع بعد الشاخصة',
  C36: 'الركن Parkera ممنوع في التاريخ الفردي',
  C37: 'الركن Parkera ممنوع في التاريخ الزوجي',
  C38: 'الركن حسب التاريخ Datumparkering',
  C39: 'نهاية منع الركن Parkera',
  E19: 'موقف سيارات Parkering',
  E20: 'بداية منطقة ذات قواعد خاصة',
  E21: 'نهاية منطقة ذات قواعد خاصة',
  E22: 'محطة حافلات',
  E23: 'موقف سيارات أجرة Taxi',
  E24: 'مستشفى',
  F1: 'لائحة تحديد الاتجاهات نحو وجهات مختلفة',
  F2: 'طريق مناسب عند منع الانعطاف يسارًا في التقاطع القادم',
  F3: 'معلومات تحضيرية عن تقاطع أو دوار قادم',
  F4: 'مسافة الوصول إلى مسار الخروج من الأوتوستراد',
  F5: 'تحديد الموقع والمسافة على طريق عام',
  F6: 'شاخصة إرشادية قريبة من التقاطع',
  F7: 'إرشادات بعد المخرج من الأوتوستراد أو الطريق السريع',
  F8: 'مسارات القيادة المناسبة للوصول إلى الوجهة',
  F9: 'طريق مشترك يؤدي إلى أكثر من وجهة',
  F10: 'اسم منطقة أو مكان على الطريق',
  F11: 'اسم الطريق أو الطريق الفرعي',
  F12: 'اسم مجرى أو جدول مائي',
  F13: 'المسافات بالكيلومترات إلى الوجهات',
  F14: 'رقم الطريق الذي تسلكه أو تصل إليه',
  F15: 'تحويل مروري بسبب إغلاق أو عائق على الطريق',
  F16: 'زيادة أو تفرع حقل القيادة',
  F17: 'تقليل أو دمج حقول القيادة',
  F18: 'توزيع حقول القيادة على مسافة قادمة',
  F19: 'طريق ينتهي بحقل تسارع',
  F20: 'طريق ينتهي بحقول قيادة منفصلة',
  F21: 'إرشادات حقول القيادة قبل تقاطع الطريق',
  F22: 'حدود دولية ضمن السوق الأوروبية المشتركة',
  F23: 'شاخصة إرشادية مؤقتة',
  F24: 'اتجاه السير أثناء التحويل المروري',
  F25: 'انتهاء حقل القيادة',
  F26: 'حقل قيادة مغلق أمامك',
  F27: 'رقم المخرج من طريق الأوتوستراد أو الطريق السريع',
  F28: 'موقف لركن العربات',
  F29: 'موقف للسيارة مع انتقال إلى قطار أو نقل مشترك',
  F30: 'طريق دائري محلي',
  F31: 'طريق مناسب لنوع مركبة أو مجموعة مستخدمين',
  F31a: 'مسار مناسب لقطارات المركبات الطويلة',
  F32: 'طريق مخصص للمركبات المحملة ببضائع خطرة',
  F33: 'مكان مخصص للإنقاذ أو الإغاثة',
  F34: 'شاخصة توجيه إلى طريق للمشاة أو الدراجات',
  F35: 'شاخصة جدولية للمشاة أو الدراجات',
  F36: 'اسم مدينة أو منطقة لتعيين الاتجاه',
  F37: 'شاخصة مسافة للمشاة أو الدراجات',
  F38: 'مسلك للدراجات الهوائية',
};

const preferredDistractorCodes = {
  B6: ['B7', 'B1', 'B2', 'B3'],
  B7: ['B6', 'B1', 'B2', 'B3'],
  C2: ['C1', 'C3', 'C4', 'C5'],
  C3: ['C2', 'C4', 'C5', 'C6'],
  C4: ['C3', 'C5', 'C6', 'C7'],
  C35: ['C36', 'C37', 'C38', 'C39'],
  C36: ['C35', 'C37', 'C38', 'C39'],
  C37: ['C35', 'C36', 'C38', 'C39'],
  C38: ['C35', 'C36', 'C37', 'C39'],
  C39: ['C35', 'C36', 'C37', 'C38'],
  E20: ['E21', 'E9', 'E10', 'E11', 'E19'],
  E21: ['E20', 'E9', 'E10', 'E11', 'E19'],
  F4: ['F5', 'F7', 'F13', 'F27'],
  F5: ['F4', 'F7', 'F10', 'F13'],
  F7: ['F4', 'F5', 'F8', 'F27'],
  F8: ['F16', 'F17', 'F18', 'F21'],
  F13: ['F5', 'F10', 'F11', 'F37'],
  F15: ['F23', 'F24', 'F25', 'F26'],
  F16: ['F17', 'F18', 'F21', 'F25'],
  F17: ['F16', 'F18', 'F21', 'F25'],
  F18: ['F16', 'F17', 'F21', 'F8'],
  F21: ['F16', 'F17', 'F18', 'F8'],
  F24: ['F15', 'F23', 'F25', 'F26'],
  F25: ['F16', 'F17', 'F24', 'F26'],
  F26: ['F15', 'F24', 'F25', 'F27'],
  F27: ['F4', 'F7', 'F25', 'F26'],
  F28: ['F29', 'E19', 'E20', 'F30'],
  F29: ['F28', 'E19', 'E20', 'F30'],
  F31: ['F31a', 'F32', 'F34', 'F38'],
  F31a: ['F31', 'F32', 'F34', 'F38'],
  F34: ['F35', 'F36', 'F37', 'F38'],
  F35: ['F34', 'F36', 'F37', 'F38'],
  F36: ['F34', 'F35', 'F37', 'F38'],
  F37: ['F34', 'F35', 'F36', 'F38'],
  F38: ['F34', 'F35', 'F36', 'F37'],
};

function stripLongParentheses(text) {
  return text.replace(/\s*\(([^)]*)\)/g, (_, inner) => {
    if (/Parkera|Stanna|Datum|P\b/.test(inner)) return ` ${inner}`;
    if (inner.length <= 12) return ` (${inner})`;
    return '';
  });
}

function compactOptionText(sign) {
  let text = conciseOverrides[sign.code] || sign.arabicName || '';
  text = normalizeText(stripLongParentheses(text));
  text = text
    .replace(/^تحذير\s+من\s+/, 'تحذير: ')
    .replace(/^منع\s+وقوف\s+المركبات/, 'ممنوع الركن Parkera')
    .replace(/^منع\s+حركة\s+/, 'ممنوع مرور ')
    .replace(/^منع\s+مرور\s+/, 'ممنوع مرور ')
    .replace(/\s+وذلك.*$/, '')
    .replace(/\s+ما لم.*$/, '')
    .replace(/\s+بحسب.*$/, (match) => (text.length > 70 ? '' : match));

  if (text.length > 82 && text.includes('،')) {
    text = text.split('،')[0];
  }
  if (text.length > 82 && text.includes(' - ')) {
    text = text.split(' - ')[0];
  }
  if (text.length > 92) {
    text = `${text.slice(0, 88).trim()}…`;
  }
  return normalizeText(text);
}

function questionTextFor(sign) {
  if (sign.category === 'A') return 'ماذا تحذر هذه الشاخصة؟';
  if (sign.category === 'B') return 'ماذا يسري عند هذه الشاخصة؟';
  if (sign.category === 'D') return 'ماذا توجب هذه الشاخصة؟';
  if (sign.category === 'T') return 'ماذا تعني اللوحة الإضافية؟';
  return 'ماذا تعني هذه الشاخصة؟';
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
  const preferred = (preferredDistractorCodes[sign.code] || [])
    .map((code) => signPool.find((item) => item.code === code))
    .filter(Boolean);
  const candidates = [
    ...shuffle(preferred),
    ...shuffle(sameCategory.filter((item) => item.code !== sign.code)),
    ...shuffle(signPool.filter((item) => item.category !== sign.category)),
  ];

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

function buildQuestion(sign) {
  const correctText = compactOptionText(sign);
  const options = buildOptions(correctText, pickDistractors(sign, compactOptionText));
  const correctIndex = options.findIndex((option) => option.correct);
  const meaning = normalizeText(sign.officialMeaning);
  const note = normalizeText(sign.trainingNote);

  return {
    id: `image-${sign.code.toLowerCase()}`,
    groupId: `sign-${sign.category}`,
    groupName: sign.categoryNameAr || 'الشاخصات المرورية',
    signCode: sign.code,
    text: questionTextFor(sign),
    imageUrl: sign.image,
    imageAlt: sign.imageAlt || sign.arabicName,
    options: options.map((option) => option.text),
    correctIndex,
    explanation: note ? `${meaning} ${note}` : meaning,
    difficulty: 'medium',
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
