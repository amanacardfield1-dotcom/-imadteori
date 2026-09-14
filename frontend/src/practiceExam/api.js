import {
  collection, getDocs, addDoc, doc, getDoc, setDoc, updateDoc,
  query, where, writeBatch, increment,
} from 'firebase/firestore';
import { db } from '../firebase';

let bankCache = null;

export function clearBankCache() {
  bankCache = null;
}

// يقرأ المجموعات الـ26 وكل الأسئلة النشطة من questionBankV2، ويبنيها في
// شكل جاهز لمحرك التوليد (bank.groups + bank.byGroup + bank.settings).
export async function fetchPracticeBank() {
  if (bankCache) return bankCache;

  const [groupsSnap, questionsSnap, settingsSnap] = await Promise.all([
    getDocs(collection(db, 'questionBankV2', 'groups', 'items')),
    getDocs(collection(db, 'questionBankV2', 'questions', 'items')),
    getDoc(doc(db, 'questionBankV2', 'settings')),
  ]);

  const groups = groupsSnap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .sort((a, b) => (a.group_number || 0) - (b.group_number || 0));

  const byGroup = {};
  groups.forEach((g) => { byGroup[g.id] = []; });
  questionsSnap.docs.forEach((d) => {
    const data = { question_id: d.id, ...d.data() };
    if (!byGroup[data.group_id]) byGroup[data.group_id] = [];
    byGroup[data.group_id].push(data);
  });

  bankCache = { groups, byGroup, settings: settingsSnap.exists() ? settingsSnap.data() : {} };
  return bankCache;
}

export async function getLastAttemptQuestionIds(uid) {
  const q = query(collection(db, 'practiceExamAttempts'), where('userId', '==', uid));
  try {
    const snap = await getDocs(q);
    if (snap.empty) return new Set();
    const latest = snap.docs
      .map((d) => d.data())
      .sort((a, b) => new Date(b.takenAt) - new Date(a.takenAt))[0];
    return new Set((latest.questions || []).map((q2) => q2.id));
  } catch {
    return new Set();
  }
}

export async function saveAttempt(user, result, durationUsedSeconds) {
  const takenAt = new Date();
  const startedAt = new Date(takenAt.getTime() - durationUsedSeconds * 1000);

  await addDoc(collection(db, 'practiceExamAttempts'), {
    userId: user.uid,
    userName: user.name || '',
    userEmail: user.email || '',
    startedAt: startedAt.toISOString(),
    takenAt: takenAt.toISOString(),
    durationUsedSeconds,
    score: result.score,
    total: result.total,
    percentage: result.percentage,
    passed: result.passed,
    unansweredCount: result.unansweredCount,
    incorrectCount: result.incorrectCount,
    categoryScores: result.categoryScores,
    questions: result.questions,
  });

  // Question Exposure Control: تحديث عدادات الظهور/الإجابة/الصحة لكل سؤال
  // ظهر في هذه المحاولة، دفعة واحدة.
  try {
    const batch = writeBatch(db);
    result.questions.forEach((q) => {
      const ref = doc(db, 'questionBankV2', 'questions', 'items', q.id);
      const data = { times_shown: increment(1) };
      if (q.selectedIndex !== null) {
        data.times_answered = increment(1);
        data[q.isCorrect ? 'times_correct' : 'times_wrong'] = increment(1);
      }
      batch.update(ref, data);
    });
    await batch.commit();
  } catch {
    // تحديث العدادات ثانوي؛ لا يجب أن يفشل حفظ نتيجة المتدرب بسببه.
  }
}

export async function getMyAttempts(uid) {
  const q = query(collection(db, 'practiceExamAttempts'), where('userId', '==', uid));
  const snap = await getDocs(q);
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .sort((a, b) => new Date(b.takenAt) - new Date(a.takenAt));
}

export async function getAttemptById(id) {
  const snap = await getDoc(doc(db, 'practiceExamAttempts', id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

// --- إدارة الإدارة (Admin) ---

export async function adminGetGroups() {
  const snap = await getDocs(collection(db, 'questionBankV2', 'groups', 'items'));
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .sort((a, b) => (a.group_number || 0) - (b.group_number || 0));
}

export async function adminGetQuestionsForGroup(groupId) {
  const q = query(collection(db, 'questionBankV2', 'questions', 'items'), where('group_id', '==', groupId));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function adminUpdateQuestion(questionId, patch) {
  await updateDoc(doc(db, 'questionBankV2', 'questions', 'items', questionId), {
    ...patch,
    updated_at: new Date().toISOString(),
  });
  clearBankCache();
}

export async function adminUpdateGroupWeight(groupId, weight) {
  await updateDoc(doc(db, 'questionBankV2', 'groups', 'items', groupId), { weight });
  const settingsRef = doc(db, 'questionBankV2', 'settings');
  const snap = await getDoc(settingsRef);
  const settings = snap.exists() ? snap.data() : {};
  const groupWeights = { ...(settings.group_weights || {}), [groupId]: weight };
  await setDoc(settingsRef, { ...settings, group_weights: groupWeights, updated_at: new Date().toISOString() }, { merge: true });
  clearBankCache();
}

export async function adminSetGroupActive(groupId, active) {
  await updateDoc(doc(db, 'questionBankV2', 'groups', 'items', groupId), { active });
  clearBankCache();
}
