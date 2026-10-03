import { describe, expect, it } from 'vitest';
import { SEASON1_ENSEMBLE_RESIDENTS } from './season1-ensemble';
import { listSeason1Residents } from './registry';
import {
  SEASON1_INGESTED_VISUAL_ASSETS,
  SEASON1_VISUAL_AUTHORITY_RECORDS,
  getPrimaryNaturalHabitatAuthority,
  getVisualAuthorityBundle,
  validateSeason1VisualAuthority,
} from './visual-authority';
import { SEASON1_WORK_UNIFORM_SYSTEM } from './season1-ensemble/uniform-system';

describe('Season 1 Resident Visual Authority', () => {
  it('passes visual authority validation', () => {
    expect(validateSeason1VisualAuthority()).toEqual([]);
  });

  it('all 8 residents have visual authority bundles', () => {
    for (const r of SEASON1_ENSEMBLE_RESIDENTS) {
      const bundle = getVisualAuthorityBundle(r.id);
      expect(bundle?.visualAuthorityRefs.length).toBeGreaterThan(0);
    }
    expect(SEASON1_VISUAL_AUTHORITY_RECORDS.length).toBeGreaterThan(0);
  });

  it('identity registry links visual refs without conflicting canon names', () => {
    const zuri = listSeason1Residents().find((x) => x.residentId === 'SW-RESIDENT-002');
    expect(zuri?.displayName).toBe('Zuri Xu');
    expect(zuri?.visualAuthorityRefs?.length).toBeGreaterThan(0);
    const zuriPrimary = getPrimaryNaturalHabitatAuthority('SW-RESIDENT-002');
    expect(JSON.stringify(zuriPrimary).toLowerCase()).not.toContain('hale');
  });

  it('Iona glamour is alternate mode only', () => {
    const ionaPrimary = getPrimaryNaturalHabitatAuthority('SW-RESIDENT-006');
    const glam = SEASON1_VISUAL_AUTHORITY_RECORDS.find(
      (a) => a.residentId === 'SW-RESIDENT-006' && a.authorityType === 'GLAMOUR_OR_ALTERNATE_MODE'
    );
    expect(ionaPrimary?.authorityType).toBe('NATURAL_HABITAT_FULL_BODY');
    expect(glam?.isPrimaryIdentityAuthority).toBe(false);
    expect(ionaPrimary?.id).not.toBe(glam?.id);
  });

  it('Marlowe body protection on natural authority', () => {
    const marlowe = getPrimaryNaturalHabitatAuthority('SW-RESIDENT-007');
    expect(marlowe?.bodyAuthority?.toLowerCase()).toContain('larger');
  });

  it('ingested assets resolve on disk for all manifest rows', () => {
    expect(SEASON1_INGESTED_VISUAL_ASSETS).toHaveLength(27);
  });

  it('primary natural authorities link public asset paths', () => {
    for (const id of [
      'SW-RESIDENT-001',
      'SW-RESIDENT-002',
      'SW-RESIDENT-003',
      'SW-RESIDENT-004',
      'SW-RESIDENT-005',
      'SW-RESIDENT-006',
      'SW-RESIDENT-007',
      'SW-RESIDENT-008',
    ] as const) {
      const natural = getPrimaryNaturalHabitatAuthority(id);
      expect(natural?.assetUrl).toMatch(/^\/studio-world\/residents\/season-1\//);
    }
  });

  it('Noa retains three close-up identity references', () => {
    const closeups = SEASON1_VISUAL_AUTHORITY_RECORDS.filter(
      (r) => r.residentId === 'SW-RESIDENT-004' && r.authorityType === 'IDENTITY_CLOSEUP'
    );
    expect(closeups).toHaveLength(3);
  });

  it('work uniform remains concept locked visual pending', () => {
    expect(SEASON1_WORK_UNIFORM_SYSTEM.status).toBe('CONCEPT_LOCKED_VISUAL_PENDING');
    const uniforms = SEASON1_VISUAL_AUTHORITY_RECORDS.filter(
      (r) => r.authorityType === 'WORK_UNIFORM_REFERENCE'
    );
    expect(uniforms).toHaveLength(8);
    expect(uniforms.every((u) => u.status === 'CONCEPT_LOCKED_VISUAL_PENDING')).toBe(true);
  });

  it('signed portrait authorities exist separately from natural habitat', () => {
    for (const r of SEASON1_ENSEMBLE_RESIDENTS) {
      const bundle = getVisualAuthorityBundle(r.id)!;
      const types = bundle.visualAuthorityRefs.map(
        (id) => SEASON1_VISUAL_AUTHORITY_RECORDS.find((x) => x.id === id)?.authorityType
      );
      expect(types).toContain('SIGNED_WALL_PORTRAIT');
      expect(types).toContain('NATURAL_HABITAT_FULL_BODY');
      expect(types).toContain('ROLE_COMPETENCY_FULL_BODY');
    }
  });
});
