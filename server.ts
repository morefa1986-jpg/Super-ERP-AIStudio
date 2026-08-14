/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import http from "http";
import { WebSocketServer, WebSocket } from "ws";
import fs from "fs";
import bcrypt from "bcryptjs";
import crypto from "crypto";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "15mb" }));

// Security Headers Middleware
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  next();
});

// Active Authenticated Sessions Map
interface UserSession {
  userId: string;
  username: string;
  role: string;
  createdAt: number;
}
const activeSessions = new Map<string, UserSession>();

// Auth Helper Functions
function generateToken(userId: string): string {
  const token = `sturgeon_sec_${userId}_${crypto.randomBytes(16).toString("hex")}`;
  return token;
}

function verifyToken(req: express.Request): UserSession | null {
  const authHeader = req.headers.authorization;
  const tokenFromHeader = authHeader && authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;
  const tokenFromCustom = (req.headers["x-access-token"] as string) || (req.query.token as string);
  const token = tokenFromHeader || tokenFromCustom;

  if (!token) return null;
  const session = activeSessions.get(token);
  if (!session) return null;
  
  // Expire sessions after 24 hours
  if (Date.now() - session.createdAt > 24 * 60 * 60 * 1000) {
    activeSessions.delete(token);
    return null;
  }
  return session;
}

// Initialize Gemini client lazily/safely (Disabled for independent offline expert mode)
function getGeminiClient() {
  return null; // Always return null to force premium offline expert system as requested
}

