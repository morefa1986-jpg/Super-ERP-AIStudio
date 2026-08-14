import React, { useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CheckCircle2,
  Fish,
  Plus,
  RotateCcw,
  Trash2,
  Waves
} from "lucide-react";
import { FishBatch, Hall, Pool, PoolPurpose, SturgeonBreed, StockInitializationRecord, User } from "../types";
import { applyBatchesToPool, summarizeBatches, validateBatches } from "../core/stock";
import { createSetupHall, createSetupPool, FARM_SETUP_COMPLETION_KEY, linkPoolsToHalls, validateFarmStructure } from "../core/farmSetup";

interface Props {
  pools: Pool[];
  halls: Hall[];
  currentUser: User;
  onComplete: (result: { pools: Pool[]; halls: Hall[] }) => void;
}

type SetupStep = "structure" | "stock" | "review";

const newBatch = (): FishBatch => ({
  id: `stock-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  breed: SturgeonBreed.BELUGA,
  gender: "unknown",
  count: 0,
  avgWeightGrams: 0,
  chipIds: [],
  initializedAt: new Date().toISOString()
});

const cloneHalls = (halls: Hall[]) => halls.map(hall => ({ ...hall, poolIds: [...(hall.poolIds || [])] }));
const clonePools = (pools: Pool[]) => pools.map(pool => ({
  ...pool,
  fishBatches: pool.fishBatches?.map(batch => ({ ...batch, chipIds: [...(batch.chipIds || [])] }))
}));

const createStockRows = (pools: Pool[]): Record<string, FishBatch[]> => Object.fromEntries(
  pools.map(pool => [
    pool.id,
    pool.fishBatches?.length
      ? pool.fishBatches.map(batch => ({ ...batch, chipIds: [...(batch.chipIds || [])] }))
      : [{
          ...newBatch(),
          breed: pool.breed || SturgeonBreed.BELUGA,
          count: pool.count || 0,
          avgWeightGrams: pool.avgWeightGrams || 0,
          chipIds: pool.chipId ? [pool.chipId] : []
        }]
  ])
);

const genderLabels: Record<string, string> = {
  female: "ماده",
  male: "نر",
  unknown: "نامشخص",
  mixed: "ترکیبی"
};

const shapeLabels: Record<NonNullable<Pool["shape"]>, string> = {
  circular: "دایره‌ای",
  rectangular: "مستطیلی",
  linear: "خطی",
  other: "سایر"
};

const fieldClass = "w-full border border-natural-border rounded-xl p-2.5 bg-white text-sm outline-none focus:ring-2 focus:ring-natural-forest/20";
const optionalNumber = (value: string) => value === "" ? undefined : Number(value);

export const InitialStockSetup: React.FC<Props> = ({ pools, halls, currentUser, onComplete }) => {
  const [step, setStep] = useState<SetupStep>("structure");
  const [draftHalls, setDraftHalls] = useState<Hall[]>(() => cloneHalls(halls));
  const [draftPools, setDraftPools] = useState<Pool[]>(() => clonePools(pools));
  const [stockRows, setStockRows] = useState<Record<string, FishBatch[]>>(() => createStockRows(pools));
  const [selectedHallId, setSelectedHallId] = useState<number | null>(halls[0]?.id ?? null);
  const [structurePoolId, setStructurePoolId] = useState<string>(pools.find(pool => pool.hallId === halls[0]?.id)?.id || "");
  const [stockPoolId, setStockPoolId] = useState<string>(pools[0]?.id || "");
  const [message, setMessage] = useState("");

  const selectedHall = draftHalls.find(hall => hall.id === selectedHallId);
  const selectedStructurePool = draftPools.find(pool => pool.id === structurePoolId);
  const selectedStockPool = draftPools.find(pool => pool.id === stockPoolId);
  const currentRows = stockRows[stockPoolId] || [];
  const currentSummary = useMemo(() => summarizeBatches(currentRows), [currentRows]);

  const relinkedHalls = useMemo(() => linkPoolsToHalls(draftHalls, draftPools), [draftHalls, draftPools]);
  const finalPools = useMemo(
    () => draftPools.map(pool => applyBatchesToPool(pool, stockRows[pool.id] || [])),
    [draftPools, stockRows]
  );

  const updateHall = (id: number, patch: Partial<Hall>) => {
    setDraftHalls(current => current.map(hall => hall.id === id ? { ...hall, ...patch } : hall));
    setMessage("");
  };

  const updatePool = (id: string, patch: Partial<Pool>) => {
    setDraftPools(current => current.map(pool => pool.id === id ? { ...pool, ...patch } : pool));
    setMessage("");
  };

  const updateStockRow = (rowId: string, patch: Partial<FishBatch>) => {
    if (!stockPoolId) return;
    setStockRows(current => ({
      ...current,
      [stockPoolId]: (current[stockPoolId] || []).map(row => row.id === rowId ? { ...row, ...patch } : row)
    }));
    setMessage("");
  };

  const selectHall = (hallId: number) => {
    setSelectedHallId(hallId);
    setStructurePoolId(draftPools.find(pool => pool.hallId === hallId)?.id || "");
    setMessage("");
  };

  const addHall = () => {
    const hall = createSetupHall(draftHalls);
    setDraftHalls(current => [...current, hall]);
    setSelectedHallId(hall.id);
    setStructurePoolId("");
    setMessage(`سالن ${hall.id} ایجاد شد؛ اکنون مشخصات آن و استخرهایش را وارد کنید.`);
  };

  const addPool = () => {
    if (selectedHallId === null) {
      setMessage("ابتدا یک سالن ایجاد کنید.");
      return;
    }
    const pool = createSetupPool(selectedHallId, draftPools);
    setDraftPools(current => [...current, pool]);
    setStockRows(current => ({ ...current, [pool.id]: [newBatch()] }));
    setStructurePoolId(pool.id);
    setMessage(`${pool.name} ایجاد شد؛ مشخصات اولیه آن را تکمیل کنید.`);
  };

  const removePool = (poolId: string) => {
    const pool = draftPools.find(item => item.id === poolId);
    if (!pool || !window.confirm(`استخر «${pool.name}» از پیش‌نویس راه‌اندازی حذف شود؟`)) return;
    const remainingPools = draftPools.filter(item => item.id !== poolId);
    setDraftPools(remainingPools);
    setStockRows(current => Object.fromEntries(Object.entries(current).filter(([id]) => id !== poolId)));
    setStructurePoolId(remainingPools.find(item => item.hallId === pool.hallId)?.id || "");
    setMessage("استخر از پیش‌نویس حذف شد. تا ثبت نهایی، اطلاعات اصلی سامانه تغییری نکرده است.");
  };

  const removeHall = (hallId: number) => {
    const hall = draftHalls.find(item => item.id === hallId);
    if (!hall) return;
    const hallPools = draftPools.filter(pool => pool.hallId === hallId);
    if (!window.confirm(`سالن «${hall.name}» و ${hallPools.length.toLocaleString("fa-IR")} استخر وابسته از پیش‌نویس حذف شوند؟`)) return;
    const remainingHalls = draftHalls.filter(item => item.id !== hallId);
    const removedIds = new Set(hallPools.map(pool => pool.id));
    setDraftHalls(remainingHalls);
    setDraftPools(current => current.filter(pool => !removedIds.has(pool.id)));
    setStockRows(current => Object.fromEntries(Object.entries(current).filter(([id]) => !removedIds.has(id))));
    const nextHall = remainingHalls[0];
    setSelectedHallId(nextHall?.id ?? null);
    setStructurePoolId(nextHall ? draftPools.find(pool => pool.hallId === nextHall.id && !removedIds.has(pool.id))?.id || "" : "");
    setMessage("سالن از پیش‌نویس حذف شد. این تغییر هنوز ثبت نهایی نشده است.");
  };

  const clearTemplate = () => {
    if (!window.confirm("ساختار فعلی فقط از پیش‌نویس پاک شود تا سالن‌ها و استخرها را از ابتدا تعریف کنید؟")) return;
    setDraftHalls([]);
    setDraftPools([]);
    setStockRows({});
    setSelectedHallId(null);
    setStructurePoolId("");
    setStockPoolId("");
    setMessage("پیش‌نویس خالی شد. با «افزودن سالن» شروع کنید؛ اطلاعات ذخیره‌شده تا ثبت نهایی دست‌نخورده است.");
  };

  const restoreLoadedStructure = () => {
    const restoredHalls = cloneHalls(halls);
    const restoredPools = clonePools(pools);
    setDraftHalls(restoredHalls);
    setDraftPools(restoredPools);
    setStockRows(createStockRows(restoredPools));
    setSelectedHallId(restoredHalls[0]?.id ?? null);
    setStructurePoolId(restoredPools.find(pool => pool.hallId === restoredHalls[0]?.id)?.id || "");
    setStockPoolId(restoredPools[0]?.id || "");
    setMessage("ساختار ذخیره‌شده دوباره در پیش‌نویس بارگذاری شد.");
  };

  const validateAllStocks = (): string[] => {
    const poolsWithDraftRows = draftPools.map(pool => ({ ...pool, fishBatches: stockRows[pool.id] || [] }));
    return draftPools.flatMap(pool => {
      const errors = validateBatches(stockRows[pool.id] || [], poolsWithDraftRows, pool.id);
      return errors.map(error => `${pool.name} (${pool.id}): ${error}`);
    });
  };

  const continueToStock = () => {
    const errors = validateFarmStructure(draftHalls, draftPools);
    if (errors.length) {
      setMessage(errors.join("\n"));
      return;
    }
    setDraftHalls(relinkedHalls);
    const firstPoolId = draftPools.some(pool => pool.id === stockPoolId) ? stockPoolId : draftPools[0].id;
    setStockPoolId(firstPoolId);
    setMessage("");
    setStep("stock");
  };

  const continueToReview = () => {
    const errors = validateAllStocks();
    if (errors.length) {
      setMessage(errors.join("\n"));
      return;
    }
    setMessage("");
    setStep("review");
  };

  const finish = () => {
    const structureErrors = validateFarmStructure(relinkedHalls, finalPools);
    const stockErrors = validateAllStocks();
    const errors = [...structureErrors, ...stockErrors];
    if (errors.length) {
      setMessage(errors.join("\n"));
      setStep(structureErrors.length ? "structure" : "stock");
      return;
    }
    if (!window.confirm("ساختار سالن‌ها، مشخصات استخرها و موجودی اولیه ثبت نهایی شود؟")) return;

    const initializedAt = new Date().toISOString();
    const initializedPools = finalPools.map(pool => ({ ...pool, updatedAtGregorian: initializedAt }));
    const initializedHalls = linkPoolsToHalls(relinkedHalls, initializedPools);
    const records: StockInitializationRecord[] = initializedPools.map(pool => ({
      id: `init-${pool.id}-${Date.now()}`,
      poolId: pool.id,
      batches: pool.fishBatches || [],
      totalCount: pool.count,
      totalBiomassKg: pool.totalBiomassKg,
      initializedBy: currentUser.id,
      initializedAt,
      reason: "initial-stock"
    }));
    const audit = {
      id: `init-${Date.now()}`,
      initializedAt,
      initializedBy: currentUser.id,
      hallCount: initializedHalls.length,
      poolCount: initializedPools.length,
      totalFish: initializedPools.reduce((sum, pool) => sum + pool.count, 0),
      totalBiomassKg: initializedPools.reduce((sum, pool) => sum + pool.totalBiomassKg, 0)
    };
    localStorage.setItem("sturgeon_stock_initializations_v1", JSON.stringify(records));
    localStorage.setItem("sturgeon_initial_stock_completed_v1", JSON.stringify(audit));
    localStorage.setItem(FARM_SETUP_COMPLETION_KEY, JSON.stringify(audit));
    onComplete({ pools: initializedPools, halls: initializedHalls });
  };

  const moveStockPool = (offset: number) => {
    const index = draftPools.findIndex(pool => pool.id === stockPoolId);
    const target = draftPools[index + offset];
    if (target) setStockPoolId(target.id);
  };

  const totals = useMemo(() => ({
    fish: finalPools.reduce((sum, pool) => sum + pool.count, 0),
    biomass: Number(finalPools.reduce((sum, pool) => sum + pool.totalBiomassKg, 0).toFixed(3)),
    stockedPools: finalPools.filter(pool => pool.count > 0).length
  }), [finalPools]);

  const steps: Array<{ id: SetupStep; label: string }> = [
    { id: "structure", label: "۱. سالن و استخر" },
    { id: "stock", label: "۲. موجودی ماهی" },
    { id: "review", label: "۳. بازبینی" }
  ];

  return (
    <div className="erp-neon-screen min-h-screen p-4 md:p-8 text-natural-text" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-5">
        <div className="bg-white border border-natural-border rounded-3xl p-6 space-y-5">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-natural-forest text-white"><Waves size={24} /></div>
            <div>
              <h1 className="text-xl font-black text-natural-dark">راه‌اندازی اولیه مزرعه</h1>
              <p className="text-xs text-natural-text/70 mt-1">ابتدا خودِ سالن‌ها و استخرها را تعریف کنید؛ سپس موجودی نژاد، جنسیت، تعداد، وزن و چیپ را وارد نمایید.</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {steps.map((item, index) => {
              const activeIndex = steps.findIndex(candidate => candidate.id === step);
              const isActive = item.id === step;
              const isDone = index < activeIndex;
              return (
                <div key={item.id} className={`rounded-xl px-3 py-2 text-center text-xs font-black border ${isActive ? "bg-natural-forest text-white border-natural-forest" : isDone ? "bg-emerald-50 text-emerald-800 border-emerald-200" : "bg-white text-natural-text/50 border-natural-border"}`}>
                  {item.label}
                </div>
              );
            })}
          </div>
        </div>

        {step === "structure" && (
          <div className="space-y-5">
            <div className="bg-white border border-natural-border rounded-3xl p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="font-black flex items-center gap-2"><Building2 size={18} /> تعریف سالن‌ها</h2>
                  <p className="text-xs text-natural-text/65 mt-1">می‌توانید قالب موجود را ویرایش کنید یا ساختار مزرعه را از صفر بسازید.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button type="button" onClick={addHall} className="px-4 py-2 rounded-xl bg-natural-forest text-white text-xs font-bold flex items-center gap-2"><Plus size={15} /> افزودن سالن</button>
                  <button type="button" onClick={clearTemplate} className="px-4 py-2 rounded-xl border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2"><Trash2 size={15} /> شروع با ساختار خالی</button>
                  <button type="button" onClick={restoreLoadedStructure} className="px-4 py-2 rounded-xl border border-natural-border text-xs font-bold flex items-center gap-2"><RotateCcw size={15} /> بازگردانی پیش‌نویس</button>
                </div>
              </div>

              {draftHalls.length ? (
                <>
                  <div>
                    <label className="block text-xs font-bold mb-1.5">سالن در حال ویرایش</label>
                    <select value={selectedHallId ?? ""} onChange={event => selectHall(Number(event.target.value))} className={fieldClass}>
                      {draftHalls.map(hall => <option key={hall.id} value={hall.id}>{hall.name} — {draftPools.filter(pool => pool.hallId === hall.id).length.toLocaleString("fa-IR")} استخر</option>)}
                    </select>
                  </div>

                  {selectedHall && (
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-3 rounded-2xl bg-natural-khaki/35 p-4">
                      <div className="md:col-span-4">
                        <label className="block text-[11px] font-bold mb-1">نام سالن *</label>
                        <input value={selectedHall.name} onChange={event => updateHall(selectedHall.id, { name: event.target.value })} className={fieldClass} />
                      </div>
                      <div className="md:col-span-6">
                        <label className="block text-[11px] font-bold mb-1">توضیحات سالن</label>
                        <input value={selectedHall.description} onChange={event => updateHall(selectedHall.id, { description: event.target.value })} placeholder="کاربری، موقعیت یا توضیح سالن" className={fieldClass} />
                      </div>
                      <label className="md:col-span-2 flex items-center gap-2 text-xs font-bold pt-6">
                        <input type="checkbox" checked={Boolean(selectedHall.isUnderConstruction)} onChange={event => updateHall(selectedHall.id, { isUnderConstruction: event.target.checked })} /> در حال احداث
                      </label>
                      <div className="md:col-span-12 flex justify-end">
                        <button type="button" onClick={() => removeHall(selectedHall.id)} className="text-xs font-bold text-rose-700 flex items-center gap-1"><Trash2 size={14} /> حذف این سالن از پیش‌نویس</button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="border-2 border-dashed border-natural-border rounded-2xl p-8 text-center text-sm">هنوز سالنی تعریف نشده است. روی «افزودن سالن» بزنید.</div>
              )}
            </div>

            {selectedHall && (
              <div className="bg-white border border-natural-border rounded-3xl p-5 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="font-black flex items-center gap-2"><Waves size={18} /> مشخصات اولیه استخر</h2>
                    <p className="text-xs text-natural-text/65 mt-1">کد یکتا خودکار ساخته می‌شود و بعد از ثبت برای سوابق قابل ردیابی ثابت می‌ماند.</p>
                  </div>
                  <button type="button" onClick={addPool} className="px-4 py-2 rounded-xl bg-natural-forest text-white text-xs font-bold flex items-center gap-2"><Plus size={15} /> افزودن استخر به این سالن</button>
                </div>

                {draftPools.some(pool => pool.hallId === selectedHall.id) ? (
                  <>
                    <div>
                      <label className="block text-xs font-bold mb-1.5">استخر در حال ویرایش</label>
                      <select value={structurePoolId} onChange={event => setStructurePoolId(event.target.value)} className={fieldClass}>
                        {draftPools.filter(pool => pool.hallId === selectedHall.id).map(pool => <option key={pool.id} value={pool.id}>{pool.name} ({pool.id})</option>)}
                      </select>
                    </div>

                    {selectedStructurePool && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        <div>
                          <label className="block text-[11px] font-bold mb-1">کد استخر</label>
                          <input value={selectedStructurePool.id} readOnly className={`${fieldClass} bg-slate-50 font-mono text-left`} dir="ltr" />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold mb-1">نام/شماره استخر *</label>
                          <input value={selectedStructurePool.name} onChange={event => updatePool(selectedStructurePool.id, { name: event.target.value })} className={fieldClass} />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold mb-1">کاربری *</label>
                          <input list="pool-purposes" value={selectedStructurePool.purpose} onChange={event => updatePool(selectedStructurePool.id, { purpose: event.target.value })} className={fieldClass} />
                          <datalist id="pool-purposes">{Object.values(PoolPurpose).map(purpose => <option key={purpose} value={purpose} />)}</datalist>
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold mb-1">شکل استخر</label>
                          <select value={selectedStructurePool.shape || "other"} onChange={event => updatePool(selectedStructurePool.id, { shape: event.target.value as Pool["shape"] })} className={fieldClass}>
                            {Object.entries(shapeLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                          </select>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold mb-1">قطر (متر)</label>
                          <input type="number" min="0.01" step="0.01" value={selectedStructurePool.diameter ?? ""} onChange={event => updatePool(selectedStructurePool.id, { diameter: optionalNumber(event.target.value) })} className={fieldClass} />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold mb-1">طول (متر)</label>
                          <input type="number" min="0.01" step="0.01" value={selectedStructurePool.length ?? ""} onChange={event => updatePool(selectedStructurePool.id, { length: optionalNumber(event.target.value) })} className={fieldClass} />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold mb-1">عرض (متر)</label>
                          <input type="number" min="0.01" step="0.01" value={selectedStructurePool.width ?? ""} onChange={event => updatePool(selectedStructurePool.id, { width: optionalNumber(event.target.value) })} className={fieldClass} />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold mb-1">ارتفاع آب (متر)</label>
                          <input type="number" min="0.01" step="0.01" value={selectedStructurePool.height ?? ""} onChange={event => updatePool(selectedStructurePool.id, { height: optionalNumber(event.target.value) })} className={fieldClass} />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-[11px] font-bold mb-1">شرح ابعاد *</label>
                          <input value={selectedStructurePool.dimensionsDesc} onChange={event => updatePool(selectedStructurePool.id, { dimensionsDesc: event.target.value })} placeholder="مثال: قطر ۴ متر × ارتفاع آب ۱.۲ متر" className={fieldClass} />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold mb-1">حجم مفید آب (مترمکعب)</label>
                          <input type="number" min="0.01" step="0.01" value={selectedStructurePool.volumeCubicMeters ?? ""} onChange={event => updatePool(selectedStructurePool.id, { volumeCubicMeters: optionalNumber(event.target.value) })} className={fieldClass} />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold mb-1">حداکثر زیست‌توده (کیلوگرم)</label>
                          <input type="number" min="0.01" step="0.1" value={selectedStructurePool.maxBiomassKg ?? ""} onChange={event => updatePool(selectedStructurePool.id, { maxBiomassKg: optionalNumber(event.target.value) })} className={fieldClass} />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold mb-1">دمای اولیه (°C)</label>
                          <input type="number" min="0" max="40" step="0.1" value={selectedStructurePool.temperature} onChange={event => updatePool(selectedStructurePool.id, { temperature: Number(event.target.value) })} className={fieldClass} />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold mb-1">اکسیژن (mg/L)</label>
                          <input type="number" min="0" max="30" step="0.1" value={selectedStructurePool.oxygenLevel} onChange={event => updatePool(selectedStructurePool.id, { oxygenLevel: Number(event.target.value) })} className={fieldClass} />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold mb-1">pH اولیه</label>
                          <input type="number" min="0" max="14" step="0.1" value={selectedStructurePool.phLevel} onChange={event => updatePool(selectedStructurePool.id, { phLevel: Number(event.target.value) })} className={fieldClass} />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold mb-1">منبع آب</label>
                          <input value={selectedStructurePool.waterSource || ""} onChange={event => updatePool(selectedStructurePool.id, { waterSource: event.target.value })} placeholder="چاه، رودخانه، مدار باز/بسته..." className={fieldClass} />
                        </div>
                        <div className="sm:col-span-2 lg:col-span-4">
                          <label className="block text-[11px] font-bold mb-1">یادداشت اولیه</label>
                          <textarea value={selectedStructurePool.notes || ""} onChange={event => updatePool(selectedStructurePool.id, { notes: event.target.value })} className={`${fieldClass} min-h-20`} />
                        </div>
                        <div className="sm:col-span-2 lg:col-span-4 flex justify-end">
                          <button type="button" onClick={() => removePool(selectedStructurePool.id)} className="text-xs font-bold text-rose-700 flex items-center gap-1"><Trash2 size={14} /> حذف این استخر از پیش‌نویس</button>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="border-2 border-dashed border-natural-border rounded-2xl p-8 text-center text-sm">این سالن هنوز استخر ندارد. روی «افزودن استخر» بزنید.</div>
                )}
              </div>
            )}

            <div className="bg-white border border-natural-border rounded-3xl p-5 flex flex-wrap items-center justify-between gap-3">
              <div className="text-xs font-bold">خلاصه پیش‌نویس: {draftHalls.length.toLocaleString("fa-IR")} سالن و {draftPools.length.toLocaleString("fa-IR")} استخر</div>
              <button type="button" onClick={continueToStock} className="px-5 py-3 rounded-xl bg-emerald-800 text-white text-sm font-black flex items-center gap-2">ادامه: ثبت موجودی ماهی <ArrowLeft size={17} /></button>
            </div>
          </div>
        )}

        {step === "stock" && (
          <div className="space-y-5">
            <div className="bg-white border border-natural-border rounded-3xl p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="font-black flex items-center gap-2"><Fish size={18} /> موجودی اولیه هر استخر</h2>
                  <p className="text-xs text-natural-text/65 mt-1">ردیف‌ها خودکار در پیش‌نویس نگهداری می‌شوند؛ ذخیره جداگانه لازم نیست. استخر خالی می‌تواند تعداد صفر داشته باشد.</p>
                </div>
                <div className="text-xs font-bold bg-natural-khaki/50 rounded-xl px-3 py-2">{totals.stockedPools.toLocaleString("fa-IR")} از {draftPools.length.toLocaleString("fa-IR")} استخر دارای ماهی</div>
              </div>

              <div>
                <label className="block text-xs font-bold mb-1.5">انتخاب استخر</label>
                <select value={stockPoolId} onChange={event => { setStockPoolId(event.target.value); setMessage(""); }} className={fieldClass}>
                  {relinkedHalls.map(hall => (
                    <optgroup key={hall.id} label={hall.name}>
                      {draftPools.filter(pool => pool.hallId === hall.id).map(pool => {
                        const poolSummary = summarizeBatches(stockRows[pool.id] || []);
                        return <option key={pool.id} value={pool.id}>{pool.name} ({pool.id}) — {poolSummary.count.toLocaleString("fa-IR")} قطعه</option>;
                      })}
                    </optgroup>
                  ))}
                </select>
              </div>

              {selectedStockPool && (
                <div className="rounded-2xl border border-natural-border overflow-hidden">
                  <div className="bg-natural-khaki/40 px-4 py-3 flex flex-wrap justify-between gap-2 text-xs font-bold">
                    <span>{selectedStockPool.name} — {selectedStockPool.purpose}</span>
                    <span>{selectedStockPool.dimensionsDesc}</span>
                  </div>
                  <div className="p-4 space-y-3">
                    {currentRows.map((row, index) => (
                      <div key={row.id} className="grid grid-cols-1 md:grid-cols-12 gap-2 border-b border-natural-border pb-3">
                        <div className="md:col-span-3">
                          <label className="block text-[10px] font-bold mb-1">نژاد</label>
                          <select value={row.breed} onChange={event => updateStockRow(row.id, { breed: event.target.value as SturgeonBreed })} className={fieldClass}>
                            {Object.values(SturgeonBreed).map(breed => <option key={breed} value={breed}>{breed}</option>)}
                          </select>
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-[10px] font-bold mb-1">جنسیت</label>
                          <select value={row.gender} onChange={event => updateStockRow(row.id, { gender: event.target.value })} className={fieldClass}>
                            {Object.entries(genderLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                          </select>
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-[10px] font-bold mb-1">تعداد</label>
                          <input type="number" min="0" step="1" value={row.count} onChange={event => updateStockRow(row.id, { count: Number(event.target.value) })} className={fieldClass} />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-[10px] font-bold mb-1">وزن متوسط (گرم)</label>
                          <input type="number" min="0" step="0.1" value={row.avgWeightGrams} onChange={event => updateStockRow(row.id, { avgWeightGrams: Number(event.target.value) })} className={fieldClass} />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-[10px] font-bold mb-1">شماره چیپ‌ها (اختیاری)</label>
                          <textarea value={(row.chipIds || []).join("\n")} onChange={event => updateStockRow(row.id, { chipIds: event.target.value.split(/[\n,]+/).map(value => value.trim()).filter(Boolean) })} placeholder="هر خط یک شماره" className={`${fieldClass} min-h-11`} />
                        </div>
                        <button type="button" aria-label={`حذف ردیف ${index + 1}`} onClick={() => setStockRows(current => ({ ...current, [stockPoolId]: currentRows.length > 1 ? currentRows.filter(item => item.id !== row.id) : currentRows }))} className="md:col-span-1 self-end p-3 text-rose-700"><Trash2 size={17} /></button>
                      </div>
                    ))}
                    <button type="button" onClick={() => setStockRows(current => ({ ...current, [stockPoolId]: [...(current[stockPoolId] || []), newBatch()] }))} className="px-4 py-2 rounded-xl border border-natural-border text-xs font-bold flex items-center gap-2"><Plus size={15} /> افزودن نژاد/گروه دیگر</button>
                  </div>
                  <div className="bg-natural-khaki/30 px-4 py-3 text-xs font-black">جمع این استخر: {currentSummary.count.toLocaleString("fa-IR")} قطعه — زیست‌توده: {currentSummary.totalBiomassKg.toLocaleString("fa-IR")} کیلوگرم</div>
                </div>
              )}

              <div className="flex items-center justify-between gap-2">
                <button type="button" disabled={draftPools.findIndex(pool => pool.id === stockPoolId) <= 0} onClick={() => moveStockPool(-1)} className="px-4 py-2 rounded-xl border border-natural-border text-xs font-bold disabled:opacity-40 flex items-center gap-1"><ArrowRight size={15} /> استخر قبلی</button>
                <button type="button" disabled={draftPools.findIndex(pool => pool.id === stockPoolId) >= draftPools.length - 1} onClick={() => moveStockPool(1)} className="px-4 py-2 rounded-xl border border-natural-border text-xs font-bold disabled:opacity-40 flex items-center gap-1">استخر بعدی <ArrowLeft size={15} /></button>
              </div>
            </div>

            <div className="bg-white border border-natural-border rounded-3xl p-5 flex flex-wrap items-center justify-between gap-3">
              <button type="button" onClick={() => { setMessage(""); setStep("structure"); }} className="px-5 py-3 rounded-xl border border-natural-border text-sm font-black flex items-center gap-2"><ArrowRight size={17} /> بازگشت به مشخصات استخرها</button>
              <button type="button" onClick={continueToReview} className="px-5 py-3 rounded-xl bg-emerald-800 text-white text-sm font-black flex items-center gap-2">ادامه: بازبینی نهایی <ArrowLeft size={17} /></button>
            </div>
          </div>
        )}

        {step === "review" && (
          <div className="space-y-5">
            <div className="bg-white border border-natural-border rounded-3xl p-5 space-y-4">
              <div>
                <h2 className="font-black flex items-center gap-2"><CheckCircle2 size={18} /> بازبینی راه‌اندازی</h2>
                <p className="text-xs text-natural-text/65 mt-1">پس از ثبت نهایی، همین اطلاعات مبنای نقشه فارم، عملیات روزانه و نسخه‌های پشتیبان خواهد بود.</p>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="rounded-2xl bg-natural-khaki/40 p-4"><div className="text-[11px]">سالن</div><div className="text-xl font-black mt-1">{relinkedHalls.length.toLocaleString("fa-IR")}</div></div>
                <div className="rounded-2xl bg-natural-khaki/40 p-4"><div className="text-[11px]">استخر</div><div className="text-xl font-black mt-1">{finalPools.length.toLocaleString("fa-IR")}</div></div>
                <div className="rounded-2xl bg-natural-khaki/40 p-4"><div className="text-[11px]">تعداد ماهی</div><div className="text-xl font-black mt-1">{totals.fish.toLocaleString("fa-IR")}</div></div>
                <div className="rounded-2xl bg-natural-khaki/40 p-4"><div className="text-[11px]">زیست‌توده (kg)</div><div className="text-xl font-black mt-1">{totals.biomass.toLocaleString("fa-IR")}</div></div>
              </div>
              <div className="overflow-x-auto border border-natural-border rounded-2xl">
                <table className="w-full text-xs text-right">
                  <thead className="bg-natural-khaki/50"><tr><th className="p-3">سالن</th><th className="p-3">تعداد استخر</th><th className="p-3">استخر دارای ماهی</th><th className="p-3">تعداد ماهی</th><th className="p-3">زیست‌توده</th></tr></thead>
                  <tbody>
                    {relinkedHalls.map(hall => {
                      const hallPools = finalPools.filter(pool => pool.hallId === hall.id);
                      return (
                        <tr key={hall.id} className="border-t border-natural-border">
                          <td className="p-3 font-bold">{hall.name}</td>
                          <td className="p-3">{hallPools.length.toLocaleString("fa-IR")}</td>
                          <td className="p-3">{hallPools.filter(pool => pool.count > 0).length.toLocaleString("fa-IR")}</td>
                          <td className="p-3">{hallPools.reduce((sum, pool) => sum + pool.count, 0).toLocaleString("fa-IR")}</td>
                          <td className="p-3">{Number(hallPools.reduce((sum, pool) => sum + pool.totalBiomassKg, 0).toFixed(3)).toLocaleString("fa-IR")} kg</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-white border border-natural-border rounded-3xl p-5 flex flex-wrap items-center justify-between gap-3">
              <button type="button" onClick={() => { setMessage(""); setStep("stock"); }} className="px-5 py-3 rounded-xl border border-natural-border text-sm font-black flex items-center gap-2"><ArrowRight size={17} /> اصلاح موجودی</button>
              <button type="button" onClick={finish} className="px-6 py-3 rounded-xl bg-emerald-800 text-white text-sm font-black flex items-center gap-2"><CheckCircle2 size={18} /> ثبت نهایی و ورود به ERP</button>
            </div>
          </div>
        )}

        {message && <pre className="whitespace-pre-wrap text-xs bg-amber-50 border border-amber-200 text-amber-950 rounded-2xl p-4 leading-6">{message}</pre>}
      </div>
    </div>
  );
};
