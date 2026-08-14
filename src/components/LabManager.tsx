import React, { useState, useEffect } from "react";
import { 
  FlaskConical, 
  Thermometer, 
  Activity, 
  Sparkles, 
  Droplet, 
  Scale, 
  Clock, 
  Trash2, 
  AlertTriangle, 
  CheckCircle, 
  Dna,
  Zap,
  Cpu,
  Smartphone,
  Microscope,
  Printer,
  TrendingUp,
  ShieldCheck
} from "lucide-react";
import { Pool, WaterTestLog, SonographyLog } from "../types";
import { SturgeonRepository } from "../storage/repository";
import { CENTRAL_THRESHOLDS } from "../config/thresholds";
import { formatWaterParam } from "../utils/aquacultureUtils";

interface LabManagerProps {
  pools: Pool[];
}

export default function LabManager({ pools }: LabManagerProps) {
  // Tabs: water_fixed, water_portable, water_bio, or ultrasound
  const [labSubTab, setLabSubTab] = useState<"water_fixed" | "water_portable" | "water_bio" | "ultrasound">("water_fixed");

  // Load and save logs using the abstract Repository
  const [waterLogs, setWaterLogs] = useState<WaterTestLog[]>(() => {
    return SturgeonRepository.getLabTests();
  });

  const [ultrasoundLogs, setUltrasoundLogs] = useState<SonographyLog[]>(() => {
    return SturgeonRepository.getSonographies();
  });

  // State sync using Repository
  useEffect(() => {
    SturgeonRepository.saveLabTests(waterLogs);
  }, [waterLogs]);

  useEffect(() => {
    SturgeonRepository.saveSonographies(ultrasoundLogs);
  }, [ultrasoundLogs]);

  // Form states - Basic shared Water fields
  const [selectedPoolId, setSelectedPoolId] = useState<string>("");
  const [temp, setTemp] = useState<number>(18); // Optimal: 18 °C (Range 10-25)
  const [o2, setO2] = useState<number>(7.0); // Optimal: 7.0 mg/L (Range 4.5-8)
  const [ph, setPh] = useState<number>(7.8); // Optimal: 7.8 (Range 6.8-8.8)
  const [salinity, setSalinity] = useState<number>(3.0); // Optimal: 2-4 ppt (Range 0-18)

  // Form states - Fixed specific & Electrochemical
  const [orp, setOrp] = useState<number>(250); // Optimal: 250 mV (<350)
  const [conductivity, setConductivity] = useState<number>(800); // Optimal: 800 µS/cm (<=1800)
  const [ozone, setOzone] = useState<number>(0.03); // Optimal: <0.05 mg/L (<0.08)
  const [probeStatus, setProbeStatus] = useState<"calibrated" | "needs_calibration" | "error" | "offline">("calibrated");

  // Form states - Portable specific & Hydrochemical
  const [no2, setNo2] = useState<number>(0.02);
  const [nh3, setNh3] = useState<number>(0.3); // Ammonium (NH4) Optimal <0.5 mg/L (<1)
  const [nitrate, setNitrate] = useState<number>(0.8); // Nitrate (NO3) Optimal <1.0 mg/L (<2)
  const [hardnessKH, setHardnessKH] = useState<number>(8);
  const [deviceModel, setDeviceModel] = useState<string>("YSI ProDSS");

  // Form states - Bio specific
  const [microalgae, setMicroalgae] = useState<string>("کلورلا (Chlorella)");
  const [planktonCount, setPlanktonCount] = useState<number>(12000);
  const [pathogens, setPathogens] = useState<string>("منفی (عادی و فاقد استرپتوکوکوس شانی)");
  const [transparency, setTransparency] = useState<number>(40); // cm

  // Form states - Ultrasound
  const [sonPoolId, setSonPoolId] = useState<string>("");
  const [tagId, setTagId] = useState<string>("");
  const [gender, setGender] = useState<string>("Female");
  const [stage, setStage] = useState<string>("Stage III");
  const [eggDiameter, setEggDiameter] = useState<number>(2.5);
  const [gvIndex, setGvIndex] = useState<number>(0.08);

  // Diagnosis States
  const [aiResult, setAiResult] = useState<string>("");
  const [isDiagnosing, setIsDiagnosing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");

  // Presets
  const applyFixedPreset = (type: "normal" | "calib_needed" | "error_state") => {
    if (type === "normal") {
      setTemp(19.0);
      setO2(8.0);
      setPh(7.5);
      setSalinity(1.2);
      setOrp(280);
      setConductivity(420);
      setProbeStatus("calibrated");
      setNo2(0.01);
      setNh3(0.002);
      setNitrate(10);
      setHardnessKH(8);
      setMicroalgae("کلورلا (Chlorella)");
      setPlanktonCount(15000);
      setPathogens("منفی (عادی و فاقد استرپتوکوکوس شانی)");
      setTransparency(45);
    } else if (type === "calib_needed") {
      setTemp(22.0);
      setO2(5.5);
      setPh(7.1);
      setSalinity(1.0);
      setOrp(150);
      setConductivity(650);
      setProbeStatus("needs_calibration");
      setNo2(0.06);
      setNh3(0.012);
      setNitrate(30);
      setHardnessKH(11);
      setMicroalgae("دیاتومه (Diatoms)");
      setPlanktonCount(28000);
      setPathogens("مثبت (بار باکتریایی معلق خفیف)");
      setTransparency(25);
    } else {
      setTemp(24.5);
      setO2(3.5);
      setPh(8.6);
      setSalinity(1.1);
      setOrp(80);
      setConductivity(950);
      setProbeStatus("error");
      setNo2(0.25);
      setNh3(0.045);
      setNitrate(60);
      setHardnessKH(15);
      setMicroalgae("سیانوباکتر (Cyanobacteria / زهرآگین)");
      setPlanktonCount(75000);
      setPathogens("مثبت (بیت کلونی شدید استرپتوکوکوزیس)");
      setTransparency(12);
    }
    setAiResult("");
    setErrorMessage("");
    setSuccessMessage("");
  };

  const applyPortablePreset = (type: "ideal" | "toxic" | "saline_warning") => {
    if (type === "ideal") {
      setTemp(18.5);
      setO2(8.2);
      setPh(7.6);
      setSalinity(1.2);
      setOrp(300);
      setConductivity(400);
      setProbeStatus("calibrated");
      setNo2(0.01);
      setNh3(0.002);
      setNitrate(12);
      setHardnessKH(8);
      setDeviceModel("YSI ProDSS");
      setMicroalgae("کلورلا (Chlorella)");
      setPlanktonCount(12000);
      setPathogens("منفی (عادی و فاقد استرپتوکوکوس شانی)");
      setTransparency(50);
    } else if (type === "toxic") {
      setTemp(24.0);
      setO2(4.1);
      setPh(8.4);
      setSalinity(0.9);
      setOrp(110);
      setConductivity(880);
      setProbeStatus("needs_calibration");
      setNo2(0.18);
      setNh3(0.035);
      setNitrate(45);
      setHardnessKH(12);
      setDeviceModel("HQ40d Duplex");
      setMicroalgae("سیانوباکتر (Cyanobacteria / زهرآگین)");
      setPlanktonCount(65000);
      setPathogens("مثبت (بار شدید آئروموناس شیلاتی)");
      setTransparency(15);
    } else {
      setTemp(14.0);
      setO2(8.4);
      setPh(7.8);
      setSalinity(10.5);
      setOrp(270);
      setConductivity(1200);
      setProbeStatus("calibrated");
      setNo2(0.03);
      setNh3(0.004);
      setNitrate(18);
      setHardnessKH(9);
      setDeviceModel("Oxi 3310");
      setMicroalgae("دیاتومه (Diatoms)");
      setPlanktonCount(9500);
      setPathogens("منفی (عادی و فاقد استرپتوکوکوس شانی)");
      setTransparency(35);
    }
    setAiResult("");
    setErrorMessage("");
    setSuccessMessage("");
  };

  const applyBioPreset = (type: "normal" | "algae_bloom" | "pathogen_load") => {
    if (type === "normal") {
      setTemp(19.5);
      setO2(7.9);
      setPh(7.5);
      setSalinity(1.2);
      setOrp(290);
      setConductivity(410);
      setProbeStatus("calibrated");
      setNo2(0.015);
      setNh3(0.002);
      setNitrate(15);
      setHardnessKH(8);
      setMicroalgae("کلورلا (Chlorella)");
      setPlanktonCount(15000);
      setPathogens("منفی (عادی و فاقد استرپتوکوکوس شانی)");
      setTransparency(45);
    } else if (type === "algae_bloom") {
      setTemp(25.0);
      setO2(4.0);
      setPh(8.4);
      setSalinity(1.0);
      setOrp(95);
      setConductivity(780);
      setProbeStatus("needs_calibration");
      setNo2(0.14);
      setNh3(0.028);
      setNitrate(40);
      setHardnessKH(13);
      setMicroalgae("سیانوباکتر (Cyanobacteria / زهرآگین)");
      setPlanktonCount(75000);
      setPathogens("منفی (عادی و فاقد استرپتوکوکوس شانی)");
      setTransparency(12);
    } else {
      setTemp(23.0);
      setO2(5.1);
      setPh(7.9);
      setSalinity(1.1);
      setOrp(180);
      setConductivity(520);
      setProbeStatus("calibrated");
      setNo2(0.08);
      setNh3(0.015);
      setNitrate(25);
      setHardnessKH(10);
      setMicroalgae("دیاتومه (Diatoms)");
      setPlanktonCount(8000);
      setPathogens("مثبت (بار شدید آئروموناس شیلاتی)");
      setTransparency(25);
    }
    setAiResult("");
    setErrorMessage("");
    setSuccessMessage("");
  };

  const applyUltrasoundPreset = (type: "prime_female" | "young" | "male") => {
    if (type === "prime_female") {
      setGender("Female");
      setStage("Stage IV");
      setEggDiameter(3.6);
      setGvIndex(0.04);
      setTagId(`BEL-${Math.floor(Math.random() * 5000 + 1000)}`);
    } else if (type === "young") {
      setGender("Juvenile");
      setStage("Stage I");
      setEggDiameter(0.5);
      setGvIndex(0.15);
      setTagId(`SIB-${Math.floor(Math.random() * 5000 + 1000)}`);
    } else {
      setGender("Male");
      setStage("Stage II");
      setEggDiameter(0.0);
      setGvIndex(0.00);
      setTagId(`RUS-${Math.floor(Math.random() * 5000 + 1000)}`);
    }
    setAiResult("");
    setErrorMessage("");
    setSuccessMessage("");
  };

  // Water range evaluations for all factors combined (based on official Sturgeon standards)
  const evaluateWaterMetrics = (
    subTab: "water_fixed" | "water_portable" | "water_bio",
    metrics: any
  ): { status: "normal" | "warning" | "critical"; desc: string } => {
    const { temp, o2, ph, salinity, orp, conductivity, nh4, nitrate, ozone, pathogens, microalgae } = metrics;
    
    // Critical breach check
    if (
      (temp !== undefined && (temp < 10 || temp > 25)) ||
      (o2 !== undefined && (o2 < 4.5 || o2 > 8.0)) ||
      (ph !== undefined && (ph < 6.8 || ph > 8.8)) ||
      (salinity !== undefined && (salinity < 0 || salinity > 18)) ||
      (orp !== undefined && orp >= 350) ||
      (conductivity !== undefined && conductivity > 1800) ||
      (nh4 !== undefined && nh4 >= 1.0) ||
      (nitrate !== undefined && nitrate >= 2.0) ||
      (ozone !== undefined && ozone >= 0.08) ||
      (pathogens && (pathogens.includes("شدید") || pathogens.includes("استرپتوکوکوزیس"))) ||
      (microalgae && (microalgae.includes("سیانوباکتر") || microalgae.includes("تاژک‌داران")))
    ) {
      return { 
        status: "critical", 
        desc: "بحرانی - انحراف مستقیم پارامترها از محدوده مجاز (دمای ۱۰-۲۵، اکسیژن ۴.۵-۸، پی‌اچ ۶.۸-۸.۸، شوری ۰-۱۸، ORP<350، EC<=1800، NH4<1، NO3<2، اوزون<0.08)" 
      };
    }
    
    // Warning near limit check
    if (
      (temp !== undefined && (temp < 12 || temp > 22)) ||
      (o2 !== undefined && (o2 < 5.8 || o2 > 7.8)) ||
      (ph !== undefined && (ph < 7.0 || ph > 8.4)) ||
      (salinity !== undefined && (salinity > 8.0)) ||
      (orp !== undefined && orp > 300) ||
      (conductivity !== undefined && conductivity > 1200) ||
      (nh4 !== undefined && nh4 >= 0.5) ||
      (nitrate !== undefined && nitrate >= 1.0) ||
      (ozone !== undefined && ozone >= 0.05) ||
      (pathogens && pathogens.includes("مثبت")) ||
      (microalgae && microalgae.includes("دیاتومه"))
    ) {
      return { 
        status: "warning", 
        desc: "اخطار - انحراف از شرایط بهینه (هدف: دما ۱۸، اکسیژن ۷، پی‌اچ ۷.۸، شوری ۲-۴، ORP: ۲۵۰، EC: ۸۰۰، NH4<0.5، NO3<1، اوزون<0.05)" 
      };
    }
    
    return { 
      status: "normal", 
      desc: "شرایط ممتاز و بهینه کامل آب (مطابق با استانداردهای مرجع پرورش ماهی خاویاری)" 
    };
  };

  // Add water log
  const handleSaveWaterAnalysis = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!selectedPoolId) {
      setErrorMessage("لطفاً ابتدا مرجع یا استخر مورد نظر جهت ثبت آزمایش را مشخص کنید.");
      return;
    }

    const staticPool = selectedPoolId === "treatment_growout"
      ? { id: "treatment_growout", name: "تصفیه‌خانه پرورش", hallId: "بخش رشد" }
      : selectedPoolId === "treatment_hatchery"
      ? { id: "treatment_hatchery", name: "تصفیه‌خانه سالن تکثیر", hallId: "بخش تکثیر" }
      : selectedPoolId === "salon_boiler"
      ? { id: "salon_boiler", name: "سالن (با بویلر)", hallId: "بویلر فعال" }
      : selectedPoolId === "salon_no_boiler"
      ? { id: "salon_no_boiler", name: "سالن (بدون بویلر)", hallId: "بدون بویلر" }
      : null;

    const pool: any = staticPool
      ? staticPool
      : pools.find(p => p.id === selectedPoolId);
    if (!pool) return;

    const poolNameFormatted = staticPool
      ? staticPool.name
      : `${pool.name} (سالن ${pool.hallId})`;

    const evaluation = evaluateWaterMetrics("water_fixed", { 
      temp,
      o2, 
      ph, 
      salinity,
      orp, 
      conductivity,
      nh4: nh3, 
      nitrate, 
      ozone,
      pathogens, 
      microalgae 
    });

    const frequencyLabel = labSubTab === "water_fixed" 
      ? "ثابت" 
      : labSubTab === "water_portable" 
      ? "پرتابل" 
      : "نمونه برداری زیستی آب";

    const newLog: WaterTestLog = {
      id: `w-${Date.now().toString().slice(-4)}`,
      poolId: selectedPoolId,
      poolName: `${poolNameFormatted} (${frequencyLabel})`,
      date: "1405/03/10",
      timestamp: `1405/03/10 ${new Date().toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit" })}`,
      type: labSubTab === "water_fixed" ? "fixed" : labSubTab === "water_portable" ? "portable" : "bio",
      temperature: temp,
      oxygenLevel: o2,
      phLevel: ph,
      salinity: salinity,
      nitriteLevel: no2,
      ammoniaLevel: nh3,
      nitrateLevel: nitrate,
      hardnessKH: hardnessKH,
      orp: orp,
      conductivity: conductivity,
      probeStatus: probeStatus,
      deviceModel: deviceModel || "دستگاه هیدرولب مولتی پارامتر",
      microalgae: microalgae,
      planktonCount: planktonCount,
      pathogens: pathogens,
      transparency: transparency,
      status: evaluation.status,
      statusText: evaluation.desc
    };

    setWaterLogs([newLog, ...waterLogs]);
    setSuccessMessage(`نتایج آنالیز شیلاتی ${poolNameFormatted} برای ${frequencyLabel} با موفقیت در سیستم ثبت شد.`);
    setAiResult("");
  };

  // Add Ultrasound log
  const handleSaveUltrasoundAnalysis = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!sonPoolId) {
      setErrorMessage("لطفاً استخر منتخب مولدین خاویاری را برگزینید.");
      return;
    }

    if (!tagId.trim()) {
      setErrorMessage("لطفاً شماره پلاک میکروچیپ تاس‌ماهی را وارد فرمایید.");
      return;
    }

    const pool = pools.find(p => p.id === sonPoolId);
    if (!pool) return;

    let computedRec = "پایش مستمر مولدین.";
    if (gender === "Male") {
      computedRec = "تایید پتانسیل بارورسازی اسپرم، انتقال به بستر سرد.";
    } else if (gender === "Juvenile") {
      computedRec = "اندام‌ها نابالغ است. ارزیابی مجدد سونوگرافی ۲ سال آینده نیاز است.";
    } else {
      if (stage === "Stage IV") {
        computedRec = `✨ کاندید تایید شده استحصال خاویار درجه یک با قطر ممتاز ${eggDiameter}mm و غشای ایده‌آل. شوک سرمایی تانکی تجویز می‌گردد.`;
      } else if (stage === "Stage III") {
        computedRec = "ماهی در دوره ویتلوژنز یا چربی‌گذاری سلولی است. تغذیه با ویتامین‌های حمایتی توصیه می‌شود.";
      } else if (stage === "Stage V") {
        computedRec = "تخمک‌ها لقاح‌نیافته و رو به تخریب هستند. تعجیل در تزریق هورمونی یا تخلیه غدد جنسی.";
      } else {
        computedRec = "رسیدگی جنسی ضعیف (مرحله یک یا دو)، خوراک پرپروتئین مضاف داده شود.";
      }
    }

    const newLog: SonographyLog = {
      id: `u-${Date.now().toString().slice(-4)}`,
      poolId: sonPoolId,
      poolName: `${pool.name} (سالن ${pool.hallId})`,
      date: "1405/03/10",
      timestamp: `1405/03/10 ${new Date().toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit" })}`,
      tagId,
      gender: gender === "Female" ? "ماده (Female)" : gender === "Male" ? "نر (Male)" : "نابالغ (Juvenile)",
      maturityStage: stage,
      eggDiameterMm: eggDiameter,
      polarizationIndex: gvIndex,
      recommendation: aiResult || computedRec
    };

    setUltrasoundLogs([newLog, ...ultrasoundLogs]);
    setSuccessMessage(`رکورد بیوپسی و سونوگرام ماهی پلاک ${tagId} با موفقیت ذخیره گردید.`);
    setAiResult("");
    setTagId("");
  };

  const deleteWaterLog = (id: string) => {
    setWaterLogs(waterLogs.filter(log => log.id !== id));
  };

  const deleteUltrasoundLog = (id: string) => {
    setUltrasoundLogs(ultrasoundLogs.filter(log => log.id !== id));
  };

  // Call the dedicated full stack endpoint for laboratory AI advisor
  const handleFetchAiLabReport = async () => {
    setErrorMessage("");
    setSuccessMessage("");
    setAiResult("");

    const targetPoolId = labSubTab === "ultrasound" ? sonPoolId : selectedPoolId;
    if (!targetPoolId) {
      setErrorMessage("لطفاً ابتدا محل یا استخر مورد نظر را برگزینید تا پارامترهای آنالیز برای پزشک آزمایشگاه ارسال گردد.");
      return;
    }

    const staticPool = targetPoolId === "treatment_growout"
      ? { id: "treatment_growout", name: "تصفیه‌خانه پرورش", hallId: "بخش رشد" }
      : targetPoolId === "treatment_hatchery"
      ? { id: "treatment_hatchery", name: "تصفیه‌خانه سالن تکثیر", hallId: "بخش تکثیر" }
      : targetPoolId === "salon_boiler"
      ? { id: "salon_boiler", name: "سالن (با بویلر)", hallId: "بویلر فعال" }
      : targetPoolId === "salon_no_boiler"
      ? { id: "salon_no_boiler", name: "سالن (بدون بویلر)", hallId: "بدون بویلر" }
      : null;

    const pool: any = staticPool
      ? staticPool
      : pools.find(p => p.id === targetPoolId);
    if (!pool) return;

    const poolNameFormatted = staticPool
      ? staticPool.name
      : `${pool.name} (سالن ${pool.hallId})`;

    setIsDiagnosing(true);

    let payload: any;
    if (labSubTab === "ultrasound") {
      payload = {
        type: "ultrasound",
        data: {
          poolName: poolNameFormatted,
          tagId,
          gender,
          stage,
          eggDiameter,
          gvIndex
        }
      };
    } else {
      let customData: any = {
        poolName: poolNameFormatted,
        temp,
        o2,
        ph,
        salinity,
        orp,
        conductivity,
        probeStatus,
        no2,
        nh3,
        nitrateLevel: nitrate,
        hardnessKH,
        deviceModel: deviceModel || "دستگاه هیدرولب مولتی پارامتر",
        microalgae,
        planktonCount,
        pathogens,
        transparency
      };

      if (labSubTab === "water_fixed") {
        customData.subType = "پایش و سنجش ثابت خروجی تصفیه‌خانه و منابع آبی";
      } else if (labSubTab === "water_portable") {
        customData.subType = "آنالیز و غربالگری پرتابل کل فاکتورهای خروجی و استخرها";
      } else {
        customData.subType = "نمونه برداری زیستی آب پرورش و خروجی تصفیه خانه";
      }

      payload = {
        type: "water",
        data: customData
      };
    }

    try {
      const res = await fetch("/api/diagnose-lab", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const resData = await res.json();
      if (resData.success) {
        setAiResult(resData.diagnosis);
        setSuccessMessage("تحلیل تخصصی زیست‌محیطی با موفقیت دریافت گردید.");
      } else {
        setErrorMessage("ایراد در ارتباط با هسته هوش مصنوعی؛ توصیه عمومی شیلاتی صادر شد.");
      }
    } catch (err) {
      console.error(err);
      setErrorMessage("خطا در شبکه با این وجود یک توصیه محلی باکیفیت ارائه شد.");
    } finally {
      setIsDiagnosing(false);
    }
  };

  const renderAllWaterFactorsForm = () => {
    return (
      <div className="space-y-4">
        {/* جدول راهنمای سریع استانداردهای مرجع آنالیز آب */}
        <div className="bg-gradient-to-r from-[#1A2E26] to-[#0D1813] text-white p-3.5 rounded-2xl shadow-sm border border-emerald-500/20 space-y-2">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-emerald-400" />
              جدول مرجع استانداردهای کیفی آب پرورش ماهی خاویاری
            </span>
            <span className="text-[10px] font-mono text-emerald-200/80 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/30">
              محدوده مجاز + هدف بهینه
            </span>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-9 gap-1.5 text-center text-[10px]">
            <div className="bg-white/5 p-1.5 rounded-xl border border-white/10">
              <div className="text-emerald-400 font-bold">دما (Temp)</div>
              <div className="text-[9px] text-gray-300">۱۰ تا ۲۵ °C</div>
              <div className="text-emerald-300 font-bold text-[9px]">بهترین: ۱۸</div>
            </div>
            <div className="bg-white/5 p-1.5 rounded-xl border border-white/10">
              <div className="text-cyan-400 font-bold">اکسیژن (DO)</div>
              <div className="text-[9px] text-gray-300">۴.۵ تا ۸ mg/L</div>
              <div className="text-cyan-300 font-bold text-[9px]">بهترین: ۷</div>
            </div>
            <div className="bg-white/5 p-1.5 rounded-xl border border-white/10">
              <div className="text-purple-400 font-bold">پی‌اچ (pH)</div>
              <div className="text-[9px] text-gray-300">۶.۸ تا ۸.۸</div>
              <div className="text-purple-300 font-bold text-[9px]">بهترین: ۷.۸</div>
            </div>
            <div className="bg-white/5 p-1.5 rounded-xl border border-white/10">
              <div className="text-amber-400 font-bold">شوری (Sal)</div>
              <div className="text-[9px] text-gray-300">۰ تا ۱۸ ppt</div>
              <div className="text-amber-300 font-bold text-[9px]">بهترین: ۲ الی ۴</div>
            </div>
            <div className="bg-white/5 p-1.5 rounded-xl border border-white/10">
              <div className="text-yellow-400 font-bold">پتانسیل ORP</div>
              <div className="text-[9px] text-gray-300">&lt; ۳۵۰ mV</div>
              <div className="text-yellow-300 font-bold text-[9px]">بهترین: ۲۵۰</div>
            </div>
            <div className="bg-white/5 p-1.5 rounded-xl border border-white/10">
              <div className="text-emerald-400 font-bold">هدایت EC</div>
              <div className="text-[9px] text-gray-300">حداکثر ۱۸۰۰</div>
              <div className="text-emerald-300 font-bold text-[9px]">بهترین: ۸۰۰</div>
            </div>
            <div className="bg-white/5 p-1.5 rounded-xl border border-white/10">
              <div className="text-rose-400 font-bold">آمونیوم NH4</div>
              <div className="text-[9px] text-gray-300">&lt; ۱ mg/L</div>
              <div className="text-rose-300 font-bold text-[9px]">بهترین: &lt; ۰.۵</div>
            </div>
            <div className="bg-white/5 p-1.5 rounded-xl border border-white/10">
              <div className="text-orange-400 font-bold">نیترات NO3</div>
              <div className="text-[9px] text-gray-300">&lt; ۲ mg/L</div>
              <div className="text-orange-300 font-bold text-[9px]">بهترین: &lt; ۱</div>
            </div>
            <div className="bg-white/5 p-1.5 rounded-xl border border-white/10">
              <div className="text-blue-400 font-bold">اوزون Ozone</div>
              <div className="text-[9px] text-gray-300">&lt; ۰.۰۸ mg/L</div>
              <div className="text-blue-300 font-bold text-[9px]">بهترین: &lt; ۰.۰۵</div>
            </div>
          </div>
        </div>

        {/* بخش اول: خصوصیات فیزیکی و شیمیایی پایه */}
        <div className="border border-natural-border/60 bg-[#FBF9F1] p-4 rounded-2xl">
          <span className="text-[11px] text-natural-dark font-extrabold flex items-center justify-between mb-3">
            <span className="flex items-center gap-1.5">
              <Thermometer size={14} className="text-natural-earth" />
              گروه الف: پارامترهای فیزیکی و فیزیکوشیمیایی پایه
            </span>
            <span className="text-[10px] text-natural-earth font-mono">Temp / DO / pH / Salinity</span>
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* دمای نمونه */}
            <div className="bg-white border border-natural-border/70 p-3 rounded-xl space-y-1">
              <div className="flex justify-between text-[11px] font-semibold text-natural-text">
                <span>دمای آب (Temp):</span>
                <strong className="font-mono text-emerald-800 font-bold text-[11px]">{temp} °C</strong>
              </div>
              <input
                type="range"
                min="5"
                max="30"
                step="0.5"
                value={temp}
                onChange={(e) => { setTemp(parseFloat(e.target.value)); setAiResult(""); }}
                className="w-full accent-natural-forest"
              />
              <div className="flex justify-between text-[9px] text-natural-text/70">
                <span className="font-mono text-emerald-700">دامنه ۱۰ الی ۲۵</span>
                <span className="font-bold text-emerald-800">بهترین: ۱۸ °C</span>
              </div>
            </div>

            {/* اکسیژن محلول */}
            <div className="bg-white border border-natural-border/70 p-3 rounded-xl space-y-1">
              <div className="flex justify-between text-[11px] font-semibold text-natural-text">
                <span>اکسیژن محلول (DO):</span>
                <strong className="font-mono text-emerald-800 font-bold text-[11px]">{o2} mg/L</strong>
              </div>
              <input
                type="range"
                min="2.0"
                max="12.0"
                step="0.1"
                value={o2}
                onChange={(e) => { setO2(parseFloat(e.target.value)); setAiResult(""); }}
                className="w-full accent-natural-forest"
              />
              <div className="flex justify-between text-[9px] text-natural-text/70">
                <span className="font-mono text-emerald-700">دامنه ۴.۵ الی ۸</span>
                <span className="font-bold text-emerald-800">بهترین: ۷ mg/L</span>
              </div>
            </div>

            {/* اسیدیته پی‌اچ */}
            <div className="bg-white border border-natural-border/70 p-3 rounded-xl space-y-1">
              <div className="flex justify-between text-[11px] font-semibold text-natural-text">
                <span>پتانسیل اسیدی آب (pH):</span>
                <strong className="font-mono text-emerald-800 font-bold text-[11px]">{ph} pH</strong>
              </div>
              <input
                type="range"
                min="5.5"
                max="9.5"
                step="0.1"
                value={ph}
                onChange={(e) => { setPh(parseFloat(e.target.value)); setAiResult(""); }}
                className="w-full accent-natural-forest"
              />
              <div className="flex justify-between text-[9px] text-natural-text/70">
                <span className="font-mono text-emerald-700">دامنه ۶.۸ الی ۸.۸</span>
                <span className="font-bold text-emerald-800">بهترین: ۷.۸</span>
              </div>
            </div>

            {/* شوری آب */}
            <div className="bg-white border border-natural-border/70 p-3 rounded-xl space-y-1">
              <div className="flex justify-between text-[11px] font-semibold text-natural-text">
                <span>شوری آب (Salinity):</span>
                <strong className="font-mono text-emerald-800 font-bold text-[11px]">{salinity} ppt</strong>
              </div>
              <input
                type="range"
                min="0"
                max="22"
                step="0.1"
                value={salinity}
                onChange={(e) => { setSalinity(parseFloat(e.target.value)); setAiResult(""); }}
                className="w-full accent-natural-forest"
              />
              <div className="flex justify-between text-[9px] text-natural-text/70">
                <span className="font-mono text-emerald-700">دامنه ۰ الی ۱۸</span>
                <span className="font-bold text-emerald-800">بهترین: ۲ الی ۴ ppt</span>
              </div>
            </div>
          </div>
        </div>

        {/* بخش دوم: شاخص‌های الکتروکمیکال و مهندسی پساب (ORP, EC, Ozone) */}
        <div className="border border-natural-border/60 bg-[#FBF9F1] p-4 rounded-2xl">
          <span className="text-[11px] text-natural-dark font-extrabold flex items-center justify-between mb-3">
            <span className="flex items-center gap-1.5">
              <Activity size={14} className="text-emerald-600 animate-pulse" />
              گروه ب: فاکتورهای الکتروشیمیایی و ضدعفونی موثر (ORP, EC, Ozone)
            </span>
            <span className="text-[10px] text-emerald-700 font-mono">ORP / EC / Ozone</span>
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            {/* پتانسیل ردوکس ORP */}
            <div className="bg-white border border-natural-border/70 p-2.5 rounded-xl space-y-1">
              <label className="block text-[10px] text-natural-text font-bold mb-0.5">
                پتانسیل اکسیداسیون (ORP - mV):
              </label>
              <input
                type="number"
                min="0"
                max="500"
                value={orp}
                onChange={(e) => { setOrp(parseInt(e.target.value) || 0); setAiResult(""); }}
                className="w-full text-xs rounded-lg border border-natural-border p-2 bg-white font-bold font-mono text-center text-emerald-900"
              />
              <span className="text-[9px] text-emerald-700 font-semibold block text-center mt-1">
                کمتر از ۳۵۰ (بهترین ۲۵۰)
              </span>
            </div>

            {/* هدایت الکتریکی آب EC */}
            <div className="bg-white border border-natural-border/70 p-2.5 rounded-xl space-y-1">
              <label className="block text-[10px] text-natural-text font-bold mb-0.5">
                هدایت الکتریکی (EC - µS/cm):
              </label>
              <input
                type="number"
                min="0"
                max="3000"
                value={conductivity}
                onChange={(e) => { setConductivity(parseInt(e.target.value) || 0); setAiResult(""); }}
                className="w-full text-xs rounded-lg border border-natural-border p-2 bg-white font-bold font-mono text-center text-emerald-900"
              />
              <span className="text-[9px] text-emerald-700 font-semibold block text-center mt-1">
                حداکثر ۱۸۰۰ (بهترین ۸۰۰)
              </span>
            </div>

            {/* باقیمانده اوزون Ozone */}
            <div className="bg-white border border-natural-border/70 p-2.5 rounded-xl space-y-1">
              <label className="block text-[10px] text-natural-text font-bold mb-0.5">
                باقیمانده اوزون (Ozone - mg/L):
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="0.5"
                value={ozone}
                onChange={(e) => { setOzone(parseFloat(e.target.value) || 0); setAiResult(""); }}
                className="w-full text-xs rounded-lg border border-natural-border p-2 bg-white font-bold font-mono text-center text-blue-900"
              />
              <span className="text-[9px] text-blue-700 font-semibold block text-center mt-1">
                کمتر از ۰.۰۸ (بهترین کمتر از ۰.۰۵)
              </span>
            </div>
          </div>
        </div>

        {/* بخش سوم: ترکیبات نیتروژنه و ترکیبات هیدروشیمی (NH4, NO3) */}
        <div className="border border-natural-border/60 bg-[#FBF9F1] p-4 rounded-2xl">
          <span className="text-[11px] text-natural-dark font-extrabold flex items-center justify-between mb-3">
            <span className="flex items-center gap-1.5">
              <FlaskConical size={14} className="text-amber-600" />
              گروه ج: ترکیبات نیتروژنه و سختی کربناته (NH4, NO3, NO2, KH)
            </span>
            <span className="text-[10px] text-amber-700 font-mono">NH4 / NO3 / NO2 / KH</span>
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* آمونیوم NH4 */}
            <div className="bg-white border border-natural-border/70 p-2.5 rounded-xl space-y-1">
              <label className="block text-[10px] text-natural-text font-bold mb-0.5">
                آمونیوم (NH4 - mg/L):
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="5"
                value={nh3}
                onChange={(e) => { setNh3(parseFloat(e.target.value) || 0); setAiResult(""); }}
                className="w-full text-xs rounded-lg border border-natural-border p-2 bg-white font-bold font-mono text-center text-rose-800"
              />
              <span className="text-[9px] text-rose-700 font-semibold block text-center mt-1">
                کمتر از ۱ (بهترین کمتر از ۰.۵)
              </span>
            </div>

            {/* نیترات NO3 */}
            <div className="bg-white border border-natural-border/70 p-2.5 rounded-xl space-y-1">
              <label className="block text-[10px] text-natural-text font-bold mb-0.5">
                نیترات (NO3 - mg/L):
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="20"
                value={nitrate}
                onChange={(e) => { setNitrate(parseFloat(e.target.value) || 0); setAiResult(""); }}
                className="w-full text-xs rounded-lg border border-natural-border p-2 bg-white font-bold font-mono text-center text-orange-800"
              />
              <span className="text-[9px] text-orange-700 font-semibold block text-center mt-1">
                کمتر از ۲ (بهترین کمتر از ۱)
              </span>
            </div>

            {/* نیتریت NO2 */}
            <div className="bg-white border border-natural-border/70 p-2.5 rounded-xl space-y-1">
              <label className="block text-[10px] text-natural-text font-bold mb-0.5">
                نیتریت (NO2 - mg/L):
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="5"
                value={no2}
                onChange={(e) => { setNo2(parseFloat(e.target.value) || 0); setAiResult(""); }}
                className="w-full text-xs rounded-lg border border-natural-border p-2 bg-white font-bold font-mono text-center text-amber-800"
              />
              <span className="text-[9px] text-amber-700 font-semibold block text-center mt-1">
                بحرانی: بالای ۰.۱۵
              </span>
            </div>

            {/* سختی کربناته dKH */}
            <div className="bg-white border border-natural-border/70 p-2.5 rounded-xl space-y-1">
              <label className="block text-[10px] text-natural-text font-bold mb-0.5">
                سختی آب (KH - dKH):
              </label>
              <input
                type="number"
                min="0"
                max="30"
                value={hardnessKH}
                onChange={(e) => { setHardnessKH(parseInt(e.target.value) || 0); setAiResult(""); }}
                className="w-full text-xs rounded-lg border border-natural-border p-2 bg-white font-bold font-mono text-center text-emerald-800"
              />
              <span className="text-[9px] text-natural-text/60 block text-center mt-1">
                بافر کربنات کلسیم
              </span>
            </div>
          </div>
        </div>

        {/* بخش چهارم: زیست‌بوم پلانکتونی و کشت باکتریایی پساب */}
        <div className="border border-natural-border/60 bg-[#FBF9F1] p-4 rounded-2xl">
          <span className="text-[11px] text-natural-dark font-extrabold flex items-center justify-between mb-3">
            <span className="flex items-center gap-1.5">
              <Microscope size={14} className="text-blue-600" />
              گروه د: پایش هیدروبیولوژیک و پاتوژن‌های زیستی فعال
            </span>
            <span className="text-[10px] text-blue-700 font-mono">Microalgae / Plankton / Pathogens</span>
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            {/* جلبک غالب */}
            <div>
              <label className="block text-[10px] text-natural-text font-bold mb-1">
                میکروجلبک غالب خروجی:
              </label>
              <select
                value={microalgae}
                onChange={(e) => { setMicroalgae(e.target.value); setAiResult(""); }}
                className="w-full text-xs rounded-xl border border-natural-border p-2 bg-white focus:outline-none font-semibold text-center text-natural-dark"
              >
                <option value="کلورلا (Chlorella)">کلورلا (Chlorella) - مطلوب عمومی</option>
                <option value="دیاتومه (Diatoms)">دیاتومه‌ سلیس (Diatoms)</option>
                <option value="سیانوباکتر (Cyanobacteria / زهرآگین)">سیانوباکترهای سمی آزاد (کبودخزه)</option>
                <option value="تاژک‌داران خزند (Dinoflagellates)">دینوفلاژله‌های کشند سرخ شدید</option>
              </select>
            </div>
            {/* تراکم فیتوپلانکتونی */}
            <div>
              <label className="block text-[10px] text-natural-text font-bold mb-1">
                تراکم فیتوپلانکتون (سلول/mL):
              </label>
              <input
                type="number"
                step="500"
                min="0"
                value={planktonCount}
                onChange={(e) => { setPlanktonCount(parseInt(e.target.value) || 0); setAiResult(""); }}
                className="w-full text-xs rounded-xl border border-natural-border p-2 bg-white focus:outline-none text-center font-bold font-mono text-[#1A2E26]"
              />
            </div>
            {/* پاتوژن بررسی باکتریایی */}
            <div>
              <label className="block text-[10px] text-natural-text font-bold mb-1">
                وضعیت باکتری‌ها و انگل‌ها:
              </label>
              <select
                value={pathogens}
                onChange={(e) => { setPathogens(e.target.value); setAiResult(""); }}
                className="w-full text-xs rounded-xl border border-natural-border p-2 bg-white focus:outline-none font-semibold text-center text-natural-dark"
              >
                <option value="منفی (عادی و فاقد استرپتوکوکوس شانی)">منفی - پاک و فاقد پاتوژن فعال</option>
                <option value="مثبت (بار باکتریایی معلق خفیف)">مثبت - حضور باکتریایی پراکنده خفیف</option>
                <option value="مثبت (بار شدید آئروموناس شیلاتی)">مثبت - عفونت شدید آئروموناس</option>
                <option value="مثبت (کلونی شدید استرپتوکوکوزیس)">مثبت - طغیان کلونی استرپتوکوکوزیس</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div id="lab-manager-module" className="space-y-6">
      
      {/* HEADER DECORATOR & SWITCH TABS */}
      <div className="bg-white rounded-3xl p-6 border border-natural-border shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b border-natural-border">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-natural-khaki text-natural-dark rounded-2xl flex items-center justify-center font-bold">
              <FlaskConical size={22} className="text-natural-dark animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg font-black text-natural-dark font-sans">آزمایشگاه بیومتری و کنترل کیفی هیدروشیمی</h2>
              <p className="text-xs text-natural-text/70 font-sans mt-0.5">
                پایش لحظه‌ای فیزیکوشیمی آب استخرها و کلاس‌بندی سونوگرافی جنسی مولدین خاویاری و فیل‌ماهیان
              </p>
            </div>
          </div>          <div className="flex flex-wrap gap-1.5 p-1 bg-natural-khaki rounded-2xl border border-natural-border/60 self-stretch sm:self-auto justify-center">
            <button
              onClick={() => {
                setLabSubTab("water_fixed");
                setAiResult("");
                setErrorMessage("");
                setSuccessMessage("");
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                labSubTab === "water_fixed"
                  ? "bg-natural-forest text-white shadow-sm"
                  : "text-natural-text/70 hover:bg-natural-khaki/60"
              }`}
            >
              <Clock size={13} />
              ثابت
            </button>
            <button
              onClick={() => {
                setLabSubTab("water_portable");
                setAiResult("");
                setErrorMessage("");
                setSuccessMessage("");
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                labSubTab === "water_portable"
                  ? "bg-natural-forest text-white shadow-sm"
                  : "text-natural-text/70 hover:bg-natural-khaki/60"
              }`}
            >
              <Activity size={13} />
              پرتابل
            </button>
            <button
              onClick={() => {
                setLabSubTab("water_bio");
                setAiResult("");
                setErrorMessage("");
                setSuccessMessage("");
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                labSubTab === "water_bio"
                  ? "bg-natural-forest text-white shadow-sm"
                  : "text-natural-text/70 hover:bg-natural-khaki/60"
              }`}
            >
              <FlaskConical size={13} />
              نمونه برداری زیستی آب
            </button>
            <button
              onClick={() => {
                setLabSubTab("ultrasound");
                setAiResult("");
                setErrorMessage("");
                setSuccessMessage("");
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                labSubTab === "ultrasound"
                  ? "bg-natural-forest text-white shadow-sm"
                  : "text-natural-text/70 hover:bg-natural-khaki/60"
              }`}
            >
              <Dna size={13} />
              سونوگرافی مولدین
            </button>
          </div>
        </div>

        {/* CONTAINER WORKSPACES */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT FORM FIELD DECORATOR: 7 COLS */}
          <div className="lg:col-span-7 space-y-6">
            
            {labSubTab === "water_fixed" && (
              /* TAB 1A PAGE: WEEKLY OUTLET CHECK */
              <form onSubmit={handleSaveWaterAnalysis} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-natural-text font-bold mb-1">استخر یا منبع پایش ثابت خروجی:</label>
                    <select
                      value={selectedPoolId}
                      onChange={(e) => {
                        setSelectedPoolId(e.target.value);
                        setErrorMessage("");
                        setSuccessMessage("");
                        setAiResult("");
                      }}
                      className="w-full text-xs font-sans rounded-xl border border-natural-border p-2.5 bg-[#FDFCF8] focus:border-natural-earth focus:outline-none text-natural-dark font-medium"
                      required
                    >
                      <option value="">-- انتخاب منبع یا استخر --</option>
                      <option value="treatment_growout">تصفیه‌خانه پرورش</option>
                      <option value="treatment_hatchery">تصفیه‌خانه سالن تکثیر</option>
                      <option value="salon_boiler">سالن با بویلر</option>
                      <option value="salon_no_boiler">سالن بدون بویلر</option>
                      {pools.map(p => (
                        <option key={p.id} value={p.id}>{p.name} (سالن {p.hallId}) - {p.breed}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-natural-text font-bold">بارگذاری شبیه‌سازی ثابت:</span>
                    </div>
                    <div className="flex gap-1.5 h-[38px] items-center">
                      <button
                        type="button"
                        onClick={() => applyFixedPreset("normal")}
                        className="px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] rounded hover:bg-emerald-100 transition-colors cursor-pointer"
                      >
                        نرمال ثابت
                      </button>
                      <button
                        type="button"
                        onClick={() => applyFixedPreset("calib_needed")}
                        className="px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200 text-[10px] rounded hover:bg-amber-100 transition-colors cursor-pointer"
                      >
                        افت اکسیژن ثابت
                      </button>
                      <button
                        type="button"
                        onClick={() => applyFixedPreset("error_state")}
                        className="px-2.5 py-1 bg-red-50 text-red-800 border border-red-200 text-[10px] rounded hover:bg-red-100 transition-colors cursor-pointer"
                      >
                        بحران آمونیاک ثابت
                      </button>
                    </div>
                  </div>
                </div>

                {/* MODULAR FORM RENDERCONTAINER FOR ALL FACTORS */}
                {renderAllWaterFactorsForm()}

                <div className="flex gap-3 justify-end pt-2">
                  <button
                    type="button"
                    onClick={handleFetchAiLabReport}
                    disabled={isDiagnosing || !selectedPoolId}
                    className="px-4 py-3 bg-[#1A2E26] hover:bg-[#2D4A3E] text-white font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-40 transition-colors"
                  >
                    {isDiagnosing ? (
                      <>سیستم پایش در حال پردازش...</>
                    ) : (
                      <>
                        <Sparkles size={14} className="text-yellow-400 fill-yellow-400" />
                        تفسیر سنجه ثابت (AI)
                      </>
                    )}
                  </button>

                  <button
                    type="submit"
                    className="px-4 py-3 bg-natural-forest hover:bg-natural-forest-hover text-white font-bold rounded-xl text-xs cursor-pointer shadow-sm transition-colors"
                  >
                    ثبت سند پایش ثابت خروجی
                  </button>
                </div>
              </form>
            )}

            {labSubTab === "water_portable" && (
              /* TAB 1B PAGE: PORTABLE OUTLET CHECK */
              <form onSubmit={handleSaveWaterAnalysis} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-natural-text font-bold mb-1">استخر یا منبع پایش پرتابل خروجی:</label>
                    <select
                      value={selectedPoolId}
                      onChange={(e) => {
                        setSelectedPoolId(e.target.value);
                        setErrorMessage("");
                        setSuccessMessage("");
                        setAiResult("");
                      }}
                      className="w-full text-xs font-sans rounded-xl border border-natural-border p-2.5 bg-[#FDFCF8] focus:border-natural-earth focus:outline-none text-natural-dark font-medium"
                      required
                    >
                      <option value="">-- انتخاب منبع یا استخر --</option>
                      <option value="treatment_growout">تصفیه‌خانه پرورش</option>
                      <option value="treatment_hatchery">تصفیه‌خانه سالن تکثیر</option>
                      <option value="salon_boiler">سالن با بویلر</option>
                      <option value="salon_no_boiler">سالن بدون بویلر</option>
                      {pools.map(p => (
                        <option key={p.id} value={p.id}>{p.name} (سالن {p.hallId}) - {p.breed}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-natural-text font-bold">بارگذاری شبیه‌سازی پرتابل:</span>
                    </div>
                    <div className="flex gap-1.5 h-[38px] items-center">
                      <button
                        type="button"
                        onClick={() => applyPortablePreset("ideal")}
                        className="px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] rounded hover:bg-emerald-100 transition-colors cursor-pointer"
                      >
                        نرمال پرتابل
                      </button>
                      <button
                        type="button"
                        onClick={() => applyPortablePreset("toxic")}
                        className="px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200 text-[10px] rounded hover:bg-amber-100 transition-colors cursor-pointer"
                      >
                        انباشت نیترات پرتابل
                      </button>
                      <button
                        type="button"
                        onClick={() => applyPortablePreset("saline_warning")}
                        className="px-2.5 py-1 bg-red-50 text-red-800 border border-red-200 text-[10px] rounded hover:bg-red-100 transition-colors cursor-pointer"
                      >
                        طغیان پاتوژن پرتابل
                      </button>
                    </div>
                  </div>
                </div>

                {/* MODULAR FORM RENDERCONTAINER FOR ALL FACTORS */}
                {renderAllWaterFactorsForm()}

                <div className="flex gap-3 justify-end pt-2">
                  <button
                    type="button"
                    onClick={handleFetchAiLabReport}
                    disabled={isDiagnosing || !selectedPoolId}
                    className="px-4 py-3 bg-[#1A2E26] hover:bg-[#2D4A3E] text-white font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-40 transition-colors"
                  >
                    {isDiagnosing ? (
                      <>سیستم پایش در حال پردازش...</>
                    ) : (
                      <>
                        <Sparkles size={14} className="text-yellow-400 fill-yellow-400" />
                        تفسیر سنجه پرتابل (AI)
                      </>
                    )}
                  </button>

                  <button
                    type="submit"
                    className="px-4 py-3 bg-natural-forest hover:bg-natural-forest-hover text-white font-bold rounded-xl text-xs cursor-pointer shadow-sm transition-colors"
                  >
                    ثبت سند پایش پرتابل خروجی
                  </button>
                </div>
              </form>
            )}

            {labSubTab === "water_bio" && (
              /* TAB 1C PAGE: BIO OUTLET CHECK */
              <form onSubmit={handleSaveWaterAnalysis} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-natural-text font-bold mb-1">استخر یا منبع نمونه برداری زیستی آب:</label>
                    <select
                      value={selectedPoolId}
                      onChange={(e) => {
                        setSelectedPoolId(e.target.value);
                        setErrorMessage("");
                        setSuccessMessage("");
                        setAiResult("");
                      }}
                      className="w-full text-xs font-sans rounded-xl border border-natural-border p-2.5 bg-[#FDFCF8] focus:border-natural-earth focus:outline-none text-natural-dark font-medium"
                      required
                    >
                      <option value="">-- انتخاب منبع یا استخر --</option>
                      <option value="treatment_growout">تصفیه‌خانه پرورش</option>
                      <option value="treatment_hatchery">تصفیه‌خانه سالن تکثیر</option>
                      <option value="salon_boiler">سالن با بویلر</option>
                      <option value="salon_no_boiler">سالن بدون بویلر</option>
                      {pools.map(p => (
                        <option key={p.id} value={p.id}>{p.name} (سالن {p.hallId}) - {p.breed}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-natural-text font-bold">بارگذاری شبیه‌سازی زیستی آب:</span>
                    </div>
                    <div className="flex gap-1.5 h-[38px] items-center">
                      <button
                        type="button"
                        onClick={() => applyBioPreset("normal")}
                        className="px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] rounded hover:bg-emerald-100 transition-colors cursor-pointer"
                      >
                        نرمال زیستی
                      </button>
                      <button
                        type="button"
                        onClick={() => applyBioPreset("algae_bloom")}
                        className="px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200 text-[10px] rounded hover:bg-amber-100 transition-colors cursor-pointer"
                      >
                        رسوب سنگین زیستی
                      </button>
                      <button
                        type="button"
                        onClick={() => applyBioPreset("pathogen_load")}
                        className="px-2.5 py-1 bg-red-50 text-red-800 border border-red-200 text-[10px] rounded hover:bg-red-100 transition-colors cursor-pointer"
                      >
                        بحران سختی و شوری زیستی
                      </button>
                    </div>
                  </div>
                </div>

                {/* MODULAR FORM RENDERCONTAINER FOR ALL FACTORS */}
                {renderAllWaterFactorsForm()}

                <div className="flex gap-3 justify-end pt-2">
                  <button
                    type="button"
                    onClick={handleFetchAiLabReport}
                    disabled={isDiagnosing || !selectedPoolId}
                    className="px-4 py-3 bg-[#1A2E26] hover:bg-[#2D4A3E] text-white font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-40 transition-colors"
                  >
                    {isDiagnosing ? (
                      <>سیستم پایش در حال پردازش...</>
                    ) : (
                      <>
                        <Sparkles size={14} className="text-yellow-400 fill-yellow-400" />
                        تفسیر نمونه برداری زیستی آب (AI)
                      </>
                    )}
                  </button>

                  <button
                    type="submit"
                    className="px-4 py-3 bg-natural-forest hover:bg-natural-forest-hover text-white font-bold rounded-xl text-xs cursor-pointer shadow-sm transition-colors"
                  >
                    ثبت سند نمونه برداری زیستی آب
                  </button>
                </div>
              </form>
            )}

            {labSubTab === "ultrasound" && (
              /* TAB 2 PAGE: ULTRASOUND BROODSTOCK WORKSPACE */
              <form onSubmit={handleSaveUltrasoundAnalysis} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-natural-text font-bold mb-1">حوضچه مولدین خاویار:</label>
                    <select
                      value={sonPoolId}
                      onChange={(e) => {
                        setSonPoolId(e.target.value);
                        setErrorMessage("");
                        setSuccessMessage("");
                        setAiResult("");
                      }}
                      className="w-full text-xs font-sans rounded-xl border border-natural-border p-2.5 bg-[#FDFCF8] focus:border-natural-earth focus:outline-none text-natural-dark font-medium"
                      required
                    >
                      <option value="">-- انتخاب استخر مولدین --</option>
                      {pools.map(p => (
                        <option key={p.id} value={p.id}>{p.name} ({p.purpose}) - {p.breed}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <span className="block text-xs text-natural-text font-bold mb-1">بارگذاری فرضی سونوگرافی جنسی:</span>
                    <div className="flex gap-1.5 h-[38px] items-center">
                      <button
                        type="button"
                        onClick={() => applyUltrasoundPreset("prime_female")}
                        className="px-2.5 py-1 bg-[#2D4A3E]/10 text-[#2D4A3E] border border-natural-border/80 text-[10px] rounded hover:bg-[#2D4A3E]/20 transition-colors font-bold cursor-pointer"
                      >
                        ماده رسیده (خاویار طلایی)
                      </button>
                      <button
                        type="button"
                        onClick={() => applyUltrasoundPreset("young")}
                        className="px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200 text-[10px] rounded hover:bg-amber-100 transition-colors cursor-pointer"
                      >
                        نابالغ سال دوم
                      </button>
                      <button
                        type="button"
                        onClick={() => applyUltrasoundPreset("male")}
                        className="px-2.5 py-1 bg-cyan-50 text-cyan-800 border border-cyan-200 text-[10px] rounded hover:bg-cyan-100 transition-colors cursor-pointer"
                      >
                        نر بالغ مولد
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs text-natural-text font-bold mb-1">شماره پلاک میکروچیپ (تاگ ID):</label>
                    <input
                      type="text"
                      value={tagId}
                      onChange={(e) => { setTagId(e.target.value); setAiResult(""); }}
                      placeholder="مثال: BEL-3928 یا SIB-4412"
                      className="w-full text-xs font-sans rounded-xl border border-natural-border p-2.5 bg-[#FDFCF8] focus:outline-none text-center font-bold text-natural-dark font-mono"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-natural-text font-bold mb-1">تعیین جنسیت جنسی:</label>
                    <select
                      value={gender}
                      onChange={(e) => { setGender(e.target.value); setAiResult(""); }}
                      className="w-full text-xs font-sans rounded-xl border border-natural-border p-2.5 bg-[#FDFCF8] focus:outline-none text-natural-dark font-bold text-center"
                    >
                      <option value="Female">ماده (Female)</option>
                      <option value="Male">نر (Male)</option>
                      <option value="Juvenile">نابالغ (Juvenile)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs text-natural-text font-bold mb-1">مرحله رسیدگی تخمدان (Maturity Stage):</label>
                    <select
                      value={stage}
                      disabled={gender !== "Female"}
                      onChange={(e) => { setStage(e.target.value); setAiResult(""); }}
                      className="w-full text-xs font-sans rounded-xl border border-natural-border p-2.5 bg-[#FDFCF8] focus:outline-none text-natural-dark font-bold text-center disabled:opacity-40"
                    >
                      <option value="Stage I">مرحله ۱ (رشد گنادال اولیه)</option>
                      <option value="Stage II">مرحله ۲ (رسیدگی پتروفیزیکی ذرات)</option>
                      <option value="Stage III">مرحله ۳ (دوره زرده‌افزایی Vitellogenesis)</option>
                      <option value="Stage IV">مرحله ۴ (خاویار رسیده ایده آل صید/استحصال)</option>
                      <option value="Stage V">مرحله ۵ (تخمک ریزی و رانیگ آزاد تخم)</option>
                    </select>
                  </div>
                </div>

                {/* FEMALE MATURITY COEFFICIENTS */}
                {gender === "Female" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#FDFCF8] p-4 rounded-2xl border border-natural-border/80">
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] text-natural-text font-bold">
                        <span>قطر متوسط تخمک (تخم خاویار):</span>
                        <strong className="font-mono text-natural-dark">{eggDiameter} mm</strong>
                      </div>
                      <input
                        type="range"
                        min="0.5"
                        max="4.5"
                        step="0.1"
                        value={eggDiameter}
                        onChange={(e) => { setEggDiameter(parseFloat(e.target.value)); setAiResult(""); }}
                        className="w-full accent-natural-forest"
                      />
                      <div className="flex justify-between text-[8px] text-natural-text/50">
                        <span>کوچک (نابارور)</span>
                        <span>شکلاتی کوچک</span>
                        <span>ممتاز طلایی / رویال (&gt;۳.۲)</span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] text-natural-text font-bold">
                        <span>شاخص پلاریزاسیون تخمک (Polarization GV Index):</span>
                        <strong className="font-mono text-red-500 font-extrabold">{gvIndex}</strong>
                      </div>
                      <input
                        type="range"
                        min="0.01"
                        max="0.25"
                        step="0.01"
                        value={gvIndex}
                        onChange={(e) => { setGvIndex(parseFloat(e.target.value)); setAiResult(""); }}
                        className="w-full accent-natural-forest"
                      />
                      <div className="flex justify-between text-[8px] text-natural-text/50">
                        <span className="text-red-500 font-bold">رسیده ایده آل (&lt;۰.۰۵)</span>
                        <span>آماده هورمون (۰.۰۷)</span>
                        <span>نابالغ نارس (&gt;۰.۱۴)</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex gap-3 justify-end pt-2">
                  <button
                    type="button"
                    onClick={handleFetchAiLabReport}
                    disabled={isDiagnosing || !sonPoolId || !tagId}
                    className="px-4 py-3 bg-[#1A2E26] hover:bg-[#2D4A3E] text-white font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-40 transition-colors"
                  >
                    {isDiagnosing ? (
                      <>بهینه‌سازی تخمین سونوگرام...</>
                    ) : (
                      <>
                        <Sparkles size={14} className="text-yellow-400 fill-yellow-400" />
                        مدل‌سازی ارزش خاویار دهی (AI)
                      </>
                    )}
                  </button>

                  <button
                    type="submit"
                    className="px-4 py-3 bg-natural-forest hover:bg-natural-forest-hover text-white font-bold rounded-xl text-xs cursor-pointer shadow-sm transition-colors"
                  >
                    ثبت سونوگرافی و بایگانی شناسنامه
                  </button>
                </div>
              </form>
            )}

            {/* ERROR AND SUCCESS BLOCKS */}
            {errorMessage && (
              <div className="p-3 bg-natural-clay/10 text-natural-clay border border-natural-clay/20 rounded-xl flex items-center gap-2 font-semibold text-xs leading-relaxed">
                <AlertTriangle size={14} className="shrink-0" />
                <p>{errorMessage}</p>
              </div>
            )}

            {successMessage && (
              <div className="p-3 bg-natural-forest/10 text-natural-forest border border-natural-forest/20 rounded-xl flex items-center gap-2 font-semibold text-xs leading-relaxed">
                <CheckCircle size={14} className="shrink-0" />
                <p>{successMessage}</p>
              </div>
            )}

            {/* AI DIAGNOSTICS DISPLAY CARD */}
            {aiResult && (
              <div id="ai-lab-result-card" className="bg-[#F5F2E8] border border-natural-border rounded-3xl p-5 relative overflow-hidden transition-all duration-300 space-y-3">
                <div className="absolute top-0 right-0 w-32 h-32 bg-natural-forest/5 rounded-full blur-2xl pointer-events-none" />
                <div className="flex items-center gap-2 text-natural-forest font-bold font-sans text-xs">
                  <Sparkles size={14} className="fill-natural-forest" />
                  <span>دیدگاه بیولوژیک و دستورالعمل پایش آزمایشگاه شیلات خاویارسیستم:</span>
                </div>
                
                <div className="bg-white p-4 rounded-xl border border-natural-border text-xs leading-relaxed font-sans text-natural-dark whitespace-pre-wrap max-h-72 overflow-y-auto">
                  {aiResult}
                </div>

                <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-start gap-2 text-[11px] text-amber-900 font-bold leading-relaxed">
                  <AlertTriangle size={16} className="text-amber-600 shrink-0 mt-0.5" />
                  <span>⚠️ هشدار کلینیکی و نظام دامپزشکی: پیشنهادهای درمانی و آنالیزهای صادرشده صرفاً جهت کمک‌تصمیم‌گیری محاسبه گردیده و جایگزین تاییدیه رسمی دامپزشک شیلات فارم نیست. هرگونه تزریق هورمونی یا حمام دارویی الزاماً نیازمند اخذ مجوز مسئول فنی کارگاه است.</span>
                </div>
              </div>
            )}

          </div>

          {/* RIGHT HISTORY LEDGER: 5 COLS */}
          <div className="lg:col-span-5 bg-natural-khaki/40 rounded-3xl p-5 border border-natural-border flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-natural-border">
                <h3 className="text-sm font-bold text-natural-dark flex items-center gap-1.5">
                  <Clock size={16} className="text-natural-earth" />
                  بایگانی نتایج اخیر آزمایشگاهی
                </h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const printWindow = window.open("", "_blank");
                      if (printWindow) {
                        const content = `
                          <html>
                            <head>
                              <title>گزارش آنالیز کیفیت آب و آزمایشگاه کارگاه پرورش خاویاری</title>
                              <style>
                                body { font-family: Tahoma, sans-serif; direction: rtl; padding: 20px; color: #333; }
                                h1 { border-bottom: 2px solid #2d4a3e; padding-bottom: 10px; color: #2d4a3e; font-size: 20px; }
                                table { w-full; border-collapse: collapse; margin-top: 20px; }
                                th, td { border: 1px solid #ddd; padding: 10px; text-align: right; font-size: 12px; }
                                th { bg-color: #f5f2e8; }
                                .badge { padding: 4px 8px; border-radius: 4px; font-weight: bold; }
                                .critical { background: #fee2e2; color: #991b1b; }
                                .warning { background: #fef3c7; color: #92400e; }
                                .normal { background: #d1fae5; color: #065f46; }
                              </style>
                            </head>
                            <body onload="window.print()">
                              <h1>گزارش پایش و آنالیز شیلاتی آب استخرهای پرورش ماهیان خاویاری</h1>
                              <p>تاریخ گزارش: ۱۴۰۵/۰۳/۱۰ | واحد آزمایشگاه شیمی آب و سونوگرافی</p>
                              <table>
                                <thead>
                                  <tr>
                                    <th>شناسه استخر</th>
                                    <th>نوع آزمایش</th>
                                    <th>دما (°C)</th>
                                    <th>اکسیژن (mg/L)</th>
                                    <th>پی‌اچ (pH)</th>
                                    <th>شوری (ppt)</th>
                                    <th>وضعیت نهایی آب</th>
                                    <th>زمان ثبت</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  ${waterLogs.map(log => `
                                    <tr>
                                      <td>${log.poolName}</td>
                                      <td>${log.type === "fixed" ? "ثابت" : log.type === "portable" ? "پرتابل" : "زیستی"}</td>
                                      <td>${formatWaterParam(log.temperature)}</td>
                                      <td>${formatWaterParam(log.oxygenLevel)}</td>
                                      <td>${formatWaterParam(log.phLevel)}</td>
                                      <td>${formatWaterParam(log.salinity)}</td>
                                      <td><span class="badge ${log.status}">${log.statusText}</span></td>
                                      <td>${log.timestamp}</td>
                                    </tr>
                                  `).join("")}
                                </tbody>
                              </table>
                            </body>
                          </html>
                        `;
                        printWindow.document.write(content);
                        printWindow.document.close();
                      }
                    }}
                    className="p-1.5 hover:bg-natural-khaki text-natural-forest rounded border border-natural-border flex items-center gap-1 text-[10px] font-bold cursor-pointer bg-white"
                    title="چاپ فایل گزارش"
                  >
                    <Printer size={12} />
                    چاپ گزارش
                  </button>
                  <span className="text-[9px] bg-white border border-natural-border px-2 py-0.5 rounded-lg text-natural-text/60 font-mono font-bold">
                    {labSubTab === "water_fixed"
                      ? `${waterLogs.filter(l => l.type === "fixed").length} پایش ثابت`
                      : labSubTab === "water_portable"
                      ? `${waterLogs.filter(l => l.type === "portable").length} پایش پرتابل`
                      : labSubTab === "water_bio"
                      ? `${waterLogs.filter(l => l.type === "bio").length} نمونه برداری زیستی`
                      : `${ultrasoundLogs.length} اسکن ثبت شده`}
                  </span>
                </div>
              </div>

              {/* LIST ITEMS WATER_FIXED, PORTABLE, BIO */}
              {labSubTab !== "ultrasound" ? (
                <div className="space-y-3 max-h-[460px] overflow-y-auto pr-0.5">
                  {waterLogs
                    .filter(log => {
                      if (labSubTab === "water_fixed") return log.type === "fixed";
                      if (labSubTab === "water_portable") return log.type === "portable";
                      if (labSubTab === "water_bio") return log.type === "bio";
                      return false;
                    })
                    .map((log) => (
                      <div
                        key={log.id}
                        className="bg-white border border-natural-border p-3.5 rounded-2xl space-y-2.5 shadow-sm hover:border-natural-earth/40 transition-colors"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <strong className="text-xs text-natural-dark font-sans block">{log.poolName}</strong>
                            <span className="text-[9px] text-natural-text/50 font-mono block mt-0.5">{log.timestamp}</span>
                          </div>

                          <button
                            onClick={() => deleteWaterLog(log.id)}
                            className="p-1 hover:bg-red-50 hover:text-red-500 rounded text-natural-text/40 transition-colors cursor-pointer"
                            title="حذف واقعه"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>

                        {/* PARAMETERS PILLS */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 text-[10px] font-mono font-bold text-center">
                          <div className="bg-natural-khaki/60 p-1.5 rounded border border-natural-border/30">
                            <span className="text-[8px] text-natural-text/60 block font-sans">دما (Temp)</span>
                            <span className="text-natural-dark">{formatWaterParam(log.temperature)} °C</span>
                          </div>
                          <div className="bg-natural-khaki/60 p-1.5 rounded border border-natural-border/30">
                            <span className="text-[8px] text-natural-text/60 block font-sans">اکسیژن (DO)</span>
                            <span className="text-natural-dark">{formatWaterParam(log.oxygenLevel)} mg/L</span>
                          </div>
                          <div className="bg-natural-khaki/60 p-1.5 rounded border border-natural-border/30">
                            <span className="text-[8px] text-natural-text/60 block font-sans">اسیدیته (pH)</span>
                            <span className="text-natural-dark">{formatWaterParam(log.phLevel)}</span>
                          </div>

                          {log.type === "fixed" && (
                            <>
                              <div className="bg-natural-khaki/60 p-1.5 rounded border border-natural-border/30">
                                <span className="text-[8px] text-natural-text/60 block font-sans">پتانسیل ORP</span>
                                <span className="text-[#1A2E26]">{log.orp || 0} mV</span>
                              </div>
                              <div className="bg-natural-khaki/60 p-1.5 rounded border border-natural-border/30">
                                <span className="text-[8px] text-natural-text/60 block font-sans">هدایت EC</span>
                                <span className="text-[#1A2E26]">{log.conductivity || 0} µS</span>
                              </div>
                              <div className="bg-natural-khaki/60 p-1.5 rounded border border-natural-border/30">
                                <span className="text-[8px] text-[#2D4A3E] block font-sans">کیفیت پروب</span>
                                <span className="text-[9.5px]">
                                  {log.probeStatus === "calibrated" ? "کالیبره" : "سرویس"}
                                </span>
                              </div>
                            </>
                          )}

                          {log.type === "portable" && (
                            <>
                              <div className="bg-natural-khaki/60 p-1.5 rounded border border-natural-border/30">
                                <span className="text-[8px] text-natural-text/60 block font-sans font-bold">آمونیاک NH3</span>
                                <span className={log.ammoniaLevel && log.ammoniaLevel > 0.01 ? "text-red-600" : "text-emerald-800"}>
                                  {formatWaterParam(log.ammoniaLevel)}
                                </span>
                              </div>
                              <div className="bg-natural-khaki/60 p-1.5 rounded border border-natural-border/30">
                                <span className="text-[8px] text-natural-text/60 block font-sans">نیتریت NO2</span>
                                <span className="text-[#1A2E26]">{formatWaterParam(log.nitriteLevel)}</span>
                              </div>
                              <div className="bg-natural-khaki/60 p-1.5 rounded border border-natural-border/30 text-[9px] truncate">
                                <span className="text-[8px] text-natural-text/60 block font-sans">کیت پرتابل</span>
                                <span className="text-natural-dark text-[9.5px] font-sans truncate" title={log.deviceModel}>
                                  {log.deviceModel || "کیت جنرال"}
                                </span>
                              </div>
                            </>
                          )}

                          {log.type === "bio" && (
                            <>
                              <div className="bg-natural-khaki/60 p-1.5 rounded border border-natural-border/30 text-[9px] truncate">
                                <span className="text-[8px] text-natural-text/60 block font-sans">جلبک غالب</span>
                                <span className="text-natural-dark text-[10px] font-sans truncate" title={log.microalgae}>
                                  {log.microalgae ? log.microalgae.split(" ")[0] : "Chlorella"}
                                </span>
                              </div>
                              <div className="bg-natural-khaki/60 p-1.5 rounded border border-natural-border/30">
                                <span className="text-[8px] text-natural-text/60 block font-sans">پلانکتون</span>
                                <span className="text-[#1A2E26]">{log.planktonCount || 0}</span>
                              </div>
                              <div className="bg-natural-khaki/60 p-1.5 rounded border border-natural-border/30">
                                <span className="text-[8px] text-natural-text/60 block font-sans">کاهش شفافیت</span>
                                <span className="text-[#1A2E26]">{log.transparency || 0} cm</span>
                              </div>
                            </>
                          )}
                        </div>

                        {/* EVALUATION STATUS */}
                        <div className="flex items-center gap-1.5 text-[10px] font-sans border-t border-natural-border/20 pt-2">
                          <span className={`w-2 h-2 rounded-full ${
                            log.status === "critical"
                              ? "bg-red-500"
                              : log.status === "warning"
                              ? "bg-amber-500"
                              : "bg-emerald-500"
                          }`} />
                          <span className={`font-bold ${
                            log.status === "critical"
                              ? "text-red-600"
                              : log.status === "warning"
                              ? "text-amber-600"
                              : "text-emerald-700"
                          }`}>
                            {log.statusText}
                          </span>
                        </div>
                      </div>
                    ))}

                  {waterLogs.filter(log => {
                    if (labSubTab === "water_fixed") return log.type === "fixed";
                    if (labSubTab === "water_portable") return log.type === "portable";
                    if (labSubTab === "water_bio") return log.type === "bio";
                    return false;
                  }).length === 0 && (
                    <div className="text-center py-10 text-xs text-natural-text/40">
                      هیچ آزمایش ثبت شده‌ای در این دسته یافت نشد.
                    </div>
                  )}
                </div>
              ) : (
                /* LIST ITEMS ULTRASOUND */
                <div className="space-y-3 max-h-[460px] overflow-y-auto pr-0.5">
                  {ultrasoundLogs.map((log) => (
                    <div
                      key={log.id}
                      className="bg-white border border-natural-border p-3.5 rounded-2xl space-y-2 box-border shadow-sm hover:border-natural-earth/40 transition-all duration-150"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <strong className="text-xs text-natural-dark font-sans block">{log.poolName}</strong>
                          <span className="text-[9px] text-natural-text/50 font-mono block mt-0.5">پلاک: {log.tagId} | {log.timestamp}</span>
                        </div>

                        <button
                          onClick={() => deleteUltrasoundLog(log.id)}
                          className="p-1 hover:bg-red-50 hover:text-red-500 rounded text-natural-text/40 transition-colors cursor-pointer"
                          title="حذف اسکن"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>

                      {/* BIOPSY STATS */}
                      <div className="flex flex-wrap gap-2 pt-1 font-sans text-[10.5px]">
                        <span className="px-2 py-0.5 bg-natural-khaki text-natural-dark rounded border border-natural-border/30 font-bold">
                          جنسیت: {log.gender}
                        </span>
                        <span className="px-2 py-0.5 bg-natural-khaki text-natural-dark rounded border border-natural-border/30 font-bold">
                          مرحله: {log.maturityStage}
                        </span>
                        {log.eggDiameterMm > 0 && (
                          <span className="px-2 py-0.5 bg-natural-khaki text-natural-dark rounded border border-natural-border/30 font-bold">
                            قطر تخمک: {log.eggDiameterMm} mm
                          </span>
                        )}
                        {log.polarizationIndex > 0 && (
                          <span className="px-2 py-0.5 bg-red-50 text-red-700 rounded border border-red-100 font-mono font-bold">
                            GV: {log.polarizationIndex}
                          </span>
                        )}
                      </div>

                      {/* ADVISORY RECOMMENDATION */}
                      <div className="bg-[#FDFCF8] p-2.5 rounded-xl border border-natural-border mt-1.5 text-[10px] leading-relaxed text-natural-dark flex items-start gap-1">
                        <Zap size={11} className="text-natural-earth shrink-0 mt-0.5" />
                        <p className="font-medium font-sans">
                          {log.recommendation}
                        </p>
                      </div>
                    </div>
                  ))}

                  {ultrasoundLogs.length === 0 && (
                    <div className="text-center py-10 text-xs text-natural-text/40 animate-pulse">
                      هیچ اسکن و بیوپسی جنسی در این واحد به ثبت نرسیده است.
                    </div>
                  )}
                </div>
              )}

            </div>

            <div className="mt-4 pt-3 border-t border-natural-border text-[9.5px] text-natural-text/50 font-sans text-center leading-relaxed">
              * پایش هیدروشیمی منظم تانکی احتمال استرس را ۷۴ درصد مهار کرده و کلاس‌بندی سونوگرام مولدین تضمین کننده خاویار ممتاز الماس خنک دریایی خزر می‌باشد.
            </div>
          </div>

        </div>
      </div>
      
    </div>
  );
}
