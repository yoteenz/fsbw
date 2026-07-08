import { mutateInstituteStore, readInstituteStore } from '../persistence/store';
import { createInstitutePublication } from '../publications/engine';
import { resolveDivisionForPublicationType } from '../institute/registry';
import type {
  KnowledgeReviewDecision,
  KnowledgeSubmission,
  KnowledgeSubmissionSource,
  InstitutePublicationType,
  InstituteDivisionId,
} from '../types';

function now(): string {
  return new Date().toISOString();
}

function createSubmissionId(source: KnowledgeSubmissionSource): string {
  return `sub-${source}-${Date.now().toString(36)}`;
}

export function listKnowledgeSubmissions(): KnowledgeSubmission[] {
  return readInstituteStore().submissions;
}

export function listPendingSubmissions(): KnowledgeSubmission[] {
  return readInstituteStore().submissions.filter(
    (s) => s.status === 'pending' || s.status === 'in-review'
  );
}

export function getKnowledgeSubmission(submissionId: string): KnowledgeSubmission | undefined {
  return readInstituteStore().submissions.find((s) => s.submissionId === submissionId);
}

export function submitProposedKnowledge(input: {
  source: KnowledgeSubmissionSource;
  sourceRef?: string;
  proposedTitle: string;
  proposedType: InstitutePublicationType;
  proposedSummary: string;
  proposedContent?: string;
  targetDivisionId?: InstituteDivisionId;
  relatedPublicationIds?: string[];
  codexArticleIds?: string[];
}): KnowledgeSubmission {
  const submission: KnowledgeSubmission = {
    submissionId: createSubmissionId(input.source),
    source: input.source,
    sourceRef: input.sourceRef,
    proposedTitle: input.proposedTitle.trim(),
    proposedType: input.proposedType,
    proposedSummary: input.proposedSummary.trim(),
    proposedContent: input.proposedContent,
    targetDivisionId:
      input.targetDivisionId ?? resolveDivisionForPublicationType(input.proposedType),
    relatedPublicationIds: input.relatedPublicationIds ?? [],
    codexArticleIds: input.codexArticleIds ?? [],
    status: 'pending',
    submittedAt: now(),
  };

  mutateInstituteStore((store) => ({
    ...store,
    submissions: [...store.submissions, submission],
  }));

  return submission;
}

/** Profession Brains™, Research Engine™, Mentor AI™ submission hooks. */
export function submitFromProfessionBrain(
  professionId: string,
  input: Omit<Parameters<typeof submitProposedKnowledge>[0], 'source' | 'sourceRef' | 'targetDivisionId'>
): KnowledgeSubmission {
  return submitProposedKnowledge({
    ...input,
    source: 'profession-brain',
    sourceRef: professionId,
    targetDivisionId: 'research-bureau',
  });
}

export function submitFromResearchEngine(
  engineRef: string,
  input: Omit<Parameters<typeof submitProposedKnowledge>[0], 'source' | 'sourceRef'>
): KnowledgeSubmission {
  return submitProposedKnowledge({
    ...input,
    source: 'research-engine',
    sourceRef: engineRef,
    targetDivisionId: 'research-bureau',
  });
}

export function submitFromMentorAi(
  sessionRef: string,
  input: Omit<Parameters<typeof submitProposedKnowledge>[0], 'source' | 'sourceRef'>
): KnowledgeSubmission {
  return submitProposedKnowledge({
    ...input,
    source: 'mentor-ai',
    sourceRef: sessionRef,
    targetDivisionId: 'knowledge-validation-bureau',
  });
}

export function beginSubmissionReview(
  submissionId: string,
  reviewer: string
): KnowledgeSubmission | undefined {
  let updated: KnowledgeSubmission | undefined;

  mutateInstituteStore((store) => {
    const idx = store.submissions.findIndex((s) => s.submissionId === submissionId);
    if (idx < 0) return store;
    updated = {
      ...store.submissions[idx],
      status: 'in-review',
      reviewer,
      reviewedAt: now(),
    };
    const submissions = [...store.submissions];
    submissions[idx] = updated;
    return { ...store, submissions };
  });

  return updated;
}

export function resolveSubmissionReview(
  submissionId: string,
  decision: KnowledgeReviewDecision,
  reviewer: string,
  reviewNotes: string
): KnowledgeSubmission | undefined {
  let updated: KnowledgeSubmission | undefined;

  mutateInstituteStore((store) => {
    const idx = store.submissions.findIndex((s) => s.submissionId === submissionId);
    if (idx < 0) return store;

    const submission = store.submissions[idx];
    const statusMap: Record<KnowledgeReviewDecision, KnowledgeSubmission['status']> = {
      approve: 'approved',
      reject: 'rejected',
      return: 'returned',
      defer: 'in-review',
    };

    updated = {
      ...submission,
      status: statusMap[decision],
      reviewer,
      reviewNotes,
      reviewedAt: now(),
    };

    const submissions = [...store.submissions];
    submissions[idx] = updated;
    return { ...store, submissions };
  });

  return updated;
}

export function createPublicationFromApprovedSubmission(
  submissionId: string,
  author: string
): ReturnType<typeof createInstitutePublication> | undefined {
  const submission = getKnowledgeSubmission(submissionId);
  if (!submission || submission.status !== 'approved') return undefined;

  const publication = createInstitutePublication({
    title: submission.proposedTitle,
    type: submission.proposedType,
    divisionId: submission.targetDivisionId,
    summary: submission.proposedSummary,
    author,
    status: 'Review',
    codexArticleIds: submission.codexArticleIds,
    tags: [`source:${submission.source}`, 'institute-review'],
  });

  mutateInstituteStore((store) => ({
    ...store,
    submissions: store.submissions.map((s) =>
      s.submissionId === submissionId
        ? { ...s, status: 'promoted' as const, resultingPublicationId: publication.publicationId }
        : s
    ),
  }));

  return publication;
}
