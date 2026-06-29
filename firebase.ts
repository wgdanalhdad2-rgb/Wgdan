import { initializeApp } from "firebase/app";
import { getFirestore, initializeFirestore, collection, addDoc, getDocs, doc, deleteDoc, query, orderBy, getDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBQgw0DI-CHdaMUBOWrAEC7F--DrlpVNBE",
  authDomain: "abu-majd-vip.firebaseapp.com",
  projectId: "abu-majd-vip",
  storageBucket: "abu-majd-vip.firebasestorage.app",
  messagingSenderId: "1036169106035",
  appId: "1:1036169106035:web:60e2464a01add8eb859006",
  measurementId: "G-MLZ1JC7CDH"
};

const app = initializeApp(firebaseConfig);

// Use initializeFirestore with experimentalForceLongPolling to prevent hanging in Node.js container
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true
});

// Helper functions for jobs and market ads
export const jobsCollection = collection(db, "jobAds");
export const marketCollection = collection(db, "marketAds");
