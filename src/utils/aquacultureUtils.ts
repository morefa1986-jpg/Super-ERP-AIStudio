/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Pool, SturgeonBreed } from "../types";
import { CENTRAL_THRESHOLDS } from "../config/thresholds";

export interface FeedCalculationResult {
  dailyFeedKg: number;
  feedPercentage: number;
  numberOfMeals: number;
  isOutsideOptimalTemp: boolean;
  tempWarningMessage?: string;
}

export interface FeedingWaterSafety {
  canFeed: boolean;
  isDataValid: boolean;
  reasons: string[];
}

const isFiniteNumber = (value: number | undefined | null): value is number =>
  typeof value === "number" && Number.isFinite(value);

export const evaluateFeedingWaterSafety = (pool: Pool | undefined | null): FeedingWaterSafety => {
  if (!pool) {
    return { canFeed: false, isDataValid: false, reasons: ["استخر انتخاب نشده است."] };
  }

  const reasons: string[] = [];
  const temp = pool.temperature;
  const oxygen = pool.oxygenLevel;
  const ph = pool.phLevel;
  const thresholds = CENTRAL_THRESHOLDS;

  if (!isFiniteNumber(temp) || temp <= 0 || temp > 40) {
    reasons.push("دمای آب نامعتبر یا ثبت‌نشده است.");
  }
  if (!isFiniteNumber(oxygen) || oxygen <= 0 || oxygen > 30) {
    reasons.push("اکسیژن محلول نامعتبر یا ثبت‌نشده است.");
  }
  if (!isFiniteNumber(ph) || ph <= 0 || ph > 14) {
    reasons.push("pH آب نامعتبر یا ثبت‌نشده است.");
  }

  const isDataValid = reasons.length === 0;
  if (!isDataValid) {
    return { canFeed: false, isDataValid, reasons };
  }

  if (temp < 6 || temp > 24) {
    reasons.push("دمای آب در محدوده قطع کامل تغذیه است.");
  }
  if (oxygen <= thresholds.oxygenLevel.criticalMin) {
    reasons.push("اکسیژن محلول در سطح بحرانی است.");
  }
  if (ph <= thresholds.phLevel.criticalMin || ph >= thresholds.phLevel.criticalMax) {
    reasons.push("pH آب در سطح بحرانی است.");
  }

  return { canFeed: reasons.length === 0, isDataValid, reasons };
};

/**
 * Calculates standard sturgeon daily feeding chart percentage.
 * Sturgeon feed rate depends heavily on body weight and temperature:
 * - Larvae/fingerlings (0-50g) need high feed percentage (3.0% to 5.5% of body weight per day) at optimal 18-22°C.
 * - Juveniles/growing (50-1000g) need 1.2% to 2.5% of body weight per day.
 * - Adult/Fattening (1000g-10000g) need 0.5% to 1.2% of body weight per day.
 * - Broodstock (10000g+) need 0.3% to 0.6% of body weight.
 * Temperature modifications:
 * - Optimal range (15°C - 20°C): 100% of standard feed rate.
 * - Suboptimal cold (10°C - 14°C): reduce by 40% - 60%.
 * - Extremely cold (< 8°C): reduce by 80% or cease completely.
 * - Suboptimal hot (21°C - 24°C): reduce by 30% due to hypoxia risk.
 * - Extremely hot (> 25°C): cease completely (extreme risk of mortality).
 */
