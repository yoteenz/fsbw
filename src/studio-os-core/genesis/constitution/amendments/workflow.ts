import { CONSTITUTION_AMENDMENT_STAGES } from '../constants';
import { mutateConstitutionStore, readConstitutionStore } from '../persistence';
import { getConstitutionArticle } from '../articles/engine';
import { createConstitutionArticleRevision } from '../versioning/article-versioning';
import { archiveConstitutionHistoricalEntry } from '../history/archive';
import type { ConstitutionAmendment, ConstitutionAmendmentStage } from '../types';

function now(): string {
  return new Date().toISOString();
}

function createAmendmentId(): string {
  return `con-amend-${Date.now().toString(36)}`;
}

export function listConstitutionAmendments(): ConstitutionAmendment[] {
  return readConstitutionStore().amendments;
}

export function getConstitutionAmendment(amendmentId: string): ConstitutionAmendment | undefined {
  return readConstitutionStore().amendments.find((a) => a.amendmentId === amendmentId);
}

export function listOpenConstitutionAmendments(): ConstitutionAmendment[] {
  return readConstitutionStore().amendments.filter(
    (a) => a.status === 'open' || a.status === 'in-progress'
  );
}

export function getNextAmendmentStage(
  current: ConstitutionAmendmentStage
): ConstitutionAmendmentStage | undefined {
  const idx = CONSTITUTION_AMENDMENT_STAGES.indexOf(current);
  if (idx < 0 || idx >= CONSTITUTION_AMENDMENT_STAGES.length - 1) return undefined;
  return CONSTITUTION_AMENDMENT_STAGES[idx + 1];
}

/** Amendment Workflow™ — Proposal → Discussion → Architecture Review → Founder Approval → Genesis Update → Codex Update → Historical Archive */
export function submitConstitutionAmendment(input: {
  targetArticleId: string;
  title: string;
  amendmentClass: ConstitutionAmendment['amendmentClass'];
  before: string;
  after: string;
  rationale: string;
  author: string;
  codexSyncRequired?: boolean;
  genesisSyncRequired?: boolean;
}): ConstitutionAmendment | undefined {
  const article = getConstitutionArticle(input.targetArticleId);
  if (!article) return undefined;

  const amendment: ConstitutionAmendment = {
    amendmentId: createAmendmentId(),
    targetArticleId: input.targetArticleId,
    title: input.title.trim(),
    amendmentClass: input.amendmentClass,
    before: input.before.trim(),
    after: input.after.trim(),
    rationale: input.rationale.trim(),
    stage: 'proposal',
    status: 'open',
    author: input.author,
    createdAt: now(),
    updatedAt: now(),
    discussionNotes: [],
    architectureReviewNotes: [],
    codexSyncRequired: input.codexSyncRequired ?? true,
    genesisSyncRequired: input.genesisSyncRequired ?? true,
  };

  mutateConstitutionStore((store) => ({
    ...store,
    amendments: [...store.amendments, amendment],
  }));

  return amendment;
}

export function advanceConstitutionAmendmentStage(
  amendmentId: string,
  targetStage?: ConstitutionAmendmentStage
): ConstitutionAmendment | undefined {
  let updated: ConstitutionAmendment | undefined;

  mutateConstitutionStore((store) => {
    const idx = store.amendments.findIndex((a) => a.amendmentId === amendmentId);
    if (idx < 0) return store;

    const amendment = store.amendments[idx];
    const nextStage = targetStage ?? getNextAmendmentStage(amendment.stage);
    if (!nextStage) return store;

    updated = {
      ...amendment,
      stage: nextStage,
      status: 'in-progress',
      updatedAt: now(),
    };

    const amendments = [...store.amendments];
    amendments[idx] = updated;
    return { ...store, amendments };
  });

  return updated;
}

export function addConstitutionAmendmentDiscussionNote(
  amendmentId: string,
  note: string
): ConstitutionAmendment | undefined {
  let updated: ConstitutionAmendment | undefined;

  mutateConstitutionStore((store) => {
    const idx = store.amendments.findIndex((a) => a.amendmentId === amendmentId);
    if (idx < 0) return store;

    updated = {
      ...store.amendments[idx],
      discussionNotes: [...store.amendments[idx].discussionNotes, note.trim()],
      updatedAt: now(),
    };

    const amendments = [...store.amendments];
    amendments[idx] = updated;
    return { ...store, amendments };
  });

  return updated;
}

