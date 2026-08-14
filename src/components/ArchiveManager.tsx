import React, { useState, useMemo } from "react";
import { 
  Archive, 
  Search, 
  Filter, 
  UtensilsCrossed, 
  ArrowRightLeft, 
  HeartCrack, 
  Droplet, 
  Dna, 
  Calendar, 
  User, 
  TrendingUp, 
  Download, 
  Clock, 
  Trash2, 
  Info,
  Layers,
  ChevronDown,
  ChevronUp,
  FileText,
  Boxes,
  RefreshCw,
  AlertTriangle,
  Shield,
  Coins,
  Warehouse,
  Wheat,
  Factory,
  Snowflake,
  Plus
} from "lucide-react";
import { Pool, FeedingMeal, MovementLog, MortalityLog, WaterTestLog, SonographyLog } from "../types";
import { formatWaterParam } from "../utils/aquacultureUtils";

interface ArchiveManagerProps {
  pools: Pool[];
  feedings: FeedingMeal[];
  movements: MovementLog[];
  mortalityLogs: MortalityLog[];
}

type ArchiveType = "all" | "feeding" | "movement" | "mortality" | "water" | "ultrasound" | "traceability";

interface UnifiedArchiveItem {
  id: string;
  type: ArchiveType;
  typeName: string;
  badgeBg: string;
  badgeText: string;
  icon: React.ReactNode;
  poolName: string;
  date: string;
  timestamp: string;
  title: string;
  details: string;
  operatorOrDetail?: string;
  secondaryMeta?: string;
  rawObject: any;
  poolId?: string;
  hallId?: number;
}