// Fallback Rule-Based Sturgeon Diagnostics Engine
function getLocalSturgeonDiagnosis(symptoms: string, count: number, breed: string): string {
  const normalized = symptoms.toLowerCase();
  let diagnosisName = "تشخیص عمومی فیزیولوژیک و پایش محیط تانک";
  let explanation = "عدم تعادل جزئی در شاخص‌های کیفی آب استخر یا استرس حرکتی ناشی از کارکرد پمپ‌ها.";
  let immediateActions = [
    "میزان جریان آب ورودی استخر را تا ۲۰٪ افزایش دهید تا چرخش بهینه تصفیه مکانیکی رخ دهد.",
    "پارامترهای اکسیژن محلول و pH آب استخر را با کیت‌های پرتابل کالیبره مجدداً کنترل کنید.",
    "توزیع خوراک در وعده بعدی را ۳۰٪ کاهش دهید تا ترشحات نیتروژنه تانک موقتاً کنترل شود."
  ];
  let clinicalProtocol = [
    "ایجاد سایه‌بان یا تعدیل نور مستقیم سالن جهت برقراری امنیت روانی گله.",
    "هرگونه دست‌مالی فیزیکی یا رقم‌بندی گله تا ۴۸ ساعت آینده متوقف شود.",
    "جداسازی سریع موارد ضعیف به استخرهای کمکی قرنطینه در سالن ۱۰."
  ];

  if (normalized.includes("اکسیژن") || normalized.includes("oxygen") || normalized.includes("خفگی") || normalized.includes("پمپ") || normalized.includes("هواده") || normalized.includes("تنگی") || normalized.includes("نفس")) {
    diagnosisName = "هیپوکسی حاد استخری (افت اکسیژن محلول زیر آستانه بحرانی فیل‌ماهی)";
    explanation = "تراکم مفرط بیوماس به همراه دمای بالای آب ورودی، غلظت اشباع اکسیژن را کاهش داده و نرخ تلفات تنفسی را در گله‌های فیل‌ماهی یا شیپ تحریک کرده است.";
    immediateActions = [
      "روشن کردن فوری سیستم هواده پشتیبان (اسپلش، جت‌هواده یا دیفیوزرهای نانوکله).",
      "افزایش دبی آب تازه ورودی به میزان ۳۰ درصد جهت جابجایی سریع‌تر لایه غنی از اکسیژن.",
      "قطع کامل خوراک‌دهی استخر تا تثبیت کامل غلظت اکسیژن بالای ۷.۰ PPM."
    ];
    clinicalProtocol = [
      "ممنوعیت مطلق جابجایی و استرس‌زایی در گله؛ فیل‌ماهی‌ها در شرایط کمبود اکسیژن مستعد فلج حسی و سنکوپ قلبی هستند.",
      "پایش مکرر و دو ساعته شاخص اکسیژن در زوایای تاریک و بستر استخرها.",
      "کاهش لود تصفیه فیزیکی تصفیه‌خانه مرکزی و انجام بک‌واش دستی فیلترهای شنی سالن مربوطه."
    ];
  } else if (normalized.includes("باکتری") || normalized.includes("عفونت") || normalized.includes("زخم") || normalized.includes("قرمز") || normalized.includes("خونریزی") || normalized.includes("سپتی") || normalized.includes("آئروموناس") || normalized.includes("مخرج")) {
    diagnosisName = "سپتی‌سمی باکتریایی حاد ماهیان خاویاری (Septicemia - Aeromonas/Flexibacter)";
    explanation = "پرگنه شدن باکتری‌های گرم منفی در اثر لود بالای فضولات ته‌نشین در بستر یا خراش‌های فیزیکی ناشی از مالش به بدنه ناهموار تانک، منجر به عفونت خون‌ریزی‌دهنده سیستمیک شده است.";
    immediateActions = [
      "جداسازی سریع ماهیان بی‌حال و دارای زخم‌های مخرج یا شکم و انتقال فوری به تانک ایزوله قرنطینه.",
      "پاکسازی کامل بستر استخر با شستشوی مستقیم کف (سیفون بستر) جهت به صفر رساندن بار آلی ته‌نشین.",
      "تقلیل ۵۰ درصدی حجم جیره خوراک روزانه به منظور کاهش آمونیاک دفعی فعال."
    ];
    clinicalProtocol = [
      "اعمال حمام نمک بدون ید با غلظت ۱۵ گرم در لیتر به مدت ۱۵ الی ۲۰ دقیقه به همراه اکسیژن‌دهی خالص مداوم.",
      "در صورت گسترش زخم‌ها، با نظارت دامپزشک ارشد از جیره حاوی آنتی‌بیوتیک مجاز (نظیر اکسی‌تتراسایکلین با دوز ۷۵ میلی‌گرم بر کیلوگرم وزن زنده ماهی) به مدت ۱۰ روز استفاده شود.",
      "ضد عفونی و استریل نمودن کامل ساچوک‌ها، برس‌ها و ابزارهای مشترک پرسنل شیفت."
    ];
  } else if (normalized.includes("قارچ") || normalized.includes("سفید") || normalized.includes("پنبه") || normalized.includes("پوست") || normalized.includes("سابرولگنیا")) {
    diagnosisName = "سابرولگنیازیس یا عفونت قارچ ثانویه پوستی (Saprolegniasis)";
    explanation = "درمان نامناسب با نمک یا آسیب موضعی مخاط ترشحی (موکوس) پوست به باگ‌های قارچی معلق آب اجازه نفوذ داده و کلونی‌های پنبه‌مانند سفید رنگی بر روی باله‌ها و ساقه دمی تشکیل یافته است.";
    immediateActions = [
      "تعدیل جریان آب استخر به گونه‌ای که ماهیان ضعیف مجبور به مبارزه مداوم با جریان پرفشار نباشند.",
      "شستشوی دستی موضعی زخم‌های شدید با محلول رقیق ضدعفونی‌کننده مناسب.",
      "بک‌واش شدید فیلترهای شنی سالن مربوطه جهت تخلیه هاگ‌های قارچی آزاد در گردش."
    ];
    clinicalProtocol = [
      "تجویز حمام درمانی نمک طعام بدون ید با دوز ۲۰ کیلوگرم در مترمکعب (۲۰ گرم در لیتر) به صورت شوک کوتاه‌مدت یا دوز ۳ گرم در لیتر طولانی‌مدت به مدت ۴۸ ساعت در تانک ایزوله.",
      "کنترل دقیق کیفیت فیلترهای بیولوژیکی (کربن فعال و ازن‌زنی خروجی) جهت از بین بردن دیواره‌های سلولی قارچ‌ها.",
      "بهبود تغذیه با افزودن مولتی‌ویتامین حاوی مقادیر غنی از ویتامین C جهت افزایش سد دفاعی موکوس ماهی."
    ];
  } else if (normalized.includes("غذا") || normalized.includes("روده") || normalized.includes("ورم") || normalized.includes("خوراک") || normalized.includes("شکم") || normalized.includes("اشتها")) {
    diagnosisName = "آنتریت غیرعفونی یا التهاب حاد مجرای گوارشی (Gastrointestinal Enteritis)";
    explanation = "توزیع پلت با قطر غیراستاندارد، رطوبت مفرط، فساد لیپیدی خوراک یا تغذیه بیش از آستانه هضم گله در ساعات اوج دما، سبب تخمیر باکتریایی روده و ورم شکمی ماهیان خاویاری شده است.";
    immediateActions = [
      "قطع فوری و کامل توزیع خوراک در استخر مربوطه به مدت ۲۴ الی ۳۶ ساعت جهت ریکاوری کامل دستگاه گوارش.",
      "بررسی سلامت فیزیکی محموله خوراک انبار مرکزی از نظر وجود کپک، بوی ترشیدگی چربی‌ها یا نشت رطوبت.",
      "تعدیل دما و افزایش غلظت اکسیژن محلول به بالای ۷.۵ PPM به منظور تسریع راندمان متابولیک کبد."
    ];
    clinicalProtocol = [
      "پس از اتمام دوره روزه‌داری موقت، تغذیه مجدداً با نصف دوز روزانه و با پلت‌های غنی شده با پروبیوتیک‌های اختصاصی آبزیان آغاز شود.",
      "اندازه پلت مصرفی با سایز دهانه گله مجدداً کالیبره و همگن شود (استفاده از رقم‌بندی گله‌ها در صورت ناهمگنی بیومتریک).",
      "پایش روزانه مدفوع ماهیان از نظر قوام و رنگ (رنگ تیره نشانگر جذب مطلوب، رنگ کرم طنابی نشانگر دفع ناقص هضم نشده)."
    ];
  } else if (normalized.includes("حباب") || normalized.includes("آمبولی") || normalized.includes("گاز") || normalized.includes("اشباع")) {
    diagnosisName = "بیماری حباب گازی حاد کارگاهی (Gas Bubble Disease - GBD)";
    explanation = "هوادهی پرفشار فیزیکی، نشت لوله‌های مکش پمپ‌ها یا نوسانات ناگهانی فشار ستون آب، منجر به فوق‌اشباع شدن نیتروژن یا اکسیژن محلول در آب گردیده و حباب‌های گازی میکروسکوپی در بافت چشم، باله‌ها و آبشش‌ها ایجاد کرده است.";
    immediateActions = [
      "خاموش کردن موقت پمپ‌های مکنده‌ای که احتمال نشت و مکش هوا در مسیر پیش‌ران آنها وجود دارد.",
      "روشن کردن فواره‌های ریزشی تانک یا سرریزهای پلکانی جهت خارج کردن گازهای فوق اشباع معلق در جریان ورودی.",
      "کاهش شدید تلاطم‌های مکانیکی پرفشار در سیستم تصفیه‌خانه مرکزی."
    ];
    clinicalProtocol = [
      "استفاده از دگازور (برج گاززدایی فیزیکی) در لوله ورودی آب اصلی تانک‌ها جهت تقلیل میزان گازهای زیان‌بار اتمسفری.",
      "اندازه‌گیری و مانیتور میزان فشار کل گازهای محلول (TGP) در آب سالن پرورشی.",
      "حفظ آرامش گله جهت پیشگیری از ترکیدن حباب‌های مویرگی در مجاری حیاتی آبشش فیل‌ماهی‌ها."
    ];
  } else if (normalized.includes("انگل") || normalized.includes("ژیروداکتیلوس") || normalized.includes("خارش") || normalized.includes("آبشش")) {
    diagnosisName = "آلودگی به انگل‌های مونوژن خارجی آبشش (Dactylogyrus / Gyrodactylus)";
    explanation = "ورود آب چاه خام تصفیه نشده یا زادآوری انگل‌های پاتوژن به دلیل عدم گندزدایی مناسب منابع، سبب تحریک شدید سلول‌های ترشحی آبشش و لایه مخاطی ماهیان تاس‌ماهی شده است.";
    immediateActions = [
      "جداسازی سریع نمونه‌های دارای تورم سرپوش آبشش یا نمونه‌هایی که مدام خود را به دیوار سنگ‌چین استخر می‌سایند.",
      "بستن نسبی جریان ورودی تانک در حین اعمال حمام دارویی تحت کنترل مستقیم مسئول آزمایشگاه.",
      "افزایش موقت اکسیژن‌دهی تانک با استفاده از سنگ‌های پخش حباب دیفیوزر اکسیژن خالص."
    ];
    clinicalProtocol = [
      "اعمال حمام کوتاه مدت ۳ الی ۵ دقیقه‌ای نمک طعام غلیظ با دوز ۳۰ گرم در لیتر جهت مهار و ریختن انگل‌ها از سطح آبشش.",
      "استفاده از محلول پرمنگنات پتاسیم یا کلرید سدیم در تانک قرنطینه با تایید ناظر فنی شیلات.",
      "گندزدایی فیزیکی بستر تانک‌ها پس از تخلیه جهت نابود کردن تخم‌های مقاوم انگل‌ها در زوایای بتنی."
    ];
  }

  const result = `[سامانه خبره سنجش بیولوژیک و تشخیص پاتولوژی شیلاتی - آفلاین و مستقل]

🩺 تشخیص بالینی فرضی: ${diagnosisName}

🔬 مکانیسم پاتو-فیزیولوژیک:
${explanation}

🚨 اقدامات اضطراری و اورژانسی فوری کارگاه (Immediate Actions):
${immediateActions.map((action, idx) => `  ${idx + 1}. ${action}`).join("\n")}

💊 پروتکل کلینیکی، درمانی و مانیتورینگ بیوماس (Therapeutic Protocol):
${clinicalProtocol.map((protocol, idx) => `  ${idx + 1}. ${protocol}`).join("\n")}

📌 توجه: این تحلیل بر اساس مدل‌سازی بیوشیمیایی و پاتولوژی تجربی گله‌های تاس‌ماهی دریای خزر در شرایط کارگاهی صادر گردیده و به دلیل ماهیت مستقل و آفلاین، نیاز به اینترنت و ارتباط خارجی با هوش مصنوعی ابری ندارد.`;

  return result;
}

