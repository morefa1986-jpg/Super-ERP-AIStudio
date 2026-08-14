import React, { useState, useMemo, useEffect } from "react";
import { 
  Building2, 
  Layers, 
  UtensilsCrossed, 
  ArrowRightLeft, 
  HeartCrack, 
  Droplet, 
  Dna, 
  ShieldAlert, 
  TrendingUp, 
  HelpCircle, 
  Sparkles,
  CheckCircle,
  Clock,
  PlusCircle,
  ChevronDown,
  ChevronUp,
  Volume2,
  Info,
  Thermometer,
  Eye,
  Trash2,
  Slash,
  QrCode
} from "lucide-react";
import { Pool, SturgeonBreed, FeedingMeal, MovementLog, MortalityLog, WaterTestLog, SonographyLog } from "../types";

interface PoolQuickLoggerProps {
  pools: Pool[];
  onAddFeedingLog: (
    poolId: string, 
    feedType: string, 
    givenAmountKg: number, 
    eatenPercentage: number,
    estimatedNextMealKg: number
  ) => void;
  onExecuteTransfer: (
    fromId: string, 
    toId: string, 
    amount: number, 
    reason: string, 
    operator: string,
    chipId?: string,
    breed?: SturgeonBreed
  ) => boolean;
  onAddMortalityRecord: (
    poolId: string,
    count: number,
    breed: SturgeonBreed,
    gender: string,
    symptoms: string,
    explanation: string,
    photoUrl: string,
    aiAction: string
  ) => boolean;
  setPools: React.Dispatch<React.SetStateAction<Pool[]>>;
  onInitiateTransfer?: (poolId: string) => void;
  onOpenQrCode?: (pool: Pool) => void;
}

