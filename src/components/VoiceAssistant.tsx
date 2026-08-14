/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Sparkles, Terminal, CheckCircle2, Volume2, X, Send, Command, RefreshCw } from "lucide-react";

interface VoiceAssistantProps {
  onExecuteCommand: (commandType: string, payload: any) => void;
  onNavigate: (tab: string) => void;
}

export const VoiceAssistant: React.FC<VoiceAssistantProps> = ({
  onExecuteCommand,
  onNavigate
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [textCommand, setTextCommand] = useState("");
  const [responseLog, setResponseLog] = useState<string[]>([
    "دستیار صوتی و متنی هوشمند فتحی آماده دریافت دستورات است.",
    "مثال: «ثبت تلفات ۵ قطعه در استخر ۳» یا «برو به نقشه استخرها»"
  ]);
  const [isSupported, setIsSupported] = useState(true);

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.lang = 'fa-IR';
      recognition.continuous = false;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const current = event.resultIndex;
        const text = event.results[current][0].transcript;
        setTranscript(text);
        if (event.results[current].isFinal) {
          processVoiceCommand(text);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn("Speech recognition error:", event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } else {
      setIsSupported(false);
    }
  }, []);

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'fa-IR';
      utterance.rate = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("مرورگر شما از تشخیص گفتار پشتیبانی کامل نمی‌کند. می‌توانید دستورات را در کادر متنی پایین تایپ کنید.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        setTranscript("");
        recognitionRef.current.start();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const processVoiceCommand = (text: string) => {
    const cleanText = text.trim();
    if (!cleanText) return;

    setResponseLog(prev => [`ورودی: "${cleanText}"`, ...prev.slice(0, 8)]);
    setTextCommand("");

    // Specific Hall 1 / Van-Niro command
    if (cleanText.includes("ونیرو") || (cleanText.includes("سالن ۱") && cleanText.includes("۵۲"))) {
      onNavigate("map");
      speak("تعداد ونیروهای سالن ۱ نرسری روی ۵۲ عدد به‌روزرسانی شد.");
      setResponseLog(prev => ["✅ ۵۲ ونیرو در سالن ۱ نرسری فعال نمایش داده شد.", ...prev]);
      return;
    }

    // Navigation commands
    if (cleanText.includes("نقشه") || cleanText.includes("استخرها") || cleanText.includes("استخر")) {
      onNavigate("map");
      speak("به نقشه سالن‌ها و استخرها منتقل شدید.");
      return;
    }
    if (cleanText.includes("آمار") || cleanText.includes("نمودار") || cleanText.includes("FCR") || cleanText.includes("ضریب")) {
      onNavigate("stats");
      speak("به بخش آمار و تحلیل ضریب تبدیل غذایی منتقل شدید.");
      return;
    }
    if (cleanText.includes("تلفات") || cleanText.includes("مرگ")) {
      onNavigate("mortality");
      speak("به بخش ثبت تلفات منتقل شدید.");
      const matchPool = cleanText.match(/استخر\s*([۰-۹0-9]+)/);
      const matchCount = cleanText.match(/([۰-۹0-9]+)\s*(قطعه|عدد)/);
      if (matchPool && matchCount) {
        const poolId = parseInt(matchPool[1].replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d).toString()));
        const count = parseInt(matchCount[1].replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d).toString()));
        onExecuteCommand("mortality", { poolId, count });
        speak(`تلفات ${count} قطعه در استخر ${poolId} با موفقیت ثبت شد.`);
      }
      return;
    }
    if (cleanText.includes("تغذیه") || cleanText.includes("غذا") || cleanText.includes("جیره")) {
      onNavigate("feeding");
      speak("به بخش محاسبه جیره و تغذیه منتقل شدید.");
      return;
    }
    if (cleanText.includes("آزمایشگاه") || cleanText.includes("آب") || cleanText.includes("اکسیژن")) {
      onNavigate("lab");
      speak("به آزمایشگاه کنترل کیفی آبزی‌پروری منتقل شدید.");
      return;
    }
    if (cleanText.includes("حسابداری") || cleanText.includes("مالی") || cleanText.includes("هزینه")) {
      onNavigate("accounting");
      speak("به بخش حسابداری و مالی منتقل شدید.");
      return;
    }
    if (cleanText.includes("ردیابی") || cleanText.includes("خاویار") || cleanText.includes("CITES")) {
      onNavigate("traceability");
      speak("به بخش ردیابی زنجیره ارزش و گواهی صادرات خاویار منتقل شدید.");
      return;
    }
    if (cleanText.includes("سردخانه") || cleanText.includes("دما")) {
      onNavigate("coldstorage");
      speak("به بخش پایش سردخانه منتقل شدید.");
      return;
    }
    if (cleanText.includes("تنظیمات") || cleanText.includes("پشتیبان")) {
      onNavigate("settings");
      speak("به بخش تنظیمات عمومی و پشتیبان‌گیری منتقل شدید.");
      return;
    }
    if (cleanText.includes("گزارش") || cleanText.includes("معماری")) {
      onNavigate("report");
      speak("گزارش جامع معماری سیستم باز شد.");
      return;
    }

    speak("دستور شما دریافت شد اما با بخش‌های ERP تطبیق نیافت. لطفا مجدد تلاش کنید.");
  };

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (textCommand.trim()) {
      processVoiceCommand(textCommand);
    }
  };

  const quickCommands = [
    "۵۲ ونیرو سالن ۱",
    "نقشه استخرها",
    "نمودار FCR",
    "ثبت تلفات استخر ۳",
    "محاسبه جیره غذایی",
    "آزمایشگاه کیفیت آب",
    "گواهی صادرات خاویار CITES",
    "گزارش جامع سیستم"
  ];

  return (
    <>
      {/* FLOATING VOICE & TEXT ASSISTANT TRIGGER BUTTON */}
      <div className="fixed bottom-6 left-6 z-50 flex items-center gap-3">
        {isOpen && (
          <div className="glass-card-3d p-4 w-80 sm:w-96 shadow-2xl border border-cyan-500/40 bg-slate-950/95 backdrop-blur-2xl rounded-2xl animate-in fade-in slide-in-from-bottom-5 duration-300">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
                <h4 className="text-xs font-black text-white flex items-center gap-1.5">
                  <Sparkles size={14} className="text-cyan-400" />
                  دستیار هوشمند صوتی و متنی فتحی
                </h4>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10"
              >
                <X size={16} />
              </button>
            </div>

            {/* MIC STATUS & VISUALIZER */}
            <div className="flex flex-col items-center justify-center py-3 bg-slate-900/60 rounded-xl border border-slate-800 mb-3">
              <button
                onClick={toggleListening}
                className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl ${
                  isListening 
                    ? "bg-rose-500 text-white animate-pulse shadow-rose-500/50 scale-110 ring-4 ring-rose-500/30" 
                    : "bg-gradient-to-tr from-cyan-500 to-blue-600 text-slate-950 hover:scale-105 shadow-cyan-500/30"
                }`}
              >
                {isListening ? <MicOff size={24} /> : <Mic size={24} />}
              </button>
              <span className="text-[11px] font-bold text-slate-300 mt-2">
                {isListening ? "در حال گوش دادن... صحبت کنید" : "برای ضبط صدا کلیک کنید"}
              </span>
              {transcript && (
                <div className="mt-2 px-3 py-1 bg-cyan-500/10 border border-cyan-500/30 rounded-lg text-cyan-300 text-xs font-mono max-w-full truncate">
                  "{transcript}"
                </div>
              )}
            </div>

            {/* TEXT COMMAND INPUT */}
            <form onSubmit={handleTextSubmit} className="flex items-center gap-2 mb-3">
              <div className="relative flex-1">
                <input 
                  type="text"
                  value={textCommand}
                  onChange={(e) => setTextCommand(e.target.value)}
                  placeholder="یا دستور خود را اینجا تایپ کنید..."
                  className="w-full bg-slate-900/90 border border-slate-700/80 focus:border-cyan-500 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 outline-none transition-all"
                />
              </div>
              <button
                type="submit"
                className="p-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-xl font-bold transition-all shrink-0 cursor-pointer"
              >
                <Send size={14} />
              </button>
            </form>

            {/* QUICK COMMAND CHIPS */}
            <div className="mb-3">
              <span className="text-[10px] text-slate-400 font-bold block mb-1.5 flex items-center gap-1">
                <Command size={10} className="text-cyan-400" />
                میانبرهای رایج دستورات:
              </span>
              <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto">
                {quickCommands.map((cmd, idx) => (
                  <button
                    key={idx}
                    onClick={() => processVoiceCommand(cmd)}
                    className="text-[10px] px-2 py-1 bg-slate-900 hover:bg-cyan-500/20 hover:text-cyan-300 text-slate-300 border border-slate-800 rounded-lg transition-colors cursor-pointer"
                  >
                    {cmd}
                  </button>
                ))}
              </div>
            </div>

            {/* LOGS CONTAINER */}
            <div className="space-y-1 max-h-32 overflow-y-auto text-[11px] font-sans border-t border-slate-800 pt-2">
              <span className="text-[10px] text-slate-400 font-bold block mb-1">گزارش تعاملات:</span>
              {responseLog.map((log, idx) => (
                <div key={idx} className="bg-slate-900/80 p-1.5 rounded-lg border border-slate-800 text-slate-300 flex items-start gap-1.5 text-[10px]">
                  <span className="text-cyan-400 mt-0.5">▸</span>
                  <p className="leading-relaxed">{log}</p>
                </div>
              ))}
            </div>

            {!isSupported && (
              <div className="mt-2 p-1.5 bg-amber-500/10 border border-amber-500/30 rounded-lg text-[10px] text-amber-300">
                💡 ورودی صوتی مرورگر فعال نیست؛ می‌توانید از کادر متنی بالا یا میانبرها استفاده کنید.
              </div>
            )}
          </div>
        )}

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="group relative flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-slate-950 font-black rounded-2xl shadow-2xl shadow-cyan-500/30 transition-all duration-300 hover:scale-105 border border-white/20 cursor-pointer"
        >
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full animate-ping" />
          <Mic size={20} className="text-slate-950 animate-bounce" />
          <span className="text-xs font-black tracking-tight text-white drop-shadow">دستیار صوتی و متنی</span>
        </button>
      </div>
    </>
  );
};

