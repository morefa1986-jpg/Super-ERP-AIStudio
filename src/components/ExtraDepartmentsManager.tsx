import React, { useState, useEffect } from "react";
import { 
  Cpu, 
  Wrench, 
  Factory, 
  Wheat, 
  Warehouse, 
  Coins, 
  Shield, 
  Plus, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  UserCheck, 
  Boxes, 
  Gauge,
  Snowflake,
  Thermometer,
  RefreshCw,
  Search,
  Trash2
} from "lucide-react";
import { Pool } from "../types";
import OfficeAccountingSuite from "./OfficeAccountingSuite";

interface ExtraDepartmentsManagerProps {
  pools: Pool[];
  activeDepartment: "facilities" | "processing" | "feedmill" | "inventory" | "accounting" | "security" | "coldstorage" | "traceability";
}

// ---- INTERFACES ----
interface ColdStorageLog {
  id: string;
  date: string;
  time: string;
  roomName: string;
  temperature: number;
  humidity: number;
  status: "normal" | "warning" | "danger";
  operator: string;
  notes: string;
}

interface ColdStorageInventory {
  id: string;
  dateAdded: string;
  itemName: string;
  weightKg: number;
  boxCount: number;
  roomName: string;
  operator: string;
}

interface MaintenanceLog {
  id: string;
  date: string;
  facilityUnit: string;
  eventType: string;
  operator: string;
  status: "completed" | "in_progress" | "scheduled";
  notes: string;
}

interface CaviarBatch {
  id: string;
  date: string;
  poolId: string;
  sturgeonWeightKg: number;
  caviarWeightKg: number;
  yieldPercent: number;
  saltPercent: string;
  grade: string;
  notes: string;
}

interface FeedBatch {
  id: string;
  date: string;
  pelletSize: string;
  rawMaterialKg: number;
  outputKg: number;
  operator: string;
  grade: string;
}

interface InventoryLog {
  id: string;
  date: string;
  itemName: string;
  action: "add" | "remove";
  quantity: number;
  operator: string;
  reason: string;
}

interface FinancialTransaction {
  id: string;
  date: string;
  type: "income" | "expense";
  category: string;
  amountToman: number;
  description: string;
}

interface SecurityLog {
  id: string;
  date: string;
  time: string;
  visitorName: string;
  carPlate: string;
  purpose: string;
  actionType: "enter" | "exit";
}

interface ConsumableItem {
  id: string;
  itemName: string;
  department: "facilities" | "processing" | "feedmill" | "inventory" | "accounting" | "security" | "coldstorage";
  quantity: number;
  unit: string;
  entryDate: string; // تاریخ ورود
  consumptionDate: string; // تاریخ مصرف (در صورت وجود)
  expiryDate: string; // تاریخ انقضاء (در صورت وجود)
  operator: string;
  notes: string;
  status: "available" | "consumed" | "expired";
}

