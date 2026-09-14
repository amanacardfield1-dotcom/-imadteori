import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  getDocs,
  query,
  where,
  addDoc,
} from 'firebase/firestore';
import { auth, db } from './firebase';

function friendlyAuthError(err) {
  const map = {
    'auth/email-already-in-use': 'يوجد حساب مسجل بهذا البريد الإلكتروني بالفعل.',
    'auth/invalid-email': 'البريد الإلكتروني غير صالح.',
    'auth/weak-password': 'يجب أن تتكون كلمة المرور من 6 أحرف على الأقل.',
    'auth/invalid-credential': 'البريد الإلكتروني أو كلمة المرور غير صحيحة.',
    'auth/user-not-found': 'البريد الإلكتروني أو كلمة المرور غير صحيحة.',
    'auth/wrong-password': 'البريد الإلكتروني أو كلمة المرور غير صحيحة.',
  };
  return new Error(map[err.code] || 'حدث خطأ غير متوقع، حاول مرة أخرى.');
}

export const api = {
  async register(name, email, password) {
    let cred;
    try {
      cred = await createUserWithEmailAndPassword(auth, email, password);
    } catch (err) {
      throw friendlyAuthError(err);
    }
    await setDoc(doc(db, 'users', cred.user.uid), {
      name,
      email,
      role: 'trainee',
      status: 'pending',
      createdAt: new Date().toISOString(),
    });
    await signOut(auth);
  },

  async login(email, password) {
    let cred;
    try {
      cred = await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      throw friendlyAuthError(err);
    }
    const profile = await api.getProfile(cred.user.uid);
    return profile;
  },

  logout() {
    return signOut(auth);
  },

  async getProfile(uid) {
    const snap = await getDoc(doc(db, 'users', uid));
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() };
  },

  async getTests() {
    const snap = await getDocs(collection(db, 'tests'));
    return snap.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }))
      .map((t) => ({ id: t.id, title: t.title, description: t.description, questionCount: t.questions.length }));
  },

  async getTest(id) {
    const snap = await getDoc(doc(db, 'tests', id));
    if (!snap.exists()) throw new Error('الاختبار غير موجود.');
    return { id: snap.id, ...snap.data() };
  },

  async submitTest(uid, test, answers) {
    let score = 0;
    const questions = test.questions.map((q) => {
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

    await addDoc(collection(db, 'results'), {
      userId: uid,
      testId: test.id,
      testTitle: test.title,
      score,
      total: test.questions.length,
      takenAt: new Date().toISOString(),
    });

    return { score, total: test.questions.length, questions };
  },

  async getMyResults(uid) {
    const q = query(collection(db, 'results'), where('userId', '==', uid));
    const snap = await getDocs(q);
    return snap.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .sort((a, b) => new Date(b.takenAt) - new Date(a.takenAt));
  },

  async getAllUsers() {
    const snap = await getDocs(collection(db, 'users'));
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  },

  approveUser(id) {
    return updateDoc(doc(db, 'users', id), { status: 'approved' });
  },

  rejectUser(id) {
    return updateDoc(doc(db, 'users', id), { status: 'rejected' });
  },
};
