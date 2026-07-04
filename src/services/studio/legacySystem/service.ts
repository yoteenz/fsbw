import { studioServiceNotConnected, type StudioServiceStub, type StudioServiceResult } from '../types';
import {
  LEGACY_CONTRIBUTION_CHAIN,
  LEGACY_VAULT_OF_FIRSTS,
  LEGACY_HALL_OF_FAME,
} from '../../../utils/adminStudioLegacySystemDemo';
import { exportLegacySystemSnapshot } from '../../../hooks/useAdminStudioLegacySystemState';

export type LegacySystemSnapshot = ReturnType<typeof exportLegacySystemSnapshot>;

export type LegacyMuseumSummary = {
  archiveCount: number;
  hallOfFameCount: number;
  vaultFirstsCount: number;
  contributionChain: readonly string[];
};

export const legacySystemStudioService: StudioServiceStub & {
  getSnapshot(): Promise<StudioServiceResult<LegacySystemSnapshot>>;
  getMuseumSummary(): Promise<StudioServiceResult<LegacyMuseumSummary>>;
} = {
  id: 'legacy-system',
  label: 'THE LEGACY SYSTEM',
  phase: 2,
  enabled: false,
  description:
    'PERMANENT MEMORY & LIVING MUSEUM — AUTO-ARCHIVES FROM ALL STUDIO MILESTONES · CONNECTORS NOT CONNECTED',
  async getSnapshot() {
    if (typeof window === 'undefined') {
      return studioServiceNotConnected('Legacy System requires browser context.');
    }
    return { ok: true, data: exportLegacySystemSnapshot() };
  },
  async getMuseumSummary() {
    if (typeof window === 'undefined') {
      return studioServiceNotConnected('Museum summary requires browser context.');
    }
    return {
      ok: true,
      data: {
        archiveCount: 2847,
        hallOfFameCount: LEGACY_HALL_OF_FAME.length,
        vaultFirstsCount: LEGACY_VAULT_OF_FIRSTS.length,
        contributionChain: LEGACY_CONTRIBUTION_CHAIN,
      },
    };
  },
};

export { LEGACY_CONTRIBUTION_CHAIN };
