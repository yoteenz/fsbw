import { studioServiceNotConnected, type StudioServiceStub, type StudioServiceResult } from '../types';
import { readExecutiveApprenticeshipStore } from '../../../studio-os-core/executive-apprenticeship-founder-calibration/store';

export type ExecutiveApprenticeshipSnapshot = ReturnType<typeof readExecutiveApprenticeshipStore>;

export const EXECUTIVE_APPRENTICESHIP_CHAIN = [
  'OBSERVE',
  'CALIBRATE',
  'SHADOW',
  'PRACTICE',
  'TRUST',
  'SOFT APPROVAL',
  'GRADUATE',
  'STEWARDSHIP',
] as const;

export const executiveApprenticeshipStudioService: StudioServiceStub & {
  getSnapshot(): Promise<StudioServiceResult<ExecutiveApprenticeshipSnapshot>>;
} = {
  id: 'executive-apprenticeship-founder-calibration',
  label: 'EXECUTIVE APPRENTICESHIP & FOUNDER CALIBRATION',
  phase: 2,
  enabled: false,
  description: 'EXECUTIVE APPRENTICESHIP · FOUNDER CALIBRATION · TRUST EARNED · V1.0',
  async getSnapshot() {
    if (typeof window === 'undefined') {
      return studioServiceNotConnected('Executive Apprenticeship requires browser context.');
    }
    return { ok: true, data: readExecutiveApprenticeshipStore() };
  },
};
