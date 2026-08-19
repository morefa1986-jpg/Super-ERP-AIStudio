import React, { useEffect, useMemo, useState } from "react";
import {
  CalendarClock,
  CheckCircle2,
  CircleAlert,
  Facebook,
  Image as ImageIcon,
  Inbox,
  Instagram,
  Linkedin,
  Loader2,
  MessageCircle,
  RefreshCw,
  Send,
  Settings2,
  ShieldCheck,
  Sparkles,
  Upload,
} from "lucide-react";
import { formatJalaliDateTime, toPersianDigits } from "../utils/persianFormat";

type ProviderId = "instagram" | "facebook" | "linkedin" | "telegram" | "website";
type ContentType = "post" | "story" | "reel";
type QueueStatus = "draft" | "queued" | "published" | "failed";
type InboxType = "comment" | "direct";

interface ProviderState {
  id: ProviderId;
  label: string;
  connected: boolean;
  accountName?: string;
  capabilities: ContentType[];
  lastSync?: string;
}

interface QueueItem {
  id: string;
  createdAt: string;
  scheduledAt?: string;
  caption: string;
  mediaName?: string;
  contentType: ContentType;
  providers: ProviderId[];
  status: QueueStatus;
  error?: string;
}

interface InboxItem {
  id: string;
  provider: ProviderId;
  type: InboxType;
  sender: string;
  text: string;
  createdAt: string;
  replied: boolean;
  replyText?: string;
}

const PROVIDERS: ProviderState[] = [
  { id: "instagram", label: "Instagram", connected: false, capabilities: ["post", "story", "reel"] },
  { id: "facebook", label: "Facebook", connected: false, capabilities: ["post", "story", "reel"] },
  { id: "linkedin", label: "LinkedIn", connected: false, capabilities: ["post"] },
  { id: "telegram", label: "Telegram", connected: false, capabilities: ["post"] },
  { id: "website", label: "وب‌سایت مجموعه", connected: false, capabilities: ["post"] },
];

const providerIcon = (id: ProviderId) => {
  if (id === "instagram") return <Instagram size={16} />;
  if (id === "facebook") return <Facebook size={16} />;
  if (id === "linkedin") return <Linkedin size={16} />;
  if (id === "telegram") return <Send size={16} />;
  return <ImageIcon size={16} />;
};

const safeJson = <T,>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
};

const localReplySuggestion = (text: string) => {
  const normalized = text.toLowerCase();
  if (normalized.includes("قیمت") || normalized.includes("خرید") || normalized.includes("ارسال")) {
    return "سلام، ممنون از پیام شما. برای اعلام قیمت و شرایط ارسال، لطفاً نوع محصول و مقدار موردنظر را بفرمایید تا همکار فروش دقیق راهنمایی کند.";
  }
  if (normalized.includes("بازدید") || normalized.includes("مزرعه") || normalized.includes("آدرس")) {
    return "سلام، ممنون از توجه شما. برای هماهنگی بازدید از مجموعه، لطفاً نام، شماره تماس و زمان پیشنهادی خود را ارسال کنید تا هماهنگی انجام شود.";
  }
  if (normalized.includes("پرورش") || normalized.includes("مشاوره") || normalized.includes("ماهی")) {
    return "سلام، سپاس از پیام شما. لطفاً موضوع مشاوره، گونه ماهی و مرحله پرورش را بفرمایید تا پاسخ تخصصی‌تری ارائه شود.";
  }
  return "سلام، ممنون از پیام شما. پیام شما دریافت شد و پس از بررسی، پاسخ دقیق برایتان ارسال می‌شود.";
};

