/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Pool, MovementLog, SturgeonBreed } from "../types";
import { 
  ArrowRightLeft, 
  User, 
  Tag, 
  Clock, 
  Compass, 
  HelpCircle,
  FileSpreadsheet,
  AlertCircle,
  Edit,
  Layers,
  CheckCircle,
  PlusCircle
} from "lucide-react";

interface TransferManagerProps {
  pools: Pool[];
  movements: MovementLog[];
  halls?: any[];
  onExecuteTransfer: (
    fromPoolId: string,
    toPoolId: string,
    amount: number,
    reason: string,
    operator: string,
    chipId?: string,
    breed?: SturgeonBreed,
    gender?: string,
    avgWeight?: number
  ) => boolean;
  setPools?: React.Dispatch<React.SetStateAction<Pool[]>>;
  setMovements?: React.Dispatch<React.SetStateAction<MovementLog[]>>;
  initialFromPoolId?: string;
  onClearInitialFromPoolId?: () => void;
}

export const TransferManager: React.FC<TransferManagerProps> = ({
  pools,
  movements,
  halls,
  onExecuteTransfer,
  setPools,
  setMovements,
  initialFromPoolId,
  onClearInitialFromPoolId
}) => {
  const activePools = pools.filter(p => p.count > 0);

  // Form Tab Control
  const [activeFormTab, setActiveFormTab] = useState<"transfer" | "certificate">("transfer");

  // States for Transfer Form
  const [fromPoolId, setFromPoolId] = useState<string>(activePools[0]?.id || "");
  const [selectedBreed, setSelectedBreed] = useState<SturgeonBreed>(activePools[0]?.breed || SturgeonBreed.BELUGA);
  const [gender, setGender] = useState<string>("نامشخص / ترکیبی");
  const [customAvgWeight, setCustomAvgWeight] = useState<number>(activePools[0]?.avgWeightGrams || 0);

  // Synchronize when redirected from other parts of the app (e.g. PoolQuickLogger)
  useEffect(() => {
    if (initialFromPoolId) {
      setFromPoolId(initialFromPoolId);
      setActiveFormTab("transfer");
      const pool = pools.find(p => p.id === initialFromPoolId);
      if (pool) {
        setSelectedBreed(pool.breed);
        setCustomAvgWeight(pool.avgWeightGrams);
      }
      if (onClearInitialFromPoolId) {
        onClearInitialFromPoolId();
      }
    }
  }, [initialFromPoolId, onClearInitialFromPoolId, pools]);

  const [toPoolId, setToPoolId] = useState<string>("");
  const [transferCount, setTransferCount] = useState<number>(50);
  const [reason, setReason] = useState<string>("");
  const [operator, setOperator] = useState<string>("");
  const [chipId, setChipId] = useState<string>("");

  // Filters for ledger view
  const [filterHallId, setFilterHallId] = useState<string>("all");
  const [filterPoolId, setFilterPoolId] = useState<string>("all");

  // States for Certificate / Breed Correction Form
  const [selectedPoolId, setSelectedPoolId] = useState<string>("");
  const [editBreed, setEditBreed] = useState<SturgeonBreed>(SturgeonBreed.BELUGA);
  const [editCount, setEditCount] = useState<number>(0);
  const [editAvgWeight, setEditAvgWeight] = useState<number>(0);
  const [editName, setEditName] = useState<string>("");
  const [editOperator, setEditOperator] = useState<string>("");
  const [editReason, setEditReason] = useState<string>("");
  const [editChipId, setEditChipId] = useState<string>("");

  // Tracing search state
  const [traceChipId, setTraceChipId] = useState<string>("");
  const [tracedLogs, setTracedLogs] = useState<MovementLog[]>([]);
  const [hasTraced, setHasTraced] = useState<boolean>(false);

  const [errorMessage, setErrorMessage] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [certErrorMessage, setCertErrorMessage] = useState<string>("");
  const [certSuccessMessage, setCertSuccessMessage] = useState<string>("");

  const sourcePool = pools.find(p => p.id === fromPoolId);
  const destPool = pools.find(p => p.id === toPoolId);

  // Load pool data when selected for certificate correction
  const handleSelectPoolToEdit = (poolId: string) => {
    setSelectedPoolId(poolId);
    setCertErrorMessage("");
    setCertSuccessMessage("");
    const pool = pools.find(p => p.id === poolId);
    if (pool) {
      setEditBreed(pool.breed);
      setEditCount(pool.count);
      setEditAvgWeight(pool.avgWeightGrams);
      setEditName(pool.name);
      setEditChipId(pool.chipId || "");
    } else {
      setEditBreed(SturgeonBreed.BELUGA);
      setEditCount(0);
      setEditAvgWeight(0);
      setEditName("");
      setEditChipId("");
    }
  };

  const handleSubmitTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!fromPoolId || !toPoolId) {
      setErrorMessage("لطفا هم استخر مبدا و هم مقصد را انتخاب نمایید.");
      return;
    }
    if (fromPoolId === toPoolId) {
      setErrorMessage("استخر مبدا و مقصد نمی‌توانند یکسان باشند.");
      return;
    }
    if (transferCount <= 0) {
      setErrorMessage("تعداد ماهیان ارسالی باید بزرگتر از صفر باشد.");
      return;
    }
    if (!reason.trim()) {
      setErrorMessage("لطفا دلیل موجه برای جابجایی ثبت و یادداشت فرمایید.");
      return;
    }
    if (!operator.trim()) {
      setErrorMessage("لطفا نام اپراتور یا مسئول ناظر انتقال را وارد کنید.");
      return;
    }

    if (sourcePool && transferCount > sourcePool.count) {
      setErrorMessage(`خطا: جابجایی ناممکن است. استخر مبدا فقط ${sourcePool.count} قطعه ماهی دارد.`);
      return;
    }

    // Breed compatibility check
    if (sourcePool && destPool && destPool.count > 0 && sourcePool.breed !== destPool.breed) {
      const confirmMix = window.confirm(
        `🚨 توجه: نژاد استخر مبدا (${sourcePool.breed}) با نژاد فعلی استخر مقصد (${destPool.breed}) متفاوت است!\n\nمخلوط کردن گونه‌های مختلف تاس‌ماهی می‌تواند پایش FCR و رشد را مختل کند. آیا مایل به تایید و ادغام هستید؟`
      );
      if (!confirmMix) {
        setErrorMessage("عملیات به دلیل تداخل نژادی توسط اپراتور لغو شد.");
        return;
      }
    }

    // Stocking density & capacity validation
    if (sourcePool && destPool) {
      const addedBiomassKg = (transferCount * sourcePool.avgWeightGrams) / 1000;
      const expectedBiomassKg = destPool.totalBiomassKg + addedBiomassKg;
      
      const diameter = destPool.diameter || 4;
      const radius = diameter / 2;
      const height = destPool.height || 1.2;
      const volumeM3 = Math.PI * radius * radius * height;
      const densityKgM3 = expectedBiomassKg / volumeM3;

      if (densityKgM3 > 55) {
        const confirmOverload = window.confirm(
          `⚠️ هشدار تراکم هیدرولیکی: بیوماس استخر مقصد به ${expectedBiomassKg.toFixed(1)} کیلوگرم (${densityKgM3.toFixed(1)} kg/m³) افزایش می‌یابد که فراتر از آستانه مجاز ۵۵ کیلوگرم بر متر مکعب است. آیا ریسک کاهش اکسیژن و تلفات را می‌پذیرید؟`
        );
        if (!confirmOverload) {
          setErrorMessage("عملیات انتقال به علت عدم انطباق با استانداردهای هیدرولیکی و تراکم بالا لغو گردید.");
          return;
        }
      }
    }

    // Call state execution in parent
    const success = onExecuteTransfer(
      fromPoolId, 
      toPoolId, 
      transferCount, 
      reason, 
      operator, 
      chipId.trim() || undefined, 
      selectedBreed,
      gender,
      customAvgWeight
    );
    
    if (success) {
      setSuccessMessage(`عملیات انتقال تعداد ${transferCount} قطعه با موفقیت انجام و کدهای ردیابی در دفتر کل ثبت شد.`);
      setTransferCount(50);
      setReason("");
      setOperator("");
      setChipId("");
    } else {
      setErrorMessage("خطایی در حین ثبت انتقالی رخ داد.");
    }
  };

  const handleSaveCertificate = (e: React.FormEvent) => {
    e.preventDefault();
    setCertErrorMessage("");
    setCertSuccessMessage("");

    if (!selectedPoolId) {
      setCertErrorMessage("لطفا حوضچه مورد نظر را جهت اصلاح شناسنامه انتخاب کنید.");
      return;
    }
    if (!editName.trim()) {
      setCertErrorMessage("نام یا شناسه حوضچه نمی‌تواند خالی باشد.");
      return;
    }
    if (editCount < 0) {
      setCertErrorMessage("تعداد ماهیان نمی‌تواند منفی باشد.");
      return;
    }
    if (editAvgWeight < 0) {
      setCertErrorMessage("وزن متوسط ماهیان نمی‌تواند منفی باشد.");
      return;
    }
    if (!editOperator.trim()) {
      setCertErrorMessage("لطفا نام کارشناس/اپراتور مسئول را وارد کنید.");
      return;
    }
    if (!editReason.trim()) {
      setCertErrorMessage("لطفا دلیل اصلاح یا تغییر نژاد تبارشناسی را مرقوم فرمایید.");
      return;
    }

    const poolToEdit = pools.find(p => p.id === selectedPoolId);
    if (!poolToEdit) {
      setCertErrorMessage("حوضچه مشخص شده معتبر نیست.");
      return;
    }

    const oldBreed = poolToEdit.breed;
    const oldCount = poolToEdit.count;
    const oldAvgWeight = poolToEdit.avgWeightGrams;

    // 1. Update Pools state
    if (setPools) {
      setPools(prev => prev.map(p => {
        if (p.id === selectedPoolId) {
          return {
            ...p,
            name: editName.trim(),
            breed: editBreed,
            count: editCount,
            avgWeightGrams: editAvgWeight,
            totalBiomassKg: parseFloat(((editCount * editAvgWeight) / 1000).toFixed(1)),
            chipId: editChipId.trim() || undefined,
            updatedAtJalali: "1405/04/17"
          };
        }
        return p;
      }));
    }

    // 2. Append standard tracking Movement Ledger index (linking to breed correction genealogy)
    if (setMovements) {
      const getPersianDateLocal = (): string => {
        try {
          const date = new Date();
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
          return "1405/04/17";
        }
      };

      const newLog: MovementLog = {
        id: `mov-gen-${Date.now().toString().slice(-3)}-${Math.floor(Math.random() * 90 + 10)}`,
        date: getPersianDateLocal(),
        breed: editBreed,
        count: editCount,
        avgWeightGrams: editAvgWeight,
        fromPoolId: null, // null representing seed modification
        toPoolId: selectedPoolId,
        fromPoolName: `شناسنامه پیشین (${oldBreed.split(" ")[0]} - تعداد: ${oldCount})`,
        toPoolName: `${editName.trim()} (سالن ${poolToEdit.hallId})`,
        reason: `[تغییر نژاد/اصلاح شناسنامه] ${editReason.trim()}`,
        operator: editOperator.trim(),
        chipId: editChipId.trim() || undefined
      };

      setMovements(prev => [newLog, ...prev]);
    }

    setCertSuccessMessage("شناسنامه حوضچه با موفقیت ویرایش و اصلاح گردید و زنجیره تبارشناسی آن در دفتر کل جابه‌جایی‌ها ثبت شد.");
    setEditReason("");
    setEditOperator("");
  };

  return (
    <div id="transfer-manager-grid" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* COLUMN 1: TABBED EXECUTION & CORRECTION FORMS */}
      <div className="lg:col-span-1 bg-white rounded-3xl p-6 border border-natural-border shadow-sm flex flex-col justify-between">
        <div>
          {/* TAB HEADERS */}
          <div className="flex border-b border-natural-border mb-5 gap-1">
            <button
              onClick={() => {
                setActiveFormTab("transfer");
                setErrorMessage("");
                setSuccessMessage("");
              }}
              className={`flex-1 pb-3 text-xs font-bold text-center border-b-2 transition-all cursor-pointer ${
                activeFormTab === "transfer"
                  ? "border-natural-forest text-natural-forest"
                  : "border-transparent text-natural-text/50 hover:text-natural-text"
              }`}
            >
              <div className="flex items-center justify-center gap-1.5">
                <ArrowRightLeft size={14} />
                <span>ثبت جابجایی بین حوضچه‌ها</span>
              </div>
            </button>
            <button
              onClick={() => {
                setActiveFormTab("certificate");
                setCertErrorMessage("");
                setCertSuccessMessage("");
              }}
              className={`flex-1 pb-3 text-xs font-bold text-center border-b-2 transition-all cursor-pointer ${
                activeFormTab === "certificate"
                  ? "border-natural-earth text-natural-earth"
                  : "border-transparent text-natural-text/50 hover:text-natural-text"
              }`}
            >
              <div className="flex items-center justify-center gap-1.5">
                <Edit size={14} />
                <span>اصلاح شناسنامه و نژاد</span>
              </div>
            </button>
          </div>

          {/* TAB 1: NEW TRANSFER FORM */}
          {activeFormTab === "transfer" && (
            <div>
              <div className="mb-4">
                <h3 className="text-sm font-bold text-natural-dark font-sans text-right mb-1">جابجایی جدید بین حوضچه‌ها</h3>
                <p className="text-[11px] text-natural-text/70 font-sans text-right">ثبت و کسر شمارش از مبدا و شارژ اتوماتیک به مقصد</p>
              </div>

              <form onSubmit={handleSubmitTransfer} className="space-y-4 text-xs font-sans">
                <div>
                  <label className="block text-natural-text font-semibold mb-1 text-right">استخر مبدا (کاهش ظرفیت):</label>
                  <select
                    value={fromPoolId}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFromPoolId(val);
                      setErrorMessage("");
                      const pool = pools.find(p => p.id === val);
                      if (pool) {
                        setSelectedBreed(pool.breed);
                        setCustomAvgWeight(pool.avgWeightGrams);
                      }
                    }}
                    className="w-full text-xs font-sans rounded-xl border border-natural-border p-2.5 bg-[#FDFCF8] focus:border-natural-earth focus:outline-none text-natural-dark font-medium"
                  >
                    <option value="">-- انتخاب استخر مبدا --</option>
                    {(() => {
                      const resolvedHalls = halls || Array.from(new Set(pools.map(p => p.hallId)))
                        .sort((a, b) => {
                          const aNum = typeof a === "number" ? a : parseInt(String(a)) || 0;
                          const bNum = typeof b === "number" ? b : parseInt(String(b)) || 0;
                          return aNum - bNum;
                        })
                        .map(hallId => ({
                          id: typeof hallId === "number" ? hallId : parseInt(String(hallId)) || 0,
                          name: `سالن شماره ${hallId}`
                        }));

                      return resolvedHalls.map(hall => {
                        const hallPools = activePools.filter(p => p.hallId === hall.id);
                        if (hallPools.length === 0) return null;
                        return (
                          <optgroup key={hall.id} label={hall.name}>
                            {hallPools.map(p => (
                              <option key={p.id} value={p.id}>
                                {p.name} - تعداد: {p.count} قطعه - گونه: {p.breed.split(" ")[0]}
                              </option>
                            ))}
                          </optgroup>
                        );
                      });
                    })()}
                  </select>
                </div>

                <div>
                  <label className="block text-natural-text font-semibold mb-1 text-right">واحد یا استخر مقصد (افزایش ظرفیت):</label>
                  <select
                    value={toPoolId}
                    onChange={(e) => {
                      setToPoolId(e.target.value);
                      setErrorMessage("");
                    }}
                    className="w-full text-xs font-sans rounded-xl border border-natural-border p-2.5 bg-[#FDFCF8] focus:border-natural-earth focus:outline-none text-natural-dark font-medium"
                  >
                    <option value="">-- انتخاب استخر یا مقصد خروجی --</option>
                    {(() => {
                      const resolvedHalls = halls || Array.from(new Set(pools.map(p => p.hallId)))
                        .sort((a, b) => {
                          const aNum = typeof a === "number" ? a : parseInt(String(a)) || 0;
                          const bNum = typeof b === "number" ? b : parseInt(String(b)) || 0;
                          return aNum - bNum;
                        })
                        .map(hallId => ({
                          id: typeof hallId === "number" ? hallId : parseInt(String(hallId)) || 0,
                          name: `سالن شماره ${hallId}`
                        }));

                      return (
                        <>
                          {resolvedHalls.map(hall => {
                            const hallPools = pools.filter(p => p.id !== fromPoolId && p.hallId === hall.id);
                            if (hallPools.length === 0) return null;
                            return (
                              <optgroup key={hall.id} label={`حوضچه‌های ${hall.name}`}>
                                {hallPools.map(p => (
                                  <option key={p.id} value={p.id}>
                                    {p.name} - موجودی: {p.count} قطعه ({p.breed.split(" ")[0]})
                                  </option>
                                ))}
                              </optgroup>
                            );
                          })}
                          <optgroup label="بخش‌ها و خروجی‌های غیر کارگاهی">
                            <option value="processing">⚙️ واحد فرآوری تاس‌ماهیان (استحصال خاویار/فیله)</option>
                            <option value="coldstorage">❄️ سردخانه مرکزی گوشت و خاویار</option>
                            <option value="sales">💰 فروش مستقیم بازار / ترخیص مشتری</option>
                          </optgroup>
                        </>
                      );
                    })()}
                  </select>
                </div>

                {sourcePool && destPool && (
                  <div className="bg-natural-khaki p-3 rounded-xl border border-natural-border flex items-center justify-between text-[11px] gap-2 text-natural-text shadow-inner">
                    <span>
                      نقل و انتقال گونه: <strong className="text-natural-earth">{sourcePool.breed}</strong>
                    </span>
                    <span>
                      وزن متوسط مبدا: <strong className="text-natural-dark">{sourcePool.avgWeightGrams}g</strong>
                    </span>
                  </div>
                )}

                {/* 🐟 EDITABLE SPEC DETAILS (Breed, Gender, AvgWeight) */}
                {sourcePool && (
                  <div className="bg-[#FAF9F5] p-3.5 rounded-2xl border border-natural-border/70 space-y-3 shadow-xs">
                    <span className="block text-[11px] font-black text-natural-earth text-right border-r-2 border-natural-earth pr-1.5 mb-1">
                      مشخصات زیستی کلونی جابجاشونده (ویژه ردیابی)
                    </span>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10.5px] text-natural-text font-bold mb-1 text-right">نژاد یا گونه:</label>
                        <select
                          value={selectedBreed}
                          onChange={(e) => setSelectedBreed(e.target.value as SturgeonBreed)}
                          className="w-full text-[11px] font-sans rounded-lg border border-natural-border p-2 bg-white text-natural-dark focus:outline-none font-medium"
                        >
                          {Object.values(SturgeonBreed).map(b => (
                            <option key={b} value={b}>{b.split(" ")[0] || b}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10.5px] text-natural-text font-bold mb-1 text-right">جنسیت گله:</label>
                        <select
                          value={gender}
                          onChange={(e) => setGender(e.target.value)}
                          className="w-full text-[11px] font-sans rounded-lg border border-natural-border p-2 bg-white text-natural-dark focus:outline-none"
                        >
                          <option value="نامشخص / ترکیبی">نامشخص / ترکیبی</option>
                          <option value="ماده / خاویاری">ماده / خاویاری ♀</option>
                          <option value="نر / گوشتی">نر / گوشتی ♂</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10.5px] text-natural-text font-bold mb-1 text-right">میانگین وزنی گله (گرم):</label>
                      <input
                        type="number"
                        min="1"
                        value={customAvgWeight}
                        onChange={(e) => setCustomAvgWeight(parseInt(e.target.value) || 0)}
                        className="w-full font-mono text-xs rounded-lg border border-natural-border p-2 bg-white text-center text-natural-dark font-bold focus:outline-none"
                      />
                      <span className="text-[9.5px] text-natural-text/60 text-right block mt-0.5 font-sans">
                        پیش‌فرض استخر مبدا: {sourcePool.avgWeightGrams} گرم
                      </span>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-natural-text font-semibold mb-1 text-right">تعداد ماهی جابجا شده (قطعه):</label>
                  <input
                    type="number"
                    min="1"
                    value={transferCount}
                    onChange={(e) => setTransferCount(parseInt(e.target.value) || 0)}
                    className="w-full font-mono text-xs rounded-xl border border-natural-border p-2.5 bg-[#FDFCF8] focus:border-natural-earth focus:outline-none text-center text-natural-dark font-bold"
                  />
                </div>

                <div>
                  <label className="block text-natural-text font-semibold mb-1 text-right">
                    شماره میکروچیپ (های) ماهی مولد:
                    <span className="text-[10px] text-natural-earth font-normal font-sans mr-1">(برای ردیابی فردی / اختیاری)</span>
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 right-3 flex items-center text-natural-text/40">
                      <Tag size={13} />
                    </span>
                    <input
                      type="text"
                      value={chipId}
                      onChange={(e) => setChipId(e.target.value)}
                      className="w-full font-mono text-xs rounded-xl border border-natural-border p-2.5 pr-9 bg-[#FDFCF8] focus:border-natural-earth focus:outline-none text-natural-dark placeholder-natural-text/30 text-left dir-ltr"
                      placeholder="مثال: CH-BEL-993-A"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-natural-text font-semibold mb-1 text-right">دلیل جابجایی (رقم بندی، سایزبندی، فروش...):</label>
                  <textarea
                    rows={2}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full text-xs font-sans rounded-xl border border-natural-border p-2.5 bg-[#FDFCF8] focus:border-natural-earth focus:outline-none text-natural-dark"
                    placeholder="مثال: رقم‌بندی گله‌های بالای ۵۰۰ گرم و هدایت به پیش‌پروارهای بزرگتر"
                  />
                </div>

                <div>
                  <label className="block text-natural-text font-semibold mb-1 text-right">ناظر / اپراتور نقل و انتقال:</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 right-3 flex items-center text-natural-text/60">
                      <User size={14} />
                    </span>
                    <input
                      type="text"
                      value={operator}
                      onChange={(e) => setOperator(e.target.value)}
                      className="w-full text-xs font-sans rounded-xl border border-natural-border p-2.5 pr-9 bg-[#FDFCF8] focus:border-natural-earth focus:outline-none text-natural-dark"
                      placeholder="مثال: دکتر علوی"
                    />
                  </div>
                </div>

                {errorMessage && (
                  <div className="p-3 bg-natural-clay/10 text-natural-clay border border-natural-clay/20 rounded-xl flex items-center gap-2 font-semibold">
                    <AlertCircle size={14} className="shrink-0" />
                    <p>{errorMessage}</p>
                  </div>
                )}

                {successMessage && (
                  <div id="transfer-success" className="p-3 bg-natural-forest/10 text-natural-forest border border-natural-forest/20 rounded-xl flex items-center gap-2 font-semibold">
                    <span className="text-base">✅</span>
                    <p>{successMessage}</p>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-3 bg-natural-forest hover:bg-natural-forest-hover text-white font-bold rounded-xl text-xs transition-colors cursor-pointer shadow-sm"
                >
                  ثبت جابجایی و تصحیح ظرفیت حوضچه‌ها
                </button>
              </form>
            </div>
          )}

          {/* TAB 2: CERTIFICATE, BREED & COUNT CORRECTION FORM */}
          {activeFormTab === "certificate" && (
            <div>
              <div className="mb-4">
                <h3 className="text-sm font-bold text-natural-earth font-sans text-right mb-1">اصلاح شناسنامه و تبارشناسی کلونی</h3>
                <p className="text-[11px] text-natural-text/70 font-sans text-right">تصحیح مستقیم شناسه، تعداد و نژاد تاس‌ماهیان با ثبت در زنجیره تبارشناسی</p>
              </div>

              <form onSubmit={handleSaveCertificate} className="space-y-4 text-xs font-sans">
                <div>
                  <label className="block text-natural-text font-semibold mb-1 text-right">انتخاب حوضچه جهت ویرایش شناسنامه:</label>
                  <select
                    value={selectedPoolId}
                    onChange={(e) => handleSelectPoolToEdit(e.target.value)}
                    className="w-full text-xs font-sans rounded-xl border border-natural-border p-2.5 bg-[#FDFCF8] focus:border-natural-earth focus:outline-none text-natural-dark font-medium"
                  >
                    <option value="">-- انتخاب حوضچه --</option>
                    {pools.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name} (سالن {p.hallId}) - نژاد: {p.breed.split(" ")[0]} - تعداد: {p.count}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedPoolId && (
                  <div className="space-y-4 border-t border-natural-border/40 pt-4">
                    <div className="bg-natural-khaki/30 p-2.5 rounded-xl border border-natural-border/50 text-[11px] flex justify-between items-center text-natural-text">
                      <span>شناسه سیستمی شناسنامه استخر:</span>
                      <strong className="text-natural-dark font-mono">{selectedPoolId}</strong>
                    </div>

                    <div>
                      <label className="block text-natural-text font-semibold mb-1 text-right">اصلاح نام / شناسه شناسنامه استخر:</label>
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full text-xs font-sans rounded-xl border border-natural-border p-2.5 bg-[#FDFCF8] focus:border-natural-earth focus:outline-none text-natural-dark"
                        placeholder="نام استخر"
                      />
                    </div>

                    <div>
                      <label className="block text-natural-text font-semibold mb-1 text-right">اصلاح یا افزودن نژاد (Sturgeon Breed):</label>
                      <select
                        value={editBreed}
                        onChange={(e) => setEditBreed(e.target.value as SturgeonBreed)}
                        className="w-full text-xs font-sans rounded-xl border border-natural-border p-2.5 bg-[#FDFCF8] focus:border-natural-earth focus:outline-none text-natural-dark font-medium"
                      >
                        {Object.values(SturgeonBreed).map(b => (
                          <option key={b} value={b}>{b}</option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-natural-text font-semibold mb-1 text-right">اصلاح تعداد (قطعه):</label>
                        <input
                          type="number"
                          min="0"
                          value={editCount}
                          onChange={(e) => setEditCount(parseInt(e.target.value) || 0)}
                          className="w-full font-mono text-xs rounded-xl border border-natural-border p-2 bg-[#FDFCF8] focus:outline-none text-center text-natural-dark font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-natural-text font-semibold mb-1 text-right">وزن متوسط (گرم):</label>
                        <input
                          type="number"
                          min="0"
                          value={editAvgWeight}
                          onChange={(e) => setEditAvgWeight(parseInt(e.target.value) || 0)}
                          className="w-full font-mono text-xs rounded-xl border border-natural-border p-2 bg-[#FDFCF8] focus:outline-none text-center text-natural-dark font-bold"
                        />
                      </div>
                    </div>

                    <div className="bg-natural-khaki/40 p-3 rounded-2xl border border-natural-border/30 flex justify-between items-center text-[10.5px] text-natural-dark font-sans leading-relaxed">
                      <span>محاسبه بیوماس اصلاحی جدید:</span>
                      <strong>{parseFloat(((editCount * editAvgWeight) / 1000).toFixed(1))} کیلوگرم</strong>
                    </div>

                    <div>
                      <label className="block text-natural-text font-semibold mb-1 text-right">
                        شماره میکروچیپ / پلاک تبارشناسی:
                        <span className="text-[10px] text-natural-earth font-normal font-sans mr-1">(برای ردیابی فردی / اختیاری)</span>
                      </label>
                      <div className="relative">
                        <span className="absolute inset-y-0 right-3 flex items-center text-natural-text/40">
                          <Tag size={13} />
                        </span>
                        <input
                          type="text"
                          value={editChipId}
                          onChange={(e) => setEditChipId(e.target.value)}
                          className="w-full font-mono text-xs rounded-xl border border-natural-border p-2.5 pr-9 bg-[#FDFCF8] focus:border-natural-earth focus:outline-none text-natural-dark placeholder-natural-text/30 text-left dir-ltr"
                          placeholder="مثال: CH-BEL-993-A"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-natural-text font-semibold mb-1 text-right">علت اصلاح شناسنامه / جابجایی نژاد تبارشناسی:</label>
                      <textarea
                        rows={2}
                        value={editReason}
                        onChange={(e) => setEditReason(e.target.value)}
                        className="w-full text-xs font-sans rounded-xl border border-natural-border p-2.5 bg-[#FDFCF8] focus:border-natural-earth focus:outline-none text-natural-dark"
                        placeholder="مثال: تصحیح خطا در ممیزی دوره ای، ثبت نژاد فیل‌ماهی مولد ارسالی از بند الف"
                      />
                    </div>

                    <div>
                      <label className="block text-natural-text font-semibold mb-1 text-right">مسئول اصلاح شناسنامه / کارشناس:</label>
                      <div className="relative">
                        <span className="absolute inset-y-0 right-3 flex items-center text-natural-text/60">
                          <User size={14} />
                        </span>
                        <input
                          type="text"
                          value={editOperator}
                          onChange={(e) => setEditOperator(e.target.value)}
                          className="w-full text-xs font-sans rounded-xl border border-natural-border p-2.5 pr-9 bg-[#FDFCF8] focus:border-natural-earth focus:outline-none text-natural-dark"
                          placeholder="مثال: مهندس کریمی"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {certErrorMessage && (
                  <div className="p-3 bg-natural-clay/10 text-natural-clay border border-natural-clay/20 rounded-xl flex items-center gap-2 font-semibold text-right">
                    <AlertCircle size={14} className="shrink-0" />
                    <p>{certErrorMessage}</p>
                  </div>
                )}

                {certSuccessMessage && (
                  <div className="p-3 bg-natural-forest/10 text-natural-forest border border-natural-forest/20 rounded-xl flex items-center gap-2 font-semibold text-right">
                    <span className="text-base shrink-0">✅</span>
                    <p className="text-[11px] leading-relaxed">{certSuccessMessage}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={!selectedPoolId}
                  className="w-full py-3 bg-natural-earth hover:bg-natural-earth/95 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ثبت اصلاحیه شناسنامه و تبارشناسی
                </button>
              </form>
            </div>
          )}
        </div>

        <p className="text-[10px] text-natural-text/60 leading-relaxed mt-4 font-sans text-center">
          * جابجایی یا اصلاح شناسنامه بلافاصله روی بیوماس کل حوضچه‌ها و پرونده‌های تبارشناسی کلونی تاثیرگذار بوده و در لیست زیر به‌صورت برچسب ردیابی ذخیره می‌شود.
        </p>
      </div>

      {/* COLUMN 2 & 3: TRACEABLE TRANSFER HISTORY LOG LEDGER */}
      <div className="lg:col-span-2 bg-[#F5F2E8] text-natural-text rounded-3xl p-6 border border-natural-border shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-center mb-6 border-b border-natural-border pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-natural-forest text-natural-khaki rounded-xl font-bold border border-natural-forest-hover">
                <FileSpreadsheet size={18} />
              </div>
              <div>
                <h3 className="text-base font-bold text-natural-dark font-sans text-right">دفتر ردیابی جابجایی‌ها و تبارشناسی کلونی‌ها</h3>
                <p className="text-xs text-natural-text/70 font-sans text-right">دفتر کل مرجع برای رهگیری کدهای ترخیص، تغییر نژاد و انتقال نسل تاس‌ماهی</p>
              </div>
            </div>
            
            <span className="text-[10px] font-mono text-natural-text/60 font-bold bg-white px-2 py-1 rounded-lg border border-natural-border shadow-sm shrink-0">
              {movements.length} واقعه ثبت شده
            </span>
          </div>

          {/* MICROCHIP TRACING PORTAL (سامانه ردیابی میکروچیپ) */}
          <div className="bg-white/80 border border-natural-border/60 rounded-2xl p-4.5 mb-6 shadow-sm space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-amber-500 rounded-full animate-pulse" />
              <h4 className="text-xs font-black text-natural-dark font-sans text-right">سامانه ردیابی آنی مسیر حرکت مولدین با میکروچیپ</h4>
            </div>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              setHasTraced(true);
              if (!traceChipId.trim()) {
                setTracedLogs([]);
                return;
              }
              const found = movements.filter(m => 
                m.chipId && m.chipId.toLowerCase().includes(traceChipId.trim().toLowerCase())
              );
              setTracedLogs(found);
            }} className="flex gap-2">
              <input
                type="text"
                value={traceChipId}
                onChange={(e) => {
                  setTraceChipId(e.target.value);
                  if (!e.target.value.trim()) {
                    setHasTraced(false);
                    setTracedLogs([]);
                  }
                }}
                placeholder="شماره میکروچیپ را وارد نمایید (مثال: CH-BEL-993-A)..."
                className="flex-grow text-xs font-mono rounded-xl border border-natural-border px-3.5 py-2.5 bg-white focus:outline-none focus:border-amber-600 text-natural-dark text-left dir-ltr"
              />
              <button
                type="submit"
                className="bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs px-5 py-2.5 cursor-pointer transition-colors shrink-0"
                style={{ direction: 'rtl' }}
              >
                رهگیری مسیر ماهی
              </button>
            </form>

            {hasTraced && (
              <div className="bg-[#FAF9F5] border border-natural-border/50 rounded-xl p-3 text-xs space-y-2 mt-2">
                {tracedLogs.length > 0 ? (
                  <div className="space-y-3 text-right">
                    <p className="text-[11px] text-emerald-800 font-bold font-sans">
                      ✓ تعداد {tracedLogs.length} جابه‌جایی موفق برای این میکروچیپ ثبت شده است. زنجیره حرکت (از قدیمی‌ترین به جدیدترین):
                    </p>
                    <div className="relative border-r border-[#D68227]/30 pr-4 mr-2 py-1 space-y-4">
                      {tracedLogs.slice().reverse().map((log, idx) => (
                        <div key={log.id} className="relative">
                          <div className="absolute right-[-21.5px] top-1 w-2.5 h-2.5 rounded-full bg-amber-600 border border-white" />
                          
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded font-mono font-bold">{log.date}</span>
                              <span className="text-[10px] text-natural-text/60 font-semibold font-sans">بند: {log.operator}</span>
                            </div>
                            <p className="text-[11px] text-natural-dark font-medium leading-relaxed font-sans">
                              انتقال از <strong className="text-natural-clay">{log.fromPoolName}</strong> به <strong className="text-natural-forest">{log.toPoolName}</strong> (همراه با {log.count} قطعه، گونه {log.breed})
                            </p>
                            <p className="text-[10px] text-natural-text/70 italic font-sans">
                              علت اقدام: {log.reason}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4 text-natural-clay text-[11px] font-bold font-sans">
                    هیچ سابقه‌ای از جابجایی یا انتقال با کد میکروچیپ "{traceChipId}" در مانیتورینگ کارگاه یافت نشد.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* LEDGER FILTER CONTROLS (تفکیک به تفکیک سالن و استخر) */}
          <div className="grid grid-cols-2 gap-3 bg-white/75 p-3.5 rounded-2xl border border-natural-border/60 mb-5 text-xs font-sans">
            <div>
              <label className="block text-natural-dark font-black mb-1.5 text-right">تفکیک بر اساس سالن:</label>
              <select
                value={filterHallId}
                onChange={(e) => {
                  setFilterHallId(e.target.value);
                  setFilterPoolId("all"); // Reset pool filter when hall changes
                }}
                className="w-full text-xs font-sans rounded-xl border border-natural-border/80 p-2.5 bg-white text-natural-dark font-medium focus:outline-none focus:border-natural-earth"
              >
                <option value="all">همه سالن‌ها (کل مجتمع)</option>
                {(() => {
                  const resolvedHalls = halls || Array.from(new Set(pools.map(p => p.hallId)))
                    .sort((a, b) => {
                      const aNum = typeof a === "number" ? a : parseInt(String(a)) || 0;
                      const bNum = typeof b === "number" ? b : parseInt(String(b)) || 0;
                      return aNum - bNum;
                    })
                    .map(hallId => ({
                      id: typeof hallId === "number" ? hallId : parseInt(String(hallId)) || 0,
                      name: `سالن شماره ${hallId}`
                    }));
                  return resolvedHalls.map(h => (
                    <option key={h.id} value={h.id}>{h.name}</option>
                  ));
                })()}
              </select>
            </div>
            <div>
              <label className="block text-natural-dark font-black mb-1.5 text-right">تفکیک بر اساس استخر:</label>
              <select
                value={filterPoolId}
                onChange={(e) => setFilterPoolId(e.target.value)}
                className="w-full text-xs font-sans rounded-xl border border-natural-border/80 p-2.5 bg-white text-natural-dark font-medium focus:outline-none focus:border-natural-earth"
              >
                <option value="all">همه استخرها</option>
                {pools
                  .filter(p => filterHallId === "all" || p.hallId === parseInt(filterHallId))
                  .map(p => (
                    <option key={p.id} value={p.id}>{p.name} (سالن {p.hallId})</option>
                  ))
                }
              </select>
            </div>
          </div>

          {/* LEDGER ENTRIES LIST - FIXING OVERLAPPING (رفع همپوشانی جابجایی) */}
          <div id="transfer-logs-table" className="space-y-4 max-h-[460px] overflow-y-auto pr-1">
            {(() => {
              const filteredMovements = movements.filter(mov => {
                // Hall filter
                if (filterHallId !== "all") {
                  const hallNum = parseInt(filterHallId);
                  const fromPool = pools.find(p => p.id === mov.fromPoolId);
                  const toPool = pools.find(p => p.id === mov.toPoolId);
                  
                  const fromMatches = fromPool && fromPool.hallId === hallNum;
                  const toMatches = toPool && toPool.hallId === hallNum;
                  
                  if (!fromMatches && !toMatches) return false;
                }

                // Pool filter
                if (filterPoolId !== "all") {
                  if (mov.fromPoolId !== filterPoolId && mov.toPoolId !== filterPoolId) return false;
                }

                return true;
              });

              if (filteredMovements.length === 0) {
                return (
                  <div className="text-center py-12 text-natural-text/50 text-xs font-sans bg-white border border-dashed border-natural-border rounded-xl">
                    هیچ نقل و انتقالی متناسب با فیلتر سالن/استخر انتخاب شده یافت نشد.
                  </div>
                );
              }

              return filteredMovements.map((mov) => {
                const isCorrectionLog = mov.fromPoolId === null;
                return (
                  <div
                    key={mov.id}
                    id={`mov-${mov.id}`}
                    className={`bg-white hover:bg-white/95 border p-4 rounded-xl flex flex-col justify-between gap-3 transition-colors shadow-sm text-right ${
                      isCorrectionLog 
                        ? "border-natural-earth/35 bg-natural-khaki/10" 
                        : "border-natural-border"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-natural-border/50 pb-2">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded font-sans ${
                          isCorrectionLog 
                            ? "bg-natural-earth text-white" 
                            : "bg-natural-khaki text-natural-dark border border-natural-border"
                        }`}>
                          {isCorrectionLog ? "اصلاح تبارشناسی" : `کد انتقال: ${mov.id.replace("mov-", "")}`}
                        </span>
                        <span className="text-[11px] bg-natural-khaki/50 text-natural-dark font-bold px-2 py-0.5 rounded font-sans">
                          {mov.breed}
                        </span>
                        {mov.gender && (
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded font-sans ${
                            mov.gender.includes("ماده") 
                              ? "bg-rose-100 text-rose-800" 
                              : mov.gender.includes("نر") 
                              ? "bg-blue-100 text-blue-800" 
                              : "bg-gray-100 text-gray-700"
                          }`}>
                            {mov.gender}
                          </span>
                        )}
                        <span className="text-[10px] font-mono text-natural-text/60 flex items-center gap-1 bg-[#FDFCF8] px-1.5 py-0.5 rounded border border-natural-border/40">
                          <Clock size={10} />
                          {mov.date}
                        </span>
                      </div>
                      <div className="text-[11px] text-natural-text/80 font-medium flex items-center gap-1 sm:self-end">
                        <User size={11} className="text-natural-earth" />
                        <span>مسئول: {mov.operator}</span>
                      </div>
                    </div>

                    {/* Pathways container - designed to never overlap on small widths */}
                    <div className="flex flex-col gap-2.5">
                      <div className="flex flex-wrap items-center gap-2 text-xs font-sans">
                        <span className="bg-red-50 text-natural-clay font-bold px-2.5 py-1 rounded-lg border border-red-100/40 text-[11px]">
                          {mov.fromPoolName}
                        </span>
                        
                        <div className="flex items-center text-natural-text/40 px-1 font-mono text-[10px]">
                          ◀──────────
                        </div>

                        <span className="bg-emerald-50 text-natural-forest font-bold px-2.5 py-1 rounded-lg border border-emerald-100/40 text-[11px]">
                          {mov.toPoolName}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5">
                        <div className="px-2 py-0.5 bg-[#FAF9F5] rounded-md text-natural-dark border border-natural-border/60 text-[10px] font-bold">
                          تعداد: <span className="text-natural-earth font-mono">{mov.count} قطعه</span>
                        </div>
                        <div className="px-2 py-0.5 bg-[#FAF9F5] rounded-md text-natural-dark border border-natural-border/60 text-[10px] font-bold">
                          وزن متوسط: <span className="text-natural-dark font-mono">{mov.avgWeightGrams} گرم</span>
                        </div>
                        <span className="text-[10px] text-natural-forest bg-emerald-50/80 border border-emerald-200/50 px-2 py-0.5 rounded font-bold">
                          ✓ تایید بیومتریک نسل
                        </span>
                      </div>
                    </div>

                    <p className="text-[11px] text-natural-text/90 leading-relaxed font-sans mt-1 bg-neutral-50 p-2 rounded-lg border border-neutral-100">
                      <strong className="text-natural-dark font-semibold">توضیح و علت اقدام:</strong> {mov.reason}
                    </p>

                    {mov.chipId && (
                      <div className="flex items-center gap-1.5 mt-1 bg-amber-50 text-amber-900 border border-amber-200/50 px-2.5 py-1 rounded-lg shadow-xs text-[10.5px] w-fit font-mono font-bold ml-auto">
                        <span className="bg-amber-700 text-white text-[9px] px-1.5 py-0.5 rounded font-sans">پلاک میکروچیپ:</span>
                        {mov.chipId}
                      </div>
                    )}
                  </div>
                );
              });
            })()}
          </div>
        </div>

        <div className="mt-6 pt-3 border-t border-natural-border text-[10px] text-natural-text/50 font-sans flex justify-between items-center">
          <span className="flex items-center gap-1">
            <Compass size={11} />
            پروتکل ردیابی اصالت و زنجیره تبارشناسی خاویارسیستم
          </span>
          <span>
            سیستم حفاظتی فارم ماهیان
          </span>
        </div>
      </div>

    </div>
  );
};
