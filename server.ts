import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import axios from "axios";
import * as cheerio from "cheerio";
import https from "https";
import { getDocsRest, addDocRest, deleteDocRest, updateDocRest, getDocRest } from "./db-rest";

const jobsCollection = "jobAds";
const marketCollection = "marketAds";
const httpsAgent = new https.Agent({ rejectUnauthorized: false });

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  app.use(express.json({ limit: "15mb" }));
  app.use(express.urlencoded({ limit: "15mb", extended: true }));

  // In-memory user-to-user (U2U) chats
  let u2uMessages = [
    {
      id: "u2u-msg-1",
      senderPhone: "+967775012242",
      senderName: "أبو مجد للسفريات",
      receiverPhone: "+967771234567",
      receiverName: "المهندس وضاح حميد",
      text: "أهلاً بك يا باشمهندس وضاح بخصوص إعلانك للبرمجة وتطوير المواقع، هل أنت متاح للعمل على مشروع جديد حالياً؟",
      timestamp: new Date(Date.now() - 3600000 * 3).toISOString(), // 3 hours ago
      adId: "seed-4",
      adTitle: "أخصائي تقني / مبرمج / مصمم",
      isAutoReply: false,
      isRead: true
    },
    {
      id: "u2u-msg-2",
      senderPhone: "+967771234567",
      senderName: "المهندس وضاح حميد",
      receiverPhone: "+967775012242",
      receiverName: "أبو مجد للسفريات",
      text: "أهلاً بك أستاذ أبو مجد! نعم متاح وجاهز للعمل، يسعدني جداً التعاون معكم. ما هي تفاصيل المشروع المطلوب برمجته؟",
      timestamp: new Date(Date.now() - 3600000 * 2.8).toISOString(),
      adId: "seed-4",
      adTitle: "أخصائي تقني / مبرمج / مصمم",
      isAutoReply: false,
      isRead: true
    }
  ];

  // In-memory Job Board Advertisements
  let jobAds = [
    {
      id: "seed-1",
      type: "employer",
      name: "شركة النخبة للمقاولات بالرياض",
      phone: "+966501234567",
      specialty: "مهندس مدني / معماري / كهرباء",
      country: "السعودية (الرياض)",
      details: "مطلوب مهندس مدني خبرة لا تقل عن 5 سنوات في الإشراف على المشاريع الإنشائية السكنية والتجارية. نقل كفالة أو تأشيرة عمل جديدة.",
      salary: "6000 - 8000 ريال",
      experience: "5 سنوات",
      timestamp: new Date().toLocaleDateString("ar-YE")
    },
    {
      id: "seed-2",
      type: "employer",
      name: "أبو فهد العتيبي (أعمال منزلية)",
      phone: "+966555987654",
      specialty: "عاملة منزلية / مربية",
      country: "السعودية (جدة)",
      details: "مطلوب عاملة منزلية لرعاية أطفال وإدارة المنزل. نوفر سكن خاص وتأمين طبي وراتب مجزي.",
      salary: "2000 ريال",
      experience: "سنتين",
      timestamp: new Date().toLocaleDateString("ar-YE")
    },
    {
      id: "seed-3",
      type: "seeker",
      name: "أحمد بن سالم علي",
      phone: "+967733445566",
      specialty: "كهربائي تمديدات / فني صيانه",
      country: "اليمن (صنعاء)",
      details: "فني كهربائي تمديدات وصيانة شبكات ذو خبرة ممتازة في المخططات وقراءة الخرائط الهندسية، أبحث عن فرصة عمل وتأشيرة إلى السعودية.",
      salary: "3500 ريال",
      experience: "4 سنوات",
      timestamp: new Date().toLocaleDateString("ar-YE")
    },
    {
      id: "seed-4",
      type: "seeker",
      name: "المهندس وضاح حميد",
      phone: "+967771234567",
      specialty: "أخصائي تقني / مبرمج / مصمم",
      country: "اليمن (تعز)",
      details: "مبرمج ويب ومطور واجهات أمامية وخلفية React/Node.js، أبحث عن فرصة عمل عن بعد أو تأشيرة مهنية رسمية لدى شركة برمجيات بالمملكة.",
      salary: "5000 ريال",
      experience: "3 سنوات",
      timestamp: new Date().toLocaleDateString("ar-YE")
    }
  ];

  // In-memory Market Advertisements (Buy & Sell)
  let marketAds = [
    {
      id: "market-seed-1",
      type: "sell",
      category: "تأشيرات وإقامات",
      title: "تأشيرة حرة سائق خاص جاهزة للنقل والتفويض",
      details: "متوفر تأشيرة سائق خاص جاهزة ومفوضة لليمنيين. الدفع بعد الانجاز والتوثيق الرسمي عبر منصة قوى ومساند.",
      price: "9500 ريال سعودي",
      location: "الرياض، السعودية",
      name: "المجد للخدمات العامة",
      phone: "+966501234567",
      timestamp: new Date().toLocaleDateString("ar-YE")
    },
    {
      id: "market-seed-2",
      type: "buy",
      category: "سيارات ووسائل نقل",
      title: "مطلوب شراء سيارة هايلوكس دبل موديل 2020 فما فوق",
      details: "أبحث عن تويوتا هايلوكس غمارة أو غمارتين دبل، شرط النظافة التامة وخالية من الصدمات ومجمركة جاهزة للتصدير أو مرقمة.",
      price: "حسب النظافة والاتفاق",
      location: "صنعاء، اليمن",
      name: "أبو راكان الحاشدي",
      phone: "+967771112223",
      timestamp: new Date().toLocaleDateString("ar-YE")
    },
    {
      id: "market-seed-3",
      type: "sell",
      category: "تذاكر ورحلات",
      title: "عرض تذكرة طيران مخفضة ومباشرة (جدة - صنعاء)",
      details: "عرض خاص ولفترة محدودة على رحلة الخطوط الجوية اليمنية المباشرة من جدة إلى صنعاء. المقاعد محدودة للغاية تواصل فوري.",
      price: "850 ريال سعودي",
      location: "جدة، السعودية",
      name: "أبو مجد للسفريات",
      phone: "+967775012242",
      timestamp: new Date().toLocaleDateString("ar-YE")
    },
    {
      id: "market-seed-4",
      type: "sell",
      category: "عقارات وأراضي",
      title: "أرض للبيع بموقع مميز جداً في صنعاء - بيت بوس",
      details: "أرض حر بمساحة 4 لبن عشاري على شارع 12 متر، قريبة من الخدمات والمدارس وموقع سكني راقي جداً.",
      price: "على السوم / للتواصل",
      location: "صنعاء (بيت بوس)",
      name: "الأستاذ وجدان الحداد",
      phone: "+967738465200",
      timestamp: new Date().toLocaleDateString("ar-YE")
    }
  ];

  // Helper function to extract phone numbers
  const extractPhoneNumbers = (text: string) => {
    if (!text) return 'غير متوفر';
    const phoneRegex = /(?:\+966|00966|05\d)\s*\d{3}\s*\d{4}|(?:\+967|00967|7[13708])\s*\d{3}\s*\d{3,4}|(?:05|01)\d{8}/g;
    const matches = text.match(phoneRegex);
    if (matches && matches.length > 0) {
      const uniqueNumbers = [...new Set(matches)];
      return uniqueNumbers.join(' | ');
    }
    const simpleRegex = /(?:(?:\+|00)\d{1,3}[\s-]?)?(?:\d{2,4}[\s-]?){2,4}\d{2,4}/g;
    const simpleMatches = text.match(simpleRegex);
    if (simpleMatches) {
      const valid = simpleMatches.filter(m => m.replace(/\D/g, '').length >= 9);
      if (valid.length > 0) return [...new Set(valid)].join(' | ');
    }
    return 'غير متوفر';
  };

  // API Route to fetch job advertisements
  app.get("/api/jobs", async (req, res) => {
    try {
      const externalJobs: any[] = [];
      let internalJobs: any[] = [];
      let existingUrls = new Set<string>();

      console.log("بداية جلب الوظائف...");

      // Helper for human-like headers
      const userAgents = [
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:122.0) Gecko/20100101 Firefox/122.0',
        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
        'Mozilla/5.0 (iPhone; CPU iPhone OS 17_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1'
      ];
      
      const getHumanHeaders = () => ({
        'User-Agent': userAgents[Math.floor(Math.random() * userAgents.length)],
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

      // Fetch existing jobs from Firestore first to avoid duplicates
      try {
        internalJobs = await getDocsRest(jobsCollection);
        const now = Date.now();
        const EXPIRATION_TIME = 7 * 24 * 60 * 60 * 1000; // 7 days

        internalJobs.forEach(job => {
          if (job.url) existingUrls.add(job.url);
        });

        // Auto-delete external jobs older than EXPIRATION_TIME
        for (const job of internalJobs) {
          if (job.type === 'external' && job.createdAt && (now - job.createdAt > EXPIRATION_TIME)) {
            deleteDocRest(jobsCollection, job.id).catch(console.error);
          }
        }

        // Filter out the expired ones from the current response
        internalJobs = internalJobs.filter(job => !(job.type === 'external' && job.createdAt && (now - job.createdAt > EXPIRATION_TIME)));

        internalJobs.sort((a, b) => {
          const tA = a.createdAt || 0;
          const tB = b.createdAt || 0;
          return tB - tA;
        });
      } catch (err) {
        console.error("خطأ في جلب الوظائف من Firestore:", err);
      }

      // 1. موقع مرجان - السعودية
      try {
        const mourjanRes = await axios.get('https://mourjan.com/sa/jobs/', {
          headers: getHumanHeaders(),
          timeout: 10000,
          httpsAgent
        });
        const $1 = cheerio.load(mourjanRes.data);
        $1('.ad.p, .ad').each((index: number, element: any) => {
          if (index >= 15) return false;
          const textContent = $1(element).find('.content').text() || $1(element).text();
          const title = textContent.replace(/\s+/g, ' ').substring(0, 60).trim();
          const desc = textContent.replace(/\s+/g, ' ').trim();
          const widgetId = $1(element).find('.widget').attr('id') || $1(element).attr('id');
          let url = widgetId ? `https://mourjan.com/sa/ad/${widgetId}/` : undefined;
          
          if (title && title.length > 5 && url && !existingUrls.has(url)) {
            const newExternalJob = {
              type: 'external',
              name: 'موقع مرجان',
              specialty: title,
              title: title,
              phone: extractPhoneNumbers(desc) || extractPhoneNumbers(title),
              country: 'السعودية',
              details: desc || 'تفاصيل الوظيفة متوفرة في الرابط.',
              url: url,
              timestamp: new Date().toLocaleDateString('ar-SA'),
              createdAt: Date.now(),
              salary: "حسب المقابلة",
              experience: "غير محدد"
            };
            
            // Add to firestore in background to make it real and permanent
            addDocRest(jobsCollection, newExternalJob).catch(console.error);
            externalJobs.push({ ...newExternalJob, id: `mourjan-temp-${Date.now()}-${index}` });
            existingUrls.add(url);
          }
        });
      } catch (e: any) {
        console.error('تخطي مرجان:', e.message);
      }

      // 1.5 موقع مرجان - اليمن
      try {
        const mourjanYeRes = await axios.get('https://mourjan.com/ye/jobs/', {
          headers: getHumanHeaders(),
          timeout: 10000,
          httpsAgent
        });
        const $ye = cheerio.load(mourjanYeRes.data);
        $ye('.ad.p, .ad').each((index: number, element: any) => {
          if (index >= 15) return false;
          const textContent = $ye(element).find('.content').text() || $ye(element).text();
          const title = textContent.replace(/\s+/g, ' ').substring(0, 60).trim();
          const desc = textContent.replace(/\s+/g, ' ').trim();
          const widgetId = $ye(element).find('.widget').attr('id') || $ye(element).attr('id');
          let url = widgetId ? `https://mourjan.com/ye/ad/${widgetId}/` : undefined;
          
          if (title && title.length > 5 && url && !existingUrls.has(url)) {
            const newExternalJob = {
              type: 'external',
              name: 'موقع مرجان',
              specialty: title,
              title: title,
              phone: extractPhoneNumbers(desc) || extractPhoneNumbers(title),
              country: 'اليمن',
              details: desc || 'تفاصيل الوظيفة متوفرة في الرابط.',
              url: url,
              timestamp: new Date().toLocaleDateString('ar-YE'),
              createdAt: Date.now(),
              salary: "حسب المقابلة",
              experience: "غير محدد"
            };
            
            addDocRest(jobsCollection, newExternalJob).catch(console.error);
            externalJobs.push({ ...newExternalJob, id: `mourjan-ye-temp-${Date.now()}-${index}` });
            existingUrls.add(url);
          }
        });
      } catch (e: any) {
        console.error('تخطي مرجان اليمن:', e.message);
      }

      // 2. موقع وظائف العرب
      try {
        const wazaefRes = await axios.get('https://wazaef-al-arab.com/category/jobs-in-saudi-arabia/', {
          headers: getHumanHeaders(),
          timeout: 10000,
          httpsAgent
        });
        const $2 = cheerio.load(wazaefRes.data);
        $2('article, .post, .job-item').each((index: number, element: any) => {
          if (index >= 15) return false;
          const title = $2(element).find('.entry-title, h2, h3').text().replace(/\s+/g, ' ').trim();
          const desc = $2(element).find('.entry-content, .excerpt, p').text().replace(/\s+/g, ' ').trim();
          let url = $2(element).find('a').first().attr('href');
          
          if (title && title.length > 5 && url && !existingUrls.has(url)) {
            const newExternalJob = {
              type: 'external',
              name: 'موقع وظائف العرب',
              specialty: title,
              title: title,
              phone: extractPhoneNumbers(desc) || extractPhoneNumbers(title),
              country: 'السعودية',
              details: desc || 'اضغط على الرابط للتفاصيل.',
              url: url,
              timestamp: new Date().toLocaleDateString('ar-SA'),
              createdAt: Date.now(),
              salary: "حسب المقابلة",
              experience: "غير محدد"
            };
            
            addDocRest(jobsCollection, newExternalJob).catch(console.error);
            externalJobs.push({ ...newExternalJob, id: `wazaef-temp-${Date.now()}-${index}` });
            existingUrls.add(url);
          }
        });
      } catch (e: any) {
        console.error('تخطي وظائف العرب:', e.message);
      }

      // 3. مستعد السعودية
      try {
        const mosta3edRes = await axios.get('https://mosta3ed.com/', {
          headers: getHumanHeaders(),
          timeout: 8000,
          httpsAgent
        });
        const $3 = cheerio.load(mosta3edRes.data);
        $3('.job-listing, .item, .post-item').each((index: number, element: any) => {
          if (index >= 15) return false;
          const title = $3(element).find('.title, h2, h3').text().replace(/\s+/g, ' ').trim();
          const desc = $3(element).find('.description, p, .content').text().replace(/\s+/g, ' ').trim();
          let url = $3(element).find('a').attr('href');
          
          if (title && title.length > 5 && url && !existingUrls.has(url)) {
            const newExternalJob = {
              type: 'external',
              name: 'موقع مستعد',
              specialty: title,
              title: title,
              phone: extractPhoneNumbers(desc) || extractPhoneNumbers(title),
              country: 'السعودية',
              details: desc || 'متاح تفاصيل إضافية في الموقع.',
              url: url,
              timestamp: new Date().toLocaleDateString('ar-SA'),
              createdAt: Date.now(),
              salary: "حسب المقابلة",
              experience: "غير محدد"
            };
            
            addDocRest(jobsCollection, newExternalJob).catch(console.error);
            externalJobs.push({ ...newExternalJob, id: `mosta3ed-temp-${Date.now()}-${index}` });
            existingUrls.add(url);
          }
        });
      } catch (e: any) {
        console.error('تخطي مستعد:', e.message);
      }

      // 4. Yemen HR (يمن إتش آر)
      try {
        const yemenHrRes = await axios.get('https://yemenhr.com/jobs', {
          headers: getHumanHeaders(),
          timeout: 10000,
          httpsAgent
        });
        const $4 = cheerio.load(yemenHrRes.data);
        $4('a[href*="/jobs/"]').each((index: number, element: any) => {
          if (index >= 15) return false;
          const title = $4(element).text().replace(/\s+/g, ' ').trim();
          let url = $4(element).attr('href');
          if (url && !url.startsWith('http')) url = 'https://yemenhr.com' + (url.startsWith('/') ? '' : '/') + url;
          
          if (title && title.length > 5 && url && !existingUrls.has(url)) {
            const newExternalJob = {
              type: 'external',
              name: 'يمن إتش آر (Yemen HR)',
              specialty: title,
              title: title,
              phone: 'غير متوفر',
              country: 'اليمن',
              details: 'اضغط على الرابط لعرض تفاصيل الوظيفة في يمن إتش آر.',
              url: url,
              timestamp: new Date().toLocaleDateString('ar-YE'),
              createdAt: Date.now(),
              salary: "حسب المقابلة",
              experience: "غير محدد"
            };
            
            addDocRest(jobsCollection, newExternalJob).catch(console.error);
            externalJobs.push({ ...newExternalJob, id: `yemenhr-${Date.now()}-${index}` });
            existingUrls.add(url);
          }
        });
      } catch (e: any) {
        console.error('تخطي Yemen HR:', e.message);
      }

      const allJobs = [...externalJobs, ...internalJobs];
      
      res.json(allJobs);
    } catch (error: any) {
      console.error("خطأ عام في الخادم:", error);
      res.json([]); // Fallback
    }
  });

  // API Route to post a new job advertisement
  app.post("/api/jobs", async (req, res) => {
    const { type, name, phone, specialty, country, details, salary, experience, image } = req.body;
    if (!type || !name || !phone || !specialty || !country || !details) {
      return res.status(400).json({ error: "جميع الحقول الأساسية مطلوبة (النوع، الاسم، الهاتف، التخصص، الموقع، تفاصيل الإعلان)" });
    }
    const newAd = {
      type,
      name,
      phone,
      specialty,
      country,
      details,
      salary: salary || "غير محدد",
      experience: experience || "غير محدد",
      timestamp: new Date().toLocaleDateString("ar-YE"),
      createdAt: Date.now(),
      image: image || undefined
    };
    try {
      const docId = await addDocRest(jobsCollection, newAd);
      res.status(201).json({ id: docId, ...newAd });
    } catch (err) {
      console.error("Error adding job to Firestore", err);
      res.status(500).json({ error: "فشل حفظ الإعلان في قاعدة البيانات" });
    }
  });

  // API Route to delete a job advertisement
  app.delete("/api/jobs/:id", async (req, res) => {
    const { id } = req.params;
    try {
      await deleteDocRest(jobsCollection, id);
      res.json({ success: true, message: "تم حذف الإعلان بنجاح." });
    } catch (err) {
      console.error("Error deleting job ad", err);
      res.status(500).json({ error: "الإعلان غير موجود أو تم حذفه مسبقاً." });
    }
  });

  // API Route to fetch market (Buy & Sell) advertisements
  app.get("/api/market", async (req, res) => {
    try {
      const internalMarket = await getDocsRest(marketCollection);
      internalMarket.sort((a: any, b: any) => {
        const tA = a.createdAt || 0;
        const tB = b.createdAt || 0;
        return tB - tA;
      });
      res.json(internalMarket);
    } catch (err) {
      console.error("Error fetching market ads", err);
      res.json([]);
    }
  });

  // API Route to post a new market advertisement
  app.post("/api/market", async (req, res) => {
    const { type, category, title, details, price, location, name, phone, image } = req.body;
    if (!type || !category || !title || !details || !price || !location || !name || !phone) {
      return res.status(400).json({ error: "جميع الحقول المطلوبة يجب تعبئتها." });
    }
    const newAd = {
      type,
      category,
      title,
      details,
      price,
      location,
      name,
      phone,
      timestamp: new Date().toLocaleDateString("ar-YE"),
      createdAt: Date.now(),
      image: image || undefined
    };
    try {
      const docId = await addDocRest(marketCollection, newAd);
      res.status(201).json({ id: docId, ...newAd });
    } catch (err) {
      console.error("Error adding market ad", err);
      res.status(500).json({ error: "فشل حفظ الإعلان في قاعدة البيانات" });
    }
  });

  // API Route to delete a market advertisement
  app.delete("/api/market/:id", async (req, res) => {
    const { id } = req.params;
    try {
      await deleteDocRest(marketCollection, id);
      res.json({ success: true, message: "تم حذف الإعلان بنجاح." });
    } catch (err) {
      console.error("Error deleting market ad", err);
      res.status(500).json({ error: "الإعلان غير موجود أو تم حذفه مسبقاً." });
    }
  });

  // API Route to extend a market advertisement
  app.post("/api/market/:id/extend", async (req, res) => {
    const { id } = req.params;
    try {
      const snapshot = await getDocRest(marketCollection, id);
      if (!snapshot) {
        return res.status(404).json({ error: "الإعلان غير موجود." });
      }
      const newTimestamp = new Date().toLocaleDateString("ar-YE");
      await updateDocRest(marketCollection, id, { timestamp: newTimestamp, createdAt: Date.now() });
      res.json({ success: true, message: "تم تمديد الإعلان بنجاح.", ad: { id, ...snapshot, timestamp: newTimestamp } });
    } catch (err) {
      console.error("Error extending market ad", err);
      res.status(500).json({ error: "فشل تمديد الإعلان" });
    }
  });

  // API Route for automatic AI translation to Arabic
  app.post("/api/translate", async (req, res) => {
    try {
      const { text } = req.body;
      if (!text || typeof text !== "string") {
        return res.status(400).json({ error: "الرجاء إدخال النص المطلوب ترجمته" });
      }

      const prompt = `قم بترجمة النص التالي بدقة وأمانة إلى اللغة العربية الفصحى بحيث يكون طبيعياً ومناسباً لإعلانات العمل والسوق والخدمات. حافظ على كل الأرقام والأسماء وعناوين التواصل وروابط الويب (مثل أرقام الهواتف أو أسماء الأشخاص والشركات والعملات والبلدان) دون أي تغيير أو تعريب مشوه. أعد النص المترجم مباشرة فقط دون أي مقدمات أو تعقيب أو علامات اقتباس إضافية:\n\n${text}`;
      const response = await generateResilientContent(prompt, undefined, 0.2);

      const translatedText = response.text?.trim() || text;
      return res.json({ translatedText });
    } catch (error: any) {
      console.warn("Translation failed (returning original text as fallback):", error.message);
      return res.json({ translatedText: req.body.text || "" });
    }
  });

  // API Route for travel assistant chat
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, history } = req.body;

      if (!message || typeof message !== "string") {
        return res.status(400).json({ error: "الرجاء إدخال رسالة صالحة" });
      }

      const OFFICE_INFO = `معلومات أبو مجد الحداد للسفريات:
- الهاتف: +967775012242
- البريد الإلكتروني: what775012242@outlook.sa
- فيسبوك: ابومجد الحداد خدمات سفريات وسياحه
- إنستغرام: وجدان الحداد-ابومجدالحداد
- الخدمات: تأشيرات، حجوزات طيران، خدمات سياحية، وسفر.`;

      const systemInstruction = `${OFFICE_INFO}
بصفتك مساعداً ذكياً لأبو مجد الحداد للسفريات والخدمات السياحية، أجب على رسالة المستخدم بصورة مهنية وودية للغاية وباللغة العربية.
أنت تدعم أيضاً توجيه المستخدمين لروابط التوظيف السعودية الهامة مثل:
1. منصة مساند (Musaned) - للاستقدام والعمالة المنزلية.
2. منصة قوى (Qiwa) - لإدارة عقود العمل وتوثيق الموظفين للشركات.
3. منصة جدارات (Jadarat) - المنصة الوطنية الموحدة للتوظيف بالقطاعين الحكومي والخاص.
4. منصة طاقات (Taqat) - للتمكين الوظيفي والتدريب.
5. منصة أبشر توظيف (Absher) - للوظائف العسكرية والأمنية.

وكذلك تدعم توجيه المستخدمين حول "استعلام طلبات وزارة الخارجية السعودية (MOFA)" عبر منصة التأشيرات الإلكترونية بموجب رقم الطلب ورقم الجواز.

أجب بإيجاز واذكر دائماً أنك تمثل "أبو مجد الحداد للسفريات والخدمات السياحية". 
إذا كان استفسار المستخدم يتطلب تفاصيل حجز أو معاملة، اطلب منه بأدب تزويدك برقم الحجز أو صورة المعاملة أو التواصل معنا مباشرة عبر الهاتف.
لا تقم بابتكار معلومات اتصال بديلة أو خدمات لا نقوم بتقديمها. لا تضف أي إعلانات تجارية خارجية.`;

      // Format messages for @google/genai SDK
      const contents: any[] = [];
      
      if (Array.isArray(history)) {
        for (const item of history) {
          if (item.role && item.text) {
            contents.push({
              role: item.role === "model" ? "model" : "user",
              parts: [{ text: item.text }]
            });
          }
        }
      }

      // Add user's new message
      contents.push({
        role: "user",
        parts: [{ text: message }]
      });

      const response = await generateResilientContent(contents, systemInstruction, 0.7);

      const reply = response.text || "عذراً، لم يتم توليد رد.";
      return res.json({ reply });

    } catch (error: any) {
      console.warn("Gemini API error (using smart custom fallback instead of failing):", error.message);
      
      const msgLower = (req.body?.message || "").toLowerCase();
      let reply = "";
      
      if (msgLower.includes("سلام") || msgLower.includes("مرحبا") || msgLower.includes("أهلا") || msgLower.includes("صباح") || msgLower.includes("مساء") || msgLower.includes("يا هلا")) {
        reply = "وعليكم السلام ورحمة الله وبركاته يا غالي! أهلاً وسهلاً بك في مكتب أبو مجد الحداد للسفريات والخدمات السياحية. كيف يمكننا خدمتك اليوم؟ يسعدنا مساعدتك في معاملات السفر والفيز وحجوزات الطيران والرحلات.";
      } else if (msgLower.includes("تأشير") || msgLower.includes("فيزا") || msgLower.includes("تفويض") || msgLower.includes("مساند") || msgLower.includes("قوى") || msgLower.includes("جدارات") || msgLower.includes("طاقات") || msgLower.includes("أبشر") || msgLower.includes("استقدام")) {
        reply = "أبشر يا غالي! نحن في مكتب أبو مجد الحداد متخصصون في تخليص المعاملات القنصلية، ومعاملات السفارة السعودية وتأشيرات العمل والزيارات بجميع أنواعها، وتوثيق عقود العمل وتفويض التأشيرات عبر منصات قوى ومساند وجدارات. نرجو منك إرسال رقم طلب المعاملة أو صورة واضحة من جواز السفر عبر واتساب الرئيسي (+967775012242) لنقوم بالمتابعة والإنجاز فوراً.";
      } else if (msgLower.includes("حجز") || msgLower.includes("طيران") || msgLower.includes("تذكر") || msgLower.includes("سعر") || msgLower.includes("أسعار") || msgLower.includes("يمنية") || msgLower.includes("خطوط") || msgLower.includes("باص") || msgLower.includes("باصات")) {
        reply = "أهلاً بك! نوفر لك أفضل أسعار وعروض حجوزات تذاكر الطيران الداخلية والدولية على جميع الخطوط، وبالأخص الخطوط الجوية اليمنية وطيران السعيدة والخطوط السعودية، بالإضافة لحجز باصات النقل الجماعي الدولية. للحصول على عرض سعر فوري وتأكيد الحجز، فضلاً أرسل لنا (تاريخ السفر، وجهة الإقلاع والوصول، وعدد الركاب) عبر واتساب 775012242 وسنرسل لك أفضل خيار متاح حالياً.";
      } else if (msgLower.includes("عمرة") || msgLower.includes("حج") || msgLower.includes("مكة") || msgLower.includes("مدينة") || msgLower.includes("برنامج") || msgLower.includes("فندق") || msgLower.includes("فنادق") || msgLower.includes("سكن")) {
        reply = "مرحباً بك! يسعدنا تقديم أفضل البرامج وحملات العمرة البرية والجوية بأسعار منافسة وسكن فندقي متميز بجوار الحرمين الشريفين في مكة المكرمة والمدينة المنورة. للاستفسار عن مواعيد الرحلات القادمة أو حجز تذكرة باص أو برنامج عمرة متكامل، يرجى مراسلتنا على الرقم 775012242 وسنخدمك بكل سرور.";
      } else if (msgLower.includes("رقم") || msgLower.includes("تواصل") || msgLower.includes("هاتف") || msgLower.includes("واتس") || msgLower.includes("اتصال") || msgLower.includes("عنوان") || msgLower.includes("موقع") || msgLower.includes("مكان")) {
        reply = "يسعدنا جداً تواصلك معنا يا غالي! يمكنك التواصل مع مكتب أبو مجد الحداد للسفريات والخدمات السياحية مباشرة عبر الأرقام التالية:\n\n📞 الرقم الرئيسي (واتساب): +967775012242\n📞 الرقم الإضافي: +967738465200\n📧 البريد الإلكتروني: what775012242@outlook.sa\n\nتفضل بالاتصال أو مراسلتنا في أي وقت وسيقوم فريق العمل بالرد عليك ومتابعة طلبك فوراً.";
      } else if (msgLower.includes("استفسار") || msgLower.includes("إعلان") || msgLower.includes("سوق") || msgLower.includes("وظي") || msgLower.includes("مهندس") || msgLower.includes("عامل") || msgLower.includes("سائق")) {
        reply = "أهلاً بك! نحن نقوم بالربط وتسهيل المعاملات وتخليص تفاويض تأشيرات العمل والعمالة الحرة والمنزلية لليمنيين والسعوديين. بالنسبة للإعلان الذي تستفسر عنه، يمكنك تزويدنا بالتفاصيل لنقوم بالربط ومتابعة إجراءات التأشيرة وتسهيل السفر، أو تواصل معنا مباشرة عبر واتساب على الرقم 775012242 لمناقشة التفاصيل.";
      } else {
        reply = "مرحباً بك في مكتب أبو مجد الحداد للسفريات والخدمات السياحية! نسعد كثيراً بخدمتك وتسهيل كافة معاملات سفرك وحجوزاتك بأسرع وقت. لتقديم المساعدة بشكل دقيق وفوري، يرجى التكرم بتوضيح تفاصيل استفسارك أو معاملتك، أو مراسلتنا مباشرة على واتساب أو الاتصال بنا على الرقم: 775012242.";
      }
      
      return res.json({ reply });
    }
  });

  // Client-safe configuration sharing (e.g. phone/social info)
  app.get("/api/office-info", (req, res) => {
    res.json({
      name: "أبو مجد الحداد للسفريات",
      phone: "+967775012242",
      email: "what775012242@outlook.sa",
      facebook: "ابومجد الحداد خدمات سفريات وسياحه",
      instagram: "وجدان الحداد-ابومجدالحداد",
      services: [
        "تأشيرات سفر وفيزا سياحية وعمل",
        "حجوزات طيران داخلية ودولية بأفضل الأسعار",
        "خدمات سياحية متكاملة وحجوزات فنادق",
        "تسهيل السفر والمعاملات القنصلية"
      ]
    });
  });

  // User to User Chats API
  let blockedUsers: { blockerPhone: string; blockedPhone: string }[] = [];

  app.get("/api/chats/blocks", (req, res) => {
    res.json(blockedUsers);
  });

  app.post("/api/chats/block", (req, res) => {
    const { blockerPhone, blockedPhone } = req.body;
    if (!blockerPhone || !blockedPhone) {
      return res.status(400).json({ error: "بيانات الحظر غير مكتملة." });
    }
    const exists = blockedUsers.some(b => b.blockerPhone === blockerPhone && b.blockedPhone === blockedPhone);
    if (!exists) {
      blockedUsers.push({ blockerPhone, blockedPhone });
    }
    res.json({ success: true, blockedUsers });
  });

  app.post("/api/chats/unblock", (req, res) => {
    const { blockerPhone, blockedPhone } = req.body;
    if (!blockerPhone || !blockedPhone) {
      return res.status(400).json({ error: "بيانات إلغاء الحظر غير مكتملة." });
    }
    blockedUsers = blockedUsers.filter(b => !(b.blockerPhone === blockerPhone && b.blockedPhone === blockedPhone));
    res.json({ success: true, blockedUsers });
  });

  app.get("/api/chats", (req, res) => {
    const { phone } = req.query;
    if (!phone) {
      return res.json(u2uMessages);
    }
    // Filter messages where sender or receiver is this phone
    const filtered = u2uMessages.filter(
      msg => msg.senderPhone === phone || msg.receiverPhone === phone
    );
    res.json(filtered);
  });

  app.post("/api/chats/read", (req, res) => {
    const { myPhone, partnerPhone } = req.body;
    if (!myPhone || !partnerPhone) {
      return res.status(400).json({ error: "بيانات الهاتف غير مكتملة." });
    }

    u2uMessages.forEach(msg => {
      if (msg.senderPhone === partnerPhone && msg.receiverPhone === myPhone) {
        msg.isRead = true;
      }
    });

    res.json({ success: true });
  });

  app.post("/api/chats", (req, res) => {
    const { senderPhone, senderName, receiverPhone, receiverName, text, adId, adTitle } = req.body;
    
    if (!senderPhone || !receiverPhone || !text) {
      return res.status(400).json({ error: "بيانات الرسالة غير مكتملة." });
    }

    // Check if there is a block relation
    const isBlockedByMe = blockedUsers.some(b => b.blockerPhone === senderPhone && b.blockedPhone === receiverPhone);
    const isBlockedByThem = blockedUsers.some(b => b.blockerPhone === receiverPhone && b.blockedPhone === senderPhone);
    if (isBlockedByMe || isBlockedByThem) {
      return res.status(403).json({ error: "لا يمكن إرسال الرسالة بسبب وجود حظر بين الطرفين." });
    }

    const newMsg = {
      id: "u2u-msg-" + Math.random().toString(36).substr(2, 9),
      senderPhone,
      senderName: senderName || "زائر مجهول",
      receiverPhone,
      receiverName: receiverName || "معلن",
      text,
      timestamp: new Date().toISOString(),
      adId,
      adTitle,
      isAutoReply: false,
      isRead: false
    };

    u2uMessages.push(newMsg);

    // Trigger simulated advertiser auto-reply
    setTimeout(async () => {
      try {
        // Mark user's message as read since the advertiser has opened it to reply
        u2uMessages.forEach(msg => {
          if (msg.senderPhone === senderPhone && msg.receiverPhone === receiverPhone) {
            msg.isRead = true;
          }
        });

        // Find if this receiver is an advertiser
        let adDetails = "";
        if (adId) {
          try {
            // Check jobs first
            let jadDoc = null;
            let madDoc = null;
            if (adId.startsWith("ad-") || !adId.startsWith("market-")) {
                const jRef = doc(db, "jobAds", adId);
                const jSnap = await getDoc(jRef);
                if (jSnap.exists()) jadDoc = jSnap.data();
            }
            if (!jadDoc && (adId.startsWith("market-") || !adId.startsWith("ad-"))) {
                const mRef = doc(db, "marketAds", adId);
                const mSnap = await getDoc(mRef);
                if (mSnap.exists()) madDoc = mSnap.data();
            }

            if (madDoc) {
              adDetails = `العنوان: ${madDoc.title}\nالتفاصيل: ${madDoc.details}\nالسعر: ${madDoc.price}\nالقسم: ${madDoc.category}`;
            } else if (jadDoc) {
              adDetails = `المسمى/التخصص: ${jadDoc.specialty}\nالتفاصيل: ${jadDoc.details}\nالراتب المتوقع: ${jadDoc.salary}\nالخبرة: ${jadDoc.experience}`;
            }
          } catch (e) {
            console.error("Error fetching ad details for auto-reply", e);
          }
        }

        let replyText = `أهلاً بك أخي الكريم ${senderName || 'العزيز'}، تلقيت رسالتك بخصوص إعلان "${adTitle || 'الخدمة المعروضة'}". سأقوم بالتواصل معك قريباً لتنسيق التفاصيل وإتمام الأمر، أو يمكنك أيضاً مراسلتي على واتساب على نفس هذا الرقم.`;

        // If Gemini is available, customize the response perfectly!
        if (process.env.GEMINI_API_KEY) {
          try {
            const prompt = `أنت تمثل المعلن "${receiverName}" (رقم الهاتف: ${receiverPhone}) في منصة سفريات وسوق عمل وتجارة يمنية-سعودية.
لقد تلقيت للتو رسالة من مستخدم يدعى "${senderName}" بخصوص إعلانك:
[تفاصيل الإعلان]
${adDetails || "عنوان الإعلان: " + (adTitle || "غير محدد")}

رسالة المستخدم: "${text}"

قم بصياغة رد طبيعي، مهذب، وودود للغاية باللهجة اليمنية أو السعودية أو العربية المبسطة كمعلن حقيقي مهتم بالرد على زبونه.
شروط الرد:
1. يجب أن يكون قصيراً ومباشراً وموجزاً للغاية (1 إلى 2 جملة كحد أقصى).
2. لا تذكر أنك ذكاء اصطناعي أو بوت إطلاقاً، بل تحدث كشخص حقيقي.
3. كن ودوداً ومرحباً به، واقترح عليه التنسيق لإتمام الصفقة أو الاتصال.
4. أعد نص الرد مباشرة فقط دون أي كلام آخر أو علامات اقتباس أو تعليقات.`;

            const response = await generateResilientContent(prompt, undefined, 0.7);
            if (response.text?.trim()) {
              replyText = response.text.trim();
            }
          } catch (aiErr) {
            console.error("Failed to generate AI auto-reply:", aiErr);
          }
        }

        u2uMessages.push({
          id: "u2u-msg-" + Math.random().toString(36).substr(2, 9),
          senderPhone: receiverPhone,
          senderName: receiverName,
          receiverPhone: senderPhone,
          receiverName: senderName,
          text: replyText,
          timestamp: new Date().toISOString(),
          adId,
          adTitle,
          isAutoReply: true,
          isRead: false
        });
      } catch (err) {
        console.error("Error in triggering advertiser auto-reply:", err);
      }
    }, 2000);

    res.json({ success: true, message: newMsg });
  });

  // Serve Vite in dev mode, static files in prod mode
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(Number(PORT), "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

let aiClient: GoogleGenAI | null = null;

function getAI(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY is required but not set in the environment.");
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

async function generateResilientContent(
  contents: any,
  systemInstruction?: string,
  temperature?: number
): Promise<{ text: string }> {
  const ai = getAI();
  const modelsToTry = [
    "gemini-2.5-flash",
    "gemini-1.5-flash",
    "gemini-2.5-pro"
  ];

  let lastError: any = null;

  for (const modelName of modelsToTry) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: contents,
          config: {
            ...(systemInstruction ? { systemInstruction } : {}),
            ...(temperature !== undefined ? { temperature } : {}),
          }
        });
        
        if (response && response.text) {
          return { text: response.text.trim() };
        }
      } catch (err: any) {
        lastError = err;
        console.warn(`Attempt ${attempt} using ${modelName} failed:`, err.message || err);
        if (attempt < 2) {
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
      }
    }
  }

  throw lastError || new Error("Failed to generate content after trying multiple models.");
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
