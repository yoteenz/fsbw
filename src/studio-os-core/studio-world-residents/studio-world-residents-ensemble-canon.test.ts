import { describe, expect, it } from 'vitest';
import {
  SEASON1_ENSEMBLE_RESIDENTS,
  SEASON1_WORK_UNIFORM_SYSTEM,
  validateSeason1EnsembleCanon,
} from './season1-ensemble';
import { getEttaVale, listSeason1Residents } from './registry';
import { SEASON1_RESIDENT_IDS } from './season1-residents';

describe('Season 1 Core Ensemble Canon', () => {
  it('passes ensemble validation rules', () => {
    expect(validateSeason1EnsembleCanon()).toEqual([]);
  });

  it('has 8 ensemble records aligned with identity registry', () => {
    expect(SEASON1_ENSEMBLE_RESIDENTS).toHaveLength(8);
    expect(listSeason1Residents()).toHaveLength(8);
    expect(SEASON1_RESIDENT_IDS).toHaveLength(8);
  });

  it('Zuri Xu rename locked', () => {
    const zuri = SEASON1_ENSEMBLE_RESIDENTS.find((r) => r.id === 'SW-RESIDENT-002');
    expect(zuri?.canonicalName).toBe('Zuri Xu');
    expect(listSeason1Residents().find((r) => r.residentId === 'SW-RESIDENT-002')?.displayName).toBe(
      'Zuri Xu'
    );
  });

  it('work uniform is concept locked visual pending', () => {
    expect(SEASON1_WORK_UNIFORM_SYSTEM.status).toBe('CONCEPT_LOCKED_VISUAL_PENDING');
  });

  it('Etta remains SW-RESIDENT-001', () => {
    expect(getEttaVale().residentId).toBe('SW-RESIDENT-001');
    expect(getEttaVale().canonVersion).toBe('season1-v1');
  });
});
