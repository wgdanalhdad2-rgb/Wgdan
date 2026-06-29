import axios from 'axios';

const project_id = "abu-majd-vip";
const baseUrl = `https://firestore.googleapis.com/v1/projects/${project_id}/databases/(default)/documents`;

export const mapToFirestore = (obj: any) => {
  const fields: any = {};
  for (const [key, val] of Object.entries(obj)) {
    if (typeof val === 'string') fields[key] = { stringValue: val };
    else if (typeof val === 'number') fields[key] = { integerValue: val };
    else if (typeof val === 'boolean') fields[key] = { booleanValue: val };
    else if (val === null || val === undefined) fields[key] = { nullValue: null };
  }
  return { fields };
};

export const mapFromFirestore = (doc: any) => {
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

export const getDocsRest = async (collection: string) => {
  try {
    const res = await axios.get(`${baseUrl}/${collection}`);
    return res.data.documents?.map(mapFromFirestore) || [];
  } catch (e: any) {
    console.error(`Error getDocsRest ${collection}:`, e.message);
    return [];
  }
};

export const addDocRest = async (collection: string, data: any) => {
  const postData = mapToFirestore(data);
  const res = await axios.post(`${baseUrl}/${collection}`, postData);
  return res.data.name.split('/').pop();
};

export const deleteDocRest = async (collection: string, id: string) => {
  await axios.delete(`${baseUrl}/${collection}/${id}`);
};

export const updateDocRest = async (collection: string, id: string, data: any) => {
  const patchData = mapToFirestore(data);
  const updateMask = Object.keys(data).map(k => `updateMask.fieldPaths=${k}`).join('&');
  await axios.patch(`${baseUrl}/${collection}/${id}?${updateMask}`, patchData);
};

export const getDocRest = async (collection: string, id: string) => {
  try {
    const res = await axios.get(`${baseUrl}/${collection}/${id}`);
    return mapFromFirestore(res.data);
  } catch (e: any) {
    return null;
  }
};
