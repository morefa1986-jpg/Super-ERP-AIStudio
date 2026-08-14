/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum SturgeonBreed {
  BELUGA = "فیل‌ماهی (Beluga)",
  SIBERIAN = "تاس‌ماهی سیبری",
  RUSSIAN = "چالباش (تاس‌ماهی روسی)",
  PERSIAN = "قره‌برون (تاس‌ماهی ایرانی)",
  SEVRUGA = "اوزون‌برون (Sevruga)",
  STERLET = "استرلیاد (Sterlet)",
  SHIP = "ماهی شیپ"
}

export enum PoolPurpose {
  NURSERY = "نرسری (پیش‌پروار نوزادی)",
  PRE_GROWOUT = "پیش پروار",
  GROWOUT = "پرواربندی نهایی",
  BROODSTOCK = "مولدین",
  QUARANTINE = "قرنطینه"
}

export interface User {
  id: string;
  name: string;
  role: "admin" | "supervisor" | "operator" | "viewer";
  permissions: string[];
  lastActive?: string;
  username?: string;
  password?: string;
}

export interface AppNotification {
  id: string;
  type: "info" | "warning" | "critical";
  title: string;
  message: string;
  timestampJalali: string;
  timestampGregorian: string;
  poolId?: string;
  isRead: boolean;
}

export interface AuditLog {
  id: string;
  timestampJalali: string;
  timestampGregorian: string;
  userId: string;
  userName: string;
  action: string; // e.g., "DELETE_POOL", "UPDATE_BIOMASS", "TRANSFER_STURGEON"
  details: string; // before/after state representation
}

export interface FishBatch {
  id: string;
  breed: SturgeonBreed;
  gender: string;
  count: number;
  avgWeightGrams: number;
  notes?: string;
}

export interface Pool {
  id: string; // hXpY traceable pattern
  name: string;
  hallId: number;
  diameter?: number; // in meters
  dimensionsDesc: string; // e.g. "قطر ۴ متر"
  height?: number; // in meters
  purpose: string; // PoolPurpose or custom
  breed: SturgeonBreed;
  count: number;
  avgWeightGrams: number;
  totalBiomassKg: number; // calculated as count * avgWeightGrams / 1000
  temperature: number;
  oxygenLevel: number;
  phLevel: number;
  lastFedDate?: string;
  isCustomCompartment?: boolean;
  compartmentIndex?: number;
  notes?: string;
  createdAtJalali?: string;
  createdAtGregorian?: string;
  updatedAtJalali?: string;
  updatedAtGregorian?: string;
  fishBatches?: FishBatch[];
  chipId?: string;

  // 🔧 Pedigree, CITES, and Verification additions
  pending_verification?: boolean;
  parentMaleId?: string;
  parentFemaleId?: string;
  withdrawalEndDate?: string; // Date indicating the end of therapeutic/chemical withdrawal periods
  citesExportPermit?: string; // CITES official export permit number
  citesAppendixCode?: string; // Appendix I, II or III code
  citesAnnualQuotaAllocated?: number; // Annual quota allocated in Kg
  citesAnnualQuotaRemaining?: number; // Annual quota remaining in Kg
  citesHarvestDate?: string; // CITES registered harvest date
}

export interface Hall {
  id: number;
  name: string;
  description: string;
  isUnderConstruction?: boolean;
  poolIds: string[];
  notes?: string;
  createdAtJalali?: string;
  createdAtGregorian?: string;
}

export interface MovementLog {
  id: string;
  date: string; // Jalali
  dateGregorian?: string;
  breed: SturgeonBreed;
  count: number;
  avgWeightGrams: number;
  fromPoolId: string | null;
  toPoolId: string | null;
  fromPoolName: string;
  toPoolName: string;
  reason: string;
  operator: string;
  chipId?: string;
  gender?: string;
  notes?: string;
  createdAtJalali?: string;
  createdAtGregorian?: string;
}

export interface FeedingMeal {
  id: string;
  poolId: string;
  timestamp: string; // Jalali or iso
  timestampGregorian?: string;
  feedType: string;
  givenAmountKg: number;
  eatenPercentage: number;
  leftoverAmountKg: number;
  estimatedNextMealKg?: number;
  fcrEstimate?: number;
  temperatureAtMeal?: number;
  notes?: string;
  operatorName?: string;
  createdAtJalali?: string;
  createdAtGregorian?: string;
}

export interface MortalityLog {
  id: string;
  poolId: string;
  poolName: string;
  count: number;
  date: string; // Jalali
  dateGregorian?: string;
  avgWeightGrams: number;
  totalLossKg: number;
  reason: string;
  symptoms: string;
  photoUrl?: string;
  explanation: string;
  aiSuggestedAction?: string;
  notes?: string;
  operatorName?: string;
  createdAtJalali?: string;
  createdAtGregorian?: string;
}

export interface FCRReport {
  id: string;
  poolId: string;
  poolName: string;
  startDate: string;
  endDate: string;
  initialWeightGrams: number;
  finalWeightGrams: number;
  initialCount: number;
  finalCount: number;
  weightGainKg: number;
  totalFeedGivenKg: number;
  fcr: number;
  createdAtJalali?: string;
  createdAtGregorian?: string;
}

export interface WaterTestLog {
  id: string;
  poolId: string;
  poolName: string;
  date: string; // Jalali
  timestamp: string; // Jalali or iso
  timestampGregorian?: string;
  temperature: number;
  oxygenLevel: number;
  phLevel: number;
  nitriteLevel: number; // NO2 mg/L
  ammoniaLevel: number; // NH3 mg/L
  salinity: number; // ppt
  status: "normal" | "warning" | "critical";
  statusText: string;
  
  // Specific parameters
  type?: "fixed" | "portable" | "bio";
  orp?: number;
  conductivity?: number;
  nitrateLevel?: number;
  hardnessKH?: number;
  microalgae?: string;
  planktonCount?: number;
  pathogens?: string;
  transparency?: number;
  probeStatus?: "calibrated" | "needs_calibration" | "error" | "offline";
  deviceModel?: string;
  notes?: string;
  operatorName?: string;
  createdAtJalali?: string;
  createdAtGregorian?: string;
}

export interface SonographyLog {
  id: string;
  poolId: string;
  poolName: string;
  date: string; // Jalali
  timestamp: string;
  timestampGregorian?: string;
  tagId: string;
  gender: string;
  maturityStage: string;
  eggDiameterMm: number;
  polarizationIndex: number;
  recommendation: string;
  notes?: string;
  operatorName?: string;
  createdAtJalali?: string;
  createdAtGregorian?: string;
}