export const calculateSturgeonFeed = (
  avgWeightGrams: number,
  temperature: number,
  totalBiomassKg: number,
  breed: SturgeonBreed
): FeedCalculationResult => {
  let basePercentage = 1.0;

  // 1. Determine base feed percentage by body weight
  if (avgWeightGrams <= 50) {
    basePercentage = 4.0;
  } else if (avgWeightGrams <= 500) {
    basePercentage = 2.0;
  } else if (avgWeightGrams <= 2000) {
    basePercentage = 1.2;
  } else if (avgWeightGrams <= 10000) {
    basePercentage = 0.8;
  } else {
    basePercentage = 0.4; // Large Broodstock
  }

  // Adjustments based on specific breed metabolic intensity
  if (breed === SturgeonBreed.BELUGA) {
    basePercentage *= 1.1; // Beluga are aggressive feeders
  } else if (breed === SturgeonBreed.STERLET) {
    basePercentage *= 0.9; // Sterlet have lower growth rates
  }

  // 2. Adjust for temperature
  let multiplier = 1.0;
  let isOutsideOptimalTemp = false;
  let tempWarningMessage = "";
  let numberOfMeals = 3;

  if (temperature < 6.0) {
    multiplier = 0.0; // Stop feeding completely
    isOutsideOptimalTemp = true;
    tempWarningMessage = "🚨 بحران سرما: دمای آب زیر ۶ درجه سلسیوس است! سیستم گوارشی خاویاری متوقف شده؛ تغذیه کاملاً قطع گردد.";
    numberOfMeals = 0;
  } else if (temperature < 10.0) {
    multiplier = 0.2; // 80% reduction
    isOutsideOptimalTemp = true;
    tempWarningMessage = "⚠️ سرمای شدید: دمای زیر ۱۰ درجه است. سوخت و ساز افت شدید دارد؛ جیره به ۲۰٪ جیره مبنا کاهش یابد.";
    numberOfMeals = 1;
  } else if (temperature < 14.0) {
    multiplier = 0.6; // 40% reduction
    tempWarningMessage = "خنک غیربهینه: دمای زیر ۱۴ درجه است. جیره تغذیه ۶۰٪ استاندارد اعمال شود.";
    numberOfMeals = 2;
  } else if (temperature >= 14.0 && temperature <= 21.0) {
    multiplier = 1.0; // Optimal growth zone!
    numberOfMeals = 3;
    if (avgWeightGrams <= 50) numberOfMeals = 5; // Larvae feed more frequently
  } else if (temperature <= 24.0) {
    multiplier = 0.7; // 30% reduction due to lower oxygen binding capacity
    isOutsideOptimalTemp = true;
    tempWarningMessage = "⚠️ گرمای حاشیه بحران: دمای بالای ۲۱ درجه. جهت جلوگیری از کمبود اکسیژن، جیره ۳۰٪ تقلیل یابد.";
    numberOfMeals = 2;
  } else {
    multiplier = 0.0; // Stop feeding to avoid oxygen collapse
    isOutsideOptimalTemp = true;
    tempWarningMessage = "🚨 بحران گرما: دمای آب بالاتر از ۲۴ درجه سلسیوس است! ریسک شدید خفگی و سقوط اکسیژن. تغذیه مطلقاً قطع گردد.";
    numberOfMeals = 0;
  }

  const finalPercentage = parseFloat((basePercentage * multiplier).toFixed(3));
  const dailyFeedKg = parseFloat(((totalBiomassKg * finalPercentage) / 100).toFixed(2));

  return {
    dailyFeedKg,
    feedPercentage: finalPercentage,
    numberOfMeals,
    isOutsideOptimalTemp,
    tempWarningMessage: tempWarningMessage || undefined
  };
};

/**
 * Unified pool status evaluation function using Central Config thresholds.
 * Returns "normal", "warning" or "critical".
 */