export default function ExtraDepartmentsManager({ pools, activeDepartment }: ExtraDepartmentsManagerProps) {
  // ---- STATE STORAGE ----
  const [maintenance, setMaintenance] = useState<MaintenanceLog[]>(() => {
    const saved = localStorage.getItem("caviar_maintenance");
    if (saved) return JSON.parse(saved);
    return [];
  });

  const [caviarBatches, setCaviarBatches] = useState<CaviarBatch[]>(() => {
    const saved = localStorage.getItem("caviar_processing");
    if (saved) return JSON.parse(saved);
    return [];
  });

  const [feedBatches, setFeedBatches] = useState<FeedBatch[]>(() => {
    const saved = localStorage.getItem("caviar_feedmill");
    if (saved) return JSON.parse(saved);
    return [];
  });

  const [inventoryStock, setInventoryStock] = useState<{ [key: string]: number }>(() => {
    const saved = localStorage.getItem("caviar_inventory_stock");
    if (saved) return JSON.parse(saved);
    return {};
  });

  const [inventoryLogs, setInventoryLogs] = useState<InventoryLog[]>(() => {
    const saved = localStorage.getItem("caviar_inventory_logs");
    if (saved) return JSON.parse(saved);
    return [];
  });

  const [financials, setFinancials] = useState<FinancialTransaction[]>(() => {
    const saved = localStorage.getItem("caviar_financials");
    if (saved) return JSON.parse(saved);
    return [];
  });

  const [securityLogs, setSecurityLogs] = useState<SecurityLog[]>(() => {
    const saved = localStorage.getItem("caviar_security");
    if (saved) return JSON.parse(saved);
    return [];
  });

  const [coldStorageLogs, setColdStorageLogs] = useState<ColdStorageLog[]>(() => {
    const saved = localStorage.getItem("caviar_cold_storage_logs");
    if (saved) return JSON.parse(saved);
    return [];
  });

  const [coldStorageInventory, setColdStorageInventory] = useState<ColdStorageInventory[]>(() => {
    const saved = localStorage.getItem("caviar_cold_storage_inventory");
    if (saved) return JSON.parse(saved);
    return [];
  });

  // ---- SAVE IN EFFECTS ----
  useEffect(() => {
    localStorage.setItem("caviar_maintenance", JSON.stringify(maintenance));
  }, [maintenance]);

  useEffect(() => {
    localStorage.setItem("caviar_processing", JSON.stringify(caviarBatches));
  }, [caviarBatches]);

  useEffect(() => {
    localStorage.setItem("caviar_feedmill", JSON.stringify(feedBatches));
  }, [feedBatches]);

  useEffect(() => {
    localStorage.setItem("caviar_inventory_stock", JSON.stringify(inventoryStock));
    localStorage.setItem("caviar_inventory_logs", JSON.stringify(inventoryLogs));
  }, [inventoryStock, inventoryLogs]);

  useEffect(() => {
    localStorage.setItem("caviar_financials", JSON.stringify(financials));
  }, [financials]);

  useEffect(() => {
    localStorage.setItem("caviar_security", JSON.stringify(securityLogs));
  }, [securityLogs]);

  useEffect(() => {
    localStorage.setItem("caviar_cold_storage_logs", JSON.stringify(coldStorageLogs));
  }, [coldStorageLogs]);

  useEffect(() => {
    localStorage.setItem("caviar_cold_storage_inventory", JSON.stringify(coldStorageInventory));
  }, [coldStorageInventory]);

  // ---- CONSUMABLES STATE & PERSISTENCE ----
  const [consumables, setConsumables] = useState<ConsumableItem[]>(() => {
    const saved = localStorage.getItem("caviar_consumables");
    if (saved) return JSON.parse(saved);
    return [];
  });

  useEffect(() => {
    localStorage.setItem("caviar_consumables", JSON.stringify(consumables));
  }, [consumables]);

  // ---- TRACEABILITY STATE ----
  const [traceSearchQuery, setTraceSearchQuery] = useState("");
  const [selectedTracePreset, setSelectedTracePreset] = useState("c2");

  // Load complementary pool records for offline audit trails
  const [farmFeedings] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem("sturgeon_feedings");
      if (saved) {
        const migrated = saved.replace(/واننیرو/g, "ونیرو");
        return JSON.parse(migrated);
      }
      return [];
    } catch {
      return [];
    }
  });

  const [farmMovements] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem("sturgeon_movements");
      if (saved) {
        const migrated = saved.replace(/واننیرو/g, "ونیرو");
        return JSON.parse(migrated);
      }
      return [];
    } catch {
      return [];
    }
  });

  const [farmMortalities] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem("sturgeon_mortality");
      if (saved) {
        const migrated = saved.replace(/واننیرو/g, "ونیرو");
        return JSON.parse(migrated);
      }
      return [];
    } catch {
      return [];
    }
  });

  // Helper search function that walks through all departmental states
  const handleTraceSearch = (query: string) => {
    const normalised = query.trim().toLowerCase();
    if (!normalised) return [];

    const results: Array<{ dept: string; title: string; desc: string; date: string; icon: string }> = [];

    // 1. Search Security logs
    securityLogs.forEach(s => {
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
    financials.forEach(f => {
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
    inventoryLogs.forEach(i => {
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
    feedBatches.forEach(f => {
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
    caviarBatches.forEach(c => {
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
    coldStorageInventory.forEach(cs => {
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
    consumables.forEach(c => {
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

  // ---- FORMS STATE MANAGERS ----
  // Cold Storage Form States
  const [coldRoom, setColdRoom] = useState("سردخانه شماره ۱ - خاویار صادراتی");
  const [coldTemp, setColdTemp] = useState("-2.5");
  const [coldHum, setColdHum] = useState("55");
  const [coldOp, setColdOp] = useState("امیر رحمانی");
  const [coldNotes, setColdNotes] = useState("");

  const [coldInvItem, setColdInvItem] = useState("خاویار بلوگا امپریال ۵۰۰گرمی");
  const [coldInvWeight, setColdInvWeight] = useState("10.0");
  const [coldInvBox, setColdInvBox] = useState("20");
  const [coldInvRoom, setColdInvRoom] = useState("سردخانه شماره ۱ - خاویار صادراتی");
  const [coldInvOp, setColdInvOp] = useState("امیر رحمانی");

  // ---- CONSUMABLES FORM STATES & HANDLERS ----
  const [conName, setConName] = useState("");
  const [conDept, setConDept] = useState("inventory");
  const [conQty, setConQty] = useState("100");
  const [conUnit, setConUnit] = useState("کیلوگرم");
  const [conEntryDate, setConEntryDate] = useState("1405/03/10");
  const [hasExpiry, setHasExpiry] = useState(true);
  const [conExpiryDate, setConExpiryDate] = useState("1405/12/29");
  const [hasConsumed, setHasConsumed] = useState(false);
  const [conConsumedDate, setConConsumedDate] = useState("");
  const [conOp, setConOp] = useState("سرپرست تدارکات");
  const [conNotes, setConNotes] = useState("");

  const handleAddConsumable = (e: React.FormEvent) => {
    e.preventDefault();
    if (!conName.trim()) {
      alert("لطفا نام کالا یا مواد مصرفی را وارد نمایید.");
      return;
    }
    const qty = parseFloat(conQty);
    if (isNaN(qty) || qty <= 0) {
      alert("لطفا مقدار جیره مصرفی معتبری بنویسید.");
      return;
    }

    const newItem: ConsumableItem = {
      id: "con-" + Math.floor(1000 + Math.random() * 9000).toString(),
      itemName: conName.trim(),
      department: conDept as any,
      quantity: qty,
      unit: conUnit,
      entryDate: conEntryDate || "1405/03/10",
      consumptionDate: hasConsumed ? (conConsumedDate || "1405/03/10") : "",
      expiryDate: hasExpiry ? (conExpiryDate || "1405/12/29") : "",
      operator: conOp || "تدارکات فارم",
      notes: conNotes.trim(),
      status: hasConsumed ? "consumed" : (hasExpiry && conExpiryDate < "1405/03/10" ? "expired" : "available")
    };

    setConsumables(prev => [newItem, ...prev]);
    setConName("");
    setConNotes("");
    alert("ماده مصرفی دپارتمان با موفقیت افزوده و ثبت تاریخی شد.");
  };

  const handleRecordConsumption = (id: string, date: string) => {
    if (!date) {
      alert("لطفا تاریخ مصرف را وارد نمایید.");
      return;
    }
    setConsumables(prev => prev.map(c => {
      if (c.id === id) {
        return {
          ...c,
          consumptionDate: date,
          status: "consumed" as const
        };
      }
      return c;
    }));
    alert("تاریخ مصرف کالای مشخص شده با موفقیت به تاریخ " + date + " ثبت گردید.");
  };

  const handleDeleteConsumable = (id: string) => {
    if (window.confirm("آیا از حذف این ردیف مصرفی اطمینان دارید؟")) {
      setConsumables(prev => prev.filter(c => c.id !== id));
    }
  };

  const getDeptLabel = (dept: string) => {
    switch(dept) {
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

  const handleAddColdStorageLog = (e: React.FormEvent) => {
    e.preventDefault();
    const tempNum = parseFloat(coldTemp);
    const humNum = parseInt(coldHum);
    if (isNaN(tempNum) || isNaN(humNum)) {
      alert("لطفا مقادیر معتبر برای دما و رطوبت وارد کنید.");
      return;
    }
    let statusVal: "normal" | "warning" | "danger" = "normal";

    if (coldRoom.includes("خاویار")) {
      if (tempNum > -1 || tempNum < -5) statusVal = "warning";
      if (tempNum > 2 || tempNum < -8) statusVal = "danger";
    } else if (coldRoom.includes("منجمد")) {
      if (tempNum > -15) statusVal = "warning";
      if (tempNum > -10) statusVal = "danger";
    } else {
      if (tempNum > 8 || tempNum < 0) statusVal = "warning";
      if (tempNum > 12) statusVal = "danger";
    }

    const newLog: ColdStorageLog = {
      id: "cs-" + Date.now().toString().slice(-4),
      date: "1405/03/10",
      time: new Date().toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit" }),
      roomName: coldRoom,
      temperature: tempNum,
      humidity: humNum,
      status: statusVal,
      operator: coldOp,
      notes: coldNotes || "ثبت وضعیت دوره‌ای هوشمند"
    };

    setColdStorageLogs([newLog, ...coldStorageLogs]);
    setColdNotes("");
    alert("گزارش وضعیت دما و رطوبت سردخانه با موفقیت ثبت شد.");
  };

  const handleAddColdInventory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!coldInvItem.trim()) {
      alert("لطفا نام کالا را وارد نمایید.");
      return;
    }
    const newInv: ColdStorageInventory = {
      id: "csi-" + Date.now().toString().slice(-4),
      dateAdded: "1405/03/10",
      itemName: coldInvItem,
      weightKg: parseFloat(coldInvWeight) || 0,
      boxCount: parseInt(coldInvBox) || 0,
      roomName: coldInvRoom,
      operator: coldInvOp
    };

    setColdStorageInventory([newInv, ...coldStorageInventory]);

    // همپوشانی هوشمند: ثبت اتوماتیک در بخش انبارداری کل فارم جهت هماهنگی توازن کاردکس
    const newInvLog: InventoryLog = {
      id: "inv-" + Date.now().toString().slice(-3),
      date: "1405/03/10",
      itemName: coldInvItem,
      action: "add",
      quantity: parseFloat(coldInvWeight) || 1,
      operator: coldInvOp,
      reason: `همپوشانی هوشمند: تحویل مستقیم کالا به سردخانه مرکزی (${coldInvRoom}) جهت حفظ دمای مطلوب`
    };
    setInventoryLogs(prev => [newInvLog, ...prev]);

    setColdInvItem("");
    setColdInvWeight("");
    setColdInvBox("");
    alert("حواله ورود کالا به سردخانه با موفقیت ثبت پیوسته شد؛ موجودی کارت کاردکس انبار به صورت اتوماتیک متوازن گردید.");
  };

  // 1. Maintenance
  const [mntUnit, setMntUnit] = useState("ژنراتور اضطراری شماره ۲");
  const [mntType, setMntType] = useState("تست و تعویض باطری استارت");
  const [mntOperator, setMntOperator] = useState("مهندس علوی");
  const [mntNotes, setMntNotes] = useState("");

  const handleAddMaintenance = (e: React.FormEvent) => {
    e.preventDefault();
    const newLog: MaintenanceLog = {
      id: "mnt-" + Date.now(),
      date: "1405/03/10",
      facilityUnit: mntUnit,
      eventType: mntType,
      operator: mntOperator,
      status: "completed",
      notes: mntNotes || "عادی بدون اشکال ثانویه"
    };
    setMaintenance([newLog, ...maintenance]);

    // همپوشانی هوشمند: ثبت تراکنش هزینه تعمیرات در سیستم مالی و حسابداری
    const repairCost = 3500000; // پیش‌فرض هزینه قطعات و اورهال برآورد شده
    const newFinTrans: FinancialTransaction = {
      id: "fin-" + Date.now().toString().slice(-3),
      date: "1405/03/10",
      type: "expense",
      category: "هزینه برق و تاسیسات آب",
      amountToman: repairCost,
      description: `همپوشانی هوشمند: هزینه قطعات مصرفی و کالیبراسیون برای ${mntUnit} بابت ${mntType}`
    };
    setFinancials(prev => [newFinTrans, ...prev]);

    // همپوشانی هوشمند: کسر اتوماتیک قطعات یا خروج کالا از کاردکس انبارداری
    const partsKey = "کپسول اکسیژن ۴۰ لیتری زاپاس";
    if (inventoryStock[partsKey] && inventoryStock[partsKey] > 0) {
      setInventoryStock(prev => ({
        ...prev,
        [partsKey]: prev[partsKey] - 1
      }));
      const newDeductLog: InventoryLog = {
        id: "inv-" + Date.now().toString().slice(-3),
        date: "1405/03/10",
        itemName: partsKey,
        action: "remove",
        quantity: 1,
        operator: mntOperator,
        reason: `همپوشانی هوشمند: کسر اتوماتیک ملزومات انبار جهت تکمیل اورهال فنی در واحد تأسیسات`
      };
      setInventoryLogs(prev => [newDeductLog, ...prev]);
    }

    setMntNotes("");
    alert("رویداد فنی با موفقیت ثبت شد. تراز هزینه حسابداری و کاردکس ملزومات انبار به صورت هوشمند به‌روزرسانی شدند.");
  };

  // 2. Caviar Processing
  const [procPoolId, setProcPoolId] = useState("");
  const [procSturgeonW, setProcSturgeonW] = useState("45");
  const [procCaviarW, setProcCaviarW] = useState("7.5");
  const [procSalt, setProcSalt] = useState("3.2% Malossol");
  const [procGrade, setProcGrade] = useState("Imperial Premium");
  const [procNotes, setProcNotes] = useState("");

  const handleAddCaviarBatch = (e: React.FormEvent) => {
    e.preventDefault();
    const sW = parseFloat(procSturgeonW);
    const cW = parseFloat(procCaviarW);
    if (isNaN(sW) || isNaN(cW) || sW <= 0 || cW <= 0) {
      alert("مقادیر عددی وزن ماهی و خاویار را بررسی فرمایید.");
      return;
    }
    const yieldCal = parseFloat(((cW / sW) * 100).toFixed(1));
    const newBatch: CaviarBatch = {
      id: "cav-" + Date.now().toString().slice(-4),
      date: "1405/03/10",
      poolId: procPoolId || (pools[0]?.id || "نامشخص"),
      sturgeonWeightKg: sW,
      caviarWeightKg: cW,
      yieldPercent: yieldCal,
      saltPercent: procSalt,
      grade: procGrade,
      notes: procNotes || "عملیات فرآوری تحت دوز نمک استاندارد"
    };
    setCaviarBatches([newBatch, ...caviarBatches]);

    // همپوشانی هوشمند: ثبت ارزش اسمی درآمد ارزی خاویار حاصل شده در حسابداری مالی
    const marketEstimateValue = Math.round(cW * 62000000); // به ازای هر کیلو ۶۲ میلیون تومان
    const newIncomeTrans: FinancialTransaction = {
      id: "fin-" + Date.now().toString().slice(-3),
      date: "1405/03/10",
      type: "income",
      category: "صادرات خاویار",
      amountToman: marketEstimateValue,
      description: `همپوشانی هوشمند: عایدی فرآوری و استحصال خاویار ${procGrade} از استخر ${procPoolId || "نامشخص"} به وزن خالص ${cW} کیلوگرم`
    };
    setFinancials(prev => [newIncomeTrans, ...prev]);

    // همپوشانی هوشمند: انتقال مستقیم محصول فرآوری شده به موجودی کاردکس سردخانه مرکزی شماره ۱
    const newColdStorageEntry: ColdStorageInventory = {
      id: "csi-" + Date.now().toString().slice(-4),
      dateAdded: "1405/03/10",
      itemName: `خاویار بلوگا استحصالی ${procGrade} - بچ ${newBatch.id}`,
      weightKg: cW,
      boxCount: Math.ceil(cW / 0.5), // بسته پالت پیش‌فرض نیم کیلویی
      roomName: "سردخانه شماره ۱ - خاویار صادراتی",
      operator: "فرآوری هوشمند"
    };
    setColdStorageInventory(prev => [newColdStorageEntry, ...prev]);

    // همپوشانی هوشمند: کسر مواد مصرفی (نمک و میکروچیپ RFID) از انبار مرکزی
    const trackingTagKey = "میکروچیپ تگ تبارشناسی RFID";
    const saltKey = "نمک دریایی تصفیه شده شیلاتی (بسته ۲۵ک)";
    setInventoryStock(prev => {
      const copy = { ...prev };
      if (copy[trackingTagKey] && copy[trackingTagKey] > 0) {
        copy[trackingTagKey] = copy[trackingTagKey] - 1;
      }
      if (copy[saltKey] && copy[saltKey] > 0) {
        copy[saltKey] = copy[saltKey] - 1;
      }
      return copy;
    });

    const newInvLogRFID: InventoryLog = {
      id: "inv-" + Date.now().toString().slice(-3),
      date: "1405/03/10",
      itemName: trackingTagKey,
      action: "remove",
      quantity: 1,
      operator: "فرآوری هوشمند",
      reason: `همپوشانی هوشمند: تخصیص مستقیم شناسه RFID تبارشناسی برای گله به اتمام رسیده بچ ${newBatch.id}`
    };
    const newInvLogSalt: InventoryLog = {
      id: "inv-" + (Date.now() + 1).toString().slice(-3),
      date: "1405/03/10",
      itemName: saltKey,
      action: "remove",
      quantity: 1,
      operator: "فرآوری هوشمند",
      reason: `همپوشانی هوشمند: مصرف نمک شیلاتی برای نمک‌گذاری ملوسل در بچ ${newBatch.id}`
    };
    setInventoryLogs(prev => [newInvLogRFID, newInvLogSalt, ...prev]);

    setProcNotes("");
    alert(`بچ استحصال با بهره‌وری ${yieldCal}% ثبت شد. اثر مالی همزمان در تراز حسابداری، حواله مستقیم به طبقات سردخانه و موازنه تگ‌های RFID انبار اعمال شد.`);
  };

  // 3. Feed Mill
  const [fdSize, setFdSize] = useState("1.2mm (مخصوص نرسری)");
  const [fdRaw, setFdRaw] = useState("400");
  const [fdOut, setFdOut] = useState("390");
  const [fdOperator, setFdOperator] = useState("اصغر یوسفی");
  const [fdGrade, setFdGrade] = useState("پروتئین بالا ۴۶٪ مخصوص نرسری");

  const handleAddFeedBatch = (e: React.FormEvent) => {
    e.preventDefault();
    const raw = parseFloat(fdRaw);
    const out = parseFloat(fdOut);
    if (isNaN(raw) || isNaN(out) || raw <= 0 || out <= 0) {
      alert("لطفاً مقادیر خوراک خشک خام و پلت شده را معتبر وارد سازید.");
      return;
    }
    const newLog: FeedBatch = {
      id: "fdb-" + Date.now().toString().slice(-4),
      date: "1405/03/10",
      pelletSize: fdSize,
      rawMaterialKg: raw,
      outputKg: out,
      operator: fdOperator,
      grade: fdGrade
    };
    setFeedBatches([newLog, ...feedBatches]);

    // به‌روزرسانی کاردکس موجودی انبار به میزان خروجی پلت
    const matchingKey = Object.keys(inventoryStock).find(k => k.includes(fdSize.split(" ")[0]));
    if (matchingKey) {
      setInventoryStock(prev => ({
        ...prev,
        [matchingKey]: prev[matchingKey] + out
      }));
    }

    // همپوشانی هوشمند: اضافه کردن اتوماتیک سند دریافت متمرکز خوراک به لاگ انبارداری
    const feedInventoryLog: InventoryLog = {
      id: "inv-" + Date.now().toString().slice(-3),
      date: "1405/03/10",
      itemName: matchingKey || "غذای خشک نرسری ۱.۲ میلی‌متری (کیلوگرم)",
      action: "add",
      quantity: out,
      operator: fdOperator,
      reason: `همپوشانی هوشمند: دریافت مستقیم پلت‌های فرآوری شده بچ تولیدی کارخانه خوراک (${fdSize})`
    };

    // همپوشانی هوشمند: کسر اتوماتیک مکمل‌های ویتامین آنتی‌شوک به ازای فرمول ساخت
    const vitaminKey = "ویتامین شوک‌زدایی آسکوربیک اسید (گرم)";
    const vitaminConsumed = 500; // گرم کسر پیش‌فرض از فرمول
    setInventoryStock(prev => {
      const copy = { ...prev };
      if (copy[vitaminKey] && copy[vitaminKey] >= vitaminConsumed) {
        copy[vitaminKey] = copy[vitaminKey] - vitaminConsumed;
      }
      return copy;
    });

    const feedDeductLog: InventoryLog = {
      id: "inv-" + (Date.now() + 1).toString().slice(-3),
      date: "1405/03/10",
      itemName: vitaminKey,
      action: "remove",
      quantity: vitaminConsumed,
      operator: fdOperator,
      reason: `همپوشانی هوشمند: کسر مکمل ویتامین آسکوربیک در ترکیب بچ ساخت شماره ${newLog.id}`
    };
    setInventoryLogs(prev => [feedInventoryLog, feedDeductLog, ...prev]);

    // همپوشانی هوشمند: ثبت اتوماتیک بهای تمام شده مواد اولیه در مخارج حسابداری مالی
    const rawMaterialCost = Math.round(raw * 24000); // برآورد ۲۴,۰۰۰ تومان به ازای هر کیلو پودر پروتئین
    const newFeedExpense: FinancialTransaction = {
      id: "fin-" + Date.now().toString().slice(-3),
      date: "1405/03/10",
      type: "expense",
      category: "خرید نهاده و مکمل",
      amountToman: rawMaterialCost,
      description: `همپوشانی هوشمند: بهای قطعی تبدیل پودر صدف و مواد اولیه به ظرفیت ${out} کیلو پلت آماده`
    };
    setFinancials(prev => [newFeedExpense, ...prev]);

    alert("بچ بچینگ و اکسترودر با موفقیت تولید شد؛ محصول نهایی حاصله در انبار رسید گردید و مکمل‌های فرمولاسیون از کاردکس کسر شدند.");
  };

  // 4. Inventory
  const [invItem, setInvItem] = useState("غذای خشک نرسری ۱.۲ میلی‌متری (کیلوگرم)");
  const [invAction, setInvAction] = useState<"add" | "remove">("add");
  const [invQty, setInvQty] = useState("100");
  const [invOp, setInvOp] = useState("سرپرست انبار");
  const [invReason, setInvReason] = useState("تامین محموله تقویتی سالن ۱ نرسری");

  const handleAddInventoryLog = (e: React.FormEvent) => {
    e.preventDefault();
    const qty = parseFloat(invQty);
    if (isNaN(qty) || qty <= 0) {
      alert("مقدار تراکنش انبارداری نامعتبر است.");
      return;
    }

    if (invAction === "remove" && (inventoryStock[invItem] || 0) < qty) {
      alert("کالای انتخابی موجودی کافی در قفسه جهت حواله به کارگاه ندارد.");
      return;
    }

    setInventoryStock(prev => ({
      ...prev,
      [invItem]: prev[invItem] + (invAction === "add" ? qty : -qty)
    }));

    const newLog: InventoryLog = {
      id: "inv-" + Date.now().toString().slice(-3),
      date: "1405/03/10",
      itemName: invItem,
      action: invAction,
      quantity: qty,
      operator: invOp,
      reason: invReason
    };

    setInventoryLogs([newLog, ...inventoryLogs]);

    // همپوشانی هوشمند: ایجاد اتوماتیک سند تراکنش هزینه خرید در صورت ورود به انبار به صورت فاکتور تسویه نشده
    if (invAction === "add") {
      const estimatedUnitCost = invItem.includes("غذای") ? 18000 : invItem.includes("نمک") ? 320000 : invItem.includes("میکروچیپ") ? 160000 : 8000;
      const totalEstimatedCost = Math.round(qty * estimatedUnitCost);
      const newInvExpense: FinancialTransaction = {
        id: "fin-" + Date.now().toString().slice(-3),
        date: "1405/03/10",
        type: "expense",
        category: "خرید نهاده و مکمل",
        amountToman: totalEstimatedCost,
        description: `همپوشانی هوشمند: تامین مستقیم و خرید فاکتور شده ${invItem} به مقدار ${qty} واحد`
      };
      setFinancials(prev => [newInvExpense, ...prev]);
    }

    setInvReason("");
    alert("سند انبارداری صادر، کارت کاردکس کالا هوشمندسازی شده و سند مالی خرید به ترازنامه افزوده گردید.");
  };

  // 5. Financials
  const [finType, setFinType] = useState<"income" | "expense">("expense");
  const [finCat, setFinCat] = useState("خرید نهاده و مکمل");
  const [finAmt, setFinAmt] = useState("12000000");
  const [finDesc, setFinDesc] = useState("");

  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(finAmt);
    if (isNaN(amt) || amt <= 0) {
      alert("مبلغ تراکنش باید یک مقدار عددی مثبت باشد.");
      return;
    }
    const newTrans: FinancialTransaction = {
      id: "fin-" + Date.now().toString().slice(-3),
      date: "1405/03/10",
      type: finType,
      category: finCat,
      amountToman: amt,
      description: finDesc || "ثبت سند مالی بخش شیلات"
    };

    setFinancials([newTrans, ...financials]);
    setFinDesc("");
    alert("تراکنش مالی با موفقیت تایید و به تراز حسابداری افزوده شد.");
  };

  // 6. Security
  const [secName, setSecName] = useState("");
  const [secPlate, setSecPlate] = useState("");
  const [secPurpose, setSecPurpose] = useState("تخلیه نهاده و دافنی نرسری");
  const [secAction, setSecAction] = useState<"enter" | "exit">("enter");

  const handleAddSecurityLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!secName.trim() || !secPlate.trim()) {
      alert("ارائه نام ترددکننده و شماره پلاک خودرو الزامیست.");
      return;
    }
    const newLog: SecurityLog = {
      id: "sec-" + Date.now().toString().slice(-3),
      date: "1405/03/10",
      time: new Date().toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit" }),
      visitorName: secName,
      carPlate: secPlate,
      purpose: secPurpose,
      actionType: secAction
    };

    setSecurityLogs([newLog, ...securityLogs]);

    // همپوشانی هوشمند: ورود خودروی نهاده یا دافنی به گیت ورودی به طور اتوماتیک مواد اولیه را رسید انبار می‌کند
    if (secAction === "enter" && (secPurpose.includes("نهاده") || secPurpose.includes("تخلیه") || secPurpose.includes("بچه ماهی"))) {
      const isFeed = secPurpose.includes("نهاده") || secPurpose.includes("تخلیه");
      const targetItem = isFeed ? "غذای خشک نرسری ۱.۲ میلی‌متری (کیلوگرم)" : "میکروچیپ تگ تبارشناسی RFID";
      const incomingQty = isFeed ? 400 : 100;
      
      setInventoryStock(prev => ({
        ...prev,
        [targetItem]: prev[targetItem] + incomingQty
      }));

      const incomingInvLog: InventoryLog = {
        id: "inv-" + Date.now().toString().slice(-3),
        date: "1405/03/10",
        itemName: targetItem,
        action: "add",
        quantity: incomingQty,
        operator: "تاییدیه امنیتی گیت",
        reason: `همپوشانی هوشمند: وصول اتوماتیک محموله در انبار پس از عبور کامیون (${secName}، پلاک ${secPlate}) از گیت حراست`
      };
      setInventoryLogs(prev => [incomingInvLog, ...prev]);
    }

    setSecName("");
    setSecPlate("");
    alert("تردد مأمورین/پرسنل یا خودروی ترانزیت ثبت گردید. با رسید اتوماتیک بار ورودی، زنجیره پشتیبانی همگام شد.");
  };

  // Core Calculations for Sturgeon Asset Valuation
  const totalBiomassOfFarm = pools.reduce((acc, p) => acc + (p.totalBiomassKg || 0), 0);
  const sturgeonMarketValuePerKg = 1200000; // 1,200,000 Toman per kg sturgeon on average
  const totalSturgeonAssetValuationToman = 0;

  return (
    <div className="space-y-6">
      
      {/* 🔧 Unit 1: FACILITIES SECTION */}
      {activeDepartment === "facilities" && (
        <div className="space-y-6" id="dept-facilities-section">
          {/* Header Description */}
          <div className="bg-white border border-natural-border p-5 rounded-3xl space-y-2">
            <div className="flex items-center gap-2 text-cyan-600 font-extrabold text-xs">
              <Cpu size={16} />
              <span>پایش ابزار دقیق و تصفیه‌خانه مرکزی (تأسیسات)</span>
            </div>
            <p className="text-xs text-natural-text leading-relaxed">
              سامانه‌های یکپارچه بازچرخانی آب (RAS)، غلظت اکسیژن دهی تانک‌ها، ژنراتورهای اضطراری برق، استریل کننده‌های پربازده فرابنفش (UV) و پمپ‌های هیدرولیکی چاه عمیق در این بخش ردیابی تکنیکال می‌شوند.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white border border-cyan-200/50 p-4 rounded-2xl flex items-center justify-between shadow-xs">
              <div>
                <span className="text-[10px] text-natural-text/60 block">وضعیت ژنراتور اضطراری ۲</span>
                <span className="text-sm font-black text-cyan-800 block mt-1">آماده به کار (Standby)</span>
              </div>
              <Cpu className="text-cyan-600" size={24} />
            </div>

            <div className="bg-white border border-cyan-200/50 p-4 rounded-2xl flex items-center justify-between shadow-xs">
              <div>
                <span className="text-[10px] text-natural-text/60 block">دروازه دبی پمپاژ چاه‌ها</span>
                <span className="text-sm font-black text-cyan-800 block mt-1">۱,۴۲۰ مترمکعب/ساعت</span>
              </div>
              <Gauge className="text-cyan-700" size={24} />
            </div>

            <div className="bg-white border border-[#E9D18D]/50 p-4 rounded-2xl flex items-center justify-between bg-amber-50/25 shadow-xs">
              <div>
                <span className="text-[10px] text-natural-text/60 block">مخزن گاز دوفاز اکسیژن</span>
                <span className="text-sm font-black text-amber-800 block mt-1">غلظت ۹۴٪ (پر)</span>
              </div>
              <AlertTriangle className="text-amber-600" size={20} />
            </div>

            <div className="bg-white border border-cyan-200/50 p-4 rounded-2xl flex items-center justify-between shadow-xs">
              <div>
                <span className="text-[10px] text-natural-text/60 block">سیستم خنک‌سازی فیلترهای UV</span>
                <span className="text-sm font-black text-green-800 block mt-1">فعال و ایمن (۱۸°C)</span>
              </div>
              <CheckCircle2 className="text-green-600" size={22} />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Maintenance Register Form */}
            <div className="bg-white border border-natural-border p-5 rounded-3xl space-y-4">
              <h3 className="text-xs font-black text-natural-dark flex items-center gap-1.5 border-b pb-2">
                <Wrench size={14} className="text-cyan-600" />
                <span>ثبت سرویس فنی و عیب‌یابی سامانه</span>
              </h3>
              
              <form onSubmit={handleAddMaintenance} className="space-y-3">
                <div>
                  <label className="text-[10px] font-black text-natural-dark block mb-1">دستگاه / واحد فنی:</label>
                  <select
                    value={mntUnit}
                    onChange={(e) => setMntUnit(e.target.value)}
                    className="w-full text-xs font-bold font-sans rounded-xl border border-natural-border p-2 bg-white text-natural-dark cursor-pointer text-right focus:outline-none focus:border-cyan-500"
                  >
                    <option value="ژنراتور اضطراری شماره ۲">ژنراتور اضطراری شماره ۲</option>
                    <option value="پمپ هوادهی مرکزی سالن ۱">پمپ هوادهی مرکزی سالن ۱</option>
                    <option value="بخش اوزون‌ساز تصفیه‌خانه">بخش اوزون‌ساز تصفیه‌خانه</option>
                    <option value="تابلو توزیع برق اصلی سالن ۲">تابلو توزیع برق اصلی سالن ۲</option>
                    <option value="لامپ UV فید استریل کننده تانک ۱">لامپ UV فید استریل کننده تانک ۱</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-black text-natural-dark block mb-1">آیتم عملیات سرویس:</label>
                  <input
                    type="text"
                    required
                    value={mntType}
                    onChange={(e) => setMntType(e.target.value)}
                    placeholder="مثال: تست بار باتری، بک‌واش دستی فیلترها، کالیبراسیون سنسور اکسیژن"
                    className="w-full text-xs font-bold rounded-xl border border-natural-border p-2.5 bg-[#FDFCF8] text-natural-dark focus:outline-none focus:border-cyan-500 text-right"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black text-natural-dark block mb-1">کنسول فنی کارشناس:</label>
                  <input
                    type="text"
                    required
                    value={mntOperator}
                    onChange={(e) => setMntOperator(e.target.value)}
                    className="w-full text-xs font-bold rounded-xl border border-natural-border p-2 bg-[#FDFCF8] text-natural-dark focus:outline-none focus:border-cyan-500 text-right"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black text-natural-dark block mb-1">گزارش و جزئیات پارامتر تاسیسات:</label>
                  <textarea
                    rows={2}
                    value={mntNotes}
                    onChange={(e) => setMntNotes(e.target.value)}
                    placeholder="یادداشت‌های فنی به تفکیک دما، غلظت و فشار..."
                    className="w-full text-xs font-bold rounded-xl border border-natural-border p-2 bg-[#FDFCF8] text-natural-dark focus:outline-none focus:border-cyan-500 text-right"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-cyan-700 hover:bg-cyan-800 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Plus size={14} />
                  ثبت رسمی عملیات فنی تأسیسات
                </button>
              </form>
            </div>

            {/* Maintenance History */}
            <div className="bg-white border border-natural-border p-5 rounded-3xl lg:col-span-2 space-y-4">
              <h3 className="text-xs font-black text-natural-dark flex items-center gap-1.5 border-b pb-2">
                <Clock size={14} className="text-cyan-600" />
                <span>دفتر وقایع فنی و بک‌واش‌های تاسیسات شیلات</span>
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead>
                    <tr className="border-b border-natural-border text-natural-text/60">
                      <th className="pb-3 pt-1">تاریخ</th>
                      <th className="pb-3 pt-1">سامانه هدف</th>
                      <th className="pb-3 pt-1">عنوان عملیات فنی</th>
                      <th className="pb-3 pt-1">سرپرست فنی</th>
                      <th className="pb-3 pt-1 text-center">وضعیت</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-natural-border/30">
                    {maintenance.map((log) => (
                      <tr key={log.id} className="hover:bg-natural-khaki/10">
                        <td className="py-3 font-mono font-bold text-natural-dark">{log.date}</td>
                        <td className="py-3 font-bold text-natural-dark">{log.facilityUnit}</td>
                        <td className="py-3 text-[11px] text-natural-text">
                          <span className="block font-medium">{log.eventType}</span>
                          <span className="block text-[9.5px] text-natural-text/60 mt-0.5">{log.notes}</span>
                        </td>
                        <td className="py-3 text-natural-text font-medium">{log.operator}</td>
                        <td className="py-3 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                            log.status === "completed" 
                              ? "bg-emerald-100 text-emerald-900" 
                              : log.status === "in_progress"
                              ? "bg-blue-100 text-blue-900 animate-pulse"
                              : "bg-amber-100 text-amber-900"
                          }`}>
                            {log.status === "completed" ? "انجام شد" : log.status === "in_progress" ? "درحال اقدام" : "برنامه‌ریزی"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 📦 مواد مصرفی و پایش تاریخ انقضای ملزومات تأسیسات */}
            <div className="bg-white border border-natural-border p-5 rounded-3xl space-y-4">
              <div className="flex justify-between items-center border-b pb-2">
                <h3 className="text-xs font-black text-natural-dark flex items-center gap-1.5">
                  <span className="p-1 bg-indigo-50 text-indigo-700 rounded text-[10px]">📦</span>
                  <span>ملزومات و مواد مصرفی کالیبره‌شده بخش تأسیسات (فیلترها، شناساگرها و محلول‌ها)</span>
                </h3>
                <span className="text-[10px] text-natural-text/60 font-sans font-bold">پایش تاریخ ورود، انقضاء و به مصرف رسیدن</span>
              </div>

              {consumables.filter(c => c.department === "facilities").length === 0 ? (
                <p className="text-xs text-natural-text/50 py-2">هیچ ماده مصرفی برای دپارتمان تأسیسات ثبت نشده است.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-right text-xs">
                    <thead>
                      <tr className="border-b border-natural-border/30 text-natural-text/60 font-sans">
                        <th className="pb-2">نام کالا</th>
                        <th className="pb-2">مقدار ورود</th>
                        <th className="pb-2">تاریخ ورود</th>
                        <th className="pb-2">تاریخ مصرف نهایی</th>
                        <th className="pb-2">تاریخ انقضاء</th>
                        <th className="pb-2 text-center">وضعیت</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-natural-border/20">
                      {consumables.filter(c => c.department === "facilities").map(c => {
                        const isExp = c.expiryDate && c.expiryDate < "1405/03/10" && c.status !== "consumed";
                        return (
                          <tr key={c.id}>
                            <td className="py-2.5 font-bold text-natural-dark">
                              <div>{c.itemName}</div>
                              {c.notes && <div className="text-[9px] text-natural-text/60 mt-0.5">{c.notes}</div>}
                            </td>
                            <td className="py-2.5 font-mono">{c.quantity} {c.unit}</td>
                            <td className="py-2.5 font-mono">{c.entryDate}</td>
                            <td className="py-2.5 font-mono">
                              {c.consumptionDate ? (
                                <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded text-[10px]">{c.consumptionDate}</span>
                              ) : (
                                <span className="text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded text-[10px]">در انبار تأسیسات</span>
                              )}
                            </td>
                            <td className="py-2.5 font-mono">
                              {c.expiryDate ? (
                                <span className={isExp ? "text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded text-[10px] font-bold" : ""}>{c.expiryDate}</span>
                              ) : "فاقد انقضا مشخص"}
                            </td>
                            <td className="py-2.5 text-center">
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-black ${
                                c.status === "consumed" ? "bg-emerald-100 text-emerald-950" : isExp ? "bg-rose-100 text-rose-950 animate-pulse" : "bg-sky-100 text-sky-950"
                              }`}>
                                {c.status === "consumed" ? "مصرف‌شده" : isExp ? "منقضی‌شده" : "در انبار"}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 🦈 Unit 2: PROCESSING PLANT */}
      {activeDepartment === "processing" && (
        <div className="space-y-6" id="dept-processing-section">
          <div className="bg-white border border-natural-border p-5 rounded-3xl space-y-2">
            <div className="flex items-center gap-2 text-rose-700 font-extrabold text-xs">
              <Factory size={16} />
              <span>کارگاه استحصال و زنجیره فرآوری صید خاویار دریای خزر</span>
            </div>
            <p className="text-xs text-natural-text leading-relaxed">
              این واحد وظیفه دارد بیومتریک و شناسه‌گذاری RFID پلاک‌ها را در زمان صید و بیهوشی ماهی مادر بررسی و میزان وزن خاویار حاصله از استخرهای مولد را ثبت کند. سیستم بصورت هوشمند نرخ بهره‌وری خاویار فیل‌ماهی (Beluga Harvest Ratio Term) را محاسبه می‌نماید.
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white border border-rose-200/50 p-4 rounded-2xl flex items-center justify-between shadow-xs">
              <div>
                <span className="text-[10px] text-natural-text/60 block">دمای کلین‌روم استحصال</span>
                <span className="text-sm font-black text-rose-900 block mt-1">۱.۸ درجه سانتی‌گراد (بهینه)</span>
              </div>
              <Gauge className="text-rose-700" size={24} />
            </div>

            <div className="bg-white border border-rose-200/50 p-4 rounded-2xl flex items-center justify-between shadow-xs">
              <div>
                <span className="text-[10px] text-natural-text/60 block">میانگین بازده صید خاویار این هفته</span>
                <span className="text-sm font-black text-[#A65D50] block mt-1">۱۶.۳۵٪ از کل بیومس صید</span>
              </div>
              <TrendingUp className="text-rose-600" size={24} />
            </div>

            <div className="bg-white border border-rose-200/50 p-4 rounded-2xl flex items-center justify-between shadow-xs">
              <div>
                <span className="text-[10px] text-natural-text/60 block">ظرفیت انجماد سریع زیر صفر</span>
                <span className="text-sm font-black text-rose-950 block mt-1">-۲۴°C وکیوم پایدار</span>
              </div>
              <CheckCircle2 className="text-rose-600" size={24} />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Harvest form */}
            <div className="bg-white border border-natural-border p-5 rounded-3xl space-y-4">
              <h3 className="text-xs font-black text-[#A65D50] border-b pb-2 flex items-center gap-1.5">
                <Factory size={14} />
                <span>ثبت بچ عیارسنجی و صید فیل‌ماهی</span>
              </h3>

              <form onSubmit={handleAddCaviarBatch} className="space-y-3">
                <div>
                  <label className="text-[10px] font-black text-natural-dark block mb-1 font-sans">شناسه استخر صید شده:</label>
                  <select
                    value={procPoolId}
                    onChange={(e) => setProcPoolId(e.target.value)}
                    className="w-full text-xs font-bold font-sans rounded-xl border border-natural-border p-2 bg-white text-natural-dark cursor-pointer text-right"
                  >
                    <option value="">-- انتخاب استخر تانک صید --</option>
                    {pools.filter(p => p.count > 0).map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name} (نژاد {p.breed} • میانگین وزن {p.avgWeightGrams}g)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[10px] font-black text-natural-dark block mb-1 font-sans">وزن کل ماهی صیدشده (Kg):</label>
                    <input
                      type="number"
                      required
                      value={procSturgeonW}
                      onChange={(e) => setProcSturgeonW(e.target.value)}
                      className="w-full text-xs font-bold rounded-xl border border-natural-border p-2 bg-[#FDFCF8] text-natural-dark text-left font-mono"
                      style={{ direction: 'ltr' }}
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-natural-dark block mb-1 font-sans">وزن خاویار خام رانده (Kg):</label>
                    <input
                      type="number"
                      required
                      step="0.01"
                      value={procCaviarW}
                      onChange={(e) => setProcCaviarW(e.target.value)}
                      className="w-full text-xs font-bold rounded-xl border border-natural-border p-2 bg-[#FDFCF8] text-natural-dark text-left font-mono"
                      style={{ direction: 'ltr' }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[10px] font-black text-natural-dark block mb-1 font-sans">درصد نمک خاویاری:</label>
                    <select
                      value={procSalt}
                      onChange={(e) => setProcSalt(e.target.value)}
                      className="w-full text-[10px] font-bold font-sans rounded-xl border border-natural-border p-2 bg-white text-natural-dark text-right cursor-pointer"
                    >
                      <option value="3.2% Malossol">۳.۲٪ نمک ملوکول (لوکس)</option>
                      <option value="3.5% Traditional">۳.۵٪ نمک سنتی ایرانی</option>
                      <option value="4.0% Standard">۴٪ غلیظ نگهدارنده شیلات</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-natural-dark block mb-1 font-sans">گرید کیفی خاویار:</label>
                    <select
                      value={procGrade}
                      onChange={(e) => setProcGrade(e.target.value)}
                      className="w-full text-[10px] font-bold font-sans rounded-xl border border-natural-border p-2 bg-white text-natural-dark text-right cursor-pointer"
                    >
                      <option value="Imperial Premium">امپریال پریمیوم فیل‌ماهی</option>
                      <option value="Royal Golden">رویال طلایی آسترا</option>
                      <option value="Classic Beluga">بلبل دانه درشت یکدست</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-natural-dark block mb-1 font-sans font-black">یادداشت بیومتریک و کد بچ:</label>
                  <input
                    type="text"
                    value={procNotes}
                    onChange={(e) => setProcNotes(e.target.value)}
                    placeholder="دامنه خاکستری، ابعاد دانه روی کاغذ آزمایش، کد تراکت..."
                    className="w-full text-xs font-bold rounded-xl border border-natural-border p-2 bg-[#FDFCF8] text-natural-dark text-right"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-rose-700 hover:bg-rose-800 text-white rounded-xl text-xs font-semibold font-sans transition-all cursor-pointer flex items-center justify-center gap-1"
                >
                  <Plus size={14} />
                  ثبت بچ فرآوری خاویار
                </button>
              </form>
            </div>

            {/* Harvest table */}
            <div className="bg-white border border-natural-border p-5 rounded-3xl lg:col-span-2 space-y-4">
              <h3 className="text-xs font-black text-natural-dark border-b pb-2 flex items-center gap-1.5">
                <Clock size={14} className="text-rose-700" />
                <span>کارشناس کنترل فرآوری دوز خاویار سالن‌ها</span>
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead>
                    <tr className="border-b border-natural-border text-natural-text/60">
                      <th className="pb-3 pt-1">شناسه صید</th>
                      <th className="pb-3 pt-1">استخر مبدأ</th>
                      <th className="pb-3 pt-1">بیومس ماهی مادر</th>
                      <th className="pb-3 pt-1">خاویار استخراجی</th>
                      <th className="pb-3 pt-1">بهره‌وری صید</th>
                      <th className="pb-3 pt-1">گرید نمک سود</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-natural-border/30">
                    {caviarBatches.map((batch) => (
                      <tr key={batch.id} className="hover:bg-natural-khaki/10">
                        <td className="py-3 font-mono font-black text-[#A65D50]">{batch.id}</td>
                        <td className="py-3 font-bold text-natural-dark">{pools.find(p => p.id === batch.poolId)?.name || batch.poolId}</td>
                        <td className="py-3 font-mono font-bold text-natural-text">{batch.sturgeonWeightKg} Kg</td>
                        <td className="py-3 font-mono font-black text-rose-800">{batch.caviarWeightKg} Kg</td>
                        <td className="py-3 font-mono text-[#0A5C36] font-extrabold">{batch.yieldPercent}%</td>
                        <td className="py-3 text-[10.5px]">
                          <span className="block font-bold text-natural-dark">{batch.grade}</span>
                          <span className="block text-[9px] text-[#A65D50] mt-0.5">{batch.saltPercent}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 📦 مواد مصرفی و پایش تاریخ انقضای ملزومات فرآوری */}
            <div className="bg-white border border-natural-border p-5 rounded-3xl space-y-4">
              <div className="flex justify-between items-center border-b pb-2">
                <h3 className="text-xs font-black text-natural-dark flex items-center gap-1.5">
                  <span className="p-1 bg-rose-50 text-rose-700 rounded text-[10px]">📦</span>
                  <span>ملزومات و مواد مصرفی کالیبره‌شده کارگاه فرآوری (نمک، ظروف و مواد استریل)</span>
                </h3>
                <span className="text-[10px] text-natural-text/60 font-sans font-bold">پایش تاریخ ورود، انقضاء و به مصرف رسیدن</span>
              </div>

              {consumables.filter(c => c.department === "processing").length === 0 ? (
                <p className="text-xs text-natural-text/50 py-2">هیچ ماده مصرفی برای دپارتمان فرآوری صید ثبت نشده است.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-right text-xs">
                    <thead>
                      <tr className="border-b border-natural-border/30 text-natural-text/60 font-sans">
                        <th className="pb-2">نام کالا</th>
                        <th className="pb-2">مقدار ورود</th>
                        <th className="pb-2">تاریخ ورود</th>
                        <th className="pb-2">تاریخ مصرف نهایی</th>
                        <th className="pb-2">تاریخ انقضاء</th>
                        <th className="pb-2 text-center">وضعیت</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-natural-border/20">
                      {consumables.filter(c => c.department === "processing").map(c => {
                        const isExp = c.expiryDate && c.expiryDate < "1405/03/10" && c.status !== "consumed";
                        return (
                          <tr key={c.id}>
                            <td className="py-2.5 font-bold text-natural-dark">
                              <div>{c.itemName}</div>
                              {c.notes && <div className="text-[9px] text-natural-text/60 mt-0.5">{c.notes}</div>}
                            </td>
                            <td className="py-2.5 font-mono">{c.quantity} {c.unit}</td>
                            <td className="py-2.5 font-mono">{c.entryDate}</td>
                            <td className="py-2.5 font-mono">
                              {c.consumptionDate ? (
                                <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded text-[10px]">{c.consumptionDate}</span>
                              ) : (
                                <span className="text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded text-[10px]">در انبار فرآوری</span>
                              )}
                            </td>
                            <td className="py-2.5 font-mono">
                              {c.expiryDate ? (
                                <span className={isExp ? "text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded text-[10px] font-bold" : ""}>{c.expiryDate}</span>
                              ) : "فاقد انقضا مشخص"}
                            </td>
                            <td className="py-2.5 text-center">
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-black ${
                                c.status === "consumed" ? "bg-emerald-100 text-emerald-950" : isExp ? "bg-rose-100 text-rose-955 animate-pulse" : "bg-sky-100 text-sky-955"
                              }`}>
                                {c.status === "consumed" ? "مصرف‌شده" : isExp ? "منقضی‌شده" : "در انبار"}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 🌾 Unit 3: FEED MILL SECTION */}
      {activeDepartment === "feedmill" && (
        <div className="space-y-6" id="dept-feedmill-section">
          <div className="bg-white border border-natural-border p-5 rounded-3xl space-y-2">
            <div className="flex items-center gap-2 text-emerald-800 font-extrabold text-xs">
              <Wheat size={16} />
              <span>کارخانه پلت‌سازی اختصاصی فارم (بچینگ و اکستروژن خوراک)</span>
            </div>
            <p className="text-xs text-natural-text leading-relaxed">
              تصفیه و بچینگ مواد اولیه آرد ماهی، مکمل‌های ویتامینه هیدرولیز شده و روغن کلزا استخراج شده جهت رشد لارو و مولدین نرسری. پلت‌های خروجی مستقیسا با درصد رطوبت استاندارد اندازه‌گیری و تریل انبار می‌شوند.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white border border-emerald-200/50 p-4 rounded-2xl flex items-center justify-between shadow-xs">
              <div>
                <span className="text-[10px] text-natural-text/60 block">دمای دای و سیلندر اکسترودر</span>
                <span className="text-sm font-black text-emerald-900 block mt-1">۱۱۸°C (نرمال)</span>
              </div>
              <Cpu className="text-emerald-700" size={24} />
            </div>

            <div className="bg-white border border-emerald-200/50 p-4 rounded-2xl flex items-center justify-between shadow-xs">
              <div>
                <span className="text-[10px] text-natural-text/60 block">درصد رطوبت نهایی پلت</span>
                <span className="text-sm font-black text-emerald-900 block mt-1">۶.۸٪ (محدوده بهینه)</span>
              </div>
              <Gauge className="text-emerald-700" size={24} />
            </div>

            <div className="bg-white border border-emerald-200/50 p-4 rounded-2xl flex items-center justify-between shadow-xs">
              <div>
                <span className="text-[10px] text-natural-text/60 block">تولیدات متراکم این قرن</span>
                <span className="text-sm font-black text-[#0A5C36] block mt-1">۱۴.۵ تن محصول نهایی</span>
              </div>
              <TrendingUp className="text-emerald-700" size={24} />
            </div>

            <div className="bg-white border border-emerald-200/50 p-4 rounded-2xl flex items-center justify-between shadow-xs">
              <div>
                <span className="text-[10px] text-natural-text/60 block">ظرفیت بار خروجی سیلوی شماره ۱</span>
                <span className="text-sm font-black text-emerald-950 block mt-1">۸,۲۰۰ کیلوگرم آرد بومی</span>
              </div>
              <Boxes className="text-emerald-800" size={24} />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Feed Batch Creation */}
            <div className="bg-white border border-natural-border p-5 rounded-3xl space-y-4">
              <h3 className="text-xs font-black text-[#0A5C36] border-b pb-2 flex items-center gap-1.5">
                <Wheat size={14} />
                <span>ثبت فرمولاسیون پلت‌سازی خوراک</span>
              </h3>

              <form onSubmit={handleAddFeedBatch} className="space-y-3">
                <div>
                  <label className="text-[10px] font-black text-natural-dark block mb-1">اندازه پلت خروجی (Pellet Size):</label>
                  <select
                    value={fdSize}
                    onChange={(e) => setFdSize(e.target.value)}
                    className="w-full text-xs font-bold font-sans rounded-xl border border-natural-border p-2 bg-white text-natural-dark text-right"
                  >
                    <option value="1.2mm (مخصوص نرسری)">۱.۲ میلی‌متری (لاروی نرسری)</option>
                    <option value="2.0mm (پیش‌پروار)">۲.۰ میلی‌متری (سالن پیش‌پروار)</option>
                    <option value="3.0mm (پروار عمومی)">۳.۰ میلی‌متری (سالن پروار)</option>
                    <option value="5.0mm (مولدین سنگین)">۵.۰ میلی‌متری (جیره کلسیمی سنگین)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[10px] font-black text-natural-dark block mb-1">نهاده پودر خام مصرفی (Kg):</label>
                    <input
                      type="number"
                      required
                      value={fdRaw}
                      onChange={(e) => setFdRaw(e.target.value)}
                      className="w-full text-xs font-bold rounded-xl border border-natural-border p-2 bg-[#FDFCF8] text-natural-dark text-left font-mono"
                      style={{ direction: 'ltr' }}
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-natural-dark block mb-1">پلت خالص تولیدی (Kg):</label>
                    <input
                      type="number"
                      required
                      value={fdOut}
                      onChange={(e) => setFdOut(e.target.value)}
                      className="w-full text-xs font-bold rounded-xl border border-natural-border p-2 bg-[#FDFCF8] text-natural-dark text-left font-mono"
                      style={{ direction: 'ltr' }}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-natural-dark block mb-1">گرید جیره و درصد آنالیز ترکیبات:</label>
                  <input
                    type="text"
                    value={fdGrade}
                    onChange={(e) => setFdGrade(e.target.value)}
                    className="w-full text-xs font-bold rounded-xl border border-natural-border p-2.5 bg-[#FDFCF8] text-natural-dark text-right"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black text-natural-dark block mb-1">متصدی شیفت کارخانه خوراک:</label>
                  <input
                    type="text"
                    value={fdOperator}
                    onChange={(e) => setFdOperator(e.target.value)}
                    className="w-full text-xs font-bold rounded-xl border border-natural-border p-2 bg-[#FDFCF8] text-natural-dark text-right"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1"
                >
                  <Plus size={14} />
                  انتقال بچ تولیدی به شبکه سیلویی
                </button>
              </form>
            </div>

            {/* Feed Batch History */}
            <div className="bg-white border border-natural-border p-5 rounded-3xl lg:col-span-2 space-y-4">
              <h3 className="text-xs font-black text-natural-dark border-b pb-2 flex items-center gap-1.5">
                <Clock size={14} className="text-emerald-700" />
                <span>آرشیو پچ‌های کلاسبندی اکسترودر خوراک فارم</span>
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead>
                    <tr className="border-b border-natural-border text-natural-text/60">
                      <th className="pb-3 pt-1">شماره بچ</th>
                      <th className="pb-3 pt-1">تاریخ اکسترود</th>
                      <th className="pb-3 pt-1">مدل پلت نهایی</th>
                      <th className="pb-3 pt-1">نهاده ورودی</th>
                      <th className="pb-3 pt-1">پلت تولیدی</th>
                      <th className="pb-3 pt-1">آنالیز فنی جیره</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-natural-border/30">
                    {feedBatches.map((batch) => (
                      <tr key={batch.id} className="hover:bg-natural-khaki/10">
                        <td className="py-3 font-mono font-bold text-natural-dark">{batch.id}</td>
                        <td className="py-3 font-mono text-natural-text/80">{batch.date}</td>
                        <td className="py-3 font-bold text-emerald-950">{batch.pelletSize}</td>
                        <td className="py-3 font-mono text-natural-text">{batch.rawMaterialKg} Kg</td>
                        <td className="py-3 font-mono font-black text-emerald-800">{batch.outputKg} Kg</td>
                        <td className="py-3 text-[10.5px]">
                          <span className="block font-bold text-natural-dark">{batch.grade}</span>
                          <span className="block text-[9px] text-natural-text/50 mt-0.5">اپراتور: {batch.operator}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 📦 مواد مصرفی و پایش تاریخ انقضای ملزومات کارخانه خوراک */}
            <div className="bg-white border border-natural-border p-5 rounded-3xl space-y-4">
              <div className="flex justify-between items-center border-b pb-2">
                <h3 className="text-xs font-black text-natural-dark flex items-center gap-1.5">
                  <span className="p-1 bg-emerald-50 text-emerald-700 rounded text-[10px]">📦</span>
                  <span>ملزومات و مواد مصرفی کالیبره‌شده کارخانه خوراک (مکمل‌ها، ویتامین‌ها و آنزیم‌ها)</span>
                </h3>
                <span className="text-[10px] text-natural-text/60 font-sans font-bold">پایش تاریخ ورود، انقضاء و به مصرف رسیدن</span>
              </div>

              {consumables.filter(c => c.department === "feedmill").length === 0 ? (
                <p className="text-xs text-natural-text/50 py-2">هیچ ماده مصرفی برای دپارتمان کارخانه خوراک ثبت نشده است.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-right text-xs">
                    <thead>
                      <tr className="border-b border-natural-border/30 text-natural-text/60 font-sans">
                        <th className="pb-2">نام کالا</th>
                        <th className="pb-2">مقدار ورود</th>
                        <th className="pb-2">تاریخ ورود</th>
                        <th className="pb-2">تاریخ مصرف نهایی</th>
                        <th className="pb-2">تاریخ انقضاء</th>
                        <th className="pb-2 text-center">وضعیت</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-natural-border/20">
                      {consumables.filter(c => c.department === "feedmill").map(c => {
                        const isExp = c.expiryDate && c.expiryDate < "1405/03/10" && c.status !== "consumed";
                        return (
                          <tr key={c.id}>
                            <td className="py-2.5 font-bold text-natural-dark">
                              <div>{c.itemName}</div>
                              {c.notes && <div className="text-[9px] text-natural-text/60 mt-0.5">{c.notes}</div>}
                            </td>
                            <td className="py-2.5 font-mono">{c.quantity} {c.unit}</td>
                            <td className="py-2.5 font-mono">{c.entryDate}</td>
                            <td className="py-2.5 font-mono">
                              {c.consumptionDate ? (
                                <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded text-[10px]">{c.consumptionDate}</span>
                              ) : (
                                <span className="text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded text-[10px]">در انبار کارخانه خوراک</span>
                              )}
                            </td>
                            <td className="py-2.5 font-mono">
                              {c.expiryDate ? (
                                <span className={isExp ? "text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded text-[10px] font-bold" : ""}>{c.expiryDate}</span>
                              ) : "فاقد انقضا مشخص"}
                            </td>
                            <td className="py-2.5 text-center">
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-black ${
                                c.status === "consumed" ? "bg-emerald-100 text-emerald-950" : isExp ? "bg-rose-100 text-rose-955 animate-pulse" : "bg-sky-100 text-sky-955"
                              }`}>
                                {c.status === "consumed" ? "مصرف‌شده" : isExp ? "منقضی‌شده" : "در انبار"}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 📦 Unit 4: WAREHOUSE & INVENTORY */}
      {activeDepartment === "inventory" && (
        <div className="space-y-6" id="dept-inventory-section">
          <div className="bg-white border border-natural-border p-5 rounded-3xl space-y-2">
            <div className="flex items-center gap-2 text-indigo-700 font-extrabold text-xs">
              <Warehouse size={16} />
              <span>مدیریت یکپارچه انبار مرکزی شیلات و تدارکات استخرها</span>
            </div>
            <p className="text-xs text-natural-text leading-relaxed">
              پایش بلادرنگ قفسه‌ها، کسری‌های جیره غذایی سالیز، بافرهای اکسیژنی کمکی، نمک کلسیمی زاپاس و سایر نهاده‌های زنده نرسری فارم جهت تداوم تضمین غلظت‌های هیدرولیکی.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Shelf Stock View */}
            <div className="bg-white border border-natural-border p-5 rounded-3xl space-y-4">
              <h3 className="text-xs font-black text-natural-dark border-b pb-2 flex items-center gap-1.5">
                <Boxes size={15} className="text-indigo-600" />
                <span>موجودی قفسه‌ها و انبارهای کارگاه کلاسترنخست</span>
              </h3>

              <div className="space-y-3">
                {Object.entries(inventoryStock).map(([item, qty]) => {
                  const isLow = (qty as number) < 100;
                  return (
                    <div key={item} className="flex justify-between items-center p-3 rounded-2xl bg-natural-khaki/30 border border-natural-border/40 hover:bg-natural-khaki/50 transition-all">
                      <div className="flex items-center gap-2 text-right">
                        <span className={`w-2.5 h-2.5 rounded-full ${isLow ? "bg-rose-500 animate-ping" : "bg-emerald-500"}`} />
                        <span className="text-xs font-bold text-natural-dark font-sans">{item}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-natural-dark font-black">{(qty as any).toLocaleString("fa-IR")}</span>
                        {isLow && <span className="text-[8px] bg-rose-100 text-rose-900 border border-rose-200 px-1.5 py-0.5 rounded font-bold">کسری!</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Ledger Logging Form */}
            <div className="bg-white border border-natural-border p-5 rounded-3xl space-y-4">
              <h3 className="text-xs font-black text-indigo-900 border-b pb-2 flex items-center gap-1.5">
                <Warehouse size={14} />
                <span>صدور قبض حواله خروج و رسید ورود کالا به انبار شیلاتی</span>
              </h3>

              <form onSubmit={handleAddInventoryLog} className="space-y-3">
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[10px] font-black text-natural-dark block mb-1">نوع مغایرت انبار:</label>
                    <select
                      value={invAction}
                      onChange={(e) => setInvAction(e.target.value as "add" | "remove")}
                      className="w-full text-[10.5px] font-bold font-sans rounded-xl border border-natural-border p-2 bg-white text-natural-dark text-right cursor-pointer"
                    >
                      <option value="add">📥 رسید ورود (افزایش موجودی)</option>
                      <option value="remove">📤 حواله خروج (کاهش موجودی)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-natural-dark block mb-1 font-sans font-black">مقدار عددی تراکنش:</label>
                    <input
                      type="number"
                      required
                      value={invQty}
                      onChange={(e) => setInvQty(e.target.value)}
                      className="w-full text-xs font-bold rounded-xl border border-natural-border p-2 bg-[#FDFCF8] text-natural-dark text-left font-mono"
                      style={{ direction: 'ltr' }}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-natural-dark block mb-1 font-sans font-black">انتخاب ردیف کاردکس کالا:</label>
                  <select
                    value={invItem}
                    onChange={(e) => setInvItem(e.target.value)}
                    className="w-full text-[10.5px] font-bold font-sans rounded-xl border border-natural-border p-2.5 bg-white text-natural-dark text-right cursor-pointer"
                  >
                    {Object.keys(inventoryStock).map(k => (
                      <option key={k} value={k}>{k}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-black text-natural-dark block mb-1">توضیح، شماره سند یا شماره استخر مقصد:</label>
                  <input
                    type="text"
                    required
                    value={invReason}
                    onChange={(e) => setInvReason(e.target.value)}
                    placeholder="مثال: حواله خوراک نرسری استخر شماره ۱۰۳"
                    className="w-full text-xs font-bold rounded-xl border border-natural-border p-2.5 bg-[#FDFCF8] text-natural-dark text-right"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black text-natural-dark block mb-1">متصدی و کارپرداز انبار:</label>
                  <input
                    type="text"
                    value={invOp}
                    onChange={(e) => setInvOp(e.target.value)}
                    className="w-full text-xs font-bold rounded-xl border border-natural-border p-2 bg-[#FDFCF8] text-natural-dark text-right"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-indigo-700 hover:bg-indigo-800 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Plus size={14} />
                  صدور سند و ممهور کردن حواله در کاردکس
                </button>
              </form>
            </div>
          </div>

          {/* Table Logs */}
          <div className="bg-white border border-natural-border p-5 rounded-3xl space-y-4">
            <h3 className="text-xs font-black text-natural-dark border-b pb-2 flex items-center gap-1.5">
              <Clock size={14} className="text-indigo-600" />
              <span>ریز کاردکس تاریخی ورودی‌ها و خروجی‌های تدارکاتی فارم</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="border-b border-natural-border text-natural-text/60">
                    <th className="pb-3 pt-1">ردیف سند</th>
                    <th className="pb-3 pt-1">تاریخ صدور</th>
                    <th className="pb-3 pt-1">تراکنش کاردکس</th>
                    <th className="pb-3 pt-1">شناسه و عنوان نهاده</th>
                    <th className="pb-3 pt-1">مقدار متغیر</th>
                    <th className="pb-3 pt-1">بستر مصرفی / علت تراکنش</th>
                    <th className="pb-3 pt-1">مسئول انبار</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-natural-border/30">
                  {inventoryLogs.map(log => (
                    <tr key={log.id} className="hover:bg-natural-khaki/10">
                      <td className="py-3 font-mono font-bold text-natural-dark">{log.id}</td>
                      <td className="py-3 font-mono text-natural-text/80">{log.date}</td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black ${
                          log.action === "add" ? "bg-emerald-100 text-emerald-950" : "bg-rose-100 text-rose-950"
                        }`}>
                          {log.action === "add" ? "📥 رسید ورود" : "📤 حواله خروج"}
                        </span>
                      </td>
                      <td className="py-3 font-bold text-natural-dark">{log.itemName}</td>
                      <td className="py-3 font-mono font-black text-natural-dark">
                        {log.action === "add" ? "+" : "-"}{log.quantity.toLocaleString("fa-IR")}
                      </td>
                      <td className="py-3 text-[11px] text-natural-text font-medium">{log.reason}</td>
                      <td className="py-3 text-natural-text/70">{log.operator}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 📦 دپارتمان تدارکات و انقضای مواد مصرفی کل بخش‌ها */}
          <div className="bg-gradient-to-br from-indigo-50/50 to-white border border-indigo-150 p-6 rounded-3xl space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-4 border-indigo-100">
              <div>
                <div className="flex items-center gap-2 text-indigo-900 font-extrabold text-sm">
                  <span className="p-1 bg-indigo-100 text-indigo-700 rounded-lg">📦</span>
                  <span>سامانه مدیریت و پایش تاریخ انقضای ملزومات و مواد مصرفی کل مزارع</span>
                </div>
                <p className="text-xs text-natural-text mt-1.5 leading-relaxed">
                  ثبت مستقل زمان‌بندی ورود، کالیبراسیون انقضاء، و تاریخ به مصرف‌رسیدن واقعی مکمل‌ها، معرف‌های گندزدایی و تگ‌های تبارگر با همپوشانی مستقیم بخش‌ها.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold bg-amber-100 text-amber-900 px-2.5 py-1 rounded-full animate-pulse">
                  ⚠️ پایش هوشمند دوره‌ای فعال است
                </span>
              </div>
            </div>

            {/* Quick Warning Metric Boxes if any item is expired or near expiry */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white border border-rose-200 p-4 rounded-2xl flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-black text-lg">
                  {consumables.filter(c => c.status === "expired" || (c.expiryDate && c.expiryDate < "1405/03/10" && c.status !== "consumed")).length}
                </div>
                <div>
                  <span className="text-[10px] text-natural-text block">اقلام منقضی شده (نیازمند امحاء یا تعویض)</span>
                  <span className="text-xs font-black text-rose-700">اقلام غیرقابل استفاده</span>
                </div>
              </div>

              <div className="bg-white border border-amber-200 p-4 rounded-2xl flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-black text-lg">
                  {consumables.filter(c => c.status === "available" && c.expiryDate && c.expiryDate >= "1405/03/10" && c.expiryDate <= "1405/04/10").length}
                </div>
                <div>
                  <span className="text-[10px] text-natural-text block">اقلام در آستانه انقضاء (کمتر از ۳۰ روز آینده)</span>
                  <span className="text-xs font-black text-amber-700">نیازمند مصرف فوری</span>
                </div>
              </div>

              <div className="bg-white border border-emerald-100 p-4 rounded-2xl flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black text-lg">
                  {consumables.filter(c => c.status === "consumed").length}
                </div>
                <div>
                  <span className="text-[10px] text-natural-text block">کل اقلام به مصرف نهایی رسیده (بایگانی)</span>
                  <span className="text-xs font-black text-emerald-700 font-sans">تکمیل فرآیند زنجیره ارزش</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Form Card */}
              <div className="bg-white border border-natural-border p-5 rounded-2xl shadow-xs space-y-4">
                <h4 className="text-xs font-black text-indigo-900 border-b pb-2 flex items-center gap-1.5">
                  <Plus size={14} />
                  <span>ثبت و تحویل یکپارچه مصرفی جدید</span>
                </h4>

                <form onSubmit={handleAddConsumable} className="space-y-3.5">
                  <div>
                    <label className="text-[10px] font-black text-natural-dark block mb-1">نام یا شناسه ملزومات مصرفی:</label>
                    <input
                      type="text"
                      required
                      value={conName}
                      onChange={(e) => setConName(e.target.value)}
                      placeholder="مثال: واکسن دوز تقویت فیل‌ماهی"
                      className="w-full text-xs font-bold rounded-xl border border-natural-border p-2 bg-[#FDFCF8] text-natural-dark text-right"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-black text-natural-dark block mb-1">دپارتمان متبوع:</label>
                      <select
                        value={conDept}
                        onChange={(e) => setConDept(e.target.value as any)}
                        className="w-full text-[10px] font-bold rounded-xl border border-natural-border p-2 bg-white text-natural-dark cursor-pointer text-right"
                      >
                        <option value="facilities">تأسیسات</option>
                        <option value="processing">کارگاه فرآوری</option>
                        <option value="feedmill">کارخانه خوراک</option>
                        <option value="inventory">انبار مرکزی</option>
                        <option value="accounting">حسابداری مالی</option>
                        <option value="security">نگهبانی حراست</option>
                        <option value="coldstorage">سردخانه مرکزی</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-black text-natural-dark block mb-1">واحد اندازه‌گیری:</label>
                      <input
                        type="text"
                        required
                        value={conUnit}
                        onChange={(e) => setConUnit(e.target.value)}
                        placeholder="کیلوگرم، عدد، دوز"
                        className="w-full text-xs font-bold rounded-xl border border-natural-border p-2 bg-[#FDFCF8] text-natural-dark text-right"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-black text-natural-dark block mb-1">مقدار شمارش شده:</label>
                      <input
                        type="number"
                        required
                        value={conQty}
                        onChange={(e) => setConQty(e.target.value)}
                        className="w-full text-xs font-bold rounded-xl border border-natural-border p-2 bg-white font-mono text-left"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-black text-natural-dark block mb-1">تاریخ ورود به بخش:</label>
                      <input
                        type="text"
                        required
                        value={conEntryDate}
                        onChange={(e) => setConEntryDate(e.target.value)}
                        className="w-full text-xs font-bold rounded-xl border border-natural-border p-2 bg-[#FDFCF8] text-natural-dark font-mono text-center"
                      />
                    </div>
                  </div>

                  {/* Expiration date toggle */}
                  <div className="bg-slate-50/70 p-2.5 rounded-xl border border-slate-100 space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer text-[10px] font-black text-natural-dark">
                      <input
                        type="checkbox"
                        checked={hasExpiry}
                        onChange={(e) => setHasExpiry(e.target.checked)}
                        className="rounded border-natural-border text-indigo-600 focus:ring-0 cursor-pointer"
                      />
                      <span>دارای تاریخ انقضاء معین است</span>
                    </label>

                    {hasExpiry && (
                      <div className="space-y-1">
                        <span className="text-[8px] text-natural-text block text-right">تاریخ دقیق انقضاء کالای فوق:</span>
                        <input
                          type="text"
                          value={conExpiryDate}
                          onChange={(e) => setConExpiryDate(e.target.value)}
                          placeholder="مثال: 1405/12/29"
                          className="w-full text-xs font-bold rounded-lg border border-natural-border p-1.5 bg-white font-mono text-center"
                        />
                      </div>
                    )}
                  </div>

                  {/* Consumption date toggle */}
                  <div className="bg-slate-50/70 p-2.5 rounded-xl border border-slate-100 space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer text-[10px] font-black text-natural-dark">
                      <input
                        type="checkbox"
                        checked={hasConsumed}
                        onChange={(e) => setHasConsumed(e.target.checked)}
                        className="rounded border-natural-border text-indigo-600 focus:ring-0 cursor-pointer"
                      />
                      <span>ثبت فوری به عنوان مصرف‌شده</span>
                    </label>

                    {hasConsumed && (
                      <div className="space-y-1">
                        <span className="text-[8px] text-natural-text block text-right">تاریخ مصرف شده:</span>
                        <input
                          type="text"
                          value={conConsumedDate}
                          onChange={(e) => setConConsumedDate(e.target.value)}
                          placeholder="مثال: 1405/03/10"
                          className="w-full text-xs font-bold rounded-lg border border-natural-border p-1.5 bg-white font-mono text-center"
                        />
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 gap-2">
                    <div>
                      <label className="text-[10px] font-black text-natural-dark block mb-1">مسئول دپارتمان ثبت‌کننده:</label>
                      <input
                        type="text"
                        value={conOp}
                        onChange={(e) => setConOp(e.target.value)}
                        className="w-full text-xs font-bold rounded-xl border border-natural-border p-2 bg-[#FDFCF8] text-natural-dark text-right"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-black text-natural-dark block mb-1 font-black">یادداشت کیفیت یا شرایط خاص نگهداری:</label>
                      <input
                        type="text"
                        value={conNotes}
                        onChange={(e) => setConNotes(e.target.value)}
                        placeholder="توضیحات تکمیلی..."
                        className="w-full text-xs font-bold rounded-xl border border-natural-border p-2 bg-[#FDFCF8] text-natural-dark text-right"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-indigo-700 hover:bg-indigo-800 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Plus size={14} />
                    ثبت تاریخی در دفتر مصرفی‌های کل بخش‌ها
                  </button>
                </form>
              </div>

              {/* List Card */}
              <div className="lg:col-span-2 bg-white border border-natural-border p-5 rounded-2xl shadow-xs space-y-4">
                <div className="flex justify-between items-center border-b pb-2">
                  <h4 className="text-xs font-black text-natural-dark flex items-center gap-1.5">
                    <Boxes size={14} className="text-indigo-600" />
                    <span>دفتر مانیتورینگ جامع و ثبت تاریخ انقضای ملزومات</span>
                  </h4>
                  <span className="text-[9px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-sm">
                    {consumables.length} ردیف کل
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-right text-xs">
                    <thead>
                      <tr className="border-b border-natural-border text-natural-text/60 font-sans font-black">
                        <th className="pb-2">عنوان ماده مصرفی</th>
                        <th className="pb-2">بخش متبوع</th>
                        <th className="pb-2">مقدار ورود</th>
                        <th className="pb-2">تاریخ ورود</th>
                        <th className="pb-2">تاریخ مصرف واقعی</th>
                        <th className="pb-2">تاریخ انقضاء کالا</th>
                        <th className="pb-2 text-center">وضعیت</th>
                        <th className="pb-2 text-center">عملیات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-natural-border/30">
                      {consumables.map(c => {
                        const isExpiredNow = c.status === "expired" || (c.expiryDate && c.expiryDate < "1405/03/10" && c.status !== "consumed");
                        return (
                          <tr key={c.id} className="hover:bg-natural-khaki/10">
                            <td className="py-3">
                              <div className="font-bold text-natural-dark text-[11.5px]">{c.itemName}</div>
                              {c.notes && <div className="text-[9px] text-natural-text/60 mt-0.5">{c.notes}</div>}
                            </td>
                            <td className="py-3">
                              <span className="text-[9px] font-black bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded-sm">
                                {getDeptLabel(c.department)}
                              </span>
                            </td>
                            <td className="py-3 font-mono font-black text-slate-800">
                              {c.quantity} <span className="text-[9px] font-sans text-natural-text/70">{c.unit}</span>
                            </td>
                            <td className="py-3 font-mono text-natural-text">{c.entryDate}</td>
                            <td className="py-3 font-mono">
                              {c.consumptionDate ? (
                                <span className="text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded-sm text-[10px]">
                                  {c.consumptionDate}
                                </span>
                              ) : (
                                <div className="flex items-center gap-1">
                                  <span className="text-[10px] text-amber-600 font-bold animate-pulse shrink-0">در انبار</span>
                                  <input
                                    type="text"
                                    placeholder="ثبت تاریخ مصرف"
                                    defaultValue="1405/03/10"
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        handleRecordConsumption(c.id, e.currentTarget.value);
                                      }
                                    }}
                                    className="w-18 text-[9px] border p-1 rounded font-mono text-center border-amber-300 focus:outline-hidden"
                                    title="تاریخ مصرف را وارد کرده و اینتر بزنید"
                                  />
                                </div>
                              )}
                            </td>
                            <td className="py-3 font-mono">
                              {c.expiryDate ? (
                                <span className={`font-bold rounded-sm px-1.5 py-0.5 text-[10px] ${
                                  isExpiredNow ? "bg-rose-100 text-rose-800 border border-rose-200" : "bg-indigo-50 text-indigo-800"
                                }`}>
                                  {c.expiryDate}
                                </span>
                              ) : (
                                <span className="text-natural-text/40 text-[9px]">فاقد انقضا مشخص</span>
                              )}
                            </td>
                            <td className="py-3 text-center">
                              {c.status === "consumed" ? (
                                <span className="bg-emerald-100 text-emerald-950 px-1.5 py-0.5 rounded-full text-[9px] font-black">
                                  ✓ مصرف‌شده
                                </span>
                              ) : isExpiredNow ? (
                                <span className="bg-rose-100 text-rose-950 px-1.5 py-0.5 rounded-full text-[9px] font-black animate-pulse">
                                  ⚠️ منقضی‌شده
                                </span>
                              ) : (
                                <span className="bg-sky-100 text-sky-955 px-1.5 py-0.5 rounded-full text-[9px] font-black">
                                  ● غیراستعمال
                                </span>
                              )}
                            </td>
                            <td className="py-3 text-center">
                              <button
                                onClick={() => handleDeleteConsumable(c.id)}
                                className="text-rose-600 hover:text-red-800 p-1 hover:bg-rose-50 rounded cursor-pointer"
                                title="حذف رکورد"
                              >
                                <Trash2 size={13} />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeDepartment === "accounting" && (
        <div className="space-y-6" id="dept-accounting-section">
          <OfficeAccountingSuite />
          <div className="bg-white border border-natural-border p-5 rounded-3xl space-y-2">
            <div className="flex items-center gap-2 text-amber-600 font-extrabold text-xs">
              <Coins size={16} />
              <span>سامانه حسابداری، بهای تمام‌شده بیوماس و ترازنامه مالی مزارع فیل‌ماهی</span>
            </div>
            <p className="text-xs text-natural-text leading-relaxed">
              ثبت فاکتورهای ورودی مکمل، دستمزد کارشناسان و برآوردهای ارزش کل زیستی بیوماس شناور مزارع برحسب کیلوگرم جهت بررسی حاشیه سود نهایی صادرات.
            </p>
          </div>

          {/* Ledger Stats Summary Box */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white border border-amber-200/50 p-4 rounded-2xl shadow-xs">
              <span className="text-[10px] text-natural-text/60 block">درآمد ناخالص کلی (از آرشیو فاکتورها)</span>
              <strong className="text-lg font-black text-emerald-800 block mt-2 font-mono" style={{ direction: 'ltr' }}>
                {(financials.filter(f => f.type === "income").reduce((acc, f) => acc + f.amountToman, 0)).toLocaleString("fa-IR")} تومان
              </strong>
            </div>

            <div className="bg-white border border-amber-200/50 p-4 rounded-2xl shadow-xs">
              <span className="text-[10px] text-natural-text/60 block">هزینه‌های شیلاتی (نهاده، برق، بهداشت)</span>
              <strong className="text-lg font-black text-rose-800 block mt-2 font-mono" style={{ direction: 'ltr' }}>
                {(financials.filter(f => f.type === "expense").reduce((acc, f) => acc + f.amountToman, 0)).toLocaleString("fa-IR")} تومان
              </strong>
            </div>

            <div className="bg-white border border-amber-200/50 p-4 rounded-2xl shadow-xs">
              <span className="text-[10px] text-natural-text/60 block">سود عملیاتی خالص فارم</span>
              {(() => {
                const income = financials.filter(f => f.type === "income").reduce((acc, f) => acc + f.amountToman, 0);
                const expense = financials.filter(f => f.type === "expense").reduce((acc, f) => acc + f.amountToman, 0);
                const diff = income - expense;
                return (
                  <strong className={`text-lg font-black block mt-2 font-mono ${diff >= 0 ? "text-emerald-700" : "text-rose-700"}`} style={{ direction: 'ltr' }}>
                    {diff.toLocaleString("fa-IR")} تومان
                  </strong>
                );
              })()}
            </div>

            {/* Core Biomass valuation! */}
            <div className="bg-amber-50 border border-amber-300 p-4 rounded-2xl shadow-xs">
              <span className="text-[10px] text-amber-950 font-black flex items-center justify-between">
                <span>ارزش سرمایه‌ای گله (بیوماس شناور)</span>
                <span className="bg-amber-100 text-amber-900 px-1 py-0.5 rounded text-[8px]">محاسبه هوشمند</span>
              </span>
              <strong className="text-base font-black text-amber-950 block mt-2 font-mono" style={{ direction: 'ltr' }}>
                {totalSturgeonAssetValuationToman.toLocaleString("fa-IR")} تومان
              </strong>
              <span className="text-[8.5px] text-amber-800 block mt-1 leading-none font-bold">مبنا: {totalBiomassOfFarm.toLocaleString("fa-IR")} کیلوگرم بیوماس کل مزارع</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Financial form */}
            <div className="bg-white border border-natural-border p-5 rounded-3xl space-y-4">
              <h3 className="text-xs font-black text-amber-950 border-b pb-2 flex items-center gap-1.5 font-bold">
                <Coins size={14} />
                <span>ثبت سند دریافت، پرداخت و صورت‌حساب</span>
              </h3>

              <form onSubmit={handleAddTransaction} className="space-y-3">
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[10px] font-black text-natural-dark block mb-1">ماهیت حسابداری تراکنش:</label>
                    <select
                      value={finType}
                      onChange={(e) => setFinType(e.target.value as "income" | "expense")}
                      className="w-full text-[10px] font-bold font-sans rounded-xl border border-natural-border p-2 bg-white text-natural-dark text-right cursor-pointer"
                    >
                      <option value="expense">📤 هزینه پرداختی (بدهکار)</option>
                      <option value="income">📥 دریافت درآمد (بستانکار)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-natural-dark block mb-1">دسته‌بندی ذی‌حسابی:</label>
                    <select
                      value={finCat}
                      onChange={(e) => setFinCat(e.target.value)}
                      className="w-full text-[9.5px] font-bold font-sans rounded-xl border border-natural-border p-2 bg-white text-natural-dark text-right cursor-pointer"
                    >
                      <option value="صادرات خاویار">صادرات خاویار</option>
                      <option value="فروش بچه ماهی">فروش بچه ماهی و لارو</option>
                      <option value="خرید نهاده و مکمل">خرید نهاده و مکمل</option>
                      <option value="هزینه برق و تاسیسات آب">هزینه برق و تاسیسات آب</option>
                      <option value="هزینه پرسنلی و کارگاهی">هزینه پرسنلی و کارگاهی</option>
                      <option value="تجهیزات و ابزار دقیق آزمایشگاهی">تجهیزات آزمایشگاهی</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-natural-dark block mb-1 font-sans">مبلغ معامله رسمی (به تومان):</label>
                  <input
                    type="number"
                    required
                    value={finAmt}
                    onChange={(e) => setFinAmt(e.target.value)}
                    className="w-full text-xs font-bold rounded-xl border border-natural-border p-2.5 bg-[#FDFCF8] text-natural-dark text-left font-mono"
                    style={{ direction: 'ltr' }}
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black text-natural-dark block mb-1 font-sans">طرف حساب و توصیف عملیات مالی:</label>
                  <textarea
                    rows={2}
                    value={finDesc}
                    onChange={(e) => setFinDesc(e.target.value)}
                    placeholder="شرح کامل خرید ملوکول نمک، فیش شرکت ملی پخش دیزل یا فاکتور مروارید سیاه..."
                    className="w-full text-xs font-bold rounded-xl border border-natural-border p-2 bg-[#FDFCF8] text-natural-dark text-right"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-amber-700 hover:bg-amber-800 text-white rounded-xl text-xs font-bold font-sans transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Plus size={14} />
                  تایید و الحاق تراکنش مالی به ترازنامه
                </button>
              </form>
            </div>

            {/* Financial Ledger log */}
            <div className="bg-white border border-natural-border p-5 rounded-3xl lg:col-span-2 space-y-4">
              <h3 className="text-xs font-black text-natural-dark border-b pb-2 flex items-center gap-1.5">
                <Clock size={14} className="text-amber-700" />
                <span>دفتر اسناد و فاکتورهای صادره کارخانه شیلات</span>
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead>
                    <tr className="border-b border-natural-border text-natural-text/60">
                      <th className="pb-3 pt-1">کد فاکتور</th>
                      <th className="pb-3 pt-1">تاریخ</th>
                      <th className="pb-3 pt-1">سرفصل حسابداری</th>
                      <th className="pb-3 pt-1">بسترمبادلات و تشریح معامله</th>
                      <th className="pb-3 pt-1 text-left">مبلغ (تومان)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-natural-border/30">
                    {financials.map(trans => (
                      <tr key={trans.id} className="hover:bg-natural-khaki/10">
                        <td className="py-3 font-mono font-bold text-natural-dark">{trans.id}</td>
                        <td className="py-3 font-mono text-natural-text/80">{trans.date}</td>
                        <td className="py-3">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-black shrink-0 flex items-center gap-1 w-max ${
                            trans.type === "income" ? "bg-emerald-100 text-emerald-950" : "bg-rose-100 text-rose-950"
                          }`}>
                            {trans.type === "income" ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                            {trans.category}
                          </span>
                        </td>
                        <td className="py-3 text-[11px] text-natural-text font-medium">{trans.description}</td>
                        <td className={`py-3 font-mono font-black text-left ${trans.type === "income" ? "text-emerald-700" : "text-rose-700"}`} style={{ direction: 'ltr' }}>
                          {trans.type === "income" ? "+" : "-"}{trans.amountToman.toLocaleString("fa-IR")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* 📦 مواد مصرفی و پایش تاریخ انقضای ملزومات حسابداری و فاکتورها */}
          <div className="bg-white border border-natural-border p-5 rounded-3xl space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="text-xs font-black text-natural-dark flex items-center gap-1.5">
                <span className="p-1 bg-amber-50 text-amber-700 rounded text-[10px]">📦</span>
                <span>ملزومات اداری و مصرفی دفتر مرکزی مالی مزارع (کارتریج، دفاتر پلمپ و فرم‌ها)</span>
              </h3>
              <span className="text-[10px] text-natural-text/60 font-sans font-bold">پایش تاریخ ورود، انقضاء و به مصرف رسیدن</span>
            </div>

            {consumables.filter(c => c.department === "accounting").length === 0 ? (
              <p className="text-xs text-natural-text/50 py-2">هیچ ماده مصرفی برای دپارتمان حسابداری ثبت نشده است.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead>
                    <tr className="border-b border-natural-border/30 text-natural-text/60 font-sans">
                      <th className="pb-2">نام کالا</th>
                      <th className="pb-2">مقدار ورود</th>
                      <th className="pb-2">تاریخ ورود</th>
                      <th className="pb-2">تاریخ مصرف نهایی</th>
                      <th className="pb-2">تاریخ انقضاء</th>
                      <th className="pb-2 text-center">وضعیت</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-natural-border/20">
                    {consumables.filter(c => c.department === "accounting").map(c => {
                      const isExp = c.expiryDate && c.expiryDate < "1405/03/10" && c.status !== "consumed";
                      return (
                        <tr key={c.id}>
                          <td className="py-2.5 font-bold text-natural-dark">
                            <div>{c.itemName}</div>
                            {c.notes && <div className="text-[9px] text-natural-text/60 mt-0.5">{c.notes}</div>}
                          </td>
                          <td className="py-2.5 font-mono">{c.quantity} {c.unit}</td>
                          <td className="py-2.5 font-mono">{c.entryDate}</td>
                          <td className="py-2.5 font-mono">
                            {c.consumptionDate ? (
                              <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded text-[10px]">{c.consumptionDate}</span>
                            ) : (
                              <span className="text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded text-[10px]">در انبار مالی</span>
                            )}
                          </td>
                          <td className="py-2.5 font-mono">
                            {c.expiryDate ? (
                              <span className={isExp ? "text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded text-[10px] font-bold" : ""}>{c.expiryDate}</span>
                            ) : "فاقد انقضا مشخص"}
                          </td>
                          <td className="py-2.5 text-center">
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-black ${
                              c.status === "consumed" ? "bg-emerald-100 text-emerald-950" : isExp ? "bg-rose-100 text-rose-955 animate-pulse" : "bg-sky-100 text-sky-955"
                            }`}>
                              {c.status === "consumed" ? "مصرف‌شده" : isExp ? "منقضی‌شده" : "در انبار"}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 🛡️ Unit 6: SECURITY & GUARDHOUSE SECTION */}
      {activeDepartment === "security" && (
        <div className="space-y-6" id="dept-security-section">
          <div className="bg-white border border-natural-border p-5 rounded-3xl space-y-2">
            <div className="flex items-center gap-2 text-emerald-800 font-extrabold text-xs">
              <Shield size={16} />
              <span>پایگاه حراست، دژبانی و پایش سیستم‌های نظارت مغناطیسی (نگهبانی)</span>
            </div>
            <p className="text-xs text-natural-text leading-relaxed">
              کنترل مراجعین کارگاه صید فیل‌ماهی، ثبت تردد کامیون‌های بافر اکسیژنی و نهاده‌های دافنی نرسری، تست پایش فنس الکتریکی حفاظتی دور تا دور مزارع حاشیه ساحلی خاویارسیستم.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white border border-emerald-200/50 p-4 rounded-2xl flex items-center justify-between shadow-xs">
              <div>
                <span className="text-[10px] text-natural-text/60 block">فنس الکتریکی محیطی (Perimeter)</span>
                <span className="text-sm font-black text-emerald-900 block mt-1">مسلح و فعال (۷,۵۰۰V بافر)</span>
              </div>
              <Shield className="text-emerald-750" size={24} />
            </div>

            <div className="bg-white border border-emerald-200/50 p-4 rounded-2xl flex items-center justify-between shadow-xs">
              <div>
                <span className="text-[10px] text-natural-text/60 block">دوربین‌های مداربسته حرارتی</span>
                <span className="text-sm font-black text-emerald-900 block mt-1">۱۶ کانال برخط فعال (دید در شب)</span>
              </div>
              <Cpu className="text-emerald-700" size={24} />
            </div>

            <div className="bg-white border border-emerald-200/50 p-4 rounded-2xl flex items-center justify-between shadow-xs">
              <div>
                <span className="text-[10px] text-natural-text/60 block">آژیر هشدار نشتی هیدرولیک</span>
                <span className="text-sm font-black text-[#0A5C36] block mt-1">سبز / فاقد تداخل ناهنجار</span>
              </div>
              <CheckCircle2 className="text-green-600" size={24} />
            </div>

            <div className="bg-white border border-emerald-200/50 p-4 rounded-2xl flex items-center justify-between shadow-xs">
              <div>
                <span className="text-[10px] text-natural-text/60 block">خط تلفن کارگاهی اضطراری</span>
                <span className="text-sm font-black text-emerald-950 block mt-1">دایورت روی دژبانی ساحلی</span>
              </div>
              <UserCheck className="text-emerald-800" size={24} />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Gate Control register */}
            <div className="bg-white border border-natural-border p-5 rounded-3xl space-y-4">
              <h3 className="text-xs font-black text-emerald-950 border-b pb-2 flex items-center gap-1.5 font-bold">
                <Shield size={14} className="text-emerald-700" />
                <span>ثبت تردد، کالا ورودی و ورود مهمانان در گیت</span>
              </h3>

              <form onSubmit={handleAddSecurityLog} className="space-y-3">
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[10px] font-black text-natural-dark block mb-1">عملیات گیت در ورودی:</label>
                    <select
                      value={secAction}
                      onChange={(e) => setSecAction(e.target.value as "enter" | "exit")}
                      className="w-full text-[10px] font-bold font-sans rounded-xl border border-natural-border p-2 bg-white text-natural-dark text-right cursor-pointer"
                    >
                      <option value="enter">📥 ورود خودرو و چک بار</option>
                      <option value="exit">📤 خروج مأذون مهمان/نهاده</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-natural-dark block mb-1">علت مراجعه به فارم:</label>
                    <select
                      value={secPurpose}
                      onChange={(e) => setSecPurpose(e.target.value)}
                      className="w-full text-[10px] font-bold font-sans rounded-xl border border-natural-border p-2 bg-white text-natural-dark text-right cursor-pointer"
                    >
                      <option value="بارگیری دوز صادراتی خاویار">بارگیری دوز صادراتی خاویار</option>
                      <option value="تخلیه نهاده و دافنی نرسری">تخلیه نهاده و دافنی نرسری</option>
                      <option value="بازرسی دوره‌ای ادارات شیلات">بازرسی دوره‌ای ادارات شیلات</option>
                      <option value="ارائه تدارکات کارگاهی و آرد">ارائه تدارکات کارگاهی و آرد</option>
                      <option value="شخصی / شیفت متفرقه نگهبانی">شخصی / شیفت متفرقه</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-natural-dark block mb-1 font-sans">نام راننده یا فرد ارشد ترددکننده:</label>
                  <input
                    type="text"
                    required
                    value={secName}
                    onChange={(e) => setSecName(e.target.value)}
                    placeholder="مثال: راننده محموله دافنی زاپاس (شریفی)"
                    className="w-full text-xs font-bold rounded-xl border border-natural-border p-2 bg-[#FDFCF8] text-natural-dark text-right"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black text-natural-dark block mb-1 font-sans">شماره پلاک ملی خودرو:</label>
                  <input
                    type="text"
                    required
                    value={secPlate}
                    onChange={(e) => setSecPlate(e.target.value)}
                    placeholder="مثال: ۱۲ ب ۳۴۵ ایران ۲۲"
                    className="w-full text-xs font-bold rounded-xl border border-natural-border p-2 bg-[#FDFCF8] text-natural-dark text-right"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1"
                >
                  <Plus size={14} />
                  صدور مأذون الکترونیکی گیت
                </button>
              </form>
            </div>

            {/* Gate Ledger Logs */}
            <div className="bg-white border border-natural-border p-5 rounded-3xl lg:col-span-2 space-y-4">
              <h3 className="text-xs font-black text-natural-dark border-b pb-2 flex items-center gap-1.5">
                <Clock size={14} className="text-emerald-700" />
                <span>دفتر ثبت تردد خودروهای بارکشی و پرسنل نگهبانی</span>
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead>
                    <tr className="border-b border-natural-border text-natural-text/60">
                      <th className="pb-3 pt-1">رقم شناسه سند</th>
                      <th className="pb-3 pt-1">ساعت ثبت شده</th>
                      <th className="pb-3 pt-1">ماهیت گیت</th>
                      <th className="pb-3 pt-1">نام فرد مسئول</th>
                      <th className="pb-3 pt-1">شماره پلاک ملی</th>
                      <th className="pb-3 pt-1">تشریح علت و جزئیات محموله همراه</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-natural-border/30">
                    {securityLogs.map(log => (
                      <tr key={log.id} className="hover:bg-natural-khaki/10">
                        <td className="py-3 font-mono font-bold text-natural-dark">{log.id}</td>
                        <td className="py-3 font-mono text-natural-text/80">{log.date} {log.time}</td>
                        <td className="py-3">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-black shrink-0 ${
                            log.actionType === "enter" ? "bg-emerald-100 text-emerald-950" : "bg-indigo-100 text-indigo-950"
                          }`}>
                            {log.actionType === "enter" ? "📥 گیت ورود" : "📤 گیت خروج"}
                          </span>
                        </td>
                        <td className="py-3 font-bold text-natural-dark">{log.visitorName}</td>
                        <td className="py-3 font-mono text-[10.5px] font-black text-[#A65D50]">{log.carPlate}</td>
                        <td className="py-3 text-[11px] text-natural-text/80 font-medium">{log.purpose}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Security Consumables Section */}
          <div className="bg-white border border-natural-border p-5 rounded-3xl space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="text-xs font-black text-natural-dark flex items-center gap-1.5 font-bold text-emerald-950">
                <span className="p-1 bg-emerald-50 text-emerald-700 rounded text-[10px]">📦</span>
                <span>تدارکات مصرفی و باتری‌های پشتیبان گیت حراست و نظارت ساحلی</span>
              </h3>
              <span className="text-[10px] text-natural-text/60 font-sans font-bold">رهگیری بدو ورود، مصرف و انقضاء ملزومات امنیتی</span>
            </div>

            {consumables.filter(c => c.department === "security").length === 0 ? (
              <p className="text-xs text-natural-text/50 py-2">هیچ ماده مصرفی برای دپارتمان نگهبانی و حراست ثبت نشده است.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead>
                    <tr className="border-b border-natural-border/30 text-natural-text/60 font-sans">
                      <th className="pb-2">نام کالا</th>
                      <th className="pb-2">مقدار ورود</th>
                      <th className="pb-2">تاریخ ورود</th>
                      <th className="pb-2">تاریخ مصرف نهایی</th>
                      <th className="pb-2">تاریخ انقضاء</th>
                      <th className="pb-2 text-center">وضعیت</th>
                      <th className="pb-2 text-left">عملیات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-natural-border/20">
                    {consumables.filter(c => c.department === "security").map(c => {
                      const isExp = c.expiryDate && c.expiryDate < "1405/03/10" && c.status !== "consumed";
                      return (
                        <tr key={c.id} className="hover:bg-slate-50/50">
                          <td className="py-2.5 font-bold text-natural-dark">
                            <div>{c.itemName}</div>
                            {c.notes && <div className="text-[9px] text-natural-text/60 mt-0.5">{c.notes}</div>}
                          </td>
                          <td className="py-2.5 font-mono">{c.quantity} {c.unit}</td>
                          <td className="py-2.5 font-mono">{c.entryDate}</td>
                          <td className="py-2.5 font-mono">
                            {c.consumptionDate ? (
                              <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded text-[10px] font-bold">{c.consumptionDate}</span>
                            ) : (
                              <div className="flex items-center gap-1.5">
                                <span className="text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded text-[10px] shrink-0">در انبار دژبانی</span>
                                <input
                                  type="text"
                                  placeholder="1405/03/10"
                                  defaultValue="1405/03/10"
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                      handleRecordConsumption(c.id, e.currentTarget.value);
                                    }
                                  }}
                                  className="w-20 text-[9px] border rounded p-0.5 font-mono text-center bg-white"
                                  title="تاریخ مصرف را وارد کرده و اینتر بزنید"
                                />
                                <button
                                  onClick={(e) => {
                                    const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                                    handleRecordConsumption(c.id, input.value || "1405/03/10");
                                  }}
                                  className="bg-emerald-700 hover:bg-emerald-800 text-white text-[9.5px] px-1.5 py-0.5 rounded font-black cursor-pointer shadow-xs"
                                >
                                  ثبت مصرف
                                </button>
                              </div>
                            )}
                          </td>
                          <td className="py-2.5 font-mono">
                            {c.expiryDate ? (
                              <span className={isExp ? "text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded text-[10px] font-bold" : ""}>{c.expiryDate}</span>
                            ) : "فاقد انقضا مشخص"}
                          </td>
                          <td className="py-2.5 text-center">
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-black ${
                              c.status === "consumed" ? "bg-emerald-100 text-emerald-950" : isExp ? "bg-rose-100 text-rose-955 animate-pulse" : "bg-sky-100 text-sky-955"
                            }`}>
                              {c.status === "consumed" ? "مصرف‌شده" : isExp ? "منقضی‌شده" : "در انبار"}
                            </span>
                          </td>
                          <td className="py-2.5 text-left">
                            <button
                              onClick={() => handleDeleteConsumable(c.id)}
                              className="text-red-700 hover:text-red-900 text-xs font-bold px-2 py-1 hover:bg-red-50 rounded transition-all cursor-pointer"
                            >
                              حذف رکورد
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ❄️ Unit 7: COLD STORAGE SECTION */}
      {activeDepartment === "coldstorage" && (
        <div className="space-y-6" id="dept-coldstorage-section">
          {/* Header Description */}
          <div className="bg-white border border-natural-border p-5 rounded-3xl space-y-2">
            <div className="flex items-center gap-2 text-sky-600 font-extrabold text-xs">
              <Snowflake size={16} />
              <span>پایش هوشمند و کاردکس سردخانه مرکزی (ادارات و بخش‌های جانبی)</span>
            </div>
            <p className="text-xs text-natural-text leading-relaxed">
              سردخانه‌های فوق پائین برای نگهداری منجمد لاشه مولدین خاویاری و نگهداری ویژه Malossol در تلورانس دمایی ۱ الی ۴- درجه سانتی‌گراد مانیتور و لاگ می‌شوند. همچنین فرآیند انبارداری برودتی کالاها در این سامانه ثبت دوره‌ای خواهد شد.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white border border-sky-200/50 p-4 rounded-2xl flex items-center justify-between shadow-xs">
              <div>
                <span className="text-[10px] text-natural-text/60 block">دمای سردخانه ۱ (خاویار)</span>
                <span className="text-sm font-black text-sky-800 block mt-1">-۲.۴ °C (مطلوب)</span>
              </div>
              <Thermometer className="text-sky-600" size={24} />
            </div>

            <div className="bg-white border border-sky-200/50 p-4 rounded-2xl flex items-center justify-between shadow-xs">
              <div>
                <span className="text-[10px] text-natural-text/60 block">دمای سردخانه ۲ (گوشت)</span>
                <span className="text-sm font-black text-violet-800 block mt-1">-۱۸.۱ °C (مطلوب)</span>
              </div>
              <Snowflake className="text-violet-600" size={24} />
            </div>

            <div className="bg-white border border-sky-200/50 p-4 rounded-2xl flex items-center justify-between shadow-xs">
              <div>
                <span className="text-[10px] text-natural-text/60 block">دمای سردخانه خوراک</span>
                <span className="text-sm font-black text-emerald-800 block mt-1">+۳.۸ °C (مطلوب)</span>
              </div>
              <Thermometer className="text-emerald-600" size={24} />
            </div>

            <div className="bg-white border border-sky-200/50 p-4 rounded-2xl flex items-center justify-between shadow-xs">
              <div>
                <span className="text-[10px] text-natural-text/60 block">کل محموله انبارش شده</span>
                <span className="text-sm font-black text-natural-dark block mt-1">
                  {coldStorageInventory.reduce((acc, curr) => acc + curr.weightKg, 0).toLocaleString()} کیلوگرم
                </span>
              </div>
              <Boxes className="text-sky-700" size={24} />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left/Sidebar panel for forms: Log Temperature + Inventory In */}
            <div className="space-y-6">
              {/* Form 1: Temp & Humid Log */}
              <div className="bg-white border border-natural-border p-5 rounded-3xl space-y-4">
                <h3 className="text-xs font-black text-natural-dark border-b pb-2 flex items-center gap-1.5">
                  <Thermometer size={14} className="text-sky-600" />
                  <span>ثبت دما و رطوبت دوره‌ای</span>
                </h3>

                <form onSubmit={handleAddColdStorageLog} className="space-y-3">
                  <div>
                    <label className="block text-[10px] text-natural-text font-bold mb-1">انتخاب یونیت سردخانه:</label>
                    <select
                      value={coldRoom}
                      onChange={(e) => setColdRoom(e.target.value)}
                      className="w-full text-xs font-bold rounded-xl border border-natural-border p-2 bg-[#FDFCF8] text-natural-dark"
                    >
                      <option value="سردخانه شماره ۱ - خاویار صادراتی">سردخانه شماره ۱ - خاویار صادراتی (-۲ تا -۴)</option>
                      <option value="سردخانه شماره ۲ - منجمدسازی گوشت">سردخانه شماره ۲ - منجمدسازی گوشت (-۱۸)</option>
                      <option value="سردخانه خوراک آماده">سردخانه خوراک آماده (۲ تا ۶ درجه)</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] text-natural-text font-bold mb-1">دمای خوانده شده (°C):</label>
                      <input
                        type="number"
                        step="0.1"
                        value={coldTemp}
                        onChange={(e) => setColdTemp(e.target.value)}
                        className="w-full text-xs font-bold rounded-xl border border-natural-border p-2 bg-[#FDFCF8] text-natural-dark text-center"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-natural-text font-bold mb-1">رطوبت نسبی (٪):</label>
                      <input
                        type="number"
                        value={coldHum}
                        onChange={(e) => setColdHum(e.target.value)}
                        className="w-full text-xs font-bold rounded-xl border border-natural-border p-2 bg-[#FDFCF8] text-natural-dark text-center"
                        required
                        min="0"
                        max="100"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] text-natural-text font-bold mb-1">تکنیسین کنترل کیفی:</label>
                    <input
                      type="text"
                      value={coldOp}
                      onChange={(e) => setColdOp(e.target.value)}
                      className="w-full text-xs font-bold rounded-xl border border-natural-border p-2 bg-[#FDFCF8] text-natural-dark"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-natural-text font-bold mb-1">توضیحات و عیوب ظاهری:</label>
                    <textarea
                      value={coldNotes}
                      onChange={(e) => setColdNotes(e.target.value)}
                      placeholder="مانند: وضعیت برفک، سلامت درب‌ها و واشر مگنتی..."
                      rows={2}
                      className="w-full text-xs font-bold rounded-xl border border-natural-border p-2 bg-[#FDFCF8] text-natural-dark text-right"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-sky-700 hover:bg-sky-800 text-white rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1"
                  >
                    <Plus size={14} />
                    ثبت لاگ برودتی سردخانه
                  </button>
                </form>
              </div>

              {/* Form 2: Inventory In */}
              <div className="bg-white border border-natural-border p-5 rounded-3xl space-y-4">
                <h3 className="text-xs font-black text-natural-dark border-b pb-2 flex items-center gap-1.5">
                  <Boxes size={14} className="text-sky-600" />
                  <span>ثبت حواله ورود کالا به سردخانه</span>
                </h3>

                <form onSubmit={handleAddColdInventory} className="space-y-3">
                  <div>
                    <label className="block text-[10px] text-natural-text font-bold mb-1">نام کالا / جزئیات بسته بند‌ی:</label>
                    <input
                      type="text"
                      value={coldInvItem}
                      onChange={(e) => setColdInvItem(e.target.value)}
                      className="w-full text-xs font-bold rounded-xl border border-natural-border p-2 bg-[#FDFCF8] text-natural-dark"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] text-natural-text font-bold mb-1">وزن کل (کیلوگرم):</label>
                      <input
                        type="number"
                        step="0.1"
                        value={coldInvWeight}
                        onChange={(e) => setColdInvWeight(e.target.value)}
                        className="w-full text-xs font-bold rounded-xl border border-natural-border p-2 bg-[#FDFCF8] text-natural-dark text-center"
                        required
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-natural-text font-bold mb-1">تعداد کارتن / کیسه:</label>
                      <input
                        type="number"
                        value={coldInvBox}
                        onChange={(e) => setColdInvBox(e.target.value)}
                        className="w-full text-xs font-bold rounded-xl border border-natural-border p-2 bg-[#FDFCF8] text-natural-dark text-center"
                        required
                        min="0"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] text-natural-text font-bold mb-1">سردخانه مقصد:</label>
                    <select
                      value={coldInvRoom}
                      onChange={(e) => setColdInvRoom(e.target.value)}
                      className="w-full text-xs font-bold rounded-xl border border-natural-border p-2 bg-[#FDFCF8] text-natural-dark"
                    >
                      <option value="سردخانه شماره ۱ - خاویار صادراتی">سردخانه شماره ۱ - خاویار صادراتی</option>
                      <option value="سردخانه شماره ۲ - منجمدسازی گوشت">سردخانه شماره ۲ - منجمدسازی گوشت</option>
                      <option value="سردخانه خوراک آماده">سردخانه خوراک آماده</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] text-natural-text font-bold mb-1">انباردار تحویل گیرنده:</label>
                    <input
                      type="text"
                      value={coldInvOp}
                      onChange={(e) => setColdInvOp(e.target.value)}
                      className="w-full text-xs font-bold rounded-xl border border-natural-border p-2 bg-[#FDFCF8] text-natural-dark"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1"
                  >
                    <Plus size={14} />
                    ثبت رسید انبار سردخانه
                  </button>
                </form>
              </div>
            </div>

            {/* Right/Main panel for tables/lists: Temperature readings + Inventory StockCard */}
            <div className="lg:col-span-2 space-y-6">
              {/* Table 1: Temperature & Humidity Log */}
              <div className="bg-white border border-natural-border p-5 rounded-3xl space-y-4">
                <h3 className="text-xs font-black text-natural-dark border-b pb-2 flex items-center gap-1.5">
                  <Clock size={14} className="text-sky-700" />
                  <span>تاریخچه پایش سنسورهای دمای سردخانه‌ها</span>
                </h3>

                <div className="overflow-x-auto">
                  <table className="w-full text-right text-xs">
                    <thead>
                      <tr className="border-b border-natural-border text-natural-text/60">
                        <th className="pb-3 pt-1">شناسه رویداد</th>
                        <th className="pb-3 pt-1">زمان ثبت</th>
                        <th className="pb-3 pt-1">نام یونیت سردخانه</th>
                        <th className="pb-3 pt-1">دما (°C)</th>
                        <th className="pb-3 pt-1">رطوبت نسبی</th>
                        <th className="pb-3 pt-1">وضعیت دمایی</th>
                        <th className="pb-3 pt-1">مسئول فنی</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-natural-border/30">
                      {coldStorageLogs.map(log => (
                        <tr key={log.id} className="hover:bg-natural-khaki/10">
                          <td className="py-3 font-mono font-bold text-natural-dark">{log.id}</td>
                          <td className="py-3 font-mono text-natural-text/80">{log.date} {log.time}</td>
                          <td className="py-3 font-bold text-natural-dark">{log.roomName}</td>
                          <td className="py-3 font-mono font-black text-sky-800 dir-ltr text-right">{log.temperature} °C</td>
                          <td className="py-3 font-mono text-natural-text/80">{log.humidity}٪</td>
                          <td className="py-3">
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-black shrink-0 ${
                              log.status === "normal" 
                                ? "bg-emerald-100 text-emerald-950" 
                                : log.status === "warning" 
                                ? "bg-amber-100 text-amber-950" 
                                : "bg-red-100 text-red-950"
                            }`}>
                              {log.status === "normal" ? "● ایمن و پایدار" : log.status === "warning" ? "⚠️ هشدار نوسان" : "🚨 وضعیت بحرانی"}
                            </span>
                          </td>
                          <td className="py-3 text-[11px] text-natural-text/80">{log.operator}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Table 2: Inventory Cardex */}
              <div className="bg-white border border-natural-border p-5 rounded-3xl space-y-4">
                <h3 className="text-xs font-black text-natural-dark border-b pb-2 flex items-center gap-1.5">
                  <Warehouse size={14} className="text-sky-700" />
                  <span>دفتر کاردکس موجودی کالای سردخانه‌ها</span>
                </h3>

                <div className="overflow-x-auto">
                  <table className="w-full text-right text-xs">
                    <thead>
                      <tr className="border-b border-natural-border text-natural-text/60">
                        <th className="pb-3 pt-1">سریال رسید</th>
                        <th className="pb-3 pt-1">تاریخ ورود کالا</th>
                        <th className="pb-3 pt-1">شرح کالا و مشخصه بسته</th>
                        <th className="pb-3 pt-1">وزن ناخالص (Kg)</th>
                        <th className="pb-3 pt-1">تعداد واحدها</th>
                        <th className="pb-3 pt-1">سردخانه نگهداری</th>
                        <th className="pb-3 pt-1">تحویل‌دهنده / تحویل‌گیرنده</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-natural-border/30">
                      {coldStorageInventory.map(item => (
                        <tr key={item.id} className="hover:bg-natural-khaki/10">
                          <td className="py-3 font-mono font-bold text-natural-dark">{item.id}</td>
                          <td className="py-3 font-mono text-natural-text/80">{item.dateAdded}</td>
                          <td className="py-3 font-bold text-natural-dark">{item.itemName}</td>
                          <td className="py-3 font-mono text-sky-800 font-extrabold">{item.weightKg} کیلوگرم</td>
                          <td className="py-3 font-mono text-natural-text/80">{item.boxCount} بسته / کارتن</td>
                          <td className="py-3 text-[11px] text-indigo-900 font-bold">{item.roomName}</td>
                          <td className="py-3 text-natural-text/80">{item.operator}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Cold Storage Consumables Section */}
              <div className="bg-white border border-natural-border p-5 rounded-3xl space-y-4">
                <div className="flex justify-between items-center border-b pb-2">
                  <h3 className="text-xs font-black text-natural-dark flex items-center gap-1.5 font-bold text-sky-950">
                    <span className="p-1 bg-sky-50 text-sky-700 rounded text-[10px]">❄️</span>
                    <span>ملزومات برودتی مصرفی مرکزی (کارتن‌های خلاء، فوم بسته خاویار و ژل‌پک فریزری)</span>
                  </h3>
                  <span className="text-[10px] text-natural-text/60 font-sans font-bold">رهگیری موجودی، تاریخ مصرف و تاریخ انقضاء انجماد</span>
                </div>

                {consumables.filter(c => c.department === "coldstorage").length === 0 ? (
                  <p className="text-xs text-natural-text/50 py-2">هیچ ماده مصرفی برای دپارتمان سردخانه مرکزی ثبت نشده است.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-right text-xs">
                      <thead>
                        <tr className="border-b border-natural-border/30 text-natural-text/60 font-sans">
                          <th className="pb-2">نام کالا / آیتم مصرفی برودتی</th>
                          <th className="pb-2">مقدار ورود</th>
                          <th className="pb-2">تاریخ ورود</th>
                          <th className="pb-2">تاریخ مصرف نهایی</th>
                          <th className="pb-2">تاریخ انقضاء</th>
                          <th className="pb-2 text-center">وضعیت</th>
                          <th className="pb-2 text-left">عملیات</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-natural-border/20">
                        {consumables.filter(c => c.department === "coldstorage").map(c => {
                          const isExp = c.expiryDate && c.expiryDate < "1405/03/10" && c.status !== "consumed";
                          return (
                            <tr key={c.id} className="hover:bg-slate-50/50">
                              <td className="py-2.5 font-bold text-natural-dark">
                                <div>{c.itemName}</div>
                                {c.notes && <div className="text-[9px] text-natural-text/60 mt-0.5">{c.notes}</div>}
                              </td>
                              <td className="py-2.5 font-mono">{c.quantity} {c.unit}</td>
                              <td className="py-2.5 font-mono">{c.entryDate}</td>
                              <td className="py-2.5 font-mono">
                                {c.consumptionDate ? (
                                  <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded text-[10px] font-bold">{c.consumptionDate}</span>
                                ) : (
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded text-[10px] shrink-0">در انبار برودتی</span>
                                    <input
                                      type="text"
                                      placeholder="1405/03/10"
                                      defaultValue="1405/03/10"
                                      onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                          handleRecordConsumption(c.id, e.currentTarget.value);
                                        }
                                      }}
                                      className="w-20 text-[9px] border rounded p-0.5 font-mono text-center bg-white"
                                      title="تاریخ مصرف را وارد کرده و اینتر بزنید"
                                    />
                                    <button
                                      onClick={(e) => {
                                        const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                                        handleRecordConsumption(c.id, input.value || "1405/03/10");
                                      }}
                                      className="bg-emerald-700 hover:bg-emerald-800 text-white text-[9.5px] px-1.5 py-0.5 rounded font-black cursor-pointer shadow-xs"
                                    >
                                      ثبت مصرف
                                    </button>
                                  </div>
                                )}
                              </td>
                              <td className="py-2.5 font-mono">
                                {c.expiryDate ? (
                                  <span className={isExp ? "text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded text-[10px] font-bold" : ""}>{c.expiryDate}</span>
                                ) : "فاقد انقضا مشخص"}
                              </td>
                              <td className="py-2.5 text-center">
                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-black ${
                                  c.status === "consumed" ? "bg-emerald-100 text-emerald-950" : isExp ? "bg-rose-100 text-rose-955 animate-pulse" : "bg-sky-100 text-sky-955"
                                }`}>
                                  {c.status === "consumed" ? "مصرف‌شده" : isExp ? "منقضی‌شده" : "در انبار"}
                                </span>
                              </td>
                              <td className="py-2.5 text-left">
                                <button
                                  onClick={() => handleDeleteConsumable(c.id)}
                                  className="text-red-700 hover:text-red-900 text-xs font-bold px-2 py-1 hover:bg-red-50 rounded transition-all cursor-pointer"
                                >
                                  حذف رکورد
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 🔗 Unit 8: TRACEABILITY & VALUCHAIN INTERSECTION SECTION */}
      {activeDepartment === "traceability" && (
        <div className="space-y-6" id="dept-traceability-section">
          {/* Header Description */}
          <div className="bg-slate-900 text-slate-100 border border-slate-800 p-6 rounded-3xl space-y-3 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="flex items-center gap-2 text-indigo-400 font-extrabold text-xs">
              <RefreshCw size={16} className="animate-spin-slow" />
              <span>سامانه ارشد پایش زنجیره ارزش، رهگیری مواد و همپوشانی چند دپارتمانی</span>
            </div>
            <h2 className="text-sm font-black text-white">ردیابی یکپارچه محصولات از گیت ورود، خط تولید خوراک و دوز تغذیه روزانه تا صید، سردخانه و حسابداری</h2>
            <p className="text-xs text-slate-300 leading-relaxed max-w-4xl">
              این واحد وظیفه دارد یک رشته عملیات تبارشناسی و کنترلی ایجاد کند تا نشان دهد کالاها از چه مبدائی وارد شده، چگونه فراوری شده و در کدام بخش‌ها مصرف گردیده‌اند. این زنجیره تأمین یکپارچه ثابت می‌کند چگونه امنیت زیستی، تاسیسات کارگاه، انبارداری و امور مالی بر یکدیگر همپوشانی مستقیم دارند.
            </p>
          </div>

          {/* 🏢 بخش اول: نقشه مفهومی همپوشانی و جریان زنجیره تأمین */}
          <div className="bg-white border border-natural-border p-5 rounded-3xl space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-xs font-black text-natural-dark flex items-center gap-1.5">
                <Boxes size={14} className="text-indigo-600" />
                <span>شبیه‌ساز جریان و نقاط همپوشانی دپارتمان‌های فارم خاویاری</span>
              </h3>
              <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full font-black">۸ دپارتمان متصل</span>
            </div>

            <p className="text-[11px] text-natural-text leading-relaxed">
              جهت مشاهده روابط متقابل، نحوه مصرف مواد، پایداری بیولوژیکی و تاثیر دوجانبه دپارتمان‌ها بر روی یکدیگر، بر روی مرحله مربوطه کلیک کنید:
            </p>

            {/* Visual Grid Pipeline */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
              <div 
                onClick={() => setSelectedTracePreset("f1")}
                className={`border p-4 rounded-2xl cursor-pointer transition-all ${
                  selectedTracePreset === "f1" 
                    ? "bg-emerald-50/50 border-emerald-500 shadow-xs" 
                    : "bg-natural-khaki/5 border-natural-border/60 hover:bg-natural-khaki/10"
                }`}
              >
                <div className="flex items-center gap-1.5 text-emerald-800 font-extrabold text-xs">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center text-[10px] text-emerald-700">۱</span>
                  <span>گیت و حراست ورودی</span>
                </div>
                <div className="text-[10px] text-natural-text/70 mt-2">تردد تانکر، دافنی نرسری، ثبت بهداشتی پرسنل شیلاتی</div>
                <div className="mt-2.5 flex items-center justify-between text-[9px] font-black pointer-events-none">
                  <span className="text-emerald-700">همپوشانی با:</span>
                  <span className="bg-sky-50 text-sky-800 px-1.5 py-0.5 rounded-sm">کارخانه خوراک</span>
                </div>
              </div>

              <div 
                onClick={() => setSelectedTracePreset("f12")}
                className={`border p-4 rounded-2xl cursor-pointer transition-all ${
                  selectedTracePreset === "f12" 
                    ? "bg-slate-50 border-emerald-500 shadow-xs" 
                    : "bg-natural-khaki/5 border-natural-border/60 hover:bg-natural-khaki/10"
                }`}
              >
                <div className="flex items-center gap-1.5 text-emerald-800 font-extrabold text-xs">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center text-[10px] text-emerald-700">۲</span>
                  <span>تولید خوراک متراکم</span>
                </div>
                <div className="text-[10px] text-natural-text/70 mt-2">تبدیل پودر صدف و ماهیان هرز به پلت‌های پروتئینی بالا</div>
                <div className="mt-2.5 flex items-center justify-between text-[9px] font-black pointer-events-none">
                  <span className="text-emerald-700">همپوشانی با:</span>
                  <span className="bg-indigo-50 text-indigo-800 px-1.5 py-0.5 rounded-sm">انبارداری مرکزی</span>
                </div>
              </div>

              <div 
                onClick={() => setSelectedTracePreset("m2")}
                className={`border p-4 rounded-2xl cursor-pointer transition-all ${
                  selectedTracePreset === "m2" 
                    ? "bg-cyan-50/50 border-cyan-500 shadow-xs" 
                    : "bg-natural-khaki/5 border-natural-border/60 hover:bg-natural-khaki/10"
                }`}
              >
                <div className="flex items-center gap-1.5 text-cyan-800 font-extrabold text-xs">
                  <span className="w-5 h-5 rounded-full bg-cyan-100 flex items-center justify-center text-[10px] text-cyan-700">۳</span>
                  <span>تاسیسات و پشتیبانی</span>
                </div>
                <div className="text-[10px] text-natural-text/70 mt-2">ژنراتور برق سالن نرسری، پمپ‌های تصفیه، فیلتراسیون فیزیکی</div>
                <div className="mt-2.5 flex items-center justify-between text-[9px] font-black pointer-events-none">
                  <span className="text-cyan-700">همپوشانی با:</span>
                  <span className="bg-emerald-50 text-emerald-800 px-1.5 py-0.5 rounded-sm">امنیت زیستی</span>
                </div>
              </div>

              <div 
                onClick={() => setSelectedTracePreset("f1")}
                className={`border p-4 rounded-2xl cursor-pointer transition-all ${
                  selectedTracePreset === "f1" 
                    ? "bg-indigo-50/50 border-indigo-500 shadow-xs" 
                    : "bg-natural-khaki/5 border-natural-border/60 hover:bg-natural-khaki/10"
                }`}
              >
                <div className="flex items-center gap-1.5 text-indigo-800 font-extrabold text-xs">
                  <span className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center text-[10px] text-indigo-700">۴</span>
                  <span>انبارداری و قفسه کالا</span>
                </div>
                <div className="text-[10px] text-natural-text/70 mt-2">کنترل کاردکس تغذیه، ثبت رسید تراشه‌های RFID، دوزهای دارویی</div>
                <div className="mt-2.5 flex items-center justify-between text-[9px] font-black pointer-events-none">
                  <span className="text-indigo-700">همپوشانی با:</span>
                  <span className="bg-amber-50 text-amber-800 px-1.5 py-0.5 rounded-sm">استخرهای فارم</span>
                </div>
              </div>

              <div 
                onClick={() => setSelectedTracePreset("c2")}
                className={`border p-4 rounded-2xl cursor-pointer transition-all ${
                  selectedTracePreset === "c2" 
                    ? "bg-rose-50/50 border-rose-500 shadow-xs" 
                    : "bg-natural-khaki/5 border-natural-border/60 hover:bg-natural-khaki/10"
                }`}
              >
                <div className="flex items-center gap-1.5 text-rose-800 font-extrabold text-xs">
                  <span className="w-5 h-5 rounded-full bg-rose-100 flex items-center justify-center text-[10px] text-rose-700">۵</span>
                  <span>پرورش، آزمایشگاه و بیومتری</span>
                </div>
                <div className="text-[10px] text-natural-text/70 mt-2">خوراک‌دهی روزانه گله، کشت میکروچیپ، شناسایی سونوگرافی جنسی</div>
                <div className="mt-2.5 flex items-center justify-between text-[9px] font-black pointer-events-none">
                  <span className="text-rose-700">همپوشانی با:</span>
                  <span className="bg-rose-100 text-rose-950 px-1.5 py-0.5 rounded-sm">کارخانه فرآوری</span>
                </div>
              </div>

              <div 
                onClick={() => setSelectedTracePreset("c2")}
                className={`border p-4 rounded-2xl cursor-pointer transition-all ${
                  selectedTracePreset === "c2" 
                    ? "bg-rose-50/50 border-rose-500 shadow-xs" 
                    : "bg-natural-khaki/5 border-natural-border/60 hover:bg-natural-khaki/10"
                }`}
              >
                <div className="flex items-center gap-1.5 text-rose-800 font-extrabold text-xs">
                  <span className="w-5 h-5 rounded-full bg-rose-100 flex items-center justify-center text-[10px] text-rose-700">۶</span>
                  <span>کارخانه فرآوری خاویار</span>
                </div>
                <div className="text-[10px] text-natural-text/70 mt-2">مهار گله‌های فیل‌ماهی بالغ، صید، نمک‌گذاری Malossol و گرید بندی</div>
                <div className="mt-2.5 flex items-center justify-between text-[9px] font-black pointer-events-none">
                  <span className="text-rose-700">همپوشانی با:</span>
                  <span className="bg-sky-50 text-sky-800 px-1.5 py-0.5 rounded-sm">سردخانه مرکزی</span>
                </div>
              </div>

              <div 
                onClick={() => setSelectedTracePreset("c2")}
                className={`border p-4 rounded-2xl cursor-pointer transition-all ${
                  selectedTracePreset === "c2" 
                    ? "bg-sky-50 border-rose-500 shadow-xs" 
                    : "bg-natural-khaki/5 border-natural-border/60 hover:bg-natural-khaki/10"
                }`}
              >
                <div className="flex items-center gap-1.5 text-sky-800 font-extrabold text-xs">
                  <span className="w-5 h-5 rounded-full bg-sky-100 flex items-center justify-center text-[10px] text-sky-700">۷</span>
                  <span>سردخانه و سرمایش عمیق</span>
                </div>
                <div className="text-[10px] text-natural-text/70 mt-2">انجماد سریع لاشه‌ها، نگهداری واکسینه در تلورانس ۱ تا ۴- درجه سانتی‌گراد</div>
                <div className="mt-2.5 flex items-center justify-between text-[9px] font-black pointer-events-none">
                  <span className="text-sky-700">همپوشانی با:</span>
                  <span className="bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded-sm">صادرات فروش</span>
                </div>
              </div>

              <div 
                onClick={() => setSelectedTracePreset("c2")}
                className={`border p-4 rounded-2xl cursor-pointer transition-all ${
                  selectedTracePreset === "c2" 
                    ? "bg-amber-50/55 border-rose-500 shadow-xs" 
                    : "bg-natural-khaki/5 border-natural-border/60 hover:bg-natural-khaki/10"
                }`}
              >
                <div className="flex items-center gap-1.5 text-amber-800 font-extrabold text-xs">
                  <span className="w-5 h-5 rounded-full bg-amber-100 flex items-center justify-center text-[10px] text-amber-700">۸</span>
                  <span>حسابداری و تراز روزنامه</span>
                </div>
                <div className="text-[10px] text-natural-text/70 mt-2">محاسبه بهای تمام شده، تایید پیش فاکتور صادرات و تسویه ملزومات</div>
                <div className="mt-2.5 flex items-center justify-between text-[9px] font-black pointer-events-none">
                  <span className="text-amber-700">همپوشانی با:</span>
                  <span className="bg-green-50 text-green-800 px-1.5 py-0.5 rounded-sm">توسعه گله شیلات</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Trace Engine controls & instant visual check */}
            <div className="space-y-6">
              {/* Preset Selector */}
              <div className="bg-white border border-natural-border p-5 rounded-3xl space-y-4">
                <h3 className="text-xs font-black text-natural-dark border-b pb-2 flex items-center gap-1.5">
                  <RefreshCw size={14} className="text-indigo-600" />
                  <span>انتخاب بچ‌های کلیدی تبارشناسی</span>
                </h3>

                <div className="space-y-2">
                  <p className="text-[11px] text-natural-text">بچ‌های پیش‌فرضِ پائین، رخدادهای زنجیره ارزش را از بدو ورود مواد خام تا مصرف و ثبت سود پیوند می‌دهند:</p>
                  
                  <button
                    onClick={() => { setSelectedTracePreset("c2"); setTraceSearchQuery(""); }}
                    className={`w-full text-right p-3 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center justify-between border ${
                      selectedTracePreset === "c2" && !traceSearchQuery 
                        ? "bg-indigo-50 border-indigo-200 text-indigo-950" 
                        : "bg-white border-natural-border/60 text-natural-dark hover:bg-natural-khaki/15"
                    }`}
                  >
                    <span>🐟 پرونده خاویار صادراتی رویال (بچ c2)</span>
                    <span className="text-[9px] bg-indigo-100 px-1.5 py-0.5 rounded-sm font-black">کاملترین زنجیره</span>
                  </button>

                  <button
                    onClick={() => { setSelectedTracePreset("f1"); setTraceSearchQuery(""); }}
                    className={`w-full text-right p-3 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center justify-between border ${
                      selectedTracePreset === "f1" && !traceSearchQuery 
                        ? "bg-indigo-50 border-indigo-200 text-indigo-950" 
                        : "bg-white border-natural-border/60 text-natural-dark hover:bg-natural-khaki/15"
                    }`}
                  >
                    <span>🌾 محموله خوراک پلت نرسری (بچ f1)</span>
                    <span className="text-[9px] bg-emerald-100 text-emerald-950 px-1.5 py-0.5 rounded-sm font-black">ورود و مصرف</span>
                  </button>

                  <button
                    onClick={() => { setSelectedTracePreset("m2"); setTraceSearchQuery(""); }}
                    className={`w-full text-right p-3 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center justify-between border ${
                      selectedTracePreset === "m2" && !traceSearchQuery 
                        ? "bg-indigo-50 border-indigo-200 text-indigo-950" 
                        : "bg-white border-natural-border/60 text-natural-dark hover:bg-natural-khaki/15"
                    }`}
                  >
                    <span>⚡ پایش پایداری سیستم هواساز (پرونده m2)</span>
                    <span className="text-[9px] bg-cyan-100 text-cyan-950 px-1.5 py-0.5 rounded-sm font-black">فنی و تاسیساتی</span>
                  </button>
                </div>
              </div>

              {/* Free Text Global Lookup Search */}
              <div className="bg-white border border-natural-border p-5 rounded-3xl space-y-4">
                <h3 className="text-xs font-black text-natural-dark border-b pb-2 flex items-center gap-1.5">
                  <Search size={14} className="text-indigo-600" />
                  <span>فیلتر و پایش دستی کلیدواژه‌ها</span>
                </h3>

                <div className="space-y-3">
                  <p className="text-[11px] text-natural-text leading-relaxed">
                    با وارد کردن هر کلمه‌ای (مثال: <span className="font-bold underline text-indigo-600 cursor-pointer" onClick={() => setTraceSearchQuery("خاویار")}>خاویار</span>، <span className="font-bold underline text-indigo-600 cursor-pointer" onClick={() => setTraceSearchQuery("خوراک")}>خوراک</span>، <span className="font-bold underline text-indigo-600 cursor-pointer" onClick={() => setTraceSearchQuery("علوی")}>علوی</span>، <span className="font-bold underline text-indigo-600 cursor-pointer" onClick={() => setTraceSearchQuery("رحیمی")}>رحیمی</span> یا مبالغ مالی)، سامانه تمام کلونی‌ها، فاکتورهای مالی، لاگ‌های نگهبانی، کاردکس انبار و سوابق سردخانه را جستجو و پیوند می‌دهد:
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
                    <Search className="absolute left-3 top-3 text-natural-text/60" size={14} />
                  </div>

                  {traceSearchQuery && (
                    <button
                      onClick={() => {
                        setTraceSearchQuery("");
                        setSelectedTracePreset("c2");
                      }}
                      className="text-[10px] text-red-700 font-extrabold hover:underline block"
                    >
                      × پاک کردن فیلتر جاری
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Dynamic Timeline Logs representing the interlinked value chain */}
            <div className="lg:col-span-2 space-y-6">
              {/* Timeline Card Container */}
              <div className="bg-white border border-natural-border p-6 rounded-3xl space-y-6">
                
                {/* Dynamic Title */}
                <div className="border-b pb-3 flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-black text-natural-dark">
                      {!traceSearchQuery ? (
                        <>
                          {selectedTracePreset === "c2" && "رویدادنگاری تبارنامه بچ خاویار صادراتی رویال (c2)"}
                          {selectedTracePreset === "f1" && "رویدادنگاری محموله تولید و مصرف خوراک نرسری (f1)"}
                          {selectedTracePreset === "m2" && "رویدادنگاری پایداری اکسیژن و تاسیسات زیستی (m2)"}
                        </>
                      ) : (
                        `نتایج ردیابی برخط برای کلیدواژه "${traceSearchQuery}"`
                      )}
                    </h3>
                    <span className="text-[10px] text-natural-text/60 mt-1 block">
                      {!traceSearchQuery 
                        ? `نمایش جریان همپوشانی دپارتمان‌ها به صورت زمان‌مند`
                        : `${handleTraceSearch(traceSearchQuery).length} رکورد متصل در دپارتمان‌های مختلف یافت شد`
                      }
                    </span>
                  </div>
                  <span className="text-xs font-bold text-natural-text/50 dir-ltr font-mono">1405/03/10</span>
                </div>

                {/* Search Results Display */}
                {traceSearchQuery ? (
                  <div className="space-y-4">
                    {handleTraceSearch(traceSearchQuery).length === 0 ? (
                      <div className="p-8 text-center bg-natural-khaki/10 text-natural-text rounded-3xl border border-dashed border-natural-border/80">
                        <AlertTriangle className="mx-auto text-amber-500 mb-2" size={24} />
                        <p className="text-xs font-bold">هیچ رکوردی متصل به کلیدواژه فوق یافت نگردید.</p>
                        <p className="text-[10px] text-natural-text/60 mt-1">املا یا فاکتور ثبت شده در دپارتمان حسابداری، انبار یا گیت را بررسی نمایید.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {handleTraceSearch(traceSearchQuery).map((res, index) => (
                          <div key={index} className="flex gap-4 items-start bg-slate-50/50 hover:bg-slate-50 border border-slate-100 p-4 rounded-2xl transition-all">
                            <div className="w-10 h-10 rounded-full bg-indigo-50 border border-indigo-100 shrink-0 flex items-center justify-center text-indigo-700 font-extrabold text-sm">
                              {index + 1}
                            </div>
                            <div className="space-y-1 w-full text-right">
                              <div className="flex justify-between items-center w-full">
                                <span className="text-xs font-black text-indigo-900">{res.title}</span>
                                <span className="text-[9px] bg-indigo-150 text-indigo-950 px-2.5 py-0.5 rounded-full font-black">{res.dept}</span>
                              </div>
                              <p className="text-[10px] text-natural-text leading-relaxed">{res.desc}</p>
                              <div className="flex justify-end gap-2 text-[8px] text-natural-text/50 font-mono pt-1">
                                <span>{res.date}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  /* Preset Timelines (The Core traceability proof) */
                  <div className="space-y-6 relative before:absolute before:right-[15px] before:top-2 before:bottom-2 before:w-[2px] before:bg-indigo-100 text-right pr-2">
                    
                    {/* PRESET 1: BATCH c2 */}
                    {selectedTracePreset === "c2" && (
                      <>
                        <div className="relative pr-8 space-y-1.5 group">
                          <span className="absolute right-[-2.5px] top-1.5 w-3.5 h-3.5 rounded-full bg-indigo-600 border border-3 border-white ring-4 ring-indigo-50 shrink-0" />
                          <div className="flex justify-between items-center">
                            <h4 className="text-xs font-black text-slate-900">۱. ثبت ورود بازرس بهداشتی شیلات</h4>
                            <span className="text-[10px] bg-emerald-100 text-emerald-950 px-2 py-0.5 rounded-md font-black shrink-0">نگهبانی و حراست</span>
                          </div>
                          <p className="text-[11px] text-natural-text leading-relaxed">
                            ثبت ورود تانکر نمونه سونوگرافی و بازرس کل شیلات (دکتر حسینی) با پلاک <strong className="font-mono text-xs">۱۲ الف ۳۴۵ ایران ۲۱</strong> در گیت حراست کارگاه فارم.
                          </p>
                          <div className="text-[9px] text-natural-text/40 font-semibold font-mono">ساعت تردد: ۰۹:۴۵ صبح ۱۰ خرداد ۱۴۰۵</div>
                        </div>

                        <div className="relative pr-8 space-y-1.5 group">
                          <span className="absolute right-[-2.5px] top-1.5 w-3.5 h-3.5 rounded-full bg-indigo-600 border border-3 border-white ring-4 ring-indigo-50 shrink-0" />
                          <div className="flex justify-between items-center">
                            <h4 className="text-xs font-black text-slate-900">۲. تخصیص مالی و مآخذ خرید مکمل</h4>
                            <span className="text-[10px] bg-rose-100 text-rose-950 px-2 py-0.5 rounded-md font-black shrink-0">حسابداری مالی</span>
                          </div>
                          <p className="text-[11px] text-natural-text leading-relaxed">
                            پرداخت تایید شده فاکتور خرید ۲۰ کیسه پودر اسیدآمینه خالص شیلاتی و میکروچیپ‌های RFID به ارزش <strong className="font-mono text-xs">۴۵,۰۰۰,۰۰۰ تومان</strong> ممهور به شناسه تراکنش <strong className="font-mono text-xs">t2</strong>.
                          </p>
                        </div>

                        <div className="relative pr-8 space-y-1.5 group">
                          <span className="absolute right-[-2.5px] top-1.5 w-3.5 h-3.5 rounded-full bg-indigo-600 border border-3 border-white ring-4 ring-indigo-50 shrink-0" />
                          <div className="flex justify-between items-center">
                            <h4 className="text-xs font-black text-slate-900">۳. تامین کادکس انبارداری مرکزی</h4>
                            <span className="text-[10px] bg-purple-100 text-purple-950 px-2 py-0.5 rounded-md font-black shrink-0">انبارداری مرکزی</span>
                          </div>
                          <p className="text-[11px] text-natural-text leading-relaxed">
                            اضافه شدن نمک دریایی تصفیه شده شیلاتی به قفسه‌های انبار و رسید موقت ۸۵۰ کیلوگرم با شناسه کاردکس ثبت شده توسط هاشمی سرپرست انبار.
                          </p>
                        </div>

                        <div className="relative pr-8 space-y-1.5 group">
                          <span className="absolute right-[-2.5px] top-1.5 w-3.5 h-3.5 rounded-full bg-indigo-600 border border-3 border-white ring-4 ring-indigo-50 shrink-0" />
                          <div className="flex justify-between items-center">
                            <h4 className="text-xs font-black text-slate-900">۴. خط تولید و آنالیز کارخانه خوراک</h4>
                            <span className="text-[10px] bg-emerald-100 text-emerald-950 px-2 py-0.5 rounded-md font-black shrink-0">کارخانه خوراک</span>
                          </div>
                          <p className="text-[11px] text-natural-text leading-relaxed">
                            اکسترود و پلتینگ بچ ۱۰۰۰ کیلوگرمی خوراک پیش‌پروار (بچ <strong className="font-mono text-xs">f2</strong>) با دوز ترکیبی چربی متوسط زیستی جهت تغذیه کلونی مولدین استخرهای بزرگسال.
                          </p>
                        </div>

                        <div className="relative pr-8 space-y-1.5 group">
                          <span className="absolute right-[-2.5px] top-1.5 w-3.5 h-3.5 rounded-full bg-indigo-600 border border-3 border-white ring-4 ring-indigo-50 shrink-0" />
                          <div className="flex justify-between items-center">
                            <h4 className="text-xs font-black text-slate-900">۵. دوز روزانه و پایش بیوماس استخر پرورش</h4>
                            <span className="text-[10px] bg-amber-100 text-amber-950 px-2 py-0.5 rounded-md font-black shrink-0">مجموعه استخرهای فارم</span>
                          </div>
                          <p className="text-[11px] text-natural-text leading-relaxed">
                            مصرف جیره روزانه و پایش پارامترهای هیدرولیک و اکسیژن آنلاین استخر <strong className="font-mono text-xs">pool-103</strong> در سالن ۱ گله برای تضمین بقاء و ضریب تبدیل مطلوب.
                          </p>
                        </div>

                        <div className="relative pr-8 space-y-1.5 group">
                          <span className="absolute right-[-2.5px] top-1.5 w-3.5 h-3.5 rounded-full bg-indigo-600 border border-3 border-white ring-4 ring-indigo-50 shrink-0" />
                          <div className="flex justify-between items-center">
                            <h4 className="text-xs font-black text-slate-900">۶. صید تبارشناسی، آزمایشگاه و سونوگرافی</h4>
                            <span className="text-[10px] bg-blue-100 text-blue-950 px-2 py-0.5 rounded-md font-black shrink-0">آزمایشگاه بیومتری</span>
                          </div>
                          <p className="text-[11px] text-natural-text leading-relaxed">
                            انجام معاینات ماوراء صوت و ثبت سونوگرافی جنسیت، تعیین قطر تخمک و گشایش پرونده استحصال فیل‌ماهی ۵۵ کیلوگرمی برای مروارید سیاه.
                          </p>
                        </div>

                        <div className="relative pr-8 space-y-1.5 group">
                          <span className="absolute right-[-2.5px] top-1.5 w-3.5 h-3.5 rounded-full bg-indigo-600 border border-3 border-white ring-4 ring-indigo-50 shrink-0" />
                          <div className="flex justify-between items-center">
                            <h4 className="text-xs font-black text-slate-900">۷. صید و استحصال گرانبها مروارید سیاه</h4>
                            <span className="text-[10px] bg-rose-150 text-rose-950 px-2 py-0.5 rounded-md font-black shrink-0">کارخانه فرآوری</span>
                          </div>
                          <p className="text-[11px] text-natural-text leading-relaxed">
                            استحصال ارشد <strong className="text-rose-900 font-extrabold text-xs">۹.۱ کیلوگرم خاویار رویال گلدن درجه یک صادراتی</strong> با ترخیص چشمگیر ۱۶.۵ درصد بازدهی کل لاشه ممهور به بارکد رهگیری <strong className="font-mono text-xs">c2</strong>.
                          </p>
                        </div>

                        <div className="relative pr-8 space-y-1.5 group">
                          <span className="absolute right-[-2.5px] top-1.5 w-3.5 h-3.5 rounded-full bg-indigo-600 border border-3 border-white ring-4 ring-indigo-50 shrink-0" />
                          <div className="flex justify-between items-center">
                            <h4 className="text-xs font-black text-slate-900">۸. انجماد و پایش برودتی کاردکس سردخانه</h4>
                            <span className="text-[10px] bg-sky-100 text-sky-950 px-2 py-0.5 rounded-md font-black shrink-0">سردخانه مرکزی</span>
                          </div>
                          <p className="text-[11px] text-natural-text leading-relaxed">
                            انتقال قوی محموله خاویار به سردخانه شماره ۱ خاویار در دمای کاملا استاندارد <strong className="font-mono text-xs">-۲.۴ درجه سانتی‌گراد</strong> با برچسب کاردکس <strong className="font-mono text-xs">csi1</strong> جهت ثبات ارزش کیفی کالا.
                          </p>
                        </div>

                        <div className="relative pr-8 space-y-1.5 group">
                          <span className="absolute right-[-2px] bottom-0 w-3 w-3 h-3 h-3 rounded-full bg-emerald-600 border border-white ring-4 ring-emerald-50 shrink-0" />
                          <div className="flex justify-between items-center">
                            <h4 className="text-xs font-black text-slate-900">۹. ترخیص نهایی و ثبت ترکنش طلاکوب فروش</h4>
                            <span className="text-[10px] bg-indigo-150 text-indigo-950 px-2 py-0.5 rounded-md font-black shrink-0">واحد فروش و صادرات</span>
                          </div>
                          <p className="text-[11px] text-natural-text leading-relaxed">
                            ثبت تسویه مالی و سند حسابداری درآمد صادراتی به ارزش شگرف <strong className="text-emerald-700 font-black text-xs">۵۸۰,۰۰۰,۰۰۰ تومان</strong> بندرعباس (پرونده <strong className="font-mono text-xs">t1</strong>). زنجیره با سودآوری بالا تکمیل شد.
                          </p>
                        </div>
                      </>
                    )}

                    {/* PRESET 2: BATCH f1 */}
                    {selectedTracePreset === "f1" && (
                      <>
                        <div className="relative pr-8 space-y-1.5 group">
                          <span className="absolute right-[-2.5px] top-1.5 w-3.5 h-3.5 rounded-full bg-emerald-600 border border-3 border-white ring-4 ring-emerald-50 shrink-0" />
                          <div className="flex justify-between items-center">
                            <h4 className="text-xs font-black text-slate-900">۱. ثبت نگهبانی کامیون بار خام</h4>
                            <span className="text-[10px] bg-indigo-100 text-indigo-950 px-2 py-0.5 rounded-md font-black shrink-0">نگهبانی و حراست</span>
                          </div>
                          <p className="text-[11px] text-natural-text leading-relaxed">
                            ورود کامیون تانکر بچه ماهی و محموله مواد اولیه پودر ماهی (رحیمی) با پلاک <strong className="font-mono text-xs">۴۴ ب ۷۲۱ ایران ۶۶</strong> در گیت در ساعت ۰۷:۳۰ صبح.
                          </p>
                        </div>

                        <div className="relative pr-8 space-y-1.5 group">
                          <span className="absolute right-[-2.5px] top-1.5 w-3.5 h-3.5 rounded-full bg-emerald-600 border border-3 border-white ring-4 ring-emerald-50 shrink-0" />
                          <div className="flex justify-between items-center">
                            <h4 className="text-xs font-black text-slate-900">۲. آسیاب و ساخت خوراک پلت در کارخانه خوراک</h4>
                            <span className="text-[10px] bg-emerald-100 text-emerald-950 px-2 py-0.5 rounded-md font-black shrink-0">کارخانه خوراک</span>
                          </div>
                          <p className="text-[11px] text-natural-text leading-relaxed">
                            میکسر مواد خام با خروجی <strong className="font-bold text-xs">۴۸۵ کیلوگرم</strong> پلت مخصوص نرسری ۱.۲ میلی‌متری پروتئین بالا ۴۶٪ (بچ <strong className="font-mono text-xs">f1</strong>).
                          </p>
                        </div>

                        <div className="relative pr-8 space-y-1.5 group">
                          <span className="absolute right-[-2.5px] top-1.5 w-3.5 h-3.5 rounded-full bg-emerald-600 border border-3 border-white ring-4 ring-emerald-50 shrink-0" />
                          <div className="flex justify-between items-center">
                            <h4 className="text-xs font-black text-slate-900">۳. ارسال و اضافه شدن موثر به کاردکس انبارداری</h4>
                            <span className="text-[10px] bg-slate-150 border px-2 py-0.5 rounded-md font-black shrink-0">انبارداری مرکزی</span>
                          </div>
                          <p className="text-[11px] text-natural-text leading-relaxed">
                            تایید رسید دریافت کالا به مقدار ۵۰۰ کیلوگرم با شناسه کاردکس <strong className="font-mono text-xs">i1</strong> توسط انباردار فارم (هاشمی). ارتقای موجودی قفسه نرسری به ۸۵۰ کیلوگرم.
                          </p>
                        </div>

                        <div className="relative pr-8 space-y-1.5 group">
                          <span className="absolute right-[-2.5px] top-1.5 w-3.5 h-3.5 rounded-full bg-emerald-600 border border-3 border-white ring-4 ring-emerald-50 shrink-0" />
                          <div className="flex justify-between items-center">
                            <h4 className="text-xs font-black text-slate-900">۴. جیره نویسی و تغذیه لاروها (استخرهای نرسری)</h4>
                            <span className="text-[10px] bg-emerald-100 text-emerald-950 px-2 py-0.5 rounded-md font-black shrink-0">مجموعه استخرهای فارم</span>
                          </div>
                          <p className="text-[11px] text-natural-text leading-relaxed">
                            تغذیه لاروها در تانک‌های نرسری سالن ۱ با خوراک ۱.۲ میلی‌متری و پایش درصد ماندگاری بچه ماهی‌های فیل ماهی جوان حاشیه خزر.
                          </p>
                        </div>

                        <div className="relative pr-8 space-y-1.5 group">
                          <span className="absolute right-[-2px] bottom-0 w-3 w-3 h-3 h-3 rounded-full bg-indigo-600 border border-white ring-4 ring-indigo-50 shrink-0" />
                          <div className="flex justify-between items-center">
                            <h4 className="text-xs font-black text-slate-900">۵. سند حسابداری نهاده‌ها</h4>
                            <span className="text-[10px] bg-rose-100 text-rose-950 px-2 py-0.5 rounded-md font-black shrink-0">حسابداری مالی</span>
                          </div>
                          <p className="text-[11px] text-natural-text leading-relaxed">
                            پرداخت نهایی پیش‌فاکتور خرید نهادهای دامی و بچه ماهی با تراکنش ۴۵,۰۰۰,۰۰۰ تومان (سند t2). زنجیره تأمین خوراک لارو با موفقیت تکمیل شد.
                          </p>
                        </div>
                      </>
                    )}

                    {/* PRESET 3: REGISTRY m2 */}
                    {selectedTracePreset === "m2" && (
                      <>
                        <div className="relative pr-8 space-y-1.5 group">
                          <span className="absolute right-[-2.5px] top-1.5 w-3.5 h-3.5 rounded-full bg-cyan-600 border border-3 border-white ring-4 ring-cyan-50 shrink-0" />
                          <div className="flex justify-between items-center">
                            <h4 className="text-xs font-black text-slate-900">۱. عیب‌یابی و سرویس دوره‌ای پمپ هوادهی</h4>
                            <span className="text-[10px] bg-indigo-100 text-indigo-950 px-2 py-0.5 rounded-md font-black shrink-0">بخش تاسیسات مرکزی</span>
                          </div>
                          <p className="text-[11px] text-natural-text leading-relaxed">
                            انجام کالیبراسیون و گریسکاری بلبرینگ‌های پمپ اگزوز هوادهی مرکزی سالن ۱ مجاورت گله‌ها توسط استاد کرمی (گزارش کاتالوگ m2).
                          </p>
                        </div>

                        <div className="relative pr-8 space-y-1.5 group">
                          <span className="absolute right-[-2.5px] top-1.5 w-3.5 h-3.5 rounded-full bg-cyan-600 border border-3 border-white ring-4 ring-cyan-50 shrink-0" />
                          <div className="flex justify-between items-center">
                            <h4 className="text-xs font-black text-slate-900">۲. تامین کالای یدکی و آکومولاتور</h4>
                            <span className="text-[10px] bg-purple-100 text-purple-950 px-2 py-0.5 rounded-md font-black shrink-0">انبارداری کالا</span>
                          </div>
                          <p className="text-[11px] text-natural-text leading-relaxed">
                            خروج کپسول‌های اکسیژن رزرو زاپاس ۴۰ لیتری و پک واشر واشرها جهت کمک فوری به نشت لوله‌های سالن هیدرولیک.
                          </p>
                        </div>

                        <div className="relative pr-8 space-y-1.5 group">
                          <span className="absolute right-[-2.5px] top-1.5 w-3.5 h-3.5 rounded-full bg-cyan-600 border border-3 border-white ring-4 ring-cyan-50 shrink-0" />
                          <div className="flex justify-between items-center">
                            <h4 className="text-xs font-black text-slate-900">۳. پایداری کیفیت شیمی آب گله</h4>
                            <span className="text-[10px] bg-emerald-100 text-emerald-950 px-2 py-0.5 rounded-md font-black shrink-0">امنیت شیمی و زیستی فارم</span>
                          </div>
                          <p className="text-[11px] text-natural-text leading-relaxed">
                            پایش مستمر سطح اکسیژن فعال تانک‌ها روی تراز مطمئن ۹.۵ ppm و کالیبر اوزون‌ساز به نفع کاهش تلفات فیزیکی.
                          </p>
                        </div>

                        <div className="relative pr-8 space-y-1.5 group">
                          <span className="absolute right-[-2px] bottom-0 w-3 w-3 h-3 h-3 rounded-full bg-rose-600 border border-white ring-4 ring-rose-50 shrink-0" />
                          <div className="flex justify-between items-center">
                            <h4 className="text-xs font-black text-slate-900">۴. بهای انرژی تاسیسات در حسابداری</h4>
                            <span className="text-[10px] bg-rose-100 text-rose-950 px-2 py-0.5 rounded-md font-black shrink-0">حسابداری مالی</span>
                          </div>
                          <p className="text-[11px] text-natural-text leading-relaxed">
                            تسویه قبض برق فشار قوی به ارزش <strong className="font-mono text-xs">۲۸,۰۰۰,۰۰۰ تومان</strong> برای تامین ایمنی پمپاژ چاه‌ها و اوزون رسانی (تراکنش t3). امنیت گله تامین شد.
                          </p>
                        </div>
                      </>
                    )}

                  </div>
                )}
                
              </div>
            </div>
          </div>

          {/* Broad-spectrum consumables tracking feed */}
          <div className="bg-white border border-natural-border p-5 rounded-3xl space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="text-xs font-black text-natural-dark flex items-center gap-1.5 font-bold text-indigo-950">
                <span className="p-1 bg-indigo-50 text-indigo-700 rounded text-[10px]">⚖️</span>
                <span>دفتر جامع رهگیری لایف‌سایکل تمام مواد مصرفی مزارع (بدو ورود تا مصرف/انقضا)</span>
              </h3>
              <span className="text-[10px] text-natural-text/60 font-sans font-bold">پایش زنده سراسری ۵ دپارتمان به همراه همپوشانی مستقیم</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="border-b border-natural-border/30 text-natural-text/60 font-sans">
                    <th className="pb-2">دپارتمان متبوع</th>
                    <th className="pb-2">نام کالا / مواد اولیه تبار</th>
                    <th className="pb-2">مقدار تحویلی</th>
                    <th className="pb-2">تاریخ ورود</th>
                    <th className="pb-2">تاریخ مصرف</th>
                    <th className="pb-2">تاریخ انقضاء</th>
                    <th className="pb-2 text-center">وضعیت ردیابی</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-natural-border/20">
                  {consumables.map(c => {
                    const isExp = c.expiryDate && c.expiryDate < "1405/03/10" && c.status !== "consumed";
                    return (
                      <tr key={c.id} className="hover:bg-slate-50/50">
                        <td className="py-2.5">
                          <span className="bg-indigo-50 text-indigo-950 px-2 py-0.5 rounded-full text-[10px] font-black shrink-0">
                            {getDeptLabel(c.department)}
                          </span>
                        </td>
                        <td className="py-2.5 font-bold text-natural-dark">
                          <div>{c.itemName}</div>
                          {c.notes && <div className="text-[9px] text-natural-text/60 mt-0.5">{c.notes}</div>}
                        </td>
                        <td className="py-2.5 font-mono">{c.quantity} {c.unit}</td>
                        <td className="py-2.5 font-mono">{c.entryDate}</td>
                        <td className="py-2.5 font-mono">
                          {c.consumptionDate ? (
                            <span className="text-emerald-750 bg-emerald-50 px-2 py-0.5 rounded text-[10px] font-bold">
                              ✔️ مصرف‌شده ({c.consumptionDate})
                            </span>
                          ) : (
                            <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded text-[10px]">
                              ⏳ در نوبت مصرف دپارتمان
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 font-mono">
                          {c.expiryDate ? (
                            <span className={isExp ? "text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded text-[10px] font-bold" : ""}>{c.expiryDate}</span>
                          ) : "فاقد انقضا مشخص"}
                        </td>
                        <td className="py-2.5 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-black ${
                            c.status === "consumed" ? "bg-emerald-100 text-emerald-950" : isExp ? "bg-rose-100 text-rose-955 animate-pulse" : "bg-sky-100 text-sky-955"
                          }`}>
                            {c.status === "consumed" ? "تکمیل شده" : isExp ? "منقضی‌شده" : "در انبار دپارتمان"}
                          </span>
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

    </div>
  );
}
