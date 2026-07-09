import { readLiveValidationSystemStore } from '../persistence';
import type { LvsDiaryAnswer, LvsEscapeEvent, LvsValidationSignal } from '../types';

/** Learning Engine™ — converts validation signals into learnings */
export type LvsLearningCandidate = {
  learningId: string;
  title: string;
  summary: string;
  systemIds: string[];
  evidenceQuality: 'low' | 'medium' | 'high';
  sourceKinds: string[];
  assumptionsChanged: string[];
  recordedAt: string;
};

export function extractLearningsFromSignals(signals: LvsValidationSignal[]): LvsLearningCandidate[] {
  const bySystem = new Map<string, LvsValidationSignal[]>();
  for (const signal of signals) {
    const list = bySystem.get(signal.systemId) ?? [];
    list.push(signal);
    bySystem.set(signal.systemId, list);
  }

  return [...bySystem.entries()]
    .filter(([, group]) => group.length >= 2)
    .map(([systemId, group]) => ({
      learningId: `learning-${systemId}-${Date.now()}`,
      title: `Repeated ${group[0].kind} signals for ${systemId}`,
      summary: `${group.length} validation signals suggest a pattern worth Genesis review.`,
      systemIds: [systemId],
      evidenceQuality: group.length >= 4 ? 'high' : group.length >= 2 ? 'medium' : 'low',
      sourceKinds: [...new Set(group.map((g) => g.kind))],
      assumptionsChanged: [`${systemId} operating behavior differs from architecture assumptions.`],
      recordedAt: new Date().toISOString(),
    }));
}

export function extractLearningsFromDiary(answers: LvsDiaryAnswer[]): LvsLearningCandidate[] {
  return answers
    .filter((a) => a.shouldBecomeGenesisLearning)
    .map((a) => ({
      learningId: `learning-diary-${a.answerId}`,
      title: 'Founder Diary insight',
      summary: a.response.slice(0, 200),
      systemIds: a.systemIds,
      evidenceQuality: a.sentimentConfidence >= 0.7 ? 'medium' : 'low',
      sourceKinds: ['reflection'],
      assumptionsChanged: ['Founder workflow preference may require Genesis revision.'],
      recordedAt: a.recordedAt,
    }));
}

export function extractLearningsFromEscapes(events: LvsEscapeEvent[]): LvsLearningCandidate[] {
  const repeated = events.filter((e) => e.frequency >= 2);
  return repeated.map((e) => ({
    learningId: `learning-escape-${e.eventId}`,
    title: `Escape to ${e.destinationLabel}`,
    summary: `Founder repeatedly leaves Studio OS for ${e.destinationCategory}: ${e.context}`,
    systemIds: [e.systemId],
    evidenceQuality: e.confidence >= 0.7 ? 'high' : 'medium',
    sourceKinds: ['escape'],
    assumptionsChanged: [
      e.replacementOpportunity
        ? 'Studio OS may need to own this workflow.'
        : 'Integration or accepted boundary may be appropriate.',
    ],
    recordedAt: e.createdAt,
  }));
}

export function listAllLearningCandidates(): LvsLearningCandidate[] {
  const store = readLiveValidationSystemStore();
  return [
    ...extractLearningsFromSignals(store.signals),
    ...extractLearningsFromDiary(store.diaryAnswers),
    ...extractLearningsFromEscapes(store.escapeEvents),
  ].sort((a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime());
}