export const getPoolStatus = (pool: Pool): "normal" | "warning" | "critical" => {
  const t = CENTRAL_THRESHOLDS;

  // 1. Evaluate Oxygen level (most critical factor in sturgeon)
  if (pool.oxygenLevel <= t.oxygenLevel.criticalMin || pool.oxygenLevel >= t.oxygenLevel.criticalMax) {
    return "critical";
  }
  
  // 2. Evaluate temperature
  if (pool.temperature <= t.temperature.criticalMin || pool.temperature >= t.temperature.criticalMax) {
    return "critical";
  }

  // 3. Evaluate pH level
  if (pool.phLevel <= t.phLevel.criticalMin || pool.phLevel >= t.phLevel.criticalMax) {
    return "critical";
  }

  // Warning thresholds
  if (
    pool.oxygenLevel < t.oxygenLevel.min ||
    pool.temperature < t.temperature.min ||
    pool.temperature > t.temperature.max ||
    pool.phLevel < t.phLevel.min ||
    pool.phLevel > t.phLevel.max
  ) {
    return "warning";
  }

  return "normal";
};

/**
 * Translates pool status to color styles (for SVG/UI elements)
 */
export const getStatusColorClasses = (status: "normal" | "warning" | "critical") => {
  switch (status) {
    case "critical":
      return {
        bg: "bg-red-50",
        border: "border-red-200",
        text: "text-red-700",
        fill: "#ef4444",
        badge: "bg-red-100 text-red-800"
      };
    case "warning":
      return {
        bg: "bg-amber-50",
        border: "border-amber-200",
        text: "text-amber-700",
        fill: "#f59e0b",
        badge: "bg-amber-100 text-amber-800"
      };
    case "normal":
    default:
      return {
        bg: "bg-emerald-50",
        border: "border-emerald-100",
        text: "text-emerald-700",
        fill: "#10b981",
        badge: "bg-emerald-100 text-emerald-800"
      };
  }
};

export const formatWaterParam = (val: number | undefined | null): string => {
  if (val === undefined || val === null || isNaN(val)) return "-";
  return parseFloat(Number(val).toFixed(2)).toString();
};

export const formatRequiredSensorParam = (val: number | undefined | null): string => {
  if (val === undefined || val === null || isNaN(val) || val <= 0) return "ثبت‌نشده";
  return formatWaterParam(val);
};

export const formatRequiredSensorParamWithUnit = (val: number | undefined | null, unit: string): string => {
  const formatted = formatRequiredSensorParam(val);
  return formatted === "ثبت‌نشده" ? formatted : `${formatted}${unit}`;
};

export interface PoolVolumeDetails {
  volumeM3: number;
  pendingVerification: boolean;
  maxDensityKgPerM3: number;
  capacityRatio: number;
  capacityStatus: "empty" | "normal" | "near_saturation" | "overloaded";
}

/**
 * Calculates water volume, density limits, and capacity status for any pool
 * based on structural parameters, hall constraints, and current biomass.
 */
