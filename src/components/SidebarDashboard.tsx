/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  SlidersHorizontal, 
  Settings2, 
  Weight, 
  Fish, 
  Activity, 
  HeartCrack, 
  Database, 
  Save, 
  RotateCcw, 
  X, 
  Check, 
  Sparkles,
  ChevronDown,
  ChevronUp,
  PieChart,
  BarChart3,
  Flame,
  Gauge
} from "lucide-react";
import { Pool, Hall } from "../types";
import { formatWaterParam } from "../utils/aquacultureUtils";

export interface SidebarDashboardConfig {
  showBiomass: boolean;
  showSturgeonCount: boolean;
  showWaterQuality: boolean;
  showMortality: boolean;
  showSpeciesChart: boolean;
  showHallsChart: boolean;
  showActivePools: boolean;
  biomassTargetKg: number;
  criticalOxygenLevel: number;
  chartStyle: "donut" | "sparkline" | "bars";
}

const DEFAULT_CONFIG: SidebarDashboardConfig = {
  showBiomass: true,
  showSturgeonCount: true,
  showWaterQuality: true,
  showMortality: true,
  showSpeciesChart: true,
  showHallsChart: false,
  showActivePools: true,
  biomassTargetKg: 25000,
  criticalOxygenLevel: 6.0,
  chartStyle: "donut"
};

interface SidebarDashboardProps {
  pools: Pool[];
  halls: Hall[];
  mortalityCount: number;
  userEmail?: string;
}

