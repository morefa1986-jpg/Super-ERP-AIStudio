import React, { useMemo, useState } from "react";
import { CheckCircle2, Fish, Plus, Save, Trash2 } from "lucide-react";
import { FishBatch, Hall, Pool, SturgeonBreed, User } from "../types";
import { applyBatchesToPool, summarizeBatches, validateBatches } from "../core/stock";

interface Props {
  pools: Pool[];
  halls: Hall[];
  currentUser: User;
  onComplete: (pools: Pool[]) => void;
}

const newBatch = (): FishBatch => ({
  id: `stock-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  breed: SturgeonBreed.BELUGA,
  gender: "unknown",
  count: 0,
  avgWeightGrams: 0,
  chipIds: [],
  initializedAt: new Date().toISOString()
});

const genderLabels: Record<FishBatch["gender"], string> = {
  female: "ماده",
  male: "نر",
  unknown: "نامشخص",
  mixed: "ترکیبی"
};

export const InitialStockSetup: React.FC<Props> = ({ pools, halls, currentUser, onComplete }) => {
  const [draftPools, setDraftPools] = useState(pools);
  const [poolId, setPoolId] = useState(pools[0]?.id || "");
  const selected = draftPools.find(pool => pool.id === poolId);
  const [rows, setRows] = useState<FishBatch[]>(selected?.fishBatches?.length ? selected.fishBatches : [newBatch()]);
  const [message, setMessage] = useState("");
  const summary = useMemo(() => summarizeBatches(rows), [rows]);

  const selectPool = (nextPoolId: string) => {
    setPoolId(nextPoolId);
    const next = draftPools.find(pool => pool.id === nextPoolId);
    setRows(next?.fishBatches?.length ? next.fishBatches : [newBatch()]);
    setMessage("");
  };

  const updateRow = (id: string, patch: Partial<FishBatch>) => setRows(current => current.map(row => row.id === id ? { ...row, ...patch } : row));

  const savePool = () => {
    if (!selected) return;
    const errors = validateBatches(rows, draftPools, selected.id);
    if (errors.length) { setMessage(errors.join("\n")); return; }
    const next = draftPools.map(pool => pool.id === selected.id ? applyBatchesToPool(pool, rows) : pool);
    setDraftPools(next);
    setMessage(`موجودی ${selected.name} با ${summary.count.toLocaleString("fa-IR")} قطعه ذخیره شد.`);
  };

  const finish = () => {
    if (!window.confirm("آیا موجودی اولیه ثبت‌شده تأیید و راه‌اندازی سامانه تکمیل شود؟")) return;
    const audit = {
      id: `init-${Date.now()}`,
      initializedAt: new Date().toISOString(),
      initializedBy: currentUser.id,
      poolCount: draftPools.length,
      totalFish: draftPools.reduce((sum, pool) => sum + pool.count, 0)
    };
    localStorage.setItem("sturgeon_initial_stock_completed_v1", JSON.stringify(audit));
    onComplete(draftPools);
  };

  return (
    <div className="min-h-screen bg-natural-bg p-4 md:p-8 text-natural-text">
      <div className="max-w-6xl mx-auto space-y-5">
        <div className="bg-white border border-natural-border rounded-3xl p-6">
          <div className="flex items-center gap-3">
            <Fish className="text-natural-forest" />
            <div><h1 className="text-lg font-black text-natural-dark">ثبت موجودی اولیه استخرها</h1><p className="text-xs text-natural-text/70 mt-1">برای هر استخر، نژاد، جنسیت، تعداد، وزن متوسط و شماره چیپ‌های اختیاری را ثبت کنید.</p></div>
          </div>
        </div>

        <div className="bg-white border border-natural-border rounded-3xl p-5 space-y-4">
          <label className="block text-xs font-bold">انتخاب استخر</label>
          <select value={poolId} onChange={event => selectPool(event.target.value)} className="w-full border border-natural-border rounded-xl p-3 bg-white">
            {halls.map(hall => (
              <optgroup key={hall.id} label={hall.name}>
                {draftPools.filter(pool => pool.hallId === hall.id).map(pool => <option key={pool.id} value={pool.id}>{pool.name} — موجودی فعلی: {pool.count}</option>)}
              </optgroup>
            ))}
          </select>

          <div className="space-y-3">
            {rows.map((row, index) => (
              <div key={row.id} className="grid grid-cols-1 md:grid-cols-12 gap-2 border-b border-natural-border pb-3">
                <select value={row.breed} onChange={event => updateRow(row.id, { breed: event.target.value as SturgeonBreed })} className="md:col-span-3 border rounded-xl p-2 bg-white">
                  {Object.values(SturgeonBreed).map(breed => <option key={breed} value={breed}>{breed}</option>)}
                </select>
                <select value={row.gender} onChange={event => updateRow(row.id, { gender: event.target.value as FishBatch["gender"] })} className="md:col-span-2 border rounded-xl p-2 bg-white">
                  {Object.entries(genderLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </select>
                <input type="number" min="0" step="1" value={row.count} onChange={event => updateRow(row.id, { count: Number(event.target.value) })} placeholder="تعداد" className="md:col-span-2 border rounded-xl p-2" />
                <input type="number" min="0" step="0.1" value={row.avgWeightGrams} onChange={event => updateRow(row.id, { avgWeightGrams: Number(event.target.value) })} placeholder="وزن متوسط (گرم)" className="md:col-span-2 border rounded-xl p-2" />
                <textarea value={(row.chipIds || []).join("\n")} onChange={event => updateRow(row.id, { chipIds: event.target.value.split(/[\n,]+/).map(value => value.trim()).filter(Boolean) })} placeholder="چیپ‌ها؛ هر خط یک شماره (اختیاری)" className="md:col-span-2 border rounded-xl p-2 min-h-11" />
                <button type="button" aria-label={`حذف ردیف ${index + 1}`} onClick={() => setRows(current => current.length > 1 ? current.filter(item => item.id !== row.id) : current)} className="md:col-span-1 p-2 text-rose-700"><Trash2 size={17} /></button>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => setRows(current => [...current, newBatch()])} className="px-4 py-2 rounded-xl border border-natural-border flex items-center gap-2"><Plus size={16} /> افزودن نژاد/گروه</button>
            <button type="button" onClick={savePool} className="px-4 py-2 rounded-xl bg-natural-forest text-white flex items-center gap-2"><Save size={16} /> ذخیره این استخر</button>
          </div>

          <div className="text-xs font-bold">جمع: {summary.count.toLocaleString("fa-IR")} قطعه — Biomass: {summary.totalBiomassKg.toLocaleString("fa-IR")} کیلوگرم</div>
          {message && <pre className="whitespace-pre-wrap text-xs bg-natural-khaki/40 rounded-xl p-3">{message}</pre>}
        </div>

        <button type="button" onClick={finish} className="w-full p-4 bg-emerald-800 text-white rounded-2xl font-black flex items-center justify-center gap-2"><CheckCircle2 size={18} /> تأیید نهایی و ورود به ERP</button>
      </div>
    </div>
  );
};
