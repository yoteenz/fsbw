import { getActiveQuestions } from '../session-storage';
import type { ExpertCaptureSession, KnowledgeStatementType, SessionSummaryReport } from '../types';
import { buildSessionSummary } from '../knowledge-extraction';

function collect(session: ExpertCaptureSession, types: KnowledgeStatementType[]): string[] {
  return session.answers
    .filter((a) => !a.deleted)
    .flatMap((a) =>
      a.knowledgeItems.filter((k) => types.includes(k.type) && k.status !== 'deleted').map((k) => k.statement)
    );
}

function businessAreasFromSession(session: ExpertCaptureSession): string[] {
  const areas = new Set<string>();
  for (const q of session.questions) {
    const answered = session.answers.some((a) => a.questionId === q.id && !a.deleted && !a.skipped && a.transcript);
    if (answered) areas.add(q.category);
  }
  return [...areas];
}

export function buildPermittingSessionSummary(session: ExpertCaptureSession): SessionSummaryReport {
  const base = buildSessionSummary(session);
  const remaining = getActiveQuestions(session).map((q) => q.text);

  return {
    ...base,
    businessAreasCovered: businessAreasFromSession(session),
    municipalityRules: collect(session, ['municipality_rule']),
    bestPractices: collect(session, ['best_practice', 'personal_technique', 'principle']),
    remainingTopics: remaining,
  };
}