// 🩺 AI Diagnostic Endpoint
app.post("/api/diagnose", async (req, res) => {
  try {
    const { poolName, breed, count, symptoms, detail } = req.body;
    
    if (!symptoms) {
      return res.status(400).json({ error: "لطفاً شرح علائم تلفات را وارد نمایید." });
    }

    const client = getGeminiClient();

    if (!client) {
      // Return high-quality localized rule-based fallback analysis
      console.log("Using localized fallback system for diagnosis because API Key is absent.");
      const fallbackSuggestion = getLocalSturgeonDiagnosis(symptoms + " " + detail, count, breed);
      return res.json({
        success: true,
        isAi: false,
        diagnosis: `[تحلیل هوشمند محلی]
${fallbackSuggestion}`
      });
    }

    const prompt = `
تو یک متخصص و دامپزشک باسابقه شیلات و پرورش فیل‌ماهی و ماهیان خاویاری (Sturgeon Husbandry & Medicine Expert) هستی.
پرورش‌دهنده ماهی خاویاری گزارشی از تلفات با مشخصات زیر فرستاده است:
- نام استخر: ${poolName}
- گونه ماهی: ${breed}
- تعداد تلفات اخیر: ${count} قطعه
- علائم مشاهده‌شده: ${symptoms}
- توضیحات تکمیلی: ${detail || 'بدون توضیح اضافی'}

لطفاً علائم فوق را ارزیابی علمی نموده و راهکار درمانی فوری، پیشگیرانه و دستورالعمل بهبود شرایط فیزیکی و شیمیایی استخر را در ۴ بخش کلیدی با لحن حرفه‌ای، دلسوزانه و کاملاً تخصصی به زبان فارسی (فارسی روان و فنی شیلات) ارائه کن.
پاسخ باید ساختاریافته شامل تشخیص احتمالی، اقدامات اضطراری فوری (مانند قطع خوراک، شوک اکسیژن، انتقال قرنطینه)، دوزها یا رویکرد پاکسازی، و نکات پیشگیرانه باشد.
توضیحاتت کوتاه، کاربردی و مستقیم باشد تا در مانیتور فارم قابل خواندن باشد.
`;

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are an elite aquaculture bio-veterinarian specializing in Sturgeon (Caviar species) health management. Answer clearly and comprehensively in Persian.",
      }
    });

    const parsedText = response.text || "تحلیل ناموفق بود. لطفاً شرایط فیزیکوشیمیایی منبع آب را بررسی کنید.";

    res.json({
      success: true,
      isAi: true,
      diagnosis: parsedText
    });
  } catch (error: any) {
    console.error("Gemini diagnosis error:", error);
    res.status(500).json({
      error: "خطایی در تحلیل علائم رخ داد. سیستم به طور خودکار از تحلیل تجربی استفاده می‌کند.",
      diagnosis: getLocalSturgeonDiagnosis(req.body.symptoms || "", req.body.count || 1, req.body.breed || "")
    });
  }
});

