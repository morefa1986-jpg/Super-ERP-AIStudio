import React, { useMemo, useState } from "react";
import { Pool, Hall, MortalityLog } from "../types";
import { Activity, AlertTriangle, BarChart3, CalendarRange, Fish, Gauge, HeartCrack, LayoutDashboard, Scale, Thermometer, Waves } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatPersianNumber, toPersianDigits } from "../utils/persianFormat";

interface DashboardStatsProps {
  pools: Pool[];
  halls: Hall[];
  mortalityCount: number;
  mortalityLogs?: MortalityLog[];
}

type DashboardPeriod = "day" | "week" | "month" | "year";

const PERIODS: { id: DashboardPeriod; label: string; days: number }[] = [
  { id: "day", label: "روزانه", days: 1 },
  { id: "week", label: "هفتگی", days: 7 },
  { id: "month", label: "ماهانه", days: 30 },
  { id: "year", label: "سالانه", days: 365 },
];

const validWaterValue = (value: number | undefined, min: number, max: number) =>
  typeof value === "number" && Number.isFinite(value) && value >= min && value <= max;

const getLogGregorianTime = (log: MortalityLog): number | null => {
  const candidate = log.timestampGregorian || log.dateGregorian || log.createdAtGregorian;
  if (!candidate) return null;
  const time = new Date(candidate).getTime();
  return Number.isFinite(time) ? time : null;
};

