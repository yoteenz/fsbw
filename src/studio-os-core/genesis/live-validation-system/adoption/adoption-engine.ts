import { readLiveValidationSystemStore } from '../persistence';
import type { LvsAdoptionReading } from '../types';

/** Adoption Engine™ — voluntary usage, habit, return rate */
export function listAdoptionReadings(systemId?: string): LvsAdoptionReading[] {
  const readings = readLiveValidationSystemStore().adoptionReadings;
  const filtered = systemId ? readings.filter((r) => r.systemId === systemId) : readings;
  return [...filtered].sort(
    (a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime()
  );
}

export function getLatestAdoptionReading(systemId: string): LvsAdoptionReading | undefined {
  return listAdoptionReadings(systemId)[0];
}

export function computeAdoptionReading(
  systemId: string,
  founderScore: number
): LvsAdoptionReading {
  const habitBase = Math.min(100, founderScore + 8);
  return {
    readingId: `adoption-${systemId}-${Date.now()}`,
    systemId,
    dailyActiveRate: Math.min(100, habitBase - 5),
    weeklyReturnRate: Math.min(100, habitBase),
    habitScore: habitBase,
    voluntaryUsageRate: Math.min(100, habitBase - 3),
    recordedAt: new Date().toISOString(),
  };
}

export function buildAdoptionSummary(): {
  systemId: string;
  officialName: string;
  habitScore: number;
  valueScore: number;
}[] {
  const store = readLiveValidationSystemStore();
  const systemIds = new Set([
    ...store.adoptionReadings.map((r) => r.systemId),
    ...store.valueReadings.map((r) => r.systemId),
  ]);

  return [...systemIds].map((systemId) => {
    const adoption = getLatestAdoptionReading(systemId);
    const value = store.valueReadings.find((r) => r.systemId === systemId);
    const health = store.systemHealth.find((h) => h.systemId === systemId);
    return {
      systemId,
      officialName: health?.officialName ?? systemId,
      habitScore: adoption?.habitScore ?? 0,
      valueScore: value?.valueScore ?? 0,
    };
  });
}
