import axios from "axios";

const project_id = "abu-majd-vip";
const collection = "jobAds";
const url = `https://firestore.googleapis.com/v1/projects/${project_id}/databases/(default)/documents/${collection}`;

async function run() {
  try {
    const postData = {
      fields: {
        type: { stringValue: "employer" },
        name: { stringValue: "test user" }
      }
    };
    const res = await axios.post(url, postData);
    console.log("Created doc:", res.data.name);

    const res2 = await axios.get(url);
    console.log("Documents found:", res2.data.documents?.length);
  } catch (e: any) {
    console.error(e.message);
  }
}
run();
