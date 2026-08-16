import React, { useEffect, useState } from "react";
import { 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  Server, 
  Smartphone, 
  CheckCircle2, 
  Info, 
  Copy, 
  HelpCircle 
} from "lucide-react";
import { SturgeonRepository } from "../storage/repository";
import { ConnectionSettings, getConnectionSettings, getApiUrl, saveConnectionSettings } from "../network/connection";

interface NetworkSyncManagerProps {
  onSyncComplete?: () => void;
}

export const NetworkSyncManager: React.FC<NetworkSyncManagerProps> = ({ onSyncComplete }) => {
  const [syncStatus, setSyncStatus] = useState<"synced" | "syncing" | "offline">("synced");
  const [lastSynced, setLastSynced] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [localIp, setLocalIp] = useState<string>("در حال دریافت...");
  const [showHelp, setShowHelp] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [connection, setConnection] = useState<ConnectionSettings>(() => getConnectionSettings());
  const [connectionMessage, setConnectionMessage] = useState<string>("");

  const testConnection = async () => {
    try {
      saveConnectionSettings(connection);
      const response = await fetch(getApiUrl("/api/health"), { signal: AbortSignal.timeout(5000) });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      setConnectionMessage("اتصال سرور با موفقیت برقرار شد.");
    } catch (error) { setConnectionMessage(error instanceof Error ? error.message : "اتصال برقرار نشد."); }
  };

  // Perform synchronization
  const performSync = async (silent: boolean = false) => {
    if (!silent) setSyncStatus("syncing");
    const result = await SturgeonRepository.syncWithServer();
    if (result.success) {
      setSyncStatus("synced");
      setErrorMessage("");
      if (result.lastSynced) {
        const time = new Date(result.lastSynced).toLocaleTimeString("fa-IR", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit"
        });
        setLastSynced(time);
      } else {
        setLastSynced(new Date().toLocaleTimeString("fa-IR"));
      }
      if (onSyncComplete) {
        onSyncComplete();
      }
    } else {
      setSyncStatus("offline");
      setErrorMessage(result.error || "خطای ارتباط با سرور مرکزی");
    }
  };

  const pendingQueue = SturgeonRepository.getPendingQueue();

  // Run periodic sync
  useEffect(() => {
    // Initial sync
    performSync(true);

    const interval = setInterval(() => {
      performSync(true);
    }, 6000); // sync every 6 seconds

    // Try to guess/get Server IP for help guide
    // In typical local deployments, the host is window.location.hostname
    const hostname = window.location.hostname;
    if (hostname === "localhost" || hostname === "127.0.0.1") {
      setLocalIp("192.168.1.100 (مثال)");
    } else {
      setLocalIp(hostname);
    }

    return () => clearInterval(interval);
  }, []);

  const handleCopyLink = () => {
    const port = window.location.port ? `:${window.location.port}` : "";
    const url = `${window.location.protocol}//${window.location.hostname}${port}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getUrlToShare = () => {
    const port = window.location.port ? `:${window.location.port}` : "";
    return `http://${window.location.hostname}${port}`;
  };

  return (
    <div className="bg-white border border-natural-border rounded-3xl p-5 shadow-sm space-y-4 text-start">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-natural-border pb-4">
        <div className="flex items-center gap-2.5">
          <div className={`p-2 rounded-xl ${
            syncStatus === "synced" ? "bg-emerald-50 text-emerald-700" :
            syncStatus === "syncing" ? "bg-amber-50 text-amber-700 animate-pulse" :
            "bg-rose-50 text-rose-700"
          }`}>
            <Server size={18} />
          </div>
          <div>
            <h3 className="text-xs font-black text-natural-dark">سرور محلی و همگام‌سازی شبکه داخلی</h3>
            <p className="text-[10px] text-natural-text/60 mt-0.5">اتصال زنده تلفن همراه پرسنل و یکپارچه‌سازی متمرکز اطلاعات</p>
          </div>
        </div>

        {/* Action / Badge */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          {syncStatus === "synced" && (
            <span className="inline-flex items-center gap-1 py-1 px-2.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-full">
              <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-ping"></span>
              شبکه متصل و همگام
            </span>
          )}
          {syncStatus === "syncing" && (
            <span className="inline-flex items-center gap-1 py-1 px-2.5 bg-amber-50 text-amber-700 text-[10px] font-bold rounded-full">
              <RefreshCw size={10} className="animate-spin" />
              در حال انتقال داده‌ها...
            </span>
          )}
          {syncStatus === "offline" && (
            <span className="inline-flex items-center gap-1 py-1 px-2.5 bg-rose-50 text-rose-700 text-[10px] font-bold rounded-full">
              <WifiOff size={10} />
              آفلاین (ذخیره محلی)
            </span>
          )}

          <button
            onClick={() => performSync(false)}
            disabled={syncStatus === "syncing"}
            className="p-1.5 text-natural-text hover:text-natural-dark bg-natural-bg/50 hover:bg-natural-bg border border-natural-border rounded-lg transition-colors cursor-pointer"
            title="همگام‌سازی دستی"
          >
            <RefreshCw size={14} className={syncStatus === "syncing" ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* Main Stats Block */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 p-3 bg-natural-bg/20 border border-natural-border/60 rounded-2xl" data-connection-settings>
        <label className="text-[10px] font-bold">پروتکل<select value={connection.protocol} onChange={e => setConnection({ ...connection, protocol: e.target.value as "http" | "https" })} className="mt-1 w-full rounded-lg border p-2 text-xs"><option value="http">HTTP</option><option value="https">HTTPS</option></select></label>
        <label className="text-[10px] font-bold">سرور<input value={connection.host} disabled={connection.useSameOrigin} onChange={e => setConnection({ ...connection, host: e.target.value })} className="mt-1 w-full rounded-lg border p-2 text-xs" /></label>
        <label className="text-[10px] font-bold">پورت<input type="number" min="1" max="65535" value={connection.port} disabled={connection.useSameOrigin} onChange={e => setConnection({ ...connection, port: Number(e.target.value) })} className="mt-1 w-full rounded-lg border p-2 text-xs" /></label>
        <div className="flex flex-col justify-end gap-2"><label className="text-[10px] font-bold"><input type="checkbox" checked={connection.useSameOrigin} onChange={e => setConnection({ ...connection, useSameOrigin: e.target.checked })} /> استفاده از همین سرور</label><button onClick={testConnection} className="rounded-lg bg-natural-dark text-white px-3 py-2 text-xs font-bold">ذخیره و تست اتصال</button>{connectionMessage && <span className="text-[10px]">{connectionMessage}</span>}</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Sync Status Details */}
        <div className="bg-natural-bg/20 border border-natural-border/60 rounded-2xl p-4 flex flex-col justify-between space-y-3">
          <div className="space-y-1">
            <span className="text-[9px] text-natural-text/50 font-bold block uppercase tracking-wider">بروزرسانی مرکزی پایگاه داده</span>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-black text-natural-dark font-mono">{lastSynced || "---"}</span>
              <span className="text-[10px] text-natural-text/60">آخرین همگام‌سازی موفق</span>
            </div>
          </div>
          
          {errorMessage ? (
            <div className="text-[10px] text-rose-700 bg-rose-50/50 p-2 rounded-xl border border-rose-100 leading-relaxed">
              <strong>علت قطعی:</strong> {errorMessage}. نگران نباشید؛ داده‌ها در حافظه مرورگر شما به صورت امن نگهداری می‌شوند و با اولین اتصال سرور، خودکار همگام‌سازی خواهند شد.
            </div>
          ) : (
            <div className="text-[10px] text-emerald-800 bg-emerald-50/40 p-2 rounded-xl border border-emerald-100/60 leading-relaxed flex items-center gap-1.5">
              <CheckCircle2 size={12} className="text-emerald-700 shrink-0" />
              تمام ورودی‌های ثبت‌شده حوضچه‌ها، دوزهای غذایی و لاگ‌های آزمایشگاهی با سرور مرکزی ست شده‌اند.
            </div>
          )}
        </div>

        {/* Mobile Connection Info */}
        <div className="bg-natural-bg/20 border border-natural-border/60 rounded-2xl p-4 flex flex-col justify-between space-y-3">
          <div className="space-y-1">
            <span className="text-[9px] text-natural-text/50 font-bold block uppercase tracking-wider">راهنمای اتصال موبایل پرسنل شیفت</span>
            <div className="flex items-center gap-1.5 text-natural-dark">
              <Smartphone size={16} className="text-natural-forest" />
              <span className="text-xs font-black">اتصال بی‌سیم از طریق وای‌فای (Wi-Fi)</span>
            </div>
          </div>

          <div className="text-[10px] text-natural-text leading-relaxed">
            جهت دسترسی سایر همکاران و ثبت مستقیم اطلاعات با موبایل، کافیست دستگاه‌ها به <strong className="text-natural-dark">یک شبکه Wi-Fi مشترک</strong> متصل باشند.
          </div>

          <div className="flex items-center gap-2 bg-white border border-natural-border rounded-xl p-2 justify-between">
            <span className="text-[11px] font-mono font-bold text-natural-dark select-all truncate ltr block" dir="ltr">
              {getUrlToShare()}
            </span>
            <button
              onClick={handleCopyLink}
              className="p-1 text-natural-text hover:text-natural-dark bg-natural-bg/40 border border-natural-border rounded transition-colors text-[9px] flex items-center gap-1 cursor-pointer font-bold shrink-0"
            >
              <Copy size={11} />
              {copied ? "کپی شد" : "کپی لینک"}
            </button>
          </div>
        </div>
      </div>

      {/* Deployment / Instruction Accordion */}
      <div className="border border-natural-border rounded-2xl overflow-hidden">
        <button
          onClick={() => setShowHelp(!showHelp)}
          className="w-full p-3 bg-natural-bg/30 hover:bg-natural-bg/50 transition-colors flex items-center justify-between text-xs font-bold text-natural-dark cursor-pointer"
        >
          <span className="flex items-center gap-1.5">
            <HelpCircle size={14} className="text-natural-forest" />
            راهنمای گام‌به‌گام راه‌اندازی و نصب روی سرور حاشیه فارم فتحی
          </span>
          <span className="text-[10px] text-natural-text/60">
            {showHelp ? "بستن راهنما" : "نمایش راهنما"}
          </span>
        </button>

        {showHelp && (
          <div className="p-4 bg-white border-t border-natural-border text-[11px] text-natural-text/80 space-y-3.5 leading-relaxed">
            <div className="space-y-1">
              <h4 className="font-black text-natural-dark text-xs flex items-center gap-1 text-natural-forest">
                ۱. پیش‌نیازهای اولیه سرور محلی:
              </h4>
              <p>
                یک سیستم کامپیوتر معمولی یا سرور کوچک متصل به مودم وای‌فای کارگاه تهیه کنید. روی آن محیط <strong className="text-natural-dark">Node.js (نسخه ۱۸ یا بالاتر)</strong> را نصب کنید.
              </p>
            </div>

            <div className="space-y-1">
              <h4 className="font-black text-natural-dark text-xs flex items-center gap-1 text-natural-forest">
                ۲. استخراج و راه‌اندازی پروژه:
              </h4>
              <p>
                فایل‌های پروژه را روی سرور کپی کرده و در ترمینال (CMD) دستورات زیر را برای نصب وابستگی‌ها و تولید فایل نهایی به ترتیب بنویسید:
              </p>
              <pre className="p-2.5 bg-neutral-900 text-neutral-100 font-mono text-[9px] rounded-lg ltr text-left block overflow-x-auto select-all">
                # 1. Install dependencies{"\n"}
                npm install{"\n\n"}
                # 2. Build for production{"\n"}
                npm run build{"\n\n"}
                # 3. Start the production server{"\n"}
                npm start
              </pre>
            </div>

            <div className="space-y-1">
              <h4 className="font-black text-natural-dark text-xs flex items-center gap-1 text-natural-forest">
                ۳. آدرس یابی و دسترسی گوشی‌ها:
              </h4>
              <p>
                پس از اجرای <code className="font-mono text-natural-dark bg-natural-bg px-1 rounded text-[10px]">npm start</code>، برنامه روی پورت <code className="font-mono text-natural-dark bg-natural-bg px-1 rounded text-[10px]">3000</code> لیسن می‌کند. آی‌پی محلی سیستم خود را پیدا کنید (مانند <code className="font-mono text-natural-dark">192.168.1.100</code>) و سایر پرسنل با گوشی خود آدرس زیر را وارد کنند:
              </p>
              <div className="p-2 bg-emerald-50 text-emerald-950 font-bold text-center rounded-lg border border-emerald-100 font-mono text-[11px] ltr select-all" dir="ltr">
                http://[SERVER-IP-ADDRESS]:3000
              </div>
            </div>

            <div className="bg-amber-50/40 p-3 rounded-xl border border-amber-200 text-amber-950 text-[10px] leading-relaxed">
              ⚠️ <strong>نکته حیاتی برای همگام‌سازی:</strong> این سامانه طوری مهندسی شده که حتی با رفتن ناگهانی برق یا قطع کامل مودم وای‌فای، پرسنل می‌توانند در تاریکی سالن به ثبت اطلاعات بپردازند و هر زمان اتصال وای‌فای احیا شد، کل دیتای وارد شده با سرور مرکزی ادغام و ذخیره دائمی خواهد شد.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