export const DashboardStats: React.FC<DashboardStatsProps> = ({
  pools,
  halls,
  mortalityCount,
  mortalityLogs = [],
}) => {
  const [period, setPeriod] = useState<DashboardPeriod>("day");
  const selectedPeriod = PERIODS.find((item) => item.id === period) || PERIODS[0];

  const periodMortality = useMemo(() => {
    if (!mortalityLogs.length) return { count: mortalityCount, dated: false };
    const now = Date.now();
    const minTime = now - selectedPeriod.days * 24 * 60 * 60 * 1000;
    const datedLogs = mortalityLogs
      .map((log) => ({ log, time: getLogGregorianTime(log) }))
      .filter((item): item is { log: MortalityLog; time: number } => item.time !== null);

    if (!datedLogs.length) return { count: mortalityCount, dated: false };

    return {
      count: datedLogs
        .filter((item) => item.time >= minTime && item.time <= now)
        .reduce((sum, item) => sum + Math.max(0, item.log.count || 0), 0),
      dated: true,
    };
  }, [mortalityLogs, mortalityCount, selectedPeriod.days]);

  const metrics = useMemo(() => {
    const activePools = pools.filter((pool) => pool.count > 0);
    const totalFish = pools.reduce((sum, pool) => sum + Math.max(0, pool.count || 0), 0);
    const totalBiomassKg = pools.reduce((sum, pool) => sum + Math.max(0, pool.totalBiomassKg || 0), 0);
    const oxygenValues = activePools.map((p) => p.oxygenLevel).filter((v) => validWaterValue(v, 0.1, 25));
    const temperatureValues = activePools.map((p) => p.temperature).filter((v) => validWaterValue(v, 0.1, 40));
    const avgOxygen = oxygenValues.length ? oxygenValues.reduce((s, v) => s + v, 0) / oxygenValues.length : null;
    const avgTemperature = temperatureValues.length ? temperatureValues.reduce((s, v) => s + v, 0) / temperatureValues.length : null;
    const criticalPools = activePools.filter((p) => {
      const invalid = !validWaterValue(p.oxygenLevel, 0.1, 25) || !validWaterValue(p.temperature, 0.1, 40) || !validWaterValue(p.phLevel, 4, 10);
      return invalid || p.oxygenLevel < 5 || p.temperature < 8 || p.temperature > 26 || p.phLevel < 6.5 || p.phLevel > 8.5;
    });
    return { activePools, totalFish, totalBiomassKg, avgOxygen, avgTemperature, criticalPools };
  }, [pools]);

  const hallData = useMemo(() => halls.map((hall) => {
    const hp = pools.filter((p) => p.hallId === hall.id);
    return {
      name: `سالن ${toPersianDigits(hall.id)}`,
      biomass: Math.round(hp.reduce((s, p) => s + (p.totalBiomassKg || 0), 0)),
      fish: hp.reduce((s, p) => s + (p.count || 0), 0),
    };
  }).filter((x) => x.biomass > 0 || x.fish > 0), [halls, pools]);

  const breedData = useMemo(() => {
    const totals = new Map<string, number>();
    pools.forEach((p) => {
      if (p.count > 0) {
        const name = String(p.breed || "نامشخص").split(" (")[0];
        totals.set(name, (totals.get(name) || 0) + p.count);
      }
    });
    return Array.from(totals.entries()).map(([name, value]) => ({ name, value }));
  }, [pools]);

  const mortalityRate = (periodMortality.count / Math.max(metrics.totalFish + periodMortality.count, 1)) * 100;
  const cards = [
    {
      label: "زیست‌توده فعلی",
      value: `${formatPersianNumber(metrics.totalBiomassKg / 1000, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} تن`,
      detail: `${formatPersianNumber(metrics.totalBiomassKg)} کیلوگرم`,
      icon: Scale,
    },
    {
      label: "ماهیان فعال فعلی",
      value: formatPersianNumber(metrics.totalFish),
      detail: `${formatPersianNumber(metrics.activePools.length)} استخر فعال`,
      icon: Fish,
    },
    {
      label: "کیفیت لحظه‌ای آب",
      value: metrics.avgOxygen === null ? "داده معتبر نیست" : `${formatPersianNumber(metrics.avgOxygen, { maximumFractionDigits: 1 })} mg/L`,
      detail: metrics.avgTemperature === null ? "دمای معتبر موجود نیست" : `دمای متوسط ${formatPersianNumber(metrics.avgTemperature, { maximumFractionDigits: 1 })}°C`,
      icon: Waves,
    },
    {
      label: `تلفات ${selectedPeriod.label}`,
      value: formatPersianNumber(periodMortality.count),
      detail: `${formatPersianNumber(mortalityRate, { minimumFractionDigits: 3, maximumFractionDigits: 3 })}٪ از جمعیت ثبت‌شده`,
      icon: HeartCrack,
    },
  ];

  return <div id="management-dashboard" className="space-y-6">
    <section className="glass-card-3d p-6 overflow-hidden relative">
      <div className="absolute inset-y-0 left-0 w-56 bg-cyan-500/10 blur-3xl pointer-events-none" />
      <div className="relative flex flex-col gap-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-cyan-300 text-xs font-black mb-2"><LayoutDashboard size={18}/>داشبورد فرماندهی مدیریت فارم</div>
            <h2 className="text-2xl font-black text-white">نمای یکپارچه تولید، زیست‌توده و سلامت آب</h2>
            <p className="text-xs text-slate-300 mt-2 max-w-3xl leading-6">بازه زمانی انتخابی روی شاخص‌های دوره‌ای اعمال می‌شود. شاخص‌های موجودی، زیست‌توده و کیفیت آب ماهیت لحظه‌ای دارند و وضعیت فعلی فارم را نمایش می‌دهند.</p>
          </div>
          <div className={`rounded-2xl px-4 py-3 border ${metrics.criticalPools.length ? "bg-rose-500/10 border-rose-500/30 text-rose-200" : "bg-emerald-500/10 border-emerald-500/30 text-emerald-200"}`}>
            <div className="flex items-center gap-2 font-black text-sm">{metrics.criticalPools.length ? <AlertTriangle size={18}/> : <Activity size={18}/>} {metrics.criticalPools.length ? `${formatPersianNumber(metrics.criticalPools.length)} استخر نیازمند بررسی` : "وضعیت آب بدون هشدار بحرانی"}</div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950/50 border border-white/10 rounded-2xl p-3">
          <div className="flex items-center gap-2 text-xs text-slate-300 font-bold"><CalendarRange size={16} className="text-cyan-300"/>بازه تحلیل داشبورد</div>
          <div className="grid grid-cols-4 gap-2 w-full sm:w-auto" role="group" aria-label="انتخاب بازه زمانی داشبورد">
            {PERIODS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setPeriod(item.id)}
                aria-pressed={period === item.id}
                className={`px-3 py-2 rounded-xl text-[11px] font-black transition-all cursor-pointer border ${period === item.id ? "bg-cyan-500 text-slate-950 border-cyan-300 shadow-lg shadow-cyan-500/20" : "bg-slate-900/70 text-slate-300 border-slate-700 hover:border-cyan-500/40 hover:text-white"}`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {!periodMortality.dated && mortalityLogs.length > 0 && (
          <div className="text-[10px] text-amber-200 bg-amber-500/10 border border-amber-500/20 rounded-xl px-3 py-2">برخی سوابق قدیمی تاریخ میلادی قابل پردازش ندارند؛ تا زمان تکمیل مهاجرت داده، عدد تلفات این بخش از مجموع سوابق موجود استفاده می‌کند.</div>
        )}
      </div>
    </section>

    <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {cards.map(({label,value,detail,icon:Icon}) => <div key={label} className="glass-card-3d p-5 min-h-36 flex items-start justify-between gap-4"><div><span className="text-[10px] text-slate-400 font-bold">{label}</span><strong className="block text-xl text-white font-black mt-2">{value}</strong><span className="block text-[10px] text-slate-400 mt-2">{detail}</span></div><div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-300"><Icon size={22}/></div></div>)}
    </section>

    <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <div className="xl:col-span-2 glass-card-3d p-6"><div className="flex items-center gap-2 mb-5 text-white font-black"><BarChart3 size={18} className="text-cyan-300"/>بیوماس سالن‌ها</div><div className="h-80" dir="ltr"><ResponsiveContainer width="100%" height="100%"><BarChart data={hallData}><CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,.15)" vertical={false}/><XAxis dataKey="name" stroke="#94a3b8" fontSize={10}/><YAxis stroke="#94a3b8" fontSize={10} tickFormatter={(value) => formatPersianNumber(Number(value))}/><Tooltip contentStyle={{background:"#0f172a",border:"1px solid #334155",borderRadius:12,color:"white"}} formatter={(value) => [formatPersianNumber(Number(value)), "زیست‌توده (کیلوگرم)"]}/><Bar dataKey="biomass" name="زیست‌توده" fill="#22d3ee" radius={[7,7,0,0]}/></BarChart></ResponsiveContainer></div></div>
      <div className="glass-card-3d p-6"><div className="flex items-center gap-2 mb-5 text-white font-black"><Gauge size={18} className="text-emerald-300"/>ترکیب گله بر اساس گونه</div><div className="h-64" dir="ltr"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={breedData} dataKey="value" nameKey="name" innerRadius={52} outerRadius={88} paddingAngle={3}>{breedData.map((e,i)=><Cell key={`${e.name}-${i}`} fill={["#22d3ee","#34d399","#a78bfa","#f59e0b","#fb7185","#60a5fa"][i%6]}/>)}</Pie><Tooltip contentStyle={{background:"#0f172a",border:"1px solid #334155",borderRadius:12,color:"white"}} formatter={(value) => [formatPersianNumber(Number(value)), "قطعه"]}/></PieChart></ResponsiveContainer></div><div className="space-y-2 mt-2">{breedData.slice(0,6).map((item)=><div key={item.name} className="flex items-center justify-between text-[10px] text-slate-300 border-b border-white/5 pb-2"><span>{item.name}</span><strong>{formatPersianNumber(item.value)} قطعه</strong></div>)}</div></div>
    </section>

    <section className="glass-card-3d p-6"><div className="flex items-center gap-2 mb-4 text-white font-black"><Thermometer size={18} className="text-amber-300"/>پایش استخرهای نیازمند اقدام</div>{metrics.criticalPools.length === 0 ? <div className="text-sm text-emerald-200 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4">در داده‌های فعلی، استخر بحرانی شناسایی نشد.</div> : <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">{metrics.criticalPools.slice(0,12).map((p)=><div key={p.id} className="rounded-2xl bg-rose-500/10 border border-rose-500/20 p-4"><div className="flex items-center justify-between gap-2"><strong className="text-white text-sm">{p.name}</strong><span className="text-[9px] text-rose-200">سالن {toPersianDigits(p.hallId)}</span></div><div className="grid grid-cols-3 gap-2 mt-3 text-[10px] text-slate-300"><span>O₂: {formatPersianNumber(p.oxygenLevel)}</span><span>دما: {formatPersianNumber(p.temperature)}°</span><span>pH: {formatPersianNumber(p.phLevel)}</span></div></div>)}</div>}</section>
  </div>;
};