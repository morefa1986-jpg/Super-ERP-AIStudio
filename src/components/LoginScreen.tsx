/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from "react";
import { 
  Waves, 
  Lock, 
  User as UserIcon, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  ShieldCheck,
  Fingerprint
} from "lucide-react";
import { User } from "../types";
import { SturgeonRepository } from "../storage/repository";
import { clearRememberedLogin, loadRememberedLogin, saveRememberedLogin } from "../storage/credentials";

type LoginLanguage = "fa" | "ar" | "en" | "de" | "ru";
type LoginCopy = { title: string; subtitle: string; user: string; password: string; submit: string; required: string; invalid: string; network: string; remember: string; secureNotice: string; unauthorized: string; saveError: string; };
const loginCopy: Record<LoginLanguage, LoginCopy> = {
  fa: { title: "سامانه هوشمند مزرعه خاویاری فتحی", subtitle: "پورتال ورود یکپارچه ناظران و پرسنل فارم شیلاتی", user: "نام کاربری پرسنل", password: "رمز عبور ورود", submit: "ورود به سامانه پایش شیلاتی", required: "لطفاً نام کاربری و رمز عبور خود را وارد کنید.", invalid: "نام کاربری یا رمز عبور اشتباه است.", network: "خطا در برقراری ارتباط با سرویس احراز هویت.", remember: "به‌خاطر سپردن ورود روی این دستگاه", secureNotice: "اطلاعات ورود در برنامه یا مستندات نمایش داده نمی‌شود.", unauthorized: "این یک سیستم پایش اختصاصی است. هرگونه دسترسی غیرمجاز پیگرد قانونی دارد.", saveError: "مرورگر امکان ذخیره امن اعتبار ورود را فراهم نکرد." },
  en: { title: "Fathi Sturgeon Farm ERP", subtitle: "Secure portal for farm staff and supervisors", user: "Username", password: "Password", submit: "Sign in", required: "Enter your username and password.", invalid: "Invalid username or password.", network: "Unable to connect to the authentication service.", remember: "Remember sign-in on this device", secureNotice: "Sign-in information is not displayed in the application or documentation.", unauthorized: "This is a private monitoring system. Unauthorized access is prohibited.", saveError: "The browser could not securely store your sign-in information." },
  ar: { title: "نظام مزرعة فتحي للكافيار", subtitle: "بوابة آمنة للمشرفين وموظفي المزرعة", user: "اسم المستخدم", password: "كلمة المرور", submit: "تسجيل الدخول", required: "أدخل اسم المستخدم وكلمة المرور.", invalid: "اسم المستخدم أو كلمة المرور غير صحيحة.", network: "تعذر الاتصال بخدمة المصادقة.", remember: "تذكر تسجيل الدخول على هذا الجهاز", secureNotice: "لا تُعرض معلومات الدخول داخل التطبيق أو الوثائق.", unauthorized: "هذا نظام مراقبة خاص. الدخول غير المصرح به محظور.", saveError: "تعذر على المتصفح تخزين معلومات الدخول بأمان." },
  de: { title: "Fathi Störzucht ERP", subtitle: "Sicheres Portal für Farmmitarbeiter und Aufseher", user: "Benutzername", password: "Passwort", submit: "Anmelden", required: "Benutzername und Passwort eingeben.", invalid: "Benutzername oder Passwort ist falsch.", network: "Der Authentifizierungsdienst ist nicht erreichbar.", remember: "Anmeldung auf diesem Gerät merken", secureNotice: "Anmeldedaten werden weder in der Anwendung noch in der Dokumentation angezeigt.", unauthorized: "Dies ist ein privates Überwachungssystem. Unbefugter Zugriff ist verboten.", saveError: "Die Anmeldedaten konnten nicht sicher im Browser gespeichert werden." },
  ru: { title: "ERP осетровой фермы Фатхи", subtitle: "Безопасный портал для сотрудников фермы", user: "Имя пользователя", password: "Пароль", submit: "Войти", required: "Введите имя пользователя и пароль.", invalid: "Неверное имя пользователя или пароль.", network: "Не удалось подключиться к службе авторизации.", remember: "Запомнить вход на этом устройстве", secureNotice: "Данные входа не отображаются в приложении или документации.", unauthorized: "Это закрытая система мониторинга. Несанкционированный доступ запрещён.", saveError: "Браузер не смог безопасно сохранить данные входа." }
};