export default function SocialMediaCenter() {
  const [providers, setProviders] = useState<ProviderState[]>(() => safeJson("fathi_social_providers_v1", PROVIDERS));
  const [queue, setQueue] = useState<QueueItem[]>(() => safeJson("fathi_social_queue_v1", []));
  const [inbox, setInbox] = useState<InboxItem[]>(() => safeJson("fathi_social_inbox_v1", []));
  const [caption, setCaption] = useState("");
  const [contentType, setContentType] = useState<ContentType>("post");
  const [selectedProviders, setSelectedProviders] = useState<ProviderId[]>(["instagram"]);
  const [scheduledAt, setScheduledAt] = useState("");
  const [mediaName, setMediaName] = useState("");
  const [selectedInboxId, setSelectedInboxId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => localStorage.setItem("fathi_social_providers_v1", JSON.stringify(providers)), [providers]);
  useEffect(() => localStorage.setItem("fathi_social_queue_v1", JSON.stringify(queue)), [queue]);
  useEffect(() => localStorage.setItem("fathi_social_inbox_v1", JSON.stringify(inbox)), [inbox]);

  const connectedCount = providers.filter((p) => p.connected).length;
  const pendingInbox = inbox.filter((x) => !x.replied).length;
  const scheduledCount = queue.filter((x) => x.status === "queued").length;
  const publishedCount = queue.filter((x) => x.status === "published").length;

  const selectedInbox = useMemo(() => inbox.find((x) => x.id === selectedInboxId) || null, [inbox, selectedInboxId]);

  const apiRequest = async (path: string, init?: RequestInit) => {
    const response = await fetch(`/api/social${path}`, {
      ...init,
      headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  };

  const refreshConnections = async () => {
    setIsSyncing(true);
    setNotice("");
    try {
      const result = await apiRequest("/providers");
      if (Array.isArray(result?.providers)) {
        setProviders(PROVIDERS.map((base) => {
          const remote = result.providers.find((p: any) => p.id === base.id);
          return remote ? { ...base, ...remote } : base;
        }));
        setNotice("وضعیت اتصال حساب‌ها از درگاه امن سرور به‌روزرسانی شد.");
      }
    } catch {
      setNotice("درگاه رسمی شبکه‌های اجتماعی هنوز روی سرور پیکربندی نشده است؛ برنامه در حالت آفلاین/صف محلی کار می‌کند و اتصال جعلی نمایش داده نمی‌شود.");
    } finally {
      setIsSyncing(false);
    }
  };

  const refreshInbox = async () => {
    setIsSyncing(true);
    setNotice("");
    try {
      const result = await apiRequest("/inbox");
      if (Array.isArray(result?.items)) {
        setInbox(result.items);
        setNotice("کامنت‌ها و دایرکت‌ها همگام‌سازی شدند.");
      }
    } catch {
      setNotice("Inbox رسمی در دسترس نیست. پس از تنظیم کلیدهای API روی سرور، کامنت‌ها و دایرکت‌ها از همین صفحه همگام می‌شوند.");
    } finally {
      setIsSyncing(false);
    }
  };

  const toggleProvider = (id: ProviderId) => {
    setSelectedProviders((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };

  const createContent = async (publishNow: boolean) => {
    if (!caption.trim()) {
      setNotice("متن پست را وارد کنید.");
      return;
    }
    if (selectedProviders.length === 0) {
      setNotice("حداقل یک شبکه را انتخاب کنید.");
      return;
    }

    const item: QueueItem = {
      id: `social-${Date.now()}`,
      createdAt: new Date().toISOString(),
      scheduledAt: publishNow ? undefined : scheduledAt || undefined,
      caption: caption.trim(),
      mediaName: mediaName || undefined,
      contentType,
      providers: selectedProviders,
      status: publishNow ? "queued" : scheduledAt ? "queued" : "draft",
    };

    setQueue((prev) => [item, ...prev]);

    if (publishNow) {
      try {
        const result = await apiRequest("/publish", { method: "POST", body: JSON.stringify(item) });
        setQueue((prev) => prev.map((x) => x.id === item.id ? { ...x, status: result?.success ? "published" : "failed", error: result?.error } : x));
        setNotice(result?.success ? "انتشار از طریق API رسمی انجام شد." : "انتشار انجام نشد و وضعیت خطا در صف ثبت شد.");
      } catch {
        setNotice("محتوا در صف محلی ذخیره شد. برای انتشار واقعی باید حساب رسمی شبکه اجتماعی در سرور متصل باشد.");
      }
    } else {
      setNotice(scheduledAt ? "محتوا برای انتشار زمان‌بندی‌شده در صف قرار گرفت." : "پیش‌نویس ذخیره شد.");
    }

    setCaption("");
    setMediaName("");
    setScheduledAt("");
  };

  const openInboxItem = (item: InboxItem) => {
    setSelectedInboxId(item.id);
    setReplyText(item.replyText || localReplySuggestion(item.text));
  };

  const sendReply = async () => {
    if (!selectedInbox || !replyText.trim()) return;
    try {
      const result = await apiRequest(`/inbox/${selectedInbox.id}/reply`, {
        method: "POST",
        body: JSON.stringify({ reply: replyText.trim(), provider: selectedInbox.provider }),
      });
      if (!result?.success) throw new Error("reply failed");
      setNotice("پاسخ از طریق حساب رسمی ارسال شد.");
    } catch {
      setNotice("پاسخ به‌صورت محلی ثبت شد؛ ارسال واقعی پس از فعال شدن اتصال رسمی API انجام می‌شود.");
    }
    setInbox((prev) => prev.map((x) => x.id === selectedInbox.id ? { ...x, replied: true, replyText: replyText.trim() } : x));
    setSelectedInboxId(null);
    setReplyText("");
  };

  return (
    <div dir="rtl" className="min-h-[680px] bg-slate-950 text-slate-100 rounded-3xl border border-slate-800 overflow-hidden">
      <header className="p-5 border-b border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-950/95">
        <div>
          <div className="flex items-center gap-2 text-cyan-300 text-xs font-black"><Sparkles size={16}/> مرکز شبکه‌های اجتماعی و ارتباط با مشتری</div>
          <h2 className="text-xl font-black mt-1">انتشار، زمان‌بندی، کامنت و دایرکت در یک صفحه</h2>
          <p className="text-[11px] text-slate-400 mt-1">فقط اتصال‌های واقعی API به‌عنوان «متصل» نمایش داده می‌شوند؛ اطلاعات محرمانه در مرورگر ذخیره نمی‌شوند.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={refreshConnections} disabled={isSyncing} className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold flex items-center gap-2 disabled:opacity-50"><RefreshCw size={14}/>{isSyncing ? "در حال بررسی" : "بررسی اتصال‌ها"}</button>
          <button onClick={refreshInbox} disabled={isSyncing} className="px-3 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 text-xs font-black flex items-center gap-2 disabled:opacity-50"><Inbox size={14}/> همگام‌سازی Inbox</button>
        </div>
      </header>

      {notice && <div className="mx-5 mt-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs leading-6 flex items-start gap-2"><CircleAlert size={15} className="mt-1 shrink-0"/><span>{notice}</span></div>}

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 p-5">
        {[
          ["حساب متصل", connectedCount, <ShieldCheck size={18}/>],
          ["پیام بی‌پاسخ", pendingInbox, <MessageCircle size={18}/>],
          ["در صف انتشار", scheduledCount, <CalendarClock size={18}/>],
          ["منتشرشده", publishedCount, <CheckCircle2 size={18}/>],
        ].map(([label, value, icon]: any) => <div key={label} className="bg-slate-900 border border-slate-800 rounded-2xl p-4"><div className="text-slate-400 text-[10px] flex items-center gap-2">{icon}{label}</div><strong className="text-2xl block mt-2">{toPersianDigits(value)}</strong></div>)}
      </section>

      <section className="px-5 pb-5 grid grid-cols-1 xl:grid-cols-12 gap-4">
        <div className="xl:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-4">
          <div className="flex items-center justify-between"><h3 className="font-black text-sm">ساخت و انتشار محتوا</h3><span className="text-[10px] text-slate-500">Post / Story / Reel</span></div>

          <div className="grid grid-cols-3 gap-2">
            {(["post", "story", "reel"] as ContentType[]).map((type) => <button key={type} onClick={() => setContentType(type)} className={`py-2 rounded-xl text-xs font-bold border ${contentType === type ? "bg-cyan-500 text-slate-950 border-cyan-400" : "bg-slate-950 border-slate-700 text-slate-300"}`}>{type === "post" ? "پست" : type === "story" ? "استوری" : "ریل"}</button>)}
          </div>

          <textarea value={caption} onChange={(e) => setCaption(e.target.value)} rows={6} placeholder="کپشن فارسی، توضیح محصول، خبر مزرعه یا متن آموزشی را بنویسید..." className="w-full bg-slate-950 border border-slate-700 rounded-2xl p-4 text-sm outline-none focus:border-cyan-500 resize-none" />

          <label className="flex items-center justify-center gap-2 min-h-20 border border-dashed border-slate-700 rounded-2xl cursor-pointer hover:border-cyan-500 bg-slate-950 text-xs text-slate-400">
            <Upload size={16}/>{mediaName ? `فایل انتخابی: ${mediaName}` : "انتخاب عکس یا ویدئو برای آماده‌سازی محتوا"}
            <input type="file" accept="image/*,video/*" className="hidden" onChange={(e) => setMediaName(e.target.files?.[0]?.name || "")} />
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
            {providers.map((provider) => {
              const compatible = provider.capabilities.includes(contentType);
              const selected = selectedProviders.includes(provider.id);
              return <button key={provider.id} disabled={!compatible} onClick={() => toggleProvider(provider.id)} className={`p-3 rounded-xl border text-[10px] font-bold flex items-center justify-center gap-2 disabled:opacity-30 ${selected ? "bg-cyan-500/15 text-cyan-200 border-cyan-500/50" : "bg-slate-950 text-slate-400 border-slate-700"}`}>{providerIcon(provider.id)}{provider.label}</button>;
            })}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div><label className="text-[10px] text-slate-400 block mb-1">زمان انتشار اختیاری</label><input type="datetime-local" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs" /></div>
            <div className="flex items-end gap-2"><button onClick={() => createContent(false)} className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-bold">ذخیره / زمان‌بندی</button><button onClick={() => createContent(true)} className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-black flex items-center justify-center gap-2"><Send size={13}/> انتشار اکنون</button></div>
          </div>
        </div>

        <div className="xl:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between"><h3 className="font-black text-sm flex items-center gap-2"><Inbox size={16}/> Inbox یکپارچه</h3><span className="text-[10px] text-slate-500">کامنت و دایرکت</span></div>
          <div className="max-h-[520px] overflow-y-auto divide-y divide-slate-800">
            {inbox.length === 0 ? <div className="p-8 text-center text-slate-500 text-xs leading-6">هنوز پیامی همگام‌سازی نشده است. پس از اتصال رسمی Instagram/Facebook/LinkedIn، پیام‌ها و کامنت‌های واقعی اینجا نمایش داده می‌شوند.</div> : inbox.map((item) => <button key={item.id} onClick={() => openInboxItem(item)} className="w-full text-right p-4 hover:bg-slate-800/60 transition-colors"><div className="flex items-center justify-between gap-2"><span className="text-xs font-black">{item.sender}</span><span className={`text-[9px] px-2 py-0.5 rounded-full ${item.replied ? "bg-emerald-500/10 text-emerald-300" : "bg-amber-500/10 text-amber-300"}`}>{item.replied ? "پاسخ داده شد" : "نیاز به پاسخ"}</span></div><p className="text-[11px] text-slate-300 mt-2 line-clamp-2">{item.text}</p><div className="mt-2 text-[9px] text-slate-500 flex items-center gap-2">{providerIcon(item.provider)}<span>{item.type === "direct" ? "دایرکت" : "کامنت"}</span><span>•</span><span>{formatJalaliDateTime(item.createdAt)}</span></div></button>)}
          </div>
        </div>
      </section>

      <section className="px-5 pb-5 grid grid-cols-1 xl:grid-cols-12 gap-4">
        <div className="xl:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <h3 className="font-black text-sm mb-3">صف انتشار و تقویم محتوا</h3>
          <div className="overflow-x-auto"><table className="w-full text-xs"><thead className="text-slate-500"><tr><th className="text-right py-2">زمان</th><th className="text-right">نوع</th><th className="text-right">شبکه‌ها</th><th className="text-right">وضعیت</th></tr></thead><tbody>{queue.slice(0, 12).map((item) => <tr key={item.id} className="border-t border-slate-800"><td className="py-3">{formatJalaliDateTime(item.scheduledAt || item.createdAt)}</td><td>{item.contentType === "post" ? "پست" : item.contentType === "story" ? "استوری" : "ریل"}</td><td>{item.providers.map((x) => providers.find((p) => p.id === x)?.label).join("، ")}</td><td><span className={`px-2 py-1 rounded-lg text-[10px] ${item.status === "published" ? "bg-emerald-500/10 text-emerald-300" : item.status === "failed" ? "bg-rose-500/10 text-rose-300" : "bg-cyan-500/10 text-cyan-300"}`}>{item.status === "published" ? "منتشرشده" : item.status === "failed" ? "خطا" : item.status === "draft" ? "پیش‌نویس" : "در صف"}</span></td></tr>)}</tbody></table></div>
        </div>

        <div className="xl:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <h3 className="font-black text-sm mb-3 flex items-center gap-2"><Settings2 size={15}/> وضعیت اتصال رسمی</h3>
          <div className="space-y-2">{providers.map((provider) => <div key={provider.id} className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between gap-3"><div className="flex items-center gap-2"><span className="text-slate-300">{providerIcon(provider.id)}</span><div><span className="text-xs font-bold block">{provider.label}</span><span className="text-[9px] text-slate-500">{provider.accountName || "حساب رسمی تعریف نشده"}</span></div></div><span className={`text-[9px] px-2 py-1 rounded-full ${provider.connected ? "bg-emerald-500/10 text-emerald-300" : "bg-slate-800 text-slate-400"}`}>{provider.connected ? "متصل" : "قطع"}</span></div>)}</div>
          <p className="text-[10px] text-slate-500 leading-5 mt-3">توکن‌ها و Secretهای شبکه‌های اجتماعی باید فقط در سرور و متغیرهای محیطی نگهداری شوند. این صفحه عمداً رمز یا Token را در LocalStorage ذخیره نمی‌کند.</p>
        </div>
      </section>

      {selectedInbox && <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"><div className="w-full max-w-xl bg-slate-900 border border-slate-700 rounded-3xl p-5"><h3 className="font-black">پاسخ به {selectedInbox.sender}</h3><p className="text-xs text-slate-300 bg-slate-950 rounded-xl p-3 mt-3 leading-6">{selectedInbox.text}</p><label className="text-[10px] text-cyan-300 mt-4 mb-1 flex items-center gap-1"><Sparkles size={12}/> پاسخ پیشنهادی — قبل از ارسال قابل ویرایش است</label><textarea value={replyText} onChange={(e) => setReplyText(e.target.value)} rows={5} className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs outline-none focus:border-cyan-500"/><div className="flex gap-2 mt-4"><button onClick={() => { setSelectedInboxId(null); setReplyText(""); }} className="flex-1 py-2.5 rounded-xl bg-slate-800 text-xs font-bold">انصراف</button><button onClick={sendReply} className="flex-1 py-2.5 rounded-xl bg-cyan-500 text-slate-950 text-xs font-black">تأیید و ارسال پاسخ</button></div></div></div>}
    </div>
  );
}
