/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Search, X, Fish, Tag, ShieldCheck, FileText, ArrowLeft, Terminal, Sparkles } from "lucide-react";
import { Pool } from "../types";

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  pools: Pool[];
  onSelectPool: (poolId: string) => void;
  onNavigateTab: (tab: string) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  pools,
  onSelectPool,
  onNavigateTab
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        if (isOpen) onClose();
        else setSearchTerm("");
      }
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const term = searchTerm.trim().toLowerCase();

  // Search logic
  const matchedPools = pools.filter(p => 
    p.id.toLowerCase().includes(term) ||
    p.name.toLowerCase().includes(term) ||
    p.breed.toLowerCase().includes(term) ||
    (p.citesExportPermit && p.citesExportPermit.toLowerCase().includes(term)) ||
    (p.paternalPedigreeCode && p.paternalPedigreeCode.toLowerCase().includes(term)) ||
    (p.maternalPedigreeCode && p.maternalPedigreeCode.toLowerCase().includes(term))
  );

  const staticModules = [
    { title: "۵۲ ونیرو سالن ۱ نرسری", type: "سالن و استخرها", tab: "map" },
    { title: "جدول بیوماس و آمار ضریب تبدیل FCR", type: "آمار و نمودارها", tab: "stats" },
    { title: "آزمایشگاه اکسیژن، دما و سونوگرافی", type: "کنترل کیفی", tab: "lab" },
    { title: "زنجیره تامین و گواهی CITES خاویار", type: "صادرات و ردیابی", tab: "traceability" },
    { title: "دفتر ثبت تلفات و عیب‌یابی هوشمند", type: "مدیریت تلفات", tab: "mortality" },
    { title: "فرآوری خاویار و قوطی‌های صادراتی", type: "کارخانه فرآوری", tab: "processing" },
    { title: "کارخانه خوراک و آنالیز پلت", type: "تولید غذا", tab: "feedmill" },
    { title: "دفتر روزنامه و حسابداری مالی", type: "مالی و تراز", tab: "accounting" }
  ].filter(m => m.title.toLowerCase().includes(term) || m.type.toLowerCase().includes(term));

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-2xl glass-card-3d border border-cyan-500/40 shadow-2xl bg-slate-950/95 rounded-2xl overflow-hidden flex flex-col max-h-[80vh]">
        
        {/* SEARCH INPUT HEADER */}
        <div className="p-4 border-b border-slate-800 flex items-center gap-3">
          <Search size={20} className="text-cyan-400 shrink-0" />
          <input 
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="جستجوی هوشمند (شناسه استخر، کد ونیرو، CITES، میکروچیپ RFID یا بخش‌ها)..."
            className="w-full bg-transparent text-sm text-white placeholder-slate-500 outline-none font-sans"
            autoFocus
          />
          <button 
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10"
          >
            <X size={18} />
          </button>
        </div>

        {/* RESULTS BODY */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1">
          
          {/* MATCHED POOLS */}
          {matchedPools.length > 0 && (
            <div>
              <span className="text-[10px] text-slate-400 font-bold block mb-2 flex items-center gap-1">
                <Fish size={12} className="text-cyan-400" />
                استخرها و ونیروهای مطابقت‌یافته ({matchedPools.length}):
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {matchedPools.slice(0, 8).map(pool => (
                  <button
                    key={pool.id}
                    onClick={() => {
                      onSelectPool(pool.id);
                      onClose();
                    }}
                    className="p-3 bg-slate-900/80 hover:bg-cyan-500/10 hover:border-cyan-500/40 border border-slate-800 rounded-xl text-right transition-all flex items-center justify-between group cursor-pointer"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-white">{pool.name}</span>
                        <span className="text-[9px] px-1.5 py-0.5 bg-slate-800 text-cyan-300 rounded font-mono">
                          سالن {pool.hallId}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-sans block mt-0.5">
                        {pool.breed} • {pool.count.toLocaleString()} قطعه • {(pool.totalBiomassKg).toLocaleString()} kg
                      </span>
                    </div>
                    <ArrowLeft size={14} className="text-slate-500 group-hover:text-cyan-400 transition-transform group-hover:-translate-x-1" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* MATCHED MODULES */}
          {staticModules.length > 0 && (
            <div>
              <span className="text-[10px] text-slate-400 font-bold block mb-2 flex items-center gap-1">
                <Sparkles size={12} className="text-purple-400" />
                بخش‌های زیرسیستم ERP:
              </span>
              <div className="space-y-1.5">
                {staticModules.map((mod, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      onNavigateTab(mod.tab);
                      onClose();
                    }}
                    className="w-full p-2.5 bg-slate-900/60 hover:bg-purple-500/10 hover:border-purple-500/40 border border-slate-800 rounded-xl text-right transition-all flex items-center justify-between group cursor-pointer text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-200">{mod.title}</span>
                      <span className="text-[9px] text-slate-400">({mod.type})</span>
                    </div>
                    <ArrowLeft size={14} className="text-slate-500 group-hover:text-purple-400 transition-transform group-hover:-translate-x-1" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {matchedPools.length === 0 && staticModules.length === 0 && (
            <div className="text-center py-8 text-slate-500 text-xs">
              نتیجه‌ای برای "{searchTerm}" یافت نشد. عبارت دیگری را امتحان کنید.
            </div>
          )}

        </div>

        {/* FOOTER SHORTCUT HINT */}
        <div className="p-3 border-t border-slate-800 bg-slate-900/40 flex items-center justify-between text-[10px] text-slate-400 font-mono">
          <span>برای بسته شدن Esc بمالید</span>
          <span className="flex items-center gap-1">
            میانبر: <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-cyan-300">Ctrl + K</kbd>
          </span>
        </div>

      </div>
    </div>
  );
};
