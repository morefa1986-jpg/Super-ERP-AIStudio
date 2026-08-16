/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef, lazy, Suspense } from "react";
import { 
  Building2, 
  Layers, 
  UtensilsCrossed, 
  ArrowRightLeft, 
  ActivitySquare, 
  Gauge, 
  Waves,
  Sparkles,
  RefreshCw,
  FolderSync,
  HeartCrack,
  FlaskConical,
  Menu,
  X,
  Archive,
  PlusCircle,
  Cpu,
  Factory,
  Wheat,
  Warehouse,
  Coins,
  Shield,
  Snowflake,
  Fingerprint,
  Settings,
  MessageSquare,
  Printer,
  FileSpreadsheet,
  Info,
  Download,
  Server,
  Sun,
  Globe,
  FileText,
  Search,
  QrCode
} from "lucide-react";
import { Pool, Hall, MovementLog, FeedingMeal, MortalityLog, SturgeonBreed } from "./types";
import { 
  INITIAL_POOLS, 
  INITIAL_HALLS, 
  INITIAL_MOVEMENTS, 
  INITIAL_FEEDINGS, 
  INITIAL_MORTALITY 
} from "./constants/initialData";
import { DashboardStats } from "./components/DashboardStats";
import PoolQuickLogger from "./components/PoolQuickLogger";
import { SidebarDashboard } from "./components/SidebarDashboard";
import { LoginScreen } from "./components/LoginScreen";
import { VoiceAssistant } from "./components/VoiceAssistant";
import { IoTSensorAlerts } from "./components/IoTSensorAlerts";
import { GlobalSearchModal } from "./components/GlobalSearchModal";
import { QrCodeModal } from "./components/QrCodeModal";
import { OfflineSyncIndicator } from "./components/OfflineSyncIndicator";
import { InitialStockSetup } from "./components/InitialStockSetup";
import { SturgeonRepository } from "./storage/repository";
import { initializePermanentAgents } from "./agents/registry";
import { applyBatchesToPool, availableStock } from "./core/stock";
import { LogOut } from "lucide-react";
import { User } from "./types";
import bcrypt from "bcryptjs";

// 🚀 Code Splitting & Lazy Loaded Heavy Modules for High Performance & Faster Initial Bundle
const HallMap = lazy(() => import("./components/HallMap").then(m => ({ default: m.HallMap })));
const FeedingCalculator = lazy(() => import("./components/FeedingCalculator").then(m => ({ default: m.FeedingCalculator })));
const TransferManager = lazy(() => import("./components/TransferManager").then(m => ({ default: m.TransferManager })));
const MortalityManager = lazy(() => import("./components/MortalityManager").then(m => ({ default: m.MortalityManager })));
const LabManager = lazy(() => import("./components/LabManager"));
const ArchiveManager = lazy(() => import("./components/ArchiveManager"));
const ExtraDepartmentsManager = lazy(() => import("./components/ExtraDepartmentsManager"));
const AdminSettings = lazy(() => import("./components/AdminSettings").then(m => ({ default: m.AdminSettings })));
const SettingsManager = lazy(() => import("./components/SettingsManager").then(m => ({ default: m.SettingsManager })));
const ChatManager = lazy(() => import("./components/ChatManager"));
const FathiSystemReport = lazy(() => import("./components/FathiSystemReport").then(m => ({ default: m.FathiSystemReport })));

const ModuleLoader = () => (
  <div className="flex flex-col items-center justify-center p-12 space-y-3 bg-white/50 dark:bg-emerald-950/20 rounded-3xl border border-natural-border animate-pulse my-4">
    <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin" />
    <span className="text-xs font-bold text-natural-text/70">در حال بارگذاری ماژول تخصصی...</span>
  </div>
);

const LANG_DICT = {
  fa: {
    farmName: "مزرعه خاویاری فتحی",
    subtitle: "سامانه پایش هوشمند گله‌ها",
    observer: "ناظر مسئول برخط:",
    logout: "خروج از حساب کاربری",
    syncStatus: "شبکه محلی (LAN Sync)",
    synced: "بروز و متصل",
    unauthorized: "ورود مجدد لازم است",
    offline: "قطع (آفلاین)",
    map: "نقشه استخرها",
    stats: "آمار بیوماس",
    realtime: "ثبت آنی و محاسبات استخر",
    feeding: "محاسبه جیره",
    transfer: "دفتر جابه‌جایی",
    mortality: "تلفات مزارع",
    lab: "آزمایشگاه بیومتر",
    archive: "بایگانی وقایع",
    facilities: "تأسیسات کارگاه",
    processing: "فرآوری خاویار",
    feedmill: "کارخانه خوراک",
    inventory: "انبار مرکزی",
    accounting: "حسابداری مالی",
    security: "دژبانی حراست",
    coldstorage: "سردخانه کارگاه",
    traceability: "رهگیری زنده و تبارشناسی",
    admin: "مدیریت زیرساخت",
    settings: "تنظیمات عمومی",
    chat: "بیسیم و گفتگو",
    report: "گزارش جامع سیستم و معماری (FA)",
    departments: "ادارات و بخش‌های جانبی",
    managementSection: "مدیریت ارشد و تنظیمات عمومی",
    adminConfig: "پیکربندی عمومی و کالبدی فارم",
    farmDatabase: "پایگاه اطلاعاتی مزرعه خاویاری فتحی",
    onlineConnected: "سیستم برخط و متصل",
    localMode: "حالت محلی / آفلاین",
    mainNavLabel: "منوی اصلی سامانه",
    mobileMenuOpen: "باز کردن منوی اصلی",
    mobileMenuClose: "بستن منوی اصلی",
    quick: "سریع",
    live: "برخط",
    new: "جدید",
    adminBadge: "ادمین",
    themeMode: "حالت بصری",
    dark: "تاریک",
    light: "روشن",
    lang: "زبان"
  },
  ar: {
    farmName: "مزرعة فتحي للکافيار",
    subtitle: "نظام الرصد الذكي للقطعان",
    observer: "المراقب المسؤول المباشر:",
    logout: "تسجيل الخروج",
    syncStatus: "الشبكة المحلية (LAN Sync)",
    synced: "محدث ومتصل",
    unauthorized: "يلزم تسجيل الدخول مجددا",
    offline: "منقطع (أوفلاين)",
    map: "خريطة الصالات",
    stats: "إحصائيات البيوماس",
    realtime: "تسجيل فوري وحسابات الحوض",
    feeding: "حساب العليقة",
    transfer: "دفتر النقل",
    mortality: "نفوق الأسماك",
    lab: "المختبر الحيوي",
    archive: "أرشيف الأحداث",
    facilities: "المرافق الأساسية",
    processing: "معالجة الكافيار",
    feedmill: "مصنع الأعلاف",
    inventory: "المستودع المركزي",
    accounting: "المحاسبة المالية",
    security: "الحراسة والأمن",
    coldstorage: "المستودع المبرد",
    traceability: "تتبع السلسلة",
    admin: "إدارة البنية التحتية",
    settings: "الإعدادات العامة",
    chat: "اللاسلكي والمحادثة",
    report: "تقرير النظام والبنية (FA)",
    departments: "الإدارات والأقسام الجانبية",
    managementSection: "الإدارة العليا والإعدادات",
    adminConfig: "تهيئة عامة وهيكلية للمزرعة",
    farmDatabase: "قاعدة بيانات مزرعة فتحي للكافيار",
    onlineConnected: "النظام متصل ومباشر",
    localMode: "وضع محلي / أوفلاين",
    mainNavLabel: "القائمة الرئيسية للنظام",
    mobileMenuOpen: "فتح القائمة الرئيسية",
    mobileMenuClose: "إغلاق القائمة الرئيسية",
    quick: "سريع",
    live: "مباشر",
    new: "جديد",
    adminBadge: "مدير",
    themeMode: "الوضع البصري",
    dark: "داكن",
    light: "مضيء",
    lang: "اللغة"
  },
  en: {
    farmName: "Fathi Sturgeon Farm",
    subtitle: "Sturgeon & Caviar ERP Systems",
    observer: "Active Supervisor:",
    logout: "Log Out",
    syncStatus: "Local LAN Sync",
    synced: "Synced & Connected",
    unauthorized: "Sign-in Required",
    offline: "Disconnected",
    map: "Halls Map",
    stats: "Biomass Stats",
    realtime: "Instant Pool Logging",
    feeding: "Feeding Diet",
    transfer: "Transfer Logs",
    mortality: "Mortality Analyzer",
    lab: "Biometrics Lab",
    archive: "Events Archive",
    facilities: "Water Facility",
    processing: "Caviar Processing",
    feedmill: "Feed Mill",
    inventory: "Central Stock",
    accounting: "Financials",
    security: "Security Guard",
    coldstorage: "Cold Storage",
    traceability: "Traceability & Supply",
    admin: "Admin Control",
    settings: "System Settings",
    chat: "Intercom & Radio",
    report: "System & Architecture Report (FA)",
    departments: "Auxiliary Departments",
    managementSection: "Senior Management & Settings",
    adminConfig: "Farm Structure Configuration",
    farmDatabase: "Fathi Sturgeon Farm Database",
    onlineConnected: "Online and Connected",
    localMode: "Local / Offline Mode",
    mainNavLabel: "Main ERP Navigation",
    mobileMenuOpen: "Open main menu",
    mobileMenuClose: "Close main menu",
    quick: "Quick",
    live: "Live",
    new: "New",
    adminBadge: "Admin",
    themeMode: "Visual Mode",
    dark: "Dark",
    light: "Light",
    lang: "Language"
  },
  de: {
    farmName: "Fathi Störzucht",
    subtitle: "Kaviar ERP & EMS System",
    observer: "Aktiver Aufseher:",
    logout: "Abmelden",
    syncStatus: "Lokale LAN-Synchronisation",
    synced: "Synchronisiert",
    unauthorized: "Anmeldung erforderlich",
    offline: "Offline",
    map: "Hallenplan",
    stats: "Biomasse-Statistik",
    realtime: "Sofortprotokoll",
    feeding: "Futterration",
    transfer: "Umlagerung",
    mortality: "Mortalitätsanalyse",
    lab: "Biometrie-Labor",
    archive: "Ereignisarchiv",
    facilities: "Wasserwerk",
    processing: "Kaviar-Verarbeitung",
    feedmill: "Futtermühle",
    inventory: "Zentrallager",
    accounting: "Buchhaltung",
    security: "Wachdienst",
    coldstorage: "Kühlhaus",
    traceability: "Rückverfolgbarkeit",
    admin: "Admin-Bereich",
    settings: "Einstellungen",
    chat: "Intercom & Funk",
    report: "System- und Architekturbericht (FA)",
    departments: "Zusätzliche Abteilungen",
    managementSection: "Leitung und Einstellungen",
    adminConfig: "Farmstruktur konfigurieren",
    farmDatabase: "Datenbank der Fathi Störzucht",
    onlineConnected: "Online und verbunden",
    localMode: "Lokaler / Offline-Modus",
    mainNavLabel: "ERP-Hauptnavigation",
    mobileMenuOpen: "Hauptmenü öffnen",
    mobileMenuClose: "Hauptmenü schließen",
    quick: "Schnell",
    live: "Live",
    new: "Neu",
    adminBadge: "Admin",
    themeMode: "Modus",
    dark: "Dunkel",
    light: "Hell",
    lang: "Sprache"
  },
  ru: {
    farmName: "Осетровая ферма Фатхи", subtitle: "ERP-система осетрового хозяйства", observer: "Ответственный оператор:", logout: "Выйти", syncStatus: "Локальная синхронизация", synced: "Синхронизировано", unauthorized: "Требуется вход", offline: "Офлайн", map: "Карта бассейнов", stats: "Биомасса", realtime: "Оперативный журнал", feeding: "Рацион кормления", transfer: "Перемещения", mortality: "Падёж", lab: "Биометрическая лаборатория", archive: "Архив событий", facilities: "Инженерные системы", processing: "Переработка икры", feedmill: "Кормовой цех", inventory: "Центральный склад", accounting: "Финансы", security: "Безопасность", coldstorage: "Холодильник", traceability: "Прослеживаемость", admin: "Администрирование", settings: "Настройки", chat: "Связь", report: "Отчет системы и архитектуры (FA)", departments: "Дополнительные отделы", managementSection: "Руководство и настройки", adminConfig: "Настройка структуры фермы", farmDatabase: "База данных фермы Фатхи", onlineConnected: "Онлайн и подключено", localMode: "Локальный / офлайн режим", mainNavLabel: "Главная навигация ERP", mobileMenuOpen: "Открыть главное меню", mobileMenuClose: "Закрыть главное меню", quick: "Быстро", live: "Онлайн", new: "Новое", adminBadge: "Админ", themeMode: "Тема", dark: "Тёмная", light: "Светлая", lang: "Язык"
  }
};

