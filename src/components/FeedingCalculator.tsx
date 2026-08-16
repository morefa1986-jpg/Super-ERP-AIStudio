/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Pool, SturgeonBreed } from "../types";
import { 
  Calculator, 
  Sparkles, 
  Utensils, 
  HelpCircle, 
  Check, 
  TrendingUp, 
  RefreshCw,
  Gauge,
  Thermometer,
  Compass
} from "lucide-react";
import { calculateSturgeonFeed, evaluateFeedingWaterSafety, formatRequiredSensorParam, formatRequiredSensorParamWithUnit } from "../utils/aquacultureUtils";

interface FeedingCalculatorProps {
  pools: Pool[];
  onAddFeedingLog: (poolId: string, feedType: string, givenKg: number, eatenPercent: number, nextEstimateKg: number) => void;
}

export const FeedingCalculator: React.FC<FeedingCalculatorProps> = ({ 
  pools,
  onAddFeedingLog
}) => {
  const activePools = pools.filter(p => p.count > 0);
  
  // State for NEXT MEAL estimator from previous meal
  const [estSelectedPoolId, setEstSelectedPoolId] = useState<string>(activePools[0]?.id || "");
  const [prevMealGiven, setPrevMealGiven] = useState<number>(10);
  const [eatenPercent, setEatenPercent] = useState<number>(90);
  const [feedType, setFeedType] = useState<string>("پفکی شماره ۵");
  const [feedLogs, setFeedLogs] = useState<Array<{
    poolName: string;
    feedType: string;
    given: number;
    eaten: number;
    leftover: number;
    nextEst: number;
    time: string;
  }>>([
    { poolName: "استخر ۱ (سالن ۲)", feedType: "پفکی شماره ۵", given: 12, eaten: 95, leftover: 0.6, nextEst: 12.6, time: "امروز ۱۰:۳۰" },
    { poolName: "استخر پرواری ۳ (سالن ۱۰)", feedType: "غرق‌شونده خارجی", given: 25, eaten: 70, leftover: 7.5, nextEst: 18.75, time: "امروز ۰۸:۱۵" }
  ]);

  // State for FCR historical calculator
  const [fcrInitialCount, setFcrInitialCount] = useState<number>(500);
  const [fcrFinalCount, setFcrFinalCount] = useState<number>(495);
  const [fcrInitialAvgWeight, setFcrInitialAvgWeight] = useState<number>(450); // grams
  const [fcrFinalAvgWeight, setFcrFinalAvgWeight] = useState<number>(820); // grams
  const [fcrTotalFeed, setFcrTotalFeed] = useState<number>(220); // kg
  
  // Calculate selected pool data for estimator
  const selectedPool = pools.find(p => p.id === estSelectedPoolId);
  const poolTemperature = selectedPool ? selectedPool.temperature : 17.5;
  const poolBiomass = selectedPool ? selectedPool.totalBiomassKg : 100;
  const poolBreed = selectedPool ? selectedPool.breed : SturgeonBreed.BELUGA;
  const poolAvgWeight = selectedPool ? selectedPool.avgWeightGrams : 400;

  // Run the biological calculator for the selected pool
  const bioResult = calculateSturgeonFeed(poolAvgWeight, poolTemperature, poolBiomass, poolBreed);
  const feedingWaterSafety = evaluateFeedingWaterSafety(selectedPool);
  const feedingLocked = !feedingWaterSafety.canFeed || bioResult.numberOfMeals <= 0 || bioResult.dailyFeedKg <= 0;

  // Combine biological calculations with appetite adjustments
  const leftoverKg = parseFloat((prevMealGiven * (1 - eatenPercent / 100)).toFixed(2));
  
  let appetiteMultiplier = 1.0;
  let appetiteSeverity: "normal" | "warning" | "danger" = "normal";

  if (eatenPercent === 100) {
    appetiteMultiplier = 1.05; // Excellent
  } else if (eatenPercent >= 90) {
    appetiteMultiplier = 1.0; // Great
  } else if (eatenPercent >= 80) {
    appetiteMultiplier = 0.92;
    appetiteSeverity = "warning";
  } else {
    appetiteMultiplier = 0.8; // Reduce heavily
    appetiteSeverity = "danger";
  }

  // Next meal is standard biological daily requirement divided by recommended number of meals
  // and modified by appetite feedback
  const singleMealBioRequiredKg = bioResult.numberOfMeals > 0 
    ? parseFloat((bioResult.dailyFeedKg / bioResult.numberOfMeals).toFixed(2))
    : 0;

  const estimatedNextMeal = feedingLocked ? 0 : parseFloat((
    singleMealBioRequiredKg > 0
      ? singleMealBioRequiredKg * appetiteMultiplier 
      : prevMealGiven * (eatenPercent / 100) * appetiteMultiplier
  ).toFixed(2));

  // FCR CALCULATOR LOGIC
  const initialBiomass = (fcrInitialCount * fcrInitialAvgWeight) / 1000;
  const finalBiomass = (fcrFinalCount * fcrFinalAvgWeight) / 1000;
  const weightGain = parseFloat((finalBiomass - initialBiomass).toFixed(1));
  const survivalRate = parseFloat(((fcrFinalCount / fcrInitialCount) * 100).toFixed(1));
  const computedFcr = weightGain > 0 ? parseFloat((fcrTotalFeed / weightGain).toFixed(2)) : 0;

  // Add estimation record to log
  const handleSaveEstimation = () => {
    if (!selectedPool) return;
    if (feedingLocked) return;
    
    onAddFeedingLog(
      selectedPool.id, 
      feedType, 
      prevMealGiven, 
      eatenPercent, 
      estimatedNextMeal
    );

    const newLog = {
      poolName: `${selectedPool.name} (${pools.find(p => p.id === selectedPool.id)?.dimensionsDesc.split(" ")[0]})`,
      feedType,
      given: prevMealGiven,
      eaten: eatenPercent,
      leftover: leftoverKg,
      nextEst: estimatedNextMeal,
      time: "همین الآن"
    };

    setFeedLogs([newLog, ...feedLogs]);
  };

  return (
    <div id="feeding-calculator-container" className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      
      {/* COLUMN 1 & 2: NEXT MEAL ESTIMATOR */}
      <div className="xl:col-span-2 bg-white rounded-3xl p-6 border border-natural-border shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-natural-khaki text-natural-forest rounded-2xl font-bold">
                <Utensils size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-natural-dark font-sans">تخمین هوشمند خوراک وعده بعدی</h3>
                <p className="text-xs text-natural-text/70 font-sans">افزایش یا کاهش خودکار پلت بر مبنای نرخ اشتها، پسماند استخر و دمای آب</p>
              </div>
            </div>
            
            <span className="text-[10px] uppercase font-mono px-2.5 py-1 text-natural-earth bg-natural-khaki/80 border border-natural-border rounded-full font-bold">
              مبنای بیولوژی تاس‌ماهی
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Input fields */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-natural-text mb-1.5 font-sans">انتخاب استخر جهت واکشی اطلاعات بیوماس:</label>
                <select
                  value={estSelectedPoolId}
                  onChange={(e) => setEstSelectedPoolId(e.target.value)}
                  className="w-full text-xs font-sans rounded-xl border border-natural-border p-3 bg-[#FDFCF8] focus:border-natural-earth focus:outline-none"
                >
                  {activePools.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} - {p.dimensionsDesc} ({p.breed.split(" ")[0]} - {p.count}p)
                    </option>
                  ))}
                </select>
              </div>

              {selectedPool && (
                <div className="bg-[#FDFCF8] p-4 rounded-xl border border-natural-border flex items-center justify-between gap-2 text-xs shadow-inner">
                  <div>
                    <span className="text-natural-text/60 font-sans block">بیوماس فعلی استخر:</span>
                    <strong className="text-natural-dark font-mono text-sm">{poolBiomass.toLocaleString()} kg</strong>
                  </div>
                  <div>
                    <span className="text-natural-text/60 font-sans block">آخرین دمای آب ثبت‌شده:</span>
                    <strong className="text-natural-dark font-mono text-sm">{formatRequiredSensorParamWithUnit(poolTemperature, "°C")}</strong>
                  </div>
                  <div>
                    <span className="text-natural-text/60 font-sans block">اکسیژن پایش:</span>
                    <strong className="text-natural-dark font-mono text-sm">{formatRequiredSensorParamWithUnit(selectedPool.oxygenLevel, " ppm")}</strong>
                  </div>
                  <div>
                    <span className="text-natural-text/60 font-sans block">pH آب:</span>
                    <strong className="text-natural-dark font-mono text-sm">{formatRequiredSensorParam(selectedPool.phLevel)}</strong>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-natural-text mb-1.5 font-sans">نوع غذای ارائه‌شده (پلت):</label>
                <input
                  type="text"
                  value={feedType}
                  onChange={(e) => setFeedType(e.target.value)}
                  className="w-full text-xs font-sans rounded-xl border border-natural-border p-3 bg-[#FDFCF8] focus:border-natural-earth focus:outline-none"
                  placeholder="مثال: پفکی Coppens سایز ۵"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-natural-text mb-1.5 font-sans">مقدار غذا در وعده قبل (kg):</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={prevMealGiven}
                    onChange={(e) => setPrevMealGiven(parseFloat(e.target.value) || 0)}
                    className="w-full text-xs font-mono rounded-xl border border-natural-border p-3 bg-[#FDFCF8] focus:border-natural-earth focus:outline-none text-center text-natural-dark font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-natural-text mb-1.5 font-sans">میزان خورده شده (٪):</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="10"
                      max="100"
                      step="5"
                      value={eatenPercent}
                      onChange={(e) => setEatenPercent(parseInt(e.target.value) || 100)}
                      className="w-full accent-natural-forest cursor-pointer"
                    />
                    <span className="text-xs font-bold font-mono text-natural-forest shrink-0 w-10 text-left">
                      {eatenPercent}٪
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Results visualization */}
            <div className="bg-natural-khaki text-natural-text p-5 rounded-2xl border border-natural-border flex flex-col justify-between relative overflow-hidden shadow-inner">
              <div className="absolute top-0 right-0 w-48 h-48 bg-natural-forest/5 rounded-full blur-2xl pointer-events-none" />
              
              <div>
                <span className="text-[10px] text-natural-earth font-sans tracking-wide uppercase font-semibold">خروجی فرمول شیلاتی</span>
                <h4 className="text-sm font-semibold text-natural-dark mt-1 border-b border-natural-border pb-2 font-sans">گزارش اشتها و پسماند</h4>
                
                <div className="space-y-3 mt-4 text-xs font-sans text-natural-text/80">
                  <div className="flex justify-between">
                    <span>مقدار پسماند و هدررفته در کف استخر:</span>
                    <span className="font-mono text-natural-clay font-bold">{leftoverKg} kg</span>
                  </div>
                  <div className="flex justify-between">
                    <span>خالص حجم هضم‌شده توسط گله:</span>
                    <span className="font-mono text-natural-forest font-bold">{(prevMealGiven - leftoverKg).toFixed(2)} kg</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>ضریب تعدیل دما و رفتار غریزی:</span>
                    <span className="px-2 py-0.5 rounded bg-white text-[10px] border border-natural-border font-mono text-natural-text">
                      {feedingLocked ? "قفل ایمنی فعال" : poolTemperature < 12 || poolTemperature > 22 ? "کاهنده اشتها" : "سیستم در محدوده آپتیمم بیولوژیکی"}
                    </span>
                  </div>
                </div>

                {feedingWaterSafety.reasons.length > 0 && (
                  <div className="mt-4 p-2.5 rounded-xl text-xs flex gap-1.5 bg-natural-clay/10 text-natural-clay border border-natural-clay/20">
                    <span className="shrink-0">⛔</span>
                    <p className="leading-relaxed font-sans">
                      تغذیه قفل شد: {feedingWaterSafety.reasons.join(" ")}
                    </p>
                  </div>
                )}

                {bioResult.tempWarningMessage && (
                  <div className={`mt-4 p-2.5 rounded-xl text-xs flex gap-1.5 ${appetiteSeverity === "danger" ? "bg-natural-clay/10 text-natural-clay border border-natural-clay/20" : "bg-natural-earth/10 text-natural-earth border border-natural-earth/20"}`}>
                    <span className="shrink-0">⚠️</span>
                    <p className="leading-relaxed font-sans">{bioResult.tempWarningMessage}</p>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-3 border-t border-natural-border">
                <p className="text-[10px] text-natural-text/60 font-sans">مقدار پیشنهادی خوراک جهت وعده بعدی:</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-3xl font-black text-natural-forest font-mono">{estimatedNextMeal}</span>
                  <span className="text-xs text-natural-text/80 font-sans">کیلوگرم</span>
                </div>
                
                <p className={`text-[10px] mt-1 font-sans font-medium ${appetiteSeverity === "danger" ? "text-natural-clay" : appetiteSeverity === "warning" ? "text-natural-earth" : "text-natural-forest"}`}>
                  {feedingLocked
                    ? "ثبت خوراک و پیشنهاد وعده بعدی تا ورود داده معتبر و خروج از وضعیت بحرانی غیرفعال است."
                    : eatenPercent === 100
                    ? "خوراک کامل مصرف شد؛ وعده جدید ۵٪ افزایش یافت تا پتانسیل رشد نهایی آزمایش شود." 
                    : eatenPercent >= 90
                      ? "مصرف مطلوب؛ خوراک وعده بعد متناسب با میزان مصرف واقعی گله تعدیل شد."
                      : `توجه: به علت باقی ماندن ${leftoverKg} کیلوگرم غذا در کف، دوز وعده جدید به طور ایمن کاهش یافت.`
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-5 border-t border-natural-border flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="text-xs text-natural-text/60 font-sans text-right">
            کلیک بر روی دکمه مقابل، این برآورد را نهایی کرده و فورا در تاریخچه تعذیه این استخر ثبت می‌کند.
          </div>
          <button
            onClick={handleSaveEstimation}
            disabled={!selectedPool || feedingLocked}
            className="px-5 py-3 bg-natural-forest hover:bg-natural-forest-hover text-white font-bold rounded-xl text-xs transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Check size={16} />
            ثبت برآورد و اعمال در تاریخچه تغذیه استخر
          </button>
        </div>
      </div>

      {/* COLUMN 3: FCR CALCULATOR */}
      <div id="fcr-calculator-card" className="bg-natural-dark text-[#FDFCF8] rounded-3xl p-6 border border-natural-forest-hover shadow-md flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2.5 mb-5 border-b border-natural-forest-hover pb-3">
            <div className="p-2 bg-natural-forest text-natural-khaki rounded-xl font-bold border border-natural-forest-hover">
              <Calculator size={18} />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white font-sans">فرمولاسیون ضریب تبدیل غذایی (FCR)</h3>
              <p className="text-[10px] text-natural-khaki/80 font-sans">محاسبه بازدهی و ضریب وزنگیری کل دوره پرورش</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-[10px] text-natural-khaki/70 mb-1 font-sans">تعداد ماهیان ابتدا دوره:</label>
                <input
                  type="number"
                  value={fcrInitialCount}
                  onChange={(e) => setFcrInitialCount(parseInt(e.target.value) || 0)}
                  className="w-full font-mono rounded-lg bg-natural-forest-hover p-2 border border-[#4D6A5E] text-center text-white focus:border-natural-earth focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] text-natural-khaki/70 mb-1 font-sans">تعداد انتهای دوره (باقیمانده):</label>
                <input
                  type="number"
                  value={fcrFinalCount}
                  onChange={(e) => setFcrFinalCount(parseInt(e.target.value) || 0)}
                  className="w-full font-mono rounded-lg bg-natural-forest-hover p-2 border border-[#4D6A5E] text-center text-white focus:border-natural-earth focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-[10px] text-natural-khaki/70 mb-1 font-sans">وزن متوسط ابتدایی (گرم):</label>
                <input
                  type="number"
                  value={fcrInitialAvgWeight}
                  onChange={(e) => setFcrInitialAvgWeight(parseInt(e.target.value) || 0)}
                  className="w-full font-mono rounded-lg bg-natural-forest-hover p-2 border border-[#4D6A5E] text-center text-white focus:border-natural-earth focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] text-natural-khaki/70 mb-1 font-sans">وزن متوسط نهایی (گرم):</label>
                <input
                  type="number"
                  value={fcrFinalAvgWeight}
                  onChange={(e) => setFcrFinalAvgWeight(parseInt(e.target.value) || 0)}
                  className="w-full font-mono rounded-lg bg-natural-forest-hover p-2 border border-[#4D6A5E] text-center text-white focus:border-natural-earth focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] text-natural-khaki/75 mb-1.5 text-right font-sans">کل پلت توزیع شده در این دوره (کیلوگرم):</label>
              <input
                type="number"
                value={fcrTotalFeed}
                onChange={(e) => setFcrTotalFeed(parseInt(e.target.value) || 0)}
                className="w-full font-mono rounded-lg bg-natural-forest-hover p-2.5 border border-[#4D6A5E] text-center text-white text-sm focus:border-natural-earth focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Computation indicators */}
        <div className="mt-6 pt-4 border-t border-natural-forest-hover space-y-4">
          <div className="grid grid-cols-2 gap-2 text-center text-xs">
            <div className="bg-natural-forest-hover p-2 rounded-xl border border-[#4E6A5F]/40 shadow-inner">
              <span className="block text-[9px] text-natural-khaki/70 font-sans">درصد ماندگاری دوره</span>
              <strong className="text-white font-mono text-sm">{survivalRate}%</strong>
            </div>
            <div className="bg-natural-forest-hover p-2 rounded-xl border border-[#4E6A5F]/40 shadow-inner">
              <span className="block text-[9px] text-natural-khaki/70 font-sans">رشد بیوماس خالص (Gain)</span>
              <strong className="text-white font-mono text-sm">{weightGain} kg</strong>
            </div>
          </div>

          <div className="bg-natural-khaki text-natural-dark p-3 rounded-xl border border-natural-border flex items-center justify-between text-xs">
            <div>
              <span className="text-[10px] text-natural-text/60 font-sans block font-semibold">ضریب تبدیل خوراک (FCR):</span>
              <strong className="text-xl font-mono text-natural-forest mt-1 block">
                {computedFcr > 0 ? computedFcr : "۰.۰۰"}
              </strong>
            </div>
            
            <div className="text-left">
              <span className="px-2 py-0.5 bg-natural-forest/10 rounded text-[9px] text-right font-sans block text-natural-text/80">ارزیابی فنی:</span>
              <span className={`text-[10px] font-sans font-bold block mt-1 ${computedFcr <= 1.2 ? "text-natural-forest" : computedFcr <= 1.5 ? "text-natural-earth" : "text-natural-clay"}`}>
                {computedFcr <= 0 ? "در انتظار اطلاعات درست" : computedFcr <= 1.2 ? "فوق‌العاده عالی (بهینه)" : computedFcr <= 1.55 ? "نرمال و استاندارد" : "مصرف نامطلوب پرت بالا"}
              </span>
            </div>
          </div>

          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-start gap-2 text-[10px] text-amber-200 leading-relaxed font-sans">
            <span className="shrink-0 text-amber-400 font-bold">⚠️</span>
            <span>هشدار جیره و تغذیه: محاسبات جیره روزانه بر اساس بیوماس تخمینی و جدول ترمودینامیکی هضم صادر شده و تغییرات دوزدهی حاد مستلزم تایید سرپرست تغذیه و دامپزشک فارم می‌باشد.</span>
          </div>

          <p className="text-[9px] text-natural-khaki/50 text-center leading-relaxed font-sans">
            *محاسبه FCR بر اساس افزایش خالص کل دوره تقسیم بر کل خوراک دریافتی به دست می‌آید. FCR بهینه برای ماهیان خاویاری معمولاً بین ۱.۰ تا ۱.۳ متغیر می‌باشد.
          </p>
        </div>
      </div>

    </div>
  );
};
