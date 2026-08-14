/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Pool, Hall, SturgeonBreed, MovementLog, FeedingMeal, MortalityLog } from "../types";

// Generate Initial Empty Pools for Sturgeon Farm Production
const generateInitialPools = (): Pool[] => {
  const pools: Pool[] = [];

  // 1. Hall 1: Nursery (نرسری) - 52 pools (ونیرو), diameter 2m
  for (let i = 1; i <= 52; i++) {
    pools.push({
      id: `h1p${i}`,
      name: `ونیرو ${i}`,
      hallId: 1,
      diameter: 2,
      dimensionsDesc: "قطر ۲ متر (ارتفاع ۱.۲۰)",
      purpose: "نرسری (لارو و بچه ماهی)",
      breed: SturgeonBreed.BELUGA,
      count: 0,
      avgWeightGrams: 0,
      totalBiomassKg: 0,
      temperature: 0,
      oxygenLevel: 0,
      phLevel: 0,
      lastFedDate: ""
    });
  }

  // 2. Hall 2: 14 pools, diameter 4m - pre-fattening
  for (let i = 1; i <= 14; i++) {
    pools.push({
      id: `h2p${i}`,
      name: `استخر ${i}`,
      hallId: 2,
      diameter: 4,
      dimensionsDesc: "قطر ۴ متر",
      purpose: "پیش پروار (رشد متوسط)",
      breed: SturgeonBreed.BELUGA,
      count: 0,
      avgWeightGrams: 0,
      totalBiomassKg: 0,
      temperature: 0,
      oxygenLevel: 0,
      phLevel: 0,
      lastFedDate: ""
    });
  }

  // 3. Hall 3: 14 pools, diameter 4m - pre-fattening
  for (let i = 1; i <= 14; i++) {
    pools.push({
      id: `h3p${i}`,
      name: `استخر ${i}`,
      hallId: 3,
      diameter: 4,
      dimensionsDesc: "قطر ۴ متر",
      purpose: "پیش پروار (رشد متوسط)",
      breed: SturgeonBreed.BELUGA,
      count: 0,
      avgWeightGrams: 0,
      totalBiomassKg: 0,
      temperature: 0,
      oxygenLevel: 0,
      phLevel: 0,
      lastFedDate: ""
    });
  }

  // 4. Hall 4: 7 pools, diameter 6m - pre-fattening
  for (let i = 1; i <= 7; i++) {
    pools.push({
      id: `h4p${i}`,
      name: `استخر ${i}`,
      hallId: 4,
      diameter: 6,
      dimensionsDesc: "قطر ۶ متر",
      purpose: "پیش پروار (سایز بزرگ)",
      breed: SturgeonBreed.BELUGA,
      count: 0,
      avgWeightGrams: 0,
      totalBiomassKg: 0,
      temperature: 0,
      oxygenLevel: 0,
      phLevel: 0,
      lastFedDate: ""
    });
  }

  // 5. Hall 5: 7 pools, diameter 6m - pre-fattening
  for (let i = 1; i <= 7; i++) {
    pools.push({
      id: `h5p${i}`,
      name: `استخر ${i}`,
      hallId: 5,
      diameter: 6,
      dimensionsDesc: "قطر ۶ متر",
      purpose: "پیش پروار (سایز بزرگ)",
      breed: SturgeonBreed.BELUGA,
      count: 0,
      avgWeightGrams: 0,
      totalBiomassKg: 0,
      temperature: 0,
      oxygenLevel: 0,
      phLevel: 0,
      lastFedDate: ""
    });
  }

  // Hall 6 has no pools (under construction)

  // 7. Hall 7: Breeding hall - 2 breeders pools: 176 sqm & 206 sqm
  pools.push({
    id: `h7p1`,
    name: "استخر مولدین ۱۷۶ متری",
    hallId: 7,
    dimensionsDesc: "ابعاد ۱۷۶ متر مربع",
    purpose: "نگهداری مولدین بزرگ",
    breed: SturgeonBreed.BELUGA,
    count: 0,
    avgWeightGrams: 0,
    totalBiomassKg: 0,
    temperature: 0,
    oxygenLevel: 0,
    phLevel: 0,
    lastFedDate: ""
  });

  pools.push({
    id: `h7p2`,
    name: "استخر مولدین ۲۰۶ متری",
    hallId: 7,
    dimensionsDesc: "ابعاد ۲۰۶ متر مربع",
    purpose: "نگهداری مولدین بزرگ",
    breed: SturgeonBreed.BELUGA,
    count: 0,
    avgWeightGrams: 0,
    totalBiomassKg: 0,
    temperature: 0,
    oxygenLevel: 0,
    phLevel: 0,
    lastFedDate: ""
  });

  // 8. Hall 8: 5 pools, diameter 10m - pre-breeders (پیش مولدین)
  for (let i = 1; i <= 5; i++) {
    pools.push({
      id: `h8p${i}`,
      name: `استخر ${i}`,
      hallId: 8,
      diameter: 10,
      dimensionsDesc: "قطر ۱۰ متر",
      purpose: "پیش مولدین",
      breed: SturgeonBreed.BELUGA,
      count: 0,
      avgWeightGrams: 0,
      totalBiomassKg: 0,
      temperature: 0,
      oxygenLevel: 0,
      phLevel: 0,
      lastFedDate: ""
    });
  }

  // 9. Hall 9: 5 pools, diameter 10m - pre-breeders (پیش مولدین)
  for (let i = 1; i <= 5; i++) {
    pools.push({
      id: `h9p${i}`,
      name: `استخر ${i}`,
      hallId: 9,
      diameter: 10,
      dimensionsDesc: "قطر ۱۰ متر",
      purpose: "پیش مولدین",
      breed: SturgeonBreed.BELUGA,
      count: 0,
      avgWeightGrams: 0,
      totalBiomassKg: 0,
      temperature: 0,
      oxygenLevel: 0,
      phLevel: 0,
      lastFedDate: ""
    });
  }

  // 10. Hall 10: 6 pools d10m (fattening) + 1 pool d4m (quarantine) + 1 linear 6*1.5m partitioned to 8
  for (let i = 1; i <= 6; i++) {
    pools.push({
      id: `h10p${i}`,
      name: `استخر پرواری ${i}`,
      hallId: 10,
      diameter: 10,
      dimensionsDesc: "قطر ۱۰ متر",
      purpose: "پرواری (رشد نهایی گوشتی)",
      breed: SturgeonBreed.BELUGA,
      count: 0,
      avgWeightGrams: 0,
      totalBiomassKg: 0,
      temperature: 0,
      oxygenLevel: 0,
      phLevel: 0,
      lastFedDate: ""
    });
  }
  // Quarantine
  pools.push({
    id: `h10q1`,
    name: "استخر قرنطینه",
    hallId: 10,
    diameter: 4,
    dimensionsDesc: "قطر ۴ متر",
    purpose: "قرنطینه و درمان",
    breed: SturgeonBreed.BELUGA,
    count: 0,
    avgWeightGrams: 0,
    totalBiomassKg: 0,
    temperature: 0,
    oxygenLevel: 0,
    phLevel: 0,
    lastFedDate: ""
  });
  // Compartment pool 6*1.5m divisible to 8 equal parts height 1.10m
  for (let c = 1; c <= 8; c++) {
    pools.push({
      id: `h10c${c}`,
      name: `استخر خطی - بخش ${c}`,
      hallId: 10,
      dimensionsDesc: `بخش ${c}/8 از استخر ۶×۱.۵ متر (ارتفاع ۱.۱۰)`,
      purpose: "جداسازی خطی و سایزبندی",
      breed: SturgeonBreed.BELUGA,
      count: 0,
      avgWeightGrams: 0,
      totalBiomassKg: 0,
      temperature: 0,
      oxygenLevel: 0,
      phLevel: 0,
      isCustomCompartment: true,
      compartmentIndex: c,
      lastFedDate: ""
    });
  }

  // 11. Hall 11: 6 pools d10m (fattening) + 1 pool d4m (quarantine) + 1 linear 6*2.5m partitioned to 8
  for (let i = 1; i <= 6; i++) {
    pools.push({
      id: `h11p${i}`,
      name: `استخر پرواری ${i}`,
      hallId: 11,
      diameter: 10,
      dimensionsDesc: "قطر ۱۰ متر",
      purpose: "پرواری (رشد نهایی گوشتی)",
      breed: SturgeonBreed.BELUGA,
      count: 0,
      avgWeightGrams: 0,
      totalBiomassKg: 0,
      temperature: 0,
      oxygenLevel: 0,
      phLevel: 0,
      lastFedDate: ""
    });
  }
  // Quarantine
  pools.push({
    id: `h11q1`,
    name: "استخر قرنطینه",
    hallId: 11,
    diameter: 4,
    dimensionsDesc: "قطر ۴ متر",
    purpose: "قرنطینه و درمان",
    breed: SturgeonBreed.BELUGA,
    count: 0,
    avgWeightGrams: 0,
    totalBiomassKg: 0,
    temperature: 0,
    oxygenLevel: 0,
    phLevel: 0,
    lastFedDate: ""
  });
  // Compartment pool 6*2.5m divisible to 8 equal parts height 1.10m
  for (let c = 1; c <= 8; c++) {
    pools.push({
      id: `h11c${c}`,
      name: `استخر خطی - بخش ${c}`,
      hallId: 11,
      dimensionsDesc: `بخش ${c}/8 از استخر ۶×۲.۵ متر (ارتفاع ۱.۱۰)`,
      purpose: "جداسازی خطی و سایزبندی",
      breed: SturgeonBreed.BELUGA,
      count: 0,
      avgWeightGrams: 0,
      totalBiomassKg: 0,
      temperature: 0,
      oxygenLevel: 0,
      phLevel: 0,
      isCustomCompartment: true,
      compartmentIndex: c,
      lastFedDate: ""
    });
  }

  // 12. Hall 12: Sales and Landing (سالن بارنداز و فروش) - 4 pools diameter 2.5m, height 1.5m
  for (let i = 1; i <= 4; i++) {
    pools.push({
      id: `h12p${i}`,
      name: `استخر فروش ${i}`,
      hallId: 12,
      diameter: 2.5,
      dimensionsDesc: "قطر ۲.۵ متر (ارتفاع ۱.۵۰)",
      purpose: "بارنداز و آماده‌سازی فروش",
      breed: SturgeonBreed.BELUGA,
      count: 0,
      avgWeightGrams: 0,
      totalBiomassKg: 0,
      temperature: 0,
      oxygenLevel: 0,
      phLevel: 0,
      lastFedDate: ""
    });
  }

  return pools;
};

