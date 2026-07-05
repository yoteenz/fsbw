import { studioServiceNotConnected, type StudioServiceStub, type StudioServiceResult } from '../types';
import { readStrategyEngineStore } from '../../../studio-os-core/strategy-engine/store';

export type StrategyEngineSnapshot = ReturnType<typeof readStrategyEngineStore>;

export const STRATEGY_ENGINE_INHERITANCE_CHAIN = [
  'VISION',
  'MISSION',
  'COMPANY OBJECTIVE',
  'STRATEGY',
  'INITIATIVES',
  'EXECUTION',
  'OUTCOMES',
] as const;

export const strategyEngineStudioService: StudioServiceStub & {
  getSnapshot(): Promise<StudioServiceResult<StrategyEngineSnapshot>>;
} = {
  id: 'strategy-engine',
  label: 'STRATEGY ENGINE',
  phase: 2,
  enabled: false,
  description: 'DEFINES WHY WORK MATTERS — STRATEGY BOARD · INITIATIVES · ALIGNMENT · HEALTH',
  async getSnapshot() {
    if (typeof window === 'undefined') {
      return studioServiceNotConnected('Strategy Engine requires browser context.');
    }
    return { ok: true, data: readStrategyEngineStore() };
  },
};
