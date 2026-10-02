import { listSeason1Residents } from '../../registry';
import type { ResidentId } from '../../types';
import { evaluateFounderGate } from '../founder-gate';
import type { ResidentLifeEventEnvelope } from '../event-envelope';
import { getLifeOsStore } from '../life-os-store';
import { persistLifeOsStore, getResidentLifeRepository } from '../persistence/repository-context';
import { recordResidentDecision, recordResidentEvent, updateResidentNeedState } from '../life-os-services';
import { getSimulationNowIso, tickWindowIdForInstant } from './simulation-clock';
import { createSeededRandom } from './simulation-random';
import { maybeCreateMemoryFromEvent } from './memory-from-event';
import { applyRelationshipDeltaFromEvent } from './relationship-runtime';

export type TickOutputKind =
  | 'NO_ACTION'
  | 'STATE_UPDATE'
  | 'INTERNAL_ACTION'
  | 'LOCATION_CHANGE'
  | 'WORK_PROGRESS'
  | 'INTERNAL_MESSAGE'
  | 'RESIDENT_REQUEST'
  | 'RESIDENT_PROPOSAL'
  | 'WORLD_STORY'
  | 'MEMORY_EVENT'
  | 'NEED_CHANGE'
  | 'RELATIONSHIP_EVENT'
  | 'FOUNDER_ESCALATION';

export type WorldTickResult = {
  tickWindowId: string;
  skippedDuplicate: boolean;
  outputs: TickOutputKind[];
  eventsCreated: string[];
};

function advanceInternalWork(residentId: ResidentId, now: string, rnd: () => number): TickOutputKind[] {
  const bundle = getLifeOsStore().bundles.get(residentId);
  if (!bundle) return ['NO_ACTION'];
  const outputs: TickOutputKind[] = [];
  const task = bundle.workNow.currentActivity;
  if (bundle.workNow.founderBlockers.length > 0) {
    recordResidentDecision({
      residentId,
      decisionSummary: 'Work blocked pending founder clearance',
      disposition: 'ESCALATE_IMMEDIATELY',
      reasoningSummary: `Blocked by: ${bundle.workNow.founderBlockers.join(', ')}`,
      founderRequired: true,
    });
    return ['FOUNDER_ESCALATION'];
  }
  if (!task) return ['NO_ACTION'];

  const gate = evaluateFounderGate('INTERNAL_CREATIVE_REVIEW', bundle.autonomy.level);
  if (!gate.allowed && gate.requiresFounderApproval) {
    recordResidentDecision({
      residentId,
      decisionSummary: `Deferred internal work — ${gate.actionKind}`,
      disposition: 'ASK_FOUNDER_BEFORE_ACTION',
      reasoningSummary: gate.reason,
      founderRequired: true,
    });
    outputs.push('FOUNDER_ESCALATION');
    return outputs;
  }

  if (rnd() > 0.35) {
    bundle.workNow.selfInitiated.push(`${task} — internal progress`);
    outputs.push('WORK_PROGRESS');
    recordResidentEvent({
      eventType: 'WORK_PROGRESS',
      timestamp: now,
      worldId: getLifeOsStore().worldId,
      organizationId: getLifeOsStore().organizationId,
      residentIds: [residentId],
      visibility: 'TEAM_ONLY',
      source: 'simulation',
      payload: {
        summary: `Progress on ${task}`,
        significance: 0.45,
        founderRelevance: 0.2,
      },
      truthStatus: 'AUTHORITATIVE',
    });
  }

  const rhythm = bundle.rhythm;
  if (rhythm.optionalStops.length > 0 && rnd() > 0.7) {
    const stop = rhythm.optionalStops[Math.floor(rnd() * rhythm.optionalStops.length)]!;
    bundle.current.locationLabel = stop;
    bundle.current.updatedAt = now;
    outputs.push('LOCATION_CHANGE');
    recordResidentEvent({
      eventType: 'LOCATION_CHANGED',
      timestamp: now,
      worldId: getLifeOsStore().worldId,
      organizationId: getLifeOsStore().organizationId,
      residentIds: [residentId],
      locationId: bundle.current.locationId,
      visibility: 'OFFICE_KNOWN',
      source: 'simulation',
      payload: { summary: `Rhythm stop: ${stop}`, significance: 0.35 },
      truthStatus: 'AUTHORITATIVE',
    });
  }

  if (rnd() > 0.82) {
    updateResidentNeedState(
      residentId,
      { causeType: 'TIME', summary: 'Long focus block', at: now },
      { ENERGY: Math.max(0, (bundle.needs.levels.ENERGY ?? 3) - 1) as 0 | 1 | 2 | 3 | 4 | 5 },
    );
    outputs.push('NEED_CHANGE');
  }

  return outputs.length ? outputs : ['NO_ACTION'];
}

export async function runWorldTick(options?: {
  nowIso?: string;
  seed?: number;
  residentIds?: ResidentId[];
}): Promise<WorldTickResult> {
  const store = getLifeOsStore();
  const now = options?.nowIso ?? getSimulationNowIso();
  const tickWindowId = tickWindowIdForInstant(now);
  const repo = getResidentLifeRepository();
  const recorded = await repo.tryRecordTick({
    tickWindowId,
    worldId: store.worldId,
    organizationId: store.organizationId,
    startedAt: now,
    completedAt: now,
    tickKind: 'world',
    resultSummary: 'world tick',
  });
  if (!recorded) {
    return { tickWindowId, skippedDuplicate: true, outputs: ['NO_ACTION'], eventsCreated: [] };
  }
  store.completedTickWindows.push(tickWindowId);

  const seed = options?.seed ?? tickWindowId.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const rnd = createSeededRandom(seed);
  const targets = options?.residentIds ?? listSeason1Residents().map((r) => r.residentId);
  const outputs: TickOutputKind[] = [];
  const eventsCreated: string[] = [];

  for (const residentId of targets) {
    const residentOutputs = advanceInternalWork(residentId, now, rnd);
    outputs.push(...residentOutputs);
  }

  const recent = store.events.slice(-targets.length * 2);
  for (const evt of recent) {
    if (evt.timestamp === now) {
      eventsCreated.push(evt.eventId);
      maybeCreateMemoryFromEvent(evt);
      applyRelationshipDeltaFromEvent(evt);
    }
  }

  await persistLifeOsStore();
  return {
    tickWindowId,
    skippedDuplicate: false,
    outputs: [...new Set(outputs)],
    eventsCreated,
  };
}

export function getEventChain(rootEventId: string): ResidentLifeEventEnvelope[] {
  const store = getLifeOsStore();
  const byParent = new Map<string, ResidentLifeEventEnvelope[]>();
  for (const e of store.events) {
    if (e.causalParentEventId) {
      const list = byParent.get(e.causalParentEventId) ?? [];
      list.push(e);
      byParent.set(e.causalParentEventId, list);
    }
  }
  const chain: ResidentLifeEventEnvelope[] = [];
  const root = store.events.find((e) => e.eventId === rootEventId);
  if (!root) return chain;
  const queue = [root];
  while (queue.length) {
    const cur = queue.shift()!;
    chain.push(cur);
    const children = byParent.get(cur.eventId) ?? [];
    queue.push(...children);
  }
  return chain;
}
