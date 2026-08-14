import { FishBatch, Pool, SturgeonBreed } from "../types";

export const normalizeChip = (value: string) => value.trim().toUpperCase();

export function validateBatches(batches: FishBatch[], allPools: Pool[], currentPoolId: string): string[] {
  const errors: string[] = [];
  const chips = new Set<string>();
  const usedElsewhere = new Set(
    allPools
      .filter(pool => pool.id !== currentPoolId)
      .flatMap(pool => pool.fishBatches || [])
      .flatMap(batch => batch.chipIds || [])
      .map(normalizeChip)
  );

  batches.forEach((batch, index) => {
    if (!Object.values(SturgeonBreed).includes(batch.breed)) errors.push(`ردیف ${index + 1}: نژاد نامعتبر است.`);
    if (!Number.isInteger(batch.count) || batch.count < 0) errors.push(`ردیف ${index + 1}: تعداد باید عدد صحیح و غیرمنفی باشد.`);
    if (!Number.isFinite(batch.avgWeightGrams) || batch.avgWeightGrams < 0) errors.push(`ردیف ${index + 1}: وزن متوسط نامعتبر است.`);
    const rowChips = (batch.chipIds || []).map(normalizeChip).filter(Boolean);
    if (rowChips.length > batch.count) errors.push(`ردیف ${index + 1}: تعداد چیپ‌ها بیشتر از تعداد ماهی است.`);
    rowChips.forEach(chip => {
      if (chips.has(chip)) errors.push(`شماره چیپ تکراری است: ${chip}`);
      if (usedElsewhere.has(chip)) errors.push(`شماره چیپ قبلاً در استخر دیگری ثبت شده است: ${chip}`);
      chips.add(chip);
    });
  });
  return errors;
}

export function summarizeBatches(batches: FishBatch[]) {
  const active = batches.filter(batch => batch.count > 0);
  const count = active.reduce((sum, batch) => sum + batch.count, 0);
  const biomass = active.reduce((sum, batch) => sum + (batch.count * batch.avgWeightGrams) / 1000, 0);
  const avgWeightGrams = count ? Math.round((biomass * 1000) / count) : 0;
  const dominant = [...active].sort((a, b) => b.count - a.count)[0];
  return {
    count,
    avgWeightGrams,
    totalBiomassKg: Number(biomass.toFixed(3)),
    breed: dominant?.breed || SturgeonBreed.BELUGA
  };
}

export function applyBatchesToPool(pool: Pool, batches: FishBatch[]): Pool {
  const normalized = batches
    .filter(batch => batch.count > 0)
    .map(batch => ({
      ...batch,
      chipIds: [...new Set((batch.chipIds || []).map(normalizeChip).filter(Boolean))]
    }));
  return { ...pool, ...summarizeBatches(normalized), fishBatches: normalized, updatedAtGregorian: new Date().toISOString() };
}

export function availableStock(pool: Pool, breed: SturgeonBreed, gender?: FishBatch["gender"]): number {
  if (!pool.fishBatches?.length) return pool.breed === breed ? pool.count : 0;
  return (pool.fishBatches || [])
    .filter(batch => batch.breed === breed && (!gender || batch.gender === gender))
    .reduce((sum, batch) => sum + batch.count, 0);
}
