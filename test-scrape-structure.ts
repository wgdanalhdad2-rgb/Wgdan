import axios from "axios";
import * as cheerio from "cheerio";
import https from "https";

const httpsAgent = new https.Agent({ rejectUnauthorized: false });

async function run() {
  try {
    const res = await axios.get('https://mourjan.com/sa/jobs/vacancies/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
      },
      httpsAgent
    });
    const $ = cheerio.load(res.data);
    
    // Iterate over all tags and find which ones contain the text "توظيف فوري" or "مطلوب مساح"
    $('*').each((i, el) => {
      const text = $(el).text();
      if (text.includes("مطلوب مساح للعمل في شمال الرياض")) {
        console.log("Found match in tag:", el.tagName, "with class:", $(el).attr('class'));
      }
    });
  } catch (e: any) {
    console.error(e.message);
  }
}
run();