export const INITIAL_POOLS = generateInitialPools();

export const INITIAL_HALLS: Hall[] = [
  { id: 1, name: "سالن ۱ (نرسری)", description: "شامل ۵۲ ونیرو (استخر قطر ۲ متر) جهت نگهداری لارو و بچه ماهی خاویاری", poolIds: INITIAL_POOLS.filter(p => p.hallId === 1).map(p => p.id) },
  { id: 2, name: "سالن ۲ (پیش پروار)", description: "شامل ۱۴ استخر قطر ۴ متر جهت رشد اولیه تا متوسط ماهیان خاویاری", poolIds: INITIAL_POOLS.filter(p => p.hallId === 2).map(p => p.id) },
  { id: 3, name: "سالن ۳ (پیش پروار)", description: "شامل ۱۴ استخر قطر ۴ متر مکمل سالن ۲ جهت سازماندهی بهینه", poolIds: INITIAL_POOLS.filter(p => p.hallId === 3).map(p => p.id) },
  { id: 4, name: "سالن ۴ (پیش پروار ۶ متری)", description: "شامل ۷ استخر قطر ۶ متر پیش‌پرونده با تراکم و حجم بالاتر آب", poolIds: INITIAL_POOLS.filter(p => p.hallId === 4).map(p => p.id) },
  { id: 5, name: "سالن ۵ (پیش پروار ۶ متری)", description: "شامل ۷ استخر قطر ۶ متر پیش‌پرونده مکمل سالن ۴", poolIds: INITIAL_POOLS.filter(p => p.hallId === 5).map(p => p.id) },
  { id: 6, name: "سالن ۶ (استخر نرسری - در حال احداث)", description: "سالن جدید در دست احداث جهت توسعه بخش نرسری و لارو ریزی کادرهای اختصاصی", isUnderConstruction: true, poolIds: [] },
  { id: 7, name: "سالن ۷ (تکثیر و مولدین)", description: "سالن تکثیر شامل ۲ استخر اصلی به ابعاد ۱۷۶ و ۲۰۶ متر مربع و کادرهای فرعی تکثیر بعدا تکمیل می‌شود", poolIds: INITIAL_POOLS.filter(p => p.hallId === 7).map(p => p.id) },
  { id: 8, name: "سالن ۸ (پیش مولدین)", description: "شامل ۵ استخر قطر ۱۰ متر جهت نگهداری پیش‌مولدها و کنترل روند بلوغ خاویار", poolIds: INITIAL_POOLS.filter(p => p.hallId === 8).map(p => p.id) },
  { id: 9, name: "سالن ۹ (پیش مولدین)", description: "شامل ۵ استخر قطر ۱۰ متر مکمل پیش‌مولدین ویژه تاس‌ماهی ایرانی قره‌برون و چالباش", poolIds: INITIAL_POOLS.filter(p => p.hallId === 9).map(p => p.id) },
  { id: 10, name: "سالن ۱۰ (پرواری نهایی)", description: "شامل ۶ استخر قطر ۱۰ متر پرواری، ۱ استخر قطر ۴ متر قرنطینه و ۱ استخر خطی چندبخشی قابل تقسیم", poolIds: INITIAL_POOLS.filter(p => p.hallId === 10).map(p => p.id) },
  { id: 11, name: "سالن ۱۱ (پرواری نهایی)", description: "شامل ۶ استخر قطر ۱۰ متر پرواری، ۱ استخر قطر ۴ متر قرنطینه و ۱ استخر خطی مدرن ۲.۵ متری تقسیم‌پذیر هشتگانه", poolIds: INITIAL_POOLS.filter(p => p.hallId === 11).map(p => p.id) },
  { id: 12, name: "سالن ۱۲ (بارنداز و فروش)", description: "۴ استخر قطر ۲.۵ متر جهت انتقال نهایی، آماده‌سازی، فروش و تخلیه زنده ماهیان خاویاری بزرگ", poolIds: INITIAL_POOLS.filter(p => p.hallId === 12).map(p => p.id) }
];

export const INITIAL_MOVEMENTS: MovementLog[] = [];
export const INITIAL_FEEDINGS: FeedingMeal[] = [];
export const INITIAL_MORTALITY: MortalityLog[] = [];
