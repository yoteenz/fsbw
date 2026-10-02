import type { ResidentId } from '../types';
import { getLifeOsStore } from './life-os-store';
import type { RumorFragment } from './life-twin-model';

export type PropagateRumorInput = {
  truthEventId: string;
  fromHolderId: ResidentId;
  toHolderId: ResidentId;
  /** 0–1 accuracy of this transmission */
  transmissionAccuracy?: number;
  embellishment?: string;
};

export function propagateRumor(input: PropagateRumorInput): RumorFragment | null {
  const store = getLifeOsStore();
  const truth = store.truthEvents.get(input.truthEventId);
  if (!truth) return null;

  const accuracy = Math.min(1, Math.max(0, input.transmissionAccuracy ?? 0.7));
  const rumorId = `rumor-${input.truthEventId}-${input.toHolderId}-${store.rumors.length + 1}`;
  const fragment: RumorFragment = {
    rumorId,
    truthEventId: input.truthEventId,
    holderId: input.toHolderId,
    holderKind: 'resident',
    versionSummary: input.embellishment
      ? `${truth.summary} (heard: ${input.embellishment})`
      : truth.summary,
    accuracy,
    receivedFromId: input.fromHolderId,
    receivedAt: new Date().toISOString(),
  };
  store.rumors.push(fragment);
  store.events.push({
    eventId: `evt-${rumorId}`,
    eventType: 'RUMOR_PROPAGATED',
    timestamp: fragment.receivedAt,
    worldId: store.worldId,
    organizationId: store.organizationId,
    residentIds: [input.fromHolderId, input.toHolderId],
    visibility: 'PRIVATE',
    source: 'simulation',
    payload: { rumorId, truthEventId: input.truthEventId },
    causalParentEventId: undefined,
    truthStatus: 'AUTHORITATIVE',
    canonVersion: 'foundation2-v1',
  });
  return fragment;
}

/** Authoritative truth is immutable via rumor APIs. */
export function getAuthoritativeTruth(truthEventId: string): string | undefined {
  return getLifeOsStore().truthEvents.get(truthEventId)?.summary;
}
