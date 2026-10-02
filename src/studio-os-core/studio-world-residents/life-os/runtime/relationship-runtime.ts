import type { ResidentLifeEventEnvelope } from '../event-envelope';
import { getLifeOsStore } from '../life-os-store';
import type { ResidentId } from '../../types';
import type { ResidentRelationshipLifeDimensions } from '../life-twin-model';

function edgeKey(a: ResidentId, b: ResidentId): string {
  return a < b ? `${a}:${b}` : `${b}:${a}`;
}

export function applyRelationshipDeltaFromEvent(event: ResidentLifeEventEnvelope): void {
  if (event.eventType !== 'RELATIONSHIP_EVENT' && event.eventType !== 'SOCIAL_INTERACTION') return;
  const ids = event.residentIds;
  if (ids.length < 2) return;
  const store = getLifeOsStore();
  const a = ids[0]!;
  const b = ids[1]!;
  const key = edgeKey(a, b);
  let row = store.relationshipLife.find(
    (r) => edgeKey(r.residentAId, r.residentBId) === key,
  );
  if (!row) {
    row = {
      residentAId: a,
      residentBId: b,
      trust: 0.5,
      affection: 0.5,
      respect: 0.5,
      familiarity: 0.4,
      resentment: 0.1,
      rivalry: 0.1,
      candor: 0.4,
      sentiments: [],
    };
    store.relationshipLife.push(row);
  }
  const delta = Number(event.payload.trustDelta ?? 0.05);
  row.trust = Math.min(1, Math.max(0, row.trust + delta));
  const tag = String(event.payload.sentimentTag ?? '');
  if (tag) {
    row.sentiments.push({ tag, since: event.timestamp, intensity: Number(event.payload.sentimentIntensity ?? 0.5) });
  }
}

export function recordRelationshipEvent(input: {
  residentAId: ResidentId;
  residentBId: ResidentId;
  summary: string;
  trustDelta?: number;
  sentimentTag?: string;
  timestamp?: string;
  causalParentEventId?: string;
}): void {
  const store = getLifeOsStore();
  const ts = input.timestamp ?? new Date().toISOString();
  const evt = {
    eventType: 'RELATIONSHIP_EVENT' as const,
    timestamp: ts,
    worldId: store.worldId,
    organizationId: store.organizationId,
    residentIds: [input.residentAId, input.residentBId],
    visibility: 'OFFICE_KNOWN' as const,
    source: 'simulation' as const,
    payload: {
      summary: input.summary,
      trustDelta: input.trustDelta ?? 0.05,
      sentimentTag: input.sentimentTag,
      significance: 0.7,
      founderRelevance: 0.4,
    },
    truthStatus: 'AUTHORITATIVE' as const,
    causalParentEventId: input.causalParentEventId,
  };
  const full = {
    eventId: `evt-rel-${store.events.length + 1}-${ts}`,
    canonVersion: 'foundation2-v1' as const,
    ...evt,
  };
  store.events.push(full);
  applyRelationshipDeltaFromEvent(full);
}

export function getRelationshipLife(residentId: ResidentId): ResidentRelationshipLifeDimensions[] {
  return getLifeOsStore().relationshipLife.filter(
    (r) => r.residentAId === residentId || r.residentBId === residentId,
  );
}
