/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { AlertTriangle, Bell, BellOff, Volume2, VolumeX, ShieldAlert, Zap, CheckCircle, RefreshCw, X, ArrowUpRight } from "lucide-react";
import { Pool } from "../types";

interface IoTSensorAlertsProps {
  pools: Pool[];
  onNavigateToPool: (poolId: string) => void;
}

export interface IoTAlert {
  id: string;
  poolId: string;
  poolName: string;
  hallId: number;
  paramName: "اکسیژن محلول" | "دما" | "pH" | "آمونیاک";
  value: number;
  unit: string;
  threshold: string;
  severity: "critical" | "warning";
  timestamp: string;
  acknowledged: boolean;
}

export const IoTSensorAlerts: React.FC<IoTSensorAlertsProps> = ({
  pools,
  onNavigateToPool,
}) => {
  const [alerts, setAlerts] = useState<IoTAlert[]>([]);
  const [isSoundMuted, setIsSoundMuted] = useState(false);
  const [isSimulatorActive, setIsSimulatorActive] = useState(true);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Sound generator using Web Audio API
  const playAlertSound = (severity: "critical" | "warning") => {
    if (isSoundMuted) return;
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = severity === "critical" ? "sawtooth" : "sine";
      osc.frequency.setValueAtTime(severity === "critical" ? 880 : 587.33, ctx.currentTime); // A5 or D5
      osc.frequency.exponentialRampToValueAtTime(severity === "critical" ? 440 : 293.66, ctx.currentTime + 0.4);

      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } catch (e) {
      console.warn("Audio Context playback error:", e);
    }
  };

  // Check pools for initial critical levels
  useEffect(() => {
    const activeAlerts: IoTAlert[] = [];
    pools.forEach((p) => {
      if (p.count > 0) {
        if (p.oxygenLevel < 4.5) {
          activeAlerts.push({
            id: `alert-ox-${p.id}`,
            poolId: p.id,
            poolName: p.name,
            hallId: p.hallId,
            paramName: "اکسیژن محلول",
            value: p.oxygenLevel,
            unit: "mg/L",
            threshold: "< 4.5 mg/L",
            severity: p.oxygenLevel < 3.8 ? "critical" : "warning",
            timestamp: new Date().toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit" }),
            acknowledged: false,
          });
        }
      }
    });

    if (activeAlerts.length > 0) {
      setAlerts(activeAlerts);
    }
  }, [pools]);

  // Periodic IoT telemetry drift simulation
  useEffect(() => {
    if (!isSimulatorActive) return;

    const interval = setInterval(() => {
      // 15% chance to simulate a sudden sensor event
      if (Math.random() < 0.25) {
        const activePools = pools.filter((p) => p.count > 0);
        if (activePools.length === 0) return;

        const randomPool = activePools[Math.floor(Math.random() * activePools.length)];
        const isOxygenDrop = Math.random() > 0.4;

        if (isOxygenDrop) {
          const oxVal = parseFloat((3.2 + Math.random() * 1.1).toFixed(1));
          const newAlert: IoTAlert = {
            id: `alert-${Date.now()}`,
            poolId: randomPool.id,
            poolName: randomPool.name,
            hallId: randomPool.hallId,
            paramName: "اکسیژن محلول",
            value: oxVal,
            unit: "mg/L",
            threshold: "کمتر از ۴.۵ ppm",
            severity: oxVal < 3.8 ? "critical" : "warning",
            timestamp: new Date().toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit" }),
            acknowledged: false,
          };

          setAlerts((prev) => [newAlert, ...prev.filter((a) => a.poolId !== randomPool.id).slice(0, 5)]);
          playAlertSound(newAlert.severity);
        }
      }
    }, 12000);

    return () => clearInterval(interval);
  }, [isSimulatorActive, pools, isSoundMuted]);

  const triggerTestAlert = () => {
    const activePools = pools.filter((p) => p.count > 0);
    const target = activePools[0] || pools[0];
    const testAlert: IoTAlert = {
      id: `test-alert-${Date.now()}`,
      poolId: target.id,
      poolName: target.name,
      hallId: target.hallId,
      paramName: "اکسیژن محلول",
      value: 3.4,
      unit: "mg/L",
      threshold: "هشدار بحرانی: ۳.۴ ppm",
      severity: "critical",
      timestamp: new Date().toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit" }),
      acknowledged: false,
    };
    setAlerts((prev) => [testAlert, ...prev]);
    playAlertSound("critical");
  };

  const unacknowledgedAlerts = alerts.filter((a) => !a.acknowledged);
  const topCriticalAlert = unacknowledgedAlerts.find((a) => a.severity === "critical") || unacknowledgedAlerts[0];

  return (
    <div className="w-full space-y-3">
      {/* PERSISTENT CRITICAL IOT ALERT BANNER */}
      {topCriticalAlert && (
        <div className="bg-gradient-to-r from-rose-950/90 via-red-900/90 to-slate-950/90 border-2 border-rose-500/80 p-3.5 rounded-2xl shadow-2xl backdrop-blur-xl flex flex-col sm:flex-row items-center justify-between gap-3 text-white animate-pulse relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/20 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-rose-500 text-slate-950 rounded-xl font-black shrink-0 shadow-lg shadow-rose-500/50">
              <AlertTriangle size={22} className="animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-rose-500/30 border border-rose-400/40 text-rose-300 rounded-full text-[10px] font-black">
                  🚨 آلارم آنی سنسورهای IoT سالن {topCriticalAlert.hallId}
                </span>
                <span className="text-[10px] text-slate-300 font-mono">{topCriticalAlert.timestamp}</span>
              </div>
              <h4 className="text-xs font-black text-white mt-1">
                افت شدید {topCriticalAlert.paramName} در <strong className="text-cyan-300 font-mono">{topCriticalAlert.poolName}</strong> (مقدار: {topCriticalAlert.value} {topCriticalAlert.unit})
              </h4>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={() => onNavigateToPool(topCriticalAlert.poolId)}
              className="px-3 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-xl text-xs font-black flex items-center gap-1 transition-all cursor-pointer shadow-lg shadow-cyan-500/30"
            >
              بررسی استخر
              <ArrowUpRight size={14} />
            </button>
            <button
              onClick={() => {
                setAlerts((prev) =>
                  prev.map((a) => (a.id === topCriticalAlert.id ? { ...a, acknowledged: true } : a))
                );
              }}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              تایید هشدار
            </button>
            <button
              onClick={() => setIsSoundMuted(!isSoundMuted)}
              className="p-1.5 bg-slate-800 text-slate-300 hover:text-white rounded-xl border border-slate-700 cursor-pointer"
              title={isSoundMuted ? "وصل صدای آلارم" : "قطع صدای آلارم"}
            >
              {isSoundMuted ? <VolumeX size={16} /> : <Volume2 size={16} className="text-rose-400" />}
            </button>
          </div>
        </div>
      )}

      {/* IOT CONTROLLER COMPACT STATUS PANEL */}
      <div className="glass-card-3d p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs border border-cyan-500/30">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-cyan-500/10 text-cyan-400 rounded-xl border border-cyan-500/20">
            <Zap size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-white text-xs">پایش پویای سنسورهای شبکه IoT</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            </div>
            <p className="text-[10px] text-slate-400">
              ارسال زنده پارامترهای اکسیژن، دما و pH به کلود فارم فتحی
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={triggerTestAlert}
            className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 rounded-xl text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <RefreshCw size={12} />
            تست آلارم سنسور
          </button>
          <button
            onClick={() => setIsSimulatorActive(!isSimulatorActive)}
            className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer border ${
              isSimulatorActive
                ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                : "bg-slate-800 text-slate-400 border-slate-700"
            }`}
          >
            {isSimulatorActive ? "شبیه‌ساز فعال" : "شبیه‌ساز متوقف"}
          </button>
        </div>
      </div>
    </div>
  );
};
