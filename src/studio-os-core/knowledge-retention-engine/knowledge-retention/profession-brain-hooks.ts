import { PROFESSION_BRAIN_CATALOG } from '../../profession-brain/brain-catalog';
import type { KnowledgeIndustryUpdate } from '../types';
import { ingestIndustryKnowledgeUpdates } from './orchestrator';

export type ProfessionBrainKnowledgeEvent = {
  brainId: string;
  conceptId: string;
  title: string;
  industryVersion: string;
  summary: string;
  whyItChanged: string;
  workImpact: string;
  severity: KnowledgeIndustryUpdate['severity'];
  changedAt?: string;
};

/** Bridge Profession Brain™ canonical updates into the retention engine. */
export function mapProfessionBrainUpdate(
  event: ProfessionBrainKnowledgeEvent
): KnowledgeIndustryUpdate {
  return {
    id: `pb-update-${event.brainId}-${event.conceptId}-${event.industryVersion}`,
    conceptId: event.conceptId,
    brainId: event.brainId,
    title: event.title,
    changedAt: event.changedAt ?? new Date().toISOString(),
    industryVersion: event.industryVersion,
    summary: event.summary,
    whyItChanged: event.whyItChanged,
    workImpact: event.workImpact,
    severity: event.severity,
  };
}

export function listAffectedBrainIds(brainId: string): string[] {
  const brain = PROFESSION_BRAIN_CATALOG.find((entry) => entry.id === brainId);
  if (!brain) return [brainId];
  return [brain.id, ...brain.industryHints.filter(Boolean)];
}

export function queueProfessionBrainRefreshers(
  organizationId: string,
  learnerId: string,
  events: ProfessionBrainKnowledgeEvent[]
) {
  const updates = events.map(mapProfessionBrainUpdate);
  return ingestIndustryKnowledgeUpdates(organizationId, learnerId, updates);
}

/** Identify learners with profiles tied to a Profession Brain. */
export function filterProfilesForBrainEvent<T extends { brainId: string }>(
  profiles: T[],
  brainId: string
): T[] {
  return profiles.filter((profile) => profile.brainId === brainId);
}