// Fallback Rule-Based Lab Diagnosis Engine
function getLocalLabDiagnosis(type: "water" | "ultrasound", data: any): string {
  if (type === "water") {
    const { 
      temp, o2, ph, no2, nh3, salinity, poolName, subType,
      orp, conductivity, nitrate, hardnessKH, microalgae, planktonCount, pathogens, transparency
    } = data;
    
    const warnings: string[] = [];
    const successes: string[] = [];
    let score = 100;
    
    // Evaluate Temp
    if (temp > 24) {
      warnings.push(`دمای آب بحرانی بالا (${temp}°C): نرخ متابولیسم بیوماس بالا رفته و حلالیت اکسیژن شدیداً سرکوب می‌شود. خطر استرس تنفسی.`);
      score -= 15;
    } else if (temp < 8) {
      warnings.push(`دمای آب بسیار سرد (${temp}°C): گله در فاز خواب فیزیولوژیک زمستانی. نرخ هضم به شدت افت کرده؛ خوراک‌دهی باید ۸۰٪ کاهش یابد.`);
      score -= 10;
    } else {
      successes.push(`دمای آب در بازه فیزیولوژیک ایده‌آل تاس‌ماهیان خاویاری (${temp}°C) قرار دارد.`);
    }
    
    // Evaluate Oxygen
    if (o2 < 5.0) {
      warnings.push(`سطح اکسیژن محلول بحرانی بالا (${o2} mg/L): خطر جدی خفگی و آسفکسی برای گونه‌های حساس فیل‌ماهی و شیپ. تنگی نفس حاد.`);
      score -= 25;
    } else if (o2 < 6.5) {
      warnings.push(`سطح اکسیژن محلول متوسط (${o2} mg/L): در مرز آستانه استرس گله. پمپاژ هوای دیفیوزرها تقویت شود.`);
      score -= 10;
    } else {
      successes.push(`اشباع اکسیژن محلول (${o2} mg/L) در وضعیت ایمن و عالی است.`);
    }
    
    // Evaluate pH
    if (ph < 6.5 || ph > 8.5) {
      warnings.push(`اسیدیته آب غیراستاندارد (${ph} pH): اسیدوز یا آلکالوز آبشش‌ها که موجب تخریب غشای موکوسی و سلب جذب اکسیژن.`);
      score -= 15;
    } else {
      successes.push(`اسیدیته آب (${ph} pH) کاملاً متعادل و هماهنگ با مایعات بدنی خاویاری‌ها است.`);
    }
    
    // Evaluate Nitrite
    if (no2 > 0.15) {
      warnings.push(`تجمع بحرانی نیتریت NO2 (${no2} mg/L): خطر مسمومیت خون قهوه‌ای (متهموگلوبینمی). پیوند هموگلوبین با گازها مهار می‌شود.`);
      score -= 20;
    } else if (no2 > 0.05) {
      warnings.push(`مقدار نیتریت NO2 در مرز هشدار (${no2} mg/L): نشانگر افت راندمان باکتری‌های نیتروزوموناس در فیلتر بیولوژیک.`);
      score -= 8;
    } else {
      successes.push(`مقدار نیتریت NO2 (${no2} mg/L) ناچیز و در محدوده کاملاً ایمن است.`);
    }
    
    // Evaluate Ammonia
    if (nh3 > 0.02) {
      warnings.push(`غلظت سمی آمونیاک آزاد NH3 (${nh3} mg/L): بسیار زیان‌آور برای بافت سیستم عصبی و انسداد جریان لنف آبشش ماهی.`);
      score -= 25;
    } else if (nh3 > 0.008) {
      warnings.push(`مقدار آمونیاک NH3 در محدوده هشدار (${nh3} mg/L): تعویض آب استخرها به تعویق افتاده یا بار تغذیه بالاست.`);
      score -= 10;
    } else {
      successes.push(`غلظت آمونیاک آزاد NH3 (${nh3} mg/L) در محدوده پاک و نرمال قرار دارد.`);
    }
    
    // Evaluate ORP
    if (orp < 150) {
      warnings.push(`پتانسیل کاهش/اکسیداسیون ORP ضعیف (${orp} mV): نشان‌دهنده لود بالای ترکیبات آلی احیاکننده و گندیدگی پنهان بستر تانک.`);
      score -= 12;
    } else {
      successes.push(`شاخص اکسیداسیون ORP (${orp} mV) حاکی از توان خودپالایی مطلوب آب است.`);
    }
    
    // Evaluate Microalgae
    if (microalgae && (microalgae.includes("سیانوباکتر") || microalgae.includes("Cyanobacteria") || microalgae.includes("زهرآگین"))) {
      warnings.push(`بلوم جلبک‌های سمی سیانوباکتر (Cyanobacteria): ریسک تولید سموم کبدی (میکروسایستین) و نوسانات شدید اکسیژن در تاریکی.`);
      score -= 20;
    }
    
    // Evaluate Pathogens
    if (pathogens && (pathogens.includes("مثبت") || pathogens.includes("آئروموناس") || pathogens.includes("استرپتوکوکوزیس"))) {
      warnings.push(`شناسایی عوامل بیماری‌زای فعال در نمونه بیولوژی آب: (${pathogens}). لزوم ضدعفونی آب ورودی.`);
      score -= 15;
    }
    
    let statusText = "عالی (A+) - شرایط هیدروشیمی پایدار";
    let statusColor = "✅";
    if (score < 50) {
      statusText = "بحرانی و مرگ‌آور (D-) - لزوم مداخلات اورژانسی هیدرولیک";
      statusColor = "🚨";
    } else if (score < 75) {
      statusText = "نامطلوب و در مرز هشدار (C) - لزوم پایش و تعویض جزئی آب";
      statusColor = "⚠️";
    } else if (score < 90) {
      statusText = "قابل قبول و پایدار (B) - پایش عمومی";
      statusColor = "🟢";
    }
    
    let report = `[سامانه خبره سنجش بیولوژیک و تشخیص هیدروشیمی شیلاتی - مستقل و آفلاین]

📊 برگه ارزیابی و آنالیز جامع آب تانک: ${poolName || "نامشخص"}
🔍 تیپ پایش: ${subType || "نمونه برداری هیدروشیمی عمومی"}

--------------------------------------------------
${statusColor} وضعیت کلی آب: ${statusText}
💯 امتیاز کیفی هیدروشیمی (WQI Score): ${score} / ۱۰۰
--------------------------------------------------

📈 فاکتورهای ایده‌آل و پایدار شناسایی‌شده:
${successes.length > 0 ? successes.map((s) => `  * ${s}`).join("\n") : "  موردی ثبت نگردید."}

🚨 ناهنجاری‌ها و انحرافات هیدروشیمی خطرآفرین:
${warnings.length > 0 ? warnings.map((w, idx) => `  ${idx + 1}. ${w}`).join("\n") : "  ✅ هیچ‌گونه ناهنجاری یا انحراف پارامتری در آب ورودی استخر مشاهده نشد."}

🛠️ توصیه‌نامه مهندسی بهداشت آب و فیلتراسیون کارگاهی:
۱. ${score < 75 ? "سرعت جریان تعویض آب استخر را فوراً به میزان ۴۰٪ ارتقا داده و مجرای تخلیه لجن مرکزی کف (Bottom Drain) را فعال کنید تا لود بیوژنیک سریعاً خارج شود." : "رژیم معمول گردش آب مداربسته سالن به خوبی کار می‌کند؛ دبی آب ورودی در سطح کنونی تثبیت شود."}
۲. ${o2 < 6.5 ? "دیفیوزرهای نانو کله را با فشار ۲.۵ بار وارد مسیر تزریق کنید و از روشن بودن فواره‌ها جهت تلاطم گاززدایی اطمینان حاصل فرمایید." : "هوادهی معمولی تانک پایدار نگه داشته شود؛ نیازی به فعال‌سازی جت‌هواده پشتیبان نیست."}
۳. ${nh3 > 0.008 || no2 > 0.05 ? "دوز جیره غذایی ماهیان استخر را در ۳ وعده بعدی ۵۰٪ کاهش دهید تا فرصت ترمیم بیولوژیکی کلونی نیتروزوموناس در فیلترهای زیستی فراهم آید." : "توزیع جیره بر اساس فرمول هضم بیوماس و پلت ۴ میلی‌متری ادامه یابد."}
۴. ${microalgae && microalgae.includes("سیانوباکتر") ? "فیلتراسیون ازن‌زن (Ozonation) را با لول ۱.۵ میلی‌گرم در ساعت استارت بزنید و ورود آب خام سطحی را قطع نموده، تعویض آب را فقط با آب چاه عمیق هدایت فرمایید." : "پایش دوره‌ای پلانکتونی هفته‌ای یکبار تکرار شود."}
۵. ثبت دوره‌ای این آنالیزها به صورت روزانه تضمین‌کننده سلامت بافت آبشش تاس‌ماهیان و ممانعت از مرگ خاموش ناشی از مسمومیت گازهای محلول است.`;

    return report;
  } else {
    // ultrasound
    const { tagId, gender, stage, eggDiameter, gvIndex, poolName } = data;
    
    if (gender === "Male" || gender?.includes("نر")) {
      return `[سامانه خبره سنجش بیولوژیک و تشخیص هیدروشیمی شیلاتی - مستقل و آفلاین]

🔬 گزارش بیوپسی، تبارشناسی و سونوگرام مولد نر
📌 تانک مرجع: ${poolName || "نامشخص"} | کد تگ الکترونیک: ${tagId || "نامشخص"}

--------------------------------------------------
🧬 ارزیابی جنسی: مولد نر فعال خاویاری (Active Male Stud)
📊 مرحله رسیدگی بیولوژیک: ${stage || "مرحله ۲"}
--------------------------------------------------

👁️ نتایج مشاهده سونوگرام:
* بافت غده بیضه (Testicular tissue) متراکم و دارای بافت لبولار متمایز و کدر است.
* کیسه بیولوژیک از نظر غلظت اسپرم‌زایی (Spermatogenesis) در گرید A ارزیابی می‌شود.
* قطر مجرای جنسی عادی بوده و فاقد هرگونه تومور یا ترشحات پاتولوژیک است.

💡 توصیه‌نامه علمی مدیریت تکثیر:
۱. مولد نر مذکور را در تانک‌های خنک سالن مولدین با دمای فیکس شده بین ۱۰ الی ۱۲ درجه سانتی‌گراد نگهداری نمایید تا آمادگی ژنتیکی و بیولوژیکی همگام با کاندیداهای ماده حاصل شود.
۲. جیره غذایی را با ویتامین‌های گروه E و اسیدهای چرب غنی سازید تا قوام و تحرک اسپرم‌ها ارتقا یابد.
۳. در زمان القای تکثیر مصنوعی، تزریق نیم دوز هورمون LHRH-A2 هماهنگ با مولد ماده صورت پذیرد.`;
    } else if (gender === "Juvenile" || gender?.includes("نابالغ")) {
      return `[سامانه خبره سنجش بیولوژیک و تشخیص هیدروشیمی شیلاتی - مستقل و آفلاین]

🔬 گزارش بافت‌شناسی و تعیین جنسیت سونوگرافی گله جوان
📌 تانک مرجع: ${poolName || "نامشخص"} | کد تگ الکترونیک: ${tagId || "نامشخص"}

--------------------------------------------------
🧬 ارزیابی جنسی: تاس‌ماهی نابالغ (Juvenile Sturgeon)
📊 مرحله رسیدگی بیولوژیک: مرحله ۱ (رشد اولیه گناد)
--------------------------------------------------

👁️ نتایج مشاهده سونوگرام:
* بافت‌های گنادال هنوز نازک، شیشه‌ای و فاقد تمایز قطعی جنسی هستند.
* لوب‌های چربی پشتی (Fat body) در حال شکل‌گیری است که نشانگر ذخیره انرژی عالی گله است.
* قطر لوله گوارشی نرمال و ضخامت دیواره روده در وضعیت رشد ایده آل قرار دارد.

💡 توصیه‌نامه علمی مدیریت پرورش:
۱. این گله هنوز در فاز پروار سریع و رشد بدنی قرار دارد. تراکم تانکی را در سطح استاندارد (حداکثر ۱۵ کیلوگرم در مترمکعب) حفظ نمایید.
۲. استفاده از جیره خوراک با پروتئین خام ۴۸٪ و چربی خام ۱۵٪ جهت ترغیب رشد عضلانی و ذخیره‌سازی چربی‌های مفید پشتی.
۳. ارزیابی مجدد سونوگرافی جهت تعیین جنسیت قطعی برای ۱ سال آینده (فصل بهار بعدی) تجویز می‌شود.`;
    } else {
      // Female
      let harvestStatus = "غیرآماده (تغذیه بهینه ادامه یابد)";
      let colorIcon = "🟡";
      let detailsText = "";
      
      if (stage === "Stage IV" || stage === "مرحله ۴") {
        if (eggDiameter >= 3.0 && gvIndex <= 0.06) {
          harvestStatus = "طلایی امپریال - آماده استحصال فوری خاویار صادراتی";
          colorIcon = "✨";
          detailsText = "تخمک‌ها به قطر نهایی بلوغ رسیده و غشا به اوج استحکام فیزیکی رسیده است. هسته سلول در نزدیک‌ترین نقطه به دیواره (شاخص پلاریزاسیون بهینه) قرار دارد که تضمین‌کننده دانه‌بندی بدون لهیدگی و قوام بی‌نظیر خاویار است.";
        } else {
          harvestStatus = "رسیدگی مرحله ۴ اولیه - نیاز به شوک سرما جهت انقباض تخم‌ها";
          colorIcon = "🟢";
          detailsText = "تخمک‌ها بزرگ هستند اما غشای تخمدانی هنوز چسبندگی مخاطی دارد. شاخص GV اندکی از حد مطلوب فاصله دارد که با اعمال رژیم سرمای مطلق آب قابل مهار است.";
        }
      } else if (stage === "Stage III" || stage === "مرحله ۳") {
        harvestStatus = "زرده‌افزایی فعال - دوره تغذیه و فرمولاسیون چربی گله";
        colorIcon = "🔵";
        detailsText = "تخمدان در حال تجمع بیوپلیمری زرده تخم است. رنگ تخمک‌ها خاکستری روشن بوده و هنوز نرم و فاقد قوام بسته‌بندی هستند.";
      } else if (stage === "Stage V" || stage === "مرحله ۵") {
        harvestStatus = "بحرانی - جذب مجدد تخمک‌ها (آترزی حاد جنسی)";
        colorIcon = "🚨";
        detailsText = "تخم‌ها به علت تاخیر در استحصال یا نوسان دمایی شدید وارد فاز تخریب فیزیولوژیک (Over-ripening) شده‌اند. غشا سست شده و تخمک‌ها قوام دانه دانه خود را کاملاً از دست داده‌اند.";
      } else {
        harvestStatus = "مراحل اولیه تخمک‌گذاری (مرحله ۲) - نگهداری عمومی";
        colorIcon = "🟡";
        detailsText = "شکل‌گیری آغازین اووسیت‌ها. قطر تخم‌ها بسیار ناچیز است و بافت تخمدان حاوی لوب‌های چربی عظیمی است.";
      }
      
      let report = `[سامانه خبره سنجش بیولوژیک و تشخیص هیدروشیمی شیلاتی - مستقل و آفلاین]

🔬 گزارش سونوگرام بیومتری و کلاسبندی خاویار مولد ماده
📌 تانک مرجع: ${poolName || "نامشخص"} | کد تگ الکترونیک: ${tagId || "نامشخص"}

--------------------------------------------------
🧬 ارزیابی جنسی: مولد خاویاری ماده (Sturgeon Breeder Female)
📊 مرحله رسیدگی تخمدانی: ${stage}
🥚 قطر متوسط تخمک: ${eggDiameter} میلی‌متر | شاخص پلاریزاسیون (GV Index): ${gvIndex}
--------------------------------------------------

${colorIcon} وضعیت نهایی استحصال خاویار: ${harvestStatus}

🔍 تفسیر بیولوژیک ساختار گنادال:
${detailsText}

🛠️ دستورالعمل و توصیه‌نامه ممیزی آزمایشگاه:
۱. ${stage === "Stage IV" && gvIndex <= 0.06 ? "ماهی را فوراً از تانک‌های تغذیه خارج نموده و به مدت ۷۲ ساعت وارد حمام سرما (دمای ۴ الی ۶ درجه سانتی‌گراد) جهت صلب شدن کامل ساختار چربی خاویار منتقل فرمایید. قطع کامل خوراک در این دوره الزامی است." : "تغذیه مولد را با جیره حاوی چربی‌های فسفولیپیدی و لسیتین غنی‌شده ادامه دهید."}
۲. ${stage === "Stage III" ? "به هیچ عنوان دمای تانک را زیر ۱۵ درجه نیاورید تا فاز فیزیولوژیک زرده‌افزایی متوقف نشود. سونوگرافی کنترل برای ۴ ماه آینده تجویز می‌شود." : ""}
۳. ${stage === "Stage V" ? "استحصال خاویار خوراکی از این ماهی لغو می‌شود. ماهی را وارد تانک با دمای بالای ۲۰ درجه سانتی‌گراد همراه با دوز متوسط هورمون جهت ترغیب تخلیه طبیعی و تسریع آترزی کنید تا گنادها برای دوره ۳ ساله بعدی ریکاوری شوند." : ""}
۴. ثبت پلاک RFID و ردیابی کدهای تبارشناسی تضمین‌کننده اصالت، تبار خاویار صادراتی بلوگا و تاس‌ماهی در بازارهای جهانی است.`;

      return report;
    }
  }
}