export function addConstitutionArchitectureReviewNote(
  amendmentId: string,
  note: string
): ConstitutionAmendment | undefined {
  let updated: ConstitutionAmendment | undefined;

  mutateConstitutionStore((store) => {
    const idx = store.amendments.findIndex((a) => a.amendmentId === amendmentId);
    if (idx < 0) return store;

    updated = {
      ...store.amendments[idx],
      architectureReviewNotes: [...store.amendments[idx].architectureReviewNotes, note.trim()],
      updatedAt: now(),
    };

    const amendments = [...store.amendments];
    amendments[idx] = updated;
    return { ...store, amendments };
  });

  return updated;
}

export function approveConstitutionAmendment(
  amendmentId: string,
  founder: string,
  notes: string
): ConstitutionAmendment | undefined {
  let updated: ConstitutionAmendment | undefined;

  mutateConstitutionStore((store) => {
    const idx = store.amendments.findIndex((a) => a.amendmentId === amendmentId);
    if (idx < 0) return store;

    const amendment = store.amendments[idx];
    updated = {
      ...amendment,
      stage: 'founder-approval',
      status: 'approved',
      founderApproval: {
        approvalId: `con-appr-${amendmentId}`,
        decision: 'approve',
        stage: 'founder-approval',
        approver: founder,
        notes,
        createdAt: now(),
      },
      updatedAt: now(),
    };

    const amendments = [...store.amendments];
    amendments[idx] = updated;
    return { ...store, amendments };
  });

  return updated;
}

export function applyConstitutionAmendmentToGenesis(
  amendmentId: string,
  author: string
): boolean {
  const amendment = getConstitutionAmendment(amendmentId);
  if (!amendment || amendment.status !== 'approved') return false;

  createConstitutionArticleRevision(amendment.targetArticleId, {
    summary: amendment.title,
    author,
    changeNote: `Amendment applied: ${amendment.amendmentClass}`,
    versionLevel: amendment.amendmentClass === 'constitutional-change' ? 'major' : 'minor',
  });

  mutateConstitutionStore((store) => {
    const articles = store.articles.map((article) =>
      article.articleId === amendment.targetArticleId
        ? {
            ...article,
            constitutionalText: amendment.after,
            updatedAt: now(),
            approvalHistory: [
              ...article.approvalHistory,
              {
                approvalId: `con-appr-apply-${amendmentId}`,
                decision: 'approve' as const,
                stage: 'genesis-update' as const,
                approver: author,
                notes: amendment.rationale,
                createdAt: now(),
              },
            ],
          }
        : article
    );

    const amendments = store.amendments.map((a) =>
      a.amendmentId === amendmentId
        ? { ...a, stage: 'genesis-update' as const, updatedAt: now() }
        : a
    );

    return { ...store, articles, amendments };
  });

  return true;
}

export function completeConstitutionAmendmentArchive(
  amendmentId: string,
  _author: string
): ConstitutionAmendment | undefined {
  const amendment = getConstitutionAmendment(amendmentId);
  if (!amendment) return undefined;

  archiveConstitutionHistoricalEntry(amendment.targetArticleId, {
    reason: `Amendment archived: ${amendment.title}`,
    amendmentId,
  });

  let updated: ConstitutionAmendment | undefined;

  mutateConstitutionStore((store) => {
    const idx = store.amendments.findIndex((a) => a.amendmentId === amendmentId);
    if (idx < 0) return store;

    updated = {
      ...store.amendments[idx],
      stage: 'historical-archive',
      status: 'archived',
      updatedAt: now(),
    };

    const amendments = [...store.amendments];
    amendments[idx] = updated;
    return { ...store, amendments };
  });

  return updated;
}

export function listConstitutionAmendmentStages(): ConstitutionAmendmentStage[] {
  return [...CONSTITUTION_AMENDMENT_STAGES];
}
