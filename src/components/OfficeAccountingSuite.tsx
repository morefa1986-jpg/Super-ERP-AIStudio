import React, { useMemo, useState } from "react";
import {
  BellRing, CarFront, CheckCircle2, Copy, FileDown, FilePlus2, FileText,
  Link2, Paperclip, Plus, Printer, Search, Send, Trash2, XCircle,
} from "lucide-react";
import {
  calculateInvoiceTotals, formatIranPlate, jalaliFromIso, numberToPersianWords,
  validateIranMobile, validateIranPlate,
} from "../core/officeAccounting";

type Attachment = { id: string; name: string; type: string; size: number; dataUrl: string };
type Letter = {
  id: string; direction: "incoming" | "outgoing"; number: string; dateGregorian: string; dateJalali: string;
  subject: string; senderName: string; senderRole: string; receiverName: string; receiverRole: string;
  priority: "normal" | "urgent" | "very_urgent"; category: "administrative" | "financial" | "technical" | "contractual" | "other";
  parentId?: string; dueDate?: string; status: "open" | "answered" | "closed"; notes: string; attachments: Attachment[]; createdAt: string;
};
type InvoiceItem = { id: string; description: string; unit: string; quantity: number; unitPrice: number; discount: number };
type Invoice = {
  id: string; kind: "invoice" | "proforma"; direction: "issued" | "received"; number: string; issueDate: string; dueDate: string;
  customerName: string; nationalId: string; address: string; phone: string; items: InvoiceItem[]; vatRate: number;
  status: "draft" | "issued" | "cancelled"; originalId?: string; letterhead: boolean; notes: string; createdAt: string;
};
type PlateParts = { iran: string; letter: string; three: string; two: string };
type VehicleLog = {
  id: string; entryAt: string; entryJalali: string; exitAt?: string; exitJalali?: string; plate: PlateParts; vehicleType: string;
  inboundWaybill: string; transportOrder: string; driverName: string; driverPhone: string; ownerName: string; ownerPhone: string;
  origin: string; destination: string; cargoType: string; cargoWeightKg: number; warehouseReceipt: string;
  outboundWaybill?: string; outboundPermit?: string; exitWeightKg?: number; deliveryStatus: "at_site" | "delivered" | "in_transit" | "returned";
  attachments: Attachment[]; notes: string; createdAt: string;
};

const LETTER_KEY = "caviar_office_letters_v1";
const INVOICE_KEY = "caviar_invoices_v1";
const VEHICLE_KEY = "caviar_cargo_vehicles_v1";
const inputClass = "w-full rounded-xl border border-natural-border bg-white px-3 py-2 text-xs text-natural-dark outline-none focus:ring-2 focus:ring-amber-500/30";
const labelClass = "mb-1 block text-[10px] font-black text-natural-text/75";

function readStored<T>(key: string, fallback: T): T {
  try { return JSON.parse(localStorage.getItem(key) || "") as T; } catch { return fallback; }
}
function persist<T>(key: string, value: T, setter: React.Dispatch<React.SetStateAction<T>>) {
  localStorage.setItem(key, JSON.stringify(value)); setter(value);
}
function id(prefix: string) { return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`; }
function escapeHtml(value: unknown) {
  return String(value ?? "").replace(/[&<>'"]/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[char]!));
}
function downloadCsv(fileName: string, headers: string[], rows: unknown[][]) {
  const csv = [headers, ...rows].map(row => row.map(cell => `"${String(cell ?? "").replace(/"/g, '""')}"`).join(",")).join("\r\n");
  const url = URL.createObjectURL(new Blob(["\ufeff", csv], { type: "text/csv;charset=utf-8" }));
  const anchor = document.createElement("a"); anchor.href = url; anchor.download = fileName; anchor.click(); URL.revokeObjectURL(url);
}
function printDocument(title: string, body: string) {
  const popup = window.open("", "_blank", "width=1000,height=760");
  if (!popup) return alert("اجازه بازشدن پنجره چاپ را در مرورگر فعال کنید.");
  popup.document.write(`<!doctype html><html dir="rtl" lang="fa"><head><meta charset="utf-8"><title>${escapeHtml(title)}</title><style>body{font-family:Tahoma,Arial;padding:32px;color:#17202a}h1{text-align:center;font-size:20px}table{width:100%;border-collapse:collapse;margin-top:20px}th,td{border:1px solid #999;padding:8px;font-size:11px;text-align:right}.meta{display:grid;grid-template-columns:1fr 1fr;gap:8px}.total{font-weight:bold;font-size:14px;margin-top:18px}@media print{button{display:none}}</style></head><body><h1>${escapeHtml(title)}</h1>${body}<script>onload=()=>{print()}<\/script></body></html>`);
  popup.document.close();
}
async function readAttachments(files: FileList | null): Promise<Attachment[]> {
  if (!files) return [];
  const selected = [...files];
  if (selected.some(file => file.size > 3 * 1024 * 1024)) throw new Error("حداکثر حجم هر پیوست ۳ مگابایت است.");
  return Promise.all(selected.map(file => new Promise<Attachment>((resolve, reject) => {
    const reader = new FileReader(); reader.onerror = () => reject(reader.error); reader.onload = () => resolve({ id: id("att"), name: file.name, type: file.type, size: file.size, dataUrl: String(reader.result) }); reader.readAsDataURL(file);
  })));
}
const blankItem = (): InvoiceItem => ({ id: id("line"), description: "", unit: "عدد", quantity: 1, unitPrice: 0, discount: 0 });

