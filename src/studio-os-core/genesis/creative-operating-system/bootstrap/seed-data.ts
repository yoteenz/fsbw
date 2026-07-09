import { XCOS_SUBSYSTEM_VERSION } from '../constants';
import type { XcosStore } from '../types';

export function buildCreativeOperatingSystemSeedStore(): Partial<XcosStore> {
  return {
    version: XCOS_SUBSYSTEM_VERSION,
    orgState: 'listening',
    boardMeetings: [],
    memoryRecords: [],
    evolutionProposals: [],
    economyAssets: [],
    governanceRecords: [],
    constitutionLocked: true,
    seededAt: new Date().toISOString(),
  };
}
