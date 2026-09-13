const admin = require('firebase-admin');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      // Vercel env vars store literal "\n" — convert back to real newlines.
      privateKey: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
    }),
  });
}

const db = admin.firestore();
const usersCol = db.collection('users');
const resultsCol = db.collection('results');

function docToObj(doc) {
  return { id: doc.id, ...doc.data() };
}

module.exports = {
  getUsers: async () => {
    const snap = await usersCol.get();
    return snap.docs.map(docToObj);
  },
  getResults: async () => {
    const snap = await resultsCol.get();
    return snap.docs.map(docToObj);
  },
  addUser: async (user) => {
    const { id, ...data } = user;
    await usersCol.doc(id).set(data);
    return user;
  },
  updateUser: async (id, changes) => {
    const ref = usersCol.doc(id);
    const doc = await ref.get();
    if (!doc.exists) return null;
    await ref.update(changes);
    return docToObj(await ref.get());
  },
  findUserByEmail: async (email) => {
    const snap = await usersCol.where('email', '==', email).limit(1).get();
    if (!snap.empty) return docToObj(snap.docs[0]);
    // Emails are stored as given; fall back to a case-insensitive scan for
    // older/mixed-case entries.
    const all = await usersCol.get();
    const match = all.docs.find((d) => d.data().email.toLowerCase() === email.toLowerCase());
    return match ? docToObj(match) : undefined;
  },
  findUserById: async (id) => {
    const doc = await usersCol.doc(id).get();
    return doc.exists ? docToObj(doc) : undefined;
  },
  getPendingUsers: async () => {
    const snap = await usersCol.where('status', '==', 'pending').get();
    return snap.docs.map(docToObj);
  },
  addResult: async (result) => {
    const { id, ...data } = result;
    await resultsCol.doc(id).set(data);
    return result;
  },
  getResultsByUser: async (userId) => {
    const snap = await resultsCol.where('userId', '==', userId).get();
    return snap.docs.map(docToObj);
  },
};