export default function ArchiveManager({ pools, feedings, movements, mortalityLogs }: ArchiveManagerProps) {
  const [activeFilter, setActiveFilter] = useState<ArchiveType>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);

  // Separate filters for Hall and Pool
  const [filterHallId, setFilterHallId] = useState<string>("all");
  const [filterPoolId, setFilterPoolId] = useState<string>("all");

  // Traceability presets and search states
  const [selectedTracePreset, setSelectedTracePreset] = useState<"c2" | "f1" | "m2" | "f12" | "custom">("c2");
  const [traceSearchQuery, setTraceSearchQuery] = useState("");

  // Load water and ultrasound logs from LocalStorage dynamically
  const waterLogs = useMemo<WaterTestLog[]>(() => {
    try {
      const saved = localStorage.getItem("sturgeon_lab_water_logs");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  }, []);

  const ultrasoundLogs = useMemo<SonographyLog[]>(() => {
    try {
      const saved = localStorage.getItem("sturgeon_lab_ultrasound_logs");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  }, []);

  // Departmental logs needed to run Trace Searching inside Archive tab
  const securityLogs = useMemo(() => {
    try {
      const saved = localStorage.getItem("caviar_security");
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  }, []);

  const financials = useMemo(() => {
    try {
      const saved = localStorage.getItem("caviar_financials");
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  }, []);

  const inventoryLogs = useMemo(() => {
    try {
      const saved = localStorage.getItem("caviar_inventory_logs");
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  }, []);

  const feedBatches = useMemo(() => {
    try {
      const saved = localStorage.getItem("caviar_feedmill");
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  }, []);

  const caviarBatches = useMemo(() => {
    try {
      const saved = localStorage.getItem("caviar_processing");
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  }, []);

  const coldStorageInventory = useMemo(() => {
    try {
      const saved = localStorage.getItem("caviar_cold_storage_inventory");
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  }, []);

  // Consumables state
  const [consumables, setConsumables] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem("caviar_consumables");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const getDeptLabel = (dept: string) => {
    switch (dept) {
      case "facilities": return "تأسیسات و پشتیبانی";
      case "processing": return "کارگاه فرآوری";
      case "feedmill": return "کارخانه خوراک";
      case "inventory": return "بخش انبارداری";
      case "accounting": return "حسابداری مالی";
      case "security": return "نگهبانی و حراست";
      case "coldstorage": return "سردخانه مرکزی";
      default: return "عمومی / نامشخص";
    }
  };

  const handleRecordConsumption = (id: string, date: string) => {
    try {
      const updated = consumables.map((c: any) => c.id === id ? { ...c, status: "consumed", consumptionDate: date } : c);
      setConsumables(updated);
      localStorage.setItem("caviar_consumables", JSON.stringify(updated));
    } catch {
      alert("خطایی در ثبت مصرف رخ داد.");
    }
  };

  const handleTraceSearch = (query: string) => {
    const normalised = query.trim().toLowerCase();
    if (!normalised) return [];

    const results: Array<{ dept: string; title: string; desc: string; date: string; icon: string }> = [];

    // 1. Search Security logs
    securityLogs.forEach((s: any) => {
      if (s.visitorName.toLowerCase().includes(normalised) || s.carPlate.toLowerCase().includes(normalised) || s.purpose.toLowerCase().includes(normalised)) {
        results.push({
          dept: "نگهبانی و حراست",
          title: `تردد گیت ${s.actionType === "enter" ? "ورودی" : "خروجی"} - ${s.visitorName}`,
          desc: `علت تردد: ${s.purpose} | پلاک: ${s.carPlate}`,
          date: s.date + " " + s.time,
          icon: "shield"
        });
      }
    });

    // 2. Search Financial logs
    financials.forEach((f: any) => {
      if (f.category.toLowerCase().includes(normalised) || f.description.toLowerCase().includes(normalised)) {
        results.push({
          dept: "حسابداری مالی",
          title: `سند مالی ${f.type === "income" ? "درآمد" : "هزینه"} - بابت ${f.category}`,
          desc: f.description + ` | مبلغ: ${f.amountToman.toLocaleString("fa-IR")} تومان`,
          date: f.date,
          icon: "coins"
        });
      }
    });

    // 3. Search Inventory logs
    inventoryLogs.forEach((i: any) => {
      if (i.itemName.toLowerCase().includes(normalised) || i.reason.toLowerCase().includes(normalised) || i.operator.toLowerCase().includes(normalised)) {
        results.push({
          dept: "بخش انبارداری",
          title: `${i.action === "add" ? "دریافت کالا" : "حواله خروج"} - ${i.itemName}`,
          desc: `مقدار: ${i.quantity} واحد | کاربر: ${i.operator} | بابت: ${i.reason}`,
          date: i.date,
          icon: "warehouse"
        });
      }
    });

    // 4. Search Feed Mill batches
    feedBatches.forEach((f: any) => {
      if (f.pelletSize.toLowerCase().includes(normalised) || f.grade.toLowerCase().includes(normalised) || f.operator.toLowerCase().includes(normalised)) {
        results.push({
          dept: "کارخانه خوراک",
          title: `تولید خوراک خشک پلت ${f.pelletSize}`,
          desc: `کیفیت: ${f.grade} | خروجی خالص: ${f.outputKg} کیلوگرم | توسط: ${f.operator}`,
          date: f.date,
          icon: "wheat"
        });
      }
    });

    // 5. Search Caviar Processing batches
    caviarBatches.forEach((c: any) => {
      if (c.grade.toLowerCase().includes(normalised) || c.notes.toLowerCase().includes(normalised) || c.poolId.toLowerCase().includes(normalised)) {
        results.push({
          dept: "کارخانه فرآوری",
          title: `بچ استحصال خاویار ${c.grade}`,
          desc: `مقدار خاویار: ${c.caviarWeightKg} کیلوگرم (بهره‌وری ${c.yieldPercent}٪) | استخر مبدا: ${c.poolId} | توضیحات: ${c.notes}`,
          date: c.date,
          icon: "factory"
        });
      }
    });

    // 6. Search Cold Storage logs
    coldStorageInventory.forEach((cs: any) => {
      if (cs.itemName.toLowerCase().includes(normalised) || cs.roomName.toLowerCase().includes(normalised) || cs.operator.toLowerCase().includes(normalised)) {
        results.push({
          dept: "سردخانه مرکزی",
          title: `حق العمل انبارش: ${cs.itemName}`,
          desc: `وزن کل: ${cs.weightKg} کیلوگرم | مکان: ${cs.roomName} | بارکد: ${cs.id}`,
          date: cs.dateAdded,
          icon: "snowflake"
        });
      }
    });

    // 7. Search Consumables Lifecycles
    consumables.forEach((c: any) => {
      const matchName = c.itemName.toLowerCase().includes(normalised);
      const matchNotes = c.notes ? c.notes.toLowerCase().includes(normalised) : false;
      const matchOperator = c.operator ? c.operator.toLowerCase().includes(normalised) : false;
      const matchDept = getDeptLabel(c.department).toLowerCase().includes(normalised);

      if (matchName || matchNotes || matchOperator || matchDept) {
        let stateText = c.status === "consumed" 
          ? `مصرف شده در تاریخ ${c.consumptionDate}` 
          : (c.expiryDate && c.expiryDate < "1405/03/10" ? `منقضی شده (انقضاء: ${c.expiryDate})` : `موجود در انبار بخش (تاریخ ورود: ${c.entryDate})`);
        
        results.push({
          dept: getDeptLabel(c.department),
          title: `ردیابی لایف‌سایکل مصرفی: ${c.itemName}`,
          desc: `مقدار: ${c.quantity} ${c.unit} | وضعیت: ${stateText} | مسئول دپارتمان: ${c.operator || "هاشمی"} | یادداشت: ${c.notes || "فاقد توصیف اضافی"}`,
          date: c.entryDate,
          icon: "boxes"
        });
      }
    });

    return results;
  };

  // Consolidate everything into a single timeline array
  const unifiedTimelineItem = useMemo<UnifiedArchiveItem[]>(() => {
    const list: UnifiedArchiveItem[] = [];

    // 1. feedings
    feedings.forEach((feed) => {
      const pool = pools.find((p) => p.id === feed.poolId);
      const pName = pool ? `${pool.name} (سالن ${pool.hallId})` : "استخر نامشخص";
      list.push({
        id: `feed-${feed.id}`,
        type: "feeding",
        typeName: "خوراک‌دهی",
        badgeBg: "bg-emerald-50 text-emerald-800 border-emerald-100",
        badgeText: "تغذیه",
        icon: <UtensilsCrossed size={14} className="text-emerald-700" />,
        poolName: pName,
        date: "1405/03/10",
        timestamp: feed.timestamp || "1405/03/10",
        title: `توزیع ${feed.givenAmountKg} کیلوگرم غذای تیپ ${feed.feedType}`,
        details: `میزان مصرف تخمینی چشمی: ${feed.eatenPercentage}٪ | پسماند ته‌نشین: ${feed.leftoverAmountKg} کیلوگرم | برآورد FCR لحظه‌ای: ${feed.fcrEstimate?.toFixed(2) || "نیاز به وزن‌کشی"}`,
        operatorOrDetail: "کارگاه تغذیه مکانیزه سالن",
        secondaryMeta: feed.estimatedNextMealKg ? `پیشنهاد وعده بعد: ${feed.estimatedNextMealKg}kg` : undefined,
        rawObject: feed,
        poolId: feed.poolId,
        hallId: pool?.hallId
      });
    });

    // 2. movements
    movements.forEach((move) => {
      const fromPool = pools.find(p => p.id === move.fromPoolId);
      const toPool = pools.find(p => p.id === move.toPoolId);
      list.push({
        id: `move-${move.id}`,
        type: "movement",
        typeName: "انتقال و ردیابی",
        badgeBg: "bg-blue-50 text-blue-800 border-blue-100",
        badgeText: "جابه‌جایی",
        icon: <ArrowRightLeft size={14} className="text-blue-700" />,
        poolName: `مبدا: ${move.fromPoolName} ➔ مقصد: ${move.toPoolName}`,
        date: move.date,
        timestamp: `${move.date} - ترخیص تانکی`,
        title: `جابه‌جایی تعداد ${move.count} قطعه ماهی ${move.breed}`,
        details: `وزن حد واسط متوسط: ${move.avgWeightGrams} گرم` + (move.gender ? ` | جنسیت: ${move.gender}` : "") + ` | دلیل انتقال تکثیری: ${move.reason}` + (move.chipId ? ` | شماره میکروچیپ ردیابی ماهی: ${move.chipId}` : ""),
        operatorOrDetail: `مسئول ناظر: ${move.operator}`,
        secondaryMeta: move.chipId ? `میکروچیپ: ${move.chipId}` : (move.gender ? `جنسیت: ${move.gender}` : `جنس و تبار: ${move.breed}`),
        rawObject: move,
        poolId: move.fromPoolId || move.toPoolId || undefined,
        hallId: fromPool?.hallId || toPool?.hallId
      });
    });

    // 3. mortality
    mortalityLogs.forEach((m) => {
      const pool = pools.find(p => p.id === m.poolId);
      list.push({
        id: `mort-${m.id}`,
        type: "mortality",
        typeName: "ثبت تلفات",
        badgeBg: "bg-red-50 text-red-800 border-red-105",
        badgeText: "تلفات",
        icon: <HeartCrack size={14} className="text-red-700" />,
        poolName: m.poolName,
        date: m.date,
        timestamp: `${m.date} - گزارش شیفت`,
        title: `تلفات تعداد ${m.count} قطعه (ضرر کل: ${m.totalLossKg.toFixed(1)} کیلوگرم بیوماس)`,
        details: `وزن انفرادی: ${m.avgWeightGrams} گرم | علائم بالینی: ${m.symptoms} | علت رخداد: ${m.reason}`,
        operatorOrDetail: m.explanation,
        secondaryMeta: m.aiSuggestedAction ? `مشاوره پزشک هوشمند: ${m.aiSuggestedAction.slice(0, 100)}...` : undefined,
        rawObject: m,
        poolId: m.poolId,
        hallId: pool?.hallId
      });
    });

    // 4. water test logs
    waterLogs.forEach((w) => {
      const pool = pools.find(p => p.id === w.poolId);
      list.push({
        id: `water-${w.id}`,
        type: "water",
        typeName: "کنترل فیزیکوشیمی آب",
        badgeBg: "bg-cyan-50 text-cyan-800 border-cyan-100",
        badgeText: "هیدروشیمی",
        icon: <Droplet size={14} className="text-cyan-700" />,
        poolName: w.poolName,
        date: w.date,
        timestamp: w.timestamp,
        title: `آنالیز فیزیکوشیمی آب (پتاسیل زیستی: ${w.statusText})`,
        details: `دما: ${formatWaterParam(w.temperature)}°C | اکسیژن محلول: ${formatWaterParam(w.oxygenLevel)}mg/L | اسیدیته: ${formatWaterParam(w.phLevel)} pH | آمونیاک سمی: ${formatWaterParam(w.ammoniaLevel)}mg/L | نیتریت غلیظ: ${formatWaterParam(w.nitriteLevel)}mg/L`,
        operatorOrDetail: `شوری آب ورودی: ${formatWaterParam(w.salinity)} ppt`,
        rawObject: w,
        poolId: w.poolId,
        hallId: pool?.hallId
      });
    });

    // 5. ultrasound ultrasound
    ultrasoundLogs.forEach((u) => {
      const pool = pools.find(p => p.id === u.poolId);
      list.push({
        id: `son-${u.id}`,
        type: "ultrasound",
        typeName: "بیوپسی و سونوگرافی",
        badgeBg: "bg-purple-50 text-purple-800 border-purple-100",
        badgeText: "سونوگرام مولد",
        icon: <Dna size={14} className="text-purple-700" />,
        poolName: u.poolName,
        date: u.date,
        timestamp: u.timestamp,
        title: `نتایج کلاس‌بندی سونوگرافی پلاک میکروچیپ ${u.tagId}`,
        details: `جنسیت: ${u.gender} | مرحله رسیدگی جنسی: ${u.maturityStage} | قطر متوسط تخمک خاویار: ${u.eggDiameterMm} میلی‌متر`,
        operatorOrDetail: `شاخص پلاریزاسیون GV: ${u.polarizationIndex} | توصیه آزمایشگاهی: ${u.recommendation}`,
        rawObject: u,
        poolId: u.poolId,
        hallId: pool?.hallId
      });
    });

    // 6. consumables / traceability
    consumables.forEach((c: any) => {
      const isExp = c.expiryDate && c.expiryDate < "1405/03/10" && c.status !== "consumed";
      const statusLabel = c.status === "consumed" 
        ? `مصرف شده در تاریخ ${c.consumptionDate}` 
        : isExp 
          ? `منقضی شده (تاریخ انقضاء: ${c.expiryDate})` 
          : `موجود در انبار بخش (تاریخ ورود: ${c.entryDate})`;

      list.push({
        id: `con-${c.id}`,
        type: "traceability",
        typeName: "زنجیره تامین و رهگیری",
        badgeBg: "bg-indigo-50 text-indigo-800 border-indigo-150",
        badgeText: "رهگیری مواد",
        icon: <Layers size={14} className="text-indigo-700" />,
        poolName: getDeptLabel(c.department),
        date: c.entryDate,
        timestamp: c.consumptionDate || c.entryDate,
        title: `رهگیری مواد مصرفی دپارتمان: ${c.itemName}`,
        details: `مقدار تحویلی: ${c.quantity} ${c.unit} | وضعیت فرآیند: ${statusLabel} | تاریخ مقرر انقضاء: ${c.expiryDate || "فاقد انقضا مشخص"}`,
        operatorOrDetail: `مسئول ثبت دپارتمان: ${c.operator || "هاشمی"} | یادداشت‌ها و مستندات: ${c.notes || "فاقد توصیف اضافی"}`,
        rawObject: c
      });
    });

    // Sort by chronological order / newest ID or string timestamp first
    return list.sort((a, b) => {
      return b.timestamp.localeCompare(a.timestamp);
    });
  }, [feedings, movements, mortalityLogs, waterLogs, ultrasoundLogs, pools, consumables]);

  // Aggregate stats in Archive
  const archiveStats = useMemo(() => {
    let feedTotalKg = feedings.reduce((acc, c) => acc + c.givenAmountKg, 0);
    let totalMovedCount = movements.reduce((acc, c) => acc + c.count, 0);
    let totalDead = mortalityLogs.reduce((acc, c) => acc + c.count, 0);
    let avgWaterO2 = waterLogs.length > 0 
      ? (waterLogs.reduce((acc, c) => acc + c.oxygenLevel, 0) / waterLogs.length).toFixed(1) 
      : "7.2";
    
    // Count mature female sturgeons
    let matureFemales = ultrasoundLogs.filter(u => u.maturityStage === "Stage IV" || u.maturityStage?.includes("مرحله ۴")).length;

    return {
      feedTotalKg,
      totalMovedCount,
      totalDead,
      avgWaterO2,
      matureFemales,
      totalRecords: unifiedTimelineItem.length
    };
  }, [feedings, movements, mortalityLogs, waterLogs, ultrasoundLogs, unifiedTimelineItem]);

  // Filtered timeline
  const filteredTimeline = useMemo(() => {
    return unifiedTimelineItem.filter((item) => {
      const typeMatch = activeFilter === "all" || item.type === activeFilter;
      const searchTxt = `${item.title} ${item.poolName} ${item.details} ${item.operatorOrDetail || ""} ${item.badgeText}`.toLowerCase();
      const stringMatch = searchQuery.trim() === "" || searchTxt.includes(searchQuery.toLowerCase());
      
      // Separate Hall and Pool filters
      let hallMatch = true;
      if (filterHallId !== "all") {
        hallMatch = item.hallId === parseInt(filterHallId);
      }

      let poolMatch = true;
      if (filterPoolId !== "all") {
        poolMatch = item.poolId === filterPoolId;
      }

      return typeMatch && stringMatch && hallMatch && poolMatch;
    });
  }, [unifiedTimelineItem, activeFilter, searchQuery, filterHallId, filterPoolId]);

  const toggleExpand = (id: string) => {
    setExpandedItemId(expandedItemId === id ? null : id);
  };

  const handleDownloadArchiveAsCsv = () => {
    try {
      let headers = ["شناسه", "نوع عملیات", "نام استخر/سالن", "تاریخ", "زمان", "عنوان واقعه", "جزئیات فنی", "ناظر/توضیحات"];
      let csvContent = "\uFEFF"; // RTL and UTF-8 excel compatibility patch
      csvContent += headers.join(",") + "\n";

      filteredTimeline.forEach((item) => {
        let row = [
          item.id,
          item.typeName,
          item.poolName.replace(/,/g, " - "),
          item.date,
          item.timestamp.replace(/,/g, " "),
          item.title.replace(/,/g, "-"),
          item.details.replace(/,/g, "-"),
          (item.operatorOrDetail || "").replace(/,/g, " - ")
        ];
        csvContent += row.join(",") + "\n";
      });

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `khaviar_archive_${getPersianDateFilename()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      alert("خطایی در ایجاد سند خروجی اکسل رخ داد.");
    }
  };

  const getPersianDateFilename = () => {
    return "1405_03_10";
  };

  return (
    <div id="archive-manager-module" className="space-y-6">
      
      {/* ECO-STATISTICAL OVERVIEW CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        
        <div className="bg-white p-4 rounded-2xl border border-natural-border shadow-xs">
          <span className="text-[10px] text-natural-text/60 block font-sans">تعداد کل وقایع مصور</span>
          <div className="flex items-baseline gap-1 mt-1">
            <strong className="text-xl font-black text-natural-dark font-sans">{archiveStats.totalRecords}</strong>
            <span className="text-[9px] text-[#2D4A3E]/60 font-sans">ثبت‌شده</span>
          </div>
          <div className="text-[8.5px] text-[#2D4A3E] mt-1 shrink-0">بایگانی فعال سال ۱۴۰۵</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-natural-border shadow-xs">
          <span className="text-[10px] text-natural-text/60 block font-sans">مجموع غذای توزیع‌شده</span>
          <div className="flex items-baseline gap-1 mt-1">
            <strong className="text-xl font-black text-natural-dark font-sans">{archiveStats.feedTotalKg.toFixed(1)}</strong>
            <span className="text-[9px] text-emerald-700 font-sans">کیلوگرم</span>
          </div>
          <div className="text-[8.5px] text-emerald-800 mt-1 shrink-0">پوشش مداوم تغذیه‌ای</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-natural-border shadow-xs">
          <span className="text-[10px] text-natural-text/60 block font-sans">کل جابه‌جایی گله خاویاری</span>
          <div className="flex items-baseline gap-1 mt-1">
            <strong className="text-xl font-black text-natural-dark font-sans">{archiveStats.totalMovedCount}</strong>
            <span className="text-[9px] text-blue-700 font-sans">قطعه مولد/نرسری</span>
          </div>
          <div className="text-[8.5px] text-blue-800 mt-1 shrink-0">ردیابی تبارشناسی تانک‌ها</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-natural-border shadow-xs">
          <span className="text-[10px] text-natural-text/60 block font-sans">میانگین کیفیت اکسیژن</span>
          <div className="flex items-baseline gap-1 mt-1">
            <strong className="text-xl font-black text-natural-dark font-sans">{archiveStats.avgWaterO2}</strong>
            <span className="text-[9px] text-cyan-700 font-sans">میلی‌گرم در لیتر</span>
          </div>
          <div className="text-[8.5px] text-[#2D4A3E]/60 mt-1 shrink-0">محدوده اشباع ایمن استخر</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-natural-border shadow-xs col-span-2 md:col-span-1">
          <span className="text-[10px] text-natural-text/60 block font-sans">مولدین کاندید خاویاردهی</span>
          <div className="flex items-baseline gap-1 mt-1">
            <strong className="text-xl font-black text-natural-dark font-sans">{archiveStats.matureFemales}</strong>
            <span className="text-[9px] text-purple-700 font-sans">ماهی ماده (مرحله ۴)</span>
          </div>
          <div className="text-[8.5px] text-purple-800 font-bold mt-1 shrink-0">ثبت‌شده در سونوگرام زیستی</div>
        </div>

      </div>

      {/* FILTER & INTERACTIVE DIRECTORY CONSOLE */}
      <div className="bg-white rounded-3xl border border-natural-border shadow-sm p-6 space-y-6">
        
        {/* TOP CONTROLS ROW */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-natural-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#F5F2E8] text-natural-dark flex items-center justify-center font-bold border border-natural-border">
              <Archive size={20} className="text-natural-dark" />
            </div>
            <div>
              <h3 className="text-sm font-black text-natural-dark font-sans">دفتر جامع بایگانی کارگاهی و آزمایشگاهی</h3>
              <p className="text-[10.5px] text-natural-text/60 mt-0.5">امکان جستجو و بازخوانی اسناد هیدروکربنی، فیزیکوشیمی، سونوگرام‌ها و ردیابی بیوماس</p>
            </div>
          </div>

          <button
            onClick={handleDownloadArchiveAsCsv}
            disabled={filteredTimeline.length === 0}
            className="px-4 py-2 bg-natural-khaki hover:bg-natural-khaki/80 border border-natural-border text-natural-dark rounded-xl text-xs font-bold font-sans flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-40 select-none transition-colors"
          >
            <Download size={14} />
            خروجی بایگانی به اکسل (CSV)
          </button>
        </div>

        {/* SEARCH AND QUICK FILTER SLOTS */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          
          <div className="md:col-span-4 relative">
            <Search size={16} className="text-natural-text/40 absolute right-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="جستجو در نام استخر، وزن، پلاک، علائم یا شرح پایش..."
              className="w-full text-xs font-sans rounded-xl border border-natural-border p-2.5 pr-10 bg-[#FDFCF8] focus:outline-none focus:border-natural-earth text-natural-dark"
            />
          </div>

          <div className="md:col-span-8 flex flex-wrap gap-1 items-center justify-start overflow-x-auto min-h-[38px]">
            <span className="text-[10.5px] text-natural-text/60 ml-2 font-bold flex items-center gap-1">
              <Filter size={12} />
              فیلتر موضوعی بایگانی:
            </span>
            <button
              onClick={() => setActiveFilter("all")}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold cursor-pointer transition-all border ${
                activeFilter === "all"
                  ? "bg-natural-forest text-white border-natural-forest"
                  : "bg-white text-natural-text/90 border-natural-border hover:bg-natural-khaki/35"
              }`}
            >
              همه رویدادها ({unifiedTimelineItem.length})
            </button>
            <button
              onClick={() => setActiveFilter("feeding")}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold cursor-pointer transition-all border ${
                activeFilter === "feeding"
                  ? "bg-[#2D4A3E] text-white border-[#2D4A3E]"
                  : "bg-white text-[#2D4A3E] border-[#2D4A3E]/20 hover:bg-[#2D4A3E]/5"
              }`}
            >
              وعده‌های خوراک ({feedings.length})
            </button>
            <button
              onClick={() => setActiveFilter("movement")}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold cursor-pointer transition-all border ${
                activeFilter === "movement"
                  ? "bg-blue-800 text-white border-blue-800"
                  : "bg-white text-blue-800 border-blue-200 hover:bg-blue-50"
              }`}
            >
              جابه‌جایی تانکی ({movements.length})
            </button>
            <button
              onClick={() => setActiveFilter("mortality")}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold cursor-pointer transition-all border ${
                activeFilter === "mortality"
                  ? "bg-red-800 text-white border-red-800"
                  : "bg-white text-red-800 border-red-200 hover:bg-red-50"
              }`}
            >
              سوابق تلفات ({mortalityLogs.length})
            </button>
            <button
              onClick={() => setActiveFilter("water")}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold cursor-pointer transition-all border ${
                activeFilter === "water"
                  ? "bg-cyan-800 text-white border-cyan-800"
                  : "bg-white text-cyan-800 border-cyan-200 hover:bg-cyan-50"
              }`}
            >
              کنترل کیفی هیدروشیمی ({waterLogs.length})
            </button>
             <button
              onClick={() => setActiveFilter("ultrasound")}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold cursor-pointer transition-all border ${
                activeFilter === "ultrasound"
                  ? "bg-purple-800 text-white border-purple-800"
                  : "bg-white text-purple-800 border-purple-200 hover:bg-purple-50"
              }`}
            >
              کارت سونوگرافی جنسی ({ultrasoundLogs.length})
            </button>
            <button
              onClick={() => setActiveFilter("traceability")}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold cursor-pointer transition-all border ${
                activeFilter === "traceability"
                  ? "bg-indigo-950 text-white border-indigo-950 shadow-sm"
                  : "bg-indigo-50/40 text-indigo-950 border-indigo-200 hover:bg-indigo-100/60"
              }`}
            >
              زنجیره تأمین و رهگیری ({consumables.length})
            </button>
          </div>

          {/* SEPARATE HALL & POOL FILTERS (تفکیک سالن و استخر در بایگانی) */}
          <div className="md:col-span-12 grid grid-cols-1 sm:grid-cols-2 gap-4 bg-natural-khaki/30 p-3.5 rounded-2xl border border-natural-border/50 text-right">
            <div>
              <label className="block text-[11px] text-natural-dark font-black mb-1.5 font-sans">تفکیک گزارش‌ها بر اساس سالن:</label>
              <select
                value={filterHallId}
                onChange={(e) => {
                  setFilterHallId(e.target.value);
                  setFilterPoolId("all");
                }}
                className="w-full text-xs font-sans rounded-lg border border-natural-border p-2 bg-white focus:outline-none focus:border-natural-forest text-natural-dark"
              >
                <option value="all">همه سالن‌ها (کل مزارع فتحی)</option>
                <option value="1">سالن ۱ (۵۲ ونیرو قطر ۲ متر - نرسری)</option>
                <option value="2">سالن ۲ (۱۴ استخر قطر ۴ متر - پیش‌پرواری)</option>
                <option value="3">سالن ۳ (۱4 استخر قطر ۴ متر - پیش‌پرواری)</option>
                <option value="4">سالن ۴ (۷ استخر قطر ۶ متر - پرواری)</option>
                <option value="5">سالن ۵ (۷ استخر قطر ۲ متر)</option>
                <option value="7">سالن ۷ (تکثیر و انکوباتور مک‌دونالد)</option>
                <option value="8">سالن ۸ (پیش‌مولد فیل‌ماهی - استخرهای ۱۰ متری)</option>
                <option value="9">سالن ۹ (پیش‌مولد سایر گونه‌ها - استخرهای ۱۰ متری)</option>
                <option value="10">سالن ۱۰ (۶ استخر قطر ۱۰ متر پرواری و قرنطینه)</option>
                <option value="11">سالن ۱۱ (۶ استخر قطر ۱۰ متر پرواری و قرنطینه)</option>
                <option value="12">سالن ۱۲ (۴ استخر بارانداز و فروش بار)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] text-natural-dark font-black mb-1.5 font-sans">تفکیک گزارش‌ها بر اساس استخر:</label>
              <select
                value={filterPoolId}
                disabled={filterHallId === "all"}
                onChange={(e) => setFilterPoolId(e.target.value)}
                className="w-full text-xs font-sans rounded-lg border border-natural-border p-2 bg-white focus:outline-none focus:border-natural-forest text-natural-dark disabled:opacity-50 disabled:bg-gray-50"
              >
                <option value="all">همه استخرهای سالن انتخاب شده</option>
                {pools
                  .filter((p) => filterHallId === "all" || p.hallId === parseInt(filterHallId))
                  .map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} - {p.breed} (موجودی: {p.count} قطعه)
                    </option>
                  ))}
              </select>
            </div>
          </div>

        </div>

        {/* TIMELINE ARCHIVE LIST AREA */}
        <div className="space-y-3">
          {activeFilter === "traceability" && (
            <div className="space-y-6" id="archive-traceability-interactive">
              {/* Header inside-tab banner */}
              <div className="bg-slate-900 text-slate-100 border border-slate-800 p-6 rounded-3xl space-y-3 relative overflow-hidden text-right">
                <div className="absolute top-0 left-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="flex items-center justify-end gap-2 text-indigo-400 font-extrabold text-xs">
                  <span>برج کنترل و ردیابی ارشد زنجیره تأمین مواد (بایگانی متمرکز)</span>
                  <RefreshCw size={14} className="animate-spin" />
                </div>
                <h2 className="text-sm font-black text-white">ردیابی یکپارچه و تبارشناسی محصولات از گیت ورود، کارخانه خوراک تا مصرف، صید، سردخانه و حسابداری مالی</h2>
                <p className="text-xs text-slate-300 leading-relaxed max-w-4xl">
                  این بخش پویای زنجیره با بررسی مستقل همپوشانی دپارتمان‌های مزارع ثابت می‌کند چگونه ملزومات و بیوماس به صورت لایف‌سایکل زمان‌دار در جریان تولید تأثیر می‌گذارند. بر روی گره‌های دپارتمان یا کلیدواژه‌ها کلیک کرده تا تبارنامه را از بدو تا انتها ردیابی کنید.
                </p>
              </div>

              {/* 🏢 بخش اول: جریان زنجیره تامین */}
              <div className="bg-white border border-natural-border p-5 rounded-3xl space-y-4 text-right">
                <div className="flex justify-between items-center border-b pb-3">
                  <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full font-black">۸ دپارتمان متصل</span>
                  <h3 className="text-xs font-black text-natural-dark flex items-center gap-1.5">
                    <span>شبیه‌ساز جریان و نقاط همپوشانی دپارتمان‌های فارم خاویاری</span>
                    <Boxes size={14} className="text-indigo-600" />
                  </h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-1">
                  <div 
                    onClick={() => { setSelectedTracePreset("f1"); setTraceSearchQuery(""); }}
                    className={`border p-4 rounded-2xl cursor-pointer transition-all ${
                      selectedTracePreset === "f1" && !traceSearchQuery
                        ? "bg-emerald-50/50 border-emerald-500 shadow-xs" 
                        : "bg-natural-khaki/5 border-natural-border/60 hover:bg-natural-khaki/10"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-emerald-800 font-extrabold text-xs justify-end">
                      <span>گیت و حراست ورودی</span>
                      <span className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center text-[10px] text-emerald-700">۱</span>
                    </div>
                    <div className="text-[10px] text-natural-text/70 mt-2">تردد تانکر، دافنی نرسری، ثبت بهداشتی پرسنل شیلاتی</div>
                    <div className="mt-2.5 flex items-center justify-between text-[9px] font-black">
                      <span className="bg-emerald-50 text-emerald-800 px-1.5 py-0.5 rounded-sm">کارخانه خوراک</span>
                      <span className="text-emerald-700">همپوشانی با:</span>
                    </div>
                  </div>

                  <div 
                    onClick={() => { setSelectedTracePreset("f12"); setTraceSearchQuery(""); }}
                    className={`border p-4 rounded-2xl cursor-pointer transition-all ${
                      selectedTracePreset === "f12" && !traceSearchQuery
                        ? "bg-indigo-50 border-indigo-400 shadow-xs font-bold text-indigo-950" 
                        : "bg-natural-khaki/5 border-natural-border/60 hover:bg-natural-khaki/10"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-indigo-800 font-extrabold text-xs justify-end">
                      <span>تولید خوراک متراکم</span>
                      <span className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center text-[10px] text-indigo-700">۲</span>
                    </div>
                    <div className="text-[10px] text-natural-text/70 mt-2">تبدیل پودر صدف و ماهیان هرز به پلت‌های پروتئینی بالا</div>
                    <div className="mt-2.5 flex items-center justify-between text-[9px] font-black">
                      <span className="bg-indigo-50 text-indigo-800 px-1.5 py-0.5 rounded-sm">انبارداری مرکزی</span>
                      <span className="text-indigo-700">همپوشانی با:</span>
                    </div>
                  </div>

                  <div 
                    onClick={() => { setSelectedTracePreset("m2"); setTraceSearchQuery(""); }}
                    className={`border p-4 rounded-2xl cursor-pointer transition-all ${
                      selectedTracePreset === "m2" && !traceSearchQuery
                        ? "bg-cyan-50/50 border-cyan-500 shadow-xs" 
                        : "bg-natural-khaki/5 border-natural-border/60 hover:bg-natural-khaki/10"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-cyan-800 font-extrabold text-xs justify-end">
                      <span>تاسیسات و پشتیبانی</span>
                      <span className="w-5 h-5 rounded-full bg-cyan-100 flex items-center justify-center text-[10px] text-cyan-700">۳</span>
                    </div>
                    <div className="text-[10px] text-natural-text/70 mt-2">ژنراتور برق سالن نرسری، پمپ‌های تصفیه، فیلتراسیون فیزیکی</div>
                    <div className="mt-2.5 flex items-center justify-between text-[9px] font-black">
                      <span className="bg-emerald-50 text-emerald-800 px-1.5 py-0.5 rounded-sm">امنیت زیستی</span>
                      <span className="text-cyan-700">همپوشانی با:</span>
                    </div>
                  </div>

                  <div 
                    onClick={() => { setSelectedTracePreset("f1"); setTraceSearchQuery(""); }}
                    className={`border p-4 rounded-2xl cursor-pointer transition-all ${
                      selectedTracePreset === "f1" && !traceSearchQuery
                        ? "bg-indigo-50/50 border-indigo-500 shadow-xs" 
                        : "bg-natural-khaki/5 border-natural-border/60 hover:bg-natural-khaki/10"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-indigo-800 font-extrabold text-xs justify-end">
                      <span>انبارداری و قفسه کالا</span>
                      <span className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center text-[10px] text-indigo-700">۴</span>
                    </div>
                    <div className="text-[10px] text-natural-text/70 mt-2">کنترل کاردکس تغذیه، ثبت رسید تراشه‌های RFID، دوزهای دارویی</div>
                    <div className="mt-2.5 flex items-center justify-between text-[9px] font-black">
                      <span className="bg-amber-50 text-amber-800 px-1.5 py-0.5 rounded-sm">استخرهای فارم</span>
                      <span className="text-indigo-700">همپوشانی با:</span>
                    </div>
                  </div>

                  <div 
                    onClick={() => { setSelectedTracePreset("c2"); setTraceSearchQuery(""); }}
                    className={`border p-4 rounded-2xl cursor-pointer transition-all ${
                      selectedTracePreset === "c2" && !traceSearchQuery
                        ? "bg-rose-50/50 border-rose-500 shadow-xs" 
                        : "bg-natural-khaki/5 border-natural-border/60 hover:bg-natural-khaki/10"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-rose-800 font-extrabold text-xs justify-end">
                      <span>پرورش، آزمایشگاه و بیومتری</span>
                      <span className="w-5 h-5 rounded-full bg-rose-100 flex items-center justify-center text-[10px] text-rose-700">۵</span>
                    </div>
                    <div className="text-[10px] text-natural-text/70 mt-2">خوراک‌دهی روزانه گله، کشت میکروچیپ، شناسایی سونوگرافی جنسی</div>
                    <div className="mt-2.5 flex items-center justify-between text-[9px] font-black">
                      <span className="bg-rose-100 text-rose-950 px-1.5 py-0.5 rounded-sm">کارخانه فرآوری</span>
                      <span className="text-rose-700">همپوشانی با:</span>
                    </div>
                  </div>

                  <div 
                    onClick={() => { setSelectedTracePreset("c2"); setTraceSearchQuery(""); }}
                    className={`border p-4 rounded-2xl cursor-pointer transition-all ${
                      selectedTracePreset === "c2" && !traceSearchQuery
                        ? "bg-rose-50/50 border-rose-500 shadow-xs" 
                        : "bg-natural-khaki/5 border-natural-border/60 hover:bg-natural-khaki/10"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-rose-800 font-extrabold text-xs justify-end">
                      <span>کارخانه فرآوری خاویار</span>
                      <span className="w-5 h-5 rounded-full bg-rose-100 flex items-center justify-center text-[10px] text-rose-700">۶</span>
                    </div>
                    <div className="text-[10px] text-natural-text/70 mt-2">مهار گله‌های فیل‌ماهی بالغ، صید، نمک‌گذاری Malossol و گرید بندی</div>
                    <div className="mt-2.5 flex items-center justify-between text-[9px] font-black">
                      <span className="bg-sky-50 text-sky-800 px-1.5 py-0.5 rounded-sm">سردخانه مرکزی</span>
                      <span className="text-rose-700">همپوشانی با:</span>
                    </div>
                  </div>

                  <div 
                    onClick={() => { setSelectedTracePreset("c2"); setTraceSearchQuery(""); }}
                    className={`border p-4 rounded-2xl cursor-pointer transition-all ${
                      selectedTracePreset === "c2" && !traceSearchQuery
                        ? "bg-sky-50 border-rose-500 shadow-xs" 
                        : "bg-natural-khaki/5 border-natural-border/60 hover:bg-natural-khaki/10"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-sky-800 font-extrabold text-xs justify-end">
                      <span>سردخانه و سرمایش عمیق</span>
                      <span className="w-5 h-5 rounded-full bg-sky-100 flex items-center justify-center text-[10px] text-sky-700">۷</span>
                    </div>
                    <div className="text-[10px] text-natural-text/70 mt-2">انجماد سریع لاشه‌ها، نگهداری واکسینه در تلورانس ۱ تا ۴- درجه سانتی‌گراد</div>
                    <div className="mt-2.5 flex items-center justify-between text-[9px] font-black">
                      <span className="bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded-sm">صادرات فروش</span>
                      <span className="text-sky-700">همپوشانی با:</span>
                    </div>
                  </div>

                  <div 
                    onClick={() => { setSelectedTracePreset("c2"); setTraceSearchQuery(""); }}
                    className={`border p-4 rounded-2xl cursor-pointer transition-all ${
                      selectedTracePreset === "c2" && !traceSearchQuery
                        ? "bg-amber-50/55 border-rose-500 shadow-xs" 
                        : "bg-natural-khaki/5 border-natural-border/60 hover:bg-natural-khaki/10"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-amber-800 font-extrabold text-xs justify-end">
                      <span>حسابداری و تراز روزنامه</span>
                      <span className="w-5 h-5 rounded-full bg-amber-100 flex items-center justify-center text-[10px] text-amber-700">۸</span>
                    </div>
                    <div className="text-[10px] text-natural-text/70 mt-2">محاسبه بهای تمام شده، تایید پیش فاکتور صادرات و تسویه ملزومات</div>
                    <div className="mt-2.5 flex items-center justify-between text-[9px] font-black">
                      <span className="bg-green-50 text-green-800 px-1.5 py-0.5 rounded-sm">توسعه گله شیلات</span>
                      <span className="text-amber-700">همپوشانی با:</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 🏢 بخش دوم: پنل تعاملی جستجو و ابزار سناریونگاری */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-right">
                <div className="space-y-4">
                  <div className="bg-white border border-natural-border p-5 rounded-3xl space-y-4">
                    <h4 className="text-xs font-black text-natural-dark border-b pb-2 flex items-center gap-1.5 justify-end">
                      <span>انتخاب پرونده‌های تبارشناسی پیوسته</span>
                      <RefreshCw size={14} className="text-indigo-600 animate-spin-slow" />
                    </h4>
                    <div className="space-y-2 text-right">
                      <button
                        onClick={() => { setSelectedTracePreset("c2"); setTraceSearchQuery(""); }}
                        className={`w-full text-right p-3 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center justify-between border ${
                          selectedTracePreset === "c2" && !traceSearchQuery 
                            ? "bg-indigo-50 border-indigo-200 text-indigo-950" 
                            : "bg-white border-natural-border/60 text-natural-dark hover:bg-natural-khaki/15"
                        }`}
                      >
                        <span className="text-[9px] bg-indigo-100 px-1.5 py-0.5 rounded font-black text-indigo-900">کامل‌ترین زنجیره</span>
                        <span>🐟 پرونده خاویار صادرات رویال (بچ c2)</span>
                      </button>

                      <button
                        onClick={() => { setSelectedTracePreset("f1"); setTraceSearchQuery(""); }}
                        className={`w-full text-right p-3 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center justify-between border ${
                          selectedTracePreset === "f1" && !traceSearchQuery 
                            ? "bg-indigo-50 border-indigo-200 text-indigo-950" 
                            : "bg-white border-natural-border/60 text-natural-dark hover:bg-natural-khaki/15"
                        }`}
                      >
                        <span className="text-[9px] bg-emerald-100 text-emerald-950 px-1.5 py-0.5 rounded font-black">تولید و مصرف</span>
                        <span>🌾 محموله خوراک پلت نرسری (بچ f1)</span>
                      </button>

                      <button
                        onClick={() => { setSelectedTracePreset("m2"); setTraceSearchQuery(""); }}
                        className={`w-full text-right p-3 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center justify-between border ${
                          selectedTracePreset === "m2" && !traceSearchQuery 
                            ? "bg-indigo-50 border-indigo-200 text-indigo-950" 
                            : "bg-white border-natural-border/60 text-natural-dark hover:bg-natural-khaki/15"
                        }`}
                      >
                        <span className="text-[9px] bg-cyan-100 text-cyan-950 px-1.5 py-0.5 rounded font-black">پشتیبانی و تاسیساتی</span>
                        <span>⚡ پایداری سیستم هوادهی (بچ m2)</span>
                      </button>
                    </div>
                  </div>

                  <div className="bg-white border border-natural-border p-5 rounded-3xl space-y-4">
                    <h4 className="text-xs font-black text-natural-dark border-b pb-2 flex items-center gap-1.5 justify-end">
                      <span>فیلتر و پایش دستی کلیدواژه‌ها</span>
                      <Search size={14} className="text-indigo-600" />
                    </h4>
                    <div className="space-y-3">
                      <p className="text-[10px] text-natural-text leading-relaxed">
                        با ورود هر تگ یا مسئول (مثال: <span className="underline font-bold text-indigo-600 cursor-pointer" onClick={() => setTraceSearchQuery("خاویار")}>خاویار</span>، <span className="underline font-bold text-indigo-600 cursor-pointer" onClick={() => setTraceSearchQuery("خوراک")}>خوراک</span>، <span className="underline font-bold text-indigo-600 cursor-pointer" onClick={() => setTraceSearchQuery("علوی")}>علوی</span> یا مبالغ مالی)، تمام ماژول‌ها جستجو و پیوند داده می‌شوند:
                      </p>
                      <div className="relative">
                        <input
                          type="text"
                          value={traceSearchQuery}
                          onChange={(e) => {
                            setTraceSearchQuery(e.target.value);
                            if (e.target.value) {
                              setSelectedTracePreset("custom");
                            } else {
                              setSelectedTracePreset("c2");
                            }
                          }}
                          placeholder="یک شناسه یا کلیدواژه بنویسید..."
                          className="w-full text-xs font-bold rounded-xl border border-natural-border p-2.5 bg-[#FDFCF8] text-natural-dark text-right"
                        />
                        <Search className="absolute left-3 top-3.5 text-natural-text/40" size={13} />
                      </div>
                      {traceSearchQuery && (
                        <button
                          onClick={() => { setTraceSearchQuery(""); setSelectedTracePreset("c2"); }}
                          className="text-[9px] text-red-700 font-extrabold hover:underline"
                        >
                          × حذف فیلتر تبارنامه
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-2 space-y-4">
                  <div className="bg-white border border-natural-border p-5 rounded-3xl space-y-4">
                    <div className="border-b pb-2 flex justify-between items-center text-right">
                      <span className="text-[10px] text-natural-text/60 font-mono">1405/03/10</span>
                      <h4 className="text-xs font-black text-natural-dark">
                        {!traceSearchQuery ? (
                          <>
                            {selectedTracePreset === "c2" && "رویدادنگاری تبارنامه بچ خاویار صادراتی رویال (بچ c2)"}
                            {selectedTracePreset === "f1" && "جریان محموله ساخت و مصرف خوراک نرسری (بچ f1)"}
                            {selectedTracePreset === "m2" && "سند پایداری شبکه اکسیژن و تاسیسات (بچ m2)"}
                          </>
                        ) : (
                          `جریان پیوند ردیابی برای پرونده "${traceSearchQuery}"`
                        )}
                      </h4>
                    </div>

                    {traceSearchQuery ? (
                      <div className="space-y-3.5">
                        {handleTraceSearch(traceSearchQuery).length === 0 ? (
                          <div className="p-8 text-center bg-natural-khaki/10 text-natural-text rounded-2xl border border-dashed border-natural-border/80">
                            <AlertTriangle className="mx-auto text-amber-500 mb-2" size={20} />
                            <p className="text-[11px] font-bold">هیچ رکوردی متصل به کلیدواژه فوق در دپارتمان‌ها یافت نشد.</p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {handleTraceSearch(traceSearchQuery).map((res, idx) => (
                              <div key={idx} className="flex gap-3 items-start bg-slate-50/50 hover:bg-slate-50 border border-slate-100 p-3 rounded-2xl transition-all text-right">
                                <div className="space-y-1 w-full">
                                  <div className="flex justify-between items-center w-full">
                                    <span className="text-[8.5px] bg-indigo-150 text-indigo-950 px-2 py-0.5 rounded-full font-black shrink-0">{res.dept}</span>
                                    <strong className="text-xs text-indigo-950">{res.title}</strong>
                                  </div>
                                  <p className="text-[10.5px] text-natural-text leading-relaxed">{res.desc}</p>
                                  <span className="text-[8px] text-natural-text/40 block font-mono font-bold">{res.date}</span>
                                </div>
                                <div className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700 font-extrabold text-xs shrink-0 font-sans">
                                  {idx + 1}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-5 relative before:absolute before:right-[15px] before:top-2 before:bottom-2 before:w-[2px] before:bg-indigo-100 text-right pr-2">
                        {/* Render default scenarios */}
                        {selectedTracePreset === "c2" && (
                          <>
                            <div className="relative pr-8 space-y-1 group">
                              <span className="absolute right-[-2.5px] top-1.5 w-3.5 h-3.5 rounded-full bg-indigo-600 border border-3 border-white ring-4 ring-indigo-50 shrink-0" />
                              <div className="flex justify-between items-center">
                                <span className="text-[9px] bg-emerald-100 text-emerald-950 px-2 py-0.5 rounded font-black">نگهبانی حراست</span>
                                <h4 className="text-xs font-black text-slate-900">۱. ثبت ورود بازرس بهداشتی شیلات</h4>
                              </div>
                              <p className="text-[10.5px] text-natural-text leading-relaxed">ورود تانکر نمونه سونوگرافی و بازرس شیلات (دکتر حسینی) با پلاک ۱۲ الف ۳۴۵ ایران ۲۱ در گیت.</p>
                            </div>
                            <div className="relative pr-8 space-y-1 group">
                              <span className="absolute right-[-2.5px] top-1.5 w-3.5 h-3.5 rounded-full bg-indigo-600 border border-3 border-white ring-4 ring-indigo-50 shrink-0" />
                              <div className="flex justify-between items-center">
                                <span className="text-[9px] bg-rose-100 text-rose-950 px-2 py-0.5 rounded font-black">حسابداری مالی</span>
                                <h4 className="text-xs font-black text-slate-900">۲. تامین مالی خرید میکروچیپ</h4>
                              </div>
                              <p className="text-[10.5px] text-natural-text leading-relaxed">پرداخت فاکتور ممهور خرید مکمل و میکروچیپ‌های RFID به ارزش ۴۵,۰۰۰,۰۰۰ تومان (سند t2).</p>
                            </div>
                            <div className="relative pr-8 space-y-1 group">
                              <span className="absolute right-[-2.5px] top-1.5 w-3.5 h-3.5 rounded-full bg-indigo-600 border border-3 border-white ring-4 ring-indigo-50 shrink-0" />
                              <div className="flex justify-between items-center">
                                <span className="text-[9px] bg-purple-100 text-purple-950 px-2 py-0.5 rounded font-black">انبار مرکزی</span>
                                <h4 className="text-xs font-black text-slate-900">۳. تامین انبارداری مرکزی شیلات</h4>
                              </div>
                              <p className="text-[10.5px] text-natural-text leading-relaxed">ورود و رسید موقت ۸۵۰ کیلوگرم نمک بیو و تراشه‌ها توسط هاشمی سرپرست انبار.</p>
                            </div>
                            <div className="relative pr-8 space-y-1 group">
                              <span className="absolute right-[-2.5px] top-1.5 w-3.5 h-3.5 rounded-full bg-indigo-600 border border-3 border-white ring-4 ring-indigo-50 shrink-0" />
                              <div className="flex justify-between items-center">
                                <span className="text-[9px] bg-indigo-100 text-indigo-950 px-2 py-0.5 rounded font-black">کارخانه خوراک</span>
                                <h4 className="text-xs font-black text-slate-900">۴. خط تولید خوراک پیش‌پروار</h4>
                              </div>
                              <p className="text-[10.5px] text-natural-text leading-relaxed">اکسترود پلت پیش‌پروار (بچ f2) با دوز ترکیبی ۱۰۰۰ کیلوگرم جهت دوزدهی عالی کلونی.</p>
                            </div>
                            <div className="relative pr-8 space-y-1 group">
                              <span className="absolute right-[-2.5px] top-1.5 w-3.5 h-3.5 rounded-full bg-indigo-600 border border-3 border-white ring-4 ring-indigo-50 shrink-0" />
                              <div className="flex justify-between items-center">
                                <span className="text-[9px] bg-amber-100 text-amber-950 px-2 py-0.5 rounded font-black">استخر پرورش</span>
                                <h4 className="text-xs font-black text-slate-900">۵. دوز روزانه و سونوگرافی جنسی</h4>
                              </div>
                              <p className="text-[10.5px] text-natural-text leading-relaxed">سونوگرافی و تعیین قطر تخمک فیل‌ماهی ۵۵ کیلوگرمی و ثبت پلاک ردیابی در pool-103 سالن ۱.</p>
                            </div>
                            <div className="relative pr-8 space-y-1 group">
                              <span className="absolute right-[-2.5px] top-1.5 w-3.5 h-3.5 rounded-full bg-indigo-600 border border-3 border-white ring-4 ring-indigo-50 shrink-0" />
                              <div className="flex justify-between items-center">
                                <span className="text-[9px] bg-rose-150 text-rose-950 px-2 py-0.5 rounded font-black">فرآوری خاویار</span>
                                <h4 className="text-xs font-black text-slate-900">۶. صید و استحصال گرانبها مروارید سیاه</h4>
                              </div>
                              <p className="text-[10.5px] text-natural-text leading-relaxed text-rose-900 font-bold">نمک‌گذاری Malossol و استحصال ۹.۱ کیلوگرم خاویار رویال گلدن بلوگا با بهره‌وری ۱۶.۵ درصد.</p>
                            </div>
                            <div className="relative pr-8 space-y-1 group">
                              <span className="absolute right-[-2.5px] top-1.5 w-3.5 h-3.5 rounded-full bg-indigo-600 border border-3 border-white ring-4 ring-indigo-50 shrink-0" />
                              <div className="flex justify-between items-center">
                                <span className="text-[9px] bg-sky-100 text-sky-950 px-2 py-0.5 rounded font-black">سردخانه مرکزی</span>
                                <h4 className="text-xs font-black text-slate-900">۷. برودت کاردکس سردخانه</h4>
                              </div>
                              <p className="text-[10.5px] text-natural-text leading-relaxed">انتقال فوری واکسینه به سردخانه مرکزی شماره ۱ در دمای ۲.۴- درجه سانتی‌گراد جهت تامین ماندگاری.</p>
                            </div>
                            <div className="relative pr-8 space-y-1 group">
                              <span className="absolute right-[-2px] bottom-0 w-3 h-3 rounded-full bg-emerald-600 border border-white ring-4 ring-emerald-50 shrink-0" />
                              <div className="flex justify-between items-center">
                                <span className="text-[9px] bg-indigo-150 text-indigo-950 px-2 py-0.5 rounded font-black">توسعه فروش</span>
                                <h4 className="text-xs font-black text-slate-900">۸. تسویه و فاکتور فروش صادراتی</h4>
                              </div>
                              <p className="text-[10.5px] text-natural-text leading-relaxed">ثبت درآمد صادراتی ۵۸۰,۰۰۰,۰۰۰ تومانی ترخیص گمرک بندرعباس (پرونده t1). زنجیره با سودآوری بالا تکمیل شد.</p>
                            </div>
                          </>
                        )}

                        {selectedTracePreset === "f1" && (
                          <>
                            <div className="relative pr-8 space-y-1 group">
                              <span className="absolute right-[-2.5px] top-1.5 w-3.5 h-3.5 rounded-full bg-emerald-600 border border-3 border-white ring-4 ring-emerald-50 shrink-0" />
                              <div className="flex justify-between items-center">
                                <span className="text-[9px] bg-indigo-150 text-indigo-950 px-2 py-0.5 rounded font-black">نگهبانی حراست</span>
                                <h4 className="text-xs font-black text-slate-900">۱. ثبت نگهبانی کامیون بار خام</h4>
                              </div>
                              <p className="text-[10.5px] text-natural-text leading-relaxed">ورود کامیون بار مواد اولیه پودر پروتئینی با پلاک ۴۴ ب ۷۲۱ ایران ۶۶ در کارگاه در ساعت ۰۷:۳۰ صبح.</p>
                            </div>
                            <div className="relative pr-8 space-y-1 group">
                              <span className="absolute right-[-2.5px] top-1.5 w-3.5 h-3.5 rounded-full bg-emerald-600 border border-3 border-white ring-4 ring-emerald-50 shrink-0" />
                              <div className="flex justify-between items-center">
                                <span className="text-[9px] bg-emerald-100 text-emerald-950 px-2 py-0.5 rounded font-black">کارخانه خوراک</span>
                                <h4 className="text-xs font-black text-slate-900">۲. خط تولید میکرونی کارخانه خوراک</h4>
                              </div>
                              <p className="text-[10.5px] text-natural-text leading-relaxed">ساخت ۴۸۵ کیلوگرم پلت نرسری مخصوص لاروها (بچ f1) با دقت فوق‌میکرونی پروتئینی.</p>
                            </div>
                            <div className="relative pr-8 space-y-1 group">
                              <span className="absolute right-[-2.5px] top-1.5 w-3.5 h-3.5 rounded-full bg-emerald-600 border border-3 border-white ring-4 ring-emerald-50 shrink-0" />
                              <div className="flex justify-between items-center">
                                <span className="text-[9px] bg-purple-100 text-purple-950 px-2 py-0.5 rounded font-black">انبار مرکزی</span>
                                <h4 className="text-xs font-black text-slate-900">۳. تایید رسید موقت انبار مرکزی شیلات</h4>
                              </div>
                              <p className="text-[10.5px] text-natural-text leading-relaxed">صدور قبض کاردکس i1 توسط هاشمی سرپرست انبار؛ تحویل با موفقیت تایید شد.</p>
                            </div>
                            <div className="relative pr-8 space-y-1 group">
                              <span className="absolute right-[-2.5px] top-1.5 w-3.5 h-3.5 rounded-full bg-emerald-600 border border-3 border-white ring-4 ring-emerald-50 shrink-0" />
                              <div className="flex justify-between items-center">
                                <span className="text-[9px] bg-indigo-100 text-indigo-900 px-2 py-0.5 rounded font-black">استخر نرسری</span>
                                <h4 className="text-xs font-black text-slate-900">۴. توزیع و جیره نویسی بچه ماهی</h4>
                              </div>
                              <p className="text-[10.5px] text-natural-text leading-relaxed">توزیع جیره ۱.۲ میلی‌متری و پایش کیفیت هیدرولیک و دما در تانک‌ها.</p>
                            </div>
                            <div className="relative pr-8 space-y-1 group">
                              <span className="absolute right-[-2px] bottom-0 w-3 h-3 rounded-full bg-indigo-600 border border-white ring-4 ring-indigo-50 shrink-0" />
                              <div className="flex justify-between items-center">
                                <span className="text-[9px] bg-rose-100 text-rose-950 px-2 py-0.5 rounded font-black">حسابداری مالی</span>
                                <h4 className="text-xs font-black text-slate-900">۵. ثبت تراکنش مآخذ خرید مکمل</h4>
                              </div>
                              <p className="text-[10.5px] text-natural-text leading-relaxed">ثبت پیش‌فاکتور خرید مکمل‌های دوز نرسری به مبلغ ۴۵,۰۰۰,۰۰۰ تومان (سند t2).</p>
                            </div>
                          </>
                        )}

                        {selectedTracePreset === "m2" && (
                          <>
                            <div className="relative pr-8 space-y-1 group">
                              <span className="absolute right-[-2.5px] top-1.5 w-3.5 h-3.5 rounded-full bg-cyan-600 border border-3 border-white ring-4 ring-cyan-50 shrink-0" />
                              <div className="flex justify-between items-center">
                                <span className="text-[9px] bg-rose-100 text-rose-950 px-2 py-0.5 rounded font-black">تأسیسات کارگاه</span>
                                <h4 className="text-xs font-black text-slate-900">۱. لرزش یاتاقان و پمپ پشتیبان</h4>
                              </div>
                              <p className="text-[10.5px] text-natural-text leading-relaxed">شناسایی لرزش و کالیبراسیون فوری دوز هوادهی با پمپ پشتیبان ژنراتور در سالن نرسری.</p>
                            </div>
                            <div className="relative pr-8 space-y-1 group">
                              <span className="absolute right-[-2.5px] top-1.5 w-3.5 h-3.5 rounded-full bg-cyan-600 border border-3 border-white ring-4 ring-cyan-50 shrink-0" />
                              <div className="flex justify-between items-center">
                                <span className="text-[9px] bg-purple-100 text-purple-950 px-2 py-0.5 rounded font-black">انبار مرکزی</span>
                                <h4 className="text-xs font-black text-slate-900">۲. تأمین فوری پروانه و قطعه یدکی</h4>
                              </div>
                              <p className="text-[10.5px] text-natural-text leading-relaxed">ترخیص کالا از انبار مرکزی (قطعه پروانه گریز از مرکز دوزدار) با کاردکس ممهور هاشمی.</p>
                            </div>
                            <div className="relative pr-8 space-y-1 group">
                              <span className="absolute right-[-2.5px] top-1.5 w-3.5 h-3.5 rounded-full bg-cyan-600 border border-3 border-white ring-4 ring-cyan-50 shrink-0" />
                              <div className="flex justify-between items-center">
                                <span className="text-[9px] bg-cyan-100 text-cyan-950 px-2 py-0.5 rounded font-black">امنیت تاسیساتی</span>
                                <h4 className="text-xs font-black text-slate-900">۳. تعمیر دوره‌ای و تضمین کیفیت دوز</h4>
                              </div>
                              <p className="text-[10.5px] text-natural-text leading-relaxed">تعمیر اساسی اورهال موتور پمپ با تلورانس ۳ ساعت بیوماس و ثبات اکسیژنی ۹۵٪.</p>
                            </div>
                            <div className="relative pr-8 space-y-1 group">
                              <span className="absolute right-[-2.5px] top-1.5 w-3.5 h-3.5 rounded-full bg-cyan-600 border border-3 border-white ring-4 ring-cyan-50 shrink-0" />
                              <div className="flex justify-between items-center">
                                <span className="text-[9px] bg-rose-100 text-rose-950 px-2 py-0.5 rounded font-black">حسابداری مالی</span>
                                <h4 className="text-xs font-black text-slate-900">۴. ثبت فاکتور تعمیرات اورهال</h4>
                              </div>
                              <p className="text-[10.5px] text-natural-text leading-relaxed">تسویه فاکتور قطعات یدکی پمپ به ارزش ۱۷,۵۰۰,۰۰۰ تومان (سند حسابداری t12).</p>
                            </div>
                            <div className="relative pr-8 space-y-1 group">
                              <span className="absolute right-[-2px] bottom-0 w-3 h-3 rounded-full bg-emerald-600 border border-white ring-4 ring-emerald-50 shrink-0" />
                              <div className="flex justify-between items-center">
                                <span className="text-[9px] bg-sky-100 text-sky-950 px-2 py-0.5 rounded font-black">سردخانه مرکزی</span>
                                <h4 className="text-xs font-black text-slate-900">۵. خنک‌سازی کارگاهی واکسن واکسینه</h4>
                              </div>
                              <p className="text-[10.5px] text-natural-text leading-relaxed">خنک‌سازی دوزهای ایمنی با دمای مطلوب در سردخانه کارگاه جهت پایداری زیستی.</p>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 🏢 بخش سوم: لیست تفصیلی ملزومات (مواد مصرفی) به عنوان دفتر مانیتورینگ */}
              <div className="bg-white border border-natural-border p-5 rounded-3xl space-y-4 text-right">
                <div className="flex justify-between items-center border-b pb-3">
                  <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-black font-sans">
                    {consumables.length} ردیف کل زنجیره
                  </span>
                  <h3 className="text-xs font-black text-natural-dark flex items-center gap-1.5">
                    <span>دفتر مانیتورینگ جامع و ردیابی لایف‌سایکل تمام ملزومات مصرفی در کل بخش‌ها (لیست آرشیو)</span>
                    <Boxes size={14} className="text-indigo-600 animate-pulse" />
                  </h3>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-right text-xs">
                    <thead>
                      <tr className="border-b border-natural-border text-natural-text/60 font-sans font-black">
                        <th className="pb-2">عنوان ملزومات مصرفی</th>
                        <th className="pb-2">دپارتمان متبوع</th>
                        <th className="pb-2">مقدار تدارکاتی</th>
                        <th className="pb-2">تاریخ تحویل</th>
                        <th className="pb-2">تحویل به خط واقعی</th>
                        <th className="pb-2">تاریخ کالیبره انقضا</th>
                        <th className="pb-2 text-center">پایداری فرآیند</th>
                        <th className="pb-2 text-center">اقدام کنترلی</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-natural-border/30">
                      {consumables.map(c => {
                        const isExpiredNow = c.status === "expired" || (c.expiryDate && c.expiryDate < "1405/03/10" && c.status !== "consumed");
                        return (
                          <tr key={c.id} className="hover:bg-natural-khaki/10 transition-colors">
                            <td className="py-2.5">
                              <div className="font-bold text-natural-dark text-[11px]">{c.itemName}</div>
                              {c.notes && <div className="text-[9px] text-natural-text/60">{c.notes}</div>}
                            </td>
                            <td className="py-2.5">
                              <span className="text-[9px] font-black bg-slate-50 text-slate-800 px-1.5 py-0.5 rounded border border-slate-100/50">
                                {getDeptLabel(c.department)}
                              </span>
                            </td>
                            <td className="py-2.5 font-mono font-black text-slate-800">
                              {c.quantity} <span className="text-[9px] font-sans text-natural-text/70">{c.unit}</span>
                            </td>
                            <td className="py-2.5 font-mono text-natural-text">{c.entryDate}</td>
                            <td className="py-2.5 font-mono">
                              {c.consumptionDate ? (
                                <span className="text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded-sm text-[10px]">
                                  {c.consumptionDate}
                                </span>
                              ) : (
                                <div className="flex items-center gap-1">
                                  <input
                                    type="text"
                                    placeholder="ثبت مصرف"
                                    defaultValue="1405/03/10"
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        handleRecordConsumption(c.id, e.currentTarget.value);
                                      }
                                    }}
                                    className="w-20 text-[10px] font-bold rounded border border-natural-border px-1 text-center bg-[#FDFCF8]"
                                  />
                                  <span className="text-[10px] text-amber-600 font-bold shrink-0 animate-pulse">در انبار</span>
                                </div>
                              )}
                            </td>
                            <td className="py-2.5 font-mono">
                              {c.expiryDate ? (
                                <span className={`${isExpiredNow ? "text-rose-700 font-extrabold" : "text-natural-text"}`}>
                                  {c.expiryDate}
                                </span>
                              ) : (
                                <span className="text-natural-text/40">—</span>
                              )}
                            </td>
                            <td className="py-2.5 text-center">
                              {c.status === "consumed" ? (
                                <span className="text-[9px] bg-emerald-50 border border-emerald-200 text-emerald-800 px-1.5 py-0.5 rounded font-extrabold">مصرف شده</span>
                              ) : isExpiredNow ? (
                                <span className="text-[9px] bg-rose-50 border border-rose-250 text-rose-800 px-1.5 py-0.5 rounded font-extrabold animate-pulse">منقضی شده</span>
                              ) : (
                                <span className="text-[9px] bg-amber-50 border border-amber-200 text-amber-800 px-1.5 py-0.5 rounded font-extrabold">موجود در انبار</span>
                              )}
                            </td>
                            <td className="py-2.5 text-center">
                              {c.status !== "consumed" && (
                                <button
                                  onClick={() => handleRecordConsumption(c.id, "1405/03/10")}
                                  className="px-2 py-1 text-[9px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded cursor-pointer transition-colors shadow-xs"
                                >
                                  ثبت مصرف فوری
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeFilter !== "traceability" && 
            filteredTimeline.map((item) => {
              const isExpanded = expandedItemId === item.id;
              
              return (
                <div 
                  key={item.id} 
                  className={`bg-white border rounded-2xl transition-all shadow-xs overflow-hidden ${
                    isExpanded ? "border-natural-earth ring-1 ring-natural-earth/25" : "border-natural-border hover:border-natural-earth/50"
                  }`}
                >
                  
                  {/* COMPACT MAIN WRAPPER */}
                  <div 
                    onClick={() => toggleExpand(item.id)}
                    className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 cursor-pointer select-none"
                  >
                    
                    <div className="flex flex-1 items-start gap-3.5">
                      {/* ICON CONTAINER ACCENT */}
                      <div className={`p-2.5 rounded-xl border flex items-center justify-center shrink-0 mt-0.5 ${item.badgeBg}`}>
                        {item.icon}
                      </div>

                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md border ${item.badgeBg}`}>
                            {item.badgeText}
                          </span>
                          <strong className="text-xs text-natural-dark font-sans leading-relaxed text-right">
                            {item.title}
                          </strong>
                        </div>

                        <div className="text-[10.5px] text-natural-text/60 font-sans text-right">
                          مکان رویداد: <span className="font-bold text-[#2D4A3E]">{item.poolName}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3self-stretch md:self-auto justify-between border-t md:border-t-0 pt-2.5 md:pt-0 mt-2.5 md:mt-0 border-natural-border/30">
                      <span className="text-[10px] text-natural-text/50 font-mono font-bold flex items-center gap-1.5 bg-natural-khaki/30 px-2 py-1 rounded-lg">
                        <Clock size={12} className="text-natural-earth" />
                        {item.timestamp}
                      </span>

                      {isExpanded ? <ChevronUp size={16} className="text-natural-text" /> : <ChevronDown size={16} className="text-natural-text/50" />}
                    </div>

                  </div>

                  {/* DETAILED ACCORDION DISPLAY SCREEN */}
                  {isExpanded && (
                    <div className="bg-[#FAF9F5] border-t border-natural-border p-5 space-y-4 text-xs font-sans">
                      <div className="bg-white p-4 rounded-xl border border-natural-border space-y-3.5 shadow-xs text-right">
                        
                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-natural-dark border-b border-natural-border/30 pb-2 justify-end">
                          <span>تشریح مستندات و شناسنامه بیو شیمیایی تانک:</span>
                          <Info size={14} className="text-natural-earth" />
                        </div>

                        <p className="leading-relaxed text-natural-dark font-medium whitespace-pre-wrap">
                          {item.details}
                        </p>

                        {item.operatorOrDetail && (
                          <div className="bg-natural-khaki/30 p-2.5 rounded-lg border border-natural-border/40 text-[10px] text-natural-text flex items-center gap-2 justify-end">
                            <span>توضیحات تکمیلی مسئول فنی: <strong>{item.operatorOrDetail}</strong></span>
                            <User size={13} className="text-natural-earth" />
                          </div>
                        )}

                        {item.secondaryMeta && (
                          <div className="text-[#A65D50] text-[10.5px] font-semibold bg-red-50/30 p-2.5 rounded-lg border border-[#A65D50]/15 leading-relaxed">
                            ⚠️ {item.secondaryMeta}
                          </div>
                        )}

                      </div>

                      {/* METADATA CODES DECORATOR */}
                      <div className="flex justify-between items-center text-[9px] text-natural-text/45 font-mono">
                        <span>شناسه منحصربفرد سیستمی: {item.id}</span>
                        <span>سند تایید شده بر پایه دستورالعمل استحصال خاویار بلوگا خزر</span>
                      </div>

                    </div>
                  )}

                </div>
              );
            })
          }

          {activeFilter !== "traceability" && filteredTimeline.length === 0 && (
            <div className="text-center py-16 bg-natural-khaki/10 rounded-2xl border border-dashed border-natural-border p-8">
              <FileText size={44} className="mx-auto text-natural-text/20 animate-pulse mb-3" />
              <p className="text-sm font-bold text-natural-dark font-sans">هیچ پرونده‌ای منطبق با عبارت فیلترشده یافت نشد.</p>
              <p className="text-xs text-natural-text/60 mt-1">تغییر فیلترها یا ویرایش مانیتورینگ واژه جستجو در فیلد بالا توصیه می‌شود.</p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
