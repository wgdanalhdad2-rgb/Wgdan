import axios from "axios";
import * as cheerio from "cheerio";
import https from "https";

const httpsAgent = new https.Agent({ rejectUnauthorized: false });

const getHumanHeaders = () => ({
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
  'Accept-Language': 'ar,en-US;q=0.9,en;q=0.8',
  'Cache-Control': 'max-age=0',
  'Connection': 'keep-alive',
  'Upgrade-Insecure-Requests': '1',
  'Sec-Fetch-Dest': 'document',
  'Sec-Fetch-Mode': 'navigate',
  'Sec-Fetch-Site': 'none',
  'Sec-Fetch-User': '?1'
});

async function run() {
  try {
    const mourjanRes = await axios.get('https://mourjan.com/sa/jobs/', {
      headers: getHumanHeaders(),
      timeout: 10000,
      httpsAgent
    });
    console.log("Mourjan status:", mourjanRes.status);
    const $1 = cheerio.load(mourjanRes.data);
    let count = 0;
    $1('.listing-item, .item, .ad-box').each((index, element) => { count++; });
    console.log("Mourjan jobs count:", count);
  } catch (e: any) {
    console.error("Mourjan error:", e.message);
  }
}
run();
