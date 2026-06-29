import axios from "axios";
import * as cheerio from "cheerio";
import https from "https";

const httpsAgent = new https.Agent({ rejectUnauthorized: false });

async function run() {
  try {
    const mourjanRes = await axios.get('https://mourjan.com/sa/jobs/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
      },
      httpsAgent
    });
    const $1 = cheerio.load(mourjanRes.data);
    let count = 0;
    $1('.ad.p, .ad').each((index, element) => {
      const textContent = $1(element).find('.content').text() || $1(element).text();
      const title = textContent.replace(/\s+/g, ' ').substring(0, 60).trim();
      let url = $1(element).find('a.link').attr('href') || $1(element).find('a').attr('href');
      
      if (title && title.length > 5 && url) {
        count++;
      } else {
        console.log("Failed:", { title, url });
      }
    });
    console.log("Mourjan jobs added:", count);
  } catch (e: any) {
    console.error("Mourjan error:", e.message);
  }
}
run();
