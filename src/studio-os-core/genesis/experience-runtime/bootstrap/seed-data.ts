import { XER_SUBSYSTEM_VERSION, XER_SHARED_SCENE_ID } from '../constants';
import { buildPlatformDna, buildStateDnaProfiles } from '../runtime-registry/platform-dna';
import type { XerStore } from '../types';

export const XER_SEED_PLATFORM = buildPlatformDna();
export const XER_SEED_STATE_PROFILES = buildStateDnaProfiles();

export function buildExperienceRuntimeSeedStore(): XerStore {
  return {
    version: XER_SUBSYSTEM_VERSION,
    platformDna: XER_SEED_PLATFORM,
    stateDnaProfiles: XER_SEED_STATE_PROFILES,
    selection: {
      brandId: 'studio-os',
      departmentId: 'headquarters',
      sceneId: XER_SHARED_SCENE_ID,
      componentId: 'executive-header',
      motionDnaId: 'motion-studio-os',
    },
    sessionId: '',
    sessionState: {
      'slot-header-note': 'Runtime-assembled HQ demonstration',
      'slot-active-department': 'headquarters',
      'slot-hero-caption': '',
      'slot-capability-focus': '',
      'slot-orb-context': 'idle',
    },
    brandSwitchCount: 0,
    cacheStats: { hits: 0, misses: 0, entries: 0 },
    constitutionLocked: true,
    seededAt: new Date().toISOString(),
  };
}
