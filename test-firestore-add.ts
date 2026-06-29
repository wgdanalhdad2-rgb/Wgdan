import { addDoc, collection } from "firebase/firestore";
import { db } from "./firebase";

async function run() {
  try {
    const docRef = await addDoc(collection(db, "testAds"), { test: 123 });
    console.log("Doc written", docRef.id);
  } catch (e: any) {
    console.error(e.message);
  }
}
run();