export default function OfficeAccountingSuite() {
  const [tab, setTab] = useState<"letters" | "invoices" | "vehicles">("letters");
  const [letters, setLetters] = useState<Letter[]>(() => readStored(LETTER_KEY, []));
  const [invoices, setInvoices] = useState<Invoice[]>(() => readStored(INVOICE_KEY, []));
  const [vehicles, setVehicles] = useState<VehicleLog[]>(() => readStored(VEHICLE_KEY, []));
  const [query, setQuery] = useState("");
  const nowLocal = new Date(Date.now() - new Date().getTimezoneOffset() * 60_000).toISOString().slice(0, 16);

  const [letter, setLetter] = useState<Omit<Letter, "id" | "createdAt" | "attachments">>({ direction: "incoming", number: "", dateGregorian: new Date().toISOString().slice(0, 10), dateJalali: jalaliFromIso(new Date().toISOString()), subject: "", senderName: "", senderRole: "", receiverName: "", receiverRole: "", priority: "normal", category: "administrative", status: "open", notes: "" });
  const [letterFiles, setLetterFiles] = useState<FileList | null>(null);
  const [invoice, setInvoice] = useState<Omit<Invoice, "id" | "createdAt">>({ kind: "proforma", direction: "issued", number: "", issueDate: new Date().toISOString().slice(0, 10), dueDate: "", customerName: "", nationalId: "", address: "", phone: "", items: [blankItem()], vatRate: 10, status: "draft", letterhead: true, notes: "" });
  const [editingInvoiceId, setEditingInvoiceId] = useState<string | null>(null);
  const [vehicle, setVehicle] = useState<Omit<VehicleLog, "id" | "createdAt" | "attachments">>({ entryAt: nowLocal, entryJalali: jalaliFromIso(nowLocal), plate: { iran: "11", letter: "ب", three: "", two: "" }, vehicleType: "کامیون", inboundWaybill: "", transportOrder: "", driverName: "", driverPhone: "", ownerName: "", ownerPhone: "", origin: "", destination: "", cargoType: "", cargoWeightKg: 0, warehouseReceipt: "", deliveryStatus: "at_site", notes: "" });
  const [vehicleFiles, setVehicleFiles] = useState<FileList | null>(null);

  const filteredLetters = useMemo(() => letters.filter(item => JSON.stringify(item).toLowerCase().includes(query.toLowerCase())), [letters, query]);
  const filteredInvoices = useMemo(() => invoices.filter(item => JSON.stringify(item).toLowerCase().includes(query.toLowerCase())), [invoices, query]);
  const filteredVehicles = useMemo(() => vehicles.filter(item => JSON.stringify(item).toLowerCase().includes(query.toLowerCase())), [vehicles, query]);
  const totals = calculateInvoiceTotals(invoice.items, invoice.vatRate);

  const saveLetter = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!letter.number.trim() || !letter.subject.trim() || !letter.senderName.trim() || !letter.receiverName.trim() || !letter.dateGregorian || !letter.dateJalali) return alert("تمام فیلدهای الزامی نامه را تکمیل کنید.");
    try {
      const attachments = await readAttachments(letterFiles);
      const record: Letter = { ...letter, id: id("letter"), attachments, createdAt: new Date().toISOString() };
      persist(LETTER_KEY, [record, ...letters], setLetters);
      setLetter(prev => ({ ...prev, number: "", subject: "", senderName: "", senderRole: "", receiverName: "", receiverRole: "", parentId: undefined, dueDate: undefined, notes: "" }));
      setLetterFiles(null); alert("نامه در دفتر اندیکاتور ثبت شد.");
    } catch (error) { alert(error instanceof Error ? error.message : "خطا در پیوست فایل"); }
  };
  const saveInvoice = (event: React.FormEvent) => {
    event.preventDefault();
    if (!invoice.customerName.trim() || !invoice.issueDate || invoice.items.some(item => !item.description.trim() || item.quantity <= 0)) return alert("اطلاعات مشتری و تمام ردیف‌های فاکتور را کامل کنید.");
    const number = invoice.number.trim() || `${invoice.kind === "invoice" ? "INV" : "PRO"}-${new Date().getFullYear()}-${String(invoices.length + 1).padStart(5, "0")}`;
    if (editingInvoiceId) {
      persist(INVOICE_KEY, invoices.map(record => record.id === editingInvoiceId ? { ...record, ...invoice, number } : record), setInvoices);
    } else {
      persist(INVOICE_KEY, [{ ...invoice, id: id("invoice"), number, createdAt: new Date().toISOString() }, ...invoices], setInvoices);
    }
    setEditingInvoiceId(null);
    setInvoice(prev => ({ ...prev, number: "", customerName: "", nationalId: "", address: "", phone: "", items: [blankItem()], status: "draft", notes: "" }));
    alert("سند مالی ذخیره شد.");
  };
  const saveVehicle = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validateIranPlate(vehicle.plate)) return alert("شماره پلاک کامل و معتبر وارد کنید.");
    if (!validateIranMobile(vehicle.driverPhone)) return alert("شماره تماس راننده باید ۱۱ رقمی و با 09 شروع شود.");
    if (vehicle.ownerPhone && !validateIranMobile(vehicle.ownerPhone)) return alert("شماره تماس صاحب بار معتبر نیست.");
    if (!vehicle.driverName || !vehicle.ownerName || !vehicle.origin || !vehicle.destination || !vehicle.cargoType || vehicle.cargoWeightKg <= 0) return alert("فیلدهای ضروری تردد و محموله را تکمیل کنید.");
    try {
      const attachments = await readAttachments(vehicleFiles);
      persist(VEHICLE_KEY, [{ ...vehicle, id: id("vehicle"), attachments, createdAt: new Date().toISOString() }, ...vehicles], setVehicles);
      setVehicle(prev => ({ ...prev, plate: { ...prev.plate, three: "", two: "" }, inboundWaybill: "", transportOrder: "", driverName: "", driverPhone: "", ownerName: "", ownerPhone: "", origin: "", destination: "", cargoType: "", cargoWeightKg: 0, warehouseReceipt: "", notes: "" }));
      setVehicleFiles(null); alert("ورود خودرو و محموله ثبت شد.");
    } catch (error) { alert(error instanceof Error ? error.message : "خطا در پیوست فایل"); }
  };

  const invoicePrint = (record: Invoice) => {
    const sum = calculateInvoiceTotals(record.items, record.vatRate);
    const rows = record.items.map((item, index) => { const line = sum.lines[index]; return `<tr><td>${index + 1}</td><td>${escapeHtml(item.description)}</td><td>${escapeHtml(item.unit)}</td><td>${item.quantity}</td><td>${item.unitPrice.toLocaleString()}</td><td>${line.gross.toLocaleString()}</td><td>${item.discount.toLocaleString()}</td><td>${line.final.toLocaleString()}</td></tr>`; }).join("");
    printDocument(`${record.kind === "invoice" ? "فاکتور رسمی" : "پیش‌فاکتور"} ${record.number}`, `${record.letterhead ? '<h2 style="text-align:center">مزرعه تولید و پرورش ماهیان خاویاری فتحی</h2>' : ""}<div class="meta"><div>خریدار: ${escapeHtml(record.customerName)}</div><div>شناسه: ${escapeHtml(record.nationalId)}</div><div>تاریخ صدور: ${escapeHtml(record.issueDate)}</div><div>سررسید: ${escapeHtml(record.dueDate)}</div><div>تلفن: ${escapeHtml(record.phone)}</div><div>آدرس: ${escapeHtml(record.address)}</div></div><table><thead><tr><th>ردیف</th><th>شرح</th><th>واحد</th><th>تعداد</th><th>قیمت واحد</th><th>مبلغ کل</th><th>تخفیف</th><th>نهایی</th></tr></thead><tbody>${rows}</tbody></table><div class="total">جمع: ${sum.subtotal.toLocaleString()} — تخفیف: ${sum.discount.toLocaleString()} — ارزش افزوده: ${sum.vat.toLocaleString()} — قابل پرداخت: ${sum.payable.toLocaleString()} تومان</div><p>به حروف: ${numberToPersianWords(sum.payable)} تومان</p>`);
  };

  return <section className="space-y-5 rounded-3xl border border-amber-200 bg-amber-50/40 p-4" dir="rtl">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div><h2 className="flex items-center gap-2 text-sm font-black text-amber-950"><FileText size={18}/> اتوماسیون اداری، فاکتورها و تردد بار</h2><p className="mt-1 text-[10px] text-natural-text/65">ذخیره کاملاً آفلاین، مشمول بک‌آپ نسخه‌دار و قابل جستجو</p></div>
      <div className="flex rounded-xl border border-amber-200 bg-white p-1 text-[10px] font-black">
        <button onClick={() => setTab("letters")} className={`rounded-lg px-3 py-2 ${tab === "letters" ? "bg-amber-700 text-white" : ""}`}>دفتر اندیکاتور</button>
        <button onClick={() => setTab("invoices")} className={`rounded-lg px-3 py-2 ${tab === "invoices" ? "bg-amber-700 text-white" : ""}`}>فاکتور و پیش‌فاکتور</button>
        <button onClick={() => setTab("vehicles")} className={`rounded-lg px-3 py-2 ${tab === "vehicles" ? "bg-amber-700 text-white" : ""}`}>تردد خودروهای بار</button>
      </div>
    </div>
    <div className="relative"><Search className="absolute right-3 top-2.5 text-natural-text/40" size={14}/><input value={query} onChange={e => setQuery(e.target.value)} className={`${inputClass} pr-9`} placeholder="جستجوی پیشرفته در تمام فیلدهای بخش فعال..."/></div>

    {tab === "letters" && <div className="space-y-4">
      <form onSubmit={saveLetter} className="grid grid-cols-1 gap-3 rounded-2xl border border-natural-border bg-white p-4 md:grid-cols-4">
        <Field label="نوع نامه"><select className={inputClass} value={letter.direction} onChange={e => setLetter({ ...letter, direction: e.target.value as Letter["direction"] })}><option value="incoming">ورودی</option><option value="outgoing">خروجی</option></select></Field>
        <Field label="شماره نامه *"><input required className={inputClass} value={letter.number} onChange={e => setLetter({ ...letter, number: e.target.value })}/></Field>
        <Field label="تاریخ میلادی *"><input required type="date" className={inputClass} value={letter.dateGregorian} onChange={e => setLetter({ ...letter, dateGregorian: e.target.value, dateJalali: jalaliFromIso(e.target.value) })}/></Field>
        <Field label="تاریخ شمسی *"><input required className={inputClass} value={letter.dateJalali} onChange={e => setLetter({ ...letter, dateJalali: e.target.value })} placeholder="۱۴۰۵/۰۵/۲۳"/></Field>
        <Field label="موضوع نامه *" wide><input required className={inputClass} value={letter.subject} onChange={e => setLetter({ ...letter, subject: e.target.value })}/></Field>
        <Field label="نام فرستنده *"><input required className={inputClass} value={letter.senderName} onChange={e => setLetter({ ...letter, senderName: e.target.value })}/></Field>
        <Field label="سمت فرستنده"><input className={inputClass} value={letter.senderRole} onChange={e => setLetter({ ...letter, senderRole: e.target.value })}/></Field>
        <Field label="نام گیرنده *"><input required className={inputClass} value={letter.receiverName} onChange={e => setLetter({ ...letter, receiverName: e.target.value })}/></Field>
        <Field label="سمت گیرنده"><input className={inputClass} value={letter.receiverRole} onChange={e => setLetter({ ...letter, receiverRole: e.target.value })}/></Field>
        <Field label="اولویت"><select className={inputClass} value={letter.priority} onChange={e => setLetter({ ...letter, priority: e.target.value as Letter["priority"] })}><option value="normal">عادی</option><option value="urgent">فوری</option><option value="very_urgent">خیلی فوری</option></select></Field>
        <Field label="طبقه‌بندی"><select className={inputClass} value={letter.category} onChange={e => setLetter({ ...letter, category: e.target.value as Letter["category"] })}><option value="administrative">اداری</option><option value="financial">مالی</option><option value="technical">فنی</option><option value="contractual">قراردادی</option><option value="other">سایر</option></select></Field>
        <Field label="پاسخ به نامه"><select className={inputClass} value={letter.parentId || ""} onChange={e => setLetter({ ...letter, parentId: e.target.value || undefined })}><option value="">بدون نامه مادر</option>{letters.map(item => <option key={item.id} value={item.id}>{item.number} — {item.subject}</option>)}</select></Field>
        <Field label="موعد پیگیری Tickler"><input type="date" className={inputClass} value={letter.dueDate || ""} onChange={e => setLetter({ ...letter, dueDate: e.target.value || undefined })}/></Field>
        <Field label="پیوست PDF، تصویر یا سند" wide><input type="file" multiple accept=".pdf,image/*,.doc,.docx,.xls,.xlsx" className={inputClass} onChange={e => setLetterFiles(e.target.files)}/></Field>
        <Field label="یادداشت" wide><input className={inputClass} value={letter.notes} onChange={e => setLetter({ ...letter, notes: e.target.value })}/></Field>
        <button className="col-span-full flex items-center justify-center gap-2 rounded-xl bg-amber-700 py-2.5 text-xs font-black text-white"><FilePlus2 size={15}/> ثبت نامه و کاربرگ پیگیری</button>
      </form>
      <Toolbar onExcel={() => downloadCsv("indicator-letters.csv", ["نوع","شماره","شمسی","میلادی","موضوع","فرستنده","گیرنده","اولویت","دسته","موعد","وضعیت"], filteredLetters.map(x => [x.direction,x.number,x.dateJalali,x.dateGregorian,x.subject,`${x.senderName} ${x.senderRole}`,`${x.receiverName} ${x.receiverRole}`,x.priority,x.category,x.dueDate,x.status]))} onPrint={() => printDocument("گزارش دفتر اندیکاتور", `<table><tr><th>شماره</th><th>تاریخ</th><th>موضوع</th><th>فرستنده</th><th>گیرنده</th><th>پیگیری</th></tr>${filteredLetters.map(x => `<tr><td>${escapeHtml(x.number)}</td><td>${escapeHtml(x.dateJalali)}</td><td>${escapeHtml(x.subject)}</td><td>${escapeHtml(x.senderName)}</td><td>${escapeHtml(x.receiverName)}</td><td>${escapeHtml(x.dueDate || "-")}</td></tr>`).join("")}</table>`)}/>
      <div className="grid gap-3">{filteredLetters.map(item => <article key={item.id} className="rounded-2xl border border-natural-border bg-white p-3 text-xs"><div className="flex flex-wrap justify-between gap-2"><div className="font-black text-natural-dark">{item.direction === "incoming" ? "📥" : "📤"} {item.number} — {item.subject}</div><span className={item.priority === "very_urgent" ? "text-rose-700" : item.priority === "urgent" ? "text-orange-700" : "text-emerald-700"}>{item.priority === "very_urgent" ? "خیلی فوری" : item.priority === "urgent" ? "فوری" : "عادی"}</span></div><div className="mt-2 grid gap-1 text-[10px] text-natural-text/70 md:grid-cols-3"><span>{item.dateJalali} | {item.dateGregorian}</span><span>از: {item.senderName} ({item.senderRole || "—"})</span><span>به: {item.receiverName} ({item.receiverRole || "—"})</span>{item.dueDate && <span className="font-black text-rose-700"><BellRing size={11} className="inline"/> موعد پاسخ: {item.dueDate}</span>}<span><Paperclip size={11} className="inline"/> {item.attachments.length} پیوست</span>{item.parentId && <span><Link2 size={11} className="inline"/> پاسخ زنجیره‌ای</span>}</div>{item.attachments.length > 0 && <div className="mt-2 flex flex-wrap gap-1">{item.attachments.map(file => <a key={file.id} href={file.dataUrl} download={file.name} className="rounded bg-slate-100 px-2 py-1 text-[9px] text-blue-700">{file.name}</a>)}</div>}<div className="mt-2 flex gap-2"><button onClick={() => persist(LETTER_KEY, letters.map(x => x.id === item.id ? { ...x, status: "answered" } : x), setLetters)} className="rounded-lg bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-800">ثبت پاسخ</button><button onClick={() => persist(LETTER_KEY, letters.filter(x => x.id !== item.id), setLetters)} className="text-rose-600"><Trash2 size={13}/></button></div></article>)}</div>
    </div>}

    {tab === "invoices" && <div className="space-y-4">
      <form onSubmit={saveInvoice} className="space-y-3 rounded-2xl border border-natural-border bg-white p-4">
        <label className={labelClass}>ویرایش سند موجود
          <select className={inputClass} value={editingInvoiceId || ""} onChange={event => {
            const selected = invoices.find(record => record.id === event.target.value);
            if (!selected) { setEditingInvoiceId(null); return; }
            const { id: selectedId, createdAt: _createdAt, ...editable } = selected;
            setInvoice(editable); setEditingInvoiceId(selectedId);
          }}><option value="">سند جدید</option>{invoices.map(record => <option key={record.id} value={record.id}>{record.number} — {record.customerName}</option>)}</select>
        </label>
        <div className="grid gap-3 md:grid-cols-4"><Field label="نوع سند"><select className={inputClass} value={invoice.kind} onChange={e => setInvoice({ ...invoice, kind: e.target.value as Invoice["kind"] })}><option value="proforma">پیش‌فاکتور</option><option value="invoice">فاکتور رسمی</option></select></Field><Field label="جهت"><select className={inputClass} value={invoice.direction} onChange={e => setInvoice({ ...invoice, direction: e.target.value as Invoice["direction"] })}><option value="issued">صادره</option><option value="received">دریافتی</option></select></Field><Field label="شماره (خالی = خودکار)"><input className={inputClass} value={invoice.number} onChange={e => setInvoice({ ...invoice, number: e.target.value })}/></Field><Field label="وضعیت"><select className={inputClass} value={invoice.status} onChange={e => setInvoice({ ...invoice, status: e.target.value as Invoice["status"] })}><option value="draft">پیش‌نویس</option><option value="issued">صادرشده</option></select></Field><Field label="تاریخ صدور *"><input required type="date" className={inputClass} value={invoice.issueDate} onChange={e => setInvoice({ ...invoice, issueDate: e.target.value })}/></Field><Field label="تاریخ سررسید"><input type="date" className={inputClass} value={invoice.dueDate} onChange={e => setInvoice({ ...invoice, dueDate: e.target.value })}/></Field><Field label="نام خریدار/مشتری *"><input required className={inputClass} value={invoice.customerName} onChange={e => setInvoice({ ...invoice, customerName: e.target.value })}/></Field><Field label="کد ملی/شناسه ملی"><input className={inputClass} value={invoice.nationalId} onChange={e => setInvoice({ ...invoice, nationalId: e.target.value })}/></Field><Field label="تلفن"><input className={inputClass} value={invoice.phone} onChange={e => setInvoice({ ...invoice, phone: e.target.value })}/></Field><Field label="آدرس" wide><input className={inputClass} value={invoice.address} onChange={e => setInvoice({ ...invoice, address: e.target.value })}/></Field><Field label="ارزش افزوده %"><input type="number" min="0" className={inputClass} value={invoice.vatRate} onChange={e => setInvoice({ ...invoice, vatRate: Number(e.target.value) })}/></Field></div>
        <div className="overflow-x-auto"><table className="w-full min-w-[850px] text-right text-[10px]"><thead><tr><th>شرح کالا/خدمت</th><th>واحد</th><th>تعداد</th><th>قیمت واحد</th><th>مبلغ کل</th><th>تخفیف</th><th>نهایی</th><th></th></tr></thead><tbody>{invoice.items.map((item, index) => { const line = totals.lines[index]; const update = (values: Partial<InvoiceItem>) => setInvoice({ ...invoice, items: invoice.items.map(x => x.id === item.id ? { ...x, ...values } : x) }); return <tr key={item.id}><td><input required className={inputClass} value={item.description} onChange={e => update({ description: e.target.value })}/></td><td><input className={inputClass} value={item.unit} onChange={e => update({ unit: e.target.value })}/></td><td><input type="number" min="0.001" step="0.001" className={inputClass} value={item.quantity} onChange={e => update({ quantity: Number(e.target.value) })}/></td><td><input type="number" min="0" className={inputClass} value={item.unitPrice} onChange={e => update({ unitPrice: Number(e.target.value) })}/></td><td className="px-2 font-mono">{line.gross.toLocaleString()}</td><td><input type="number" min="0" className={inputClass} value={item.discount} onChange={e => update({ discount: Number(e.target.value) })}/></td><td className="px-2 font-mono font-black">{line.final.toLocaleString()}</td><td><button type="button" onClick={() => setInvoice({ ...invoice, items: invoice.items.filter(x => x.id !== item.id) })} className="text-rose-600"><Trash2 size={13}/></button></td></tr>; })}</tbody></table></div>
        <button type="button" onClick={() => setInvoice({ ...invoice, items: [...invoice.items, blankItem()] })} className="flex items-center gap-1 rounded-lg bg-amber-50 px-3 py-2 text-[10px] font-black text-amber-900"><Plus size={13}/> افزودن ردیف</button>
        <div className="grid gap-2 rounded-xl bg-slate-50 p-3 text-[11px] md:grid-cols-5"><span>جمع: {totals.subtotal.toLocaleString()}</span><span>تخفیف: {totals.discount.toLocaleString()}</span><span>ارزش افزوده: {totals.vat.toLocaleString()}</span><span className="font-black">قابل پرداخت: {totals.payable.toLocaleString()}</span><span className="md:col-span-5">به حروف: {numberToPersianWords(totals.payable)} تومان</span></div>
        <label className="flex items-center gap-2 text-[10px] font-bold"><input type="checkbox" checked={invoice.letterhead} onChange={e => setInvoice({ ...invoice, letterhead: e.target.checked })}/> چاپ روی سربرگ رسمی مجموعه</label><button className="w-full rounded-xl bg-amber-700 py-2.5 text-xs font-black text-white">{editingInvoiceId ? "ثبت ویرایش سند" : "ذخیره فاکتور / پیش‌فاکتور"}</button>
      </form>
      <Toolbar onExcel={() => downloadCsv("invoices.csv", ["شماره","نوع","جهت","تاریخ","سررسید","مشتری","شناسه","وضعیت","مبلغ"], filteredInvoices.map(x => [x.number,x.kind,x.direction,x.issueDate,x.dueDate,x.customerName,x.nationalId,x.status,calculateInvoiceTotals(x.items,x.vatRate).payable]))} onPrint={() => printDocument("گزارش فاکتورها", `<table>${filteredInvoices.map(x => `<tr><td>${escapeHtml(x.number)}</td><td>${escapeHtml(x.customerName)}</td><td>${escapeHtml(x.issueDate)}</td><td>${calculateInvoiceTotals(x.items,x.vatRate).payable.toLocaleString()}</td><td>${escapeHtml(x.status)}</td></tr>`).join("")}</table>`)}/>
      <div className="overflow-x-auto rounded-2xl border border-natural-border bg-white"><table className="w-full min-w-[900px] text-right text-[10px]"><thead><tr><th className="p-3">شماره</th><th>نوع</th><th>مشتری</th><th>صدور/سررسید</th><th>مبلغ</th><th>وضعیت</th><th>عملیات</th></tr></thead><tbody>{filteredInvoices.map(record => { const amount = calculateInvoiceTotals(record.items,record.vatRate).payable; const overdue = record.dueDate && record.dueDate < new Date().toISOString().slice(0,10) && record.status === "issued"; return <tr key={record.id} className="border-t"><td className="p-3 font-mono font-black">{record.number}</td><td>{record.kind === "invoice" ? "فاکتور" : "پیش‌فاکتور"}</td><td>{record.customerName}</td><td>{record.issueDate}<br/>{record.dueDate || "—"}</td><td className="font-mono font-black">{amount.toLocaleString()}</td><td className={overdue ? "text-rose-700" : ""}>{record.status === "cancelled" ? "باطل" : overdue ? "معوقه" : record.status === "draft" ? "پیش‌نویس" : "صادرشده"}</td><td><div className="flex gap-2"><button title="چاپ/PDF" onClick={() => invoicePrint(record)}><Printer size={14}/></button>{record.kind === "proforma" && <button title="تبدیل به فاکتور" onClick={() => persist(INVOICE_KEY,[{...record,id:id("invoice"),kind:"invoice",number:`INV-${Date.now().toString().slice(-6)}`,originalId:record.id,status:"issued",createdAt:new Date().toISOString()},...invoices],setInvoices)}><Send size={14}/></button>}<button title="نسخه تکثیر" onClick={() => persist(INVOICE_KEY,[{...record,id:id("invoice"),number:`${record.number}-COPY`,originalId:record.id,status:"draft",createdAt:new Date().toISOString()},...invoices],setInvoices)}><Copy size={14}/></button><button title="ابطال" onClick={() => persist(INVOICE_KEY,invoices.map(x => x.id === record.id ? {...x,status:"cancelled"} : x),setInvoices)}><XCircle size={14} className="text-rose-600"/></button></div></td></tr>; })}</tbody></table></div>
    </div>}

    {tab === "vehicles" && <div className="space-y-4">
      <form onSubmit={saveVehicle} className="grid gap-3 rounded-2xl border border-natural-border bg-white p-4 md:grid-cols-4">
        <Field label="تاریخ و ساعت ورود میلادی *"><input required type="datetime-local" className={inputClass} value={vehicle.entryAt} onChange={e => setVehicle({ ...vehicle, entryAt: e.target.value, entryJalali: jalaliFromIso(e.target.value) })}/></Field><Field label="تاریخ ورود شمسی *"><input required className={inputClass} value={vehicle.entryJalali} onChange={e => setVehicle({ ...vehicle, entryJalali: e.target.value })}/></Field><Field label="نوع خودرو"><select className={inputClass} value={vehicle.vehicleType} onChange={e => setVehicle({ ...vehicle, vehicleType: e.target.value })}><option>کامیون</option><option>تریلی</option><option>وانت</option><option>سایر</option></select></Field>
        <Field label="پلاک کامل *"><div className="grid grid-cols-4 gap-1" dir="ltr"><input maxLength={2} placeholder="ایران" className={inputClass} value={vehicle.plate.iran} onChange={e => setVehicle({...vehicle,plate:{...vehicle.plate,iran:e.target.value}})}/><input maxLength={1} placeholder="حرف" className={inputClass} value={vehicle.plate.letter} onChange={e => setVehicle({...vehicle,plate:{...vehicle.plate,letter:e.target.value}})}/><input maxLength={3} placeholder="123" className={inputClass} value={vehicle.plate.three} onChange={e => setVehicle({...vehicle,plate:{...vehicle.plate,three:e.target.value}})}/><input maxLength={2} placeholder="45" className={inputClass} value={vehicle.plate.two} onChange={e => setVehicle({...vehicle,plate:{...vehicle.plate,two:e.target.value}})}/></div></Field>
        {[ ["شماره بارنامه رسمی", "inboundWaybill"], ["شماره حواله/دستور حمل", "transportOrder"], ["نام و نام خانوادگی راننده *", "driverName"], ["شماره تماس راننده *", "driverPhone"], ["نام صاحب بار/فرستنده *", "ownerName"], ["شماره تماس صاحب بار", "ownerPhone"], ["مبدأ دقیق بارگیری *", "origin"], ["مقصد دقیق تخلیه *", "destination"], ["نوع محموله *", "cargoType"], ["شماره رسید انبار", "warehouseReceipt"] ].map(([label,key]) => <React.Fragment key={key}><Field label={label}><input className={inputClass} value={String((vehicle as any)[key] || "")} onChange={e => setVehicle({...vehicle,[key]:e.target.value})}/></Field></React.Fragment>)}
        <Field label="وزن محموله (کیلوگرم) *"><input required type="number" min="0.01" className={inputClass} value={vehicle.cargoWeightKg || ""} onChange={e => setVehicle({...vehicle,cargoWeightKg:Number(e.target.value)})}/></Field><Field label="عکس و اسناد بار/خودرو" wide><input multiple type="file" accept="image/*,.pdf" capture="environment" className={inputClass} onChange={e => setVehicleFiles(e.target.files)}/></Field><Field label="توضیحات" wide><input className={inputClass} value={vehicle.notes} onChange={e => setVehicle({...vehicle,notes:e.target.value})}/></Field><button className="col-span-full flex items-center justify-center gap-2 rounded-xl bg-amber-700 py-2.5 text-xs font-black text-white"><CarFront size={15}/> ثبت ورود خودرو</button>
      </form>
      <Toolbar onExcel={() => downloadCsv("cargo-vehicles.csv",["پلاک","ورود شمسی","ورود میلادی","خروج","نوع خودرو","راننده","تماس","بارنامه ورود","حواله","صاحب بار","مبدأ","مقصد","محموله","وزن","رسید انبار","بارنامه خروج","حواله خروج","وزن خروج","وضعیت"],filteredVehicles.map(x => [formatIranPlate(x.plate),x.entryJalali,x.entryAt,x.exitAt,x.vehicleType,x.driverName,x.driverPhone,x.inboundWaybill,x.transportOrder,x.ownerName,x.origin,x.destination,x.cargoType,x.cargoWeightKg,x.warehouseReceipt,x.outboundWaybill,x.outboundPermit,x.exitWeightKg,x.deliveryStatus]))} onPrint={() => printDocument("گزارش تردد خودروهای حمل بار",`<table><tr><th>پلاک</th><th>ورود</th><th>خروج</th><th>راننده</th><th>بار</th><th>وزن</th><th>وضعیت</th></tr>${filteredVehicles.map(x => `<tr><td>${escapeHtml(formatIranPlate(x.plate))}</td><td>${escapeHtml(x.entryJalali)}</td><td>${escapeHtml(x.exitJalali || "داخل مجموعه")}</td><td>${escapeHtml(x.driverName)}</td><td>${escapeHtml(x.cargoType)}</td><td>${x.cargoWeightKg}</td><td>${escapeHtml(x.deliveryStatus)}</td></tr>`).join("")}</table>`)}/>
      <div className="grid gap-3">{filteredVehicles.map(record => <article key={record.id} className="rounded-2xl border border-natural-border bg-white p-3 text-xs"><div className="flex flex-wrap justify-between"><strong>{formatIranPlate(record.plate)} — {record.vehicleType}</strong><span className={record.exitAt ? "text-emerald-700" : "text-orange-700"}>{record.exitAt ? "خارج‌شده" : "داخل مجموعه"}</span></div><div className="mt-2 grid gap-1 text-[10px] text-natural-text/70 md:grid-cols-4"><span>ورود: {record.entryJalali} / {record.entryAt}</span><span>راننده: {record.driverName} — {record.driverPhone}</span><span>بار: {record.cargoType}، {record.cargoWeightKg.toLocaleString()} کیلوگرم</span><span>بارنامه: {record.inboundWaybill || "—"}</span><span>مسیر: {record.origin} ← {record.destination}</span><span><Paperclip size={11} className="inline"/> {record.attachments.length} پیوست</span></div>{!record.exitAt && <ExitVehicleForm record={record} onSave={updates => persist(VEHICLE_KEY,vehicles.map(x => x.id === record.id ? {...x,...updates} : x),setVehicles)}/>}</article>)}</div>
    </div>}
  </section>;
}

