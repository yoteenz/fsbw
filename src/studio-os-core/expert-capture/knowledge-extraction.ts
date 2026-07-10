import type { ExpertCaptureAnswer, ExpertCaptureSession, KnowledgeStatementType, SessionSummaryReport } from './types';
import { newKnowledgeItem } from './session-storage';

export function applyKnowledgeExtraction(
  answer: ExpertCaptureAnswer,
  items: Array<Omit<import('./types').StructuredKnowledgeItem, 'id' | 'answerId' | 'status'>>
): ExpertCaptureAnswer {
  return {
    ...answer,
    status: 'interpreted',
    knowledgeItems: items.map((item) =>
      newKnowledgeItem(answer.id, {
        ...item,
        needsReview: item.needsReview ?? item.confidence < 0.75,
      })
    ),
  };
}

export function approveAnswerKnowledge(answer: ExpertCaptureAnswer): ExpertCaptureAnswer {
  return {
    ...answer,
    status: 'approved',
    knowledgeItems: answer.knowledgeItems.map((k) => ({
      ...k,
      status: k.status === 'deleted' ? k.status : 'approved',
    })),
  };
}

export function rejectAnswerKnowledge(answer: ExpertCaptureAnswer): ExpertCaptureAnswer {
  return {
    ...answer,
    status: 'rejected',
    knowledgeItems: answer.knowledgeItems.map((k) => ({ ...k, status: 'rejected' })),
  };
}

export function markNeedsClarification(answer: ExpertCaptureAnswer): ExpertCaptureAnswer {
  return {
    ...answer,
    status: 'needs_clarification',
    knowledgeItems: answer.knowledgeItems.map((k) => ({ ...k, status: 'needs_clarification', needsReview: true })),
  };
}

export function buildSessionSummary(session: ExpertCaptureSession): SessionSummaryReport {
  const activeAnswers = session.answers.filter((a) => !a.deleted);
  const approved = activeAnswers.filter((a) => a.status === 'approved' || a.confirmation === 'correct');

  const collect = (type: KnowledgeStatementType) =>
    activeAnswers.flatMap((a) => a.knowledgeItems.filter((k) => k.type === type && k.status !== 'deleted').map((k) => k.statement));

  return {
    topicsCovered: [...new Set(activeAnswers.map((a) => a.questionText))],
    workflowSteps: collect('workflow_step'),
    decisionRules: collect('decision_rule'),
    exceptions: collect('exception').concat(collect('edge_case')),
    knowledgeGaps: activeAnswers.filter((a) => a.skipped || a.status === 'needs_clarification').map((a) => a.questionText),
    followUpOpportunities: activeAnswers
      .filter((a) => a.knowledgeItems.some((k) => k.needsReview))
      .map((a) => a.questionText),
    questionsSkipped: activeAnswers.filter((a) => a.skipped).length,
    questionsDeleted: session.answers.filter((a) => a.deleted).length,
    questionsCorrected: activeAnswers.filter((a) => a.transcriptExpertCorrected).length,
    questionsApproved: approved.length,
    totalAnswers: activeAnswers.length,
  };
}