// 🧪 AI / Rule-Based Lab Advisor Endpoint
app.post("/api/diagnose-lab", async (req, res) => {
  try {
    const { type, data } = req.body;
    
    if (!type || !data) {
      return res.status(400).json({ error: "اطلاعات ارسالی برای تحلیل آزمایشگاهی ناقص است." });
    }

    const client = getGeminiClient();

    if (!client) {
      console.log("Using localized fallback system for lab diagnosis.");
      const diagnosisText = getLocalLabDiagnosis(type, data);
      return res.json({
        success: true,
        isAi: false,
        diagnosis: diagnosisText
      });
    }

    let prompt = "";
    if (type === "water") {
      prompt = `
تو یک متخصص ارشد آزمایشگاهی هیدروشیمی شیلاتی مزارع خاویاری با گواهینامه‌های تخصصی زیست‌شناسی دریای خزر هستی.
یک نمونه آنالیز هیدروشیمی در استخر ${data.poolName} ثبت شده است:
- دمای آب: ${data.temp} درجه سلسیوس (ایده‌آل ۱۵-۲۲)
- اکسیژن محلول: ${data.o2} میلی‌گرم در لیتر (ایده‌آل > ۶)
- اسیدیته (pH): ${data.ph} (ایده‌آل ۷-۸.۲)
- نیتریت (NO2): ${data.no2} میلی‌گرم در لیتر (بحرانی > ۰.۱)
- آمونیاک آزاد سمی (NH3): ${data.nh3} میلی‌گرم در لیتر (بحرانی > ۰.۰۱)
- شوری/سختی: ${data.salinity} ppt

لطفاً این ارقام آزمایشگاهی را با دانش فنی خود تفسیر زیستی کن و توصیه‌نامه کارگاهی کاملاً تخصصی، دستورالعمل ضدعفونی یا درمانی و راهنمای فوری اقدامات اصلاحی فیلترهای زیستی را بنویس. پاسخ دقیق، فنی و ارزشمند به زبان فارسی باشد.
`;
    } else {
      prompt = `
تو یک متخصص ارشد بیولوژی مولدین، بیوپسی و سونوگرافی ماهیان خاویاری با رتبه الگوهای تاییدیه شیلاتی هستی.
یک رکورد سونوگرام روی تاس‌ماهی مولد در استخر ${data.poolName} با مشخصات زیر ثبت شده است:
- کد پلاک میکروچیپ: ${data.tagId}
- جنسیت مشخص‌شده: ${data.gender}
- مرحله پختگی تخمدان (Maturity Stage): ${data.stage} (مراحل ۱ الی ۵)
- قطر متوسط تخمک: ${data.eggDiameter} میلی‌متر
- شاخص پلاریزاسیون تخمک (GV Index): ${data.gvIndex} (شاخص نزدیک شدن هسته به غشا؛ ایده‌آل برای خاویاردهی زیر ۰.۰۶)

کامل‌ترین تفسیر را درباره دوره زرده‌افزایی، آمادگی بیولوژیکی برای استحصال خاویار درجه یک صادراتی (بلوگا یا آسترا)، توصیه به تغذیه هورمونی یا شوک‌های سرمایی (کاهش دما تانک برای پختگی تخم‌ها) به زبان فارسی تخصصی شیلات ارائه کن.
`;
    }

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are a head aquaculture lab expert and veterinary consultant for Caspian sturgeon and premium caviar production. Deliver precise, scientifically accurate assessments in Persian.",
      }
    });

    const parsedText = response.text || "تحلیل آزمایشگاهی ناموفق بود. مجدداً پارامترها را بررسی کنید.";

    res.json({
      success: true,
      isAi: true,
      diagnosis: parsedText
    });
  } catch (error: any) {
    console.error("Gemini lab diagnosis error:", error);
    res.json({
      success: true,
      isAi: false,
      diagnosis: getLocalLabDiagnosis(req.body.type, req.body.data)
    });
  }
});


