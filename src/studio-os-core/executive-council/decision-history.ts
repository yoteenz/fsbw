import {
  readMemoryEngineStore,
  writeMemoryEngineStore,
  getOrganizationMemoryProfile,
} from '../memory-engine/store';
import type { MemoryRecord } from '../memory-engine/types';
import type { CouncilDecisionRecord, ExecutiveBriefing } from './org-types';

export function createCouncilDecisionRecord(briefing: ExecutiveBriefing): CouncilDecisionRecord {
  const lessons = briefing.contributions
    .flatMap((c) => c.concerns.slice(0, 1))
    .filter(Boolean)
    .map((c) => `Monitor: ${c}`);

  if (briefing.tradeoffs[0]) {
    lessons.push(`Trade-off accepted: ${briefing.tradeoffs[0]}`);
  }

  return {
    id: `decision-${Date.now()}`,
    decision: briefing.recommendations[0] ?? briefing.summary.slice(0, 120),
    reasoning: briefing.chiefConciergeSummary,
    participants: briefing.participants,
    outcome: 'pending',
    lessonsLearned: lessons.slice(0, 5),
    briefingId: briefing.id,
    query: briefing.query,
    recordedAt: new Date().toISOString(),
  };
}

export function syncDecisionToMemoryEngine(
  organizationId: string,
  record: CouncilDecisionRecord,
  briefing: ExecutiveBriefing
): void {
  const profile = getOrganizationMemoryProfile(organizationId);
  if (!profile) return;

  const memoryRecord: MemoryRecord = {
    id: `mem-council-${record.id}`,
    type: 'decision',
    title: `Executive Council: ${briefing.query.slice(0, 80)}`,
    summary: record.reasoning,
    outcome: 'ongoing',
    occurredAt: record.recordedAt,
    tags: ['executive-council', 'collaborative-decision', ...briefing.departmentsAffected.map((d) => d.toLowerCase())],
    sourceModule: 'executive-council',
    metrics: briefing.confidenceLevels.slice(0, 3).map((c) => ({
      label: c.area,
      value: `${c.confidencePct}%`,
    })),
  };

  const store = readMemoryEngineStore();
  const nextProfiles = store.profiles.map((p) => {
    if (p.organizationId !== organizationId) return p;
    const exists = p.records.some((r) => r.id === memoryRecord.id);
    if (exists) return p;
    return {
      ...p,
      records: [memoryRecord, ...p.records],
      totalLessonsCaptured: p.totalLessonsCaptured + record.lessonsLearned.length,
      updatedAt: new Date().toISOString(),
    };
  });

  writeMemoryEngineStore({ ...store, profiles: nextProfiles });
}

export function resolveCouncilDecision(
  profile: { decisionHistory: CouncilDecisionRecord[] },
  decisionId: string,
  outcome: CouncilDecisionRecord['outcome'],
  lessonsLearned?: string[]
): CouncilDecisionRecord[] {
  return profile.decisionHistory.map((d) =>
    d.id === decisionId
      ? {
          ...d,
          outcome,
          resolvedAt: new Date().toISOString(),
          lessonsLearned: lessonsLearned?.length ? lessonsLearned : d.lessonsLearned,
        }
      : d
  );
}
