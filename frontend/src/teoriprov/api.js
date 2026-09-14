import { collection, getDocs, addDoc, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { CATEGORY_COUNTS } from './engine';

let bankCache = null;

export async function fetchBank() {
  if (bankCache) return bankCache;
  const snap = await getDocs(collection(db, 'teoriprovBank'));
  const byCategory = {};
  Object.keys(CATEGORY_COUNTS).forEach((cat) => (byCategory[cat] = []));
  snap.docs.forEach((d) => {
    const data = { id: d.id, ...d.data() };
    if (byCategory[data.category]) byCategory[data.category].push(data);
  });
  bankCache = byCategory;
  return byCategory;
}

export async function getLastAttemptQuestionIds(uid) {
  // استعلام بحقل مساواة واحد فقط (بدون orderBy) لتفادي الحاجة لفهرس Firestore
  // مركّب؛ الفرز على آخر محاولة يتم محليًا بعد الجلب.
  const q = query(collection(db, 'teoriprovAttempts'), where('userId', '==', uid));
  try {
    const snap = await getDocs(q);
    if (snap.empty) return new Set();
    const latest = snap.docs
      .map((d) => d.data())
      .sort((a, b) => new Date(b.takenAt) - new Date(a.takenAt))[0];
    return new Set(latest.usedQuestionIds || []);
  } catch {
    return new Set();
  }
}

export async function saveAttempt(uid, result, durationUsedSeconds) {
  await addDoc(collection(db, 'teoriprovAttempts'), {
    userId: uid,
    takenAt: new Date().toISOString(),
    durationUsedSeconds,
    score: result.score,
    totalScored: result.total,
    passed: result.passed,
    percentage: result.percentage,
    categoryScores: result.categoryScores,
    questions: result.questions,
    usedQuestionIds: result.questions.map((q) => q.id),
  });
}

export async function getMyAttempts(uid) {
  const q = query(collection(db, 'teoriprovAttempts'), where('userId', '==', uid));
  const snap = await getDocs(q);
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .sort((a, b) => new Date(b.takenAt) - new Date(a.takenAt));
}
