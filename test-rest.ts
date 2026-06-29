import axios from "axios";

const project_id = "abu-majd-vip";
const collection = "jobAds";
const url = `https://firestore.googleapis.com/v1/projects/${project_id}/databases/(default)/documents/${collection}`;

async function run() {
  try {
    const res = await axios.get(url);
    console.log("Documents found:", res.data.documents?.length);
  } catch (e: any) {
    console.error(e.message);
  }
}
run();
