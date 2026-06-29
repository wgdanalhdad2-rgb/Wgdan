import axios from "axios";
import https from "https";

const httpsAgent = new https.Agent({ rejectUnauthorized: false });

async function run() {
  try {
    const res = await axios.get('https://www.mourjan.com/sa/ad/29738555/', {
      maxRedirects: 5,
      httpsAgent
    });
    console.log("Final URL:", res.request.res.responseUrl);
  } catch (e: any) {
    console.error(e.message);
  }
}
run();
