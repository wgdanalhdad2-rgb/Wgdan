import axios from "axios";
import * as cheerio from "cheerio";
import https from "https";

const httpsAgent = new https.Agent({ rejectUnauthorized: false });

async function run() {
  try {
    const wazaefRes = await axios.get('https://wazaef-al-arab.com/category/jobs-in-saudi-arabia/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
      },
      httpsAgent
    });
    const $2 = cheerio.load(wazaefRes.data);
    let count = 0;
    $2('article, .post, .job-item').each((index, element) => { count++; });
    console.log("Wazaef jobs count:", count);
  } catch (e: any) {
    console.error("Wazaef error:", e.message);
  }
}
run();