export const calculatePoolVolumeDetails = (pool: Pool): PoolVolumeDetails => {
  let volumeM3 = 0;
  let pendingVerification = false;
  let maxDensityKgPerM3 = 10; // default standard

  // 1. Assign maximum permitted density by Hall ID
  switch (pool.hallId) {
    case 1:
      maxDensityKgPerM3 = 5; // Larvae/fingerling Nursery
      break;
    case 2:
    case 3:
      maxDensityKgPerM3 = 10; // Early pre-fattening d4m
      break;
    case 4:
    case 5:
      maxDensityKgPerM3 = 15; // Growing pre-fattening d6m
      break;
    case 7:
      maxDensityKgPerM3 = 5; // Breeders
      break;
    case 8:
    case 9:
      maxDensityKgPerM3 = 8; // Pre-breeders d10m
      break;
    case 10:
    case 11:
      maxDensityKgPerM3 = 25; // High-density Fattening
      break;
    case 12:
      maxDensityKgPerM3 = 20; // Landing & sales
      break;
    default:
      maxDensityKgPerM3 = 10;
  }

  // Allow custom override if explicitly present in pool
  if (pool.pending_verification !== undefined) {
    pendingVerification = pool.pending_verification;
  }

  // 2. Perform formula-based volume calculations (Cylinder vs Cuboid/Compartments)
  if (pool.hallId === 1) {
    // Nursery 2m diameter, 1m water height -> pi * 1^2 * 1 = 3.14 m³
    volumeM3 = 3.14159 * 1 * 1 * 1.0;
  } else if (pool.hallId === 2 || pool.hallId === 3) {
    // 4m diameter, 1.3m height
    const radius = 2;
    volumeM3 = 3.14159 * radius * radius * 1.3; // 16.33 m³
  } else if (pool.hallId === 4 || pool.hallId === 5) {
    // 6m diameter, 1.3m height
    const radius = 3;
    volumeM3 = 3.14159 * radius * radius * 1.3; // 36.76 m³
  } else if (pool.hallId === 7) {
    // Hall 7: 176 sqm or 206 sqm. Depth is unregistered -> pending_verification
    pendingVerification = true;
    if (pool.id.includes("h7p1")) {
      volumeM3 = 176 * 1.0; // 176 m³ temporary assumption
    } else {
      volumeM3 = 206 * 1.0; // 206 m³ temporary assumption
    }
  } else if (pool.hallId === 8 || pool.hallId === 9) {
    // 10m diameter, 1.3m height
    const radius = 5;
    volumeM3 = 3.14159 * radius * radius * 1.3; // 102.1 m³
  } else if (pool.hallId === 10 || pool.hallId === 11) {
    if (pool.id.includes("q")) {
      // Quarantine 4m diameter, 1.3m height
      const radius = 2;
      volumeM3 = 3.14159 * radius * radius * 1.3; // 16.33 m³
    } else if (pool.id.includes("c")) {
      // Linear/Compartment pool
      if (pool.hallId === 10) {
        // Hall 10 channel 6x1.5m. Height is unknown -> pending_verification
        pendingVerification = true;
        const totalVolume = 6 * 1.5 * 1.0; // 9.0 m³ with temporary 1m assumed depth
        volumeM3 = totalVolume / 8; // 1.125 m³ per part
      } else {
        // Hall 11 channel 6x2.5m, height 1.1m
        const totalVolume = 6 * 2.5 * 1.1; // 16.5 m³
        volumeM3 = totalVolume / 8; // 2.0625 m³ per part
      }
    } else {
      // Regular 10m diameter, 1.3m height
      const radius = 5;
      volumeM3 = 3.14159 * radius * radius * 1.3; // 102.1 m³
    }
  } else if (pool.hallId === 12) {
    // Hall 12: Landing pools. Dimensions unregistered -> pending_verification
    pendingVerification = true;
    const radius = 1.25; // 2.5m diameter
    volumeM3 = 3.14159 * radius * radius * 1.5; // 7.36 m³ temporary estimation
  } else {
    // Fallback formula
    if (pool.diameter) {
      const radius = pool.diameter / 2;
      volumeM3 = 3.14159 * radius * radius * (pool.height || 1.2);
    } else {
      volumeM3 = 10.0; // static fallback
    }
  }

  // Round volume to 2 decimal places
  volumeM3 = parseFloat(volumeM3.toFixed(2));

  // 3. Determine Capacity saturation ratio and status
  const currentBiomass = pool.totalBiomassKg || 0;
  const maxCapacityKg = volumeM3 * maxDensityKgPerM3;
  const capacityRatio = maxCapacityKg > 0 ? currentBiomass / maxCapacityKg : 0;

  let capacityStatus: "empty" | "normal" | "near_saturation" | "overloaded" = "normal";
  if (pool.count === 0 || currentBiomass === 0) {
    capacityStatus = "empty";
  } else if (capacityRatio < 0.6) {
    capacityStatus = "normal";
  } else if (capacityRatio < 0.9) {
    capacityStatus = "near_saturation";
  } else {
    capacityStatus = "overloaded";
  }

  return {
    volumeM3,
    pendingVerification,
    maxDensityKgPerM3,
    capacityRatio,
    capacityStatus
  };
};
