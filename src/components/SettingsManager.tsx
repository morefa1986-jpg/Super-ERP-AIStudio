/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  Settings, 
  Sliders, 
  FlaskConical, 
  Building2, 
  Server,
  RotateCcw, 
  Download, 
  Upload, 
  Save, 
  CheckCircle2, 
  AlertTriangle, 
  HelpCircle,
  TrendingUp,
  Cpu,
  RefreshCw,
  Waves,
  FolderSync
} from "lucide-react";
import { Pool, Hall } from "../types";
import { CENTRAL_THRESHOLDS, saveCentralThresholds, DEFAULT_THRESHOLDS } from "../config/thresholds";
import { SturgeonRepository } from "../storage/repository";
import { NetworkSyncManager } from "./NetworkSyncManager";
import { createBackup, restoreBackup } from "../storage/backup";
import bcrypt from "bcryptjs";

interface SettingsManagerProps {
  pools: Pool[];
  halls: Hall[];
  onReloadData?: () => void;
}

export interface GeneralSettings {
  farmName: string;
  managerName: string;
  locationName: string;
  nominalCapacity: string;
  fcrBaseCoefficient: number;
  alertSoundEnabled: boolean;
  iotGatewayUrl: string;
  autoBackupInterval: string;
  dailyFeedCeilingKg: number;
  smsAlertNumber: string;
  waterCirculationRate: number;
  targetWaterTemp: number;
}

const DEFAULT_GENERAL_SETTINGS: GeneralSettings = {
  farmName: "مزرعه تکثیر و پرورش ماهیان خاویاری فتحی",
  managerName: "جناب آقای فتحی (مدیریت کل فارم)",
  locationName: "مازندران، سواحل جنوبی دریای خزر - لمی",
  nominalCapacity: "۵۰ تن گوشت و ۵ تن خاویار استحصال سالانه",
  fcrBaseCoefficient: 1.15,
  alertSoundEnabled: true,
  iotGatewayUrl: "http://fathi-iot.local:8080/v1",
  autoBackupInterval: "daily",
  dailyFeedCeilingKg: 1200,
  smsAlertNumber: "09113214567",
  waterCirculationRate: 92,
  targetWaterTemp: 16.5
};

