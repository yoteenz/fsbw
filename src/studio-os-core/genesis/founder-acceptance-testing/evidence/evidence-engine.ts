import type { FatEvidenceItem } from '../types';
import type { FatValidationLevel } from '../constants';
import { getValidationRecord, listValidationRegistry } from '../validation/registry';

/** Evidence Engine™ — collects and surfaces validation evidence packets */
export function listEvidenceForSystem(systemId: string): FatEvidenceItem[] {
  const record = getValidationRecord(systemId);
  return record?.evidence ?? [];
}

export function listAllEvidence(): FatEvidenceItem[] {
  return listValidationRegistry().flatMap((r) => r.evidence);
}

export function countEvidenceByLevel(level: FatValidationLevel): number {
  return listAllEvidence().filter((e) => e.level === level).length;
}

export function buildEvidenceSummary(systemId: string): {
  total: number;
  byLevel: Record<FatValidationLevel, number>;
  latestAt?: string;
} {
  const evidence = listEvidenceForSystem(systemId);
  const byLevel = {
    architectural: 0,
    implementation: 0,
    'founder-acceptance': 0,
    company: 0,
    market: 0,
  } satisfies Record<FatValidationLevel, number>;

  for (const item of evidence) {
    byLevel[item.level] += 1;
  }

  const sorted = [...evidence].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return {
    total: evidence.length,
    byLevel,
    latestAt: sorted[0]?.createdAt,
  };
}

export function hasMinimumFounderEvidence(systemId: string): boolean {
  const evidence = listEvidenceForSystem(systemId);
  const founderEvidence = evidence.filter((e) => e.level === 'founder-acceptance');
  return founderEvidence.length >= 2;
}
