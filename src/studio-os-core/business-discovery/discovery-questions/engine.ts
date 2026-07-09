import { BUSINESS_DISCOVERY_PHASES } from '../phases';
import type {
  BusinessDiscoveryPhaseId,
  BusinessDiscoveryQuestion,
  DiscoveryQuestionContext,
  DiscoverySession,
} from '../types';

export function listQuestionsForPhase(phaseId: BusinessDiscoveryPhaseId): BusinessDiscoveryQuestion[] {
  return BUSINESS_DISCOVERY_PHASES.find((phase) => phase.id === phaseId)?.questionsAsked ?? [];
}

export function listAllDiscoveryQuestions(): BusinessDiscoveryQuestion[] {
  return BUSINESS_DISCOVERY_PHASES.flatMap((phase) =>
    phase.questionsAsked.map((question) => ({ ...question }))
  );
}

export function findDiscoveryQuestion(
  questionId: string,
  phaseId?: BusinessDiscoveryPhaseId
): BusinessDiscoveryQuestion | undefined {
  if (phaseId) {
    return listQuestionsForPhase(phaseId).find((question) => question.id === questionId);
  }
  return listAllDiscoveryQuestions().find((question) => question.id === questionId);
}

export function getAnsweredQuestionIds(session: DiscoverySession, phaseId: BusinessDiscoveryPhaseId): Set<string> {
  return new Set(
    session.responses.filter((response) => response.phaseId === phaseId).map((response) => response.questionId)
  );
}

export function resolveNextQuestions(context: DiscoveryQuestionContext, limit = 3): BusinessDiscoveryQuestion[] {
  const { session, phaseId } = context;
  const answered = getAnsweredQuestionIds(session, phaseId);
  return listQuestionsForPhase(phaseId)
    .filter((question) => !answered.has(question.id))
    .slice(0, limit);
}

export function resolvePhaseForQuestion(questionId: string): BusinessDiscoveryPhaseId | undefined {
  for (const phase of BUSINESS_DISCOVERY_PHASES) {
    if (phase.questionsAsked.some((question) => question.id === questionId)) {
      return phase.id;
    }
  }
  return undefined;
}

export function buildQuestionEnginePrompt(question: BusinessDiscoveryQuestion): string {
  return `${question.prompt} — ${question.intent}`;
}

export function scoreResponseDepth(answer: string): number {
  const words = answer.trim().split(/\s+/).filter(Boolean).length;
  if (words >= 40) return 100;
  if (words >= 20) return 80;
  if (words >= 8) return 60;
  if (words >= 3) return 40;
  return 10;
}
