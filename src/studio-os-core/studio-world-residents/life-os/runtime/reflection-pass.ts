import { getLifeOsStore } from '../life-os-store';
import { persistLifeOsStore, getResidentLifeRepository } from '../persistence/repository-context';
import { getSimulationNowIso, tickWindowIdForInstant } from './simulation-clock';
import type { ResidentId } from '../../types';

export type ReflectionOutput = {
  residentId: ResidentId;
  summary: string;
  kind: 'OPEN_LOOP' | 'PRIORITY_UPDATE' | 'MEMORY_RECLASS' | 'PROPOSAL_CANDIDATE' | 'RELATIONSHIP_SENTIMENT';
};

export async function runResidentReflection(residentId: ResidentId): Promise<ReflectionOutput[]> {
  const store = getLifeOsStore();
  const now = getSimulationNowIso();
  const tickWindowId = `reflection-${residentId}-${tickWindowIdForInstant(now)}`;
  const repo = getResidentLifeRepository();
  const ok = await repo.tryRecordTick({
    tickWindowId,
    worldId: store.worldId,
    organizationId: store.organizationId,
    startedAt: now,
    completedAt: now,
    tickKind: 'reflection',
    resultSummary: `reflection ${residentId}`,
  });
  if (!ok) return [];

  const bundle = store.bundles.get(residentId);
  if (!bundle) return [];

  const outputs: ReflectionOutput[] = [];
  const openMemories = (store.memories.get(residentId) ?? []).filter((m) => m.resolutionState === 'OPEN');
  if (openMemories.length > 2) {
    outputs.push({
      residentId,
      kind: 'OPEN_LOOP',
      summary: `Reprioritized ${openMemories.length} open memory threads`,
    });
  }
  if (bundle.workNow.teamBlockers.length > 0) {
    outputs.push({
      residentId,
      kind: 'PROPOSAL_CANDIDATE',
      summary: 'Internal proposal: unblock team dependency',
    });
  }
  await persistLifeOsStore();
  return outputs;
}