interface LoginScreenProps {
  onLoginSuccess: (user: User) => void;
  onLanguageChange?: (language: LoginLanguage) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess, onLanguageChange }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [remember, setRemember] = useState(false);
  const [language, setLanguage] = useState<LoginLanguage>(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem("sturgeon_lang") as LoginLanguage | null : null;
    if (saved && saved in loginCopy) return saved;
    const browser = typeof navigator !== "undefined" ? (navigator.languages?.[0] || navigator.language || "fa").slice(0, 2) as LoginLanguage : "fa";
    return browser in loginCopy ? browser : "fa";
  });
  const copy = loginCopy[language];

  useEffect(() => {
    const stored = typeof window !== "undefined" && localStorage.getItem("sturgeon_remember_login") === "true";
    setRemember(stored);
    loadRememberedLogin().then(saved => {
      if (stored && saved) { setUsername(saved.username); setPassword(saved.password); }
    });
  }, []);

  const changeLanguage = (next: LoginLanguage) => {
    setLanguage(next);
    localStorage.setItem("sturgeon_lang", next);
    onLanguageChange?.(next);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username.trim() || !password.trim()) {
      setError(copy.required);
      return;
    }

    setLoading(true);

    try {
      const result = await SturgeonRepository.loginWithServer(username.trim(), password.trim());
      if (result.success && result.user) {
        if (remember) {
          const saved = await saveRememberedLogin(username.trim(), password);
          if (!saved) setError(copy.saveError);
        } else clearRememberedLogin();
        onLoginSuccess(result.user);
      } else {
        setError(result.error || copy.invalid);
        setLoading(false);
      }
    } catch (err: any) {
      console.error("Login attempt error:", err);
      setError(copy.network);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#12231B] via-[#1A2E26] to-[#0D1814] text-white flex flex-col justify-center items-center p-4 select-none relative overflow-hidden" dir={language === "fa" || language === "ar" ? "rtl" : "ltr"} lang={language}>
      
      {/* Dynamic Background Glowing Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-950/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#D68227]/5 rounded-full blur-3xl pointer-events-none" />

      {/* Main Glassmorphism Login Card */}
      <div className="w-full max-w-md bg-[#162920]/90 border border-emerald-900/35 rounded-[32px] p-8 md:p-10 shadow-2xl backdrop-blur-md relative z-10 space-y-8 animate-fadeIn">
        <div className="flex items-center justify-end gap-2">
          <label htmlFor="login-language" className="text-[10px] text-emerald-300/70">Language / زبان</label>
          <select id="login-language" value={language} onChange={e => changeLanguage(e.target.value as LoginLanguage)} className="bg-[#0F1D17] border border-emerald-900/50 rounded-lg px-2 py-1 text-xs text-white">
            <option value="fa">فارسی</option><option value="en">English</option><option value="ar">العربية</option><option value="de">Deutsch</option><option value="ru">Русский</option>
          </select>
        </div>
        
        {/* Brand/Identity Segment */}
        <div className="text-center space-y-3">
          <div className="inline-flex w-16 h-16 rounded-[22px] bg-gradient-to-tr from-[#D68227] to-[#f4b266] items-center justify-center shadow-lg shadow-[#D68227]/20 relative group">
            <Waves className="text-[#12231B] animate-pulse group-hover:scale-115 transition-transform duration-300" size={32} />
          </div>
          <div className="space-y-1">
            <h1 className="text-xl font-black font-sans tracking-tight text-white flex items-center justify-center gap-1.5">
              <span>{copy.title}</span>
            </h1>
            <p className="text-xs text-emerald-300/60 font-medium">{copy.subtitle}</p>
          </div>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="p-3.5 bg-rose-950/50 border border-rose-800/40 rounded-2xl flex items-center gap-2.5 text-xs text-rose-200 animate-shake">
              <AlertCircle size={16} className="text-rose-400 shrink-0" />
              <span className="leading-relaxed font-bold">{error}</span>
            </div>
          )}

          {/* Username Input */}
          <div className="space-y-1.5">
            <label className="text-[10.5px] font-black tracking-wider text-emerald-300/70 block mr-1">{copy.user}</label>
            <div className="relative flex items-center">
              <input
                type="text"
                placeholder="admin"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
                className="w-full bg-[#0F1D17]/80 border border-emerald-900/40 rounded-2xl py-3.5 pr-11 pl-4 text-xs font-bold text-white placeholder-emerald-800/60 focus:outline-none focus:border-[#D68227] focus:ring-1 focus:ring-[#D68227] transition-all font-mono"
              />
              <UserIcon size={16} className="absolute right-4 text-emerald-700" />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center mr-1">
              <label className="text-[10.5px] font-black tracking-wider text-emerald-300/70 block">{copy.password}</label>
            </div>
            <div className="relative flex items-center">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="w-full bg-[#0F1D17]/80 border border-emerald-900/40 rounded-2xl py-3.5 pr-11 pl-12 text-xs font-bold text-white placeholder-emerald-800/60 focus:outline-none focus:border-[#D68227] focus:ring-1 focus:ring-[#D68227] transition-all font-mono"
              />
              <Lock size={16} className="absolute right-4 text-emerald-700" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                className="absolute left-4 p-1 hover:text-emerald-300 text-emerald-700 transition-colors focus:outline-none"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <label className="flex items-center gap-2 text-xs text-emerald-200/80 cursor-pointer">
            <input type="checkbox" checked={remember} onChange={e => { setRemember(e.target.checked); localStorage.setItem("sturgeon_remember_login", String(e.target.checked)); if (!e.target.checked) clearRememberedLogin(); }} />
            {copy.remember}
          </label>

          {/* Submit Action */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-4 rounded-2xl text-xs font-black transition-all cursor-pointer shadow-lg shadow-emerald-950/50 flex items-center justify-center gap-2 ${
              loading 
                ? "bg-emerald-900/40 text-emerald-500 cursor-not-allowed" 
                : "bg-gradient-to-r from-[#D68227] to-[#D68227]/90 hover:from-[#e48f32] hover:to-[#D68227] text-white active:scale-98"
            }`}
          >
            {loading ? (
              <div className="w-5 h-5 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
            ) : (
              <>
                <Fingerprint size={16} />
                <span>{copy.submit}</span>
              </>
            )}
          </button>
        </form>

        <div className="pt-4 border-t border-emerald-900/30 text-center text-[10px] text-emerald-400/50">{copy.secureNotice}</div>

      </div>

      {/* Safety Notice Bottom Bar */}
      <div className="absolute bottom-6 text-[10px] text-emerald-500/40 text-center leading-relaxed">
        {copy.unauthorized}<br />
        Fathi Sturgeon Farm © 2026
      </div>

    </div>
  );
};
