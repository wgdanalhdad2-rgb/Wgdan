import axios from "axios";
import * as cheerio from "cheerio";
import https from "https";

const httpsAgent = new https.Agent({ rejectUnauthorized: false });

async function run() {
  try {
    const res = await axios.get('https://mosta3ed.com/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
      },
      httpsAgent
    });
    const $2 = cheerio.load(res.data);
    let count = 0;
    $2('.job-listing, .item, .post-item').each((index, element) => { count++; });
    console.log("Mosta3ed jobs count:", count);
  } catch (e: any) {
    console.error("Mosta3ed error:", e.message);
  }
}
run();