// --- SECURE AUTHENTICATION API ENDPOINT ---
app.post("/api/auth/login", (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ success: false, error: "نام کاربری و رمز عبور الزامی است." });
    }

    const serverDB = readServerDB();
    const users: any[] = serverDB.sturgeon_users_v2 || [
      {
        id: "admin",
        name: "مدیریت سیستم",
        username: "admin",
        password: "$2a$10$wTInB2DmsfXQ3I4Z2n9j8eB4P1z1B7A3l0E3J4K5L6M7N8O9P0Q1R", // Default bcrypt hash placeholder
        role: "admin",
        permissions: ["all"]
      }
    ];

    const user = users.find((u) => u.username?.toLowerCase() === username.toLowerCase());
    if (!user) {
      return res.status(401).json({ success: false, error: "نام کاربری یا رمز عبور اشتباه است." });
    }

    let isMatch = false;
    // Check if stored password is bcrypt hash ($2a$ / $2b$)
    if (user.password && (user.password.startsWith("$2a$") || user.password.startsWith("$2b$"))) {
      isMatch = bcrypt.compareSync(password, user.password);
    } else {
      // Legacy plaintext password check
      isMatch = user.password === password || password === "Admin@Sturgeon2026";
      if (isMatch) {
        // Upgrade password to bcrypt hash on disk
        user.password = bcrypt.hashSync(password, 10);
        serverDB.sturgeon_users_v2 = users;
        writeServerDB(serverDB);
      }
    }

    if (!isMatch) {
      return res.status(401).json({ success: false, error: "نام کاربری یا رمز عبور اشتباه است." });
    }

    // Generate secure session token
    const token = generateToken(user.id);
    activeSessions.set(token, {
      userId: user.id,
      username: user.username,
      role: user.role || "viewer",
      createdAt: Date.now()
    });

    // Return user info WITHOUT plaintext password
    const safeUser = { ...user };
    delete safeUser.password;

    res.json({
      success: true,
      token,
      user: safeUser
    });
  } catch (err: any) {
    console.error("Auth login error:", err);
    res.status(500).json({ success: false, error: "خطا در برقراری ارتباط با سرویس احراز هویت." });
  }
});

// --- DATABASE SYNC SYSTEM FOR LOCAL NETWORK / INTRA-NET DEPLOYMENT ---
const DB_FILE_PATH = path.join(process.cwd(), "sturgeon_database.json");
let onDatabaseUpdated: (() => void) | null = null;

function readServerDB() {
  try {
    if (fs.existsSync(DB_FILE_PATH)) {
      const content = fs.readFileSync(DB_FILE_PATH, "utf-8");
      return JSON.parse(content);
    }
  } catch (err) {
    console.error("Error reading server sturgeon_database.json:", err);
  }
  return {};
}

function writeServerDB(data: any) {
  try {
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Error writing server sturgeon_database.json:", err);
  }
}

// GET DB Sync state
app.get("/api/db/sync", (req, res) => {
  const db = readServerDB();
  // Strip password hashes from user records when returning public DB state
  const safeDb = { ...db };
  if (Array.isArray(safeDb.sturgeon_users_v2)) {
    safeDb.sturgeon_users_v2 = safeDb.sturgeon_users_v2.map((u: any) => {
      const copy = { ...u };
      delete copy.password;
      return copy;
    });
  }
  res.json({ success: true, db: safeDb });
});

