import axios from "axios";

const project_id = "abu-majd-vip";
const collection = "jobAds";
const baseUrl = `https://firestore.googleapis.com/v1/projects/${project_id}/databases/(default)/documents`;

const mapToFirestore = (obj: any) => {
  const fields: any = {};
  for (const [key, val] of Object.entries(obj)) {
    if (typeof val === 'string') fields[key] = { stringValue: val };
    else if (typeof val === 'number') fields[key] = { integerValue: val };
    else if (typeof val === 'boolean') fields[key] = { booleanValue: val };
    else if (val === null || val === undefined) fields[key] = { nullValue: null };
  }
  return { fields };
};

const mapFromFirestore = (doc: any) => {
  const obj: any = { id: doc.name.split('/').pop() };
  if (!doc.fields) return obj;
  for (const [key, val] of Object.entries(doc.fields)) {
    if ((val as any).stringValue !== undefined) obj[key] = (val as any).stringValue;
    else if ((val as any).integerValue !== undefined) obj[key] = Number((val as any).integerValue);
    else if ((val as any).doubleValue !== undefined) obj[key] = Number((val as any).doubleValue);
    else if ((val as any).booleanValue !== undefined) obj[key] = (val as any).booleanValue;
    else if ((val as any).nullValue !== undefined) obj[key] = null;
  }
  return obj;
};

async function run() {
  try {
    const postData = mapToFirestore({ type: "external", name: "testing 123", createdAt: Date.now() });
    const res = await axios.post(`${baseUrl}/${collection}`, postData);
    console.log("Created doc:", res.data.name);

    const res2 = await axios.get(`${baseUrl}/${collection}`);
    const docs = res2.data.documents?.map(mapFromFirestore) || [];
    console.log("Documents parsed:", docs);
  } catch (e: any) {
    console.error(e.message);
  }
}
run();
