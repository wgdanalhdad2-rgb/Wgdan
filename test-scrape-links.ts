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
  'Upgrade-Insecure-Requests': '1'
});

async function run() {
  try {
    const res = await axios.get('https://mourjan.com/sa/jobs/vacancies/', {
      headers: getHumanHeaders(),
      timeout: 10000,
      httpsAgent
    });
    const $ = cheerio.load(res.data);
    
    // Find all 'a' tags, and see which ones look like job listings
    $('a').each((i, el) => {
      const href = $(el).attr('href');
      const text = $(el).text().trim();
      const parentClass = $(el).parent().attr('class');
      if (text.length > 20 && href && href.length > 10) {
        if (i < 20) {
           console.log("Candidate link:", href);
           console.log("Text:", text.substring(0, 50).replace(/\n/g, ' '));
           console.log("Parent class:", parentClass);
           console.log("---");
        }
      }
    });
  } catch (e: any) {
    console.error(e.message);
  }
}
run();
