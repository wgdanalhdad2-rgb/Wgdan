import axios from 'axios';
async function test() {
  try {
    const res = await axios.get('http://localhost:3000/api/jobs');
    console.log(JSON.stringify(res.data, null, 2).substring(0, 500));
    console.log("Total jobs:", res.data.length);
  } catch (e: any) {
    console.error(e.message);
  }
}
test();
