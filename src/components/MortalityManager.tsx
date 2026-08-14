/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Pool, MortalityLog, SturgeonBreed } from "../types";
import { 
  FileWarning, 
  PlusCircle, 
  HelpCircle, 
  Sparkles, 
  Clipboard, 
  CheckCircle,
  Eye,
  Camera,
  HeartCrack,
  AlertTriangle,
  RefreshCw
} from "lucide-react";

interface MortalityManagerProps {
  pools: Pool[];
  mortalityLogs: MortalityLog[];
  onAddMortalityRecord: (
    poolId: string,
    count: number,
    breed: SturgeonBreed,
    gender: string,
    symptoms: string,
    explanation: string,
    photoUrl: string,
    aiAction: string
  ) => boolean;
}

export const MortalityManager: React.FC<MortalityManagerProps> = ({
  pools,
  mortalityLogs,
  onAddMortalityRecord
}) => {
  const activePools = pools.filter(p => p.count > 0);

  // Form State
  const [selectedPoolId, setSelectedPoolId] = useState<string>(activePools[0]?.id || "");
  const [lossCount, setLossCount] = useState<number>(2);
  const [selectedBreed, setSelectedBreed] = useState<SturgeonBreed>(activePools[0]?.fishBatches?.[0]?.breed || activePools[0]?.breed || SturgeonBreed.BELUGA);
  const [selectedGender, setSelectedGender] = useState<string>(activePools[0]?.fishBatches?.[0]?.gender || "unknown");
  const [symptoms, setSymptoms] = useState<string>("");
  const [explanation, setExplanation] = useState<string>("");
  const [photoUrl, setPhotoUrl] = useState<string>(""); // support base64 encoded strings
  
  // Custom Status Messages for inline alerts (no-iframe blocks)
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [statusMessage, setStatusMessage] = useState<string>("");

  // Custom disease symptom helpers (fast click to write)
  const SYMPTOM_PRESETS = [
    "تجمع در نزدیکی ورودی پمپ شتاب دهنده آب",
    "تلوتلو خوردن و پرش به هوا به دلیل تنگی دمبل",
    "زخم‌های پنبه‌ای سفید روی غلت دم و باله‌ها",
    "خونریزی حاشیه شکمی و قرمزی مخرج",
    "بی‌اشتهایی کامل و شنای حلقوی دورانی"
  ];

  // AI Diagnostic Loading states
  const [isDiagnosing, setIsDiagnosing] = useState<boolean>(false);
  const [aiResult, setAiResult] = useState<string>("");

  const activePool = pools.find(p => p.id === selectedPoolId);

  // Handle Photo Simulation or Drag & Drop Upload
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // AI Diagnostic triggers
  const handleFetchAiDiagnostic = async () => {
    setErrorMessage("");
    setStatusMessage("");

    if (!symptoms.trim()) {
      setErrorMessage("لطفاً ابتدا علائم ظاهری یا بالینی تلفات را شرح دهید تا تحلیل هومشند انجام شود.");
      return;
    }

    setIsDiagnosing(true);
    setAiResult("");

    try {
      const res = await fetch("/api/diagnose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          poolName: activePool ? activePool.name : "استخر نامشخص",
          breed: activePool ? activePool.breed : "ماهی خاویاری",
          count: lossCount,
          symptoms: symptoms,
          detail: explanation
        })
      });

      const data = await res.json();
      if (data.success) {
        setAiResult(data.diagnosis);
        setStatusMessage("تشخیص هوش مصنوعی دریافت شد. می‌توانید هم‌اکنون این واقعه را تایید و ثبت کنید.");
      } else {
        setAiResult("توصیه تجربی سیستم: نوسان همزمان اکسیژن محلول و تجمع گازهای سطحی سبب استرس گله شده است. میزان دبی آب را موقتا افزایش داده و از پلت‌های پُرکیفیت جهت مهار استرس بهره ببرید.");
        setStatusMessage("تشخیص عمومی انجام گردید.");
      }
    } catch (err) {
      console.error(err);
      setAiResult("خطا در برقراری ارتباط با هسته هوش مصنوعی. توصیه می‌شود پارامترهای اکسیژن‌ساز و شستشوی بستر حوضچه بررسی گردد.");
      setErrorMessage("خطا در شبکه با این وجود یک توصیه ایمن صادر شد.");
    } finally {
      setIsDiagnosing(false);
    }
  };

  // Submit and save record
  const handleSaveRecord = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setStatusMessage("");

    if (!selectedPoolId) {
      setErrorMessage("لطفاً یک استخر متقاضی جابجایی یا دارای تلفات را برگزینید.");
      return;
    }
    if (lossCount <= 0) {
      setErrorMessage("تعداد تلفات باید بزرگتر از صفر باشد.");
      return;
    }
    if (!symptoms.trim()) {
      setErrorMessage("لطفا خلاصه علائم تلفات را ثبت فرمایید.");
      return;
    }

    const finalAiAction = aiResult || "پایش بیوشیمیایی، تعدیل تراکم محیط زیستی و حفظ بهداشت مداوم بدنه استخر.";
    
    const saved = onAddMortalityRecord(
      selectedPoolId,
      lossCount,
      selectedBreed,
      selectedGender,
      symptoms,
      explanation,
      photoUrl,
      finalAiAction
    );

    if (!saved) {
      setErrorMessage("تعداد تلفات از موجودی نژاد و جنسیت انتخاب‌شده بیشتر است؛ ثبت انجام نشد.");
      return;
    }

    // reset fields
    setLossCount(1);
    setSymptoms("");
    setExplanation("");
    setPhotoUrl("");
    setAiResult("");
    
    setStatusMessage("واقعه تلفات با موفقیت ثبت شد و از شمارش کلی استخر کسر گردید.");
  };

  return (
    <div id="mortality-manager-layout" className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      {/* LEFT FORM FIELD & DIAGNOSTICS: 7 COLS */}
      <div className="lg:col-span-7 space-y-6">
        
        {/* MORTALITY ENTRY FORM */}
        <div className="bg-white rounded-3xl p-6 border border-natural-border shadow-sm">
          <div className="flex items-center gap-3 mb-5 border-b border-natural-border pb-4">
            <div className="p-2.5 bg-natural-khaki text-natural-clay rounded-2xl">
              <HeartCrack size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-natural-dark font-sans">ثبت واقعه تلفات و زیان</h3>
              <p className="text-xs text-natural-text/70 font-sans">گزارش تلفات روزانه، به روز رسانی اتوماتیک بیوماس و تشخیص درمان</p>
            </div>
          </div>

          <form onSubmit={handleSaveRecord} className="space-y-4 text-xs font-sans">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-natural-text font-semibold mb-1">استخر واقعه:</label>
                <select
                  value={selectedPoolId}
                  onChange={(e) => {
                    setSelectedPoolId(e.target.value);
                    setErrorMessage("");
                    setStatusMessage("");
                  }}
                  className="w-full text-xs font-sans rounded-xl border border-natural-border p-2.5 bg-[#FDFCF8] focus:border-natural-earth focus:outline-none text-natural-dark font-medium"
                >
                  <option value="">-- انتخاب استخر --</option>
                  {activePools.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} (سالن {p.hallId}) - تعداد زنده: {p.count}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-natural-text font-semibold mb-1">تعداد تلف‌شده (قطعه):</label>
                <input
                  type="number"
                  min="1"
                  value={lossCount}
                  onChange={(e) => setLossCount(parseInt(e.target.value) || 0)}
                  className="w-full font-mono text-xs rounded-xl border border-natural-border p-2.5 bg-[#FDFCF8] focus:border-natural-earth focus:outline-none text-center font-bold text-natural-clay"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-natural-text font-semibold mb-1">نژاد موجودی:</label>
                <select value={selectedBreed} onChange={e => setSelectedBreed(e.target.value as SturgeonBreed)} className="w-full text-xs rounded-xl border border-natural-border p-2.5 bg-[#FDFCF8]">
                  {(activePool?.fishBatches?.length ? [...new Set(activePool.fishBatches.map(batch => batch.breed))] : [activePool?.breed || SturgeonBreed.BELUGA]).map(breed => <option key={breed} value={breed}>{breed}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-natural-text font-semibold mb-1">جنسیت:</label>
                <select value={selectedGender} onChange={e => setSelectedGender(e.target.value)} className="w-full text-xs rounded-xl border border-natural-border p-2.5 bg-[#FDFCF8]">
                  {(activePool?.fishBatches?.length ? [...new Set(activePool.fishBatches.filter(batch => batch.breed === selectedBreed).map(batch => batch.gender))] : ["unknown"]).map(gender => <option key={gender} value={gender}>{gender === "female" ? "ماده" : gender === "male" ? "نر" : gender === "mixed" ? "ترکیبی" : "نامشخص"}</option>)}
                </select>
              </div>
            </div>

            {/* Quick Presets */}
            <div>
              <label className="block text-natural-text/80 font-semibold mb-1.5">میانبر سریع علائم شایع ماهیان خاویاری:</label>
              <div className="flex flex-wrap gap-1.5">
                {SYMPTOM_PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setSymptoms(preset);
                      setErrorMessage("");
                    }}
                    className="px-2.5 py-1 bg-natural-khaki hover:bg-natural-khaki/80 text-natural-dark border border-natural-border/30 rounded-lg text-[10px] cursor-pointer transition-colors duration-150"
                  >
                    + {preset}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-natural-text font-semibold mb-1">شرح علائم ظاهری مشاهده شده:</label>
              <input
                type="text"
                value={symptoms}
                onChange={(e) => {
                  setSymptoms(e.target.value);
                  setErrorMessage("");
                }}
                className="w-full text-xs font-sans rounded-xl border border-natural-border p-2.5 bg-[#FDFCF8] focus:border-natural-earth focus:outline-none text-natural-dark font-medium"
                placeholder="مثال: بی‌حرکتی، لکه‌های قارچی پنبه‌شکل روی باله دمی، شنا در حاشیه استخر"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Write ups */}
              <div>
                <label className="block text-natural-text font-semibold mb-1">توضیحات تکمیلی یا دلایل محیطی احتمالی:</label>
                <textarea
                  rows={4}
                  value={explanation}
                  onChange={(e) => setExplanation(e.target.value)}
                  className="w-full text-xs font-sans rounded-xl border border-natural-border p-2.5 bg-[#FDFCF8] focus:border-natural-earth focus:outline-none text-natural-dark"
                  placeholder="مثال: شوک موقت آمونیاک به دلیل به تاخیر افتادن تعویض آب سیستم تخلیه زیر کف استخر شماره ۵"
                />
              </div>

              {/* Photo uploader with preview & simulators */}
              <div className="bg-[#FDFCF8] p-3 rounded-2xl border border-natural-border flex flex-col justify-between">
                <div>
                  <span className="text-[10px] text-natural-text/80 font-bold block mb-1">تصویر تلفات (جهت رهگیری چشمی):</span>
                  <div className="relative border-2 border-dashed border-natural-border rounded-xl p-2 text-center hover:border-natural-earth bg-white cursor-pointer h-24 flex flex-col justify-center items-center">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    {photoUrl ? (
                      <img src={photoUrl} alt="Preview" className="h-full w-auto object-cover rounded-md" />
                    ) : (
                      <div className="text-natural-text/50 flex flex-col items-center">
                        <Camera size={20} className="mb-1 text-natural-earth" />
                        <span className="text-[9px]">آپلود تصویر تلفات ماهی</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-2 pt-2 border-t border-natural-border/20 text-[9px] text-natural-text/60">تصویر به‌صورت محلی ذخیره و داخل فایل Backup منتقل می‌شود.</div>
              </div>
            </div>

            {/* ERROR & STATUS MESSAGES */}
            {errorMessage && (
              <div className="p-3 bg-natural-clay/10 text-natural-clay border border-natural-clay/20 rounded-xl flex items-center gap-2 font-semibold text-xs leading-relaxed">
                <AlertTriangle size={14} className="shrink-0" />
                <p>{errorMessage}</p>
              </div>
            )}

            {statusMessage && (
              <div className="p-3 bg-natural-forest/10 text-natural-forest border border-natural-forest/20 rounded-xl flex items-center gap-2 font-semibold text-xs leading-relaxed">
                <CheckCircle size={14} className="shrink-0" />
                <p>{statusMessage}</p>
              </div>
            )}

            {/* AI Diagnostics button */}
            <div className="pt-4 border-t border-natural-border flex justify-between items-center gap-4">
              <div className="text-[10px] text-natural-text/60 leading-relaxed font-sans max-w-[65%]">
                قبل از ذخیره، می‌توانید شرح علائم را به هسته هوشمند شیلاتی ارسال نمایید تا علت بیولوژیک و پروتکل درمان را تخمین بزند.
              </div>
              <button
                type="button"
                onClick={handleFetchAiDiagnostic}
                disabled={isDiagnosing || !symptoms.trim()}
                className="px-4 py-2.5 bg-[#2D4A3E] hover:bg-[#1E332A] text-white font-bold rounded-xl text-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isDiagnosing ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    تحلیل بیومتریک...
                  </>
                ) : (
                  <>
                    <Sparkles size={14} className="text-natural-khaki fill-natural-khaki" />
                    تحلیل هوشمند علت تلفات (AI)
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* AI ANALYSIS DISPLAY CARD */}
        {aiResult && (
          <div id="ai-diagnostic-result" className="bg-white border border-natural-border rounded-3xl p-5 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-natural-khaki/20 rounded-full blur-2xl pointer-events-none" />
            <div className="flex items-center gap-2 mb-3 text-natural-forest font-bold font-sans text-xs">
              <Sparkles size={14} className="fill-natural-forest" />
              <span>پروتکل درمانی و توصیه‌های تجویزی پزشک شیلات خاویارسیستم:</span>
            </div>
            
            <div className="bg-natural-khaki/40 p-4 rounded-xl border border-natural-border text-xs leading-relaxed font-sans text-natural-dark whitespace-pre-wrap max-h-56 overflow-y-auto">
              {aiResult}
            </div>

            <div className="flex justify-end gap-3 mt-4 text-[10px]">
              <button
                type="button"
                onClick={handleSaveRecord}
                className="px-4 py-2 bg-natural-clay hover:bg-natural-clay-hover text-white font-bold rounded-lg border border-natural-clay transition-colors cursor-pointer shadow-sm"
              >
                ذخیره واقعه به همراه تجویز پزشک
              </button>
            </div>
          </div>
        )}

      </div>

      {/* RIGHT CHRONOLOGY: 5 COLS */}
      <div className="lg:col-span-5 bg-[#F5F2E8] text-natural-text rounded-3xl p-6 border border-natural-border shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-3 mb-6 border-b border-natural-border pb-4">
            <div className="p-2 bg-natural-forest text-natural-khaki rounded-xl font-bold border border-natural-forest-hover">
              <FileWarning size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-natural-dark font-sans">تاریخچه تلفات و دفتر فوت ماهیان</h3>
              <p className="text-xs text-natural-text/75 font-sans">ردیابی علل، تلفات، وزن از دست رفته و اقدامات دامپزشکی</p>
            </div>
          </div>

          <div id="mortality-logs-list" className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
            {mortalityLogs.map((log) => (
              <div
                key={log.id}
                id={`mort-${log.id}`}
                className="bg-white border border-natural-border p-4 rounded-2xl space-y-3 shadow-sm hover:bg-white/90 transition-all duration-150"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h5 className="text-xs font-bold text-natural-dark font-sans">{log.poolName}</h5>
                    <p className="text-[10px] text-natural-text/60 mt-0.5 font-mono">تاریخ واقعه: {log.date}</p>
                  </div>
                  <span className="px-2 py-1 bg-natural-clay/10 text-natural-clay font-mono font-bold text-xs rounded border border-natural-clay/20 shadow-inner">
                    {log.count} تلفات
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  {log.photoUrl && (
                    <div className="md:col-span-1 rounded-xl overflow-hidden border border-natural-border h-16 w-full shrink-0">
                      <img src={log.photoUrl} alt="Disease specimen" className="w-full h-full object-cover referral-no-referrer" referrerPolicy="no-referrer" />
                    </div>
                  )}
                  
                  <div className={`${log.photoUrl ? "md:col-span-3" : "md:col-span-4"} space-y-1.5 text-xs font-sans`}>
                    <p className="text-natural-dark font-medium">
                      <strong className="text-natural-clay">علائم بالینی:</strong> {log.symptoms}
                    </p>
                    {log.explanation && (
                      <p className="text-natural-text/80 text-[11px] leading-relaxed">
                        <strong className="text-natural-earth">گزارش پرورش‌دهنده:</strong> {log.explanation}
                      </p>
                    )}
                  </div>
                </div>

                {log.aiSuggestedAction && (
                  <div className="bg-natural-khaki p-3 rounded-xl border border-natural-border text-[10.5px] leading-relaxed text-natural-dark font-sans shadow-inner">
                    <span className="text-natural-forest font-bold flex items-center gap-1 mb-1">
                      <Sparkles size={11} className="fill-natural-forest" />
                      تجویز دامپزشک فارم:
                    </span>
                    <p className="whitespace-pre-line text-natural-text">{log.aiSuggestedAction}</p>
                  </div>
                )}
              </div>
            ))}

            {mortalityLogs.length === 0 && (
              <div className="text-center py-12 text-natural-text/50 text-xs font-sans">
                تاکنون واقعه تلفاتی ثبت نگردیده است. سلامت گله در وضعیت مطلوب است.
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 pt-3 border-t border-natural-border text-[9px] text-natural-text/50 leading-relaxed font-sans text-center">
          * ثبت دقیق تلفات روزانه، تضمین‌کننده محاسبه بی‌نقص FCR کلی، سلامت‌سنجی حوضچه‌ها و ممانعت از هدرروی پلت غذا در فارم استخرها می‌باشد.
        </div>
      </div>

    </div>
  );
};
