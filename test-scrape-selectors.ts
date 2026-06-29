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
    const res = await axios.get('https://mourjan.com/sa/jobs/', {
      headers: getHumanHeaders(),
      timeout: 10000,
      httpsAgent
    });
    const $ = cheerio.load(res.data);
    let classes = new Set();
    $('a').each((i, el) => {
      if ($(el).attr('class')) classes.add($(el).attr('class'));
    });
    console.log("Link classes:", Array.from(classes).slice(0, 20));
    
    // Check if there are articles or lists
    console.log("articles:", $('article').length);
    console.log("divs with class listing:", $('div[class*="list"]').length);
    console.log("divs with class ad:", $('div[class*="ad"]').length);
    console.log("divs with class item:", $('div[class*="item"]').length);
    
    // Find a common ad pattern
    $('a[href*="/jobs/"]').each((i, el) => {
      if (i < 5) console.log("Job link:", $(el).attr('href'), $(el).text().substring(0, 30));
    });
  } catch (e: any) {
    console.error(e.message);
  }
}
run();