export const SidebarDashboard: React.FC<SidebarDashboardProps> = ({
  pools,
  halls,
  mortalityCount,
  userEmail = "morefa1986@gmail.com"
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [config, setConfig] = useState<SidebarDashboardConfig>(DEFAULT_CONFIG);

  // Load configuration based on userEmail for personalization
  useEffect(() => {
    const storageKey = `sturgeon_sidebar_dashboard_settings_${userEmail}`;
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        setConfig(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse sidebar dashboard settings:", e);
      }
    }
  }, [userEmail]);

  // Save configuration
  const handleSaveConfig = (newConfig: SidebarDashboardConfig) => {
    setConfig(newConfig);
    const storageKey = `sturgeon_sidebar_dashboard_settings_${userEmail}`;
    localStorage.setItem(storageKey, JSON.stringify(newConfig));
    setIsSettingsOpen(false);
  };

  const handleResetConfig = () => {
    if (window.confirm("آیا مایل به بازنشانی تنظیمات داشبورد به حالت اولیه هستید؟")) {
      handleSaveConfig(DEFAULT_CONFIG);
    }
  };

  // State in settings modal form
  const [formConfig, setFormConfig] = useState<SidebarDashboardConfig>(config);
  useEffect(() => {
    if (isSettingsOpen) {
      setFormConfig(config);
    }
  }, [isSettingsOpen, config]);

  // Derive stats
  const activePools = pools.filter(p => p.count > 0);
  const totalSturgeons = pools.reduce((acc, curr) => acc + curr.count, 0);
  const totalBiomassKg = pools.reduce((acc, curr) => acc + curr.totalBiomassKg, 0);
  
  const avgTemp = activePools.length > 0
    ? parseFloat((activePools.reduce((acc, curr) => acc + curr.temperature, 0) / activePools.length).toFixed(1))
    : 0;

  const avgOxygen = activePools.length > 0
    ? parseFloat((activePools.reduce((acc, curr) => acc + curr.oxygenLevel, 0) / activePools.length).toFixed(1))
    : 0;

  const isOxygenCritical = avgOxygen < config.criticalOxygenLevel && activePools.length > 0;

  // Breed counts
  const breedCounts: Record<string, number> = {};
  pools.forEach(p => {
    if (p.count > 0) {
      const breedShort = p.breed.split(" ")[0];
      breedCounts[breedShort] = (breedCounts[breedShort] || 0) + p.count;
    }
  });

  const totalBreedCount = Object.values(breedCounts).reduce((a, b) => a + b, 0) || 1;

  // Hall Biomass data
  const hallsBiomass = halls.map(h => {
    const hallPools = pools.filter(p => p.hallId === h.id);
    const biomass = hallPools.reduce((sum, p) => sum + p.totalBiomassKg, 0);
    return {
      id: h.id,
      name: `سالن ${h.id}`,
      biomass: Math.round(biomass)
    };
  });
  const maxHallBiomass = Math.max(...hallsBiomass.map(h => h.biomass), 1);

  // Biomass Target percentage
  const biomassProgressPercent = Math.min(Math.round((totalBiomassKg / config.biomassTargetKg) * 100), 100);

  return (
    <div className="glass-card-3d p-4 space-y-3 relative shadow-md border border-white/10" id="sidebar-dashboard-widget">
      {/* Widget Header */}
      <div className="flex items-center justify-between">
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 text-right select-none font-bold text-natural-dark text-xs hover:text-natural-forest transition-colors cursor-pointer"
        >
          {isOpen ? <ChevronUp size={14} className="text-natural-forest" /> : <ChevronDown size={14} className="text-natural-forest" />}
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            داشبورد پایش برخط
          </span>
        </button>

        <button
          onClick={() => setIsSettingsOpen(true)}
          className="p-1 text-natural-text/60 hover:text-natural-forest hover:bg-natural-khaki/60 rounded-lg transition-all cursor-pointer border border-transparent hover:border-natural-border/40"
          title="شخصی‌سازی ویجت‌های داشبورد"
          id="btn-customize-dashboard"
        >
          <SlidersHorizontal size={13} />
        </button>
      </div>

      {/* Widget Content */}
      {isOpen && (
        <div className="space-y-3.5 pt-1 animate-fadeIn text-xs">
          
          {/* Metric: Biomass */}
          {config.showBiomass && (
            <div className="bg-white p-2.5 rounded-xl border border-natural-border/45 shadow-2xs space-y-1.5" id="widget-biomass">
              <div className="flex justify-between items-center text-[10px] text-natural-text/75">
                <span className="flex items-center gap-1">
                  <Weight size={11} className="text-natural-forest" />
                  زیست‌توده کل (بیوماس)
                </span>
                <span className="font-mono font-bold text-natural-earth">هدف: {(config.biomassTargetKg / 1000).toFixed(1)}t</span>
              </div>
              <div className="flex items-baseline justify-between">
                <strong className="text-sm font-black text-natural-forest font-mono">
                  {(totalBiomassKg / 1000).toFixed(2)} <span className="text-[10px] font-sans text-natural-text/70">تن</span>
                </strong>
                <span className="text-[9px] font-mono text-natural-text/50">{(totalBiomassKg).toLocaleString()} kg</span>
              </div>
              
              {/* Target Progress Bar */}
              <div className="space-y-1">
                <div className="h-1.5 w-full bg-natural-khaki rounded-full overflow-hidden border border-natural-border/30">
                  <div 
                    style={{ width: `${biomassProgressPercent}%` }}
                    className="h-full bg-gradient-to-l from-natural-forest to-natural-earth rounded-full transition-all duration-500"
                  />
                </div>
                <div className="flex justify-between text-[8px] text-natural-text/50 font-mono">
                  <span>پیشرفت هدف</span>
                  <span>{biomassProgressPercent}%</span>
                </div>
              </div>
            </div>
          )}

          {/* Metric: Sturgeon Count */}
          {config.showSturgeonCount && (
            <div className="bg-white p-2.5 rounded-xl border border-natural-border/45 shadow-2xs flex justify-between items-center" id="widget-sturgeons">
              <div className="space-y-0.5">
                <span className="text-[10px] text-natural-text/75 flex items-center gap-1">
                  <Fish size={11} className="text-natural-forest" />
                  تعداد کل ماهیان
                </span>
                <strong className="text-sm font-black text-natural-dark font-mono block">
                  {totalSturgeons.toLocaleString()} <span className="text-[10px] font-sans font-normal text-natural-text/70">قطعه</span>
                </strong>
              </div>
              {config.showActivePools && (
                <div className="text-left bg-natural-khaki/40 px-2 py-1 rounded-lg border border-natural-border/30 text-[9px]">
                  <span className="text-natural-dark font-bold font-mono">{activePools.length}</span>
                  <span className="text-natural-text/60 block">استخر فعال</span>
                </div>
              )}
            </div>
          )}

          {/* Metric: Water Quality */}
          {config.showWaterQuality && (
            <div className={`p-2.5 rounded-xl border shadow-2xs space-y-1.5 transition-colors ${
              isOxygenCritical 
                ? "bg-red-50 border-red-200" 
                : "bg-white border-natural-border/45"
            }`} id="widget-water-quality">
              <div className="flex justify-between items-center text-[10px] text-natural-text/75">
                <span className="flex items-center gap-1">
                  <Activity size={11} className={isOxygenCritical ? "text-red-500 animate-bounce" : "text-[#7E6547]"} />
                  کیفیت متوسط آب جاری
                </span>
                {isOxygenCritical && (
                  <span className="bg-red-100 text-red-700 text-[8px] px-1.5 py-0.5 rounded-full font-bold animate-pulse">
                    بحران اکسیژن
                  </span>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2 text-right">
                <div className="bg-natural-khaki/30 p-1.5 rounded-lg border border-natural-border/20">
                  <span className="text-[8px] text-natural-text/60 block">اکسیژن محلول</span>
                  <strong className={`font-mono text-xs font-black ${isOxygenCritical ? "text-red-600" : "text-[#7E6547]"}`}>
                    {formatWaterParam(avgOxygen)} <span className="text-[8px] font-sans font-normal">ppm</span>
                  </strong>
                </div>
                <div className="bg-natural-khaki/30 p-1.5 rounded-lg border border-natural-border/20">
                  <span className="text-[8px] text-natural-text/60 block">دمای متوسط</span>
                  <strong className="font-mono text-xs font-black text-natural-dark">
                    {formatWaterParam(avgTemp)}°C
                  </strong>
                </div>
              </div>
            </div>
          )}

          {/* Metric: Mortality */}
          {config.showMortality && (
            <div className={`p-2.5 rounded-xl border shadow-2xs flex justify-between items-center ${
              mortalityCount > 0 
                ? "bg-amber-50/50 border-natural-clay/30" 
                : "bg-white border-natural-border/45"
            }`} id="widget-mortality">
              <div className="space-y-0.5">
                <span className="text-[10px] text-natural-text/75 flex items-center gap-1">
                  <HeartCrack size={11} className="text-natural-clay" />
                  تلفات ثبت‌شده دوره
                </span>
                <strong className={`text-sm font-black font-mono block ${mortalityCount > 0 ? "text-natural-clay" : "text-natural-text/60"}`}>
                  {mortalityCount} <span className="text-[10px] font-sans font-normal text-natural-text/70">قطعه</span>
                </strong>
              </div>
              {mortalityCount > 0 && (
                <div className="text-left text-[8px] text-natural-clay font-bold bg-natural-clay/5 px-1.5 py-0.5 rounded-md">
                  ⚠️ نیاز به بررسی
                </div>
              )}
            </div>
          )}

          {/* Chart Section: Species Distribution SVG */}
          {config.showSpeciesChart && config.chartStyle === "donut" && Object.keys(breedCounts).length > 0 && (
            <div className="bg-white p-2.5 rounded-xl border border-natural-border/45 shadow-2xs space-y-2" id="widget-chart-donut">
              <span className="text-[10px] text-natural-text/75 font-bold flex items-center gap-1">
                <PieChart size={11} className="text-natural-forest" />
                ترکیب جمعیتی نژادها
              </span>

              {/* Render dynamic SVG Donut/Pie chart for sidebar */}
              <div className="flex items-center justify-between gap-1.5">
                <div className="w-14 h-14 relative flex items-center justify-center shrink-0">
                  <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                    <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#E6E8E3" strokeWidth="3" />
                    {/* Render segments */}
                    {(() => {
                      let accumulatedPercentage = 0;
                      return Object.entries(breedCounts).map(([breed, count], index) => {
                        const pct = (count / totalBreedCount) * 100;
                        const strokeDasharray = `${pct} ${100 - pct}`;
                        const strokeDashoffset = 100 - accumulatedPercentage;
                        accumulatedPercentage += pct;

                        // Color selection
                        const colors = ["#234B3B", "#8C6A43", "#A65D50", "#4D5C4A", "#E4A153"];
                        const strokeColor = colors[index % colors.length];

                        return (
                          <circle 
                            key={breed}
                            cx="18" 
                            cy="18" 
                            r="15.915" 
                            fill="transparent" 
                            stroke={strokeColor} 
                            strokeWidth="4.2" 
                            strokeDasharray={strokeDasharray} 
                            strokeDashoffset={strokeDashoffset} 
                            className="transition-all duration-300 hover:stroke-[5px]"
                          />
                        );
                      });
                    })()}
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-[8px] font-mono font-bold text-natural-dark">
                    <span>{Object.keys(breedCounts).length}</span>
                    <span className="text-[6px] text-natural-text/60">گونه</span>
                  </div>
                </div>

                <div className="flex-grow space-y-1 font-sans text-[8.5px] max-w-[130px]">
                  {Object.entries(breedCounts).slice(0, 3).map(([breed, count], idx) => {
                    const pct = ((count / totalBreedCount) * 100).toFixed(0);
                    const colors = ["bg-natural-forest", "bg-natural-earth", "bg-natural-clay", "bg-gray-600"];
                    return (
                      <div key={breed} className="flex justify-between items-center gap-1 text-natural-text">
                        <span className="flex items-center gap-1 truncate max-w-[90px]" title={breed}>
                          <span className={`w-1.5 h-1.5 rounded-full ${colors[idx % colors.length]}`} />
                          <span className="truncate">{breed}</span>
                        </span>
                        <span className="font-mono font-bold text-natural-dark shrink-0">{pct}%</span>
                      </div>
                    );
                  })}
                  {Object.keys(breedCounts).length > 3 && (
                    <div className="text-[7.5px] text-natural-text/50 text-left">
                      + {Object.keys(breedCounts).length - 3} گونه دیگر
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Chart Section: Halls Biomass Bar Chart */}
          {config.showHallsChart && config.chartStyle === "bars" && (
            <div className="bg-white p-2.5 rounded-xl border border-natural-border/45 shadow-2xs space-y-2" id="widget-chart-bars">
              <span className="text-[10px] text-natural-text/75 font-bold flex items-center gap-1">
                <BarChart3 size={11} className="text-natural-forest" />
                تناژ بیوماس سالن‌ها (فعال)
              </span>

              <div className="space-y-1.5 pt-0.5">
                {hallsBiomass.slice(0, 4).map(h => {
                  const percent = Math.round((h.biomass / maxHallBiomass) * 100);
                  return (
                    <div key={h.id} className="space-y-0.5">
                      <div className="flex justify-between text-[8px] text-natural-text/80">
                        <span>{h.name}</span>
                        <span className="font-mono font-bold">{h.biomass} kg</span>
                      </div>
                      <div className="h-1.5 w-full bg-natural-khaki/50 rounded-full overflow-hidden border border-natural-border/20">
                        <div 
                          style={{ width: `${percent}%` }}
                          className="h-full bg-natural-forest rounded-full transition-all duration-300"
                        />
                      </div>
                    </div>
                  );
                })}
                {hallsBiomass.length > 4 && (
                  <div className="text-center text-[7.5px] text-natural-text/50 pt-1 border-t border-natural-border/30">
                    نمایش ۴ سالن برتر زیست‌توده
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Sparkline Chart style option */}
          {config.chartStyle === "sparkline" && (
            <div className="bg-white p-2.5 rounded-xl border border-natural-border/45 shadow-2xs space-y-2" id="widget-chart-sparkline">
              <span className="text-[10px] text-natural-text/75 font-bold flex items-center gap-1">
                <Activity size={11} className="text-natural-earth" />
                نمودار سلامت هیدرولیک (اکسیژن)
              </span>

              {/* Draw responsive mini SVG line chart representing oxygen levels of pools */}
              <div className="h-10 w-full pt-1">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 100 20">
                  {(() => {
                    const points = pools.slice(0, 10).map((p, i) => ({
                      x: (i / 9) * 100,
                      y: 20 - ((p.oxygenLevel / 12) * 20)
                    }));
                    
                    if (points.length === 0) return null;
                    
                    const pathD = `M ${points[0].x} ${points[0].y} ` + points.slice(1).map(p => `L ${p.x} ${p.y}`).join(" ");
                    
                    return (
                      <>
                        {/* Area Gradient under curve */}
                        <path 
                          d={`${pathD} L 100 20 L 0 20 Z`} 
                          fill="url(#sparkline-grad)" 
                          opacity="0.2"
                        />
                        {/* Stroke Line */}
                        <path 
                          d={pathD} 
                          fill="none" 
                          stroke={isOxygenCritical ? "#EF4444" : "#234B3B"} 
                          strokeWidth="1.5" 
                        />
                        {/* Dots */}
                        {points.map((p, i) => (
                          <circle 
                            key={i} 
                            cx={p.x} 
                            cy={p.y} 
                            r="1.5" 
                            fill={isOxygenCritical ? "#EF4444" : "#8C6A43"} 
                            className="hover:r-2 transition-all cursor-pointer"
                          >
                            <title>استخر: {pools[i]?.name} - {formatWaterParam(pools[i]?.oxygenLevel)} ppm</title>
                          </circle>
                        ))}
                        {/* Gradients */}
                        <defs>
                          <linearGradient id="sparkline-grad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#234B3B" />
                            <stop offset="100%" stopColor="#FDFCF8" />
                          </linearGradient>
                        </defs>
                      </>
                    );
                  })()}
                </svg>
              </div>
              <div className="flex justify-between text-[7px] text-natural-text/50 font-mono">
                <span>استخرهای ۱-۱۰</span>
                <span>دامنه نوسان جاری</span>
              </div>
            </div>
          )}

        </div>
      )}

      {/* 🛠️ DIALOG / MODAL FOR PERSONALIZING SIDEBAR DASHBOARD OPTIONS */}
      {isSettingsOpen && (
        <div className="fixed inset-0 bg-[#1A2E26]/65 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl border border-natural-border shadow-xl w-full max-w-md p-6 overflow-hidden max-h-[90vh] flex flex-col text-right">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-natural-border">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-natural-khaki rounded-xl text-natural-forest">
                  <Settings2 size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-natural-dark font-sans">تنظیمات شخصی‌سازی داشبورد</h3>
                  <p className="text-[10px] text-natural-text/60 font-sans mt-0.5">انتخاب ویجت‌ها و آستانه‌های پایش در سایدبار</p>
                </div>
              </div>
              <button 
                onClick={() => setIsSettingsOpen(false)}
                className="p-1 hover:bg-natural-khaki rounded-lg text-natural-text transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body / Scrollable Form */}
            <div className="flex-grow overflow-y-auto py-5 space-y-5 font-sans">
              
              {/* User Identity Info */}
              <div className="bg-natural-khaki/30 p-3 rounded-2xl border border-natural-border/50 text-xs flex justify-between items-center">
                <span className="text-natural-text/70">تغییرات برای کاربر:</span>
                <strong className="text-natural-dark font-mono bg-white px-2 py-0.5 rounded-lg border border-natural-border/30">{userEmail}</strong>
              </div>

              {/* Toggles Group */}
              <div className="space-y-3">
                <span className="text-[11px] font-black text-natural-earth block border-r-2 border-natural-forest pr-2">نمایش ویجت‌های آماری</span>
                
                {/* Toggle 1: Biomass */}
                <label className="flex items-center justify-between p-2.5 rounded-xl hover:bg-natural-khaki/20 transition-colors border border-transparent hover:border-natural-border/30 cursor-pointer select-none">
                  <div className="space-y-0.5 text-right">
                    <span className="text-xs font-bold text-natural-dark block">زیست‌توده کل (بیوماس)</span>
                    <span className="text-[9.5px] text-natural-text/60 block">نمایش مقدار وزنی و پیشرفت در رسیدن به هدف</span>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={formConfig.showBiomass}
                    onChange={(e) => setFormConfig({...formConfig, showBiomass: e.target.checked})}
                    className="w-4 h-4 rounded text-natural-forest border-natural-border focus:ring-natural-forest accent-natural-forest cursor-pointer"
                  />
                </label>

                {/* Toggle 2: Sturgeon Count */}
                <label className="flex items-center justify-between p-2.5 rounded-xl hover:bg-natural-khaki/20 transition-colors border border-transparent hover:border-natural-border/30 cursor-pointer select-none">
                  <div className="space-y-0.5 text-right">
                    <span className="text-xs font-bold text-natural-dark block">تعداد کل ماهیان گله</span>
                    <span className="text-[9.5px] text-natural-text/60 block">نمایش قطعه‌های فعال و آمار استخرهای آبدار</span>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={formConfig.showSturgeonCount}
                    onChange={(e) => setFormConfig({...formConfig, showSturgeonCount: e.target.checked})}
                    className="w-4 h-4 rounded text-natural-forest border-natural-border focus:ring-natural-forest accent-natural-forest cursor-pointer"
                  />
                </label>

                {/* Toggle 3: Active Pools Badge */}
                {formConfig.showSturgeonCount && (
                  <label className="flex items-center justify-between mr-4 p-2 rounded-xl hover:bg-natural-khaki/10 transition-colors border border-transparent border-dashed border-natural-border/20 cursor-pointer select-none">
                    <div className="space-y-0.5 text-right">
                      <span className="text-[11px] font-bold text-natural-text block">نشان‌گر تعداد استخرهای فعال</span>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={formConfig.showActivePools}
                      onChange={(e) => setFormConfig({...formConfig, showActivePools: e.target.checked})}
                      className="w-3.5 h-3.5 rounded text-natural-forest border-natural-border accent-natural-forest cursor-pointer"
                    />
                  </label>
                )}

                {/* Toggle 4: Water Quality */}
                <label className="flex items-center justify-between p-2.5 rounded-xl hover:bg-natural-khaki/20 transition-colors border border-transparent hover:border-natural-border/30 cursor-pointer select-none">
                  <div className="space-y-0.5 text-right">
                    <span className="text-xs font-bold text-natural-dark block">کیفیت متوسط آب جاری</span>
                    <span className="text-[9.5px] text-natural-text/60 block">نمایش برخط دما و اکسیژن محلول با فیلتر اضطراری</span>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={formConfig.showWaterQuality}
                    onChange={(e) => setFormConfig({...formConfig, showWaterQuality: e.target.checked})}
                    className="w-4 h-4 rounded text-natural-forest border-natural-border focus:ring-natural-forest accent-natural-forest cursor-pointer"
                  />
                </label>

                {/* Toggle 5: Mortality */}
                <label className="flex items-center justify-between p-2.5 rounded-xl hover:bg-natural-khaki/20 transition-colors border border-transparent hover:border-natural-border/30 cursor-pointer select-none">
                  <div className="space-y-0.5 text-right">
                    <span className="text-xs font-bold text-natural-dark block">تلفات دوره جاری</span>
                    <span className="text-[9.5px] text-natural-text/60 block">نمایش فوری تلفات ثبت‌شده و هشدارهای دامنه خطر</span>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={formConfig.showMortality}
                    onChange={(e) => setFormConfig({...formConfig, showMortality: e.target.checked})}
                    className="w-4 h-4 rounded text-natural-forest border-natural-border focus:ring-natural-forest accent-natural-forest cursor-pointer"
                  />
                </label>
              </div>

              {/* Graphical settings */}
              <div className="space-y-4 pt-3 border-t border-natural-border/50">
                <span className="text-[11px] font-black text-natural-earth block border-r-2 border-natural-forest pr-2">سبک نمایش نمودارهای برخط سایدبار</span>
                
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormConfig({...formConfig, showSpeciesChart: true, showHallsChart: false, chartStyle: "donut"})}
                    className={`p-2.5 rounded-xl border text-[10px] font-bold flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                      formConfig.showSpeciesChart && formConfig.chartStyle === "donut"
                        ? "bg-natural-forest text-white border-natural-forest-hover shadow-xs"
                        : "bg-white text-natural-text border-natural-border hover:bg-natural-khaki/30"
                    }`}
                  >
                    <PieChart size={16} />
                    نمودار دایره‌ای گونه‌ها
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormConfig({...formConfig, showHallsChart: true, showSpeciesChart: false, chartStyle: "bars"})}
                    className={`p-2.5 rounded-xl border text-[10px] font-bold flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                      formConfig.showHallsChart && formConfig.chartStyle === "bars"
                        ? "bg-natural-forest text-white border-natural-forest-hover shadow-xs"
                        : "bg-white text-natural-text border-natural-border hover:bg-natural-khaki/30"
                    }`}
                  >
                    <BarChart3 size={16} />
                    نمودار میله‌ای سالن‌ها
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormConfig({...formConfig, showSpeciesChart: false, showHallsChart: false, chartStyle: "sparkline"})}
                    className={`p-2.5 rounded-xl border text-[10px] font-bold flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                      formConfig.chartStyle === "sparkline"
                        ? "bg-natural-forest text-white border-natural-forest-hover shadow-xs"
                        : "bg-white text-natural-text border-natural-border hover:bg-natural-khaki/30"
                    }`}
                  >
                    <Activity size={16} />
                    موج خطی اکسیژن
                  </button>
                </div>
              </div>

              {/* Threshold Target settings */}
              <div className="space-y-4 pt-3 border-t border-natural-border/50">
                <span className="text-[11px] font-black text-natural-earth block border-r-2 border-natural-forest pr-2">تارگت‌ها و پارامترهای بیولوژیکی شخصی</span>
                
                {/* Biomass Target Input */}
                {formConfig.showBiomass && (
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs text-natural-dark font-semibold">
                      <span>هدف تولید بیوماس کل فارم (kg)</span>
                      <span className="font-mono text-natural-forest font-bold">{(formConfig.biomassTargetKg).toLocaleString()} kg</span>
                    </div>
                    <input 
                      type="range" 
                      min="5000" 
                      max="50000" 
                      step="1000"
                      value={formConfig.biomassTargetKg}
                      onChange={(e) => setFormConfig({...formConfig, biomassTargetKg: parseInt(e.target.value)})}
                      className="w-full accent-natural-forest cursor-pointer"
                    />
                    <div className="flex justify-between text-[8px] text-natural-text/50 font-mono">
                      <span>۵,۰۰۰ کیلوگرم</span>
                      <span>۵۰,۰۰۰ کیلوگرم</span>
                    </div>
                  </div>
                )}

                {/* Oxygen threshold Input */}
                {formConfig.showWaterQuality && (
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs text-natural-dark font-semibold">
                      <span>آستانه بحران اکسیژن محلول (ppm)</span>
                      <span className="font-mono text-red-600 font-bold">{formConfig.criticalOxygenLevel} ppm</span>
                    </div>
                    <input 
                      type="range" 
                      min="3.0" 
                      max="8.0" 
                      step="0.1"
                      value={formConfig.criticalOxygenLevel}
                      onChange={(e) => setFormConfig({...formConfig, criticalOxygenLevel: parseFloat(e.target.value)})}
                      className="w-full accent-red-500 cursor-pointer"
                    />
                    <div className="flex justify-between text-[8px] text-natural-text/50 font-mono">
                      <span>۳.۰ ppm (بسیار بحرانی)</span>
                      <span>۸.۰ ppm (مطلوب عمومی)</span>
                    </div>
                  </div>
                )}
              </div>

            </div>

            {/* Modal Actions Footer */}
            <div className="flex justify-between items-center pt-4 border-t border-natural-border">
              <button
                type="button"
                onClick={handleResetConfig}
                className="py-2 px-3 hover:bg-red-50 text-red-700 text-xs rounded-xl flex items-center gap-1.5 transition-all border border-transparent hover:border-red-200 font-bold cursor-pointer"
              >
                <RotateCcw size={14} />
                بازنشانی پیش‌فرض
              </button>
              
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsSettingsOpen(false)}
                  className="py-2 px-3 bg-natural-khaki hover:bg-natural-khaki/80 text-natural-text text-xs rounded-xl font-bold cursor-pointer transition-colors"
                >
                  انصراف
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveConfig(formConfig)}
                  className="py-2 px-4 bg-natural-forest hover:bg-natural-forest-hover text-white text-xs rounded-xl flex items-center gap-1.5 font-bold cursor-pointer shadow-sm transition-colors"
                >
                  <Save size={14} />
                  ذخیره تنظیمات من
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