export const SettingsManager: React.FC<SettingsManagerProps> = ({ pools, halls, onReloadData }) => {
  // Load General Settings
  const [general, setGeneral] = useState<GeneralSettings>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("sturgeon_general_settings_v2");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          return {
            ...DEFAULT_GENERAL_SETTINGS,
            ...parsed
          };
        } catch (e) {
          // ignore
        }
      }
    }
    return { ...DEFAULT_GENERAL_SETTINGS };
  });

  // Thresholds States
  const [tempMin, setTempMin] = useState(CENTRAL_THRESHOLDS.temperature.min);
  const [tempMax, setTempMax] = useState(CENTRAL_THRESHOLDS.temperature.max);
  const [tempCritMin, setTempCritMin] = useState(CENTRAL_THRESHOLDS.temperature.criticalMin);
  const [tempCritMax, setTempCritMax] = useState(CENTRAL_THRESHOLDS.temperature.criticalMax);

  const [o2Min, setO2Min] = useState(CENTRAL_THRESHOLDS.oxygenLevel.min);
  const [o2Max, setO2Max] = useState(CENTRAL_THRESHOLDS.oxygenLevel.max);
  const [o2CritMin, setO2CritMin] = useState(CENTRAL_THRESHOLDS.oxygenLevel.criticalMin);
  const [o2CritMax, setO2CritMax] = useState(CENTRAL_THRESHOLDS.oxygenLevel.criticalMax);

  const [phMin, setPhMin] = useState(CENTRAL_THRESHOLDS.phLevel.min);
  const [phMax, setPhMax] = useState(CENTRAL_THRESHOLDS.phLevel.max);
  const [phCritMin, setPhCritMin] = useState(CENTRAL_THRESHOLDS.phLevel.criticalMin);
  const [phCritMax, setPhCritMax] = useState(CENTRAL_THRESHOLDS.phLevel.criticalMax);

  const [nitriteMax, setNitriteMax] = useState(CENTRAL_THRESHOLDS.nitriteLevel.max);
  const [nitriteCritMax, setNitriteCritMax] = useState(CENTRAL_THRESHOLDS.nitriteLevel.criticalMax);

  const [ammoniaMax, setAmmoniaMax] = useState(CENTRAL_THRESHOLDS.ammoniaLevel.max);
  const [ammoniaCritMax, setAmmoniaCritMax] = useState(CENTRAL_THRESHOLDS.ammoniaLevel.criticalMax);

  const [activeSubTab, setActiveSubTab] = useState<"general" | "thresholds" | "advanced" | "sync">("general");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [isCalibrating, setIsCalibrating] = useState(false);

  const currentUser = SturgeonRepository.getCurrentUser();
  const isAdmin = currentUser?.role === "admin";

  const handleResetRawData = () => {
    if (window.confirm("آیا از بازنشانی مجدد اطلاعات فارم خاویاری به داده‌های خام مطمئن هستید؟")) {
      localStorage.clear();
      
      const temporaryAdminPassword = crypto.randomUUID().slice(0, 12);
      const defaultUsers = [
        {
          id: "admin",
          name: "مدیر سیستم",
          username: "admin",
          password: bcrypt.hashSync(temporaryAdminPassword, 10),
          role: "admin",
          permissions: ["all"]
        }
      ];
      localStorage.setItem("sturgeon_users_v2", JSON.stringify(defaultUsers));
      localStorage.setItem("sturgeon_raw_v4", "true");
      alert(`رمز موقت مدیر سیستم برای همین نصب محلی: ${temporaryAdminPassword}\nپس از ورود، رمز را از پنل مدیریت تغییر دهید.`);

      showToast("تمامی اطلاعات پیش‌فرض حذف شده و سامانه به داده‌های خام اولیه بازنشانی شد.");
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    }
  };

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Save General Settings
  const handleSaveGeneral = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("sturgeon_general_settings_v2", JSON.stringify(general));
    showToast("تنظیمات عمومی فارم با موفقیت ذخیره گردید.");
    if (onReloadData) {
      onReloadData();
    }
  };

  // Save Thresholds Settings
  const handleSaveThresholds = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newThresholds = {
      temperature: {
        ...CENTRAL_THRESHOLDS.temperature,
        min: Number(tempMin),
        max: Number(tempMax),
        criticalMin: Number(tempCritMin),
        criticalMax: Number(tempCritMax)
      },
      oxygenLevel: {
        ...CENTRAL_THRESHOLDS.oxygenLevel,
        min: Number(o2Min),
        max: Number(o2Max),
        criticalMin: Number(o2CritMin),
        criticalMax: Number(o2CritMax)
      },
      phLevel: {
        ...CENTRAL_THRESHOLDS.phLevel,
        min: Number(phMin),
        max: Number(phMax),
        criticalMin: Number(phCritMin),
        criticalMax: Number(phCritMax)
      },
      nitriteLevel: {
        ...CENTRAL_THRESHOLDS.nitriteLevel,
        max: Number(nitriteMax),
        criticalMax: Number(nitriteCritMax)
      },
      ammoniaLevel: {
        ...CENTRAL_THRESHOLDS.ammoniaLevel,
        max: Number(ammoniaMax),
        criticalMax: Number(ammoniaCritMax)
      }
    };

    saveCentralThresholds(newThresholds);
    showToast("آستانه‌های بحرانی هیدروشیمی در کل سیستم به روز رسانی شد.");
    if (onReloadData) {
      onReloadData();
    }
  };

  // Sensor Auto Calibration Simulator
  const handleSensorCalibration = () => {
    setIsCalibrating(true);
    setTimeout(() => {
      setIsCalibrating(false);
      showToast("سنسورهای هیدروشیمی متصل به استخرها با استانداردهای مرجع کالیبره شدند.");
    }, 1800);
  };

  // Export Data Backup as JSON
  const handleExportBackup = () => {
    const currentUser = SturgeonRepository.getCurrentUser();
    const backupData = createBackup(currentUser?.username || currentUser?.name || "local-admin");
    const dataStr = "data:application/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `sturgeon_caviar_backup_${new Date().toISOString().slice(0,10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast("پشتیبان‌گیری کامل از پایگاه داده با موفقیت صادر شد.");
  };

  // Import Data Backup
  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], "UTF-8");
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          const result = restoreBackup(parsed);
          showToast(`پشتیبان نسخه ${result.sourceVersion} با ${result.importedKeys} بخش بازیابی شد. برنامه بازنشانی می‌شود.`);
          setTimeout(() => {
            window.location.reload();
          }, 1500);
        } catch (error: any) {
          showToast(error.message || "خطا در قالب فایل پشتیبان انتخابی.", "error");
        }
      };
    }
  };

  // Factory Reset
  const handleFactoryReset = () => {
    if (window.confirm("هشدار جدی: آیا از بازنشانی کامل اطلاعات فارم به پیش‌فرض کارخانه اطمینان دارید؟ تمام داده‌های ثبت شده و استخرها حذف خواهند شد.")) {
      if (window.confirm("تایید دوم: پس از فشردن تایید نهایی هیچ راه بازگشتی نیست.")) {
        Object.keys(localStorage).forEach((key) => {
          if (key.startsWith("sturgeon_")) {
            localStorage.removeItem(key);
          }
        });
        showToast("سامانه با موفقیت به پیش‌فرض اولیه بازگشت داده شد.");
        setTimeout(() => {
          window.location.reload();
        }, 1200);
      }
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-6 left-6 z-50 p-4 rounded-2xl flex items-center gap-2.5 text-xs font-bold shadow-xl animate-fadeIn ${
          toast.type === "success" 
            ? "bg-emerald-900 border border-emerald-700 text-emerald-100" 
            : "bg-rose-950 border border-rose-800 text-rose-100"
        }`}>
          <CheckCircle2 size={16} className={toast.type === "success" ? "text-emerald-400" : "text-rose-400"} />
          <span>{toast.message}</span>
        </div>
      )}

      {/* Settings Sub Tabs Nav */}
      <div className="flex bg-white p-2 rounded-2xl border border-natural-border/60 max-w-fit gap-1">
        <button
          onClick={() => setActiveSubTab("general")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            activeSubTab === "general"
              ? "bg-natural-forest text-white"
              : "text-natural-text hover:bg-natural-khaki/30"
          }`}
        >
          <Building2 size={14} />
          تنظیمات عمومی و برندینگ
        </button>

        <button
          onClick={() => setActiveSubTab("thresholds")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            activeSubTab === "thresholds"
              ? "bg-natural-forest text-white"
              : "text-natural-text hover:bg-natural-khaki/30"
          }`}
        >
          <Sliders size={14} />
          آستانه‌های بحرانی هیدروشیمی
        </button>

        <button
          onClick={() => setActiveSubTab("advanced")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            activeSubTab === "advanced"
              ? "bg-natural-forest text-white"
              : "text-natural-text hover:bg-natural-khaki/30"
          }`}
        >
          <Cpu size={14} />
          مدیریت پایگاه داده و کالیبراسیون
        </button>

        <button
          onClick={() => setActiveSubTab("sync")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            activeSubTab === "sync"
              ? "bg-emerald-850 text-white font-black shadow-sm"
              : "text-emerald-700 bg-emerald-50 hover:bg-emerald-100/60 border border-emerald-200/50"
          }`}
        >
          <Server size={14} />
          همگام‌سازی شبکه و موبایل
        </button>
      </div>

      {/* TAB CONTENT: GENERAL SETTINGS */}
      {activeSubTab === "general" && (
        <div className="bg-white rounded-3xl border border-natural-border p-6 lg:p-8 shadow-sm space-y-6">
          <div className="border-b border-natural-border/60 pb-4">
            <h3 className="text-sm font-black text-natural-dark flex items-center gap-2">
              <Building2 className="text-natural-forest" size={18} />
              اطلاعات اساسی و برندینگ مجتمع شیلاتی
            </h3>
            <p className="text-[11px] text-natural-text/60 mt-1">تغییر عنوان کارگاه شیلات، نام مدیر و مشخصات هیدرولیکی پیش‌فرض جهت چاپ در گزارشات و فاکتورها</p>
          </div>

          <form onSubmit={handleSaveGeneral} className="space-y-8">
            {/* Section A: Basic Branding */}
            <div className="space-y-4">
              <h4 className="text-xs font-black text-natural-forest flex items-center gap-2 border-b border-natural-border pb-2">
                <Building2 size={14} />
                بخش اول: اطلاعات اساسی و برندینگ مجتمع شیلاتی
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-natural-dark block">نام رسمی فارم خاویاری</label>
                  <input
                    type="text"
                    value={general.farmName}
                    onChange={(e) => setGeneral({ ...general, farmName: e.target.value })}
                    className="w-full text-xs p-3 rounded-xl border border-natural-border bg-natural-bg/20 focus:outline-none focus:border-natural-forest text-natural-dark font-medium"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-natural-dark block">نام مدیر ارشد و ناظر صادرکننده</label>
                  <input
                    type="text"
                    value={general.managerName}
                    onChange={(e) => setGeneral({ ...general, managerName: e.target.value })}
                    className="w-full text-xs p-3 rounded-xl border border-natural-border bg-natural-bg/20 focus:outline-none focus:border-natural-forest text-natural-dark font-medium"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-natural-dark block">موقعیت فیزیکی و مختصات جغرافیایی کارگاه</label>
                  <input
                    type="text"
                    value={general.locationName}
                    onChange={(e) => setGeneral({ ...general, locationName: e.target.value })}
                    className="w-full text-xs p-3 rounded-xl border border-natural-border bg-natural-bg/20 focus:outline-none focus:border-natural-forest text-natural-dark font-medium"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-natural-dark block">ظرفیت اسمی پروانه بهره‌برداری</label>
                  <input
                    type="text"
                    value={general.nominalCapacity}
                    onChange={(e) => setGeneral({ ...general, nominalCapacity: e.target.value })}
                    className="w-full text-xs p-3 rounded-xl border border-natural-border bg-natural-bg/20 focus:outline-none focus:border-natural-forest text-natural-dark font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Section B: Biological & Hydraulic Metrics */}
            <div className="space-y-4">
              <h4 className="text-xs font-black text-natural-forest flex items-center gap-2 border-b border-natural-border pb-2">
                <Sliders size={14} />
                بخش دوم: پارامترهای هیدرولیک، تغذیه و موازنه زیستی فارم
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1">
                    <label className="text-xs font-bold text-natural-dark">ضریب تبدیل غذایی پایه (FCR Base)</label>
                    <div className="group relative">
                      <HelpCircle size={12} className="text-natural-text/40 cursor-help" />
                      <div className="absolute bottom-full right-0 mb-1 w-56 p-2 bg-natural-dark text-white text-[9px] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none leading-relaxed z-10">
                        نسبت مقدار جیره خورده شده به بیوماس تولیدی. عدد استاندارد بین 0.9 تا 1.3 است.
                      </div>
                    </div>
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    value={general.fcrBaseCoefficient}
                    onChange={(e) => setGeneral({ ...general, fcrBaseCoefficient: parseFloat(e.target.value) || 0 })}
                    className="w-full text-xs p-3 rounded-xl border border-natural-border bg-natural-bg/20 focus:outline-none focus:border-natural-forest text-natural-dark font-mono text-left"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-natural-dark block">سقف خوراک روزانه کل فارم (Kg)</label>
                  <input
                    type="number"
                    value={general.dailyFeedCeilingKg}
                    onChange={(e) => setGeneral({ ...general, dailyFeedCeilingKg: parseInt(e.target.value) || 0 })}
                    className="w-full text-xs p-3 rounded-xl border border-natural-border bg-natural-bg/20 focus:outline-none focus:border-natural-forest text-natural-dark font-mono text-left"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-natural-dark block">نرخ چرخش آب پساب تصفیه شده (%)</label>
                  <input
                    type="number"
                    value={general.waterCirculationRate}
                    onChange={(e) => setGeneral({ ...general, waterCirculationRate: parseInt(e.target.value) || 0 })}
                    className="w-full text-xs p-3 rounded-xl border border-natural-border bg-natural-bg/20 focus:outline-none focus:border-natural-forest text-natural-dark font-mono text-left"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-natural-dark block">دمای آب هدف بیولوژیکی (°C)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={general.targetWaterTemp}
                    onChange={(e) => setGeneral({ ...general, targetWaterTemp: parseFloat(e.target.value) || 0 })}
                    className="w-full text-xs p-3 rounded-xl border border-natural-border bg-natural-bg/20 focus:outline-none focus:border-natural-forest text-natural-dark font-mono text-left"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-natural-dark block">موبایل پیامک هشدارهای بحرانی</label>
                  <input
                    type="text"
                    value={general.smsAlertNumber}
                    onChange={(e) => setGeneral({ ...general, smsAlertNumber: e.target.value })}
                    className="w-full text-xs p-3 rounded-xl border border-natural-border bg-natural-bg/20 focus:outline-none focus:border-natural-forest text-natural-dark font-mono text-left"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-natural-dark block">زمان‌بندی نسخه پشتیبان خودکار</label>
                  <select
                    value={general.autoBackupInterval}
                    onChange={(e) => setGeneral({ ...general, autoBackupInterval: e.target.value })}
                    className="w-full text-xs p-3 rounded-xl border border-natural-border bg-natural-bg/20 focus:outline-none focus:border-natural-forest text-natural-dark font-bold cursor-pointer"
                  >
                    <option value="hourly">هر ساعت (تست زنده)</option>
                    <option value="daily">روزانه (پیش‌فرض تولید)</option>
                    <option value="weekly">هفتگی</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Section C: IoT Sensors Integration */}
            <div className="space-y-4">
              <h4 className="text-xs font-black text-natural-forest flex items-center gap-2 border-b border-natural-border pb-2">
                <Cpu size={14} />
                بخش سوم: یکپارچه‌سازی حسگرهای فیزیکی و دروازه اینترنت اشیاء (IoT API Gateway)
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-bold text-natural-dark block">آدرس اینترنتی دروازه سنسورها (IoT WebSocket/REST API Endpoint)</label>
                  <input
                    type="text"
                    value={general.iotGatewayUrl}
                    onChange={(e) => setGeneral({ ...general, iotGatewayUrl: e.target.value })}
                    className="w-full text-xs p-3 rounded-xl border border-natural-border bg-natural-bg/20 focus:outline-none focus:border-natural-forest text-natural-dark font-mono text-left"
                    placeholder="https://api.iot-sturgeon-gateway.local:8080/v1"
                  />
                </div>

                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="alertSound"
                    checked={general.alertSoundEnabled}
                    onChange={(e) => setGeneral({ ...general, alertSoundEnabled: e.target.checked })}
                    className="w-4.5 h-4.5 text-natural-forest border-natural-border rounded-lg accent-natural-forest"
                  />
                  <label htmlFor="alertSound" className="text-xs font-bold text-natural-dark cursor-pointer select-none">
                    پخش آژیر هشدار در صورت خرابی آب حوضچه‌ها
                  </label>
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                className="px-6 py-3 bg-natural-forest hover:bg-[#1f352c] text-white text-xs font-black rounded-xl flex items-center gap-2 transition-all cursor-pointer shadow-sm shadow-emerald-950/20 active:scale-98"
              >
                <Save size={14} />
                ذخیره و به روز رسانی کل تنظیمات فارم خاویاری
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB CONTENT: HYDROCHEMISTRY THRESHOLDS */}
      {activeSubTab === "thresholds" && (
        <div className="bg-white rounded-3xl border border-natural-border p-6 lg:p-8 shadow-sm space-y-6">
          <div className="border-b border-natural-border/60 pb-4 flex justify-between items-center">
            <div>
              <h3 className="text-sm font-black text-natural-dark flex items-center gap-2">
                <FlaskConical className="text-natural-forest" size={18} />
                تنظیم دقیق آستانه‌های هشدار هیدروشیمی آب استخرها
              </h3>
              <p className="text-[11px] text-natural-text/60 mt-1">مقادیر خارج از این محدوده‌ها سبب تولید خودکار هشدارهای سیستمی و تغییر رنگ وضعیت استخر به زرد (warning) و قرمز (critical) خواهند شد.</p>
            </div>
            
            <button
              onClick={() => {
                setTempMin(DEFAULT_THRESHOLDS.temperature.min);
                setTempMax(DEFAULT_THRESHOLDS.temperature.max);
                setTempCritMin(DEFAULT_THRESHOLDS.temperature.criticalMin);
                setTempCritMax(DEFAULT_THRESHOLDS.temperature.criticalMax);
                setO2Min(DEFAULT_THRESHOLDS.oxygenLevel.min);
                setO2Max(DEFAULT_THRESHOLDS.oxygenLevel.max);
                setO2CritMin(DEFAULT_THRESHOLDS.oxygenLevel.criticalMin);
                setO2CritMax(DEFAULT_THRESHOLDS.oxygenLevel.criticalMax);
                setPhMin(DEFAULT_THRESHOLDS.phLevel.min);
                setPhMax(DEFAULT_THRESHOLDS.phLevel.max);
                setPhCritMin(DEFAULT_THRESHOLDS.phLevel.criticalMin);
                setPhCritMax(DEFAULT_THRESHOLDS.phLevel.criticalMax);
                setNitriteMax(DEFAULT_THRESHOLDS.nitriteLevel.max);
                setNitriteCritMax(DEFAULT_THRESHOLDS.nitriteLevel.criticalMax);
                setAmmoniaMax(DEFAULT_THRESHOLDS.ammoniaLevel.max);
                setAmmoniaCritMax(DEFAULT_THRESHOLDS.ammoniaLevel.criticalMax);
                showToast("مقادیر به پیش‌فرض علمی بازگردانده شدند.");
              }}
              className="px-3 py-1.5 border border-natural-border hover:bg-natural-khaki/30 text-natural-text text-[10.5px] font-bold rounded-lg flex items-center gap-1 transition-all cursor-pointer"
            >
              <RotateCcw size={12} />
              پیش‌فرض‌های کارخانه
            </button>
          </div>

          <form onSubmit={handleSaveThresholds} className="space-y-6">
            
            {/* TEMPERATURE */}
            <div className="p-5 bg-natural-khaki/20 border border-natural-border/40 rounded-2xl space-y-4">
              <h4 className="text-xs font-black text-natural-dark flex items-center gap-1.5 text-natural-forest">
                <span className="w-1.5 h-3.5 rounded-full bg-natural-forest" />
                ۱. دمای آب استخرها (°C)
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] text-natural-text/60 font-semibold block">حداقل بحرانی (Critical Min)</span>
                  <input type="number" step="0.1" value={tempCritMin} onChange={e => setTempCritMin(Number(e.target.value))} className="w-full text-xs p-2.5 rounded-lg border border-natural-border focus:outline-none font-mono text-left" />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-natural-text/60 font-semibold block">حداقل بهینه (Optimal Min)</span>
                  <input type="number" step="0.1" value={tempMin} onChange={e => setTempMin(Number(e.target.value))} className="w-full text-xs p-2.5 rounded-lg border border-natural-border focus:outline-none font-mono text-left" />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-natural-text/60 font-semibold block">حداکثر بهینه (Optimal Max)</span>
                  <input type="number" step="0.1" value={tempMax} onChange={e => setTempMax(Number(e.target.value))} className="w-full text-xs p-2.5 rounded-lg border border-natural-border focus:outline-none font-mono text-left" />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-natural-text/60 font-semibold block">حداکثر بحرانی (Critical Max)</span>
                  <input type="number" step="0.1" value={tempCritMax} onChange={e => setTempCritMax(Number(e.target.value))} className="w-full text-xs p-2.5 rounded-lg border border-natural-border focus:outline-none font-mono text-left" />
                </div>
              </div>
            </div>

            {/* OXYGEN */}
            <div className="p-5 bg-natural-khaki/20 border border-natural-border/40 rounded-2xl space-y-4">
              <h4 className="text-xs font-black text-natural-dark flex items-center gap-1.5 text-natural-forest">
                <span className="w-1.5 h-3.5 rounded-full bg-natural-forest" />
                ۲. میزان اکسیژن محلول در آب (mg/L یا ppm)
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] text-natural-text/60 font-semibold block">حداقل بحرانی (Critical Min)</span>
                  <input type="number" step="0.1" value={o2CritMin} onChange={e => setO2CritMin(Number(e.target.value))} className="w-full text-xs p-2.5 rounded-lg border border-natural-border focus:outline-none font-mono text-left" />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-natural-text/60 font-semibold block">حداقل بهینه (Optimal Min)</span>
                  <input type="number" step="0.1" value={o2Min} onChange={e => setO2Min(Number(e.target.value))} className="w-full text-xs p-2.5 rounded-lg border border-natural-border focus:outline-none font-mono text-left" />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-natural-text/60 font-semibold block">حداکثر بهینه (Optimal Max)</span>
                  <input type="number" step="0.1" value={o2Max} onChange={e => setO2Max(Number(e.target.value))} className="w-full text-xs p-2.5 rounded-lg border border-natural-border focus:outline-none font-mono text-left" />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-natural-text/60 font-semibold block">حداکثر بحرانی (Critical Max)</span>
                  <input type="number" step="0.1" value={o2CritMax} onChange={e => setO2CritMax(Number(e.target.value))} className="w-full text-xs p-2.5 rounded-lg border border-natural-border focus:outline-none font-mono text-left" />
                </div>
              </div>
            </div>

            {/* pH LEVEL */}
            <div className="p-5 bg-natural-khaki/20 border border-natural-border/40 rounded-2xl space-y-4">
              <h4 className="text-xs font-black text-natural-dark flex items-center gap-1.5 text-natural-forest">
                <span className="w-1.5 h-3.5 rounded-full bg-natural-forest" />
                ۳. میزان اسیدیته آب (pH)
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] text-natural-text/60 font-semibold block">حداقل بحرانی (Critical Min)</span>
                  <input type="number" step="0.1" value={phCritMin} onChange={e => setPhCritMin(Number(e.target.value))} className="w-full text-xs p-2.5 rounded-lg border border-natural-border focus:outline-none font-mono text-left" />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-natural-text/60 font-semibold block">حداقل بهینه (Optimal Min)</span>
                  <input type="number" step="0.1" value={phMin} onChange={e => setPhMin(Number(e.target.value))} className="w-full text-xs p-2.5 rounded-lg border border-natural-border focus:outline-none font-mono text-left" />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-natural-text/60 font-semibold block">حداکثر بهینه (Optimal Max)</span>
                  <input type="number" step="0.1" value={phMax} onChange={e => setPhMax(Number(e.target.value))} className="w-full text-xs p-2.5 rounded-lg border border-natural-border focus:outline-none font-mono text-left" />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-natural-text/60 font-semibold block">حداکثر بحرانی (Critical Max)</span>
                  <input type="number" step="0.1" value={phCritMax} onChange={e => setPhCritMax(Number(e.target.value))} className="w-full text-xs p-2.5 rounded-lg border border-natural-border focus:outline-none font-mono text-left" />
                </div>
              </div>
            </div>

            {/* TOXINS (NITRITE & AMMONIA) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 bg-rose-50/20 border border-rose-100 rounded-2xl space-y-3">
                <h4 className="text-xs font-black text-rose-900 flex items-center gap-1.5">
                  <span className="w-1.5 h-3.5 rounded-full bg-rose-800" />
                  ۴. آمونیاک آزاد غیر یونیزه NH3 (mg/L)
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <span className="text-[9.5px] text-[#A65D50]/80 font-bold block">هشدار (Max Allowed)</span>
                    <input type="number" step="0.001" value={ammoniaMax} onChange={e => setAmmoniaMax(Number(e.target.value))} className="w-full text-xs p-2.5 rounded-lg border border-natural-border focus:outline-none font-mono text-left" />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[9.5px] text-rose-800 font-bold block">بحرانی (Critical Max)</span>
                    <input type="number" step="0.001" value={ammoniaCritMax} onChange={e => setAmmoniaCritMax(Number(e.target.value))} className="w-full text-xs p-2.5 rounded-lg border border-natural-border focus:outline-none font-mono text-left" />
                  </div>
                </div>
              </div>

              <div className="p-5 bg-rose-50/20 border border-rose-100 rounded-2xl space-y-3">
                <h4 className="text-xs font-black text-rose-900 flex items-center gap-1.5">
                  <span className="w-1.5 h-3.5 rounded-full bg-rose-800" />
                  ۵. نیتریت NO2 (mg/L)
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <span className="text-[9.5px] text-[#A65D50]/80 font-bold block">هشدار (Max Allowed)</span>
                    <input type="number" step="0.001" value={nitriteMax} onChange={e => setNitriteMax(Number(e.target.value))} className="w-full text-xs p-2.5 rounded-lg border border-natural-border focus:outline-none font-mono text-left" />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[9.5px] text-rose-800 font-bold block">بحرانی (Critical Max)</span>
                    <input type="number" step="0.001" value={nitriteCritMax} onChange={e => setNitriteCritMax(Number(e.target.value))} className="w-full text-xs p-2.5 rounded-lg border border-natural-border focus:outline-none font-mono text-left" />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                className="px-6 py-3 bg-natural-forest hover:bg-[#1f352c] text-white text-xs font-black rounded-xl flex items-center gap-2 transition-all cursor-pointer shadow-sm shadow-emerald-950/20"
              >
                <Save size={14} />
                به‌روزرسانی و کالیبراسیون مقادیر سیستمی
              </button>
            </div>

          </form>
        </div>
      )}

      {/* TAB CONTENT: ADVANCED OPERATIONS */}
      {activeSubTab === "advanced" && (
        <div className="bg-white rounded-3xl border border-natural-border p-6 lg:p-8 shadow-sm space-y-8">
          
          {/* Section: Backup and Import */}
          <div className="space-y-4">
            <div className="border-b border-natural-border/60 pb-3">
              <h3 className="text-sm font-black text-natural-dark flex items-center gap-2">
                <Download className="text-natural-forest" size={18} />
                نسخه‌های پشتیبان و حفاظت از اطلاعات (Offline Backup)
              </h3>
              <p className="text-[11px] text-natural-text/60 mt-1">امکان استخراج تمام وقایع، بیوماس استخرها و سونوگرافی‌ها جهت بایگانی و انتقال به دیوایس‌های دیگر.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 bg-natural-khaki/25 border border-natural-border rounded-2xl flex flex-col justify-between space-y-4">
                <div>
                  <h4 className="text-xs font-black text-natural-dark">پشتیبان‌گیری کامل (JSON Export)</h4>
                  <p className="text-[10px] text-natural-text/70 mt-1.5 leading-relaxed">
                    یک فایل دانلودی فشرده شامل اطلاعات استخرها، جیره‌های ثبت شده، سونوگرافی‌ها و لاگ‌های زیستی دریافت خواهید کرد. توصیه می‌شود به صورت ماهانه بک‌آپ آفلاین بگیرید.
                  </p>
                </div>
                <button
                  onClick={handleExportBackup}
                  className="w-full py-3 bg-natural-forest hover:bg-[#20362d] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Download size={14} />
                  دانلود فایل پشتیبان کارگاهی (.json)
                </button>
              </div>

              <div className="p-5 bg-natural-khaki/25 border border-natural-border rounded-2xl flex flex-col justify-between space-y-4">
                <div>
                  <h4 className="text-xs font-black text-natural-dark">بازیابی اطلاعات پشتیبان (JSON Import)</h4>
                  <p className="text-[10px] text-natural-text/70 mt-1.5 leading-relaxed">
                    با آپلود فایل پشتیبان با پسوند .json، کل داده‌های جاری با فایل بارگذاری شده همگام خواهند شد و برنامه مجددا لود می‌شود.
                  </p>
                </div>
                <label className="w-full py-3 bg-[#D68227]/10 hover:bg-[#D68227]/20 text-[#D68227] text-xs font-bold rounded-xl border border-dashed border-[#D68227]/40 flex items-center justify-center gap-1.5 transition-colors cursor-pointer text-center">
                  <Upload size={14} />
                  <span>انتخاب و بارگذاری فایل پشتیبان</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportBackup}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Section: Calibration and Factory Reset */}
          <div className="space-y-4">
            <div className="border-b border-natural-border/60 pb-3">
              <h3 className="text-sm font-black text-natural-dark flex items-center gap-2">
                <Cpu className="text-natural-forest" size={18} />
                کالیبراسیون سخت‌افزارها و گزینه‌های اضطراری
              </h3>
              <p className="text-[11px] text-natural-text/60 mt-1">تست ارتباط با سنسورهای فیزیکی کارگاه و ابزار بازنشانی اضطراری.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 border border-natural-border/80 rounded-2xl flex flex-col justify-between space-y-4">
                <div>
                  <h4 className="text-xs font-black text-natural-dark">کالیبره زنده سنسورهای دیجیتال</h4>
                  <p className="text-[10px] text-natural-text/70 mt-1.5 leading-relaxed">
                    سنجش میزان نویز و کالیبراسیون الکترودهای دما، pH و پتانسیومتر سنسورهای مستغرق در آب خروجی سالن‌ها با فواصل مبدا سنجی.
                  </p>
                </div>
                <button
                  onClick={handleSensorCalibration}
                  disabled={isCalibrating}
                  className={`w-full py-3 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                    isCalibrating
                      ? "bg-natural-khaki/40 text-natural-text/40 cursor-wait"
                      : "bg-[#D68227] hover:bg-[#c67721] text-white"
                  }`}
                >
                  <RefreshCw size={14} className={isCalibrating ? "animate-spin" : ""} />
                  {isCalibrating ? "در حال کالیبره کردن سنسورها..." : "شروع کالیبراسیون و همگام‌سازی حسگرها"}
                </button>
              </div>

              <div className="p-5 bg-rose-50/10 border border-rose-100 rounded-2xl flex flex-col justify-between space-y-4">
                <div>
                  <h4 className="text-xs font-black text-rose-950 flex items-center gap-1.5">
                    <AlertTriangle size={14} className="text-rose-700" />
                    پاکسازی کامل پایگاه داده جاری (Factory Reset)
                  </h4>
                  <p className="text-[10px] text-rose-900/80 mt-1.5 leading-relaxed">
                    این عمل تمام رکوردهای استخرها، سالن‌ها، آمار آزمایشگاه، خریدهای خوراک، محاسبات FCR و گزارش‌های ثبت شده در سیستم را به طور دائم از مرورگر پاک خواهد کرد.
                  </p>
                </div>
                <button
                  onClick={handleFactoryReset}
                  className="w-full py-3 bg-rose-700 hover:bg-rose-800 text-white text-xs font-black rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-sm shadow-rose-950/20"
                >
                  <RotateCcw size={14} />
                  بازنشانی کارگاه به تنظیمات اولیه کارخانه
                </button>
              </div>

              {isAdmin && (
                <div className="p-5 bg-amber-50/10 border border-amber-200 rounded-2xl flex flex-col justify-between space-y-4 md:col-span-2">
                  <div>
                    <h4 className="text-xs font-black text-amber-950 flex items-center gap-1.5">
                      <FolderSync size={14} className="text-amber-700" />
                      بازنشانی اطلاعات پیش‌فرض (Reset Raw Data)
                    </h4>
                    <p className="text-[10px] text-amber-900/80 mt-1.5 leading-relaxed">
                      این عمل تمامی اطلاعات سفارشی، لاگ‌های آزمایشگاهی و تغییرات را حذف کرده و اطلاعات فارم را به گله‌ها و سالن‌های خام اولیه بازنشانی می‌کند. (مخصوص مدیریت ارشد)
                    </p>
                  </div>
                  <button
                    onClick={handleResetRawData}
                    className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white text-xs font-black rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-sm shadow-amber-950/20"
                  >
                    <FolderSync size={14} />
                    بازنشانی به داده‌های خام و پیش‌فرض اولیه
                  </button>
                </div>
              )}
            </div>
          </div>

        </div>
      )}

      {/* TAB CONTENT: SYNC SYSTEM */}
      {activeSubTab === "sync" && (
        <NetworkSyncManager onSyncComplete={onReloadData} />
      )}

    </div>
  );
};
