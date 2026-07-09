import { XPS_SUBSYSTEM_VERSION } from '../constants';
import type { XpsStore } from '../types';

export function buildStudioProductionSystemSeedStore(): Partial<XpsStore> {
  return {
    version: XPS_SUBSYSTEM_VERSION,
    packageRegistry: [],
    playground: {
      topic: 'Why Studio OS preserves expertise',
      audience: 'Visionary founders building legacy institutions',
      goal: 'Explain the operating civilization promise',
      brandId: 'studio-os',
      companyId: 'studio-os',
      platform: 'youtube',
      desiredEmotion: 'calm + intelligent',
    },
    constitutionLocked: true,
    seededAt: new Date().toISOString(),
  };
}
