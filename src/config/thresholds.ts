/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ParameterThreshold {
  min?: number;
  max?: number;
  criticalMin?: number;
  criticalMax?: number;
  optimal?: number | string;
  unit?: string;
  description?: string;
}

export interface ThresholdsConfig {
  temperature: ParameterThreshold & { min: number; max: number; criticalMin: number; criticalMax: number; optimal: number };
  oxygenLevel: ParameterThreshold & { min: number; max: number; criticalMin: number; criticalMax: number; optimal: number };
  phLevel: ParameterThreshold & { min: number; max: number; criticalMin: number; criticalMax: number; optimal: number };
  nitriteLevel: ParameterThreshold & { max: number; criticalMax: number; optimal: number };
  ammoniaLevel: ParameterThreshold & { max: number; criticalMax: number; optimal: number };

  // Compatibility properties
  dissolvedOxygen?: ParameterThreshold & { min: number; max: number; optimal: number };
  salinity?: ParameterThreshold & { min?: number; max: number; optimal: string };
  orp?: ParameterThreshold & { max: number; optimal: number };
  ec?: ParameterThreshold & { max: number; optimal: number };
  nh4?: ParameterThreshold & { max: number; optimal: number };
  no3?: ParameterThreshold & { max: number; optimal: number };
  ozone?: ParameterThreshold & { max: number; optimal: number };
}

export const DEFAULT_THRESHOLDS: ThresholdsConfig = {
  temperature: {
    min: 10,
    max: 25,
    criticalMin: 6,
    criticalMax: 28,
    optimal: 18,
    unit: "°C",
    description: "دامنه ۱۰ الی ۲۵ (بهترین ۱۸)"
  },
  oxygenLevel: {
    min: 5.0,
    max: 10.0,
    criticalMin: 4.0,
    criticalMax: 12.0,
    optimal: 7.0,
    unit: "mg/L",
    description: "دامنه ۵ الی ۱۰ (بهترین ۷)"
  },
  phLevel: {
    min: 6.8,
    max: 8.8,
    criticalMin: 6.2,
    criticalMax: 9.2,
    optimal: 7.8,
    unit: "pH",
    description: "دامنه ۶.۸ الی ۸.۸ (بهترین ۷.۸)"
  },
  nitriteLevel: {
    max: 0.1,
    criticalMax: 0.25,
    optimal: 0.02,
    unit: "mg/L",
    description: "حداکثر ۰.۱ (بحرانی بالای ۰.۲۵)"
  },
  ammoniaLevel: {
    max: 0.05,
    criticalMax: 0.1,
    optimal: 0.01,
    unit: "mg/L",
    description: "حداکثر ۰.۰۵ (بحرانی بالای ۰.۱)"
  },
  dissolvedOxygen: {
    min: 4.5,
    max: 8.0,
    optimal: 7.0,
    unit: "mg/L",
    description: "دامنه ۴.۵ الی ۸ (بهترین ۷)"
  },
  salinity: {
    min: 0,
    max: 18,
    optimal: "2 - 4",
    unit: "ppt",
    description: "دامنه ۰ الی ۱۸ (بهترین ۲ الی ۴)"
  },
  orp: {
    max: 350,
    optimal: 250,
    unit: "mV",
    description: "کمتر از ۳۵۰ (بهترین ۲۵۰)"
  },
  ec: {
    max: 1800,
    optimal: 800,
    unit: "µS/cm",
    description: "حداکثر ۱۸۰۰ (بهترین ۸۰۰)"
  },
  nh4: {
    max: 1.0,
    optimal: 0.5,
    unit: "mg/L",
    description: "کمتر از ۱ (بهترین کمتر از ۰.۵)"
  },
  no3: {
    max: 2.0,
    optimal: 1.0,
    unit: "mg/L",
    description: "کمتر از ۲ (بهترین کمتر از ۱)"
  },
  ozone: {
    max: 0.08,
    optimal: 0.05,
    unit: "mg/L",
    description: "کمتر از ۰.۰۸ (بهترین کمتر از ۰.۰۵)"
  }
};

export const CENTRAL_THRESHOLDS: ThresholdsConfig = (() => {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("sturgeon_thresholds_v2");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return { ...DEFAULT_THRESHOLDS, ...parsed };
      } catch (e) {
        console.error("Failed to parse sturgeon_thresholds_v2", e);
      }
    }
  }
  return { ...DEFAULT_THRESHOLDS };
})();

export const saveCentralThresholds = (newThresholds: Partial<Record<keyof ThresholdsConfig, any>>) => {
  Object.assign(CENTRAL_THRESHOLDS, newThresholds);
  if (typeof window !== "undefined") {
    localStorage.setItem("sturgeon_thresholds_v2", JSON.stringify(CENTRAL_THRESHOLDS));
  }
};
