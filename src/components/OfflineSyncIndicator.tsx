/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { SturgeonRepository } from "../storage/repository";
import { Wifi, WifiOff, RefreshCw, CheckCircle2, CloudUpload, AlertTriangle, X } from "lucide-react";

interface OfflineSyncIndicatorProps {
  onDataSynced?: () => void;
}

export const OfflineSyncIndicator: React.FC<OfflineSyncIndicatorProps> = ({ onDataSynced }) => {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [showToast, setShowToast] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>("");
  const [toastType, setToastType] = useState<"success" | "warning" | "offline">("success");

  const checkPendingAndSync = async (autoTrigger: boolean = false) => {
    const queue = SturgeonRepository.getPendingQueue();
    setPendingCount(queue.length);

    if (navigator.onLine) {
      if (queue.length > 0 || autoTrigger) {
        setIsSyncing(true);
        const result = await SturgeonRepository.syncWithServer();
        setIsSyncing(false);

        if (result.success) {
          const syncedCount = queue.length;
          setPendingCount(0);
          if (syncedCount > 0) {
            setToastMessage(`🌐 اتصال برقرار شد؛ ${syncedCount} تغییر ثبت‌شده در زمان قطعی به طور خودکار به سرور منتقل گردید.`);
            setToastType("success");
            setShowToast(true);
            setTimeout(() => setShowToast(false), 6000);
          }
          if (onDataSynced) onDataSynced();
        } else {
          setToastMessage("خطا در ارسال داده‌ها به سرور. اطلاعات در حافظه محلی محفوظ است.");
          setToastType("warning");
          setShowToast(true);
          setTimeout(() => setShowToast(false), 5000);
        }
      }
    }
  };

  useEffect(() => {
    // Initial check
    checkPendingAndSync();

    const handleOnline = () => {
      setIsOnline(true);
      checkPendingAndSync(true);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setToastMessage("⚠️ ارتباط با شبکه قطع شد؛ تمامی تغییرات به صورت آفلاین در دستگاه شما ذخیره می‌شوند.");
      setToastType("offline");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 6000);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Periodic check every 8 seconds
    const interval = setInterval(() => {
      const queue = SturgeonRepository.getPendingQueue();
      setPendingCount(queue.length);
      setIsOnline(navigator.onLine);
      if (navigator.onLine && queue.length > 0 && !isSyncing) {
        checkPendingAndSync();
      }
    }, 8000);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      clearInterval(interval);
    };
  }, []);

  return (
    <>
      {/* FLOATING RECONNECTION TOAST NOTIFICATION */}
      {showToast && (
        <div className="fixed top-4 right-4 left-4 sm:left-auto sm:right-6 sm:max-w-md z-[9999] transition-all animate-bounce-in">
          <div className={`p-3.5 rounded-2xl border shadow-xl flex items-start gap-3 text-xs font-bold font-sans dir-rtl ${
            toastType === "success" 
              ? "bg-slate-900/95 border-emerald-500/50 text-emerald-300 backdrop-blur-md"
              : toastType === "offline"
              ? "bg-slate-900/95 border-amber-500/50 text-amber-300 backdrop-blur-md"
              : "bg-slate-900/95 border-rose-500/50 text-rose-300 backdrop-blur-md"
          }`} dir="rtl">
            {toastType === "success" && <CheckCircle2 size={18} className="text-emerald-400 shrink-0 mt-0.5" />}
            {toastType === "offline" && <WifiOff size={18} className="text-amber-400 shrink-0 mt-0.5" />}
            {toastType === "warning" && <AlertTriangle size={18} className="text-rose-400 shrink-0 mt-0.5" />}

            <div className="flex-grow">
              <span className="block text-[10px] text-slate-400">سامانه همگام‌سازی آفلاین/آنلاین</span>
              <p className="mt-0.5 text-[11px] leading-relaxed">{toastMessage}</p>
            </div>

            <button 
              onClick={() => setShowToast(false)}
              className="p-1 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      {/* HEADER CONNECTION STATUS BADGE */}
      <div className="flex items-center gap-2">
        {!isOnline ? (
          <div 
            onClick={() => checkPendingAndSync(true)}
            className="px-3 py-1.5 bg-amber-500/15 border border-amber-500/40 text-amber-300 rounded-2xl text-[10px] font-bold flex items-center gap-1.5 cursor-pointer hover:bg-amber-500/25 transition-all shadow-xs"
            title="کلیک جهت امتحان مجدد همگام‌سازی با سرور"
          >
            <WifiOff size={12} className="text-amber-400 animate-pulse" />
            <span>آفلاین (ذخیره محلی)</span>
            {pendingCount > 0 && (
              <span className="px-1.5 py-0.2 bg-amber-500 text-slate-950 font-mono text-[9px] font-black rounded-full">
                {pendingCount} در صف
              </span>
            )}
          </div>
        ) : pendingCount > 0 ? (
          <button
            onClick={() => checkPendingAndSync(true)}
            disabled={isSyncing}
            className="px-3 py-1.5 bg-cyan-500/15 border border-cyan-500/40 text-cyan-300 rounded-2xl text-[10px] font-bold flex items-center gap-1.5 hover:bg-cyan-500/25 transition-all cursor-pointer shadow-xs"
          >
            {isSyncing ? (
              <RefreshCw size={12} className="text-cyan-400 animate-spin" />
            ) : (
              <CloudUpload size={12} className="text-cyan-400" />
            )}
            <span>{isSyncing ? "در حال انتقال به سرور..." : "انتقال داده‌ها به سرور"}</span>
            <span className="px-1.5 py-0.2 bg-cyan-500 text-slate-950 font-mono text-[9px] font-black rounded-full">
              {pendingCount}
            </span>
          </button>
        ) : (
          <div className="px-2.5 py-1.2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-2xl text-[10px] font-bold flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" />
            <Wifi size={11} className="text-emerald-400" />
            <span className="hidden sm:inline">شبکه همگام</span>
          </div>
        )}
      </div>
    </>
  );
};
