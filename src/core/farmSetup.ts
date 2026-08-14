import { Hall, Pool, PoolPurpose, SturgeonBreed } from "../types";

export const FARM_SETUP_COMPLETION_KEY = "sturgeon_farm_setup_completed_v2";

const nowIso = () => new Date().toISOString();

export function createSetupHall(existingHalls: Hall[]): Hall {
  const id = existingHalls.length ? Math.max(...existingHalls.map(hall => hall.id)) + 1 : 1;
  return {
    id,
    name: `سالن ${id}`,
    description: "",
    isUnderConstruction: false,
    poolIds: [],
    createdAtGregorian: nowIso()
  };
}

export function nextPoolId(hallId: number, pools: Pool[]): string {
  let index = 1;
  while (pools.some(pool => pool.id === `h${hallId}p${index}`)) index += 1;
  return `h${hallId}p${index}`;
}

export function createSetupPool(hallId: number, pools: Pool[]): Pool {
  const id = nextPoolId(hallId, pools);
  const poolNumber = pools.filter(pool => pool.hallId === hallId).length + 1;
  return {
    id,
    name: `استخر ${poolNumber}`,
    hallId,
    shape: "circular",
    diameter: 4,
    height: 1.2,
    dimensionsDesc: "قطر ۴ متر × ارتفاع ۱.۲ متر",
    purpose: PoolPurpose.PRE_GROWOUT,
    breed: SturgeonBreed.BELUGA,
    count: 0,
    avgWeightGrams: 0,
    totalBiomassKg: 0,
    temperature: 18,
    oxygenLevel: 7,
    phLevel: 7.5,
    fishBatches: [],
    createdAtGregorian: nowIso()
  };
}

export function linkPoolsToHalls(halls: Hall[], pools: Pool[]): Hall[] {
  return halls.map(hall => ({
    ...hall,
    poolIds: pools.filter(pool => pool.hallId === hall.id).map(pool => pool.id)
  }));
}

export function validateFarmStructure(halls: Hall[], pools: Pool[]): string[] {
  const errors: string[] = [];
  if (!halls.length) errors.push("حداقل یک سالن باید تعریف شود.");
  if (!pools.length) errors.push("حداقل یک استخر باید تعریف شود.");

  const hallIds = new Set<number>();
  halls.forEach((hall, index) => {
    if (!Number.isInteger(hall.id) || hall.id <= 0) errors.push(`سالن ${index + 1}: شناسه سالن باید عدد صحیح مثبت باشد.`);
    if (hallIds.has(hall.id)) errors.push(`شناسه سالن تکراری است: ${hall.id}`);
    hallIds.add(hall.id);
    if (!hall.name.trim()) errors.push(`سالن ${hall.id}: نام سالن وارد نشده است.`);
  });

  const poolIds = new Set<string>();
  pools.forEach((pool, index) => {
    const label = pool.name.trim() || `ردیف ${index + 1}`;
    if (!pool.id.trim()) errors.push(`${label}: کد استخر وارد نشده است.`);
    if (poolIds.has(pool.id)) errors.push(`کد استخر تکراری است: ${pool.id}`);
    poolIds.add(pool.id);
    if (!hallIds.has(pool.hallId)) errors.push(`${label}: سالن مرتبط معتبر نیست.`);
    if (!pool.name.trim()) errors.push(`استخر ${pool.id}: نام استخر وارد نشده است.`);
    if (!pool.purpose.trim()) errors.push(`${label}: کاربری استخر وارد نشده است.`);
    if (!pool.dimensionsDesc.trim()) errors.push(`${label}: مشخصات ابعاد وارد نشده است.`);

    const positiveOptionalFields: Array<[number | undefined, string]> = [
      [pool.diameter, "قطر"],
      [pool.length, "طول"],
      [pool.width, "عرض"],
      [pool.height, "ارتفاع"],
      [pool.volumeCubicMeters, "حجم آب"],
      [pool.maxBiomassKg, "ظرفیت زیست‌توده"]
    ];
    positiveOptionalFields.forEach(([value, field]) => {
      if (value !== undefined && (!Number.isFinite(value) || value <= 0)) errors.push(`${label}: ${field} باید بیشتر از صفر باشد.`);
    });

    if (!Number.isFinite(pool.temperature) || pool.temperature < 0 || pool.temperature > 40) errors.push(`${label}: دما باید بین صفر تا ۴۰ درجه باشد.`);
    if (!Number.isFinite(pool.oxygenLevel) || pool.oxygenLevel < 0 || pool.oxygenLevel > 30) errors.push(`${label}: اکسیژن باید بین صفر تا ۳۰ میلی‌گرم در لیتر باشد.`);
    if (!Number.isFinite(pool.phLevel) || pool.phLevel < 0 || pool.phLevel > 14) errors.push(`${label}: pH باید بین صفر تا ۱۴ باشد.`);
  });

  return [...new Set(errors)];
}
