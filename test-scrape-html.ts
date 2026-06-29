import axios from "axios";
import * as cheerio from "cheerio";
import https from "https";

const httpsAgent = new https.Agent({ rejectUnauthorized: false });

async function run() {
  try {
    const res = await axios.get('https://mourjan.com/sa/jobs/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
      },
      httpsAgent
    });
    const $ = cheerio.load(res.data);
    
    // Check first ad's HTML
    console.log($('.ad.p, .ad').first().html());
  } catch (e: any) {
    console.error(e.message);
  }
}
run();
