/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type AppLanguage = "fa" | "ar" | "en" | "de" | "ru";

export interface TranslationDictionary {
  farmName: string;
  subTitle: string;
  systemTitle: string;
  tabs: {
    map: string;
    stats: string;
    realtime: string;
    feeding: string;
    lab: string;
    mortality: string;
    transfer: string;
    archive: string;
    feedmill: string;
    inventory: string;
    facilities: string;
    chat: string;
    settings: string;
    report: string;
  };
  actions: {
    login: string;
    logout: string;
    save: string;
    cancel: string;
    search: string;
    sync: string;
    export: string;
    print: string;
    quickLog: string;
  };
  veterinaryDisclaimer: string;
  securityNotice: string;
  status: {
    online: string;
    offline: string;
    syncing: string;
  };
}

export const TRANSLATIONS: Record<AppLanguage, TranslationDictionary> = {
  fa: {
    farmName: "مزرعه خاویاری فتحی",
    subTitle: "سامانه پایش هوشمند و مدیریت متمرکز پرورش تاس‌ماهیان",
    systemTitle: "سامانه سوپر ERP شیلاتی فتحی",
    tabs: {
      map: "نقشه زنده سالن‌ها",
      stats: "داشبورد تحلیلی بیوماس",
      realtime: "پایش آنی استخرها",
      feeding: "تغذیه و FCR",
      lab: "آزمایشگاه و سونوگرافی",
      mortality: "ثبت تلفات",
      transfer: "سورت و جابجایی",
      archive: "بایگانی الکترونیک",
      feedmill: "کارخانه خوراک",
      inventory: "انبار مرکزی",
      facilities: "تأسیسات و برق",
      chat: "ارتباطات و بیسیم",
      settings: "تنظیمات سامانه",
      report: "شناسنامه CITES"
    },
    actions: {
      login: "ورود به سامانه",
      logout: "خروج از حساب",
      save: "ذخیره تغییرات",
      cancel: "انصراف",
      search: "جستجوی پیشرفته",
      sync: "همگام‌سازی شبکه",
      export: "خروجی اکسل/PDF",
      print: "چاپ گزارش",
      quickLog: "ثبت سریع داده"
    },
    veterinaryDisclaimer: "⚠️ توجه کلینیکی: راهکارها و دوزهای پیشنهادی این سامانه تحلیلی است و جایگزین تاییدیه دامپزشک ارشد شیلات نیست. هرگونه تزریق هورمونی، حمام دارویی یا تغییر رژیم غذایی نیازمند تایید مسئول فنی فارم می‌باشد.",
    securityNotice: "نشست کاری شما با پروتکل امنیتی هش شده و توکن اختصاصی رمزنگاری شده محافظت می‌شود.",
    status: {
      online: "برقرار (برخط)",
      offline: "آفلاین (محلی)",
      syncing: "در حال همگام‌سازی..."
    }
  },
  ar: {
    farmName: "مزرعة فتحي للكافيار",
    subTitle: "نظام الرصد الذكي والإدارة المركزية لاستزراع أسماك الحفش",
    systemTitle: "نظام فتحي سوبر ERP للاستزراع المائي",
    tabs: {
      map: "الخريطة الحية للقاعات",
      stats: "لوحة تحليلات الكتلة الحيوية",
      realtime: "المراقبة الفورية للأحواض",
      feeding: "التغذية ومعامل التحويل (FCR)",
      lab: "المختبر والسونار",
      mortality: "تسجيل الوفيات",
      transfer: "الفرز والنقل",
      archive: "الأرشيف الإلكتروني",
      feedmill: "مصنع الأعلاف",
      inventory: "المستودع المركزي",
      facilities: "المرافق والكهرباء",
      chat: "الاتصالات واللاسلكي",
      settings: "إعدادات النظام",
      report: "شهادة CITES"
    },
    actions: {
      login: "تسجيل الدخول",
      logout: "تسجيل الخروج",
      save: "حفظ التغييرات",
      cancel: "إلغاء",
      search: "بحث متقدم",
      sync: "مزامنة الشبكة",
      export: "تصدير Excel/PDF",
      print: "طباعة التقرير",
      quickLog: "تسجيل سريع"
    },
    veterinaryDisclaimer: "⚠️ تنبيه طبي بيطري: الحلول والجرعات المقترحة عبر هذا النظام إسترشادية فقط ولا تغني عن موافقة الطبيب البيطري المعتمد للاستزراع المائي.",
    securityNotice: "جلسة العمل الخاصة بك محمية بتشفير الأمان العالي والرموز المشفرة.",
    status: {
      online: "متصل (مباشر)",
      offline: "غير متصل (محلي)",
      syncing: "جاري المزامنة..."
    }
  },
  en: {
    farmName: "Fathi Sturgeon & Caviar Farm",
    subTitle: "Smart Monitoring & Centralized Sturgeon Aquaculture ERP",
    systemTitle: "Fathi Fisheries Super ERP",
    tabs: {
      map: "Live Hall Map",
      stats: "Biomass Analytics",
      realtime: "Real-time Monitoring",
      feeding: "Feeding & FCR",
      lab: "Lab & Sonography",
      mortality: "Mortality Logs",
      transfer: "Sorting & Transfer",
      archive: "Digital Archive",
      feedmill: "Feed Mill Plant",
      inventory: "Central Warehouse",
      facilities: "Facilities & Power",
      chat: "Comms & Radio",
      settings: "System Settings",
      report: "CITES Passport"
    },
    actions: {
      login: "System Login",
      logout: "Sign Out",
      save: "Save Changes",
      cancel: "Cancel",
      search: "Advanced Search",
      sync: "Network Sync",
      export: "Export Excel/PDF",
      print: "Print Report",
      quickLog: "Quick Entry"
    },
    veterinaryDisclaimer: "⚠️ Veterinary Disclaimer: System suggestions and dosages are analytical recommendations and do not replace formal approval from a certified aquaculture veterinarian.",
    securityNotice: "Your session is secured with hashed credentials and encrypted tokens.",
    status: {
      online: "Online",
      offline: "Offline Mode",
      syncing: "Syncing..."
    }
  },
  de: {
    farmName: "Fathi Stör- & Kaviar-Farm",
    subTitle: "Intelligente Überwachung & Zentrales Störzucht-ERP",
    systemTitle: "Fathi Fischerei Super ERP",
    tabs: {
      map: "Live-Hallenkarte",
      stats: "Biomasse-Analytik",
      realtime: "Echtzeit-Überwachung",
      feeding: "Fütterung & FCR",
      lab: "Labor & Sonografie",
      mortality: "Mortalitätsprotokoll",
      transfer: "Sortierung & Transfer",
      archive: "Digitales Archiv",
      feedmill: "Futtermittelwerk",
      inventory: "Zentrallager",
      facilities: "Anlagen & Strom",
      chat: "Funk & Kommunikation",
      settings: "Systemeinstellungen",
      report: "CITES-Pass"
    },
    actions: {
      login: "Anmelden",
      logout: "Abmelden",
      save: "Änderungen speichern",
      cancel: "Abbrechen",
      search: "Erweiterte Suche",
      sync: "Netzwerk-Sync",
      export: "Export Excel/PDF",
      print: "Bericht drucken",
      quickLog: "Schnelleingabe"
    },
    veterinaryDisclaimer: "⚠️ Veterinärhinweis: Systemempfehlungen und Dosierungen sind analytische Richtwerte und ersetzen nicht die Freigabe durch einen qualifizierten Fischereitierarzt.",
    securityNotice: "Ihre Sitzung ist mit gehashten Anmeldeinformationen und verschlüsselten Tokens geschützt.",
    status: {
      online: "Online",
      offline: "Offline-Modus",
      syncing: "Synchronisierung..."
    }
  },
  ru: {
    farmName: "Осетровое Хозяйство Фатхи",
    subTitle: "Умный мониторинг и централизованное УЗВ осетрового комплекса",
    systemTitle: "Рыбоводческая Супер ERP Фатхи",
    tabs: {
      map: "Интерактивная Карта Цехов",
      stats: "Аналитика Биомассы",
      realtime: "Мониторинг Бассейнов",
      feeding: "Кормление и FCR",
      lab: "Лаборатория и УЗИ",
      mortality: "Учет Отхода",
      transfer: "Сортировка и Пересадки",
      archive: "Цифровой Архив",
      feedmill: "Кормоцех",
      inventory: "Центральный Склад",
      facilities: "Энергокомплекс и Инженерия",
      chat: "Связь и Рация",
      settings: "Настройки Системы",
      report: "Паспорт CITES"
    },
    actions: {
      login: "Войти в систему",
      logout: "Выйти",
      save: "Сохранить",
      cancel: "Отмена",
      search: "Расширенный поиск",
      sync: "Синхронизация",
      export: "Экспорт Excel/PDF",
      print: "Печать отчета",
      quickLog: "Быстрый ввод"
    },
    veterinaryDisclaimer: "⚠️ Ветеринарная оговорка: Рекомендации и дозировки являются аналитическими расчетами и не заменяют официального заключения главного ихтиопатолога.",
    securityNotice: "Сессия защищена хешированными учетными данными и зашифрованными токенами.",
    status: {
      online: "В сети",
      offline: "Офлайн-режим",
      syncing: "Синхронизация..."
    }
  }
};

export const getLanguageDirection = (lang: AppLanguage): "rtl" | "ltr" => {
  return lang === "fa" || lang === "ar" ? "rtl" : "ltr";
};

export const formatNumber = (num: number, lang: AppLanguage, options?: Intl.NumberFormatOptions): string => {
  const localeMap: Record<AppLanguage, string> = {
    fa: "fa-IR",
    ar: "ar-EG",
    en: "en-US",
    de: "de-DE",
    ru: "ru-RU"
  };
  try {
    return new Intl.NumberFormat(localeMap[lang] || "fa-IR", options).format(num);
  } catch {
    return num.toString();
  }
};

export const formatDate = (date: Date | string, lang: AppLanguage): string => {
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return typeof date === "string" ? date : "";

  const localeMap: Record<AppLanguage, string> = {
    fa: "fa-IR-u-ca-persian",
    ar: "ar-EG",
    en: "en-US",
    de: "de-DE",
    ru: "ru-RU"
  };

  try {
    return new Intl.DateTimeFormat(localeMap[lang] || "fa-IR-u-ca-persian", {
      year: "numeric",
      month: "short",
      day: "numeric"
    }).format(d);
  } catch {
    return d.toLocaleDateString();
  }
};
