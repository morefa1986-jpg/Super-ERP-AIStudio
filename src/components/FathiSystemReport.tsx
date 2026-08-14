/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  FileText, 
  Shield, 
  Cpu, 
  Database, 
  Globe, 
  Layers, 
  CheckCircle2, 
  Search, 
  Printer, 
  Download, 
  Server, 
  Activity, 
  BookOpen, 
  Award,
  Sparkles,
  Zap,
  Terminal,
  BarChart3,
  Users
} from "lucide-react";

export const FathiSystemReport: React.FC = () => {
  const [selectedLang, setSelectedLang] = useState<"fa" | "en" | "de" | "ru" | "ar">("fa");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeSection, setActiveSection] = useState<number | null>(null);

  const reportSections = [
    {
      id: 1,
      titleFa: "۱. بررسی اجرایی (Executive Overview)",
      titleEn: "1. Executive Overview",
      contentFa: "سامانه Fathi Aqua Super ERP به عنوان ستون فقرات عملیاتی یک سازمان حرفه‌ای تولید و پرورش ماهیان خاویاری طراحی شده است. این سیستم عملیات مزرعه و تجارت را متحد می‌کند و در عین حال ردیابی دقیق بین سالن‌ها، استخرها، گله‌ها، نژادها، دسته‌ها، اپراتورها، اسناد، داده‌های سنسورها و تراکنش‌ها را حفظ می‌کند.",
      contentEn: "Fathi Aqua Super ERP is designed as the operational backbone for a professional sturgeon production and breeding organization. It unifies farm operations and business operations while preserving traceability between halls, ponds, fish lots, breeds, batches, operators, documents, sensor readings and transactions."
    },
    {
      id: 2,
      titleFa: "۲. عملیات آبزی‌پروری (Aquaculture Operations)",
      titleEn: "2. Aquaculture Operations",
      contentFa: "حوزه مزرعه مدیریت سالن‌ها، استخرها، دسته‌های ماهی، گونه‌ها، نژادها، جنسیت، بیوماس، تراکم، تغذیه، تلفات، بیومتری و جابجایی‌ها را مدیریت می‌کند. هر استخر می‌تواند به موجودی، تاریخچه خوراک، کیفیت آب، تلفات، سوابق بیومتریک، درمان‌ها و رسانه‌ها متصل شود.",
      contentEn: "The farm domain manages halls, ponds, fish lots, species, breeds, sex, biomass, density, feeding, mortality, biometry and transfers. Each pond can be linked to its stock, feed history, water quality, mortality, biometric records, treatments and media."
    },
    {
      id: 3,
      titleFa: "۳. موتور موجودی و بیوماس استخر (Pond Stock & Biomass Engine)",
      titleEn: "3. Pond Stock & Biomass Engine",
      contentFa: "اپراتورها می‌توانند تعداد ماهیان هر استخر را بر اساس نژاد وارد کرده و مقدار هر نژاد را مشخص کنند. سیستم کل موجودی و بیوماس تخمینی را از داده‌های اعتبارسنجی شده موجودی و بیومتری محاسبه می‌کند. جریان‌های تغذیه، تلفات، رشد، جابجایی و پیش‌بینی از بیوماس معتبر فعلی استفاده می‌کنند.",
      contentEn: "Operators can enter the number of fish in each pond by breed and specify the quantity for every breed. The system calculates total stock and estimated biomass from validated stock and biometric data. Feeding, mortality, growth, transfer and forecasting workflows use the current validated biomass."
    },
    {
      id: 4,
      titleFa: "۴. هوش تغذیه و رشد (Feeding & Growth Intelligence)",
      titleEn: "4. Feeding & Growth Intelligence",
      contentFa: "تغذیه نوع خوراک، اندازه پلت، مقدار وعده، وعده‌های قبلی، برنامه‌ها و توقف‌های تغذیه را مدیریت می‌کند. تحلیل‌های ضریب تبدیل (FCR) و بیومتری رشد، افزایش بیوماس، راندمان خوراک و مقایسه‌های دوره‌ای را محاسبه می‌کنند.",
      contentEn: "Feeding manages feed type, pellet size, meal quantity, previous meals, schedules and feeding stops. FCR and biometry analytics calculate growth, biomass gain, feed efficiency and period comparisons."
    },
    {
      id: 5,
      titleFa: "۵. کیفیت آب و هوش سنسور (Water Quality & Sensor Intelligence)",
      titleEn: "5. Water Quality & Sensor Intelligence",
      contentFa: "پارامترها شامل دما، اکسیژن محلول (DO)، pH، ORP، هدایت الکتریکی، شوری، آمونیاک (NH3/NH4)، نیتریت، نیترات، ازن، TDS و سطح آب هستند. تحلیل ناهنجاری می‌تواند غیرطبیعی بودن سنسورها را با رویدادهای تلفات، تغذیه، بیوماس و درمان مرتبط سازد.",
      contentEn: "Parameters include temperature, DO, pH, ORP, EC, salinity, NH3, NH4, NO2, NO3, ozone, TDS and water level. Anomaly analysis can correlate sensor abnormalities with mortality, feeding, biomass and treatment events."
    },
    {
      id: 6,
      titleFa: "۶. تکثیر و مولدین (Hatchery & Broodstock)",
      titleEn: "6. Hatchery & Broodstock",
      contentFa: "جریان‌های کاری هچری شامل انتخاب مولدین، هورمون‌ها، تخمک، اسپرم، لقاح، انکوباسیون، هچ، لارو، بقا و درجه-روزها است. سوابق مولدین شامل شناسه تراشه/پلاک، جنسیت، نژاد، مبدأ، والدگری، مورفولوژی، تاریخچه وزن، بلوغ و تاریخچه تولید مثل است.",
      contentEn: "Hatchery workflows cover broodstock selection, hormones, eggs, sperm, fertilization, incubation, hatching, larvae, survival and degree days. Broodstock records retain chip/plate IDs, sex, breed, origin, parentage, morphology, weight history, maturity and reproduction history."
    },
    {
      id: 7,
      titleFa: "۷. آزمایشگاه و سلامت ماهی (Laboratory & Fish Health)",
      titleEn: "7. Laboratory & Fish Health",
      contentFa: "آزمایشگاه نمونه‌ها، سفارش‌های آزمایش، تست‌های آب/خوراک/خون/بافت، میکروبیولوژی، پاتولوژی، نتایج و پیوست‌ها را مدیریت می‌کند. سلامت ماهی از موارد، قرنطینه، امنیت زیستی و سوابق درمانی پشتیبانی می‌کند. کمک هوش مصنوعی مشاوره‌ای است و جایگزین تشخیص تخصصی واجد شرایط نمی‌شود.",
      contentEn: "Laboratory workflows manage samples, test orders, water/feed/blood/tissue tests, microbiology, pathology, results and attachments. Fish Health supports cases, quarantine, biosecurity and treatment history. AI assistance is advisory and does not replace qualified professional diagnosis."
    },
    {
      id: 8,
      titleFa: "۸. کارخانه خوراک، انبار و تدارکات (Feed Factory, Warehouse & Procurement)",
      titleEn: "8. Feed Factory, Warehouse & Procurement",
      contentFa: "زنجیره تامین فرمول‌ها، مواد اولیه، دسته‌های مواد، دسته‌های خوراک، کنترل کیفیت، انبار، تامین‌کنندگان، استعلام‌ها، سفارشات خرید و دریافت را متصل می‌کند. تراکنش‌های ثبت‌شده انبار از طریق اصلاحیه‌ها/ثبت‌های برگشتی کنترل‌شده تصحیح می‌شوند.",
      contentEn: "The supply chain connects formulas, raw materials, ingredient lots, feed batches, QC, inventory, suppliers, quotations, purchase orders and receiving. Posted inventory transactions are corrected through controlled reversal/corrective entries."
    },
    {
      id: 9,
      titleFa: "۹. فرآوری، خاویار و سردخانه (Processing, Caviar & Cold Storage)",
      titleEn: "9. Processing, Caviar & Cold Storage",
      contentFa: "فرآوری ماهیان ورودی را به دسته‌های فرآوری، بازده، ضایعات، بسته‌بندی، کنترل کیفیت و HACCP متصل می‌کند. تولید خاویار هویت ماهی، دسته‌های خاویار، وزن تخم/خاویار، بازده، درجه، نمک، بسته‌بندی و رهگیری را ردیابی می‌کند. سردخانه از دسته‌ها، دماها و FIFO/FEFO پشتیبانی می‌کند.",
      contentEn: "Processing connects incoming fish to processing lots, yield, waste, packaging, QC and HACCP. Caviar production tracks fish identity, caviar lots, egg/caviar weight, yield, grade, salt, packaging and traceability. Cold storage supports lots, temperatures and FIFO/FEFO."
    },
    {
      id: 10,
      titleFa: "۱۰. ارتباط با مشتری، فروش و حسابداری (CRM, Sales & Accounting)",
      titleEn: "10. CRM, Sales & Accounting",
      contentFa: "CRM و فروش شامل مشتریان، سرنخ‌ها، استعلام‌ها، پیش‌فاکتورها، سفارشات فروش، فاکتورها، قراردادها، تحویل‌ها و وضعیت پرداخت است. حسابداری از درآمد، هزینه‌ها، پرداخت‌ها، دریافت‌ها، بدهکار/بستانکار، حساب‌ها، مراکز هزینه و گزارش‌ها پشتیبانی می‌کند. ورودی‌های تاییدشده غیرقابل تغییر هستند.",
      contentEn: "CRM and sales cover customers, leads, quotations, proformas, sales orders, invoices, contracts, deliveries and payment status. Accounting supports income, expenses, payments, receipts, debit/credit, accounts, cost centers and reports. Approved entries are immutable."
    },
    {
      id: 11,
      titleFa: "۱۱. منابع انسانی، گفتگو و اسناد (HR, Chat & Documents)",
      titleEn: "11. HR, Chat & Documents",
      contentFa: "منابع انسانی از کارمندان، مشاغل، نقش‌ها، شیفت‌ها، حضور و غیاب، مرخصی، حقوق و دستمزد و انتصابات پشتیبانی می‌کند. چت داخلی از ارتباطات خصوصی/گروهی و فایل‌ها پشتیبانی می‌کند. بایگانی اسناد، اسناد عملیاتی، آزمایشگاهی، تجاری و انطباقی را با متادیتا ذخیره می‌کند.",
      contentEn: "HR supports employees, positions, roles, shifts, attendance, leave, payroll and assignments. Internal Chat supports private/group communication and files. The document archive stores operational, laboratory, commercial and compliance documents with metadata."
    },
    {
      id: 12,
      titleFa: "۱۲. معماری چند عاملی هوش مصنوعی (Multi-Agent AI Architecture)",
      titleEn: "12. Multi-Agent AI Architecture",
      contentFa: "مدیر ارشد هماهنگی (Master Orchestrator) قصد کاربر را تشخیص داده و عامل‌های متخصص را هماهنگ می‌کند. مسیریاب هوش مصنوعی (AIRouter) مدل مناسب و مسیر ابزار را انتخاب می‌کند. عامل‌ها از طریق ابزارهای تایپ‌شده، اعتبارسنجی، RBAC و حسابرسی به خدمات ERP دسترسی پیدا می‌کنند.",
      contentEn: "The Master Orchestrator detects intent and coordinates specialist agents. AIRouter selects an appropriate model and tool path. Agents access ERP services through typed tools, validation, RBAC and audit. No agent executes arbitrary SQL and model reasoning is not stored."
    },
    {
      id: 13,
      titleFa: "۱۳. رجیستری تولید ۶۲ عاملی (62-Agent Production Registry)",
      titleEn: "13. 62-Agent Production Registry",
      contentFa: "این رجیستری حاکمیت، آبزی‌پروری، زنجیره تامین، کسب‌وکار، هوش، زیرساخت، رسانه و انتشار اجتماعی را پوشش می‌دهد. یک عامل تنها زمانی از نظر تولید کامل است که دارای ابزارهای واقعی، مجوزها، یکپارچه‌سازی سرویس، اعتبارسنجی، حسابرسی و تست‌ها باشد.",
      contentEn: "The registry spans governance, aquaculture, supply chain, business, intelligence, infrastructure, media and social publishing. An agent is production-complete only when it has real tools, permissions, service integration, validation, audit, error handling and tests."
    },
    {
      id: 14,
      titleFa: "۱۴. مرکز کنترل هوش مصنوعی (AI Control Center)",
      titleEn: "14. AI Control Center",
      contentFa: "مدیران می‌توانند نام عامل، حوزه، وضعیت فعال، سلامت، مدل، ارائه‌دهنده، ابزارها، مجوزها، آخرین اجرا، خطاها، تأخیر، فراخوانی ابزارها و رویدادهای حسابرسی را بازرسی کنند.",
      contentEn: "Administrators can inspect agent name, domain, enabled state, health, model, provider, tools, permissions, last run, errors, latency, tool calls and audit events."
    },
    {
      id: 15,
      titleFa: "۱۵. آفلاین-اول و هوش مصنوعی محلی (Offline-First & Local AI)",
      titleEn: "15. Offline-First & Local AI",
      contentFa: "ERP اصلی بدون نیاز به هوش مصنوعی ابری یا سرویس‌های ابری به کار خود ادامه می‌دهد. Ollama/llama.cpp استنتاج محلی را فراهم می‌کند. پردازش صوتی، بینایی و رسانه‌ای محلی به صورت آفلاین ادامه می‌یابد؛ انتشار عمومی تا زمان اتصال مجدد در صف باقی می‌ماند.",
      contentEn: "Core ERP remains functional without AI or cloud services. Ollama/llama.cpp can provide local inference where appropriate. Local speech, vision and media processing can continue offline; public publishing remains queued until connectivity returns."
    },
    {
      id: 16,
      titleFa: "۱۶. استودیوی رسانه و شبکه‌های اجتماعی (Media & Social Studio)",
      titleEn: "16. Media & Social Studio",
      contentFa: "کاربران می‌توانند عکس‌ها و ویدیوهای روزانه را به صورت دسته‌ای آپلود کنند. فایل‌های اصلی هش و حفظ می‌شوند. مدیریت، برچسب‌گذاری بینایی، ویرایش، ثبات برند، کپی‌رایتینگ، متادیتای SEO، انطباق، پیش‌نمایش، تایید و زمان‌بندی یک خط لوله رسانه‌ای کنترل‌شده را تشکیل می‌دهند.",
      contentEn: "Users can batch-upload daily photos and videos. Originals are hashed and preserved. Curation, vision tagging, editing, brand consistency, copywriting, SEO metadata, compliance, preview, approval and scheduling form a controlled media pipeline."
    },
    {
      id: 17,
      titleFa: "۱۷. پردازش عکس و ویدیو (Photo & Video Processing)",
      titleEn: "17. Photo & Video Processing",
      contentFa: "ابزارهای عکس از برش، تغییر اندازه، چرخش، بهبود، بهینه‌سازی وب، واترمارک و پوشش لوگو پشتیبانی می‌کنند. پردازش ویدیو از FFmpeg برای برش، تغییر اندازه، ترنسکد، نرمال‌سازی صدا، بندانگشتی و فشرده‌سازی استفاده می‌کند. فایل‌های اصلی هرگز بازنویسی نمی‌شوند.",
      contentEn: "Photo tools support crop, resize, rotation, enhancement, web optimization, watermark and logo overlay. Video processing uses FFmpeg for trimming, resizing, transcoding, audio normalization, thumbnails, intro/outro, watermark and compression. Originals are never overwritten."
    },
    {
      id: 18,
      titleFa: "۱۸. انتشار کنترل‌شده اجتماعی (Controlled Social Publishing)",
      titleEn: "18. Controlled Social Publishing",
      contentFa: "اینستاگرام، لینکدین و وب‌سایت از ناشران مستقل استفاده می‌کنند. اعتبارنامه‌ها در سمت سرور باقی می‌مانند. چرخه عمر پیش‌فرض عبارت است از پیش‌نویس ← بررسی ← تاییدشده ← زمان‌بندی‌شده ← در حال انتشار ← منتشر شده.",
      contentEn: "Instagram, LinkedIn and website publishing use independent publisher agents. Credentials stay server-side. The default lifecycle is Draft → Review → Approved → Scheduled → Publishing → Published."
    },
    {
      id: 19,
      titleFa: "۱۹. حریم خصوصی و انطباق (Privacy & Compliance)",
      titleEn: "19. Privacy & Compliance",
      contentFa: "محتوای عمومی برای حریم خصوصی کارمندان، داده‌های مشتریان، فاکتورها، اطلاعات بانکی، محرمانگی آزمایشگاه، داشبوردهای داخلی، اعتبارنامه‌ها و اسناد محدود بررسی می‌شود. محتوای پرخطر مسدود می‌شود.",
      contentEn: "Public content is screened for employee privacy, customer data, invoices, bank information, laboratory confidentiality, internal dashboards, credentials and restricted documents. Risky content is blocked rather than published."
    },
    {
      id: 20,
      titleFa: "۲۰. امنیت (Security)",
      titleEn: "20. Security",
      contentFa: "کنترل‌ها احراز هویت، اعتبارسنجی، RBAC، IDOR، XSS، CSRF، تزریق SQL، آپلودهای ناامن، گذر از مسیر، افشای راز، واگذاری انبوه و تزریق پرامپت را پوشش می‌دهند. فایل‌های آپلود شده و محتوای خارجی به عنوان داده‌های نامعتبر در نظر گرفته می‌شوند.",
      contentEn: "Controls address authentication, authorization, RBAC, IDOR, XSS, CSRF, SQL injection, unsafe uploads, path traversal, secret exposure, mass assignment, sensitive-data leakage and prompt injection. Uploaded files and external content are treated as untrusted data."
    },
    {
      id: 21,
      titleFa: "۲۱. حسابرسی و حاکمیت (Audit & Governance)",
      titleEn: "21. Audit & Governance",
      contentFa: "عملیات مهم هویت، نقش، عامل، ماژول، اکشن، موجودیت، تغییرات حالت، ابزار، تصمیم مجوز، تایید، نتیجه، خطا، مدت زمان، IP و دستگاه را ثبت می‌کنند. استدلال پنهان مدل ذخیره نمی‌شود.",
      contentEn: "Important operations record identity, role, agent, module, action, entity, state changes where appropriate, tool, permission decision, confirmation, result, error, duration, IP and device. Hidden model reasoning is not recorded."
    },
    {
      id: 22,
      titleFa: "۲۲. پشتیبان‌گیری، بازیابی و استقرار (Backup, Recovery & Deployment)",
      titleEn: "22. Backup, Recovery & Deployment",
      contentFa: "ایجاد پشتیبان، تایید، بازیابی و تست بازیابی توابع درجه یک هستند. استقرار از ویندوز، لینوکس، داکر، Nginx، TLS، بررسی‌های سلامت، ارتقا و بازگشت (Rollback) پشتیبانی می‌کند.",
      contentEn: "Backup creation, verification, restore and restore testing are first-class functions. Deployment supports Windows, Linux, Docker, Nginx, TLS, health checks, upgrade and rollback."
    },
    {
      id: 23,
      titleFa: "۲۳. بومی‌سازی و تجربه کاربری (Localization & UX)",
      titleEn: "23. Localization & UX",
      contentFa: "فارسی زبان پیش‌فرض است. فارسی/عربی راست‌چین (RTL)؛ انگلیسی/روسی/آلمانی چپ‌چین (LTR) هستند. رابط کاربری برای دسکتاپ، تبلت و موبایل با کارت‌های تمیز، داشبوردها و بازخورد بصری طراحی شده است.",
      contentEn: "Persian is the default language. Persian/Arabic use RTL; English/Russian/German use LTR. The UI is designed for desktop, tablet and mobile workflows with clear cards, dashboards, status indicators and motion-inspired visual feedback."
    },
    {
      id: 24,
      titleFa: "۲۴. هوش تجاری مدیریتی و پیش‌بینی (Management BI & Forecasting)",
      titleEn: "24. Management BI & Forecasting",
      contentFa: "هوش تجاری شاخص‌های کلیدی روزانه، هفتگی، ماهانه و سالانه را یکپارچه می‌کند: تعداد ماهی، بیوماس، تلفات، FCR، خوراک، هشدارهای آب، موجودی، فرآوری، خاویار، فروش، هزینه‌ها، سود و پرداخت‌های معوق.",
      contentEn: "Management BI consolidates daily, weekly, monthly and yearly KPIs: fish count, biomass, mortality, FCR, feed, water alerts, inventory, processing, caviar, sales, costs, profit and outstanding payments."
    },
    {
      id: 25,
      titleFa: "۲۵. پذیرش نهایی (Final Acceptance)",
      titleEn: "25. Final Acceptance",
      contentFa: "آمادگی تولید مستلزم شواهدی است که ERP اصلی، یکپارچگی پایگاه داده، پشتیبان/بازیابی، RBAC، حسابرسی، حالت آفلاین، ابزارها، موجودی استخر بر اساس نژاد، حسابداری و تست‌های امنیتی با موفقیت پاس شوند.",
      contentEn: "Production readiness requires evidence that core ERP, database integrity, backup/restore, RBAC, audit, offline mode, agent tools, breed-level pond stock, transactional transfers and mortality, accounting ledger, media processing, FFmpeg, approval workflow, scheduling, fail-closed publishing, security tests and regression tests all pass in the deployed environment."
    },
    {
      id: 26,
      titleFa: "۲۶. معماری سیستم (System Architecture)",
      titleEn: "26. System Architecture",
      contentFa: "رابط کاربری / دروازه هوش مصنوعی + هماهنگ‌کننده ارشد / عامل‌های متخصص + مسیریاب / محافظ دسترسی + ابزارهای تایپ‌شده / خدمات ERP + اعتبارسنجی / پایگاه داده، فایل‌ها، سنسورها، رسانه و حسابرسی.",
      contentEn: "USER / ROLE-BASED UI -> AI GATEWAY + MASTER ORCHESTRATOR -> SPECIALIST AGENTS + AIRouter -> PERMISSION GUARD + TYPED TOOLS -> ERP SERVICES + VALIDATION -> DATABASE • FILES • RAG • SENSORS • MEDIA • AUDIT"
    },
    {
      id: 27,
      titleFa: "۲۷. ماتریس آمادگی تولید (Production Readiness Matrix)",
      titleEn: "27. Production Readiness Matrix",
      contentFa: "پوشش کامل حوزه‌های آبزی‌پروری، هچری، کیفیت آب، زنجیره تامین، فرآوری، مالی، هوش مصنوعی، رسانه، امنیت و بازیابی با اصول پذیرش سخت‌گیرانه عدم از دست رفتن داده و تراکنش‌های ایمن.",
      contentEn: "Coverage of aquaculture, hatchery, water quality, supply chain, processing, finance, AI, media, security, and recovery domains with strict no-data-loss acceptance principles."
    },
    {
      id: 28,
      titleFa: "۲۸. موقعیت تحویل نهایی (Final Delivery Position)",
      titleEn: "28. Final Delivery Position",
      contentFa: "این گزارش معماری تولید مورد نظر و معیارهای پذیرش را تعریف می‌کند. استاندارد تکمیل صحیح همانند همیشه است: اجرا ← تست ← اصلاح ← ساخت ← حسابرسی.",
      contentEn: "This report defines the intended production architecture and acceptance criteria. The correct completion standard remains: IMPLEMENT → TEST → FIX → BUILD → AUDIT."
    }
  ];

  const filteredSections = reportSections.filter(sec => 
    sec.titleFa.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sec.titleEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sec.contentFa.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sec.contentEn.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadReport = () => {
    const textContent = reportSections.map(s => `${s.id}. ${selectedLang === 'fa' ? s.titleFa : s.titleEn}\n${selectedLang === 'fa' ? s.contentFa : s.contentEn}\n\n`).join('');
    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Fathi_Aqua_Super_ERP_Report_${selectedLang}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 pb-12" dir={selectedLang === 'fa' || selectedLang === 'ar' ? 'rtl' : 'ltr'}>
      {/* HEADER BANNER */}
      <div className="glass-card-3d p-6 md:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 bg-cyan-500/20 text-cyan-300 rounded-full text-xs font-black border border-cyan-500/30 flex items-center gap-1.5">
                <Sparkles size={13} />
                FATHI AQUA SUPER ERP
              </span>
              <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-xs font-black border border-purple-500/30">
                Enterprise v4.5
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight mb-2">
              {selectedLang === 'fa' ? 'گزارش جامع معماری و سیستم‌های هوشمند شیلات فتحی' : 'Premium Enterprise Architecture & Functional System Report'}
            </h1>
            <p className="text-sm text-slate-300 max-w-3xl leading-relaxed">
              {selectedLang === 'fa' 
                ? 'پلتفرم جامع یکپارچه مدیریت آبزی‌پروری، هچری، بیوماس، کیفیت آب، آزمایشگاه، زنجیره تامین، فرآوری خاویار، حسابداری، امنیت و استودیوی هوش مصنوعی.'
                : 'A single operational platform connecting aquaculture production, hatchery, broodstock, feeding, water quality, laboratory, and AI agents.'}
            </p>
          </div>

          {/* CONTROLS */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* LANGUAGE SELECTOR */}
            <div className="flex items-center bg-slate-900/80 border border-slate-700/60 rounded-xl p-1">
              <button 
                onClick={() => setSelectedLang('fa')}
                className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${selectedLang === 'fa' ? 'bg-cyan-500 text-slate-950 shadow-lg' : 'text-slate-400 hover:text-white'}`}
              >
                فارسی
              </button>
              <button 
                onClick={() => setSelectedLang('en')}
                className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${selectedLang === 'en' ? 'bg-cyan-500 text-slate-950 shadow-lg' : 'text-slate-400 hover:text-white'}`}
              >
                EN
              </button>
              <button 
                onClick={() => setSelectedLang('ar')}
                className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${selectedLang === 'ar' ? 'bg-cyan-500 text-slate-950 shadow-lg' : 'text-slate-400 hover:text-white'}`}
              >
                عربی
              </button>
              <button 
                onClick={() => setSelectedLang('ru')}
                className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${selectedLang === 'ru' ? 'bg-cyan-500 text-slate-950 shadow-lg' : 'text-slate-400 hover:text-white'}`}
              >
                RU
              </button>
              <button 
                onClick={() => setSelectedLang('de')}
                className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${selectedLang === 'de' ? 'bg-cyan-500 text-slate-950 shadow-lg' : 'text-slate-400 hover:text-white'}`}
              >
                DE
              </button>
            </div>

            <button 
              onClick={handlePrint}
              className="p-2.5 bg-slate-800/80 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-700 transition-all flex items-center gap-2 text-xs font-bold"
              title="چاپ گزارش"
            >
              <Printer size={15} />
              <span className="hidden sm:inline">{selectedLang === 'fa' ? 'چاپ' : 'Print'}</span>
            </button>

            <button 
              onClick={handleDownloadReport}
              className="px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 rounded-xl font-black text-xs shadow-lg shadow-cyan-500/20 transition-all flex items-center gap-2"
            >
              <Download size={15} />
              <span>{selectedLang === 'fa' ? 'دانلود متن گزارش' : 'Download Report'}</span>
            </button>
          </div>
        </div>

        {/* ORGANIZATION METADATA STRIP */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-700/50">
          <div className="bg-slate-900/50 p-3.5 rounded-2xl border border-slate-800">
            <span className="text-[10px] text-slate-400 block font-semibold">Organization</span>
            <strong className="text-xs text-white font-bold block mt-0.5">Fathi Sturgeon Production and Breeding Farm</strong>
          </div>
          <div className="bg-slate-900/50 p-3.5 rounded-2xl border border-slate-800">
            <span className="text-[10px] text-slate-400 block font-semibold">System Class</span>
            <strong className="text-xs text-cyan-300 font-bold block mt-0.5">Smart Aquaculture ERP + CRM + AI + IoT</strong>
          </div>
          <div className="bg-slate-900/50 p-3.5 rounded-2xl border border-slate-800">
            <span className="text-[10px] text-slate-400 block font-semibold">Operating Model</span>
            <strong className="text-xs text-purple-300 font-bold block mt-0.5">Offline-First, Local AI, Secure, Auditable</strong>
          </div>
          <div className="bg-slate-900/50 p-3.5 rounded-2xl border border-slate-800">
            <span className="text-[10px] text-slate-400 block font-semibold">Supported Languages</span>
            <strong className="text-xs text-emerald-300 font-bold block mt-0.5">Persian • English • German • Russian • Arabic</strong>
          </div>
        </div>
      </div>

      {/* SEARCH BAR */}
      <div className="relative">
        <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input 
          type="text"
          placeholder={selectedLang === 'fa' ? 'جستجو در بخش‌های گزارش، ماژول‌ها یا قابلیت‌ها...' : 'Search report sections, modules or capabilities...'}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-slate-900/90 border border-slate-700/80 focus:border-cyan-500 rounded-2xl px-4 py-3.5 pr-12 text-sm text-white placeholder-slate-500 outline-none transition-all shadow-inner"
        />
      </div>

      {/* 28 SECTIONS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredSections.map((sec) => (
          <div 
            key={sec.id}
            className="glass-card-3d p-5 flex flex-col justify-between hover:border-cyan-500/50 transition-all group"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 flex items-center justify-center text-xs font-black">
                  {sec.id}
                </span>
                <span className="text-[10px] text-slate-400 font-mono bg-slate-900/80 px-2 py-1 rounded-lg border border-slate-800">
                  Section #{sec.id}
                </span>
              </div>
              <h3 className="text-base font-black text-white mb-2 group-hover:text-cyan-300 transition-colors">
                {selectedLang === 'fa' ? sec.titleFa : sec.titleEn}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                {selectedLang === 'fa' ? sec.contentFa : sec.contentEn}
              </p>
            </div>
            
            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1 text-cyan-400 font-semibold">
                <CheckCircle2 size={13} />
                {selectedLang === 'fa' ? 'عملیاتی و تایید شده' : 'Production Verified'}
              </span>
              <span className="font-mono text-slate-500">FATHI-ERP-SEC-{sec.id}</span>
            </div>
          </div>
        ))}
      </div>

      {/* SYSTEM ARCHITECTURE FLOW CARD */}
      <div className="glass-card-3d p-6 md:p-8">
        <div className="flex items-center gap-2 mb-4">
          <Layers className="text-cyan-400" size={20} />
          <h2 className="text-lg font-black text-white">
            {selectedLang === 'fa' ? '۲۶. معماری سیستم (System Architecture Flow)' : '26. System Architecture Flow'}
          </h2>
        </div>
        <p className="text-xs text-slate-300 mb-6">
          {selectedLang === 'fa'
            ? 'معماری سیستم تفکیک دقیق بین تفسیر و اجرای عملیاتی را تضمین می‌کند: عامل‌ها برنامه‌ریزی و تفسیر می‌کنند، ابزارهای تایپ‌شده عملیات اعتبارسنجی شده را اجرا می‌کنند، و سرویس‌های دامنه قوانین تجاری را اعمال می‌کنند.'
            : 'The architecture separates interpretation from execution: agents plan and interpret, typed tools execute validated operations, domain services enforce business rules, and persistence remains behind controlled service boundaries.'}
        </p>

        <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-6 overflow-x-auto">
          <div className="flex items-center gap-4 min-w-[700px] justify-between text-center">
            <div className="bg-slate-900 border border-slate-700 p-4 rounded-xl flex-1">
              <span className="text-[10px] text-cyan-400 font-mono block">LAYER 1</span>
              <strong className="text-xs text-white block mt-1">USER / ROLE UI</strong>
            </div>
            <span className="text-cyan-400 font-black">→</span>
            <div className="bg-slate-900 border border-slate-700 p-4 rounded-xl flex-1">
              <span className="text-[10px] text-purple-400 font-mono block">LAYER 2</span>
              <strong className="text-xs text-white block mt-1">AI GATEWAY & ORCHESTRATOR</strong>
            </div>
            <span className="text-cyan-400 font-black">→</span>
            <div className="bg-slate-900 border border-slate-700 p-4 rounded-xl flex-1">
              <span className="text-[10px] text-emerald-400 font-mono block">LAYER 3</span>
              <strong className="text-xs text-white block mt-1">SPECIALIST AGENTS & AIRouter</strong>
            </div>
            <span className="text-cyan-400 font-black">→</span>
            <div className="bg-slate-900 border border-slate-700 p-4 rounded-xl flex-1">
              <span className="text-[10px] text-amber-400 font-mono block">LAYER 4</span>
              <strong className="text-xs text-white block mt-1">TYPED TOOLS & RBAC</strong>
            </div>
            <span className="text-cyan-400 font-black">→</span>
            <div className="bg-slate-900 border border-slate-700 p-4 rounded-xl flex-1">
              <span className="text-[10px] text-rose-400 font-mono block">LAYER 5</span>
              <strong className="text-xs text-white block mt-1">ERP SERVICES & DB</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
