import { readLiveValidationSystemStore } from '../persistence';
import type { LvsValueReading } from '../types';

/** Value Engine™ — time saved, task completion lift, mission advancement */
export function listValueReadings(systemId?: string): LvsValueReading[] {
  const readings = readLiveValidationSystemStore().valueReadings;
  const filtered = systemId ? readings.filter((r) => r.systemId === systemId) : readings;
  return [...filtered].sort(
    (a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime()
  );
}

export function getLatestValueReading(systemId: string): LvsValueReading | undefined {
  return listValueReadings(systemId)[0];
}

export function computeValueReading(systemId: string, founderScore: number): LvsValueReading {
  const timeSavedMinutes = Math.round((founderScore / 100) * 60);
  const taskCompletionLift = Math.min(100, founderScore + 5);
  const missionAdvancementRate = Math.min(100, founderScore);
  const valueScore = Math.round(
    (timeSavedMinutes / 60) * 30 + taskCompletionLift * 0.4 + missionAdvancementRate * 0.3
  );

  return {
    readingId: `value-${systemId}-${Date.now()}`,
    systemId,
    timeSavedMinutes,
    taskCompletionLift,
    missionAdvancementRate,
    valueScore: Math.min(100, valueScore),
    recordedAt: new Date().toISOString(),
  };
}
