/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Pool, Hall } from "../types";
import { 
  TrendingUp, 
  Sparkles, 
  Sliders, 
  Scale, 
  Utensils, 
  Calendar, 
  ArrowUpRight, 
  CheckCircle2, 
  Fish,
  Zap,
  HelpCircle
} from "lucide-react";
import { 
  ResponsiveContainer, 
  ComposedChart, 
  Area, 
  Line, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Legend 
} from "recharts";

interface BiomassGrowthPredictionProps {
  pools: Pool[];
  halls: Hall[];
}

export const BiomassGrowthPrediction: React.FC<BiomassGrowthPredictionProps> = ({
  pools,
  halls
}) => {
  const [selectedHallId, setSelectedHallId] = useState<number | "all">("all");
  const [targetFcr, setTargetFcr] = useState<number>(1.25);
  const [tempRegime, setTempRegime] = useState<"optimal" | "warm" | "cool">("optimal");

  // Filter pools by hall if specified
  const filteredPools = pools.filter(p => {
    if (selectedHallId === "all") return p.count > 0;
    return p.hallId === selectedHallId && p.count > 0;
  });

  const totalCount = filteredPools.reduce((sum, p) => sum + p.count, 0);
  const initialBiomassKg = filteredPools.reduce((sum, p) => sum + p.totalBiomassKg, 0);
  const initialAvgWeightGrams = totalCount > 0 ? (initialBiomassKg * 1000) / totalCount : 0;

  // Daily Specific Growth Rate (SGR %) based on temperature regime & stage
  let dailySgrPercent = 1.1; // Default optimal SGR for sturgeon
  if (tempRegime === "warm") dailySgrPercent = 1.35; // Accelerated growth in warmer waters (22-25°C)
  if (tempRegime === "cool") dailySgrPercent = 0.75; // Slower growth in cool waters (<16°C)

  // Adjust SGR slightly based on fish size (smaller fish grow at higher SGR %)
  if (initialAvgWeightGrams < 100) dailySgrPercent *= 1.4; // Nursery rapid growth
  else if (initialAvgWeightGrams > 2000) dailySgrPercent *= 0.75; // Mature broodstock slower SGR %

  // Generate 12-week (3 months) projection steps: Week 0, Week 2, Week 4 (Mo 1), Week 6, Week 8 (Mo 2), Week 10, Week 12 (Mo 3)
  const projectionSteps = [
    { label: "امروز (هفته ۰)", days: 0, month: "کنونی" },
    { label: "هفته ۲", days: 14, month: "ماه ۱" },
    { label: "هفته ۴ (ماه اول)", days: 28, month: "ماه ۱" },
    { label: "هفته ۶", days: 42, month: "ماه ۲" },
    { label: "هفته ۸ (ماه دوم)", days: 56, month: "ماه ۲" },
    { label: "هفته ۱۰", days: 70, month: "ماه ۳" },
    { label: "هفته ۱۲ (ماه سوم)", days: 84, month: "ماه ۳" }
  ];

  let cumulativeFeedKg = 0;
  let prevBiomass = initialBiomassKg;

  const chartData = projectionSteps.map((step) => {
    const growthFactor = Math.pow(1 + dailySgrPercent / 100, step.days);
    const estAvgWeightGrams = Math.round(initialAvgWeightGrams * growthFactor);
    const estBiomassKg = Math.round((estAvgWeightGrams * totalCount) / 1000);
    
    const biomassIncreasePeriod = Math.max(0, estBiomassKg - prevBiomass);
    const feedForPeriod = Math.round(biomassIncreasePeriod * targetFcr);
    cumulativeFeedKg += feedForPeriod;
    prevBiomass = estBiomassKg;

    return {
      stepLabel: step.label,
      days: step.days,
      avgWeightGrams: estAvgWeightGrams,
      avgWeightKg: Number((estAvgWeightGrams / 1000).toFixed(2)),
      biomassTons: Number((estBiomassKg / 1000).toFixed(2)),
      biomassKg: estBiomassKg,
      feedRequiredTons: Number((cumulativeFeedKg / 1000).toFixed(2)),
      feedPeriodKg: feedForPeriod
    };
  });

  const finalProjection = chartData[chartData.length - 1];
  const totalBiomassGainKg = finalProjection.biomassKg - initialBiomassKg;
  const totalFeedNeededTons = finalProjection.feedRequiredTons;

  return (
    <div className="glass-card-3d p-6 relative overflow-hidden border border-cyan-500/30">
      {/* BACKGROUND DECORATIVE GLOW */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* HEADER SECTION */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-6 relative z-10 border-b border-white/10 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 bg-gradient-to-r from-purple-500/20 to-cyan-500/20 text-purple-300 rounded-full text-[10px] font-black border border-purple-500/30 flex items-center gap-1">
              <Sparkles size={11} className="text-cyan-400" />
              مدل شبیه‌ساز بیولوژیک رشد
            </span>
            <span className="text-[11px] text-slate-400 font-mono">Biomass Growth Prediction (3 Months)</span>
          </div>
          <h3 className="text-lg font-black text-white flex items-center gap-2">
            <TrendingUp className="text-cyan-400" size={22} />
            پیش‌بینی رشد زیست‌توده و وزن ماهیان خاویاری در ۳ ماه آینده
          </h3>
          <p className="text-xs text-slate-300 mt-1">
            محاسبه روند فزونی وزن متوسط ماهیان، زیست‌توده کل (تن) و حجم جیره غذایی بر اساس ضریب FCR و دمای آب
          </p>
        </div>

        {/* CONTROLS BAR */}
        <div className="flex flex-wrap items-center gap-3 bg-slate-900/90 p-3 rounded-2xl border border-slate-700/80 w-full lg:w-auto">
          {/* Hall selector */}
          <div className="flex flex-col gap-1 text-[10px]">
            <span className="text-slate-400 font-bold flex items-center gap-1">
              <Fish size={10} className="text-cyan-400" />
              انتخاب سالن:
            </span>
            <select
              value={selectedHallId}
              onChange={(e) => setSelectedHallId(e.target.value === "all" ? "all" : Number(e.target.value))}
              className="bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white outline-none focus:border-cyan-500 font-sans"
            >
              <option value="all">کل مزرعه ({pools.reduce((s, p) => s + p.count, 0).toLocaleString()} قطعه)</option>
              {halls.map((h) => {
                const hallCount = pools.filter(p => p.hallId === h.id).reduce((s, p) => s + p.count, 0);
                return (
                  <option key={h.id} value={h.id}>
                    سالن {h.id} ({hallCount.toLocaleString()} قطعه)
                  </option>
                );
              })}
            </select>
          </div>

          {/* FCR Selector */}
          <div className="flex flex-col gap-1 text-[10px]">
            <span className="text-slate-400 font-bold flex items-center gap-1">
              <Utensils size={10} className="text-purple-400" />
              ضریب FCR هدف:
            </span>
            <select
              value={targetFcr}
              onChange={(e) => setTargetFcr(Number(e.target.value))}
              className="bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-cyan-300 font-mono outline-none focus:border-cyan-500"
            >
              <option value={1.15}>1.15 (فوق‌العاده)</option>
              <option value={1.25}>1.25 (استاندارد فارم)</option>
              <option value={1.35}>1.35 (محتاطانه)</option>
              <option value={1.50}>1.50 (حداکثر)</option>
            </select>
          </div>

          {/* Temperature Regime Selector */}
          <div className="flex flex-col gap-1 text-[10px]">
            <span className="text-slate-400 font-bold flex items-center gap-1">
              <Sliders size={10} className="text-emerald-400" />
              رژیم دمای آب:
            </span>
            <select
              value={tempRegime}
              onChange={(e) => setTempRegime(e.target.value as any)}
              className="bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-emerald-300 font-sans outline-none focus:border-cyan-500"
            >
              <option value="optimal">استاندارد (۱۸-۲۲°C - SGR 1.1%)</option>
              <option value="warm">گرم/پرواری (۲۲-۲۵°C - SGR 1.35%)</option>
              <option value="cool">سرد/زمستانه (&lt;۱۶°C - SGR 0.75%)</option>
            </select>
          </div>
        </div>
      </div>

      {/* PROJECTION METRICS CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 mb-6 relative z-10">
        
        {/* Metric 1: Avg Weight Change */}
        <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-400 block font-semibold">وزن متوسط هر ماهی</span>
          <div className="flex items-baseline gap-1">
            <strong className="text-lg font-black text-white font-mono">
              {Math.round(initialAvgWeightGrams)}g
            </strong>
            <span className="text-cyan-400 text-xs font-mono font-bold">➔ {finalProjection.avgWeightGrams}g</span>
          </div>
          <span className="text-[9px] text-emerald-400 block font-semibold flex items-center gap-0.5">
            <ArrowUpRight size={10} />
            +{Math.round(finalProjection.avgWeightGrams - initialAvgWeightGrams)} گرم افزایش بر قطعه
          </span>
        </div>

        {/* Metric 2: Biomass Change */}
        <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-400 block font-semibold">پیش‌بینی زیست‌توده (Biomass)</span>
          <div className="flex items-baseline gap-1">
            <strong className="text-lg font-black text-cyan-300 font-mono">
              {(initialBiomassKg / 1000).toFixed(2)}تن
            </strong>
            <span className="text-purple-300 text-xs font-mono font-bold">➔ {finalProjection.biomassTons} تن</span>
          </div>
          <span className="text-[9px] text-purple-300 block font-semibold">
            🚀 +{Math.round(totalBiomassGainKg).toLocaleString()} kg افزایش تناژ کل
          </span>
        </div>

        {/* Metric 3: Feed Needed */}
        <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-400 block font-semibold">خوراک پلت مورد نیاز (۹۰ روز)</span>
          <strong className="text-lg font-black text-amber-300 font-mono block">
            {totalFeedNeededTons} <span className="text-xs font-sans text-slate-400">تن خوراک</span>
          </strong>
          <span className="text-[9px] text-amber-400 block font-semibold">
            📦 میانگین daily: {Math.round((totalFeedNeededTons * 1000) / 84)} kg/روز
          </span>
        </div>

        {/* Metric 4: Estimated Valuation Growth */}
        <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-400 block font-semibold">ارزش‌افزوده بیولوژیکی زیست‌توده</span>
          <strong className="text-lg font-black text-emerald-400 font-mono block">
            +{(totalBiomassGainKg * 380000 / 10000000).toFixed(1)} <span className="text-xs font-sans text-slate-400">میلیارد تومان</span>
          </strong>
          <span className="text-[9px] text-slate-400 block font-sans">
            بر اساس مبنای تقریبی ۳۸۰ هزار تومان/kg
          </span>
        </div>

      </div>

      {/* RECHARTS COMPOSED CHART (AREA + LINE + BAR) */}
      <div className="h-[360px] w-full relative z-10 my-2">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 10, bottom: 10 }}>
            <defs>
              <linearGradient id="biomassGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#A855F7" stopOpacity={0.6} />
                <stop offset="95%" stopColor="#A855F7" stopOpacity={0.05} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" vertical={false} />

            <XAxis 
              dataKey="stepLabel" 
              stroke="#94A3B8" 
              fontSize={11} 
              tickLine={false}
              axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
            />

            {/* Left Y-Axis: Biomass in Tons */}
            <YAxis 
              yAxisId="biomass"
              stroke="#C084FC" 
              fontSize={11} 
              tickLine={false}
              axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
              tickFormatter={(val) => `${val} تن`}
            />

            {/* Right Y-Axis: Average Weight in Grams */}
            <YAxis 
              yAxisId="weight"
              orientation="right"
              stroke="#38BDF8" 
              fontSize={11} 
              tickLine={false}
              axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
              tickFormatter={(val) => `${val}g`}
            />

            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#0F172A', 
                borderColor: 'rgba(168, 85, 247, 0.4)', 
                borderRadius: '1rem',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.6)',
                color: '#FFFFFF',
                fontSize: '12px',
                direction: 'rtl'
              }}
              formatter={(value: any, name: any) => {
                if (name === "زیست‌توده کل (تن)") return [`${value} تن`, name];
                if (name === "وزن متوسط هر ماهی (گرم)") return [`${value} گرم`, name];
                if (name === "خوراک مصرفی انباشته (تن)") return [`${value} تن`, name];
                return [value, name];
              }}
              labelStyle={{ fontWeight: 'bold', color: '#38BDF8', marginBottom: '6px' }}
            />

            <Legend 
              verticalAlign="top" 
              height={36}
              wrapperStyle={{ fontSize: '11px', color: '#E2E8F0' }}
            />

            {/* Biomass Area */}
            <Area 
              yAxisId="biomass"
              type="monotone" 
              dataKey="biomassTons" 
              name="زیست‌توده کل (تن)" 
              stroke="#A855F7" 
              strokeWidth={3} 
              fillOpacity={1} 
              fill="url(#biomassGrad)" 
            />

            {/* Avg Weight Line */}
            <Line 
              yAxisId="weight"
              type="monotone" 
              dataKey="avgWeightGrams" 
              name="وزن متوسط هر ماهی (گرم)" 
              stroke="#06B6D4" 
              strokeWidth={3}
              dot={{ r: 5, fill: "#06B6D4", stroke: "#0F172A", strokeWidth: 2 }}
              activeDot={{ r: 8 }}
            />

            {/* Cumulative Feed Bar */}
            <Bar 
              yAxisId="biomass"
              dataKey="feedRequiredTons" 
              name="خوراک مصرفی انباشته (تن)" 
              fill="#F59E0B" 
              opacity={0.4}
              barSize={18}
              radius={[6, 6, 0, 0]}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* FOOTER INSIGHTS */}
      <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-slate-300 relative z-10">
        <div className="bg-slate-900/60 p-3 rounded-xl border border-white/5 flex items-start gap-2">
          <Zap size={16} className="text-cyan-400 shrink-0 mt-0.5" />
          <div>
            <span className="text-[10px] text-slate-400 font-bold block">نرخ رشد روزانه (SGR %):</span>
            <p className="text-[11px] text-slate-200 mt-0.5">
              مبنای SGR روی <strong className="text-cyan-300 font-mono">{dailySgrPercent.toFixed(2)}%</strong> تنظیم گردیده است که معادل افزایش بیوماس استاندارد فارم‌های نوین خاویاری است.
            </p>
          </div>
        </div>

        <div className="bg-slate-900/60 p-3 rounded-xl border border-white/5 flex items-start gap-2">
          <Utensils size={16} className="text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="text-[10px] text-slate-400 font-bold block">توصیه انبار خوراک:</span>
            <p className="text-[11px] text-slate-200 mt-0.5">
              جهت تامین نیاز ۳ ماه آینده، سفارش سفارش حداقل <strong className="text-amber-300 font-mono">{totalFeedNeededTons} تن</strong> پلت ماهی با پروتئین ۴۵٪ در جدول سفارشات انبار پیشنهاد می‌شود.
            </p>
          </div>
        </div>

        <div className="bg-slate-900/60 p-3 rounded-xl border border-white/5 flex items-start gap-2">
          <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <span className="text-[10px] text-slate-400 font-bold block">پیش‌بینی سورتمه و رقم‌بندی:</span>
            <p className="text-[11px] text-slate-200 mt-0.5">
              ماهیان در هفته ششم به میانگین گرام‌آژ مناسب برای رقم‌بندی (Grading) و تفکیک بر اساس وزن خواهد رسید.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};
