/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Pool, Hall, SturgeonBreed } from "../types";
import { formatRequiredSensorParam, formatRequiredSensorParamWithUnit, formatWaterParam, calculatePoolVolumeDetails, evaluateFeedingWaterSafety } from "../utils/aquacultureUtils";
import { 
  Waves, 
  Layers, 
  Compass, 
  Construction, 
  Info, 
  Thermometer, 
  Activity, 
  Droplets,
  AlertTriangle,
  FlameKindling
} from "lucide-react";

interface HallMapProps {
  hall: Hall;
  pools: Pool[];
  selectedPoolId: string | null;
  onSelectPool: (poolId: string) => void;
}

export const HallMap: React.FC<HallMapProps> = ({
  hall,
  pools,
  selectedPoolId,
  onSelectPool,
}) => {
  const hallPools = pools.filter((p) => p.hallId === hall.id);

  // Helper for status colors based on oxygen / temperature
  const getStatusColorClass = (pool: Pool) => {
    if (pool.count === 0) return "bg-[#FDFCF8]/40 hover:bg-natural-khaki/30 text-natural-text/40 border-natural-border border-dashed border";
    if (!evaluateFeedingWaterSafety(pool).isDataValid) return "bg-[#FDFCF8] hover:bg-natural-clay/5 text-natural-clay border-natural-clay/80 border-[3px] ring-2 ring-natural-clay/20 shadow-sm";
    if (pool.oxygenLevel < 4 || pool.temperature > 22) return "bg-[#FDFCF8] hover:bg-natural-clay/5 text-natural-clay border-natural-clay/80 border-[3px] ring-2 ring-natural-clay/20 shadow-sm";
    if (pool.oxygenLevel < 5.5 || pool.temperature > 19) return "bg-[#FDFCF8] hover:bg-natural-earth/5 text-natural-earth border-natural-earth border-[3px] border-t-natural-clay shadow-sm";
    return "bg-white hover:bg-natural-forest/5 text-natural-forest border-natural-forest border-2 shadow-sm";
  };

  const getStatusLabel = (pool: Pool) => {
    if (pool.count === 0) return "خالی";
    if (!evaluateFeedingWaterSafety(pool).isDataValid) return "داده آب نامعتبر";
    if (pool.oxygenLevel < 4) return "کمبود حیاتی اکسیژن";
    if (pool.oxygenLevel < 5.5) return "اکسیژن لب‌مرز";
    if (pool.temperature > 20) return "دمای بالا";
    return "سالم و عادی";
  };

  // Render layouts differently depending on the Hall type
  const renderPoolsLayout = () => {
    if (hall.isUnderConstruction) {
      return (
        <div id="construction-placeholder" className="col-span-full py-16 flex flex-col items-center justify-center text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
            className="p-4 bg-orange-100 rounded-full text-orange-600 mb-4"
          >
            <Construction size={48} id="construction-icon" />
          </motion.div>
          <h4 className="text-xl font-medium text-gray-800 mb-2 font-sans">{hall.name} (در دست احداث)</h4>
          <p className="text-gray-500 max-w-md text-sm leading-relaxed">
            {hall.description || "این سالن هنوز وارد مرحله بهره‌برداری نشده است."}
          </p>
        </div>
      );
    }

    // 1. Nursery Hall 1 (52 pools, diameter 2m)
    if (hall.id === 1 && hallPools.length === 52 && hallPools.every(pool => pool.diameter === 2)) {
      return (
        <div id="hall1-layout" className="w-full">
          <div className="flex items-center gap-2 mb-4">
            <span className="inline-block w-3 h-3 bg-cyan-500 rounded-full"></span>
            <span className="text-xs text-gray-500 font-sans">نمایش ۵۲ ونیرو سالن ۱ نرسری (بر اساس وضعیت بیولوژیکی)</span>
          </div>
          <div className="grid grid-cols-5 sm:grid-cols-7 md:grid-cols-10 gap-2">
            {hallPools.map((pool) => {
              const isSelected = selectedPoolId === pool.id;
              const isEmpty = pool.count === 0;
              const isWarning = !isEmpty && (pool.oxygenLevel < 5.5 || pool.temperature > 19);
              const isDanger = !isEmpty && (pool.oxygenLevel < 4);

              return (
                <motion.button
                  key={pool.id}
                  id={`btn-${pool.id}`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onSelectPool(pool.id)}
                  className={`
                    h-12 w-full rounded-xl border flex flex-col items-center justify-center text-center transition-all cursor-pointer relative
                    ${isSelected ? "bg-natural-forest text-white border-natural-forest-hover ring-4 ring-natural-earth/30 shadow-md" : getStatusColorClass(pool)}
                  `}
                >
                  <span className="text-[10px] font-sans font-bold leading-none whitespace-nowrap">
                    {pool.name}
                  </span>
                  {!isEmpty && !isSelected && (
                    <span className="text-[9px] opacity-75 font-mono mt-0.5">
                      {pool.count}p
                    </span>
                  )}
                  {isEmpty && <span className="text-[9px] text-gray-400 mt-0.5">Empty</span>}
                  
                  {/* Status Indicator Dot */}
                  {!isEmpty && !isSelected && (
                    <span className={`absolute top-1 right-1 w-1.5 h-1.5 rounded-full ${isDanger ? "bg-red-500" : isWarning ? "bg-amber-500" : "bg-emerald-500"}`} />
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>
      );
    }

    // 2. Halls 2 & 3: 14 pools of 4m base-fattening
    if ((hall.id === 2 || hall.id === 3) && hallPools.length === 14 && hallPools.every(pool => pool.diameter === 4)) {
      return (
        <div id="halls-2-3-layout" className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-4">
          {hallPools.map((pool) => {
            const isSelected = selectedPoolId === pool.id;
            return (
              <motion.div
                key={pool.id}
                id={`card-${pool.id}`}
                whileHover={{ y: -4 }}
                onClick={() => onSelectPool(pool.id)}
                className={`
                  aspect-square rounded-full border-4 flex flex-col items-center justify-center cursor-pointer transition-all p-3 text-center shadow-sm relative
                  ${isSelected 
                    ? "bg-natural-forest text-white border-natural-forest-hover ring-4 ring-natural-earth/30 scale-102 shadow-md" 
                    : `${getStatusColorClass(pool)} border-white`
                  }
                `}
              >
                <span className="text-xs font-bold truncate max-w-full font-sans">{pool.name}</span>
                <span className="text-[10px] opacity-80 mt-0.5 font-sans">
                  {pool.count > 0 ? `${pool.count} قطعه` : "خالی"}
                </span>
                {pool.count > 0 && (
                  <span className="text-[10px] font-mono font-bold mt-1 px-1 bg-black/5 rounded">
                    {pool.avgWeightGrams}g
                  </span>
                )}
                
                {/* Visual Circle Meter */}
                <div className="absolute inset-2 border border-black/5 rounded-full pointer-events-none" />
              </motion.div>
            );
          })}
        </div>
      );
    }

    // 3. Halls 4 & 5: 7 pools of 6m base-fattening
    if ((hall.id === 4 || hall.id === 5) && hallPools.length === 7 && hallPools.every(pool => pool.diameter === 6)) {
      return (
        <div id="halls-4-5-layout" className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-6 justify-center">
          {hallPools.map((pool) => {
            const isSelected = selectedPoolId === pool.id;
            return (
              <motion.div
                key={pool.id}
                id={`card-${pool.id}`}
                whileHover={{ scale: 1.05 }}
                onClick={() => onSelectPool(pool.id)}
                className={`
                  aspect-square w-full rounded-full border-[6px] flex flex-col items-center justify-center cursor-pointer transition-all p-4 text-center shadow-md relative
                  ${isSelected 
                    ? "bg-natural-forest text-white border-natural-forest-hover ring-4 ring-natural-earth/30 scale-102 shadow" 
                    : `${getStatusColorClass(pool)} border-white/90`
                  }
                `}
              >
                <span className="text-sm font-bold font-sans">{pool.name}</span>
                <span className="text-xs opacity-90 mt-1 font-sans">
                  {pool.count > 0 ? `${pool.count} قطعه` : "خالی"}
                </span>
                {pool.count > 0 && (
                  <span className="text-xs font-mono font-bold mt-1 px-1.5 py-0.5 bg-black/5 rounded">
                    {pool.avgWeightGrams >= 1000 ? `${(pool.avgWeightGrams/1000).toFixed(1)}kg` : `${pool.avgWeightGrams}g`}
                  </span>
                )}
                <div className="absolute inset-1.5 border border-dashed border-black/10 rounded-full pointer-events-none" />
              </motion.div>
            );
          })}
        </div>
      );
    }

    // 4. Hall 7: Breeding Hall with 2 big pools (176 & 206 sqm) for Breeders
    if (hall.id === 7 && hallPools.length === 2 && hallPools.every(pool => /۱۷۶|۲۰۶|176|206/.test(pool.dimensionsDesc))) {
      return (
        <div id="hall-7-layout" className="grid grid-cols-1 md:grid-cols-2 gap-8 my-4">
          {hallPools.map((pool) => {
            const isSelected = selectedPoolId === pool.id;
            const subTitle = pool.id.includes("p1") ? "استخر ۱۷۶ متری مولدین فیل‌ماهی" : "استخر ۲۰۶ متری مولدین روسی/چالباش";
            return (
              <motion.div
                key={pool.id}
                id={`card-${pool.id}`}
                whileHover={{ scale: 1.01 }}
                onClick={() => onSelectPool(pool.id)}
                className={`
                  rounded-2xl border-2 p-6 cursor-pointer transition-all relative overflow-hidden flex flex-col justify-between h-48 shadow-md
                  ${isSelected
                    ? "bg-natural-forest text-white border-natural-forest-hover ring-4 ring-natural-earth/30"
                    : `${getStatusColorClass(pool)}`
                  }
                `}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h5 className="text-lg font-bold font-sans">{pool.name}</h5>
                    <p className={`text-xs mt-1 ${isSelected ? "text-[#FDFCF8]/95" : "text-gray-500"}`}>{subTitle}</p>
                  </div>
                  <Waves className={isSelected ? "text-[#FDFCF8]/80" : "text-natural-earth"} size={28} />
                </div>

                <div className="grid grid-cols-3 gap-2 mt-4 text-center">
                  <div className={`p-2 rounded-xl bg-black/5`}>
                    <p className="text-[10px] opacity-75 font-sans">تعداد مولدین</p>
                    <p className="font-bold text-base font-sans">{pool.count} عدد</p>
                  </div>
                  <div className={`p-2 rounded-xl bg-black/5`}>
                    <p className="text-[10px] opacity-75 font-sans">وزن متوسط</p>
                    <p className="font-bold text-base font-mono">{pool.avgWeightGrams / 1000} kg</p>
                  </div>
                  <div className={`p-2 rounded-xl bg-black/5`}>
                    <p className="text-[10px] opacity-75 font-sans">کل بیوماس</p>
                    <p className="font-bold text-base font-mono">{pool.totalBiomassKg} kg</p>
                  </div>
                </div>

                {/* Simulated Swimming Sturgeon Wave Animation */}
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-teal-400 to-indigo-400/80 animate-pulse pointer-events-none" />
              </motion.div>
            );
          })}
        </div>
      );
    }

    // 5. Halls 8 & 9: 5 large 10m pools
    if ((hall.id === 8 || hall.id === 9) && hallPools.length === 5 && hallPools.every(pool => pool.diameter === 10)) {
      return (
        <div id="halls-8-9-layout" className="grid grid-cols-2 md:grid-cols-5 gap-6">
          {hallPools.map((pool) => {
            const isSelected = selectedPoolId === pool.id;
            return (
              <motion.div
                key={pool.id}
                id={`card-${pool.id}`}
                whileHover={{ scale: 1.05 }}
                onClick={() => onSelectPool(pool.id)}
                className={`
                  aspect-square rounded-full border-8 flex flex-col items-center justify-center cursor-pointer transition-all p-5 text-center shadow-lg relative
                  ${isSelected
                    ? "bg-natural-forest text-white border-natural-forest-hover ring-4 ring-natural-earth/20 scale-102"
                    : `${getStatusColorClass(pool)} border-white/95`
                  }
                `}
              >
                <div className="absolute -top-1 px-2 py-0.5 bg-natural-earth text-white text-[10px] font-bold rounded-md shadow">
                  قطر ۱۰ متر
                </div>
                <span className="text-sm font-bold font-sans">{pool.name}</span>
                <span className="text-xs opacity-90 mt-1 font-sans">{pool.breed.split(" ")[0]}</span>
                
                <span className="text-xs font-mono font-bold mt-2 px-2 py-0.5 bg-black/5 rounded">
                  {pool.count} قطعه
                </span>
                <span className="text-[10px] opacity-80 mt-1 font-sans">
                  {pool.totalBiomassKg} kg
                </span>
                <div className="absolute inset-2 border border-dashed border-black/10 rounded-full pointer-events-none" />
              </motion.div>
            );
          })}
        </div>
      );
    }

    // 6. Halls 10 & 11: 6 pools d10m + 1 quarantine (d4) + 1 linear divided to 8
    if ((hall.id === 10 || hall.id === 11) && hallPools.some(pool => pool.isCustomCompartment)) {
      const active10mPools = hallPools.filter(p => p.diameter === 10);
      const quarantinePool = hallPools.find(p => p.id.includes("q"));
      const linearPools = hallPools.filter(p => p.isCustomCompartment).sort((a, b) => (a.compartmentIndex ?? 0) - (b.compartmentIndex ?? 0));

      const sizeLabel = hall.id === 10 ? "متر ۶x۱.۵" : "متر ۶x۲.۵";

      return (
        <div id="halls-10-11-layout" className="space-y-8">
          {/* Main Fattening Pools Grid */}
          <div>
            <h5 className="text-sm font-sans font-medium text-gray-500 mb-3">استخرهای پرواری اصلی (قطر ۱۰ متر)</h5>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
              {active10mPools.map((pool) => {
                const isSelected = selectedPoolId === pool.id;
                return (
                  <motion.div
                    key={pool.id}
                    id={`card-${pool.id}`}
                    whileHover={{ scale: 1.05 }}
                    onClick={() => onSelectPool(pool.id)}
                    className={`
                      aspect-square rounded-full border-[5px] flex flex-col items-center justify-center cursor-pointer transition-all p-3 text-center shadow-md relative
                      ${isSelected
                        ? "bg-indigo-600 text-white border-indigo-500 ring-4 ring-indigo-200"
                        : `${getStatusColorClass(pool)} border-white`
                      }
                    `}
                  >
                    <span className="text-xs font-bold font-sans">{pool.name.replace("استخر پرواری ", "پرواری ")}</span>
                    <span className="text-[10px] opacity-85 mt-1 font-sans font-bold">{pool.count} قطعه</span>
                    <span className="text-[9px] font-mono opacity-80 mt-0.5">{(pool.avgWeightGrams / 1000).toFixed(1)} kg</span>
                    <div className="absolute inset-1 border border-dashed border-black/5 rounded-full pointer-events-none" />
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Special Custom Pools Row (Quarantine and Compartment Pool) */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Quarantine Pool */}
            {quarantinePool && (
              <div className="lg:col-span-1 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <h5 className="text-xs font-sans text-red-500 font-bold mb-3 flex items-center gap-1">
                  <span className="w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
                  استخر ایزوله قرنطینه (قطر ۴ متر)
                </h5>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  onClick={() => onSelectPool(quarantinePool.id)}
                  className={`
                    p-4 rounded-xl border-2 flex flex-col items-center justify-center cursor-pointer text-center h-28
                    ${selectedPoolId === quarantinePool.id
                      ? "bg-red-600 text-white border-red-700 shadow-inner"
                      : "bg-red-50 hover:bg-red-100 text-red-750 border-red-200"
                    }
                  `}
                >
                  <span className="font-bold text-sm font-sans">{quarantinePool.name}</span>
                  <span className="text-xs mt-1 font-sans">{quarantinePool.count} قطعه تحت درمان</span>
                  <span className="text-[10px] font-mono mt-1 opacity-80">دمای تانک: {formatWaterParam(quarantinePool.temperature)}°C</span>
                </motion.div>
              </div>
            )}

            {/* Divisible Compartment Pool */}
            <div className="lg:col-span-3 bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between">
              <div className="flex justify-between items-center mb-3">
                <h5 className="text-xs font-semibold text-gray-700 font-sans">
                  استخر خطی چندمنظوره (ابعاد {sizeLabel}، ارتفاع ۱.۱۰ متر)
                </h5>
                <span className="text-[10px] text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full font-sans">
                  تقسیم شده به ۸ بخش مجزا جهت تفکیک سایز
                </span>
              </div>

              {/* The 8 compartments visualized linearly */}
              <div className="grid grid-cols-8 border border-gray-200 rounded-xl overflow-hidden h-28">
                {linearPools.map((comp) => {
                  const isSelected = selectedPoolId === comp.id;
                  return (
                    <motion.div
                      key={comp.id}
                      id={`compartment-${comp.id}`}
                      whileHover={{ opacity: 0.9 }}
                      onClick={() => onSelectPool(comp.id)}
                    className={`
                      border-r border-gray-200 last:border-0 flex flex-col items-center justify-center cursor-pointer transition-all p-1 text-center h-full relative
                      ${isSelected
                        ? "bg-natural-forest text-white"
                        : getStatusColorClass(comp)
                      }
                    `}
                  >
                    <span className="text-[10px] font-bold font-sans">بخش {comp.compartmentIndex}</span>
                    <span className="text-[10px] font-mono mt-1">{comp.count}p</span>
                    <span className="text-[9px] font-sans opacity-80">{comp.avgWeightGrams}g</span>
                    
                    {/* Vertical Water indicator */}
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-natural-earth" />
                  </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      );
    }

    // 7. Hall 12: Sales and Landing Room (4 pools, diameter 2.5m, height 1.5m)
    if (hall.id === 12 && hallPools.length === 4 && hallPools.every(pool => pool.diameter === 2.5)) {
      return (
        <div id="hall-12-layout" className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          {hallPools.map((pool) => {
            const isSelected = selectedPoolId === pool.id;
            return (
              <motion.div
                key={pool.id}
                id={`card-${pool.id}`}
                whileHover={{ scale: 1.05 }}
                onClick={() => onSelectPool(pool.id)}
                className={`
                  aspect-[16/11] rounded-2xl border-4 flex flex-col items-center justify-center cursor-pointer transition-all p-4 text-center shadow-md relative
                  ${isSelected
                    ? "bg-natural-forest text-white border-natural-forest-hover ring-4 ring-natural-earth/30 scale-102"
                    : `${getStatusColorClass(pool)} border-white`
                  }
                `}
              >
                <div className="absolute top-2 left-2 flex items-center justify-center w-5 h-5 bg-black/5 rounded-full">
                  <FlameKindling size={11} className={isSelected ? "text-natural-khaki" : "text-natural-earth"} />
                </div>
                <span className="text-sm font-bold font-sans">{pool.name}</span>
                <span className="text-xs opacity-90 mt-1 font-sans">{pool.breed.split(" ")[0]}</span>
                <span className="text-xs font-mono font-bold mt-2 bg-black/5 px-2 py-0.5 rounded">
                  {pool.count > 0 ? `${pool.count} قطعه` : "تخلیه شده"}
                </span>
                
                {/* Cold water marker badge */}
                <div className="absolute bottom-1 right-2 flex items-center text-[8px] opacity-75 font-mono">
                  🌡️ {formatWaterParam(pool.temperature)}°C (سردآب)
                </div>
              </motion.div>
            );
          })}
        </div>
      );
    }

    // Generic layout for user-defined halls and pool structures.
    return (
      <div id={`hall-${hall.id}-custom-layout`} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
        {hallPools.length ? hallPools.map(pool => {
          const isSelected = selectedPoolId === pool.id;
          const shapeClass = pool.shape === "circular"
            ? "rounded-[2.5rem]"
            : pool.shape === "linear"
              ? "rounded-xl aspect-[2/1]"
              : "rounded-2xl";
          return (
            <motion.button
              key={pool.id}
              id={`card-${pool.id}`}
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelectPool(pool.id)}
              className={`min-h-36 border-2 p-4 text-right transition-all shadow-sm ${shapeClass} ${isSelected ? "bg-natural-forest text-white border-natural-forest-hover ring-4 ring-natural-earth/20" : getStatusColorClass(pool)}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-black text-sm">{pool.name}</div>
                  <div className="text-[10px] mt-1 opacity-75 font-mono" dir="ltr">{pool.id}</div>
                </div>
                <Waves size={21} className="shrink-0 opacity-80" />
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2 text-[10px]">
                <span className="bg-black/5 rounded-lg p-2">{pool.count.toLocaleString("fa-IR")} قطعه</span>
                <span className="bg-black/5 rounded-lg p-2">{pool.totalBiomassKg.toLocaleString("fa-IR")} kg</span>
                <span className="col-span-2 bg-black/5 rounded-lg p-2 truncate">{pool.dimensionsDesc}</span>
              </div>
            </motion.button>
          );
        }) : (
          <div className="col-span-full border-2 border-dashed border-natural-border rounded-2xl p-10 text-center text-sm text-natural-text/60">
            هنوز استخری برای این سالن ثبت نشده است.
          </div>
        )}
      </div>
    );
  };

  const activePool = pools.find((p) => p.id === selectedPoolId);

  return (
    <div id="hall-map-container" className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Dynamic Map Area */}
      <div className="lg:col-span-3 bg-natural-khaki text-natural-text p-6 rounded-3xl border border-natural-border shadow-sm relative overflow-hidden">
        {/* Background glow effects */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-natural-forest/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-natural-earth/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6 border-b border-natural-border pb-4 relative z-10">
          <div>
            <span className="text-xs text-natural-earth font-sans tracking-wide uppercase font-semibold">پلان اختصاصی سالن</span>
            <h3 className="text-2xl font-bold font-sans mt-1 text-natural-dark">{hall.name}</h3>
            <p className="text-xs text-natural-text/70 font-sans mt-1 leading-relaxed">{hall.description}</p>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="text-xs bg-white text-natural-text px-3 py-1.5 rounded-xl border border-natural-border shadow-sm font-sans flex items-center gap-1.5">
              <Compass size={14} className="text-natural-earth animate-spin-slow" />
              جهت نقشه: روبه‌شمال
            </span>
            <span className="text-xs bg-natural-forest text-white px-3 py-1.5 rounded-xl font-sans shadow-sm">
              تعداد استخرهای ثبت‌شده: {hallPools.length}
            </span>
          </div>
        </div>

        {/* Dynamic Render of Layout */}
        <div className="py-2 relative z-10">
          {renderPoolsLayout()}
        </div>

        {/* Legend Map Status */}
        {!hall.isUnderConstruction && (
          <div className="mt-8 pt-4 border-t border-natural-border flex flex-wrap gap-4 text-xs text-natural-text/80 font-sans relative z-10">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-natural-forest" />
              استخر سالم آب شیرین
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-natural-earth" />
              پایش بیوشیمیایی (دمای بالا / اکسیژن لب‌مرز)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-natural-clay" />
              کم اکسیژنی زیان‌بار (زیر ۴ ppm)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-white border border-dashed border-natural-text/30" />
              استخر آماده لارو ریزی (خالی)
            </span>
            <span className="flex items-center gap-1.5 font-mono ml-auto text-natural-text/50">
              Update: 2026-05-30
            </span>
          </div>
        )}
      </div>

      {/* Floating Side Info Panel */}
      <div className="lg:col-span-1 flex flex-col h-full justify-between">
        <AnimatePresence mode="wait">
          {activePool ? (
            <motion.div
              key={activePool.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="bg-white rounded-3xl border border-natural-border shadow-sm p-5 flex flex-col h-full justify-between gap-4"
              id="selected-pool-panel"
            >
              <div>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <span className="text-[10px] text-natural-forest bg-natural-khaki/80 border border-natural-border/60 px-2.5 py-1 rounded-full font-sans font-medium">
                      {activePool.purpose}
                    </span>
                    <h4 className="text-xl font-extrabold text-natural-dark mt-2 font-sans">{activePool.name}</h4>
                  </div>
                  <span className={`px-2 py-1 text-[10px] rounded-lg font-bold font-sans border ${
                    activePool.count === 0 
                      ? "bg-natural-khaki/50 text-natural-text/55 border-natural-border" 
                      : activePool.oxygenLevel < 5.5 
                        ? "bg-natural-earth/10 text-natural-earth border-natural-earth/30" 
                        : "bg-natural-forest/10 text-natural-forest border-natural-forest/30"
                  }`}>
                    {getStatusLabel(activePool)}
                  </span>
                </div>

                <p className="text-xs text-natural-text/75 font-sans border-b border-natural-border/80 pb-3">
                  مشخصات سازه: <strong className="text-natural-dark">{activePool.dimensionsDesc}</strong>
                </p>

                {/* 🔧 Capacity & Volume Calculations */}
                {(() => {
                  const details = calculatePoolVolumeDetails(activePool);
                  const densityVal = details.volumeM3 > 0 ? (activePool.totalBiomassKg / details.volumeM3) : 0;
                  return (
                    <div className="mt-3 p-3 bg-natural-khaki/25 border border-natural-border/50 rounded-2xl space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-natural-text/70">حجم آبگیر استخر</span>
                        <div className="flex items-center gap-1">
                          <span className="font-extrabold text-natural-dark font-mono">{details.volumeM3} m³</span>
                          {details.pendingVerification && (
                            <span className="text-[8px] bg-amber-100 text-amber-800 border border-amber-200 px-1 py-0.2 rounded font-sans" title="ابعاد یا عمق دقیق این سالن ثبت نشده است و حجم به صورت تخمینی نمایش داده می‌شود.">
                              ⚠️ غیرقطعی
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex justify-between items-center text-xs">
                        <span className="text-natural-text/70">تراکم فعلی کلونی</span>
                        <span className="font-bold text-natural-dark font-mono">
                          {densityVal.toFixed(2)} kg/m³ <span className="text-[10px] text-natural-text/60">/ {details.maxDensityKgPerM3} max</span>
                        </span>
                      </div>

                      <div className="flex justify-between items-center text-xs">
                        <span className="text-natural-text/70">وضعیت تراکم مجاز</span>
                        <span className={`px-2 py-0.5 text-[9px] rounded-full font-bold font-sans border ${
                          details.capacityStatus === "empty"
                            ? "bg-gray-100 text-gray-700 border-gray-300"
                            : details.capacityStatus === "normal"
                              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                              : details.capacityStatus === "near_saturation"
                                ? "bg-amber-50 text-amber-800 border-amber-200"
                                : "bg-red-50 text-red-800 border-red-200 animate-pulse"
                        }`}>
                          {details.capacityStatus === "empty" && "خالی از گله"}
                          {details.capacityStatus === "normal" && "نرمال و بهینه"}
                          {details.capacityStatus === "near_saturation" && "حاشیه اشباع"}
                          {details.capacityStatus === "overloaded" && "بیش‌بارگیری (ریسک خفگی)"}
                        </span>
                      </div>
                    </div>
                  );
                })()}

                {/* Main biological stats */}
                <div className="space-y-3 mt-4">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-natural-text/70 font-sans">گونه ماهی خاویاری</span>
                    <span className="font-bold text-natural-dark font-sans">{activePool.breed}</span>
                  </div>

                  <div className="flex justify-between items-center text-xs">
                    <span className="text-natural-text/70 font-sans">تعداد موجود در استخر</span>
                    <span className="font-bold text-natural-dark font-mono text-sm">
                      {activePool.count ? `${activePool.count.toLocaleString()} قطعه` : "خالی"}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-xs">
                    <span className="text-natural-text/70 font-sans">وزن متوسط تخمینی</span>
                    <span className="font-bold text-natural-dark font-mono text-sm">
                      {activePool.avgWeightGrams >= 1000 
                        ? `${(activePool.avgWeightGrams / 1000).toFixed(1)} کیلوگرم` 
                        : `${activePool.avgWeightGrams} گرم`
                      }
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-xs">
                    <span className="text-natural-text/70 font-sans">کل بیوماس زیستی</span>
                    <span className="font-extrabold text-natural-earth font-mono text-sm">
                      {activePool.totalBiomassKg.toLocaleString()} kg
                    </span>
                  </div>

                  {/* 🔧 Pedigree & Traceability */}
                  {(activePool.parentMaleId || activePool.parentFemaleId) && (
                    <div className="pt-2 border-t border-dashed border-natural-border/60 space-y-1 text-xs">
                      <span className="text-natural-text/50 font-sans block text-[10px]">شجره‌نامه و تبارشناسی گله:</span>
                      {activePool.parentMaleId && (
                        <div className="flex justify-between items-center">
                          <span className="text-natural-text/70 font-sans">کد تبارشناسی پدر</span>
                          <span className="font-semibold text-natural-dark font-mono">{activePool.parentMaleId}</span>
                        </div>
                      )}
                      {activePool.parentFemaleId && (
                        <div className="flex justify-between items-center">
                          <span className="text-natural-text/70 font-sans">کد تبارشناسی مادر</span>
                          <span className="font-semibold text-natural-dark font-mono">{activePool.parentFemaleId}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* 🔧 Therapeutic/Medication Withdrawal period indicator */}
                  {activePool.withdrawalEndDate && (
                    <div className="pt-2 border-t border-dashed border-red-200 bg-red-50/50 p-2 rounded-xl text-xs space-y-1">
                      <span className="text-red-800 font-sans font-bold flex items-center gap-1">
                        ⚠️ دوره پرهیز دارویی فعال (Withdrawal)
                      </span>
                      <p className="text-[10px] text-red-700 font-sans leading-relaxed">
                        برداشت خاویار یا گوشت این استخر تا تاریخ <strong className="font-mono font-bold text-red-900">{activePool.withdrawalEndDate}</strong> به علت درمان دوره شیمیایی ممنوع است.
                      </p>
                    </div>
                  )}
                </div>

                {/* Chemical and physical quality of water */}
                <div className="mt-5 pt-4 border-t border-natural-border/80">
                  <h5 className="text-[11px] font-bold text-natural-text/60 font-sans uppercase tracking-wider mb-2">کیفیت شیمیایی آب استخر</h5>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-natural-khaki/30 border border-natural-border/30 p-2 rounded-xl text-center">
                      <div className="flex items-center justify-center gap-0.5 text-natural-clay mb-0.5">
                        <Thermometer size={12} />
                        <span className="text-[9px] font-sans">دما</span>
                      </div>
                      <span className="text-xs font-bold text-natural-dark font-mono">{formatRequiredSensorParamWithUnit(activePool.temperature, "°C")}</span>
                    </div>

                    <div className="bg-natural-khaki/30 border border-natural-border/30 p-2 rounded-xl text-center">
                      <div className="flex items-center justify-center gap-0.5 text-natural-forest mb-0.5">
                        <Droplets size={12} />
                        <span className="text-[9px] font-sans">اکسیژن</span>
                      </div>
                      <span className="text-xs font-bold text-natural-dark font-mono">{formatRequiredSensorParamWithUnit(activePool.oxygenLevel, " ppm")}</span>
                    </div>

                    <div className="bg-natural-khaki/30 border border-natural-border/30 p-2 rounded-xl text-center">
                      <div className="flex items-center justify-center gap-0.5 text-natural-earth mb-0.5">
                        <Activity size={12} />
                        <span className="text-[9px] font-sans">pH آب</span>
                      </div>
                      <span className="text-xs font-bold text-natural-dark font-mono">{formatRequiredSensorParam(activePool.phLevel)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-natural-khaki/60 p-3 rounded-2xl border border-natural-border mt-2 text-xs text-natural-text">
                <div className="flex items-center gap-1.5 font-semibold text-natural-dark mb-1">
                  <Info size={14} className="text-natural-earth" />
                  برآورد تعذیه روز فردا:
                </div>
                {activePool.count > 0 && evaluateFeedingWaterSafety(activePool).canFeed ? (
                  <p className="leading-relaxed text-natural-text/90">
                    با احتساب بیوماس استخر و دمای {formatWaterParam(activePool.temperature)} درجه، دوز غذای بهینه فردا برابر با{" "}
                    <strong className="text-natural-forest font-mono">{(activePool.totalBiomassKg * 0.012).toFixed(1)} kg</strong> (بازه ۱.۲٪ بیوماس) پیشنهاد می‌شود.
                  </p>
                ) : activePool.count > 0 ? (
                  <p className="text-natural-clay font-bold leading-relaxed">
                    برآورد خوراک قفل است: {evaluateFeedingWaterSafety(activePool).reasons.join(" ")}
                  </p>
                ) : (
                  <p className="text-natural-text/60">استخر خالی است و فرآیند خوراک‌دهی معلق است.</p>
                )}
              </div>
            </motion.div>
          ) : (
            <div id="no-pool-selected" className="bg-natural-khaki/40 rounded-3xl border border-natural-border p-8 text-center flex flex-col items-center justify-center h-full text-natural-text/60">
              <Layers size={36} className="text-natural-earth/50 mb-2 animate-pulse" />
              <p className="text-xs leading-relaxed font-sans">
                برای مشاهده بیوماس، آمار زیست‌سنجی، دما، اکسیژن، میزان FCR روزانه و مدیریت تغذیه، بر روی یکی از استخرهای نقشه کلیک نمایید.
              </p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
