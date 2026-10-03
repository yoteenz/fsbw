import { describe, expect, it } from 'vitest';
import { STUDIO_DEBUG_PATHS } from '../../routes/StudioDebugRoutes';
import { isValidAccessGrantKind } from './access';
import {
  applyCastOverlayForSimulation,
  assertCastContractDoesNotMutateCanon,
  cloneCanonicalIdentity,
} from './casting';
import { isValidCanonLifecycleStatus } from './canon-versioning';
import { isValidFabricationStatus } from './fabrication';
import {
  assertSeason1RegistryInvariants,
  getEttaVale,
  getSeason1ResidentRegistry,
  listSeason1Residents,
} from './registry';
import { validateRelationshipPairs } from './relationship-graph';
import { SEASON1_RESIDENT_IDS } from './season1-residents';
import { storyAdvancesAllFourLayers } from './social-story';
import type { ResidentCastRoleContract } from './types';

describe('Studio World Resident System — Season 1', () => {
  it('has exactly 8 season 1 residents', () => {
    expect(listSeason1Residents()).toHaveLength(8);
    expect(SEASON1_RESIDENT_IDS).toHaveLength(8);
  });

  it('Etta is SW-RESIDENT-001', () => {
    expect(getEttaVale().residentId).toBe('SW-RESIDENT-001');
    expect(getEttaVale().displayName).toBe('Etta Vale');
    expect(getEttaVale().identityStatus).toBe('canonical');
  });

  it('resident IDs and names are unique', () => {
    const registry = getSeason1ResidentRegistry();
    const ids = registry.residents.map((r) => r.residentId);
    const names = registry.residents.map((r) => r.displayName);
    expect(new Set(ids).size).toBe(8);
    expect(new Set(names).size).toBe(8);
    expect(assertSeason1RegistryInvariants()).toEqual([]);
  });

  it('fabrication status enum validates', () => {
    expect(isValidFabricationStatus('CANON_APPROVED')).toBe(true);
    expect(isValidFabricationStatus('WORLD_READY')).toBe(true);
    expect(isValidFabricationStatus('FAKE_STATUS')).toBe(false);
  });

  it('canon versioning enum validates', () => {
    expect(isValidCanonLifecycleStatus('approved')).toBe(true);
    expect(isValidCanonLifecycleStatus('invalid')).toBe(false);
  });

  it('access / unlock model validates grant kinds', () => {
    expect(isValidAccessGrantKind('BOOKING_ONLY')).toBe(true);
    expect(isValidAccessGrantKind('SUBSCRIPTION_TIER_GOLD')).toBe(false);
    expect(getSeason1ResidentRegistry().accessGrants).toHaveLength(0);
  });

  it('documentary profile exists per resident', () => {
    const registry = getSeason1ResidentRegistry();
    for (const id of SEASON1_RESIDENT_IDS) {
      expect(registry.documentaryProfiles.some((p) => p.residentId === id)).toBe(true);
    }
  });

  it('fabrication checklist exists per resident', () => {
    const registry = getSeason1ResidentRegistry();
    for (const id of SEASON1_RESIDENT_IDS) {
      const req = registry.fabricationRequirements.find((f) => f.residentId === id);
      expect(req?.referenceAngles).toHaveLength(11);
      expect(req?.sheets.CANON_CHARACTER_SHEET).toBe('approved');
    }
  });

  it('relationship graph supports asymmetry and valid pairs', () => {
    const registry = getSeason1ResidentRegistry();
    const errors = validateRelationshipPairs(registry.relationships);
    expect(errors).toEqual([]);
    const asymmetric = registry.relationships.filter((e) => !e.mutual);
    expect(asymmetric.length).toBeGreaterThan(0);
  });

  it('cast role contract cannot mutate canonical identity', () => {
    const ettaBefore = cloneCanonicalIdentity(getEttaVale());
    const contract: ResidentCastRoleContract = {
      id: 'cast-test-001',
      residentId: 'SW-RESIDENT-001',
      roleName: 'Luxury Concierge',
      roleType: 'LUXURY_CONCIERGE',
      toneAdjustment: 'Warmer, more hospitality-forward',
      temporaryBackstory: 'Covering for a client event — not canon biography',
      authorizedKnowledge: ['Client schedule'],
      authorizedBehaviors: ['Greet guests'],
      restrictedBehaviors: ['Discuss Studio World internals'],
      approvalStatus: 'draft',
      roleHistory: [],
      assetLinks: [],
      version: 'v0.1.0',
    };

    contract.toneAdjustment = 'Changed after snapshot';
    contract.temporaryBackstory = 'Mutated backstory';

    const overlay = applyCastOverlayForSimulation(ettaBefore, contract);
    expect(overlay._castOverlay.toneAdjustment).toContain('Changed');
    expect(ettaBefore.personality.traits).toEqual(getEttaVale().personality.traits);
    expect(assertCastContractDoesNotMutateCanon(ettaBefore, getEttaVale())).toBe(true);
  });

  it('social story model supports four parallel layers (schema only)', () => {
    const story = getSeason1ResidentRegistry().socialStoryOutlines[0];
    expect(story.status).toBe('schema_only');
    expect(storyAdvancesAllFourLayers(story)).toBe(true);
  });

  it('Etta fabrication status is honest — canon approved, UE not started', () => {
    const etta = getEttaVale();
    expect(etta.fabricationStatus).toBe('CANON_APPROVED');
    expect(etta.fabricationStatus).not.toBe('WORLD_READY');
    expect(etta.fabricationStatus).not.toBe('UE_RECONSTRUCTION_APPROVED');
    expect(etta.embodimentTargets[0]?.status).toBe('NOT_STARTED');
    expect(etta.embodimentTargets[0]?.referenceLinks?.length).toBeGreaterThan(0);
    expect(etta.embodimentTargets[0]?.referenceLinks?.[0]?.pathOrUrl).toContain(
      '/studio-world/residents/season-1/'
    );
  });

  it('internal QA route is debug-only, not public storefront', () => {
    const debugPath = '/__studio-world/residents';
    expect((STUDIO_DEBUG_PATHS as readonly string[]).includes(debugPath)).toBe(true);
    expect(debugPath.startsWith('/__studio-world/')).toBe(true);
  });
});