export default function PoolQuickLogger({ 
  pools, 
  onAddFeedingLog, 
  onExecuteTransfer, 
  onAddMortalityRecord,
  setPools,
  onInitiateTransfer,
  onOpenQrCode
}: PoolQuickLoggerProps) {
  // Select pool states
  const [selectedHallId, setSelectedHallId] = useState<number>(1);
  const [selectedPoolId, setSelectedPoolId] = useState<string>("");

  // Populate list of pools in selected hall
  const hallPools = useMemo(() => {
    return pools.filter(p => p.hallId === selectedHallId);
  }, [pools, selectedHallId]);

  // Set default selected pool when hall changes
  useEffect(() => {
    if (hallPools.length > 0) {
      // Find first pool in the hall that has fish, otherwise first pool
      const firstWithFish = hallPools.find(p => p.count > 0);
      setSelectedPoolId(firstWithFish ? firstWithFish.id : hallPools[0].id);
    } else {
      setSelectedPoolId("");
    }
    clearFormStates();
  }, [selectedHallId, hallPools]);

  // Active pool target
  const activePool = useMemo(() => {
    return pools.find(p => p.id === selectedPoolId);
  }, [pools, selectedPoolId]);

  // Feedback notifications
  const [successMsg, setSuccessMsg] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string>("");

  // 1. Biometric & Breed State Fields
  const [poolBreed, setPoolBreed] = useState<SturgeonBreed>(SturgeonBreed.BELUGA);
  const [poolCount, setPoolCount] = useState<number>(0);
  const [poolAvgWeight, setPoolAvgWeight] = useState<number>(0);
  const [poolGender, setPoolGender] = useState<string>("نابالغ (Fingerling/Juvenile)");
  const [poolChipId, setPoolChipId] = useState<string>("");

  // 🔧 Pedigree, CITES, and Verification states
  const [poolPendingVerification, setPoolPendingVerification] = useState<boolean>(false);
  const [poolParentMaleId, setPoolParentMaleId] = useState<string>("");
  const [poolParentFemaleId, setPoolParentFemaleId] = useState<string>("");
  const [poolWithdrawalEndDate, setPoolWithdrawalEndDate] = useState<string>("");
  const [poolCitesExportPermit, setPoolCitesExportPermit] = useState<string>("");
  const [poolCitesAppendixCode, setPoolCitesAppendixCode] = useState<string>("Appendix II");
  const [poolCitesAnnualQuotaAllocated, setPoolCitesAnnualQuotaAllocated] = useState<number>(0);
  const [poolCitesAnnualQuotaRemaining, setPoolCitesAnnualQuotaRemaining] = useState<number>(0);
  const [poolCitesHarvestDate, setPoolCitesHarvestDate] = useState<string>("");

  // Combined fish batches states
  const [batchBreed, setBatchBreed] = useState<SturgeonBreed>(SturgeonBreed.BELUGA);
  const [batchGender, setBatchGender] = useState<string>("نابالغ (Juvenile / Fingerling)");
  const [batchCount, setBatchCount] = useState<number>(100);
  const [batchAvgWeight, setBatchAvgWeight] = useState<number>(500);
  const [batchNotes, setBatchNotes] = useState<string>("");

  // 2. Feeding State Fields
  const [feedKg, setFeedKg] = useState<string>("2.5");
  const [feedType, setFeedType] = useState<string>("پفکی شماره ۴");
  const [eatenPct, setEatenPct] = useState<number>(95);
  const [deprivationActive, setDeprivationActive] = useState<boolean>(false);
  const [deprivationReason, setDeprivationReason] = useState<string>("درمان دوره‌ای پرمنگنات");
  const [herdGrowthRate, setHerdGrowthRate] = useState<number>(1.2); // Expected daily growth rate % of biomass for the sturgeons (typically 0.5% - 2%)

  // 3. Water Height & Volume Calculator fields
  const [waterHeight, setWaterHeight] = useState<string>("1.20"); // in meters
  const [customDiameter, setCustomDiameter] = useState<string>("4.0"); // used if pool is cylindrical
  const [rectLength, setRectLength] = useState<string>("6.0"); // rectangular width/length used for rectangular compartments
  const [rectWidth, setRectWidth] = useState<string>("1.5");

  // 4. Mortality State fields
  const [deadCount, setDeadCount] = useState<number>(1);
  const [deadAvgWeight, setDeadAvgWeight] = useState<number>(100);
  const [mortalitySymptoms, setMortalitySymptoms] = useState<string>("سستی در شنا، پرخونی آبشش‌ها");
  const [mortalityReason, setMortalityReason] = useState<string>("نوسان دما و استرس آمونیاکی");

  // 5. Transfer State fields
  const [batchSectionTab, setBatchSectionTab] = useState<"manage" | "transfer">("manage");
  const [transferDestPoolId, setTransferDestPoolId] = useState<string>("");
  const [transferCount, setTransferCount] = useState<number>(10);
  const [transferReason, setTransferReason] = useState<string>("تعدیل تراکم زیستی تانک");
  const [transferOperator, setTransferOperator] = useState<string>("دفتر نظارت شیلاتی");
  const [transferChipId, setTransferChipId] = useState<string>("");
  const [transferBreed, setTransferBreed] = useState<SturgeonBreed>(SturgeonBreed.BELUGA);

  // 6. Medication & Permanganate (وعده‌های دارویی و پرمنگنات)
  const [medsType, setMedsType] = useState<string>("بدون دارو / مولتی‌ویتامین ساده");
  const [medsDoseGrams, setMedsDoseGrams] = useState<string>("0");
  const [permanganateDosePpm, setPermanganateDosePpm] = useState<string>("0.0"); // PPM dosage
  const [treatmentOperator, setTreatmentOperator] = useState<string>("بخش قرنطینه و سلامت");

  // 7. Nursery feeding states
  const [nurseryEnabled, setNurseryEnabled] = useState<boolean>(false);
  const [nurseryMealsCount, setNurseryMealsCount] = useState<number>(4);
  const [nurseryEggCount, setNurseryEggCount] = useState<string>("5");
  const [nurseryDryFeedKg, setNurseryDryFeedKg] = useState<string>("0.5");
  const [nurseryDaphniaPacks, setNurseryDaphniaPacks] = useState<string>("2");
  const [nurserySchedule, setNurserySchedule] = useState<{ [time: string]: string }>({
    "09:00": "🥚 زرده تخم‌مرغ روزانه",
    "13:00": "🌾 غذای خشک پرورشی ۳٪",
    "17:00": "🌾 غذای خشک پرورشی ۳٪",
    "21:00": "🦠 بیومس دافنی و آرتمیا",
    "01:00": "❌ قطع موقت تغذیه",
    "05:00": "🦠 بیومس دافنی و آرتمیا",
    "08:00": "تراپی - ویتامینه و اسیدآمینه نرسری",
    "20:00": "تراپی - حمام نمک ضد قارچ و انگل"
  });
  const [nurseryMedType, setNurseryMedType] = useState<string>("مولتی‌ویتامین و اسید آمینه هیدروسولوبل");
  const [nurseryMedDoseSec, setNurseryMedDoseSec] = useState<string>("5");

  // Automatically update form presets when activePool changes
  useEffect(() => {
    if (activePool) {
      setPoolBreed(activePool.breed);
      setPoolCount(activePool.count);
      setPoolAvgWeight(activePool.avgWeightGrams);
      setCustomDiameter(activePool.diameter ? activePool.diameter.toString() : "4.0");
      setDeadAvgWeight(activePool.avgWeightGrams);
      setTransferBreed(activePool.breed);
      setPoolChipId(activePool.chipId || "");
      setTransferChipId(activePool.chipId || "");
      
      // Auto-enable nursery mode if pool has purpose of nursery or belongs to Hall 1
      const isNursery = activePool.purpose?.includes("نرسری") || activePool.hallId === 1;
      setNurseryEnabled(isNursery);

      // Dynamically calculate 3% of the total biomass of the current hall
      const hallPoolsList = pools.filter(p => p.hallId === activePool.hallId);
      const hallBiomass = hallPoolsList.reduce((acc, p) => acc + (p.totalBiomassKg || 0), 0);
      const proposedDryFeed = (hallBiomass * 0.03).toFixed(2);
      setNurseryDryFeedKg(proposedDryFeed);
      setNurseryMealsCount(4);
      setNurseryEggCount("5");
      setNurseryDaphniaPacks("2");

      // Attempt to load current gender status from localized sonography tag if any
      try {
        const savedSon = localStorage.getItem("sturgeon_lab_ultrasound_logs");
        if (savedSon) {
          const list: SonographyLog[] = JSON.parse(savedSon);
          const poolSons = list.filter(u => u.poolId === activePool.id);
          if (poolSons.length > 0) {
            setPoolGender(poolSons[0].gender);
          } else {
            setPoolGender(activePool.purpose.includes("مولد") ? "ماده (Female)" : "نابالغ (Juvenile / Fingerling)");
          }
        } else {
          setPoolGender(activePool.purpose.includes("مولد") ? "ماده (Female)" : "نابالغ (Juvenile / Fingerling)");
        }
      } catch {
        setPoolGender("نابالغ (Juvenile / Fingerling)");
      }

      // 🔧 Sync CITES, pedigree, and verification states
      setPoolPendingVerification(!!activePool.pending_verification);
      setPoolParentMaleId(activePool.parentMaleId || "");
      setPoolParentFemaleId(activePool.parentFemaleId || "");
      setPoolWithdrawalEndDate(activePool.withdrawalEndDate || "");
      setPoolCitesExportPermit(activePool.citesExportPermit || "");
      setPoolCitesAppendixCode(activePool.citesAppendixCode || "Appendix II");
      setPoolCitesAnnualQuotaAllocated(activePool.citesAnnualQuotaAllocated || 0);
      setPoolCitesAnnualQuotaRemaining(activePool.citesAnnualQuotaRemaining || 0);
      setPoolCitesHarvestDate(activePool.citesHarvestDate || "");
    }
  }, [activePool]);

  // Clear feedback flags
  const clearFormStates = () => {
    setSuccessMsg("");
    setErrorMsg("");
  };

  // Convert meal kilograms directly to cups
  const feedGrams = useMemo(() => {
    const val = parseFloat(feedKg);
    return isNaN(val) ? 0 : val * 1000;
  }, [feedKg]);

  // cups calculation
  const cups250g = useMemo(() => {
    return feedGrams / 250;
  }, [feedGrams]);

  const cups500g = useMemo(() => {
    return feedGrams / 500;
  }, [feedGrams]);

  // WATER VOLUME CALCULATOR LOGIC
  const computedWaterVolume = useMemo(() => {
    if (!activePool) return { liters: 0, cubicMeters: 0 };
    const h = parseFloat(waterHeight);
    if (isNaN(h) || h <= 0) return { liters: 0, cubicMeters: 0 };

    // Check if circular
    const isCircular = activePool.diameter !== undefined || activePool.dimensionsDesc.includes("قطر");
    
    if (isCircular) {
      const d = parseFloat(customDiameter);
      const diam = isNaN(d) ? 2.0 : d;
      const radius = diam / 2;
      // V = pi * r^2 * h
      const cubicM = Math.PI * Math.pow(radius, 2) * h;
      return {
        liters: Math.round(cubicM * 1000),
        cubicMeters: parseFloat(cubicM.toFixed(2)),
        isCircular: true
      };
    } else {
      // Rectangular approximation
      const len = parseFloat(rectLength);
      const wid = parseFloat(rectWidth);
      const l = isNaN(len) ? 6.0 : len;
      const w = isNaN(wid) ? 1.5 : wid;
      const cubicM = l * w * h;
      return {
        liters: Math.round(cubicM * 1000),
        cubicMeters: parseFloat(cubicM.toFixed(2)),
        isCircular: false
      };
    }
  }, [activePool, waterHeight, customDiameter, rectLength, rectWidth]);

  // DYNAMIC POST-MEAL FCR PROJECTOR
  // Expected biomass gain = Herd growth % * pool raw biomass
  // Since fish grows incrementally every day, expected daily growth can be projected.
  const fcrEstimate = useMemo(() => {
    const feedInputKg = parseFloat(feedKg);
    if (!activePool || isNaN(feedInputKg) || feedInputKg <= 0 || activePool.count === 0) return null;

    const biomassKg = activePool.totalBiomassKg > 0 ? activePool.totalBiomassKg : (activePool.count * activePool.avgWeightGrams) / 1000;
    
    // Growth rate: default 1.2% daily weight gain of the herd biomass divided into 3 meals = 0.4% weight gain per meal
    const expectedGainKg = biomassKg * (herdGrowthRate / 100) * (eatenPct / 100);
    if (expectedGainKg <= 0) return null;

    // FCR = Feed consumed / Weight gained
    const eatenKg = feedInputKg * (eatenPct / 100);
    const calculatedFcr = eatenKg / expectedGainKg;
    return calculatedFcr;
  }, [activePool, feedKg, gottenPct => eatenPct, herdGrowthRate]);

  // NEXT MEAL SIZE PROJECTOR
  const nextMealProjectedKg = useMemo(() => {
    const feedInputKg = parseFloat(feedKg);
    if (deprivationActive || isNaN(feedInputKg) || feedInputKg <= 0) return 0;
    
    let base = feedInputKg * (eatenPct / 100);
    let tempMultiplier = 1.0;

    // Temperature adjustments
    if (activePool) {
      if (activePool.temperature < 12) {
        tempMultiplier = 0.85; // drop feed logic
      } else if (activePool.temperature > 22) {
        tempMultiplier = 0.70; // reduce oxygen consumption risk
      } else if (activePool.temperature >= 16 && activePool.temperature <= 20) {
        tempMultiplier = 1.05; // peak appetite zone
      }
    }

    let appetiteMultiplier = 1.0;
    if (eatenPct === 100) {
      appetiteMultiplier = 1.08; // healthy sturgeon, expand feed limit
    } else if (eatenPct >= 90) {
      appetiteMultiplier = 1.0; // keep optimal
    } else if (eatenPct >= 75) {
      appetiteMultiplier = 0.88; // reduce feed slightly
    } else {
      appetiteMultiplier = 0.70; // clear appetite fall, drop fast
    }

    return parseFloat((base * appetiteMultiplier * tempMultiplier).toFixed(2));
  }, [feedKg, eatenPct, deprivationActive, activePool]);

  // ------------------------------------------------------------------------
  // SUBMISSIONS
  // ------------------------------------------------------------------------

  // A. Save Pool Biometric Details (نژاد، تعداد، جنسیت و غیره)
  const handleUpdateBiometrics = () => {
    if (!activePool) return;
    clearFormStates();

    setPools(prev => prev.map(p => {
      if (p.id === activePool.id) {
        const totalBio = parseFloat(((poolCount * poolAvgWeight) / 1000).toFixed(1));
        return {
          ...p,
          breed: poolBreed,
          count: poolCount,
          avgWeightGrams: poolAvgWeight,
          totalBiomassKg: totalBio,
          chipId: poolChipId.trim() || undefined,
          // 🔧 Save CITES, pedigree, and verification
          pending_verification: poolPendingVerification,
          parentMaleId: poolParentMaleId.trim() || undefined,
          parentFemaleId: poolParentFemaleId.trim() || undefined,
          withdrawalEndDate: poolWithdrawalEndDate.trim() || undefined,
          citesExportPermit: poolCitesExportPermit.trim() || undefined,
          citesAppendixCode: poolCitesAppendixCode,
          citesAnnualQuotaAllocated: poolCitesAnnualQuotaAllocated || undefined,
          citesAnnualQuotaRemaining: poolCitesAnnualQuotaRemaining || undefined,
          citesHarvestDate: poolCitesHarvestDate.trim() || undefined
        };
      }
      return p;
    }));

    // Log the biometric update to ultrasound biometric table/clinical journal in archive
    try {
      const savedSon = localStorage.getItem("sturgeon_lab_ultrasound_logs");
      const list: SonographyLog[] = savedSon ? JSON.parse(savedSon) : [];
      
      const newSonLog: SonographyLog = {
        id: `biom-${Date.now().toString().slice(-4)}`,
        poolId: activePool.id,
        poolName: `${activePool.name} (سالن ${activePool.hallId})`,
        date: "1405/03/10",
        timestamp: `1405/03/10 ${new Date().toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit" })}`,
        tagId: `TAG-${activePool.id.toUpperCase()}`,
        gender: poolGender,
        maturityStage: activePool.purpose.includes("پیش") ? "Stage I/II (رشد میانی)" : "بالغ",
        eggDiameterMm: 0,
        polarizationIndex: 0,
        recommendation: `اصلاح شناسنامه بیومتری: نژاد ${poolBreed} | تعداد جدید: ${poolCount} قطعه | وزن جدید: ${poolAvgWeight} گرم | شماره چیپ شناسنامه: ${poolChipId.trim() || "ندارد"}.`
      };

      localStorage.setItem("sturgeon_lab_ultrasound_logs", JSON.stringify([newSonLog, ...list]));
    } catch (e) {
      console.error(e);
    }

    setSuccessMsg(`جزئیات شناسنامه استخر ${activePool.name} با موفقیت ویرایش شد و در بایگانی مکتوب ثبت گردید.`);
  };

  // Combined fish batches memo and handlers
  const currentBatches = useMemo(() => {
    if (!activePool) return [];
    if (activePool.fishBatches && activePool.fishBatches.length > 0) {
      return activePool.fishBatches;
    }
    // Fallback: create a single default batch from current pool stats
    if (activePool.count > 0) {
      return [
        {
          id: "batch-initial",
          breed: activePool.breed,
          gender: poolGender || "نامشخص / ترکیبی",
          count: activePool.count,
          avgWeightGrams: activePool.avgWeightGrams,
          notes: "ثبت اولیه"
        }
      ];
    }
    return [];
  }, [activePool, poolGender]);

  const areBreedsEqual = (b1: string, b2: string) => {
    if (!b1 || !b2) return false;
    return b1.trim().replace(/\s+/g, ' ') === b2.trim().replace(/\s+/g, ' ');
  };

  const availableSourceBreeds = useMemo(() => {
    if (!activePool) return [];
    if (activePool.fishBatches && activePool.fishBatches.length > 0) {
      const breedsInBatches = activePool.fishBatches
        .map(b => b.breed)
        .filter((b): b is SturgeonBreed => !!b);
      return Array.from(new Set(breedsInBatches));
    }
    if (activePool.count > 0) {
      return [activePool.breed];
    }
    return [];
  }, [activePool]);

  // When available breeds change, auto-select the first one for transfer
  useEffect(() => {
    if (availableSourceBreeds.length > 0) {
      const isCurrentValid = availableSourceBreeds.some(b => areBreedsEqual(b, transferBreed));
      if (!isCurrentValid) {
        setTransferBreed(availableSourceBreeds[0]);
      }
    }
  }, [availableSourceBreeds, transferBreed]);

  const handleAddBatch = () => {
    if (!activePool) return;
    clearFormStates();

    if (batchCount <= 0) {
      setErrorMsg("تعداد ماهی در دسته باید بیشتر از صفر باشد.");
      return;
    }
    if (batchAvgWeight <= 0) {
      setErrorMsg("میانگین وزن ماهی در دسته باید بیشتر از صفر باشد.");
      return;
    }

    const newBatch = {
      id: `batch-${Date.now()}`,
      breed: batchBreed,
      gender: batchGender,
      count: batchCount,
      avgWeightGrams: batchAvgWeight,
      notes: batchNotes.trim()
    };

    const updatedBatches = [...(activePool.fishBatches || currentBatches), newBatch];
    
    // Sum counts and calculate weighted average weight
    const totalCount = updatedBatches.reduce((acc, b) => acc + b.count, 0);
    const totalBiomass = updatedBatches.reduce((acc, b) => acc + (b.count * b.avgWeightGrams) / 1000, 0);
    const avgWeight = totalCount > 0 ? Math.round((totalBiomass * 1000) / totalCount) : 0;

    // Set primary breed as the breed of the batch with highest count
    let primaryBreed = activePool.breed;
    if (updatedBatches.length > 0) {
      const breedCounts: Record<string, number> = {};
      updatedBatches.forEach(b => {
        breedCounts[b.breed] = (breedCounts[b.breed] || 0) + b.count;
      });
      const sortedBreeds = Object.entries(breedCounts).sort((a, b) => b[1] - a[1]);
      if (sortedBreeds.length > 0) {
        primaryBreed = sortedBreeds[0][0] as SturgeonBreed;
      }
    }

    setPools(prev => prev.map(p => {
      if (p.id === activePool.id) {
        return {
          ...p,
          count: totalCount,
          avgWeightGrams: avgWeight,
          totalBiomassKg: parseFloat(totalBiomass.toFixed(1)),
          breed: primaryBreed,
          fishBatches: updatedBatches
        };
      }
      return p;
    }));

    // Sync input local view state
    setPoolCount(totalCount);
    setPoolAvgWeight(avgWeight);
    setPoolBreed(primaryBreed);

    // Reset batch inputs
    setBatchCount(100);
    setBatchAvgWeight(500);
    setBatchNotes("");
    setSuccessMsg("دسته ترکیبی جدید ماهی با موفقیت به استخر اضافه شد و آمار کلی به‌روزرسانی گردید.");
  };

  const handleDeleteBatch = (batchId: string) => {
    if (!activePool) return;
    clearFormStates();

    const updatedBatches = (activePool.fishBatches || currentBatches).filter(b => b.id !== batchId);
    
    const totalCount = updatedBatches.reduce((acc, b) => acc + b.count, 0);
    const totalBiomass = updatedBatches.reduce((acc, b) => acc + (b.count * b.avgWeightGrams) / 1000, 0);
    const avgWeight = totalCount > 0 ? Math.round((totalBiomass * 1000) / totalCount) : 0;

    let primaryBreed = activePool.breed;
    if (updatedBatches.length > 0) {
      const breedCounts: Record<string, number> = {};
      updatedBatches.forEach(b => {
        breedCounts[b.breed] = (breedCounts[b.breed] || 0) + b.count;
      });
      const sortedBreeds = Object.entries(breedCounts).sort((a, b) => b[1] - a[1]);
      if (sortedBreeds.length > 0) {
        primaryBreed = sortedBreeds[0][0] as SturgeonBreed;
      }
    }

    setPools(prev => prev.map(p => {
      if (p.id === activePool.id) {
        return {
          ...p,
          count: totalCount,
          avgWeightGrams: avgWeight,
          totalBiomassKg: parseFloat(totalBiomass.toFixed(1)),
          breed: primaryBreed,
          fishBatches: updatedBatches
        };
      }
      return p;
    }));

    // Sync input local view state
    setPoolCount(totalCount);
    setPoolAvgWeight(avgWeight);
    setPoolBreed(primaryBreed);

    setSuccessMsg("دسته از ترکیب گله استخر حذف شد و آمار کلی مجدداً محاسبه گردید.");
  };

  // B. Save Feeding Meal (وعده خوراک، پیمانه‌ها، ضریب FCR و وعده بعدی)
  const handleSaveFeeding = () => {
    if (!activePool) return;
    clearFormStates();

    if (deprivationActive) {
      setErrorMsg("این استخر به دلیل دستور دامپزشکی در وضعیت 'قطع غذا' قفل است. ابتدا سوئیچ قطع غذا را خاموش کنید.");
      return;
    }

    if (nurseryEnabled) {
      const eggs = parseInt(nurseryEggCount) || 0;
      const dry = parseFloat(nurseryDryFeedKg) || 0;
      const daphnia = parseInt(nurseryDaphniaPacks) || 0;

      if (eggs <= 0 && dry <= 0 && daphnia <= 0) {
        setErrorMsg("لطفاً حداقل مقدار یکی از گزینه‌های تغذیه نرسری (زرده، غذای خشک یا مینی‌بسته دافنی/آرتمیا) را وارد کنید.");
        return;
      }

      const scheduleParts = Object.entries(nurserySchedule)
        .map(([time, food]) => `${time}: ${food}`)
        .join("، ");

      const medicineDesc = `مکمل / دارو انتخابی نرسری: ${nurseryMedType} (دوز: ${nurseryMedDoseSec} گرم)`;

      const desc = `نرسری ${nurseryMealsCount} وعده [زمان‌بندی: ${scheduleParts}] | ${medicineDesc} : ` + [
        eggs > 0 ? `زرده: ${eggs} عدد` : null,
        dry > 0 ? `خشک ۳٪: ${dry} کیلوگرم` : null,
        daphnia > 0 ? `آرتمیا/دافنی: ${daphnia} بسته` : null
      ].filter(Boolean).join(" | ");

      // Call dynamic feeding handler in parent state
      onAddFeedingLog(
        activePool.id,
        desc,
        dry > 0 ? dry : 0.05, // dry feed amount weight in Kg
        eatenPct,
        dry > 0 ? parseFloat((dry * 1.05).toFixed(2)) : 0.1
      );

      setSuccessMsg(`تغذیه زمان‌بندی نرسری به همراه دارو/مکمل (${nurseryMedType} با دوز ${nurseryMedDoseSec} گرم) و جیره زمان‌بندی (${scheduleParts}) با موفقیت در پرونده فارم منظور شد.`);
    } else {
      const feedVal = parseFloat(feedKg);
      if (isNaN(feedVal) || feedVal <= 0) {
        setErrorMsg("میزان خوراک معتبر نیست. لطفاً مجدداً مقدار خوراکی را وارد نمائید.");
        return;
      }

      // Call dynamic feeding handler in parent state
      onAddFeedingLog(
        activePool.id,
        feedType,
        feedVal,
        eatenPct,
        nextMealProjectedKg
      );

      setSuccessMsg(`وعده غذایی ${feedVal} کیلوگرمی (معادل ${cups250g.toFixed(1)} پیمانه ۲۵۰ گرمی) با FCR تخمینی ${fcrEstimate?.toFixed(2) || "نامشخص"} با موفقیت در بایگانی استخر ثبت شد.`);
    }
  };

  // C. Execute Water Height & Hydromatic calculation logs
  const handleSaveWaterHeight = () => {
    if (!activePool) return;
    clearFormStates();
    
    const h = parseFloat(waterHeight);
    if (isNaN(h) || h <= 0) {
      setErrorMsg("ارتفاع آب درج شده نامعتبر است.");
      return;
    }

    // append new WaterTestLog to LocalStorage representing physical water height and volume
    try {
      const savedWater = localStorage.getItem("sturgeon_lab_water_logs");
      const list: WaterTestLog[] = savedWater ? JSON.parse(savedWater) : [];

      const newWaterHeightLog: WaterTestLog = {
        id: `hgt-${Date.now().toString().slice(-4)}`,
        poolId: activePool.id,
        poolName: `${activePool.name} (سالن ${activePool.hallId})`,
        date: "1405/03/10",
        timestamp: `1405/03/10 ${new Date().toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit" })}`,
        temperature: activePool.temperature,
        oxygenLevel: activePool.oxygenLevel,
        phLevel: activePool.phLevel,
        nitriteLevel: 0.02,
        ammoniaLevel: 0.002,
        salinity: 1.2,
        status: "normal",
        statusText: `پایش ارتفاع آب: ${waterHeight} متر (حجم مخزن: ${computedWaterVolume.liters} لیتر)`
      };

      localStorage.setItem("sturgeon_lab_water_logs", JSON.stringify([newWaterHeightLog, ...list]));

      // Update diameter also in pool core database
      setPools(prev => prev.map(p => {
        if (p.id === activePool.id) {
          return {
            ...p,
            height: h,
            diameter: p.diameter || parseFloat(customDiameter) || undefined
          };
        }
        return p;
      }));

      setSuccessMsg(`گزارش فیزیکی عمق آب تانک با موفقیت مکتوب شد: عمق ${waterHeight} متر، حجم هیدروکربنی کل ${computedWaterVolume.liters.toLocaleString("fa-IR")} لیتر (${computedWaterVolume.cubicMeters} متر مکعب).`);
    } catch (e) {
      setErrorMsg("خطایی در ذخیره فیزیکی گزارش رخ داد.");
    }
  };

  // D. Live Casualty deduction
  const handleSaveCasualty = () => {
    if (!activePool) return;
    clearFormStates();

    if (deadCount <= 0) {
      setErrorMsg("تعداد تلفات وارده باید بزرگتر از صفر باشد.");
      return;
    }

    if (deadCount > activePool.count) {
      setErrorMsg(`تعداد تلفات وارده (${deadCount}) بیش از گله زنده موجود در استخر (${activePool.count} قطعه) است.`);
      return;
    }

    const targetBatch = [...(activePool.fishBatches || [])].sort((a, b) => b.count - a.count).find(batch => batch.count >= deadCount);
    const saved = onAddMortalityRecord(
      activePool.id,
      deadCount,
      targetBatch?.breed || activePool.breed,
      targetBatch?.gender || "unknown",
      mortalitySymptoms,
      `ثبت دستی آنی: وزن сред: ${deadAvgWeight} گرم. علت: ${mortalityReason}`,
      "", // no photo Url
      `پیشگیری بهداشتی: ضدعفونی سریع آب به کمک پرمنگنات پتاسیم یا کلرینه خفیف، تعدیل دما و بررسی مداوم آمونیاک تانک.`
    );

    if (!saved) {
      setErrorMsg("تلفات از موجودی یک Stock مشخص بیشتر است؛ از فرم تخصصی تلفات، نژاد و جنسیت را انتخاب کنید.");
      return;
    }

    setSuccessMsg(`گزارش تلفات ${deadCount} قطعه ماهی با میانگین وزن ${deadAvgWeight} گرم ثبت و جمعیت استخر اصلاح شد.`);
  };

  // E. Execute Stock Transfer
  const handleSaveTransfer = () => {
    if (!activePool) return;
    clearFormStates();

    if (!transferDestPoolId) {
      setErrorMsg("لطفاً یک استخر مقصد معتبر در مزارع انتخاب نمائید.");
      return;
    }

    if (transferDestPoolId === activePool.id) {
      setErrorMsg("استخر مبدا و مقصد یکسان است!");
      return;
    }

    if (transferCount <= 0) {
      setErrorMsg("تعداد انتقال باید بزرگتر از صفر باشد.");
      return;
    }

    const transferBreedCount = activePool.fishBatches && activePool.fishBatches.length > 0
      ? activePool.fishBatches.filter(b => areBreedsEqual(b.breed, transferBreed)).reduce((sum, b) => sum + b.count, 0)
      : (areBreedsEqual(activePool.breed, transferBreed) ? activePool.count : 0);

    if (transferCount > transferBreedCount) {
      setErrorMsg(`خطا: موجودی کافی برای نژاد "${transferBreed}" در استخر مبدا وجود ندارد. موجودی فعال این نژاد: ${transferBreedCount} قطعه.`);
      return;
    }

    const destPool = pools.find(p => p.id === transferDestPoolId);
    if (destPool && destPool.count > 0 && destPool.breed !== transferBreed) {
      const confirmMix = window.confirm(
        `🚨 توجه: نژاد انتخابی برای انتقال (${transferBreed}) با نژاد غالب استخر مقصد (${destPool.breed}) متفاوت است!\n\nمخلوط کردن گونه‌های مختلف تاس‌ماهی می‌تواند پایش رشد را مختل کند. آیا مایل به ادغام هستید؟`
      );
      if (!confirmMix) {
        setErrorMsg("عملیات انتقال به علت تداخل نژاد لغو شد.");
        return;
      }
    }

    const success = onExecuteTransfer(
      activePool.id,
      transferDestPoolId,
      transferCount,
      transferReason,
      transferOperator,
      transferChipId.trim() || undefined,
      transferBreed
    );

    if (success) {
      setSuccessMsg(`انتقال تعداد ${transferCount} قطعه با موفقیت اجرا شد و سوابق تبارشناسی در بایگانی ثبت گردید.`);
      setTransferChipId("");
    } else {
      setErrorMsg("انتقال بیوماس به علت ناهماهنگی تانکی با خطا مواجه شد.");
    }
  };

  // F. Save Medication & Potassium Permanganate treats
  const handleSaveTreatmentAndDeprivation = () => {
    if (!activePool) return;
    clearFormStates();

    const permPpm = parseFloat(permanganateDosePpm);
    const medGrams = parseFloat(medsDoseGrams);

    if (isNaN(permPpm) || isNaN(medGrams)) {
      setErrorMsg("فرم مقادیر دارویی نامعتبر است.");
      return;
    }

    // Add record to water check log as health test status log in archive
    try {
      const savedWater = localStorage.getItem("sturgeon_lab_water_logs");
      const list: WaterTestLog[] = savedWater ? JSON.parse(savedWater) : [];

      let note = `درمان بهداشتی: دارو "${medsType}" دوز ${medsDoseGrams}g | پرمنگنات پتاسیم: ${permanganateDosePpm} PPM.`;
      if (deprivationActive) {
        note += ` [دستور قطع غذای فعال به علت: ${deprivationReason}]`;
      }

      const newTreatmentLog: WaterTestLog = {
        id: `med-${Date.now().toString().slice(-4)}`,
        poolId: activePool.id,
        poolName: `${activePool.name} (سالن ${activePool.hallId})`,
        date: "1405/03/10",
        timestamp: `1405/03/10 ${new Date().toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit" })}`,
        temperature: activePool.temperature,
        oxygenLevel: activePool.oxygenLevel,
        phLevel: activePool.phLevel,
        nitriteLevel: 0.01 + Math.random() * 0.03,
        ammoniaLevel: 0.001,
        salinity: 1.2,
        status: deprivationActive ? "warning" : "normal",
        statusText: note
      };

      localStorage.setItem("sturgeon_lab_water_logs", JSON.stringify([newTreatmentLog, ...list]));

      setSuccessMsg(`کارت بهداشت و درمان دوره‌ای استخر ${activePool.name} با موفقیت در بایگانی هیدروشیمی ثبت شد.`);
    } catch {
      setErrorMsg("خطا در تبت مدارک بهداشت سالن.");
    }
  };

  return (
    <div id="pool-quick-logger-section" className="space-y-6">
      
      {/* 🔮 INTERACTIVE POOL SELECTOR COOP */}
      <div className="bg-white rounded-3xl border border-natural-border shadow-sm p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-natural-forest/10 flex items-center justify-center text-natural-forest border border-natural-border">
              <Building2 size={20} />
            </div>
            <div>
              <h3 className="text-sm font-black text-natural-dark font-sans">پنل جامع ثبت آنی و محاسبات هیدرولیک استخرها</h3>
              <p className="text-[10.5px] text-natural-text/60 mt-0.5">ثبت متمرکز و آنی وقایع، خوراک‌دهی، جابجایی، تلفات، دارو و پرمنگنات با ذخیره‌سازی فوری در بایگانی مرکزی</p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            {/* Choose Hall */}
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-[10px] text-natural-text/60 font-medium">سالن:</span>
              <select
                value={selectedHallId}
                onChange={(e) => setSelectedHallId(parseInt(e.target.value))}
                className="text-xs font-bold font-sans rounded-xl border-2 border-amber-500/35 p-2 bg-amber-50/50 text-natural-dark focus:outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-500/20 transition-all font-black cursor-pointer shadow-xs"
              >
                {[1, 2, 3, 4, 5, 7, 8, 9, 10, 11, 12].map(hNum => (
                  <option key={hNum} value={hNum}>
                    سالن {hNum} {hNum === 1 ? '(نرسری)' : hNum === 7 ? '(مولدین)' : hNum === 11 ? '(پرواری)' : hNum === 12 ? '(فروش)' : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Choose Pool */}
            <div className="flex items-center gap-1.5 w-full md:w-auto">
              <span className="text-[10px] text-natural-text/60 font-medium">استخر:</span>
              <select
                value={selectedPoolId}
                onChange={(e) => { setSelectedPoolId(e.target.value); clearFormStates(); }}
                className="text-xs font-sans rounded-xl border border-natural-border p-2 bg-[#FDFCF8] text-natural-dark focus:outline-none focus:border-natural-earth w-full md:min-w-[140px]"
              >
                {hallPools.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.count > 0 ? `${p.count} قطعه` : "خالی"})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* FEEDBACK LABELS */}
        {successMsg && (
          <div className="mt-4 p-3 bg-emerald-50 border border-emerald-250 text-emerald-800 text-xs rounded-xl flex items-center gap-2 font-medium">
            <CheckCircle size={16} className="text-emerald-700 mt-0.5 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-800 text-xs rounded-xl flex items-center gap-2 font-medium">
            <ShieldAlert size={16} className="text-red-700 mt-0.5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>

      {activePool ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT 5 COLUMNS: CURRENT BIOMETRIC & WATER CALCULATOR STAGE */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* 🏷️ CARD 1: ACTIVE POOL IDENTITY CARD (شناسنامه اصلاحی) */}
            <div className="bg-white rounded-3xl border border-natural-border shadow-sm p-5 space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-natural-border/60">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-natural-khaki flex items-center justify-center text-natural-earth">
                    <Layers size={15} />
                  </div>
                  <h4 className="text-xs font-black text-natural-dark font-sans">اصلاح نژاد، تعداد و شناسه شناسنامه استخر</h4>
                </div>
                <div className="flex items-center gap-1.5">
                  {onOpenQrCode && (
                    <button
                      onClick={() => onOpenQrCode(activePool)}
                      className="p-1 px-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer"
                      title="نمایش و چاپ شناسنامه QR"
                    >
                      <QrCode size={12} />
                      QR شناسنامه
                    </button>
                  )}
                  <span className="text-[10px] text-natural-earth font-mono font-bold bg-natural-khaki/30 px-2 py-0.5 rounded-md">
                    {activePool.id}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-[9.5px] text-natural-text/60 block font-semibold mb-1">نژاد کلونی خاویاری:</span>
                  <select
                    value={poolBreed}
                    onChange={(e) => setPoolBreed(e.target.value as SturgeonBreed)}
                    className="w-full text-xs font-sans rounded-xl border border-natural-border p-2 bg-[#FDFCF8] text-natural-dark focus:outline-none"
                  >
                    {Object.values(SturgeonBreed).map(breed => (
                      <option key={breed} value={breed}>{breed}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <span className="text-[9.5px] text-natural-text/60 block font-semibold mb-1">کلاس جنسیتی مولدین:</span>
                  <select
                    value={poolGender}
                    onChange={(e) => setPoolGender(e.target.value)}
                    className="w-full text-xs font-sans rounded-xl border border-natural-border p-2 bg-[#FDFCF8] text-natural-dark focus:outline-none"
                  >
                    <option value="نابالغ (Juvenile / Fingerling)">نابالغ (Juvenile / Fingerling)</option>
                    <option value="ماده مولد (Mature Female)">ماده مولد (Mature Female)</option>
                    <option value="ماده پیش‌مولد (Stage III Female)">ماده پیش‌مولد (Stage III Female)</option>
                    <option value="نر مولد (Mature Male)">نر مولد (Mature Male)</option>
                    <option value="نامشخص / ترکیبی">نامشخص / ترکیبی</option>
                  </select>
                </div>

                <div>
                  <span className="text-[9.5px] text-natural-text/60 block font-semibold mb-1">تعداد ماهی زنده در استخر (قطعه):</span>
                  <input
                    type="number"
                    value={poolCount}
                    onChange={(e) => setPoolCount(parseInt(e.target.value) || 0)}
                    className="w-full text-xs font-sans rounded-xl border border-natural-border p-2 bg-[#FDFCF8] text-natural-dark focus:outline-none text-right font-mono"
                    min="0"
                  />
                </div>

                <div>
                  <span className="text-[9.5px] text-natural-text/60 block font-semibold mb-1">وزن انفرادی ذرات (گرم):</span>
                  <input
                    type="number"
                    value={poolAvgWeight}
                    onChange={(e) => setPoolAvgWeight(parseInt(e.target.value) || 0)}
                    className="w-full text-xs font-sans rounded-xl border border-natural-border p-2 bg-[#FDFCF8] text-natural-dark focus:outline-none text-right font-mono"
                    min="0"
                  />
                </div>

                <div className="col-span-2 grid grid-cols-2 gap-3 pt-2 border-t border-natural-border/30">
                  <div className="col-span-2">
                    <label className="flex items-center gap-2 cursor-pointer p-1 rounded-lg hover:bg-natural-khaki/25">
                      <input
                        type="checkbox"
                        checked={poolPendingVerification}
                        onChange={(e) => setPoolPendingVerification(e.target.checked)}
                        className="rounded border-natural-border text-natural-forest focus:ring-natural-forest"
                      />
                      <span className="text-[10px] font-bold text-natural-dark select-none">
                        ⚠️ نیازمند تکمیل اطلاعات / تأیید زیستی کارشناس (Pending Verification)
                      </span>
                    </label>
                  </div>

                  <div>
                    <span className="text-[9.5px] text-natural-text/60 block font-semibold mb-1">کد تبارشناسی پدر (Parent Male ID):</span>
                    <input
                      type="text"
                      value={poolParentMaleId}
                      onChange={(e) => setPoolParentMaleId(e.target.value)}
                      className="w-full text-xs font-sans rounded-xl border border-natural-border p-2 bg-[#FDFCF8] text-natural-dark focus:outline-none font-mono"
                      placeholder="MALE-BEL-09"
                    />
                  </div>

                  <div>
                    <span className="text-[9.5px] text-natural-text/60 block font-semibold mb-1">کد تبارشناسی مادر (Parent Female ID):</span>
                    <input
                      type="text"
                      value={poolParentFemaleId}
                      onChange={(e) => setPoolParentFemaleId(e.target.value)}
                      className="w-full text-xs font-sans rounded-xl border border-natural-border p-2 bg-[#FDFCF8] text-natural-dark focus:outline-none font-mono"
                      placeholder="FEMALE-BEL-33"
                    />
                  </div>
                </div>

                <div className="col-span-2 grid grid-cols-2 gap-3 pt-2 border-t border-natural-border/30">
                  <div>
                    <span className="text-[9.5px] text-natural-text/60 block font-semibold mb-1">پایان دوره پرهیز دارویی:</span>
                    <input
                      type="text"
                      value={poolWithdrawalEndDate}
                      onChange={(e) => setPoolWithdrawalEndDate(e.target.value)}
                      className="w-full text-xs font-sans rounded-xl border border-natural-border p-2 bg-[#FDFCF8] text-natural-dark focus:outline-none font-mono text-right"
                      placeholder="۱۴۰۵/۰۴/۱۵"
                    />
                  </div>

                  <div>
                    <span className="text-[9.5px] text-natural-text/60 block font-semibold mb-1">شناسه میکروچیپ استخر:</span>
                    <input
                      type="text"
                      value={poolChipId}
                      onChange={(e) => setPoolChipId(e.target.value)}
                      className="w-full text-xs font-sans rounded-xl border border-natural-border p-2 bg-[#FDFCF8] text-natural-dark focus:outline-none text-right font-mono text-left"
                      placeholder="RF-29401-IR"
                    />
                  </div>
                </div>

                {/* CITES Export & Quota Details */}
                <div className="col-span-2 p-3 bg-natural-khaki/20 border border-natural-border/40 rounded-2xl space-y-3 pt-2">
                  <span className="text-[10px] font-black text-natural-dark block">🌍 مجوزهای بین‌المللی خاویار (CITES Registry)</span>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-[9px] text-natural-text/60 block mb-0.5">پیوست کنوانسیون CITES:</span>
                      <select
                        value={poolCitesAppendixCode}
                        onChange={(e) => setPoolCitesAppendixCode(e.target.value)}
                        className="w-full text-[10px] font-sans rounded-lg border border-natural-border p-1.5 bg-[#FDFCF8] text-natural-dark focus:outline-none"
                      >
                        <option value="Appendix I">ضمیمه I (در معرض انقراض شدید)</option>
                        <option value="Appendix II">ضمیمه II (نیازمند کنترل صادرات)</option>
                        <option value="Appendix III">ضمیمه III (حفاظت ملی خاص)</option>
                      </select>
                    </div>

                    <div>
                      <span className="text-[9px] text-natural-text/60 block mb-0.5">شماره پروانه صادرات CITES:</span>
                      <input
                        type="text"
                        value={poolCitesExportPermit}
                        onChange={(e) => setPoolCitesExportPermit(e.target.value)}
                        className="w-full text-[10px] font-sans rounded-lg border border-natural-border p-1.5 bg-[#FDFCF8] text-natural-dark focus:outline-none font-mono"
                        placeholder="CITES-EXP-2026-FATHI"
                      />
                    </div>

                    <div>
                      <span className="text-[9px] text-natural-text/60 block mb-0.5">سهمیه صادرات سالانه (کیلوگرم):</span>
                      <input
                        type="number"
                        value={poolCitesAnnualQuotaAllocated}
                        onChange={(e) => setPoolCitesAnnualQuotaAllocated(parseInt(e.target.value) || 0)}
                        className="w-full text-[10px] font-sans rounded-lg border border-natural-border p-1.5 bg-[#FDFCF8] text-natural-dark focus:outline-none font-mono text-right"
                      />
                    </div>

                    <div>
                      <span className="text-[9px] text-natural-text/60 block mb-0.5">باقیمانده سهمیه سالانه:</span>
                      <input
                        type="number"
                        value={poolCitesAnnualQuotaRemaining}
                        onChange={(e) => setPoolCitesAnnualQuotaRemaining(parseInt(e.target.value) || 0)}
                        className="w-full text-[10px] font-sans rounded-lg border border-natural-border p-1.5 bg-[#FDFCF8] text-natural-dark focus:outline-none font-mono text-right"
                      />
                    </div>

                    <div className="col-span-2">
                      <span className="text-[9px] text-natural-text/60 block mb-0.5">تاریخ ثبت استحصال CITES:</span>
                      <input
                        type="text"
                        value={poolCitesHarvestDate}
                        onChange={(e) => setPoolCitesHarvestDate(e.target.value)}
                        className="w-full text-[10px] font-sans rounded-lg border border-natural-border p-1.5 bg-[#FDFCF8] text-natural-dark focus:outline-none font-mono"
                        placeholder="۱۴۰۵/۰۹/۲۰"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Biomass Calculation visual representation */}
              <div className="bg-natural-khaki/35 p-3 rounded-2xl border border-natural-border/30 flex justify-between items-center text-[11px] text-natural-dark select-none leading-relaxed">
                <div>
                  <span>تخمین بیوماس زیستی کل کلونی:</span>
                  <span className="block text-[8.5px] text-natural-text/60 mt-0.5">بر پایه آخرین اصلاح بیومتری شناسنامه</span>
                </div>
                <strong>{parseFloat(((poolCount * poolAvgWeight) / 1000).toFixed(1))} کیلوگرم</strong>
              </div>

              <button
                onClick={handleUpdateBiometrics}
                className="w-full py-2.5 bg-natural-khaki hover:bg-natural-khaki/90 text-natural-dark border border-natural-border text-xs rounded-xl font-bold cursor-pointer transition-all flex items-center justify-center gap-1"
              >
                اصلاح موضعی شناسنامه استخر
              </button>

              {/* --- SECTION: MIXED/COMBINED STURGEON BREEDS & GENDERS --- */}
              <div className="pt-4 border-t border-natural-border/60 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                    <h5 className="text-[11px] font-bold text-natural-dark font-sans">بایگانی، دسته‌بندی و تبارشناسی گله</h5>
                  </div>
                  <span className="text-[9px] text-amber-800 bg-amber-50 border border-amber-200/55 px-2 py-0.5 rounded-md font-medium">
                    {batchSectionTab === "manage" ? `${currentBatches.length} گروه فعال` : "جابهجایی تبارشناسی"}
                  </span>
                </div>

                {/* 🎛️ TAB SELECTOR */}
                <div className="flex border border-natural-border rounded-xl p-0.5 bg-natural-khaki/10 text-[9.5px] font-bold select-none mb-3">
                  <button
                    type="button"
                    onClick={() => setBatchSectionTab("manage")}
                    className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer text-center ${
                      batchSectionTab === "manage"
                        ? "bg-[#D68227] text-white shadow-xs"
                        : "text-natural-text hover:bg-[#D68227]/5"
                    }`}
                  >
                    مدیریت دسته‌ها و گله ترکیبی
                  </button>
                  <button
                    type="button"
                    onClick={() => setBatchSectionTab("transfer")}
                    className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer text-center ${
                      batchSectionTab === "transfer"
                        ? "bg-blue-750 text-white shadow-xs"
                        : "text-natural-text hover:bg-blue-750/5"
                    }`}
                  >
                    جابهجایی تبارشناسی کلونی
                  </button>
                </div>

                {batchSectionTab === "manage" ? (
                  <div className="space-y-4">
                    {/* Batches Table/List */}
                    {currentBatches.length > 0 ? (
                      <div className="border border-natural-border/50 rounded-2xl overflow-hidden bg-natural-khaki/10">
                        <table className="w-full text-[10px] text-right">
                          <thead>
                            <tr className="bg-natural-khaki/20 text-natural-dark/75 border-b border-natural-border/45">
                              <th className="p-2 font-bold">نژاد</th>
                              <th className="p-2 font-bold">جنسیت</th>
                              <th className="p-2 font-bold text-center">تعداد</th>
                              <th className="p-2 font-bold text-center">وزن (گرم)</th>
                              <th className="p-2 font-bold text-center">بیوماس</th>
                              <th className="p-2 font-bold text-center">عملیات</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-natural-border/40">
                            {currentBatches.map((batch) => (
                              <tr key={batch.id} className="hover:bg-natural-khaki/15 text-natural-dark/90 transition-colors">
                                <td className="p-2 font-medium">{batch.breed}</td>
                                <td className="p-2">{batch.gender}</td>
                                <td className="p-2 text-center font-mono font-bold">{batch.count}</td>
                                <td className="p-2 text-center font-mono">{batch.avgWeightGrams}g</td>
                                <td className="p-2 text-center font-mono font-bold">
                                  {((batch.count * batch.avgWeightGrams) / 1000).toFixed(1)}kg
                                </td>
                                <td className="p-2 text-center">
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteBatch(batch.id)}
                                    className="p-1 hover:bg-red-50 text-red-600 rounded-lg transition-colors cursor-pointer animate-none"
                                    title="حذف دسته"
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center p-4 border border-dashed border-natural-border/60 rounded-2xl text-[10px] text-natural-text/60 bg-[#FDFCF8]">
                        هیچ دسته ماهی ترکیبی در این استخر ثبت نشده است. از فرم زیر برای ثبت گله استفاده کنید.
                      </div>
                    )}

                    {/* Add Batch Mini Form */}
                    <div className="bg-[#FDFCF8] border border-natural-border/45 p-3.5 rounded-2xl space-y-3">
                      <div className="text-[10px] font-black text-natural-earth pb-1 border-b border-natural-border/40">
                        افزودن گروه/دسته جدید به این استخر:
                      </div>

                      <div className="grid grid-cols-2 gap-2.5">
                        <div>
                          <span className="text-[9px] text-natural-text/60 block mb-0.5">نژاد:</span>
                          <select
                            value={batchBreed}
                            onChange={(e) => setBatchBreed(e.target.value as SturgeonBreed)}
                            className="w-full text-[10px] font-sans rounded-lg border border-natural-border p-1.5 bg-white text-natural-dark focus:outline-none"
                          >
                            {Object.values(SturgeonBreed).map(breed => (
                              <option key={breed} value={breed}>{breed}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <span className="text-[9px] text-natural-text/60 block mb-0.5">کلاس جنسیتی:</span>
                          <select
                            value={batchGender}
                            onChange={(e) => setBatchGender(e.target.value)}
                            className="w-full text-[10px] font-sans rounded-lg border border-natural-border p-1.5 bg-white text-natural-dark focus:outline-none"
                          >
                            <option value="نابالغ (Juvenile / Fingerling)">نابالغ (Juvenile / Fingerling)</option>
                            <option value="ماده مولد (Mature Female)">ماده مولد (Mature Female)</option>
                            <option value="ماده پیش‌مولد (Stage III Female)">ماده پیش‌مولد (Stage III Female)</option>
                            <option value="نر مولد (Mature Male)">نر مولد (Mature Male)</option>
                            <option value="نامشخص / ترکیبی">نامشخص / ترکیبی</option>
                          </select>
                        </div>

                        <div>
                          <span className="text-[9px] text-natural-text/60 block mb-0.5">تعداد (قطعه):</span>
                          <input
                            type="number"
                            value={batchCount === 0 ? "" : batchCount}
                            onChange={(e) => setBatchCount(parseInt(e.target.value) || 0)}
                            className="w-full text-[10px] font-sans rounded-lg border border-natural-border p-1.5 bg-white text-natural-dark focus:outline-none text-right font-mono"
                            min="1"
                            placeholder="مثلا ۱۰۰"
                          />
                        </div>

                        <div>
                          <span className="text-[9px] text-natural-text/60 block mb-0.5">میانگین وزن (گرم):</span>
                          <input
                            type="number"
                            value={batchAvgWeight === 0 ? "" : batchAvgWeight}
                            onChange={(e) => setBatchAvgWeight(parseInt(e.target.value) || 0)}
                            className="w-full text-[10px] font-sans rounded-lg border border-natural-border p-1.5 bg-white text-natural-dark focus:outline-none text-right font-mono"
                            min="1"
                            placeholder="مثلا ۵۰۰"
                          />
                        </div>
                      </div>

                      <div>
                        <span className="text-[9px] text-natural-text/60 block mb-0.5">توضیحات و یادداشت (اختیاری):</span>
                        <input
                          type="text"
                          value={batchNotes}
                          onChange={(e) => setBatchNotes(e.target.value)}
                          className="w-full text-[10px] font-sans rounded-lg border border-natural-border p-1.5 bg-white text-natural-dark focus:outline-none text-right"
                          placeholder="مانند: گله خریداری شده فروردین"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={handleAddBatch}
                        className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white text-[10px] rounded-lg font-bold cursor-pointer transition-colors flex items-center justify-center gap-1 shadow-xs"
                      >
                        + افزودن گروه جدید به این استخر
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-[#F6F9FC] border border-blue-200/50 p-5 rounded-2xl text-center space-y-4">
                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center mx-auto text-blue-700 animate-pulse">
                      <ArrowRightLeft size={18} />
                    </div>
                    <div className="space-y-1.5">
                      <h6 className="text-xs font-black text-blue-850">سامانه متمرکز و یکپارچه مدیریت انتقال</h6>
                      <p className="text-[10px] text-natural-text/85 leading-relaxed max-w-xs mx-auto">
                        جهت تضمین همپوشانی رشد (FCR)، ثبت هماهنگ اطلاعات و ممانعت از تداخل نژادی ناخواسته، تمامی انتقالات گله‌ها به صورت متمرکز در سیستم مدیریت جابه‌جایی صورت می‌گیرد.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        if (onInitiateTransfer) {
                          onInitiateTransfer(activePool.id);
                        }
                      }}
                      className="w-full py-2 bg-blue-750 hover:bg-blue-800 text-white text-[11px] rounded-xl font-bold cursor-pointer transition-colors flex items-center justify-center gap-1 shadow-sm"
                    >
                      شروع فرآیند انتقال از {activePool.name}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* 📏 CARD 2: WATER HEIGHT & VOLUME CALCULATOR (محاسبه آنی حجم آب بر اساس ارتفاع) */}
            <div className="bg-white rounded-3xl border border-natural-border shadow-sm p-5 space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-natural-border/60">
                <div className="w-7 h-7 rounded-lg bg-cyan-50 flex items-center justify-center text-cyan-700">
                  <Droplet size={15} />
                </div>
                <h4 className="text-xs font-black text-natural-dark font-sans">سنجش فیزیک آب و محاسبه حجم استخر</h4>
              </div>

              <p className="text-[10px] text-natural-text/65 leading-relaxed">
                فیل‌ماهی‌ها و تاس‌ماهی‌ها نیازمند دبی آب ثابت و عمق آب بهینه بر اساس سن خود هستند. با ثبت ارتفاع زنده آب، ظرفیت مخزن را بررسی نمائید:
              </p>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-[9.5px] text-natural-text/60 block font-semibold mb-1">ارتفاع آب زنده (متر):</span>
                  <input
                    type="number"
                    step="0.05"
                    value={waterHeight}
                    onChange={(e) => setWaterHeight(e.target.value)}
                    className="w-full text-xs font-sans rounded-xl border border-natural-border p-2 bg-[#FDFCF8] text-natural-dark focus:outline-none text-right font-mono"
                    placeholder="مثلا ۱.۲۰"
                  />
                </div>

                {activePool.diameter !== undefined || activePool.dimensionsDesc.includes("قطر") ? (
                  <div>
                    <span className="text-[9.5px] text-natural-text/60 block font-semibold mb-1">قطر فیزیکی تانک (متر):</span>
                    <input
                      type="number"
                      step="0.1"
                      value={customDiameter}
                      onChange={(e) => setCustomDiameter(e.target.value)}
                      className="w-full text-xs font-sans rounded-xl border border-natural-border p-2 bg-[#FDFCF8] text-natural-dark focus:outline-none text-right font-mono"
                    />
                  </div>
                ) : (
                  <div className="col-span-1 grid grid-cols-2 gap-1.5">
                    <div>
                      <span className="text-[9px] text-natural-text/60 block font-semibold mb-1">طول (متر):</span>
                      <input
                        type="number"
                        value={rectLength}
                        onChange={(e) => setRectLength(e.target.value)}
                        className="w-full text-xs font-sans rounded-xl border border-natural-border p-1 bg-[#FDFCF8] text-natural-dark focus:outline-none text-right font-mono"
                      />
                    </div>
                    <div>
                      <span className="text-[9px] text-natural-text/60 block font-semibold mb-1">عرض (متر):</span>
                      <input
                        type="number"
                        value={rectWidth}
                        onChange={(e) => setRectWidth(e.target.value)}
                        className="w-full text-xs font-sans rounded-xl border border-natural-border p-1 bg-[#FDFCF8] text-natural-dark focus:outline-none text-right font-mono"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Calculations results widget */}
              <div className="bg-[#FAF9F5] p-3.5 rounded-2xl border border-natural-border/40 grid grid-cols-2 gap-4 text-center select-none font-sans">
                <div className="border-l border-natural-border/40">
                  <span className="text-[9px] text-natural-text/70 block">کلوین آب هیدروکربنی</span>
                  <strong className="text-base text-cyan-800 font-extrabold block mt-0.5 font-mono">
                    {computedWaterVolume.liters.toLocaleString("fa-IR")}
                  </strong>
                  <span className="text-[8px] text-natural-text/50">لیتر آب فعال</span>
                </div>
                <div>
                  <span className="text-[9px] text-natural-text/70 block">معادل حجم اسمی</span>
                  <strong className="text-base text-natural-dark font-extrabold block mt-0.5 font-mono">
                    {computedWaterVolume.cubicMeters}
                  </strong>
                  <span className="text-[8px] text-natural-text/50">متر مکعب فضا</span>
                </div>
              </div>

              <button
                onClick={handleSaveWaterHeight}
                className="w-full py-2.5 bg-cyan-750 hover:bg-cyan-800 text-white text-xs rounded-xl font-bold cursor-pointer transition-all flex items-center justify-center gap-1.5"
              >
                ثبت تراز ارتفاع و ذخیره در بایگانی
              </button>
            </div>

          </div>

          {/* RIGHT 7 COLUMNS: FEED MEASUREMENTS, MEDICINE, TREATMENT, DEATHS, TRANSFERS */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* 🍽️ CARD 3: REAL-TIME FEED CALCULATIONS WITH CONVERSION UNITS */}
            <div className="bg-white rounded-3xl border border-natural-border shadow-sm p-6 space-y-4 relative">
              
              {/* DEPRIVATION WATERMARK OVERLAY */}
              {deprivationActive && (
                <div className="absolute top-4 left-4 bg-[#A65D50] text-[#FAF9F5] text-[9.5px] font-black px-3 py-1 rounded-full flex items-center gap-1.5 animate-pulse select-none">
                  <Slash size={12} />
                  وضعیت روزه‌داری / قطع خوراک فعال است
                </div>
              )}

              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-3 border-b border-natural-border/60 gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-700">
                    <UtensilsCrossed size={15} />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-natural-dark font-sans">محاسبه و معادل‌سازی وعده‌های غذایی و FCR</h4>
                    <span className="text-[9px] text-natural-text/50 block text-right">رژیم جیره هوشمند</span>
                  </div>
                </div>

                {/* Interactive Nursery Toggle Option */}
                <button
                  type="button"
                  disabled={deprivationActive}
                  onClick={() => setNurseryEnabled(!nurseryEnabled)}
                  className={`px-3 py-1.5 rounded-xl text-[10px] font-bold flex items-center gap-1.5 transition-all cursor-pointer select-none disabled:opacity-40 ${
                    nurseryEnabled 
                      ? "bg-amber-100 text-amber-900 border border-amber-300 font-extrabold" 
                      : "bg-[#F3F2EC] text-natural-text hover:bg-natural-khaki border border-natural-border/40"
                  }`}
                >
                  <Sparkles size={11} className={nurseryEnabled ? "text-amber-700 animate-pulse" : "text-natural-text/40"} />
                  پروتکل تغذیه اختصاصی نرسری
                </button>
              </div>

              {nurseryEnabled ? (
                <div className="space-y-4 anim-fade-in">
                  
                  {/* Nursery Header Bio Informatory */}
                  <div className="bg-amber-50/45 border border-amber-200/50 rounded-2xl p-3.5 flex justify-between items-center text-[11px] text-amber-900 leading-relaxed text-right">
                    <div className="space-y-0.5">
                      <span className="font-extrabold text-amber-950 block">✓ نظارت خودکار و ارگانیک نرسری (سالن {activePool?.hallId})</span>
                      <p className="text-[10px] text-amber-800">
                        مبتنی بر ۳ مدل جیره: پروتئین تکمیلی، محاسبات ۳٪ بیومس سالن و میکروپیوند دافنی
                      </p>
                    </div>
                    <span className="text-[8px] bg-amber-600 text-white font-black px-2 py-0.5 rounded-md">پروتکل فعال</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Left half: Meals count selection and model Egg pack */}
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[10px] text-natural-text/80 font-bold mb-1 text-right">
                          تعداد دفعات خوراک‌دهی در ۲۴ ساعت (حداکثر ۶ وعده):
                        </label>
                        <select
                          disabled={deprivationActive}
                          value={nurseryMealsCount}
                          onChange={(e) => setNurseryMealsCount(parseInt(e.target.value))}
                          className="w-full text-xs font-bold font-sans rounded-xl border border-natural-border p-2 bg-[#FDFCF8] text-natural-dark focus:outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-500/20 cursor-pointer"
                        >
                          {[1, 2, 3, 4, 5, 6].map(num => (
                            <option key={num} value={num}>{num} وعده مجزا در طول شبانه‌روز</option>
                          ))}
                        </select>
                      </div>

                      {/* 🕒 ۴-HOUR INTERVAL TIMETABLE DROPDOWNS (کشویی هوشمند زمان‌بندی ۴ ساعته) */}
                      <div className="bg-amber-50/45 border-2 border-amber-500/20 p-3.5 rounded-2xl space-y-2.5 text-right">
                        <div className="flex items-center gap-1.5 pb-2 border-b border-amber-100">
                          <Clock size={13} className="text-amber-700 mt-0.5 animate-pulse" />
                          <span className="text-[10px] font-black text-amber-950 font-sans">جدول زمان‌بندی ۲۴ ساعته (چرخه ۴ ساعته از ۹:۰۰ صبح)</span>
                        </div>
                        
                        <p className="text-[9px] text-amber-900 leading-normal">
                          برای هر کدام از ساعات چرخه نگهداشت لاروی، نوع جیره را از کشویی زیر مشخص کنید:
                        </p>

                        <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
                          {[
                            { time: "09:00", label: "۰۹:۰۰ (۹:۰۰ صبح)" },
                            { time: "13:00", label: "۱۳:۰۰ (۱:۰۰ ظهر)" },
                            { time: "17:00", label: "۱۷:۰۰ (۵:۰۰ عصر)" },
                            { time: "21:00", label: "۲۱:۰۰ (۹:۰۰ شب)" },
                            { time: "01:00", label: "۰۱:۰۰ (۱:۰۰ بامداد)" },
                            { time: "05:00", label: "۰۵:۰۰ (۵:۰۰ صبح)" }
                          ].slice(0, nurseryMealsCount).map((slot, idx) => (
                            <div key={slot.time} className="flex items-center justify-between gap-1.5 bg-white border border-amber-200/50 p-2 rounded-xl shadow-xs">
                              <span className="text-[10px] font-extrabold text-amber-950 font-sans shrink-0 block text-right">
                                وعده {idx + 1} ({slot.label}):
                              </span>
                              
                              <select
                                disabled={deprivationActive}
                                value={nurserySchedule[slot.time] || "❌ قطع موقت تغذیه"}
                                onChange={(e) => {
                                  setNurserySchedule(prev => ({
                                    ...prev,
                                    [slot.time]: e.target.value
                                  }));
                                }}
                                className="text-[10px] font-bold font-sans rounded-lg border border-natural-border px-1.5 py-1 bg-amber-50/25 text-natural-dark focus:outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-500/20 w-auto min-w-[130px] text-right cursor-pointer"
                              >
                                <option value="🥚 زرده تخم‌مرغ روزانه">🥚 زرده تخم‌مرغ روزانه</option>
                                <option value="🌾 غذای خشک پرورشی ۳٪">🌾 غذای خشک پرورشی ۳٪</option>
                                <option value="🦠 بیومس دافنی و آرتمیا">🦠 بیومس دافنی و آرتمیا</option>
                                <option value="❌ قطع موقت تغذیه">❌ قطع موقت تغذیه</option>
                              </select>
                            </div>
                          ))}
                        </div>

                        {/* 💊 بخش ویژه تراپی نرسری (۸ صبح و ۸ شب) */}
                        <div className="border-t border-amber-200 pt-2.5 mt-2.5 space-y-2">
                          <span className="text-[9.5px] font-black text-amber-950 block">💉 زمان‌بندی تراپی و حمام بیولوژیکی (۸ صبح و ۸ شب):</span>
                          
                          {/* 8 AM Input */}
                          <div className="flex items-center justify-between gap-1.5 bg-amber-50 border border-amber-300 p-2 rounded-xl shadow-xs">
                            <span className="text-[10px] font-extrabold text-amber-950 font-sans shrink-0 block text-right">
                              📍 تراپی صبح (۰۸:۰۰ صبح):
                            </span>
                            <input
                              type="text"
                              disabled={deprivationActive}
                              value={nurserySchedule["08:00"] || ""}
                              placeholder="مثال: ویتامینه و اسیدآمینه نرسری"
                              onChange={(e) => {
                                setNurserySchedule(prev => ({
                                  ...prev,
                                  "08:00": e.target.value
                                }));
                              }}
                              className="text-[10px] font-bold font-sans rounded-lg border border-amber-300 px-2.5 py-1 bg-white text-natural-dark focus:outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-500/20 w-full max-w-[200px] text-right"
                            />
                          </div>

                          {/* 8 PM Input */}
                          <div className="flex items-center justify-between gap-1.5 bg-amber-50 border border-amber-300 p-2 rounded-xl shadow-xs">
                            <span className="text-[10px] font-extrabold text-amber-950 font-sans shrink-0 block text-right">
                              📍 تراپی شب (۲۰:۰۰ شب):
                            </span>
                            <input
                              type="text"
                              disabled={deprivationActive}
                              value={nurserySchedule["20:00"] || ""}
                              placeholder="مثال: حمام نمک ضد قارچ"
                              onChange={(e) => {
                                setNurserySchedule(prev => ({
                                  ...prev,
                                  "20:00": e.target.value
                                }));
                              }}
                              className="text-[10px] font-bold font-sans rounded-lg border border-amber-300 px-2.5 py-1 bg-white text-natural-dark focus:outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-500/20 w-full max-w-[200px] text-right"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Food Model A: Egg Yolk counted by numbers */}
                      <div className="bg-[#FAF9F5] p-3 rounded-2xl border border-natural-border/30 space-y-2 text-right">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 pb-1 border-b border-natural-border/20">
                          <span className="text-[10.5px] text-natural-dark font-black">🥚 مدل ۱: زرده تخم‌مرغ روزانه</span>
                          <span className="text-[8px] bg-amber-100 text-amber-900 px-2 py-0.5 rounded-lg font-black font-sans shrink-0">
                            شمارشی بر اساس نیاز تمام استخرهای فعال سالن ۱
                          </span>
                        </div>
                        <div className="bg-amber-50/50 p-2 rounded-xl text-[9px] text-amber-900 border border-amber-200/40 leading-relaxed font-bold">
                          <span>📊 تعداد کل استخرهای فعال سالن ۱ نرسری:</span>{' '}
                          <span className="font-mono text-[10.5px] text-amber-950 font-black">
                            {pools.filter(p => p.hallId === 1 && p.count > 0).length} استخر فعال
                          </span>
                        </div>
                        <p className="text-[9.5px] text-natural-text/70 leading-normal">
                          نیازسنجی کلونی نرسری صورت گرفته است. لطفاً تعداد زرده مصرفی کل سالن را ترجیحاً به صورت دستی برحسب نیاز وارد نمایید:
                        </p>
                        <div className="relative">
                          <input
                            type="number"
                            min="0"
                            disabled={deprivationActive}
                            value={nurseryEggCount}
                            onChange={(e) => setNurseryEggCount(e.target.value)}
                            className="w-full text-xs font-bold rounded-xl border border-natural-border p-2 bg-white text-natural-dark text-left font-mono focus:border-amber-500 focus:ring-1 focus:ring-amber-200"
                            style={{ direction: 'ltr' }}
                          />
                          <span className="absolute left-2.5 top-2 text-[10px] text-natural-text/50">عدد زرده</span>
                        </div>
                      </div>
                    </div>

                    {/* Right half: Dry feed (3% of total biomass of hall) and Live daphnia */}
                    <div className="space-y-3">
                      
                      {/* Food Model B: Dry Feed */}
                      <div className="bg-emerald-50/40 p-3 rounded-2xl border border-emerald-100 space-y-1.5 text-right">
                        <div className="flex justify-between items-center">
                          <span className="text-[10.5px] text-emerald-950 font-black">🌾 مدل ۲: غذای خشک پرورشی نرسری</span>
                          <span className="text-[8.5px] bg-emerald-100 text-emerald-900 px-1.5 py-0.5 rounded font-bold font-sans">۳٪ بیومس کل سالن</span>
                        </div>

                        {/* Hall Bio Statistic Trace */}
                        <div className="space-y-1 bg-white border border-emerald-100 p-2 rounded-xl text-[10px] text-emerald-900">
                          <div className="flex justify-between items-center">
                            <span>زی‌توده کل سالن {activePool?.hallId}:</span>
                            <span className="font-bold font-mono text-emerald-800">
                              {(() => {
                                const list = pools.filter(p => p.hallId === activePool?.hallId);
                                const sumBiomass = list.reduce((acc, p) => acc + (p.totalBiomassKg || 0), 0);
                                return sumBiomass.toFixed(1);
                              })()} کیلوگرم
                            </span>
                          </div>
                          <div className="flex justify-between items-center border-t border-emerald-50 pt-1 mt-1 font-bold text-emerald-950">
                            <span>محاسبه شده (۳٪ کل سالن):</span>
                            <span className="font-mono text-[11px] text-emerald-800 font-bold">
                              {(() => {
                                const list = pools.filter(p => p.hallId === activePool?.hallId);
                                const sumBiomass = list.reduce((acc, p) => acc + (p.totalBiomassKg || 0), 0);
                                return (sumBiomass * 0.03).toFixed(2);
                              })()} Kg
                            </span>
                          </div>
                        </div>

                        <div className="relative">
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            disabled={deprivationActive}
                            value={nurseryDryFeedKg}
                            onChange={(e) => setNurseryDryFeedKg(e.target.value)}
                            className="w-full text-xs font-bold rounded-xl border border-natural-border p-2 bg-white text-natural-dark text-left font-mono"
                            style={{ direction: 'ltr' }}
                          />
                          <span className="absolute left-2.5 top-2 text-[10px] text-natural-text/50">Kg غذای خشک</span>
                        </div>
                        <button
                          type="button"
                          disabled={deprivationActive}
                          onClick={() => {
                            const list = pools.filter(p => p.hallId === activePool?.hallId);
                            const sumBiomass = list.reduce((acc, p) => acc + (p.totalBiomassKg || 0), 0);
                            setNurseryDryFeedKg((sumBiomass * 0.03).toFixed(2));
                          }}
                          className="w-full text-[9px] text-emerald-800 hover:text-emerald-950 hover:bg-emerald-100 bg-white border border-emerald-200 py-1 rounded-lg text-center font-bold cursor-pointer transition-all"
                        >
                          ⚡ اعمال مبنای ۳٪ بیومس کل سالن
                        </button>
                      </div>

                      {/* Food Model C: Daphnia & Artemia packages */}
                      <div className="bg-cyan-50/40 p-3 rounded-2xl border border-cyan-100 space-y-1.5 text-right">
                        <div className="flex justify-between items-center">
                          <span className="text-[10.5px] text-cyan-950 font-black">🦠 مدل ۳: بیومس دافنی و آرتمیا زنده</span>
                          <span className="text-[8.5px] bg-cyan-100 text-cyan-900 px-1.5 py-0.5 rounded font-bold font-sans">بسته‌ای</span>
                        </div>
                        <p className="text-[9.5px] text-natural-text/60 leading-normal">
                          تکثیر مکمل بیولوژی زنده و دافنی‌های دپو شده جهت ترغیب صید بچه ماهی لاروی.
                        </p>
                        <div className="relative">
                          <input
                            type="number"
                            min="0"
                            disabled={deprivationActive}
                            value={nurseryDaphniaPacks}
                            onChange={(e) => setNurseryDaphniaPacks(e.target.value)}
                            className="w-full text-xs font-bold rounded-xl border border-natural-border p-2 bg-white text-natural-dark text-left font-mono"
                            style={{ direction: 'ltr' }}
                          />
                          <span className="absolute left-2.5 top-2 text-[10px] text-natural-text/50">بسته روزانه</span>
                        </div>
                      </div>

                      {/* 💊 بخش جدید و فاقد زوائد دارویی و مکمل‌های نرسری */}
                      <div className="bg-rose-50/40 border-2 border-rose-500/20 p-3.5 rounded-2xl space-y-2.5 text-right">
                        <div className="flex justify-between items-center pb-2 border-b border-rose-200/50">
                          <span className="text-[10.5px] text-rose-950 font-black">💊 تجویز مکمل، پروبیوتیک و داروهای زیستی</span>
                          <span className="text-[8.5px] bg-rose-100 text-rose-900 px-1.5 py-0.5 rounded font-bold font-sans">نوع انتخابی</span>
                        </div>
                        
                        <p className="text-[9.5px] text-rose-900 leading-normal">
                          مکمل یا فرمول درمانی مدنظر خود را از درگاه زیر جهت ثبت تجویز هوشمند انتخاب نمایید:
                        </p>

                        <div className="space-y-2">
                          <div>
                            <span className="text-[9px] text-rose-950 block font-bold mb-1">تایپ دستی دارو / مکمل انتخابی:</span>
                            <input
                              type="text"
                              disabled={deprivationActive}
                              value={nurseryMedType}
                              placeholder="مثال: ویتامین C، فلورفنیکول، پروبیوتیک فعال..."
                              onChange={(e) => setNurseryMedType(e.target.value)}
                              className="w-full text-[10px] font-bold font-sans rounded-xl border border-rose-200/70 p-2 bg-[#FDFCF8] text-natural-dark focus:outline-none focus:border-rose-600 focus:ring-1 focus:ring-rose-500/20 text-right font-sans"
                            />
                          </div>

                          <div>
                            <span className="text-[9px] text-rose-950 block font-bold mb-1">میزان دوز توصیه‌شده (گرم):</span>
                            <div className="relative">
                              <input
                                type="number"
                                min="0"
                                disabled={deprivationActive}
                                value={nurseryMedDoseSec}
                                onChange={(e) => setNurseryMedDoseSec(e.target.value)}
                                className="w-full text-xs font-bold rounded-xl border border-rose-200/70 p-2 bg-white text-natural-dark text-left font-mono"
                                style={{ direction: 'ltr' }}
                              />
                              <span className="absolute left-2.5 top-2 text-[10px] text-rose-600/70 font-sans font-black">گرم</span>
                            </div>
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>

                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Inputs area */}
                  <div className="space-y-3">
                    <label className="block text-[11px] text-natural-text/80 font-bold">
                      میزان کل خوراک این وعده (کیلوگرم):
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.1"
                        disabled={deprivationActive}
                        value={feedKg}
                        onChange={(e) => setFeedKg(e.target.value)}
                        className="w-full text-xs font-sans rounded-xl border border-natural-border p-2.5 bg-[#FDFCF8] text-natural-dark focus:outline-none focus:border-natural-earth text-right font-mono disabled:opacity-40"
                      />
                      <span className="absolute left-2.5 top-2 text-[10px] text-natural-text/50">Kg</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-[9.5px] text-natural-text/60 block font-semibold mb-1">نوع فرمول غذایی:</span>
                        <select
                          disabled={deprivationActive}
                          value={feedType}
                          onChange={(e) => setFeedType(e.target.value)}
                          className="w-full text-[10.5px] font-sans rounded-xl border border-natural-border p-2 bg-[#FDFCF8] text-natural-dark focus:outline-none"
                        >
                          <option value="پفکی شماره ۳">پفکی شماره ۳ (نرسری)</option>
                          <option value="پفکی شماره ۴">پفکی شماره ۴</option>
                          <option value="پفکی شماره ۵">پفکی شماره ۵ (پیش‌پروار)</option>
                          <option value="غرق‌شونده هورمونی">غرق‌شونده غنی‌شده</option>
                          <option value="غرق‌شونده پرواری">غرق‌شونده پرواری</option>
                        </select>
                      </div>

                      <div>
                        <span className="text-[9.5px] text-natural-text/60 block font-semibold mb-1">درصد مصرف ماهیانه (%):</span>
                        <input
                          type="range"
                          min="50"
                          max="100"
                          disabled={deprivationActive}
                          value={eatenPct}
                          onChange={(e) => setEatenPct(parseInt(e.target.value))}
                          className="w-full text-xs cursor-pointer h-1 bg-natural-border rounded-lg appearance-none mt-4"
                        />
                        <span className="text-[10px] text-natural-earth font-bold text-center block mt-1 font-mono">{eatenPct}٪ اشتها</span>
                      </div>
                    </div>

                    <div className="bg-[#FAF9F5] p-3 rounded-xl border border-natural-border/40 text-[10px] text-natural-dark space-y-1 select-none">
                      <span className="font-bold block text-natural-earth">🧬 محاسبه ضریب رشد کلونی:</span>
                      <div className="flex justify-between items-center">
                        <span>نرخ رشد روزانه گله استخر:</span>
                        <input
                          type="number"
                          step="0.1"
                          value={herdGrowthRate}
                          onChange={(e) => setHerdGrowthRate(parseFloat(e.target.value) || 0)}
                          className="w-[50px] p-0.5 rounded border text-center font-mono font-bold"
                        />
                      </div>
                    </div>
                  </div>

                  {/* REAL-TIME DUAL CUP UNIT CONVERTER */}
                  <div className="bg-emerald-50/40 p-4 rounded-2xl border border-emerald-100 space-y-3">
                    <span className="text-[9.5px] text-[#2D4A3E]/80 block font-extrabold text-center border-b border-emerald-100 pb-1.5">
                      ترازبندی پیمانه چوبی سنتی کارگاه خوراک‌دهی
                    </span>
                    
                    <div className="grid grid-cols-2 gap-2 text-center text-xs">
                      
                      <div className="bg-white p-2.5 rounded-xl border border-emerald-100 shadow-xs">
                        <span className="text-[8.5px] text-natural-text/70 block">پیمانه ۲۵۰ گرمی</span>
                        <strong className="text-lg font-black text-emerald-800 block mt-1 font-mono">
                          {deprivationActive ? 0 : cups250g.toFixed(1)}
                        </strong>
                        <span className="text-[8px] text-natural-text/50">تعداد پیمانه ریز</span>
                      </div>

                      <div className="bg-white p-2.5 rounded-xl border border-emerald-100 shadow-xs">
                        <span className="text-[8.5px] text-natural-text/70 block">پیمانه ۵۰۰ گرمی</span>
                        <strong className="text-lg font-black text-emerald-800 block mt-1 font-mono">
                          {deprivationActive ? 0 : cups500g.toFixed(1)}
                        </strong>
                        <span className="text-[8px] text-natural-text/50">تعداد پیمانه درشت</span>
                      </div>

                    </div>

                    <div className="text-[10px] text-natural-text/80 space-y-2 pt-1">
                      <div className="flex justify-between items-center text-[#2D4A3E] font-medium leading-normal bg-white/50 p-2 rounded-lg">
                        <span>تخمین ضریب تبدیل غذایی (FCR):</span>
                        <strong className="font-bold text-natural-dark text-[11px] font-mono">
                          {deprivationActive ? "0.0" : fcrEstimate ? fcrEstimate.toFixed(2) : "نیاز به خوراک"}
                        </strong>
                      </div>

                      <div className="flex justify-between items-center text-[#2D4A3E] font-semibold leading-normal bg-white/50 p-2 rounded-lg">
                        <span>وعده بعدی پیشنهادی این استخر:</span>
                        <strong className="font-bold text-emerald-800 text-[11px] font-mono">
                          {nextMealProjectedKg} کیلوگرم
                        </strong>
                      </div>
                    </div>

                  </div>

                </div>
              )}

              {/* SAVE DAILY MEALS */}
              <button
                onClick={handleSaveFeeding}
                disabled={deprivationActive}
                className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs rounded-xl font-bold cursor-pointer transition-all disabled:opacity-40"
              >
                {nurseryEnabled ? "ثبت پروتکل جیره ترکیبی ده‌گانه نرسری" : "ثبت وعده غذایی و ارتقاء بایگانی تغذیه"}
              </button>

            </div>

            {/* 🏥 CARD 4: CLINICAL TREATMENT, fast TOGGLE & PERMANGANATE DOSAGE */}
            <div className="bg-white rounded-3xl border border-natural-border shadow-sm p-5 space-y-4 bg-amber-50/5">
              <div className="flex items-center gap-2 pb-3 border-b border-natural-border/60">
                <div className="w-7 h-7 rounded-lg bg-yellow-50 flex items-center justify-center text-amber-700">
                  <ShieldAlert size={15} />
                </div>
                <h4 className="text-xs font-black text-natural-dark font-sans">برنامه دارویی، پرمنگنات و رژیم قطع غذا</h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                <div className="space-y-3">
                  <div>
                    <span className="text-[9.5px] text-natural-text/60 block font-semibold mb-1">وعده مکمل یا داروی درمانی:</span>
                    <select
                      value={medsType}
                      onChange={(e) => setMedsType(e.target.value)}
                      className="w-full text-xs font-sans rounded-xl border border-natural-border p-2 bg-[#FDFCF8] text-natural-dark focus:outline-none"
                    >
                      <option value="بدون دارو / مولتی‌ویتامین ساده">بدون دارو / مولتی‌ویتامین ساده</option>
                      <option value="قرص اکسی‌تتراسایکلین (Oxytetracycline)">قرص اکسی‌تتراسایکلین</option>
                      <option value="پودر ویتامین C تقویت سیستم دفاعی">پودر ویتامین C (دفاعی)</option>
                      <option value="پروبیوتیک هورمونی روده">پروبیوتیک هورمونی گوارش</option>
                      <option value="حمام ایزوله شیلاتی ضد باکتری">باکتری‌کش و گندزدای مخزن</option>
                    </select>
                  </div>

                  <div>
                    <span className="text-[9.5px] text-natural-text/60 block font-semibold mb-1">دوز مصرفی دارو در تانک (گرم):</span>
                    <input
                      type="number"
                      value={medsDoseGrams}
                      onChange={(e) => setMedsDoseGrams(e.target.value)}
                      className="w-full text-xs font-sans rounded-xl border border-natural-border p-2 bg-[#FDFCF8] text-natural-dark focus:outline-none text-right font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <span className="text-[9.5px] text-natural-text/60 block font-semibold mb-1">دوز پرمنگنات پتاسیم (PPM):</span>
                    <input
                      type="number"
                      step="0.1"
                      value={permanganateDosePpm}
                      onChange={(e) => setPermanganateDosePpm(e.target.value)}
                      className="w-full text-xs font-sans rounded-xl border border-natural-border p-2 bg-[#FDFCF8] text-natural-dark focus:outline-none text-right font-mono"
                    />
                    <span className="text-[8.5px] text-natural-text/50 mt-1 block">پیشنهاد ضدعفونی: حداکثر ۲.۰ الی ۵.۰ PPM</span>
                  </div>

                  {/* FOOD DEPRIVATION IS TOGGLE ACTIVE */}
                  <div className="bg-white p-3 rounded-xl border border-natural-border flex items-center justify-between shadow-xs">
                    <div>
                      <span className="text-[10px] text-natural-dark font-bold block leading-none">قطع غذا (روزه‌داری):</span>
                      <span className="text-[8.5px] text-natural-text/50 mt-1 block">قفل موقت خوراک‌دهی</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer select-none shrink-0">
                      <input
                        type="checkbox"
                        checked={deprivationActive}
                        onChange={(e) => setDeprivationActive(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-natural-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-600"></div>
                    </label>
                  </div>
                </div>

              </div>

              {deprivationActive && (
                <div>
                  <span className="text-[9.5px] text-natural-text/60 block font-semibold mb-1">توضیح یا دلیل قطع غذای گله:</span>
                  <input
                    type="text"
                    value={deprivationReason}
                    onChange={(e) => setDeprivationReason(e.target.value)}
                    className="w-full text-xs font-sans rounded-xl border border-natural-border p-2 bg-yellow-50/30 text-natural-dark focus:outline-none placeholder-amber-800/40"
                    placeholder="علت را ذکر کنید؛ مثلاً درمان انگلی، نمونه‌برداری جنسی، سونوگرافی"
                  />
                </div>
              )}

              <button
                onClick={handleSaveTreatmentAndDeprivation}
                className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs rounded-xl font-bold cursor-pointer transition-all"
              >
                ثبت مکتوب دوز درمانی و فست بیولوژیک در آرشیو
              </button>
            </div>

            {/* COLLAPSIBLE ACTIONS ROWS FOR DEATHS & TRANSFERS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* CASUALTY QUICK FORM WIDGET */}
              <div className="bg-white rounded-3xl border border-natural-border shadow-sm p-5 space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b border-natural-border/60">
                  <div className="w-6 h-6 rounded-lg bg-red-50 flex items-center justify-center text-red-750">
                    <HeartCrack size={14} />
                  </div>
                  <h4 className="text-xs font-black text-natural-dark font-sans">ثبت و کسر آنی تلفات استخر</h4>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[9px] text-natural-text/60 block font-semibold mb-1">تعداد تلفات جدید:</span>
                    <input
                      type="number"
                      value={deadCount}
                      onChange={(e) => setDeadCount(parseInt(e.target.value) || 0)}
                      className="w-full text-xs font-sans rounded-xl border border-natural-border p-1.5 bg-[#FDFCF8] text-natural-dark focus:outline-none font-mono"
                      min="0"
                    />
                  </div>

                  <div>
                    <span className="text-[9px] text-natural-text/60 block font-semibold mb-1">وزن تلف‌شده (گرم):</span>
                    <input
                      type="number"
                      value={deadAvgWeight}
                      onChange={(e) => setDeadAvgWeight(parseInt(e.target.value) || 0)}
                      className="w-full text-xs font-sans rounded-xl border border-natural-border p-1.5 bg-[#FDFCF8] text-natural-dark focus:outline-none font-mono"
                      min="0"
                    />
                  </div>
                </div>

                <div>
                  <span className="text-[9px] text-natural-text/60 block font-semibold mb-1">توضیح یا علائم تلفات ماهی:</span>
                  <input
                    type="text"
                    value={mortalitySymptoms}
                    onChange={(e) => setMortalitySymptoms(e.target.value)}
                    className="w-full text-xs font-sans rounded-xl border border-natural-border p-1.5 bg-[#FDFCF8] text-natural-dark focus:outline-none"
                    placeholder="مثلا پرخونی آبشش، حرکات نامنظم"
                  />
                </div>

                <button
                  onClick={handleSaveCasualty}
                  className="w-full py-2 bg-red-750 hover:bg-red-800 text-white text-xs rounded-xl font-bold cursor-pointer transition-all flex items-center justify-center gap-1"
                >
                  کسر آنی جمعیت و ثبت تلفات
                </button>
              </div>

              {/* TRANSFER/MOVEMENT QUICK FORM WIDGET */}
              <div className="bg-white rounded-3xl border border-natural-border shadow-sm p-5 space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b border-natural-border/60">
                  <div className="w-6 h-6 rounded-lg bg-blue-50 flex items-center justify-center text-blue-750">
                    <ArrowRightLeft size={14} />
                  </div>
                  <h4 className="text-xs font-black text-natural-dark font-sans">جابه‌جایی تبارشناسی کلونی</h4>
                </div>

                <div className="py-2 text-right space-y-3">
                  <p className="text-[11px] text-natural-text/80 leading-relaxed">
                    جهت ثبت دقیق انتقالات گله، پایش یکپارچه FCR و پلاک‌گذاری میکروچیپ، از سیستم متمرکز استفاده نمایید.
                  </p>
                  <button
                    onClick={() => {
                      if (onInitiateTransfer) {
                        onInitiateTransfer(activePool.id);
                      }
                    }}
                    className="w-full py-2 bg-blue-800 hover:bg-blue-900 text-white text-xs rounded-xl font-bold cursor-pointer transition-all flex items-center justify-center gap-1 shadow-xs"
                  >
                    <ArrowRightLeft size={12} />
                    انتقال مستقیم از {activePool.name}
                  </button>
                </div>
              </div>

            </div>

          </div>

        </div>
      ) : (
        <div className="bg-natural-khaki/20 p-12 text-center rounded-2xl border border-dashed border-natural-border">
          <p className="text-sm font-bold text-natural-dark">هیچ استخر یا تانکی در این سالن یافت نشد یا سالن در دست احداث است.</p>
        </div>
      )}

    </div>
  );
}
