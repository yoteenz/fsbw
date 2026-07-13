import type { ManufacturingJobType } from './manufacturing-queue';

export const MODEL_SCOREBOARD_VERSION = 'model-scoreboard.v1';

export type ModelManufacturingStats = {
  providerModel: string;
  taskType: ManufacturingJobType | 'isolation' | 'background-removal';
  successRate: number;
  sampleCount: number;
  backgroundLeakageRate: number;
  lastUpdated: string;
};

export type ModelScoreboard = {
  scoreboardVersion: typeof MODEL_SCOREBOARD_VERSION;
  models: ModelManufacturingStats[];
  routingEvidenceBased: true;
};

const SEED_SCOREBOARD: ModelManufacturingStats[] = [
  { providerModel: 'fal-ai/nano-banana-pro/edit', taskType: 'architecture', successRate: 0.98, sampleCount: 120, backgroundLeakageRate: 0.02, lastUpdated: '2026-07-12' },
  { providerModel: 'fal-ai/nano-banana-pro/edit', taskType: 'hero-asset', successRate: 0.61, sampleCount: 85, backgroundLeakageRate: 0.25, lastUpdated: '2026-07-12' },
  { providerModel: 'fal-ai/nano-banana-2/edit', taskType: 'hero-asset', successRate: 0.88, sampleCount: 42, backgroundLeakageRate: 0.08, lastUpdated: '2026-07-12' },
  { providerModel: 'fal-ai/nano-banana-2', taskType: 'furniture', successRate: 0.74, sampleCount: 60, backgroundLeakageRate: 0.12, lastUpdated: '2026-07-12' },
  { providerModel: 'openai/gpt-image-2/edit', taskType: 'architecture', successRate: 0.82, sampleCount: 30, backgroundLeakageRate: 0.05, lastUpdated: '2026-07-12' },
  { providerModel: 'openai/gpt-image-2/edit', taskType: 'hero-asset', successRate: 0.95, sampleCount: 55, backgroundLeakageRate: 0.03, lastUpdated: '2026-07-12' },
  { providerModel: 'openai/gpt-image-2/edit', taskType: 'isolation', successRate: 0.84, sampleCount: 40, backgroundLeakageRate: 0.11, lastUpdated: '2026-07-12' },
];

export function getModelScoreboard(): ModelScoreboard {
  return {
    scoreboardVersion: MODEL_SCOREBOARD_VERSION,
    models: SEED_SCOREBOARD,
    routingEvidenceBased: true,
  };
}

export function resolveBestModelForTask(input: {
  taskType: ManufacturingJobType | 'isolation';
  scoreboard?: ModelScoreboard;
}): string | null {
  const board = input.scoreboard ?? getModelScoreboard();
  const candidates = board.models
    .filter((m) => m.taskType === input.taskType)
    .sort((a, b) => b.successRate - a.successRate);
  return candidates[0]?.providerModel ?? null;
}

export function recordModelOutcome(input: {
  scoreboard: ModelScoreboard;
  providerModel: string;
  taskType: ManufacturingJobType | 'isolation';
  success: boolean;
  backgroundLeakage: boolean;
}): ModelScoreboard {
  const models = input.scoreboard.models.map((m) => {
    if (m.providerModel !== input.providerModel || m.taskType !== input.taskType) return m;
    const newCount = m.sampleCount + 1;
    const successDelta = input.success ? 1 : 0;
    const leakageDelta = input.backgroundLeakage ? 1 : 0;
    return {
      ...m,
      sampleCount: newCount,
      successRate: (m.successRate * m.sampleCount + successDelta) / newCount,
      backgroundLeakageRate: (m.backgroundLeakageRate * m.sampleCount + leakageDelta) / newCount,
      lastUpdated: new Date().toISOString().slice(0, 10),
    };
  });
  return { ...input.scoreboard, models };
}