export default function App() {
  const [initialStockCompleted, setInitialStockCompleted] = useState(() => Boolean(localStorage.getItem("sturgeon_initial_stock_completed_v1")));

  useEffect(() => {
    initializePermanentAgents();
  }, []);
  // Theme and Language states
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("sturgeon_theme");
      return (saved as "dark" | "light") || "dark";
    }
    return "dark";
  });

  const [language, setLanguage] = useState<"fa" | "ar" | "en" | "de" | "ru">(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("sturgeon_lang");
      if (saved && ["fa", "ar", "en", "de", "ru"].includes(saved)) return saved as "fa" | "ar" | "en" | "de" | "ru";
      const detected = (navigator.languages?.[0] || navigator.language || "fa").slice(0, 2);
      return (["fa", "ar", "en", "de", "ru"].includes(detected) ? detected : "fa") as "fa" | "ar" | "en" | "de" | "ru";
    }
    return "fa";
  });

  useEffect(() => {
    localStorage.setItem("sturgeon_theme", theme);
    const root = document.documentElement;
    if (theme === "light") {
      root.classList.add("light");
    } else {
      root.classList.remove("light");
    }
  }, [theme]);

  useEffect(() => {
    localStorage.setItem("sturgeon_lang", language);
    const root = document.documentElement;
    root.classList.remove("lang-fa", "lang-ar", "lang-en", "lang-de", "lang-ru");
    if (["en", "de", "ru"].includes(language)) {
      root.setAttribute("dir", "ltr");
      root.classList.add(`lang-${language}`);
    } else {
      root.setAttribute("dir", "rtl");
      root.classList.add(`lang-${language}`);
    }
    root.setAttribute("lang", language);
  }, [language]);

  const activeTranslations = LANG_DICT[language];

  // Current logged in user session
  const [currentUser, setCurrentUser] = useState<User | null>(() => SturgeonRepository.getCurrentUser());

  const handleLogout = () => {
    SturgeonRepository.logout();
    setCurrentUser(null);
  };

  // Loaded General Settings for custom brand and farm details
  const [generalSettings, setGeneralSettings] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("sturgeon_general_settings_v2");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          // ignore
        }
      }
    }
    return {
      farmName: "مزرعه تکثیر و پرورش ماهیان خاویاری فتحی",
      managerName: "جناب آقای فتحی (مدیریت کل فارم)",
      locationName: "مازندران، سواحل جنوبی دریای خزر - لمی",
      nominalCapacity: "۵۰ تن گوشت و ۵ تن خاویار استحصال سالانه"
    };
  });

  const reloadGeneralSettings = () => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("sturgeon_general_settings_v2");
      if (saved) {
        try {
          setGeneralSettings(JSON.parse(saved));
        } catch (e) {
          // ignore
        }
      }
      // Sync current user session in real-time
      setCurrentUser(SturgeonRepository.getCurrentUser());
    }
  };

  // Loaded States with LocalStorage support and smart 'واننیرو' -> 'ونیرو' migration
  const [pools, setPools] = useState<Pool[]>(() => SturgeonRepository.getPools());

  const [halls, setHalls] = useState<Hall[]>(() => SturgeonRepository.getHalls());
  
  const [movements, setMovements] = useState<MovementLog[]>(() => {
    const saved = localStorage.getItem("sturgeon_movements");
    if (saved) {
      try {
        const migrated = saved.replace(/واننیرو/g, "ونیرو");
        return JSON.parse(migrated);
      } catch (e) {
        console.error("Failed to parse sturgeon_movements:", e);
      }
    }
    return INITIAL_MOVEMENTS;
  });

  const [feedings, setFeedings] = useState<FeedingMeal[]>(() => {
    const saved = localStorage.getItem("sturgeon_feedings");
    if (saved) {
      try {
        const migrated = saved.replace(/واننیرو/g, "ونیرو");
        return JSON.parse(migrated);
      } catch (e) {
        console.error("Failed to parse sturgeon_feedings:", e);
      }
    }
    return INITIAL_FEEDINGS;
  });

  const [mortalityLogs, setMortalityLogs] = useState<MortalityLog[]>(() => {
    const saved = localStorage.getItem("sturgeon_mortality");
    if (saved) {
      try {
        const migrated = saved.replace(/واننیرو/g, "ونیرو");
        return JSON.parse(migrated);
      } catch (e) {
        console.error("Failed to parse sturgeon_mortality:", e);
      }
    }
    return INITIAL_MORTALITY;
  });

  // Navigation states
  const [activeTab, setActiveTab] = useState<"map" | "stats" | "feeding" | "transfer" | "mortality" | "lab" | "archive" | "realtime" | "facilities" | "processing" | "feedmill" | "inventory" | "accounting" | "security" | "coldstorage" | "traceability" | "admin" | "settings" | "chat" | "report">("map");
  const activeTabTitles: Record<typeof activeTab, string> = {
    map: activeTranslations.map,
    stats: activeTranslations.stats,
    realtime: activeTranslations.realtime,
    feeding: activeTranslations.feeding,
    transfer: activeTranslations.transfer,
    mortality: activeTranslations.mortality,
    lab: activeTranslations.lab,
    archive: activeTranslations.archive,
    facilities: activeTranslations.facilities,
    processing: activeTranslations.processing,
    feedmill: activeTranslations.feedmill,
    inventory: activeTranslations.inventory,
    accounting: activeTranslations.accounting,
    security: activeTranslations.security,
    coldstorage: activeTranslations.coldstorage,
    traceability: activeTranslations.traceability,
    admin: activeTranslations.admin,
    settings: activeTranslations.settings,
    chat: activeTranslations.chat,
    report: activeTranslations.report
  };
  const activeTabTitle = activeTabTitles[activeTab];
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [selectedHallId, setSelectedHallId] = useState<number>(1);
  const [selectedPoolId, setSelectedPoolId] = useState<string | null>(null);
  const [transferFromPoolId, setTransferFromPoolId] = useState<string>("");

  // Global Search & QR Code modal states
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [qrModalState, setQrModalState] = useState<{
    isOpen: boolean;
    pool?: Pool | null;
    citesBatch?: any;
  }>({ isOpen: false });

  useEffect(() => {
    const handleGlobalShortcuts = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setIsSearchOpen(open => !open);
      }
    };

    window.addEventListener("keydown", handleGlobalShortcuts);
    return () => window.removeEventListener("keydown", handleGlobalShortcuts);
  }, []);

  const [syncState, setSyncState] = useState<"synced" | "offline" | "unauthorized" | "error">("offline");
  const unauthorizedSyncTokenRef = useRef<string | null>(null);

  // Run central network sync check every 10 seconds
  useEffect(() => {
    const runNetworkSync = async () => {
      const token = localStorage.getItem("sturgeon_auth_token");
      if (token && unauthorizedSyncTokenRef.current === token) {
        setSyncState("unauthorized");
        return;
      }

      const result = await SturgeonRepository.syncWithServer();
      setSyncState(result.success ? "synced" : result.status || "offline");
      if (result.status === "unauthorized") {
        unauthorizedSyncTokenRef.current = token;
      } else {
        unauthorizedSyncTokenRef.current = null;
      }

      if (result.success) {
        // Update local React states to match what was returned from server/merged in localStorage
        const savedPools = localStorage.getItem("sturgeon_pools");
        if (savedPools) {
          try { setPools(JSON.parse(savedPools)); } catch(e) {}
        }
        const savedHalls = localStorage.getItem("sturgeon_halls");
        if (savedHalls) {
          try { setHalls(JSON.parse(savedHalls)); } catch(e) {}
        }
        const savedMovements = localStorage.getItem("sturgeon_movements");
        if (savedMovements) {
          try { setMovements(JSON.parse(savedMovements)); } catch(e) {}
        }
        const savedFeedings = localStorage.getItem("sturgeon_feedings");
        if (savedFeedings) {
          try { setFeedings(JSON.parse(savedFeedings)); } catch(e) {}
        }
        const savedMortality = localStorage.getItem("sturgeon_mortality");
        if (savedMortality) {
          try { setMortalityLogs(JSON.parse(savedMortality)); } catch(e) {}
        }
      }
    };
    runNetworkSync();
    const interval = setInterval(runNetworkSync, 10000);
    return () => clearInterval(interval);
  }, []);

  // Force clean slate raw initialization if not applied yet
  useEffect(() => {
    const rawApplied = localStorage.getItem("sturgeon_raw_v4");
    if (!rawApplied) {
      const initializeClient = async () => {
        try {
          // Attempt to pull the central server database first to avoid overwriting it
          const token = localStorage.getItem("sturgeon_auth_token");
          const response = token
            ? await fetch("/api/db/sync", { headers: { Authorization: `Bearer ${token}` } })
            : null;
          if (response?.ok) {
            const data = await response.json();
            if (data && data.success && data.db) {
              const db = data.db;
              const keysToSync = [
                "sturgeon_pools_v2",
                "sturgeon_halls_v2",
                "sturgeon_movements_v2",
                "sturgeon_feedings_v2",
                "sturgeon_mortalities_v2",
                "sturgeon_lab_tests_v2",
                "sturgeon_sonographies_v2",
                "sturgeon_notifications_v2",
                "sturgeon_users_v2",
                "sturgeon_audit_logs_v2",
                "sturgeon_general_settings_v2",
                "sturgeon_role_permissions_v3"
              ];
              // Populate local storage with server data
              Object.keys(db).forEach(key => {
                if (keysToSync.includes(key) && db[key]) {
                  localStorage.setItem(key, JSON.stringify(db[key]));
                }
              });
              
              // Also map v2 keys back to the specific legacy keys if needed
              if (db.sturgeon_pools_v2) localStorage.setItem("sturgeon_pools", JSON.stringify(db.sturgeon_pools_v2));
              if (db.sturgeon_halls_v2) localStorage.setItem("sturgeon_halls", JSON.stringify(db.sturgeon_halls_v2));
              if (db.sturgeon_movements_v2) localStorage.setItem("sturgeon_movements", JSON.stringify(db.sturgeon_movements_v2));
              if (db.sturgeon_feedings_v2) localStorage.setItem("sturgeon_feedings", JSON.stringify(db.sturgeon_feedings_v2));
              if (db.sturgeon_mortalities_v2) localStorage.setItem("sturgeon_mortality", JSON.stringify(db.sturgeon_mortalities_v2));

              localStorage.setItem("sturgeon_raw_v4", "true");
              window.location.reload();
              return;
            }
          }
        } catch (err) {
          console.warn("Pull-first initialization failed, using local default seeding:", err);
        }

        // Offline / empty server fallback seeding
        localStorage.clear();
        localStorage.setItem("sturgeon_raw_v4", "true");
        
        // Seed default admin user with a one-time local password so no credential is published in source.
        const temporaryAdminPassword = crypto.randomUUID().slice(0, 12);
        const defaultUsers = [
          {
            id: "admin",
            name: "مدیریت سیستم",
            username: "admin",
            password: bcrypt.hashSync(temporaryAdminPassword, 10),
            role: "admin",
            permissions: ["all"]
          }
        ];
        localStorage.setItem("sturgeon_users_v2", JSON.stringify(defaultUsers));
        alert(`رمز موقت مدیر سیستم برای همین نصب محلی: ${temporaryAdminPassword}\nپس از ورود، رمز را از پنل مدیریت تغییر دهید.`);
        
        setPools(INITIAL_POOLS);
        setHalls(INITIAL_HALLS);
        setMovements([]);
        setFeedings([]);
        setMortalityLogs([]);
        setSelectedPoolId(null);
        window.location.reload();
      };

      initializeClient();
    }
  }, []);

  // Granular Tab Permission Check and Automatic Redirect Enforcement
  const hasTabPermission = (tabId: string): boolean => {
    if (!currentUser) return false;
    if (currentUser.role === "admin") return true;
    
    const rolePermissions = SturgeonRepository.getRolePermissions();
    const userRole = currentUser.role || "viewer";
    const allowed = rolePermissions[userRole] || [];
    return allowed.includes("all") || allowed.includes(tabId);
  };

  useEffect(() => {
    if (!currentUser) return;
    const tabOrder = [
      "map", "stats", "realtime", "feeding", "lab", "mortality", "transfer", "archive", 
      "feedmill", "inventory", "processing", "coldstorage", "facilities", "traceability", 
      "accounting", "security", "chat", "settings", "admin"
    ];
    
    // Check if current activeTab is permitted
    const isPermitted = hasTabPermission(activeTab);
                        
    if (!isPermitted) {
      // Find the first permitted tab
      const firstPermitted = tabOrder.find(tabId => hasTabPermission(tabId));
      if (firstPermitted) {
        setActiveTab(firstPermitted as any);
      }
    }
  }, [currentUser, activeTab]);

  // Sync state with LocalStorage
  useEffect(() => {
    localStorage.setItem("sturgeon_pools", JSON.stringify(pools));
    localStorage.setItem("sturgeon_pools_v2", JSON.stringify(pools));
  }, [pools]);

  useEffect(() => {
    localStorage.setItem("sturgeon_halls", JSON.stringify(halls));
    localStorage.setItem("sturgeon_halls_v2", JSON.stringify(halls));
  }, [halls]);

  useEffect(() => {
    localStorage.setItem("sturgeon_movements", JSON.stringify(movements));
    localStorage.setItem("sturgeon_movements_v2", JSON.stringify(movements));
  }, [movements]);

  useEffect(() => {
    localStorage.setItem("sturgeon_feedings", JSON.stringify(feedings));
    localStorage.setItem("sturgeon_feedings_v2", JSON.stringify(feedings));
  }, [feedings]);

  useEffect(() => {
    localStorage.setItem("sturgeon_mortality", JSON.stringify(mortalityLogs));
    localStorage.setItem("sturgeon_mortalities_v2", JSON.stringify(mortalityLogs));
  }, [mortalityLogs]);

  // Export and print states and helpers
  const [exportNotice, setExportNotice] = useState<{
    show: boolean;
    title: string;
    desc: string;
    type: "pdf" | "excel" | "print";
  } | null>(null);

  const handlePrint = () => {
    setExportNotice({
      show: true,
      title: "🖨️ آماده‌سازی برای چاپ رسمی",
      desc: "قالب خروجی بخش فعلی با موفقیت برای ابعاد استاندارد چاپ کالیبره شد. پنجره چاپ سیستم شما باز می‌شود؛ با فشردن دکمه Print می‌توانید گزارش چاپی را دریافت کنید.",
      type: "print"
    });
    setTimeout(() => {
      window.print();
    }, 1500);
  };

  const handlePdfExport = () => {
    setExportNotice({
      show: true,
      title: "📄 راهنمای صدور سند PDF راست‌چین",
      desc: "برای صدور و ذخیره فایل PDF با فونت فارسی شکیلی، پنجره چاپ مرورگر باز خواهد شد. لطفاً در منوی باز شده، مقدار چاپگر (Destination) را روی گزینه 'Save as PDF' (ذخیره به عنوان PDF) تنظیم نموده و سپس دکمه ذخیره را بزنید.",
      type: "pdf"
    });
    setTimeout(() => {
      window.print();
    }, 1500);
  };

  const handleExcelExport = () => {
    let csvContent = "";
    let fileName = `گزارش_مزرعه_خاویاری_فتحی_${activeTab}_${Date.now()}`;
    
    // UTF-8 BOM to open Persian texts properly in Microsoft Excel
    const BOM = "\uFEFF";

    const escapeCSV = (val: any) => {
      if (val === undefined || val === null) return "";
      let str = String(val);
      str = str.replace(/"/g, '""');
      if (str.includes(",") || str.includes("\n") || str.includes('"') || str.includes("،") || str.includes(";")) {
        return `"${str}"`;
      }
      return str;
    };

    const convertToCSV = (headers: string[], rows: any[][]) => {
      const headerRow = headers.map(escapeCSV).join(",");
      const dataRows = rows.map(row => row.map(escapeCSV).join(",")).join("\n");
      return BOM + headerRow + "\n" + dataRows;
    };

    switch (activeTab) {
      case "map": {
        const headers = ["استخر", "سالن", "گونه ماهی", "تعداد ماهی", "وزن متوسط (گرم)", "کل بیوماس (کیلوگرم)", "وضعیت بهره‌برداری"];
        const rows = pools.map(p => [
          p.id,
          `سالن ${p.hallId}`,
          p.species || "خالی",
          p.count,
          p.avgWeight,
          p.biomass,
          p.count > 0 ? "فعال" : "خالی/آماده‌سازی"
        ]);
        csvContent = convertToCSV(headers, rows);
        break;
      }
      case "stats": {
        const headers = ["شماره استخر", "سالن", "گونه", "تعداد ماهی", "وزن متوسط (گرم)", "بیوماس (کیلوگرم)", "تراکم (کیلوگرم بر مترمکعب)", "ضریب تغذیه روزانه"];
        const rows = pools.map(p => {
          const density = (p.biomass / p.volume).toFixed(1);
          return [
            p.id,
            `سالن ${p.hallId}`,
            p.species || "نامشخص",
            p.count,
            p.avgWeight,
            p.biomass,
            density,
            `${p.feedRate}%`
          ];
        });
        csvContent = convertToCSV(headers, rows);
        break;
      }
      case "feeding": {
        const headers = ["شناسه", "استخر", "وعده", "نوع غذا", "سایز پلت", "مقدار (کیلوگرم)", "نام اپراتور", "زمان ثبت"];
        const rows = feedings.map(f => [
          f.id,
          f.poolId,
          f.mealIndex,
          f.feedType,
          f.pelletSize,
          f.amountKg,
          f.operator || "سیستم",
          f.timestamp
        ]);
        csvContent = convertToCSV(headers, rows);
        break;
      }
      case "transfer": {
        const headers = ["شناسه انتقال", "استخر مبدا", "استخر مقصد", "تعداد ماهی", "وزن متوسط (گرم)", "علت جابجایی", "اپراتور مسئول", "تاریخ و زمان"];
        const rows = movements.map(m => [
          m.id,
          m.fromPoolId,
          m.toPoolId,
          m.count,
          m.avgWeight,
          m.reason,
          m.operator || "ثبت اتوماتیک",
          m.timestamp
        ]);
        csvContent = convertToCSV(headers, rows);
        break;
      }
      case "mortality": {
        const headers = ["شناسه ثبت", "استخر مربوطه", "تعداد تلفات (قطعه)", "علت تلفات", "نام کاربری اپراتور", "توضیحات تکمیلی", "تاریخ ثبت"];
        const rows = mortalityLogs.map(log => [
          log.id,
          log.poolId,
          log.count,
          log.reason,
          log.operator || "سرپرست شیفت",
          log.notes || "بدون توضیح",
          log.timestamp
        ]);
        csvContent = convertToCSV(headers, rows);
        break;
      }
      case "lab": {
        const headers = ["تاریخ و ساعت", "استخر", "پارامتر", "مقدار اندازه‌گیری", "دما", "اکسیژن محلول", "pH", "شوری"];
        const savedWater = localStorage.getItem("sturgeon_lab_water_logs");
        let waterLogs = [];
        try { if (savedWater) waterLogs = JSON.parse(savedWater); } catch(e){}
        
        const rows = waterLogs.map((wl: any) => [
          wl.timestamp || wl.date || "",
          wl.poolId || "",
          wl.parameter || wl.type || "کنترل کیفی",
          wl.value || "",
          wl.temp || wl.temperature || "۲۲",
          wl.oxygen || "۶.۵",
          wl.ph || "۷.۸",
          wl.salinity || "۰.۲"
        ]);
        csvContent = convertToCSV(headers, rows);
        break;
      }
      case "archive": {
        const headers = ["شناسه گزارش", "عنوان وقایع", "بخش مرجع", "ثبت‌کننده", "کد تبارشناسی", "تاریخ آرشیو"];
        const rows = [
          ["ARC-9012", "گزارش نهایی آزمایشگاه سونوگرافی نوبت عصر", "آزمایشگاه", "دکتر هاشمی", "BLK-2026", "۱۴۰۵/۰۴/۱۴"],
          ["ARC-8812", "سیاهه مصرف خوراک استخرها نرسری ۱", "بایگانی تغذیه", "کریمی", "NRS-A1", "۱۴۰۵/۰۴/۱۲"],
          ["ARC-7104", "نتایج شستشوی بک‌واش فیلترهای شنی سالن ۲", "تأسیسات", "مهندس صادقی", "FLT-S2", "۱۴۰۵/۰۴/۱۰"]
        ];
        csvContent = convertToCSV(headers, rows);
        break;
      }
      case "facilities": {
        const headers = ["کد سیستم", "نام تجهیزات", "آخرین زمان پایش", "وضعیت عملکردی", "ولتاژ/جریان", "دبی جریان", "دمای کارکرد"];
        const saved = localStorage.getItem("caviar_maintenance");
        let logs = [];
        try { if(saved) logs = JSON.parse(saved); } catch(e){}
        const rows = logs.map((l: any) => [
          l.id || "SYS",
          l.equipment || l.title || "هواده اکسیژن",
          l.lastChecked || l.date || "امروز",
          l.status || "نرمال",
          l.voltage || "۳۸۰ ولت",
          l.flow || "۱۲۰ لیتر/ثانیه",
          l.temp || "۲۴ درجه"
        ]);
        csvContent = convertToCSV(headers, rows);
        break;
      }
      case "processing": {
        const headers = ["بچ فرآوری", "استخر مبدا", "وزن کل بیوماس (کیلوگرم)", "وزن خاویار استحصالی (کیلوگرم)", "درصد بازدهی خاویار", "درجه کیفی", "ناظر فنی"];
        const saved = localStorage.getItem("caviar_processing");
        let logs = [];
        try { if(saved) logs = JSON.parse(saved); } catch(e){}
        const rows = logs.map((l: any) => [
          l.id || l.batchId || "PRC-102",
          l.poolId || "استخر ۵",
          l.totalWeight || "۲۵۰",
          l.caviarWeight || "۲۸.۵",
          l.yieldPercent || "۱۱.۴٪",
          l.grade || "A+ امپریال",
          l.supervisor || "محمدی"
        ]);
        csvContent = convertToCSV(headers, rows);
        break;
      }
      case "feedmill": {
        const headers = ["بچ خوراک", "فرمولاسیون جیره", "سایز پلت (میلی‌متر)", "وزن کل بچ (کیلوگرم)", "ویتامین افزوده", "دمای اکسترودر", "تاریخ تولید"];
        const saved = localStorage.getItem("caviar_feedmill");
        let logs = [];
        try { if(saved) logs = JSON.parse(saved); } catch(e){}
        const rows = logs.map((l: any) => [
          l.id || l.batchId || "FED-204",
          l.formula || "رشد فیل‌ماهی",
          l.pelletSize || "۴.۰",
          l.totalWeight || "۵۰۰",
          l.vitamins || "C + E غنی شده",
          l.temp || "۱۱۵ درجه",
          l.date || "امروز"
        ]);
        csvContent = convertToCSV(headers, rows);
        break;
      }
      case "inventory": {
        const headers = ["کد کالا", "نام اقلام", "گروه انبار", "موجودی فعلی", "واحد سنجش", "آخرین بازرسی", "محل انبار"];
        const saved = localStorage.getItem("caviar_inventory_stock");
        let logs = [];
        try { if(saved) logs = JSON.parse(saved); } catch(e){}
        const rows = logs.map((l: any) => [
          l.id || l.itemCode || "INV-10",
          l.name || "پلت خوراک ۳ میلی‌متر بلوگا",
          l.category || "خوراک شیلات",
          l.stock || "۳۵۰۰",
          l.unit || "کیلوگرم",
          l.lastInspected || "امروز",
          l.location || "انبار جنوبی ۲"
        ]);
        csvContent = convertToCSV(headers, rows);
        break;
      }
      case "accounting": {
        const headers = ["سند مالی", "شرح تراکنش", "بخش تابعه", "مبلغ بدهکار (ریال)", "مبلغ بستانکار (ریال)", "مسئول ثبت", "وضعیت ممیزی"];
        const saved = localStorage.getItem("caviar_financials");
        let logs = [];
        try { if(saved) logs = JSON.parse(saved); } catch(e){}
        const rows = logs.map((l: any) => [
          l.id || l.txId || "ACC-99",
          l.description || "خرید ویتامین جیره مکمل",
          l.department || "مدیریت تغذیه",
          l.debit || "۱۲۰,۰۰۰,۰۰۰",
          l.credit || "۰",
          l.operator || "صادقی",
          l.audited ? "تایید نهایی" : "در انتظار ممیزی"
        ]);
        csvContent = convertToCSV(headers, rows);
        break;
      }
      case "security": {
        const headers = ["کد تردد", "شرح تردد/رویداد", "بخش گشت‌زنی", "زمان دقیق رویداد", "بازرس دژبانی", "وضعیت فوریت", "تصاویر پایش زنده"];
        const saved = localStorage.getItem("caviar_security");
        let logs = [];
        try { if(saved) logs = JSON.parse(saved); } catch(e){}
        const rows = logs.map((l: any) => [
          l.id || l.logId || "SEC-302",
          l.description || "ثبت ورود خودرو حمل اکسیژن مایع",
          l.sector || "گیت ورودی اصلی",
          l.timestamp || l.date || "امروز",
          l.inspector || "کریمی",
          l.urgency || "عادی",
          l.cctvStatus || "سالم/پایدار"
        ]);
        csvContent = convertToCSV(headers, rows);
        break;
      }
      case "coldstorage": {
        const headers = ["شماره سردخانه", "عنوان محصول", "دمای مجاز", "دمای خوانده‌شده (سانتی‌گراد)", "رطوبت مجاز", "رطوبت سنسور", "وضعیت آلارم"];
        const saved = localStorage.getItem("caviar_cold_storage_logs");
        let logs = [];
        try { if(saved) logs = JSON.parse(saved); } catch(e){}
        const rows = logs.map((l: any) => [
          l.storageId || "روم شماره ۱ بلوگا",
          l.product || "خاویار بلک امپریال",
          l.targetTemp || "-۲.۰ تا ۰.۰",
          l.currentTemp || "-۱.۲",
          l.targetHumidity || "۶۰٪",
          l.currentHumidity || "۶۲٪",
          l.alarmActive ? "⚠️ هشدار دما" : "✅ پایدار"
        ]);
        csvContent = convertToCSV(headers, rows);
        break;
      }
      case "traceability": {
        const headers = ["کد رهگیری لات (Lot ID)", "استخر خاستگاه", "بچ خوراک مصرفی", "وضعیت بیومتریک", "درجه پختگی گنادال", "کد تگ میکروچیپ", "کوالتی کنترل نهایی"];
        const rows = [
          ["LOT-2026-F5", "استخر ۵ (پیش‌پروار)", "FED-204 (رشد)", "طول ۱۲۰cm / وزن ۴۵kg", "مرحله ۲ پختگی جنسی", "RFID-6207", "تایید آزمایشگاه"],
          ["LOT-2026-N1", "استخر ۱ (نرسری)", "FED-101 (آغازین)", "طول ۳۰cm / وزن ۲.۵kg", "مرحله ۱ پختگی", "RFID-1044", "تایید کیفی"],
          ["LOT-2026-M2", "استخر ۲ (مولدین ماده)", "FED-301 (مولد)", "طول ۱۸۰cm / وزن ۹۵kg", "مرحله ۴ پختگی کامل خاویار", "RFID-6207", "طلایی امپریال"]
        ];
        csvContent = convertToCSV(headers, rows);
        break;
      }
      case "admin": {
        const headers = ["شناسه وقایع", "نام کاربر", "سمت کاربر", "آدرس سیستم IP", "نوع واقعه سیستمی", "شرح رویداد", "زمان رویداد"];
        const saved = localStorage.getItem("sturgeon_audit_logs");
        let logs = [];
        try { if(saved) logs = JSON.parse(saved); } catch(e){}
        const rows = logs.map((l: any) => [
          l.id || "AUD-1",
          l.user || "مدیر ارشد",
          l.role || "admin",
          l.ip || "192.168.1.10",
          l.action || "تغییر آستانه دما",
          l.details || "آستانه دمای بحرانی استخرها بروزرسانی شد",
          l.timestamp || "امروز"
        ]);
        csvContent = convertToCSV(headers, rows);
        break;
      }
      case "settings": {
        const headers = ["پارامتر تنظیماتی", "مقدار کنونی", "دامنه ایمن", "آخرین ویرایش", "مسئول تایید", "سطح دسترسی"];
        const rows = [
          ["دمای هشدار بحرانی بالا", "۲۸ درجه سانتی‌گراد", "کمتر از ۲۶", "۱۴۰۵/۰۴/۱۴", "دکتر هاشمی", "admin"],
          ["اکسیژن حداقل مجاز", "۵.۰ PPM", "بیشتر از ۶.۰", "۱۴۰۵/۰۴/۱۴", "دکتر هاشمی", "admin"],
          ["دوز حمام نمک سالن ۲", "۱۵ گرم در لیتر", "۱۰ تا ۲۰", "۱۴۰۵/۰۴/۱۲", "صادقی", "supervisor"],
          ["دوره تخلیه پساب خودکار", "۱۲ ساعت یکبار", "۶ تا ۲۴", "۱۴۰۵/۰۴/۱۰", "کریمی", "operator"]
        ];
        csvContent = convertToCSV(headers, rows);
        break;
      }
      case "chat": {
        const headers = ["شناسه پیام", "فرستنده", "سمت", "متن پیام/توضیح", "زمان ارسال"];
        const rows = [
          ["MSG-101", "دکتر امین هاشمی", "دامپزشک ارشد", "سلام همکاران گرامی، لطفاً نتایج سونوگرافی مولدین سالن ۲ را امروز نهایی کنید.", "۱۰:۱۵"],
          ["MSG-102", "مهندس مریم صادقی", "مسئول هیدروشیمی", "دیتای هیدروشیمی آب استخرهای نرسری ۴ و ۵ ثبت شد. میزان اکسیژن محلول کمی پایین است.", "۱۰:۲۲"],
          ["MSG-103", "حسین کریمی", "تکنیسین تغذیه", "جیره غذایی بر اساس بیوماس جدید استخرها بروزرسانی شد و خط تولید در حال کار است.", "۱۰:۳۰"]
        ];
        csvContent = convertToCSV(headers, rows);
        break;
      }
      default: {
        const headers = ["شناسه", "توضیح سیستم", "زمان تولید سند"];
        const rows = [["SYS-GEN", `گزارش کلی بخش ${activeTab}`, new Date().toLocaleString("fa-IR")]];
        csvContent = convertToCSV(headers, rows);
        break;
      }
    }

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${fileName}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setExportNotice({
      show: true,
      title: "📊 صدور گزارش اکسل موفقیت‌آمیز بود",
      desc: "کل دیتای عددی و تبارشناسی مربوط به بخش کنونی در قالب جدول صفحه گسترده اکسل به صورت راست‌چین صادر و دانلود شد.",
      type: "excel"
    });
  };

  // UTILITY: Get current Persian date
  const getPersianDate = (date: Date = new Date()): string => {
    try {
      const gy = date.getFullYear();
      const gm = date.getMonth() + 1;
      const gd = date.getDate();

      const g_d_m = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
      let jy = (gy <= 1600) ? 0 : 979;
      let gy_rel = gy - ((gy <= 1600) ? 621 : 1600);
      let gy2 = (gm > 2) ? (gy_rel + 1) : gy_rel;
      let days = (365 * gy_rel) + Math.floor((gy2 + 3) / 4) - Math.floor((gy2 + 99) / 100) + Math.floor((gy2 + 399) / 400) - 80 + gd + g_d_m[gm - 1];
      jy += 33 * Math.floor(days / 12053);
      days %= 12053;
      jy += 4 * Math.floor(days / 1461);
      days %= 1461;
      jy += Math.floor((days - 1) / 365);
      if (days > 365) days = (days - 1) % 365;
      let jm = (days < 186) ? 1 + Math.floor(days / 31) : 7 + Math.floor((days - 186) / 30);
      let jd = 1 + ((days < 186) ? (days % 31) : ((days - 186) % 30));

      const pad = (num: number) => num.toString().padStart(2, '0');
      return `${jy}/${pad(jm)}/${pad(jd)}`;
    } catch (e) {
      return "1405/04/17"; // fallback
    }
  };

  const getPersianFullDateAndWeekday = (date: Date = new Date()): string => {
    try {
      const days = ["یک‌شنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنج‌شنبه", "جمعه", "شنبه"];
      const dayName = days[date.getDay()];
      const pDate = getPersianDate(date);
      return `${dayName} ${pDate}`;
    } catch (e) {
      return `چهارشنبه 1405/04/17`;
    }
  };

  // State Handler 1: Core Stock Transfer/Movement Execution
  const handleExecuteTransfer = (
    fromId: string, 
    toId: string, 
    amount: number, 
    reason: string, 
    operator: string,
    chipId?: string,
    breed?: SturgeonBreed,
    gender?: string,
    avgWeight?: number
  ): boolean => {
    const areBreedsEqual = (b1: string, b2: string) => {
      if (!b1 || !b2) return false;
      return b1.trim().replace(/\s+/g, ' ') === b2.trim().replace(/\s+/g, ' ');
    };

    const source = pools.find(p => p.id === fromId);
    
    const specialDestNames: Record<string, string> = {
      processing: "واحد فرآوری تاس‌ماهیان",
      coldstorage: "سردخانه مرکزی گوشت و خاویار",
      sales: "فروش مستقیم بازار"
    };
    
    const isSpecialDest = toId in specialDestNames;
    const dest = isSpecialDest ? null : pools.find(p => p.id === toId);

    if (!source || (!dest && !isSpecialDest) || source.count < amount) {
      return false;
    }

    const transferBreed = breed || source.breed;
    const transferAvgWeight = avgWeight && avgWeight > 0 ? avgWeight : source.avgWeightGrams;
    const transferGender = gender || "نامشخص / ترکیبی";

    if (amount <= 0 || availableStock(source, transferBreed) < amount) {
      return false;
    }

    setPools(prevPools => {
      return prevPools.map(pool => {
        // Reduct from primary source pool
        if (pool.id === fromId) {
          const newCount = pool.count - amount;
          
          let updatedBatches = pool.fishBatches;
          if (updatedBatches && updatedBatches.length > 0) {
            let remainingToDeduct = amount;
            updatedBatches = updatedBatches.map(b => {
              if (areBreedsEqual(b.breed, transferBreed) && remainingToDeduct > 0) {
                const deductFromThis = Math.min(b.count, remainingToDeduct);
                remainingToDeduct -= deductFromThis;
                return { ...b, count: b.count - deductFromThis };
              }
              return b;
            }).filter(b => b.count > 0);

            // Ensure the sum of batches matches newCount exactly
            const batchSum = updatedBatches.reduce((acc, b) => acc + b.count, 0);
            if (batchSum !== newCount) {
              if (newCount === 0) {
                updatedBatches = [];
              } else {
                const diff = newCount - batchSum;
                updatedBatches = updatedBatches.map((b, idx) => {
                  if (idx === 0) {
                    const adjustedCount = Math.max(1, b.count + diff);
                    return { ...b, count: adjustedCount };
                  }
                  return b;
                });
              }
            }
          } else if (pool.count > 0) {
            const initialBatch = {
              id: `batch-src-init-${Date.now()}`,
              breed: pool.breed,
              gender: "نامشخص / ترکیبی",
              count: pool.count - amount,
              avgWeightGrams: pool.avgWeightGrams
            };
            updatedBatches = initialBatch.count > 0 ? [initialBatch] : [];
          }

          let finalBreed = pool.breed;
          let finalAvgWeight = pool.avgWeightGrams;
          if (updatedBatches && updatedBatches.length > 0) {
            const totalCount = updatedBatches.reduce((acc, b) => acc + b.count, 0);
            const totalBiomass = updatedBatches.reduce((acc, b) => acc + (b.count * b.avgWeightGrams) / 1000, 0);
            finalAvgWeight = totalCount > 0 ? Math.round((totalBiomass * 1000) / totalCount) : 0;

            const breedCounts: Record<string, number> = {};
            updatedBatches.forEach(b => {
              breedCounts[b.breed] = (breedCounts[b.breed] || 0) + b.count;
            });
            const sortedBreeds = Object.entries(breedCounts).sort((a, b) => b[1] - a[1]);
            if (sortedBreeds.length > 0) {
              finalBreed = sortedBreeds[0][0] as SturgeonBreed;
            }
          }

          return {
            ...pool,
            count: newCount,
            breed: finalBreed,
            avgWeightGrams: finalAvgWeight,
            totalBiomassKg: parseFloat(((newCount * finalAvgWeight) / 1000).toFixed(1)),
            fishBatches: updatedBatches
          };
        }

        // Add dynamically and compile average weight at destination pool
        if (!isSpecialDest && pool.id === toId) {
          const newCount = pool.count + amount;

          let updatedBatches = pool.fishBatches;
          if (updatedBatches && updatedBatches.length > 0) {
            const existingIndex = updatedBatches.findIndex(b => areBreedsEqual(b.breed, transferBreed));
            if (existingIndex > -1) {
              updatedBatches = updatedBatches.map((b, idx) => {
                if (idx === existingIndex) {
                  const newBatchCount = b.count + amount;
                  const newBatchAvgWeight = Math.round(((b.count * b.avgWeightGrams) + (amount * transferAvgWeight)) / newBatchCount);
                  return {
                    ...b,
                    count: newBatchCount,
                    avgWeightGrams: newBatchAvgWeight,
                    gender: transferGender
                  };
                }
                return b;
              });
            } else {
              updatedBatches = [
                ...updatedBatches,
                {
                  id: `batch-trsf-${Date.now()}`,
                  breed: transferBreed,
                  gender: transferGender,
                  count: amount,
                  avgWeightGrams: transferAvgWeight
                }
              ];
            }
          } else {
            const destBatches = [];
            if (pool.count > 0) {
              destBatches.push({
                id: `batch-dest-init-${Date.now()}`,
                breed: pool.breed,
                gender: "نامشخص / ترکیبی",
                count: pool.count,
                avgWeightGrams: pool.avgWeightGrams
              });
            }
            destBatches.push({
              id: `batch-trsf-${Date.now()}`,
              breed: transferBreed,
              gender: transferGender,
              count: amount,
              avgWeightGrams: transferAvgWeight
            });
            updatedBatches = destBatches;
          }

          let computedAvgWeight = pool.avgWeightGrams;
          let computedBreed = pool.breed;

          if (updatedBatches && updatedBatches.length > 0) {
            const totalCount = updatedBatches.reduce((acc, b) => acc + b.count, 0);
            const totalBiomass = updatedBatches.reduce((acc, b) => acc + (b.count * b.avgWeightGrams) / 1000, 0);
            computedAvgWeight = totalCount > 0 ? Math.round((totalBiomass * 1000) / totalCount) : 0;

            const breedCounts: Record<string, number> = {};
            updatedBatches.forEach(b => {
              breedCounts[b.breed] = (breedCounts[b.breed] || 0) + b.count;
            });
            const sortedBreeds = Object.entries(breedCounts).sort((a, b) => b[1] - a[1]);
            if (sortedBreeds.length > 0) {
              computedBreed = sortedBreeds[0][0] as SturgeonBreed;
            }
          }

          return {
            ...pool,
            breed: computedBreed,
            count: newCount,
            avgWeightGrams: computedAvgWeight,
            totalBiomassKg: parseFloat(((newCount * computedAvgWeight) / 1000).toFixed(1)),
            fishBatches: updatedBatches
          };
        }

        return pool;
      });
    });

    // Append standard tracking Movement Ledger index
    const newLog: MovementLog = {
      id: `mov-${Date.now().toString().slice(-3)}-${Math.floor(Math.random() * 90 + 10)}`,
      date: getPersianDate(),
      breed: transferBreed,
      count: amount,
      avgWeightGrams: transferAvgWeight,
      fromPoolId: fromId,
      toPoolId: toId,
      fromPoolName: `${source.name} (سالن ${source.hallId})`,
      toPoolName: isSpecialDest ? specialDestNames[toId] : `${dest!.name} (سالن ${dest!.hallId})`,
      reason,
      operator,
      chipId,
      gender: transferGender
    };

    setMovements(prev => [newLog, ...prev]);
    return true;
  };

  // State Handler 2: Adding dynamic meal records
  const handleAddFeedingLog = (
    poolId: string, 
    feedType: string, 
    givenAmountKg: number, 
    eatenPercentage: number,
    estimatedNextMealKg: number
  ) => {
    const newFeedLog: FeedingMeal = {
      id: `feed-${Date.now().toString().slice(-3)}`,
      poolId,
      timestamp: `${getPersianDate()} ${new Date().toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit" })}`,
      feedType,
      givenAmountKg,
      eatenPercentage,
      leftoverAmountKg: parseFloat((givenAmountKg * (1 - eatenPercentage/100)).toFixed(2)),
      estimatedNextMealKg
    };

    setFeedings(prev => [newFeedLog, ...prev]);

    // Update pool status indicators
    setPools(prevPools => {
      return prevPools.map(pool => {
        if (pool.id === poolId) {
          return {
            ...pool,
            lastFedDate: getPersianDate()
          };
        }
        return pool;
      });
    });
  };

  // State Handler 3: Record Casualty and Auto-Correct Population limits
  const handleAddMortalityRecord = (
    poolId: string,
    count: number,
    breed: SturgeonBreed,
    gender: string,
    symptoms: string,
    explanation: string,
    photoUrl: string,
    aiAction: string
  ): boolean => {
    const pool = pools.find(p => p.id === poolId);
    if (!pool || count <= 0 || availableStock(pool, breed, gender) < count) return false;

    // Reduct count from active pool immediately
    setPools(prevPools => {
      return prevPools.map(p => {
        if (p.id === poolId) {
          let remaining = count;
          const sourceBatches = p.fishBatches?.length ? p.fishBatches : [{ id: `legacy-${p.id}`, breed: p.breed, gender: "unknown", count: p.count, avgWeightGrams: p.avgWeightGrams }];
          const batches = sourceBatches.map(batch => {
            if (batch.breed !== breed || batch.gender !== gender || remaining === 0) return batch;
            const deducted = Math.min(batch.count, remaining);
            remaining -= deducted;
            return { ...batch, count: batch.count - deducted };
          });
          return applyBatchesToPool(p, batches);
        }
        return p;
      });
    });

    const newMortalityLog: MortalityLog = {
      id: `mort-${Date.now().toString().slice(-4)}`,
      poolId,
      poolName: `${pool.name} (سالن ${pool.hallId})`,
      count,
      breed,
      gender,
      date: getPersianDate(),
      avgWeightGrams: pool.avgWeightGrams,
      totalLossKg: parseFloat(((count * pool.avgWeightGrams) / 1000).toFixed(2)),
      reason: symptoms.split(" ")[0] || "نامشخص",
      symptoms,
      photoUrl,
      explanation,
      aiSuggestedAction: aiAction
    };

    setMortalityLogs(prev => [newMortalityLog, ...prev]);
    return true;
  };

  // Reset farm to defaults if manager requests refresh
  const handleResetApplication = () => {
    if (window.confirm("آیا از بازنشانی مجدد اطلاعات فارم خاویاری به داده‌های خام مطمئن هستید؟")) {
      localStorage.clear();
      
      // Seed default admin user with a one-time local password so no credential is published in source.
      const temporaryAdminPassword = crypto.randomUUID().slice(0, 12);
      const defaultUsers = [
        {
          id: "admin",
          name: "مدیریت سیستم",
          username: "admin",
        password: bcrypt.hashSync(temporaryAdminPassword, 10),
          role: "admin",
          permissions: ["all"]
        }
      ];
      localStorage.setItem("sturgeon_users_v2", JSON.stringify(defaultUsers));
      alert(`رمز موقت مدیر سیستم برای همین نصب محلی: ${temporaryAdminPassword}\nپس از ورود، رمز را از پنل مدیریت تغییر دهید.`);
      localStorage.setItem("sturgeon_raw_v4", "true");

      setHalls(INITIAL_HALLS);
      setPools(INITIAL_POOLS);
      setMovements([]);
      setFeedings([]);
      setMortalityLogs([]);
      setSelectedPoolId(null);
      alert("تمامی اطلاعات پیش‌فرض حذف شده و سامانه به صورت کاملاً خام آماده‌سازی شد.");
      window.location.reload();
    }
  };

  // Calculate sum of mortality to represent in tabs
  const totalDeadCount = mortalityLogs.reduce((acc, curr) => acc + curr.count, 0);

  if (!currentUser) {
    return <LoginScreen onLoginSuccess={(user) => setCurrentUser(user)} onLanguageChange={(next) => setLanguage(next)} />;
  }

  if (!initialStockCompleted) {
    return (
      <InitialStockSetup
        pools={pools}
        halls={halls}
        currentUser={currentUser}
        onComplete={(initializedPools) => {
          SturgeonRepository.savePools(initializedPools);
          setPools(initializedPools);
          setInitialStockCompleted(true);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-natural-bg text-natural-text flex flex-col md:flex-row font-sans relative overflow-x-hidden" id="main-layout">
      {/* 🌌 AMBIENT 3D BACKGROUND GLOW ORBS */}
      <div className="ambient-orb-1" />
      <div className="ambient-orb-2" />
      
      {/* MOBILE OVERLAY BACKDROP */}
      {isMobileMenuOpen && (
        <div 
          onClick={() => setIsMobileMenuOpen(false)} 
          className="fixed inset-0 bg-[#1A2E26]/50 z-40 md:hidden backdrop-blur-xs transition-opacity duration-300"
        />
      )}

      {/* 🏛️ GORGEOUS RIGHT SIDEBAR (PERSISTENT ON DESKTOP, BACKDROP SIDE-SLIDE DRAWER ON MOBILE) */}
      <aside 
        className={`
          fixed md:sticky top-0 right-0 h-screen max-h-screen glass-sidebar-3d flex flex-col shrink-0 transition-all duration-300 z-50 w-72 p-4 shadow-[0_25px_60px_rgba(0,0,0,0.7)] backdrop-blur-2xl border-l border-white/15 overflow-hidden
          ${isMobileMenuOpen ? "translate-x-0" : "translate-x-full md:translate-x-0"}
        `}
      >
        <div className="flex-1 overflow-y-auto space-y-5 pr-1 pl-1 min-h-0 overscroll-contain">
          {/* Brand Identity / Logo Header */}
          <div className="flex items-center justify-between pb-5 border-b border-natural-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-natural-forest flex items-center justify-center text-white shadow-md shadow-natural-forest/20">
                <Waves className="animate-pulse" size={20} />
              </div>
              <div>
                <h1 className="text-base font-black text-natural-dark font-sans tracking-tight truncate max-w-[150px]" title={generalSettings.farmName}>{generalSettings.farmName}</h1>
                <p className="text-[10px] text-[#2D4A3E]/60 mt-0.5 truncate max-w-[150px]" title={generalSettings.locationName}>{generalSettings.locationName}</p>
              </div>
            </div>

            {/* Mobile close trigger button */}
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              aria-label={activeTranslations.mobileMenuClose}
              className="p-1 px-1.5 md:hidden hover:bg-natural-khaki rounded-xl text-natural-text transition-colors cursor-pointer border border-natural-border/50"
            >
              <X size={18} />
            </button>
          </div>

          {/* Connected User Badge */}
          <div className="p-3 bg-natural-khaki/50 rounded-2xl border border-natural-border/60 text-xs space-y-2">
            <div>
              <span className="text-[9px] text-[#2D4A3E]/60 block font-semibold">{activeTranslations.observer}</span>
              <strong className="text-natural-dark text-[11px] font-bold block truncate mt-0.5" title={currentUser?.name || "مدیر کارگاه"}>
                {currentUser?.name || "مدیر کارگاه"}
              </strong>
              <span className="text-[9px] text-natural-text/60 font-mono">(@{currentUser?.username || "admin"})</span>
            </div>

            <button
              onClick={handleLogout}
              className="w-full py-1.5 px-2 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 text-[10px] rounded-xl flex items-center justify-center gap-1.5 transition-all font-black cursor-pointer"
            >
              <LogOut size={11} />
              {activeTranslations.logout}
            </button>
          </div>

          {/* Theme & Language Environment Controls */}
          <div id="theme-lang-controls" className="p-3 bg-slate-900/40 dark:bg-slate-900/80 light:bg-emerald-950/5 border border-slate-700/60 dark:border-slate-700 light:border-emerald-800/30 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-800 dark:text-slate-100 light:text-slate-900 font-sans font-black flex items-center gap-1.5">
                <Sun size={13} className="text-amber-500 dark:text-amber-300 light:text-amber-700 shrink-0" />
                {activeTranslations.themeMode}
              </span>
              <div className="flex bg-slate-200 dark:bg-slate-950 light:bg-slate-200/90 rounded-xl p-1 border border-slate-300 dark:border-slate-700/80 light:border-slate-300">
                <button
                  id="btn-theme-dark"
                  onClick={() => setTheme("dark")}
                  className={`px-2.5 py-1 text-[10px] rounded-lg transition-all font-sans font-black cursor-pointer ${
                    theme === "dark"
                      ? "bg-cyan-500 text-slate-950 shadow-md ring-1 ring-cyan-300"
                      : "text-slate-700 dark:text-slate-300 light:text-slate-800 hover:text-slate-950 dark:hover:text-white"
                  }`}
                >
                  {activeTranslations.dark}
                </button>
                <button
                  id="btn-theme-light"
                  onClick={() => setTheme("light")}
                  className={`px-2.5 py-1 text-[10px] rounded-lg transition-all font-sans font-black cursor-pointer ${
                    theme === "light"
                      ? "bg-emerald-700 text-white shadow-md ring-1 ring-emerald-500"
                      : "text-slate-700 dark:text-slate-300 light:text-slate-800 hover:text-slate-950 dark:hover:text-white"
                  }`}
                >
                  {activeTranslations.light}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-300/80 dark:border-slate-700 light:border-emerald-800/20">
              <span className="text-[11px] text-slate-800 dark:text-slate-100 light:text-slate-900 font-sans font-black flex items-center gap-1.5">
                <Globe size={13} className="text-cyan-600 dark:text-cyan-300 light:text-emerald-700 shrink-0" />
                {activeTranslations.lang}
              </span>
              <select
                id="select-lang"
                value={language}
                onChange={(e) => setLanguage(e.target.value as any)}
                className="bg-slate-900 text-slate-100 dark:bg-slate-900 dark:text-slate-100 light:bg-white light:text-slate-900 border border-slate-700 dark:border-slate-600 light:border-slate-300 text-[11px] font-sans font-black rounded-lg px-2.5 py-1 outline-none cursor-pointer shadow-xs"
              >
                <option value="fa" className="bg-slate-900 text-slate-100 light:bg-white light:text-slate-900">فارسی</option>
                <option value="ar" className="bg-slate-900 text-slate-100 light:bg-white light:text-slate-900">العربية</option>
                <option value="en" className="bg-slate-900 text-slate-100 light:bg-white light:text-slate-900">English</option>
                <option value="de" className="bg-slate-900 text-slate-100 light:bg-white light:text-slate-900">Deutsch</option>
                <option value="ru" className="bg-slate-900 text-slate-100 light:bg-white light:text-slate-900">Русский</option>
              </select>
            </div>
          </div>

          {/* LAN Connection Status */}
          <div className="flex items-center justify-between p-3 bg-white border border-natural-border/65 rounded-2xl text-[10px] font-bold shadow-sm">
            <span className="text-natural-text/70 flex items-center gap-1.5">
              <Server size={12} className="text-natural-forest shrink-0" />
              {activeTranslations.syncStatus}
            </span>
            {syncState === "synced" ? (
              <span className="text-emerald-700 flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-full text-[9px]">
                <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-ping"></span>
                {activeTranslations.synced}
              </span>
            ) : syncState === "unauthorized" ? (
              <span className="text-amber-700 flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-full text-[9px]">
                <span className="w-1.5 h-1.5 bg-amber-600 rounded-full"></span>
                {activeTranslations.unauthorized}
              </span>
            ) : (
              <span className="text-rose-700 flex items-center gap-1 bg-rose-50 px-2 py-0.5 rounded-full text-[9px]">
                <span className="w-1.5 h-1.5 bg-rose-600 rounded-full"></span>
                {activeTranslations.offline}
              </span>
            )}
          </div>

          {/* 📊 Customizable Sidebar Dashboard */}
          <SidebarDashboard 
            pools={pools} 
            halls={halls} 
            mortalityCount={totalDeadCount}
            userEmail={currentUser?.username || "admin"}
          />

          {/* Primary Navigation Options */}
          <nav className="space-y-1" aria-label={activeTranslations.mainNavLabel}>
            {hasTabPermission("map") && (
              <button
                onClick={() => { setActiveTab("map"); setIsMobileMenuOpen(false); }}
                className={`w-full px-3.5 py-3 rounded-xl text-xs font-bold font-sans flex items-center gap-2.5 transition-all text-right cursor-pointer ${
                  activeTab === "map" 
                    ? "bg-natural-forest text-white shadow-sm font-black" 
                    : "text-natural-text/80 hover:text-natural-dark hover:bg-natural-khaki/60"
                }`}
              >
                <Building2 size={16} />
                {activeTranslations.map}
              </button>
            )}

            {hasTabPermission("stats") && (
              <button
                onClick={() => { setActiveTab("stats"); setIsMobileMenuOpen(false); }}
                className={`w-full px-3.5 py-3 rounded-xl text-xs font-bold font-sans flex items-center gap-2.5 transition-all text-right cursor-pointer ${
                  activeTab === "stats" 
                    ? "bg-natural-forest text-white shadow-sm font-black" 
                    : "text-natural-text/80 hover:text-natural-dark hover:bg-natural-khaki/60"
                }`}
              >
                <ActivitySquare size={16} />
                {activeTranslations.stats}
              </button>
            )}

            {hasTabPermission("realtime") && (
              <button
                onClick={() => { setActiveTab("realtime"); setIsMobileMenuOpen(false); }}
                className={`w-full px-3.5 py-3 rounded-xl text-xs font-bold font-sans flex items-center gap-2.5 transition-all text-right cursor-pointer ${
                  activeTab === "realtime" 
                    ? "bg-[#D68227] text-white shadow-sm font-black" 
                    : "text-natural-text/80 hover:text-orange-850 hover:bg-amber-100/30"
                }`}
              >
                <PlusCircle size={16} />
                {activeTranslations.realtime}
                <span className="bg-amber-100 text-amber-900 text-[8px] px-1.5 py-0.5 rounded-full mr-auto font-sans font-black">
                  {activeTranslations.quick}
                </span>
              </button>
            )}

            {hasTabPermission("feeding") && (
              <button
                onClick={() => { setActiveTab("feeding"); setIsMobileMenuOpen(false); }}
                className={`w-full px-3.5 py-3 rounded-xl text-xs font-bold font-sans flex items-center gap-2.5 transition-all text-right cursor-pointer ${
                  activeTab === "feeding" 
                    ? "bg-natural-forest text-white shadow-sm font-black" 
                    : "text-natural-text/80 hover:text-natural-dark hover:bg-natural-khaki/60"
                }`}
              >
                <UtensilsCrossed size={16} />
                {activeTranslations.feeding}
              </button>
            )}

            {hasTabPermission("lab") && (
              <button
                onClick={() => { setActiveTab("lab"); setIsMobileMenuOpen(false); }}
                className={`w-full px-3.5 py-3 rounded-xl text-xs font-bold font-sans flex items-center gap-2.5 transition-all text-right cursor-pointer ${
                  activeTab === "lab" 
                    ? "bg-natural-forest text-white shadow-sm font-black" 
                    : "text-natural-text/80 hover:text-natural-dark hover:bg-natural-khaki/60"
                }`}
              >
                <FlaskConical size={16} />
                {activeTranslations.lab}
                <span className="bg-emerald-800 text-[#FDFCF8] text-[8px] px-1.5 py-0.5 rounded-full mr-auto font-sans font-black">
                  {activeTranslations.new}
                </span>
              </button>
            )}

            {hasTabPermission("mortality") && (
              <button
                onClick={() => { setActiveTab("mortality"); setIsMobileMenuOpen(false); }}
                className={`w-full px-3.5 py-3 rounded-xl text-xs font-bold font-sans flex items-center gap-2.5 transition-all text-right cursor-pointer ${
                  activeTab === "mortality" 
                    ? "bg-natural-clay text-white shadow-sm font-black" 
                    : "text-natural-text/80 hover:text-[#A65D50] hover:bg-[#A65D50]/10"
                }`}
              >
                <HeartCrack size={16} />
                <span>{activeTranslations.mortality}</span>
                {totalDeadCount > 0 && (
                  <span className="bg-white/15 text-white rounded-full px-1.5 py-0.5 text-[9px] font-bold font-mono mr-auto">
                    {totalDeadCount}
                  </span>
                )}
              </button>
            )}

            {hasTabPermission("transfer") && (
              <button
                onClick={() => { setActiveTab("transfer"); setIsMobileMenuOpen(false); }}
                className={`w-full px-3.5 py-3 rounded-xl text-xs font-bold font-sans flex items-center gap-2.5 transition-all text-right cursor-pointer ${
                  activeTab === "transfer" 
                    ? "bg-natural-forest text-white shadow-sm font-black" 
                    : "text-natural-text/80 hover:text-natural-dark hover:bg-natural-khaki/60"
                }`}
              >
                <ArrowRightLeft size={16} />
                {activeTranslations.transfer}
              </button>
            )}

            {hasTabPermission("archive") && (
              <button
                onClick={() => { setActiveTab("archive"); setIsMobileMenuOpen(false); }}
                className={`w-full px-3.5 py-3 rounded-xl text-xs font-bold font-sans flex items-center gap-2.5 transition-all text-right cursor-pointer ${
                  activeTab === "archive" 
                    ? "bg-natural-forest text-white shadow-sm font-black" 
                    : "text-natural-text/80 hover:text-natural-dark hover:bg-natural-khaki/60"
                }`}
              >
                <Archive size={16} />
                {activeTranslations.archive}
              </button>
            )}

            {/* 🏢 NEW DEPARTMENTS LIST SEPARATOR */}
            {(hasTabPermission("feedmill") || 
              hasTabPermission("inventory") || 
              hasTabPermission("processing") || 
              hasTabPermission("coldstorage") || 
              hasTabPermission("facilities") || 
              hasTabPermission("traceability") || 
              hasTabPermission("accounting") || 
              hasTabPermission("security") || 
              hasTabPermission("chat")) && (
              <div className="px-3.5 pt-4 pb-2 text-[9px] font-black text-natural-text/40 tracking-wider font-sans border-t border-natural-border/30 mt-3 uppercase text-right">{activeTranslations.departments}</div>
            )}

            {/* 🌾 FEED MILL */}
            {hasTabPermission("feedmill") && (
              <button
                onClick={() => { setActiveTab("feedmill"); setIsMobileMenuOpen(false); }}
                className={`w-full px-3.5 py-3 rounded-xl text-xs font-bold font-sans flex items-center gap-2.5 transition-all text-right cursor-pointer ${
                  activeTab === "feedmill" 
                    ? "bg-emerald-800 text-white shadow-sm font-black" 
                    : "text-natural-text/80 hover:text-emerald-900 hover:bg-emerald-50/30"
                }`}
              >
                <Wheat size={16} />
                {activeTranslations.feedmill}
              </button>
            )}

            {/* 📦 INVENTORY */}
            {hasTabPermission("inventory") && (
              <button
                onClick={() => { setActiveTab("inventory"); setIsMobileMenuOpen(false); }}
                className={`w-full px-3.5 py-3 rounded-xl text-xs font-bold font-sans flex items-center gap-2.5 transition-all text-right cursor-pointer ${
                  activeTab === "inventory" 
                    ? "bg-indigo-700 text-white shadow-sm font-black" 
                    : "text-natural-text/80 hover:text-indigo-900 hover:bg-indigo-50/30"
                }`}
              >
                <Warehouse size={16} />
                {activeTranslations.inventory}
              </button>
            )}

            {/* 🦈 CAVIAR PROCESSING */}
            {hasTabPermission("processing") && (
              <button
                onClick={() => { setActiveTab("processing"); setIsMobileMenuOpen(false); }}
                className={`w-full px-3.5 py-3 rounded-xl text-xs font-bold font-sans flex items-center gap-2.5 transition-all text-right cursor-pointer ${
                  activeTab === "processing" 
                    ? "bg-rose-700 text-white shadow-sm font-black" 
                    : "text-natural-text/80 hover:text-rose-800 hover:bg-rose-50/30"
                }`}
              >
                <Factory size={16} />
                {activeTranslations.processing}
              </button>
            )}

            {/* ❄️ COLD STORAGE (سردخانه) */}
            {hasTabPermission("coldstorage") && (
              <button
                onClick={() => { setActiveTab("coldstorage"); setIsMobileMenuOpen(false); }}
                className={`w-full px-3.5 py-3 rounded-xl text-xs font-bold font-sans flex items-center gap-2.5 transition-all text-right cursor-pointer ${
                  activeTab === "coldstorage" 
                    ? "bg-sky-800 text-white shadow-sm font-black" 
                    : "text-natural-text/80 hover:text-sky-900 hover:bg-sky-50/30"
                }`}
              >
                <Snowflake size={16} />
                {activeTranslations.coldstorage}
              </button>
            )}

            {/* 🔧 FACILITIES */}
            {hasTabPermission("facilities") && (
              <button
                onClick={() => { setActiveTab("facilities"); setIsMobileMenuOpen(false); }}
                className={`w-full px-3.5 py-3 rounded-xl text-xs font-bold font-sans flex items-center gap-2.5 transition-all text-right cursor-pointer ${
                  activeTab === "facilities" 
                    ? "bg-cyan-700 text-white shadow-sm font-black" 
                    : "text-natural-text/80 hover:text-cyan-800 hover:bg-cyan-50/30"
                }`}
              >
                <Cpu size={16} />
                {activeTranslations.facilities}
              </button>
            )}

            {/* 🔗 TRACEABILITY & SYSTEM OVERLAP (رهگیری زنجیره ارزش) */}
            {hasTabPermission("traceability") && (
              <button
                onClick={() => { setActiveTab("traceability"); setIsMobileMenuOpen(false); }}
                className={`w-full px-3.5 py-3 rounded-xl text-xs font-bold font-sans flex items-center gap-2.5 transition-all text-right cursor-pointer ${
                  activeTab === "traceability" 
                    ? "bg-indigo-950 text-white shadow-sm font-black border border-indigo-400/20" 
                    : "text-natural-text/80 hover:text-indigo-950 hover:bg-indigo-50/40"
                }`}
              >
                <Fingerprint size={16} className="text-indigo-500" />
                {activeTranslations.traceability}
              </button>
            )}

            {/* 🪙 ACCOUNTING */}
            {hasTabPermission("accounting") && (
              <button
                onClick={() => { setActiveTab("accounting"); setIsMobileMenuOpen(false); }}
                className={`w-full px-3.5 py-3 rounded-xl text-xs font-bold font-sans flex items-center gap-2.5 transition-all text-right cursor-pointer ${
                  activeTab === "accounting" 
                    ? "bg-amber-600 text-white shadow-sm font-black" 
                    : "text-natural-text/80 hover:text-amber-800 hover:bg-amber-50/30"
                }`}
              >
                <Coins size={16} />
                {activeTranslations.accounting}
              </button>
            )}

            {/* 🛡️ SECURITY */}
            {hasTabPermission("security") && (
              <button
                onClick={() => { setActiveTab("security"); setIsMobileMenuOpen(false); }}
                className={`w-full px-3.5 py-3 rounded-xl text-xs font-bold font-sans flex items-center gap-2.5 transition-all text-right cursor-pointer ${
                  activeTab === "security" 
                    ? "bg-emerald-800 text-white shadow-sm font-black" 
                    : "text-natural-text/80 hover:text-emerald-950 hover:bg-emerald-50/30"
                }`}
              >
                <Shield size={16} />
                {activeTranslations.security}
              </button>
            )}

            {/* 💬 CHAT & LIVE CALLING SYSTEM */}
            {hasTabPermission("chat") && (
              <button
                onClick={() => { setActiveTab("chat"); setIsMobileMenuOpen(false); }}
                className={`w-full px-3.5 py-3 rounded-xl text-xs font-bold font-sans flex items-center gap-2.5 transition-all text-right cursor-pointer ${
                  activeTab === "chat" 
                    ? "bg-[#8C6A43] text-white shadow-sm font-black border border-[#8C6A43]/20" 
                    : "text-natural-text/80 hover:text-[#8C6A43] hover:bg-[#8C6A43]/10"
                }`}
              >
                <MessageSquare size={16} className={activeTab === "chat" ? "text-white" : "text-[#8C6A43]"} />
                {activeTranslations.chat}
                <span className="bg-emerald-100 text-emerald-800 text-[8px] px-1.5 py-0.5 rounded-full mr-auto font-sans font-black animate-pulse">
                  {activeTranslations.live}
                </span>
              </button>
            )}

            {/* 🌟 FATHI AQUA SUPER ERP REPORT & ARCHITECTURE */}
            <button
              onClick={() => { setActiveTab("report"); setIsMobileMenuOpen(false); }}
              className={`w-full px-3.5 py-3 rounded-xl text-xs font-bold font-sans flex items-center gap-2.5 transition-all text-right cursor-pointer ${
                activeTab === "report" 
                  ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg font-black" 
                  : "text-natural-text/80 hover:text-cyan-400 hover:bg-cyan-500/10"
              }`}
            >
              <FileText size={16} className="text-cyan-400" />
              {activeTranslations.report}
              <span className="bg-cyan-500/20 text-cyan-300 text-[8px] px-1.5 py-0.5 rounded-full mr-auto font-sans font-black">
                v4.5
              </span>
            </button>

            {/* 🛡️ ADMIN & CONFIG ACCESS MODULE */}
            {(currentUser?.role === "admin" || hasTabPermission("settings") || hasTabPermission("admin")) && (
              <>
                <div className="px-3.5 pt-4 pb-2 text-[9px] font-black text-red-700/60 tracking-wider font-sans border-t border-natural-border/30 mt-3 uppercase text-right flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                  {activeTranslations.managementSection}
                </div>
     
                <button
                  onClick={() => { setActiveTab("admin"); setIsMobileMenuOpen(false); }}
                  className={`w-full px-3.5 py-3 rounded-xl text-xs font-bold font-sans flex items-center gap-2.5 transition-all text-right cursor-pointer ${
                    activeTab === "admin" 
                      ? "bg-red-750 text-white shadow-sm font-black" 
                      : "text-red-800 hover:text-red-950 hover:bg-red-50/50"
                  }`}
                >
                  <Shield size={16} className={activeTab === "admin" ? "text-white" : "text-red-750"} />
                  {activeTranslations.adminConfig}
                  {currentUser?.role === "admin" && (
                    <span className="bg-red-100 text-red-850 text-[8px] px-1.5 py-0.5 rounded-full mr-auto font-sans font-black">
                      {activeTranslations.adminBadge}
                    </span>
                  )}
                </button>
              </>
            )}
          </nav>
        </div>

        {/* Sidebar Footer Controls & Metadata */}
        <div className="pt-3 mt-3 border-t border-natural-border space-y-3 shrink-0">
          <div className="bg-natural-khaki/40 text-natural-text/70 rounded-2xl p-3 border border-natural-border/40 text-[10px] space-y-2">
            <div className="flex justify-between items-center gap-1">
              <span>تاریخ پایش فارم:</span>
              <strong className="text-natural-dark font-mono font-bold text-left text-[10px] truncate" title={`${getPersianFullDateAndWeekday()} (${new Date().getFullYear()})`}>
                {getPersianFullDateAndWeekday()} ({new Date().getFullYear()})
              </strong>
            </div>
            <div className="flex justify-between items-center">
              <span>نسخه هوش مصنوعی:</span>
              <span className="text-natural-dark font-mono font-black">v3.5 [Gemini]</span>
            </div>
          </div>
        </div>
      </aside>

      {/* 💻 MAIN AREA (TOP HEADER BAR FOR MOBILE, DETAILED VIEW PANELS & HUMBLE FOOTER) */}
      <div className="flex-grow flex flex-col min-h-screen overflow-x-hidden">
        
        {/* MOBILE COMPACT HEADER BAR */}
        <header className="md:hidden bg-white border-b border-natural-border p-4 flex justify-between items-center shadow-sm z-30 sticky top-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-natural-forest flex items-center justify-center text-white font-bold shadow-sm">
              <Waves className="animate-pulse" size={16} />
            </div>
            <div>
              <span className="text-xs font-black text-natural-dark block leading-none">{activeTranslations.farmName}</span>
              <span className="text-[8px] text-natural-text/50 mt-1 block leading-none">{activeTranslations.subtitle}</span>
            </div>
          </div>

          <div className="bg-natural-khaki border border-natural-border/80 px-2.5 py-1 rounded-full text-[9px] font-bold text-natural-dark">
            {activeTabTitle}
          </div>

          <button
            onClick={() => setIsMobileMenuOpen(true)}
            aria-label={activeTranslations.mobileMenuOpen}
            className="p-1 px-1.5 bg-natural-khaki text-natural-dark hover:bg-natural-khaki/80 rounded-xl transition-all cursor-pointer border border-natural-border/70"
          >
            <Menu size={18} />
          </button>
        </header>

        {/* COMPREHENSIVE DESKTOP ONLY HEADER */}
        <div className="hidden md:block p-6 lg:p-8 pb-0">
          <div className="flex justify-between items-center bg-white border border-natural-border rounded-3xl p-5 shadow-sm">
            <div>
              <div className="flex items-center gap-2 text-[10px] text-natural-earth font-black select-none">
                <span>{activeTranslations.farmDatabase}</span>
                <span>•</span>
              <span className={syncState === "synced" ? "text-emerald-700 animate-pulse" : "text-rose-700"}>
                {syncState === "synced" ? activeTranslations.onlineConnected : syncState === "unauthorized" ? activeTranslations.unauthorized : activeTranslations.localMode}
              </span>
              </div>
              <h2 className="text-lg font-black text-natural-dark font-sans mt-1">
                {activeTabTitle}
              </h2>
            </div>

            <div className="flex items-center gap-3">
              {/* 📡 OFFLINE QUEUE & AUTO-SYNC STATUS BADGE */}
              <OfflineSyncIndicator />

              <button
                onClick={() => setIsSearchOpen(true)}
                className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-cyan-500/30 text-[11px] font-bold rounded-2xl flex items-center gap-2 transition-all cursor-pointer shadow-xs"
              >
                <Search size={14} className="text-cyan-400" />
                <span>جستجوی سراسری</span>
                <kbd className="hidden lg:inline-block px-1.5 py-0.5 bg-slate-800 text-[9px] rounded border border-slate-700 text-slate-300 font-mono">
                  Ctrl+K
                </kbd>
              </button>

              <button
                onClick={() => setQrModalState({ isOpen: true, pool: pools.find(p => p.id === selectedPoolId) || pools[0] })}
                className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold rounded-2xl flex items-center gap-2 transition-all cursor-pointer shadow-xs"
              >
                <QrCode size={14} className="text-emerald-400" />
                <span>صدور QR شناسه CITES</span>
              </button>

              <div className="text-[10px] text-natural-text/50 text-left font-semibold font-sans hidden xl:block">
                سیستم جامع پایش گله‌های نرسری، پیش‌پروار و مولد دوزهای خاویاری خزر
              </div>
            </div>
          </div>
        </div>

        {/* PRIMARY VIEWPORTS */}
        <main className="flex-grow p-4 sm:p-6 lg:p-8 space-y-6">
          
          {/* 📡 IOT SENSOR ALERTS & TELEMETRY SIMULATOR */}
          <IoTSensorAlerts
            pools={pools}
            onNavigateToPool={(poolId) => {
              setSelectedPoolId(poolId);
              setActiveTab("realtime");
            }}
          />

          {/* GLOBAL REPORTING & DOCUMENT ISSUANCE TOOLBAR */}
          <div id="export-and-print-toolbar" className="bg-white border border-natural-border rounded-3xl p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4 no-print">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-natural-khaki rounded-2xl text-natural-earth">
                <Printer size={20} />
              </div>
              <div className="text-right">
                <h3 className="text-xs font-black text-natural-dark font-sans flex items-center gap-1.5">
                  جعبه ابزار گزارش‌گیری و صدور اسناد کارگاه
                  <span className="bg-natural-earth/10 text-natural-earth text-[8px] px-1.5 py-0.5 rounded-full font-black">نسخه ۴.۵</span>
                </h3>
                <p className="text-[10px] text-natural-text/60 mt-0.5 font-sans">
                  صدور سریع گزارش رسمی چاپی، ذخیره‌سازی به صورت فایل PDF یا دریافت جدول داده‌های خام اکسل (Excel/CSV) برای بخش فعلی
                </p>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
              <button
                onClick={handlePrint}
                className="px-4 py-2.5 bg-neutral-105 hover:bg-neutral-200 text-neutral-800 text-[11px] font-bold rounded-2xl flex items-center gap-1.5 transition-all border border-neutral-200 shadow-2xs cursor-pointer"
              >
                <Printer size={13} />
                چاپ مستقیم
              </button>
              <button
                onClick={handlePdfExport}
                className="px-4 py-2.5 bg-natural-earth hover:bg-natural-earth/90 text-white text-[11px] font-black rounded-2xl flex items-center gap-1.5 transition-all border border-natural-earth shadow-2xs cursor-pointer"
              >
                <Download size={13} />
                ذخیره PDF رسمی
              </button>
              <button
                onClick={handleExcelExport}
                className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-[11px] font-black rounded-2xl flex items-center gap-1.5 transition-all border border-emerald-800 shadow-2xs cursor-pointer"
              >
                <FileSpreadsheet size={13} />
                خروجی اکسل (Excel)
              </button>
            </div>
          </div>

          {/* EXPORT NOTICE / INSTRUCTIONS DIALOG */}
          {exportNotice && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in no-print">
              <div className="bg-white border border-natural-border rounded-3xl p-6 max-w-md w-full shadow-2xl relative text-right font-sans">
                <div className="flex items-center gap-2 text-natural-earth font-black mb-3 text-sm">
                  <Info size={18} />
                  <span>{exportNotice.title}</span>
                </div>
                
                <p className="text-xs text-natural-text/80 leading-relaxed mb-6 font-sans">
                  {exportNotice.desc}
                </p>
                
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => setExportNotice(null)}
                    className="px-5 py-2.5 bg-natural-forest text-white text-xs font-black rounded-2xl hover:bg-natural-forest-hover transition-all shadow-sm cursor-pointer"
                  >
                    فهمیدم، متشکرم
                  </button>
                </div>
              </div>
            </div>
          )}

          <div id="dynamic-module-viewport" className="transition-all duration-300">
            <Suspense fallback={<ModuleLoader />}>
            
            {/* TAB 1: INTERACTIVE MAP */}
            {activeTab === "map" && (
              <div className="space-y-6" id="map-view">
                <div className="flex flex-wrap gap-2 overflow-x-auto pb-2 border-b border-natural-border pr-1">
                  {halls.map((hall) => {
                    const isActive = selectedHallId === hall.id;
                    const poolCount = pools.filter(p => p.hallId === hall.id && p.count > 0).length;
                    
                    return (
                      <button
                        key={hall.id}
                        id={`switcher-h-${hall.id}`}
                        onClick={() => {
                          setSelectedHallId(hall.id);
                          setSelectedPoolId(null);
                        }}
                        className={`
                          px-3.5 py-2.5 rounded-2xl text-xs font-bold font-sans flex flex-col items-center shrink-0 min-w-[70px] border transition-all cursor-pointer
                          ${isActive 
                            ? "bg-natural-forest text-white border-natural-forest-hover shadow-sm" 
                            : "bg-white text-natural-text border-natural-border hover:bg-natural-khaki/30"
                          }
                        `}
                      >
                        <span className="text-[10.5px]">سالن {hall.id}</span>
                        <span className={`text-[9px] mt-1 px-1.5 rounded-full ${isActive ? "bg-white/20 text-[#FDFCF8]" : "bg-natural-khaki text-natural-text/60"}`}>
                          {hall.isUnderConstruction ? "احداث" : `${poolCount} استخر فعال`}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <HallMap
                  hall={halls.find(h => h.id === selectedHallId)!}
                  pools={pools}
                  selectedPoolId={selectedPoolId}
                  onSelectPool={(pId) => setSelectedPoolId(pId)}
                />
              </div>
            )}

            {/* TAB 2: BIOMASS STATS */}
            {activeTab === "stats" && (
              <DashboardStats
                pools={pools}
                halls={halls}
                mortalityCount={totalDeadCount}
              />
            )}

            {/* TAB 3: FEEDING CALCULATOR */}
            {activeTab === "feeding" && (
              <FeedingCalculator
                pools={pools}
                onAddFeedingLog={handleAddFeedingLog}
              />
            )}

            {/* TAB 4: TRANSFER MANAGER */}
            {activeTab === "transfer" && (
              <TransferManager
                pools={pools}
                movements={movements}
                halls={halls}
                onExecuteTransfer={handleExecuteTransfer}
                setPools={setPools}
                setMovements={setMovements}
                initialFromPoolId={transferFromPoolId}
                onClearInitialFromPoolId={() => setTransferFromPoolId("")}
              />
            )}

            {/* TAB 5: MORTALITY LOGS */}
            {activeTab === "mortality" && (
              <MortalityManager
                pools={pools}
                mortalityLogs={mortalityLogs}
                onAddMortalityRecord={handleAddMortalityRecord}
              />
            )}

            {/* TAB 6: NEW LABORATORY MODULE */}
            {activeTab === "lab" && (
              <LabManager
                pools={pools}
              />
            )}

            {/* TAB: REAL-TIME QUICK POOL LOGGER */}
            {activeTab === "realtime" && (
              <PoolQuickLogger
                pools={pools}
                onAddFeedingLog={handleAddFeedingLog}
                onExecuteTransfer={handleExecuteTransfer}
                onAddMortalityRecord={handleAddMortalityRecord}
                setPools={setPools}
                onInitiateTransfer={(poolId) => {
                  setTransferFromPoolId(poolId);
                  setActiveTab("transfer");
                }}
                onOpenQrCode={(pool) => setQrModalState({ isOpen: true, pool })}
              />
            )}

            {/* TAB 7: UNIFIED ARCHIVE & HISTORY ENTRIES */}
            {activeTab === "archive" && (
              <ArchiveManager
                pools={pools}
                feedings={feedings}
                movements={movements}
                mortalityLogs={mortalityLogs}
              />
            )}

            {/* EXTRA DEPARTMENTS RENDERS */}
            {["facilities", "processing", "feedmill", "inventory", "accounting", "security", "coldstorage", "traceability"].includes(activeTab) && (
              <ExtraDepartmentsManager
                pools={pools}
                activeDepartment={activeTab as any}
              />
            )}

            {/* TAB: ADMIN & INFRASTRUCTURE DEVELOPMENT */}
            {activeTab === "admin" && (
              <AdminSettings
                pools={pools}
                halls={halls}
                setPools={setPools}
                setHalls={setHalls}
                onReloadData={reloadGeneralSettings}
              />
            )}

            {/* TAB: SYSTEM SETTINGS & GENERAL CONFIG */}
            {activeTab === "settings" && (
              <SettingsManager
                pools={pools}
                halls={halls}
                onReloadData={reloadGeneralSettings}
              />
            )}

            {/* TAB: CHAT & LIVE CALLING SYSTEM */}
            {activeTab === "chat" && (
              <ChatManager
                currentUser={currentUser}
              />
            )}

            {/* TAB: FATHI SYSTEM REPORT & ARCHITECTURE */}
            {activeTab === "report" && (
              <FathiSystemReport />
            )}

            </Suspense>
          </div>

          {/* 🎙️ OFFLINE VOICE ASSISTANT */}
          <VoiceAssistant 
            onNavigate={(tab: any) => setActiveTab(tab)}
            onExecuteCommand={(type, payload) => {
              if (type === "mortality" && payload) {
                // handle quick mortality record
                const newLog = {
                  id: Date.now().toString(),
                  poolId: payload.poolId,
                  hallId: 1,
                  count: payload.count,
                  reason: "ثبت توسط دستیار صوتی هوشمند آفلاین",
                  date: new Date().toISOString(),
                  operator: currentUser?.name || "اپراتور صوتی"
                };
                setMortalityLogs(prev => [newLog, ...prev]);
              }
            }}
          />

          {/* 🔍 GLOBAL SEARCH MODAL */}
          <GlobalSearchModal
            isOpen={isSearchOpen}
            onClose={() => setIsSearchOpen(false)}
            pools={pools}
            onSelectPool={(pId) => {
              setSelectedPoolId(pId);
              setActiveTab("realtime");
            }}
            onNavigateTab={(tab: any) => setActiveTab(tab)}
          />

          {/* 🏷️ DYNAMIC QR CODE MODAL */}
          <QrCodeModal
            isOpen={qrModalState.isOpen}
            onClose={() => setQrModalState({ isOpen: false })}
            pool={qrModalState.pool}
            citesBatch={qrModalState.citesBatch}
          />

        </main>

        {/* PERSISTENT HUMBLE FOOTER INFO */}
        <footer className="bg-white text-natural-text/70 py-6 px-6 border-t border-natural-border mt-auto text-center text-xs font-sans relative">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="leading-relaxed">
              سامانه بومی حفاظت شیلاتی <strong className="text-natural-dark font-black">{generalSettings.farmName}</strong> © 2026. مهندسی شده بر پایه‌ی الگوهای اکولوژیکی تغذیه و زیست‌شناسی ماهیان خاویاری دریای خزر.
            </p>
            <div className="flex gap-4 items-center text-natural-text/50">
              <span>توسعه یافته برای پایش هوشمند گله‌های فیل‌ماهی و تاس‌ماهی لمی</span>
            </div>
          </div>
        </footer>

      </div>
    </div>
  );
}
