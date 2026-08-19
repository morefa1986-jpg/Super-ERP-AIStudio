import { useState } from "react";
import { Megaphone, X } from "lucide-react";
import App from "./App";
import SocialMediaCenter from "./components/SocialMediaCenter";

export default function AppShell() {
  const [socialOpen, setSocialOpen] = useState(false);

  return (
    <>
      <App />

      <button
        type="button"
        onClick={() => setSocialOpen(true)}
        className="fixed left-4 bottom-4 z-[70] px-4 py-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-2xl border border-cyan-300 flex items-center gap-2 text-xs font-black transition-all print:hidden"
        aria-label="باز کردن مرکز شبکه‌های اجتماعی"
      >
        <Megaphone size={17} />
        مرکز شبکه‌های اجتماعی
      </button>

      {socialOpen && (
        <div className="fixed inset-0 z-[90] bg-slate-950/85 backdrop-blur-md p-2 sm:p-4 lg:p-6 overflow-y-auto print:hidden" dir="rtl">
          <div className="max-w-[1600px] mx-auto relative">
            <button
              type="button"
              onClick={() => setSocialOpen(false)}
              className="sticky top-2 z-[95] mr-auto mb-2 p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 shadow-lg flex items-center gap-2 text-xs font-bold"
            >
              <X size={15} />
              بستن
            </button>
            <SocialMediaCenter />
          </div>
        </div>
      )}
    </>
  );
}
