import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyBckD1zI7xuArE2RT-Ap44N-1k8WxxMR50',
  authDomain: 'imadteori.firebaseapp.com',
  projectId: 'imadteori',
  storageBucket: 'imadteori.firebasestorage.app',
  messagingSenderId: '404600328615',
  appId: '1:404600328615:web:1fc3a3679cfcc59ec22682',
  measurementId: 'G-F202CC4GYF',
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
