/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
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

interface LoginScreenProps {
  onLoginSuccess: (user: User) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username.trim() || !password.trim()) {
      setError("لطفاً نام کاربری و رمز عبور خود را وارد کنید.");
      return;
    }

    setLoading(true);

    try {
      const result = await SturgeonRepository.loginWithServer(username.trim(), password.trim());
      if (result.success && result.user) {
        onLoginSuccess(result.user);
      } else {
        setError(result.error || "نام کاربری یا رمز عبور اشتباه است. مجدداً تلاش فرمایید.");
        setLoading(false);
      }
    } catch (err: any) {
      console.error("Login attempt error:", err);
      setError("خطا در برقراری ارتباط با سرویس احراز هویت.");
      setLoading(false);
    }
  };

  return (
    <div className="erp-neon-screen min-h-screen text-white flex flex-col justify-center items-center p-4 select-none relative overflow-hidden" dir="rtl">
      
      {/* Dynamic Background Glowing Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Glassmorphism Login Card */}
      <div className="glass-card-3d w-full max-w-md rounded-[32px] p-8 md:p-10 relative z-10 space-y-8 animate-fadeIn">
        
        {/* Brand/Identity Segment */}
        <div className="text-center space-y-3">
          <div className="inline-flex w-16 h-16 rounded-[22px] bg-gradient-to-tr from-cyan-400 to-violet-500 items-center justify-center shadow-lg shadow-cyan-400/25 relative group">
            <Waves className="text-white animate-pulse group-hover:scale-115 transition-transform duration-300" size={32} />
          </div>
          <div className="space-y-1">
            <h1 className="text-xl font-black font-sans tracking-tight text-white flex items-center justify-center gap-1.5">
              <span>سامانه هوشمند مزرعه خاویاری فتحی</span>
            </h1>
            <p className="text-xs text-emerald-300/60 font-medium">پورتال ورود یکپارچه ناظران و پرسنل فارم شیلاتی</p>
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
            <label className="text-[10.5px] font-black tracking-wider text-emerald-300/70 block mr-1">نام کاربری پرسنل</label>
            <div className="relative flex items-center">
              <input
                type="text"
                placeholder="مثال: admin"
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
              <label className="text-[10.5px] font-black tracking-wider text-emerald-300/70 block">رمز عبور ورود</label>
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

          {/* Submit Action */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-4 rounded-2xl text-xs font-black transition-all cursor-pointer shadow-lg shadow-emerald-950/50 flex items-center justify-center gap-2 ${
              loading 
                ? "bg-emerald-900/40 text-emerald-500 cursor-not-allowed" 
                : "bg-gradient-to-r from-cyan-500 to-violet-600 hover:from-cyan-400 hover:to-violet-500 text-white active:scale-98"
            }`}
          >
            {loading ? (
              <div className="w-5 h-5 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
            ) : (
              <>
                <Fingerprint size={16} />
                <span>ورود به سامانه پایش شیلاتی</span>
              </>
            )}
          </button>
        </form>

        <div className="pt-4 border-t border-emerald-900/30 text-center text-[10px] text-emerald-400/50">اطلاعات ورود در برنامه یا مستندات نمایش داده نمی‌شود.</div>

      </div>

      {/* Safety Notice Bottom Bar */}
      <div className="absolute bottom-6 text-[10px] text-emerald-500/40 text-center leading-relaxed">
        این یک سیستم پایش اختصاصی است. هرگونه دسترسی غیرمجاز پیگرد قانونی دارد.<br />
        حقوق کپی رایت مزرعه خاویاری فتحی © 2026 محفوظ است.
      </div>

    </div>
  );
};
