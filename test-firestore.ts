import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";

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
const db = getFirestore(app);

async function run() {
  try {
    const snap = await getDocs(collection(db, "jobAds"));
    console.log("Docs found:", snap.docs.length);
    snap.docs.forEach(d => console.log(d.id, d.data().type));
  } catch (e: any) {
    console.error(e.message);
  }
}
run();
