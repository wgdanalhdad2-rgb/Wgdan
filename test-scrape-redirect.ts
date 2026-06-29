import axios from "axios";
import https from "https";

const httpsAgent = new https.Agent({ rejectUnauthorized: false });

async function run() {
  try {
    const res = await axios.get('https://mourjan.com/sa/ad/29738555/', {
      maxRedirects: 0,
      validateStatus: (status) => true,
      httpsAgent
    });
    console.log("Status:", res.status);
    console.log("Location header:", res.headers.location);
  } catch (e: any) {
    console.error(e.message);
  }
}
run();
