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
    
    $('.ad.p, .ad').each((i, el) => {
      if (i >= 5) return;
      const url = $(el).find('a.link').attr('href') || $(el).find('a').attr('href');
      const text = $(el).find('.content').text() || $(el).text();
      console.log("Job URL:", url);
      console.log("Job text:", text.replace(/\n/g, ' ').substring(0, 100));
      console.log("---");
    });
  } catch (e: any) {
    console.error(e.message);
  }
}
run();