function Field({ label, wide, children }: { label: string; wide?: boolean; children: React.ReactNode }) { return <label className={wide ? "md:col-span-2" : ""}><span className={labelClass}>{label}</span>{children}</label>; }
function Toolbar({ onExcel, onPrint }: { onExcel: () => void; onPrint: () => void }) { return <div className="flex justify-end gap-2"><button onClick={onExcel} className="flex items-center gap-1 rounded-lg bg-emerald-700 px-3 py-2 text-[10px] font-black text-white"><FileDown size={13}/> خروجی Excel</button><button onClick={onPrint} className="flex items-center gap-1 rounded-lg bg-slate-700 px-3 py-2 text-[10px] font-black text-white"><Printer size={13}/> چاپ / PDF</button></div>; }
function ExitVehicleForm({ record, onSave }: { record: VehicleLog; onSave: (updates: Partial<VehicleLog>) => void }) {
  const nowLocal = new Date(Date.now() - new Date().getTimezoneOffset() * 60_000).toISOString().slice(0,16);
  const [exitAt,setExitAt] = useState(nowLocal); const [waybill,setWaybill] = useState(""); const [permit,setPermit] = useState(""); const [weight,setWeight] = useState(record.cargoWeightKg); const [status,setStatus] = useState<VehicleLog["deliveryStatus"]>("in_transit");
  return <div className="mt-3 grid gap-2 rounded-xl bg-slate-50 p-2 md:grid-cols-5"><input type="datetime-local" className={inputClass} value={exitAt} onChange={e=>setExitAt(e.target.value)}/><input className={inputClass} placeholder="بارنامه خروجی" value={waybill} onChange={e=>setWaybill(e.target.value)}/><input className={inputClass} placeholder="حواله خروج" value={permit} onChange={e=>setPermit(e.target.value)}/><input type="number" className={inputClass} placeholder="وزن خروجی" value={weight} onChange={e=>setWeight(Number(e.target.value))}/><select className={inputClass} value={status} onChange={e=>setStatus(e.target.value as VehicleLog["deliveryStatus"])}><option value="delivered">تحویل‌شده</option><option value="in_transit">در مسیر</option><option value="returned">برگشتی</option></select><button onClick={()=>onSave({exitAt,exitJalali:jalaliFromIso(exitAt),outboundWaybill:waybill,outboundPermit:permit,exitWeightKg:weight,deliveryStatus:status})} className="md:col-span-5 flex items-center justify-center gap-1 rounded-lg bg-emerald-700 py-2 text-[10px] font-black text-white"><CheckCircle2 size={13}/> ثبت خروج و تأیید وزن</button></div>;
}
