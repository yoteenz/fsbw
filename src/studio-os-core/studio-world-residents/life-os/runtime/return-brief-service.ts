import type { ResidentId } from '../../types';
import type { ReturnBrief, ReturnBriefItem } from '../life-twin-model';
import { getLifeOsStore } from '../life-os-store';
import type { VisibilityScope } from '../types-core';

const SIGNIFICANCE_FLOOR = 0.55;
const TICK_NOISE_TYPES = new Set(['WORK_PROGRESS']);

export type ReturnBriefAccess = {
  /** Founder / privileged viewer — may see FOUNDER_PRIVILEGED + private disclosures metadata. */
  isFounderPrivileged: boolean;
};

function eventSignificance(payload: Record<string, unknown>): number {
  const explicit = Number(payload.significance);
  if (!Number.isNaN(explicit) && explicit > 0) return explicit;
  const founderRel = Number(payload.founderRelevance ?? 0);
  const risk = Number(payload.risk ?? 0);
  return Math.max(founderRel, risk, 0.4);
}

function categorizeEvent(eventType: string): ReturnBriefItem['category'] {
  if (eventType.includes('WORK') || eventType === 'ACTIVITY_STARTED') return 'WORK';
  if (eventType.includes('CAREER')) return 'CAREER';
  if (eventType.includes('RELATIONSHIP') || eventType.includes('SOCIAL')) return 'SOCIAL';
  if (eventType.includes('FOUNDER') || eventType.includes('DECISION')) return 'DECISIONS';
  if (eventType.includes('NEED') || eventType.includes('BLOCK')) return 'BLOCKERS';
  return 'PEOPLE';
}

function visibilityAllowed(visibility: VisibilityScope, access: ReturnBriefAccess): boolean {
  if (visibility === 'PRIVATE' || visibility === 'SECRET') {
    return access.isFounderPrivileged;
  }
  if (visibility === 'FOUNDER_PRIVILEGED') return access.isFounderPrivileged;
  return true;
}

export function buildReturnBrief(
  fromIso: string,
  toIso: string,
  access: ReturnBriefAccess = { isFounderPrivileged: true },
): ReturnBrief {
  const store = getLifeOsStore();
  const items: ReturnBriefItem[] = [];

  for (const e of store.events) {
    if (e.timestamp < fromIso || e.timestamp > toIso) continue;
    if (e.truthStatus !== 'AUTHORITATIVE' && e.truthStatus !== 'PROPOSED') continue;
    if (!visibilityAllowed(e.visibility, access)) continue;

    const sig = eventSignificance(e.payload as Record<string, unknown>);
    if (sig < SIGNIFICANCE_FLOOR && TICK_NOISE_TYPES.has(e.eventType)) continue;
    if (sig < 0.35) continue;

    const founderAction =
      Boolean(e.payload.founderActionRequired) ||
      e.eventType === 'FOUNDER_ESCALATION' ||
      e.payload.disposition === 'ASK_FOUNDER_BEFORE_ACTION';

    items.push({
      summary: String(e.payload.summary ?? e.eventType),
      groundedEventId: e.eventId,
      residentIds: e.residentIds,
      at: e.timestamp,
      category: categorizeEvent(e.eventType),
      whyItMatters: String(e.payload.whyItMatters ?? 'Simulation state change with team relevance'),
      founderActionNeeded: founderAction,
      relatedProjectId: e.projectId,
      significance: sig,
    });
  }

  items.sort((a, b) => a.at.localeCompare(b.at));

  return {
    organizationId: store.organizationId,
    fromIso,
    toIso,
    items,
    grouped: groupItems(items),
  };
}

function groupItems(items: ReturnBriefItem[]): ReturnBrief['grouped'] {
  const grouped: NonNullable<ReturnBrief['grouped']> = {
    WORK: [],
    PEOPLE: [],
    DECISIONS: [],
    SOCIAL: [],
    CAREER: [],
    BLOCKERS: [],
    NEEDS_FOUNDER: [],
  };
  for (const item of items) {
    grouped[item.category].push(item);
    if (item.founderActionNeeded) grouped.NEEDS_FOUNDER.push(item);
  }
  return grouped;
}

export function getResidentTimeline(
  residentId: ResidentId,
  fromIso?: string,
  toIso?: string,
): Array<{
  at: string;
  eventType: string;
  summary: string;
  locationId?: string;
  eventId: string;
}> {
  const store = getLifeOsStore();
  return store.events
    .filter((e) => e.residentIds.includes(residentId))
    .filter((e) => (fromIso ? e.timestamp >= fromIso : true))
    .filter((e) => (toIso ? e.timestamp <= toIso : true))
    .map((e) => ({
      at: e.timestamp,
      eventType: e.eventType,
      summary: String(e.payload.summary ?? e.eventType),
      locationId: e.locationId,
      eventId: e.eventId,
    }));
}