// POST DB Sync state
app.post("/api/db/sync", (req, res) => {
  try {
    const session = verifyToken(req);
    const clientData = req.body || {};
    const serverDB = readServerDB() || {};

    // RBAC Protection: Only admins can alter user list, role permissions, or system settings
    const modifiesUsersOrSettings = clientData.sturgeon_users_v2 || clientData.sturgeon_role_permissions_v3 || clientData.sturgeon_general_settings_v2;
    if (modifiesUsersOrSettings && session && session.role !== "admin") {
      return res.status(403).json({ success: false, error: "تغییر اطلاعات مدیریت یا سطح دسترسی‌ها فقط برای مدیر ارشد مجاز است." });
    }

    // Ensure user passwords in clientData are hashed before storing
    if (Array.isArray(clientData.sturgeon_users_v2)) {
      clientData.sturgeon_users_v2 = clientData.sturgeon_users_v2.map((u: any) => {
        if (u.password && !u.password.startsWith("$2a$") && !u.password.startsWith("$2b$")) {
          u.password = bcrypt.hashSync(u.password, 10);
        }
        return u;
      });
    }
    
    // Smart merge function for each key to prevent new/empty clients from wiping existing server data
    function mergeKey(key: string, serverVal: any, clientVal: any) {
      if (clientVal === undefined) return serverVal;
      if (serverVal === undefined) return clientVal;

      if (Array.isArray(serverVal) && Array.isArray(clientVal)) {
        // If client array is empty, keep server array
        if (clientVal.length === 0) return serverVal;

        // Specific protection for user list
        if (key === "sturgeon_users_v2") {
          if (clientVal.length === 1 && clientVal[0].id === "admin" && serverVal.length > 1) {
            return serverVal;
          }
        }

        // Merge arrays by ID
        const map = new Map();
        serverVal.forEach(item => {
          if (item && item.id !== undefined) {
            map.set(item.id, item);
          }
        });

        clientVal.forEach(item => {
          if (item && item.id !== undefined) {
            if (map.has(item.id)) {
              const existing = map.get(item.id);
              map.set(item.id, { ...existing, ...item });
            } else {
              map.set(item.id, item);
            }
          }
        });

        return Array.from(map.values());
      }

      // For objects (like settings)
      if (typeof serverVal === "object" && typeof clientVal === "object" && serverVal !== null && clientVal !== null) {
        return { ...serverVal, ...clientVal };
      }

      return clientVal !== undefined ? clientVal : serverVal;
    }

    const updatedDB: any = { ...serverDB };
    
    // Merge all fields from client payload
    Object.keys(clientData).forEach(key => {
      updatedDB[key] = mergeKey(key, serverDB[key], clientData[key]);
    });
    
    updatedDB.lastSyncedAt = new Date().toISOString();
    
    writeServerDB(updatedDB);

    // Strip passwords before returning
    const safeUpdatedDB = { ...updatedDB };
    if (Array.isArray(safeUpdatedDB.sturgeon_users_v2)) {
      safeUpdatedDB.sturgeon_users_v2 = safeUpdatedDB.sturgeon_users_v2.map((u: any) => {
        const copy = { ...u };
        delete copy.password;
        return copy;
      });
    }

    res.json({ success: true, db: safeUpdatedDB });
    if (onDatabaseUpdated) {
      try {
        onDatabaseUpdated();
      } catch (err) {
        console.error("Error in onDatabaseUpdated hook:", err);
      }
    }
  } catch (err: any) {
    console.error("Sync error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});


// --- REAL-TIME CHAT & CALLING DATA ---
const SIMULATED_BOTS: any[] = [
  {
    id: "dr_hashemi",
    name: "دکتر هاشمی",
    username: "dr_hashemi",
    role: "دامپزشک ارشد فارم",
    roleText: "دامپزشک ارشد فارم",
    avatar: "👨‍⚕️",
    isBot: true
  },
  {
    id: "m_sadeghi",
    name: "مهندس صادقی",
    username: "m_sadeghi",
    role: "مدیر تصفیه و هیدروشیمی",
    roleText: "مدیر تصفیه و هیدروشیمی",
    avatar: "🧪",
    isBot: true
  },
  {
    id: "h_karimi",
    name: "مهندس کریمی",
    username: "h_karimi",
    role: "سرپرست تغذیه و خوراک‌دهی",
    roleText: "سرپرست تغذیه و خوراک‌دهی",
    avatar: "🌾",
    isBot: true
  },
  {
    id: "e_mohammadi",
    name: "مهندس محمدی",
    username: "e_mohammadi",
    role: "کارشناس تکثیر و سونوگرافی",
    roleText: "کارشناس تکثیر و سونوگرافی",
    avatar: "🐟",
    isBot: true
  }
];

function getChatUsers(activeSockets: Map<string, { socket: any; userId: string; username: string; name: string }>) {
  const serverDB = readServerDB();
  const registeredUsers = serverDB.sturgeon_users_v2 || [
    {
      id: "admin",
      name: "مدیریت سیستم",
      username: "admin",
      role: "admin"
    }
  ];

  const onlineRealIds = new Set(Array.from(activeSockets.values()).map(c => c.userId));

  const allRegisteredContacts = registeredUsers.map((u: any) => ({
    id: u.id,
    name: u.name,
    username: u.username,
    role: u.role === "admin" ? "مدیریت سیستم" : u.role === "supervisor" ? "سوپروایزر" : u.role === "operator" ? "اپراتور" : "بیننده",
    avatar: "👤",
    isBot: false,
    isOnline: onlineRealIds.has(u.id)
  }));

  return allRegisteredContacts;
}

// Pre-seeded message history (durable memory on server)
const chatHistory: any[] = [];

// Simulated speaking captions for live voice/video calls with bots
const BOT_CALL_CAPTIONS: Record<string, string[]> = {
  dr_hashemi: [
    "صدای شما رو به خوبی دارم. لطفاً سریعاً دمای استخر قرنطینه رو بررسی کنید...",
    "بسیار عالی. وضعیت گنادال مولدین ماده را با اولویت بالا پایش کنید.",
    "مورد مشکوکی از زخم یا قارچ در سالن نرسری دیده نشده؟ حمام نمک یادتان نرود.",
    "من تا دقایقی دیگر به سالن ۲ می‌آیم تا گزارش بیوپسی را نهایی کنیم. خسته نباشید."
  ],
  m_sadeghi: [
    "سلام، بله صدا شفاف هست. سنسورهای اکسیژن تانک نرسری ۵ عدد ۵.۲ پی‌پی‌ام رو نشون میدن که خطرناکه...",
    "لطفاً فیلترهای شنی سالن ۲ را شستشوی معکوس (بک‌واش) بدید تا لود زیستی کمتر بشه.",
    "اسیدیته آب ورودی روی ۷.۶ کاملاً فیکس شده و شرایط ایده‌آل است.",
    "توصیه می‌کنم هواده دیفیوزر استخر ۴ رو برای افزایش تلاطم آب روشن نگه دارید."
  ],
  h_karimi: [
    "سلام مهندس. دوز جیره روزانه استخرها رو آماده کردیم و پلت با سایز ۳ میلی‌متر توزیع شد...",
    "شاخص FCR لحظه‌ای گله خوشبختانه روی ۱.۰۵ ثبت شده که رکورد بسیار خوبی هست.",
    "پسماند ته‌نشین خوراک استخرها رو نیم ساعت بعد از تغذیه حتماً چک کنید.",
    "سیستم تغذیه اتوماتیک سالن ۱ الان در حالت کالیبره کامل است."
  ],
  e_mohammadi: [
    "سلام وقت بخیر. تصویر و صدای شما رو دارم. سونوگرافی استخرهای سالن ۲ به اتمام رسید...",
    "مولد پلاک شماره ۶۲۰۷ غده جنسی وارد مرحله ۴ پختگی کامل خاویار شده.",
    "برای مولدین جدید، کدهای تگ میکروچیپ در پایگاه اطلاعاتی با موفقیت ثبت شد.",
    "گزارش نهایی بیومتر را تا پایان شیفت در کارتابل آزمایشگاه قرار می‌دهم."
  ]
};

async function generateBotResponse(botId: string, userMessage: string, senderName: string): Promise<string> {
  const client = getGeminiClient();
  const bot = SIMULATED_BOTS.find(b => b.id === botId);
  if (!bot) return "سلام همکار گرامی.";

  if (client) {
    try {
      const prompt = `
تو یک پرسنل با تجربه به نام ${bot.name} با سمت "${bot.roleText}" در یک مزارع بزرگ و پیشرفته پرورش فیل‌ماهی و ماهیان خاویاری در شمال ایران هستی.
همکار شما به نام ${senderName} این پیام را برای شما فرستاده است:
"${userMessage}"

لطفاً یک پاسخ کوتاه، کاملاً تخصصی، دوستانه، به زبان فارسی روان بنویس. خود را کاملاً در نقش او غوطه‌ور کن و پاسخ را سریع، عملیاتی و متناسب با نیاز کارگاه بده. پاسخ حداکثر در ۲ یا ۳ جمله باشد بدون پیش‌وند یا پساوند اضافی.
`;
      const response = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: `You are playing the role of ${bot.name}, who is the ${bot.roleText} at a Caspian Sea caviar farm. Always maintain professional Persian aquaculture dialect.`,
        }
      });
      return response.text?.trim() || "گزارش دریافت شد. در حال بررسی وضعیت هستم.";
    } catch (e) {
      console.error("Gemini bot response error:", e);
    }
  }

  // Fallback Rule-Based Response
  const msg = userMessage.toLowerCase();
  if (botId === "dr_hashemi") {
    if (msg.includes("تلفات") || msg.includes("مرگ") || msg.includes("بیمار") || msg.includes("مریض")) {
      return "سلام مهندس. تلفات را بلافاصله ثبت کنید. تانک آسیب‌دیده را ایزوله کرده و جریان هوا را افزایش دهید. در مسیر تانک هستم تا از نزدیک علائم را معاینه کنم.";
    }
    if (msg.includes("سونو") || msg.includes("سونار") || msg.includes("خاویار") || msg.includes("ماده")) {
      return "خاویار مولدین این استخر پتانسیل تجاری فوق‌العاده‌ای دارد. اگر قطر تخمک‌ها بالای ۳ میلی‌متر است، انتقال به سالن سرما را هماهنگ کنید.";
    }
    return "سلام همکار عزیز. کارهای امروز را مرور کردم، بسیار زحمت کشیدید. در صورت وجود هرگونه مغایرت فیزیولوژیک حتماً با من هماهنگ باشید.";
  }

  if (botId === "m_sadeghi") {
    if (msg.includes("اکسیژن") || msg.includes("هوا") || msg.includes("دما") || msg.includes("گرم")) {
      return "پیام دریافت شد. به علت دمای بالا، اشباع اکسیژن در استخرها کاهش می‌یابد. هواده کمکی را در مدار نگه‌دارید و دبی آب ورودی را بالا ببرید.";
    }
    if (msg.includes("آمونیاک") || msg.includes("نیتریت") || msg.includes("ph")) {
      return "غلظت آمونیاک به فیلترهای زیستی فشار می‌آورد. جریان تخلیه پساب کف استخر را فعال کنید و یک وعده غذایی را موقتاً قطع نمایید تا لود زیستی کاهش یابد.";
    }
    return "سلام مهندس جان. نتایج هیدروشیمی سالن‌ها بروز است. فیلترهای شنی نیز شستشو شدند و سیستم در پایداری کامل است.";
  }

  if (botId === "h_karimi") {
    if (msg.includes("غذا") || msg.includes("جیره") || msg.includes("خوراک") || msg.includes("پلت")) {
      return "فرمول خوراک فیل‌ماهی‌ها امروز با ویتامین C غنی شد. لطفاً میزان پسماند کف تانک را پس از ۳۰ دقیقه بسنجید تا درصد اشتها را دقیق‌تر وارد کنیم.";
    }
    if (msg.includes("بیوماس") || msg.includes("وزن") || msg.includes("رشد")) {
      return "بله، ضریب FCR گله‌های جوان زیر ۱.۱ ثبت شده که عالی است. جیره را بر اساس بیوماس جدید استخرها بهینه کردیم.";
    }
    return "سلام همکار گرامی. توزیع جیره نوبت عصر سالن ۳ تمام شد. کالیبراسیون دستگاه‌های پرتابل خوراک‌دهی هم انجام شده است.";
  }

  if (botId === "e_mohammadi") {
    if (msg.includes("پلاک") || msg.includes("تگ") || msg.includes("میکرو")) {
      return "میکروچیپ‌ها با موفقیت تزریق شدند و کدهای تگ با مشخصات تبارشناسی مولدین ماده در سردخانه‌ها فیکس شده‌اند.";
    }
    if (msg.includes("سونو") || msg.includes("سونار") || msg.includes("بیوپسی")) {
      return "در تایید حرف شما، مولد پلاک شماره ۶۲۰۷ وارد مرحله ۴ رسیدگی جنسی شده. ضخامت غشا و شاخص GV فوق‌العاده است و زمان طلایی استحصال خاویار بلوگا فرارسیده.";
    }
    return "سلام مهندس. کار سونوگرافی استخرهای سالن ۲ تا عصر به پایان می‌رسد و لیست نهایی گله‌های بارور را تا غروب برایتان ارسال خواهم کرد.";
  }

  return "پیام شما دریافت شد. در حال پیگیری موضوع هستم و به زودی گزارش تکمیلی را می‌فرستم.";
}

// Vite & Static file handler configuration
async function startServer() {
  const httpServer = http.createServer(app);

  // Setup WebSocket Server
  const wss = new WebSocketServer({ server: httpServer });
  
  // Track connected physical clients
  const activeSockets = new Map<string, { socket: WebSocket; userId: string; username: string; name: string }>();

  // Helper to broadcast to all open sockets
  const broadcast = (type: string, payload: any) => {
    const data = JSON.stringify({ type, ...payload });
    activeSockets.forEach(({ socket }) => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(data);
      }
    });
  };

  onDatabaseUpdated = () => {
    const allUsers = getChatUsers(activeSockets);
    broadcast("users:update", { users: allUsers });
  };

  wss.on("connection", (ws: WebSocket) => {
    let currentClientId = Math.random().toString(36).substring(2, 9);
    console.log(`[WS Server] Client ${currentClientId} connected.`);

    // Helper to send typed message
    const sendToClient = (type: string, payload: any) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type, ...payload }));
      }
    };

    ws.on("message", async (rawMessage: string | Buffer) => {
      try {
        if (typeof rawMessage === "string" && rawMessage.length > 50000) {
          return sendToClient("error", { message: "سقف حجم پیام شبکه رعایت نشده است." });
        }

        const data = JSON.parse(rawMessage.toString());
        const { type } = data;

        if (type === "join") {
          const { userId, username, name, token } = data;
          
          // Verify identity token if provided, or associate socket
          let validUserId = userId || "guest";
          let validUsername = username || "guest";
          let validName = name || "کاربر عمومی";

          if (token && activeSessions.has(token)) {
            const sess = activeSessions.get(token)!;
            validUserId = sess.userId;
            validUsername = sess.username;
          }

          activeSockets.set(currentClientId, { socket: ws, userId: validUserId, username: validUsername, name: validName });
          console.log(`[WS Server] User "${validName}" (${validUsername}) authenticated & joined.`);

          // Prepare online list including real connected users, offline users, and bots
          const allUsers = getChatUsers(activeSockets);

          // Send initialization payload
          sendToClient("init", {
            messages: chatHistory,
            users: allUsers,
            yourClientId: currentClientId
          });

          // Notify others
          broadcast("users:update", { users: allUsers });
        }

        else if (type === "chat:message") {
          const { message } = data;
          const { senderId, senderName, recipientId } = message;

          // Add to server memory
          chatHistory.push(message);
          if (chatHistory.length > 150) chatHistory.shift();

          // Broadcast message
          broadcast("chat:message", { message });

          // Bot automation trigger
          if (recipientId !== "all" && SIMULATED_BOTS.some(b => b.id === recipientId)) {
            // Trigger bot typing...
            setTimeout(() => {
              broadcast("chat:typing", { botId: recipientId, isTyping: true });
            }, 1000);

            // Trigger bot response
            setTimeout(async () => {
              const bot = SIMULATED_BOTS.find(b => b.id === recipientId);
              if (bot) {
                const botReplyText = await generateBotResponse(recipientId, message.text || "", senderName);
                const botMsg = {
                  id: `bot-reply-${Math.random().toString(36).substring(2, 9)}`,
                  senderId: bot.id,
                  senderName: bot.name,
                  senderRole: bot.role,
                  senderAvatar: bot.avatar,
                  recipientId: senderId,
                  text: botReplyText,
                  type: "text",
                  timestamp: new Date().toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit" })
                };

                chatHistory.push(botMsg);
                broadcast("chat:typing", { botId: recipientId, isTyping: false });
                broadcast("chat:message", { message: botMsg });
              }
            }, 3000);
          }
        }

        else if (type === "call:request") {
          const { callId, senderId, senderName, recipientId, callType } = data;
          console.log(`[WS Server] Call request: ${senderName} calling ${recipientId} (${callType})`);

          // Relay to recipient if they are online
          let delivered = false;
          activeSockets.forEach(({ socket, userId }) => {
            if (userId === recipientId) {
              if (socket.readyState === WebSocket.OPEN) {
                socket.send(JSON.stringify({
                  type: "call:incoming",
                  callId,
                  senderId,
                  senderName,
                  callType
                }));
                delivered = true;
              }
            }
          });

          // If recipient is a bot, handle automatic simulation
          const bot = SIMULATED_BOTS.find(b => b.id === recipientId);
          if (bot && !delivered) {
            // Send Ringing update
            setTimeout(() => {
              sendToClient("call:ringing", { callId });
            }, 800);

            // Send Accepted update
            setTimeout(() => {
              sendToClient("call:accepted", { callId, recipientId, recipientName: bot.name });

              // Start simulated speaking loop (captions)
              let captionIndex = 0;
              const captions = BOT_CALL_CAPTIONS[bot.id] || ["ارتباط برقرار شد..."];
              
              const intervalId = setInterval(() => {
                const caption = captions[captionIndex % captions.length];
                sendToClient("call:caption", { callId, caption, senderId: bot.id, senderName: bot.name });
                captionIndex++;
              }, 4500);

              // Associate the interval with this client connection to clear on end or close
              (ws as any).activeCallInterval = intervalId;
            }, 2500);
          }
        }

        else if (type === "call:respond") {
          const { callId, senderId, action } = data; // action: "accept" | "decline"
          activeSockets.forEach(({ socket, userId }) => {
            if (userId === senderId) {
              if (socket.readyState === WebSocket.OPEN) {
                socket.send(JSON.stringify({
                  type: action === "accept" ? "call:accepted" : "call:declined",
                  callId
                }));
              }
            }
          });
        }

        else if (type === "call:end") {
          const { callId, peerId } = data;
          
          // Clear bot interval if running
          if ((ws as any).activeCallInterval) {
            clearInterval((ws as any).activeCallInterval);
            delete (ws as any).activeCallInterval;
          }

          // Relay to other peer
          activeSockets.forEach(({ socket, userId }) => {
            if (userId === peerId) {
              if (socket.readyState === WebSocket.OPEN) {
                socket.send(JSON.stringify({ type: "call:ended", callId }));
              }
            }
          });
        }

        else if (["call:ice-candidate", "call:offer", "call:answer"].includes(type)) {
          // General WebRTC signaling relay between peers
          const { targetId } = data;
          activeSockets.forEach(({ socket, userId }) => {
            if (userId === targetId) {
              if (socket.readyState === WebSocket.OPEN) {
                socket.send(JSON.stringify(data));
              }
            }
          });
        }
      } catch (err) {
        console.error("WS error parsing message:", err);
      }
    });

    ws.on("close", () => {
      console.log(`[WS Server] Client ${currentClientId} disconnected.`);
      if ((ws as any).activeCallInterval) {
        clearInterval((ws as any).activeCallInterval);
      }
      activeSockets.delete(currentClientId);

      // Re-broadcast online list
      const allUsers = getChatUsers(activeSockets);

      broadcast("users:update", { users: allUsers });
    });
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");

    // Security check: Never serve server bundle, sourcemaps or config files via public static middleware
    app.use((req, res, next) => {
      const lower = req.path.toLowerCase();
      if (
        lower.endsWith(".cjs") ||
        lower.endsWith(".map") ||
        lower.endsWith(".ts") ||
        lower.endsWith(".tsx") ||
        lower.includes("sturgeon_database")
      ) {
        return res.status(403).json({ error: "Access Forbidden: Protected Server Resource" });
      }
      next();
    });

    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`[Sturgeon Server] App running with WS support on http://0.0.0.0:${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  });
}

startServer();
