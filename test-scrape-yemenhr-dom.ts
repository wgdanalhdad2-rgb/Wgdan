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
    const $ = cheerio.load(res.data);
    
    // Print all classes of anchor tags that point to jobs
    let classes = new Set();
    $('a[href*="/jobs/"]').each((i, el) => {
      classes.add($(el).parent().attr('class') || 'none');
    });
    console.log("Parent classes of job links:", Array.from(classes));
  } catch (e: any) {
    console.error("YemenHR error:", e.message);
  }
}
run();
