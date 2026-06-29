import axios from "axios";
import * as cheerio from "cheerio";
import https from "https";

const httpsAgent = new https.Agent({ rejectUnauthorized: false });

async function run() {
  try {
    const res = await axios.get('https://yemenhr.com/jobs', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
      },
      httpsAgent,
      timeout: 10000
    });
    const $4 = cheerio.load(res.data);
    let count = 0;
    $4('.job-list-item, article, .job-item').each((index, element) => { count++; });
    console.log("YemenHR jobs count:", count);
  } catch (e: any) {
    console.error("YemenHR error:", e.message);
  }
}
run();
