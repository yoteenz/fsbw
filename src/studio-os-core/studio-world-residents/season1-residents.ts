import type { ResidentCanonicalIdentity, ResidentId } from './types';
import { SEASON1_ENSEMBLE_RESIDENTS, ensembleRecordToIdentity } from './season1-ensemble';

export const SEASON1_RESIDENT_IDS = [
  'SW-RESIDENT-001',
  'SW-RESIDENT-002',
  'SW-RESIDENT-003',
  'SW-RESIDENT-004',
  'SW-RESIDENT-005',
  'SW-RESIDENT-006',
  'SW-RESIDENT-007',
  'SW-RESIDENT-008',
] as const satisfies readonly ResidentId[];

/** Identity registry — derived from founder-approved season1-ensemble canon. */
export const SEASON1_RESIDENTS: ResidentCanonicalIdentity[] = SEASON1_ENSEMBLE_RESIDENTS.map(
  ensembleRecordToIdentity
);

export function getEttaVale(): ResidentCanonicalIdentity {
  const etta = SEASON1_RESIDENTS.find((r) => r.residentId === 'SW-RESIDENT-001');
  if (!etta) throw new Error('Etta Vale missing from season 1 registry');
  return etta;
}
