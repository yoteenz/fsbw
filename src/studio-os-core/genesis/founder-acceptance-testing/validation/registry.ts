import { readFounderAcceptanceTestingStore } from '../persistence';
import type { FatValidationRecord } from '../types';

/** Validation Registry™ — canonical directory of Launch Stack validation records */
export function listValidationRegistry(): FatValidationRecord[] {
  return [...readFounderAcceptanceTestingStore().records].sort(
    (a, b) => a.officialName.localeCompare(b.officialName)
  );
}

export function getValidationRecord(systemId: string): FatValidationRecord | undefined {
  return readFounderAcceptanceTestingStore().records.find((r) => r.systemId === systemId);
}

export function searchValidationRegistry(query: string): FatValidationRecord[] {
  const q = query.trim().toLowerCase();
  if (!q) return listValidationRegistry();
  return listValidationRegistry().filter(
    (r) =>
      r.systemId.includes(q) ||
      r.officialName.toLowerCase().includes(q) ||
      r.purpose.toLowerCase().includes(q)
  );
}

export function listLaunchStackValidationRecords(): FatValidationRecord[] {
  return listValidationRegistry().filter((r) => r.launchStackMilestone);
}

export function countValidationByPipelineStage(): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const record of listValidationRegistry()) {
    counts[record.pipelineStage] = (counts[record.pipelineStage] ?? 0) + 1;
  }
  return counts;
}
