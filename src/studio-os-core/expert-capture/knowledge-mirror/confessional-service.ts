import type { KnowledgeEntry, KnowledgeProgram } from './types';
import { createVersionRecord } from './sync-from-session';
import { rebuildTrainingPackets } from './training-packets';
import { rebuildCompetencies } from './competency-core';

function newId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export type ConfessionalInput = {
  transcript: string;
  summary: string;
  affectsPriorEntryId?: string | null;
  changeEffectiveDate?: string | null;
  universal?: boolean;
  jurisdiction?: string | null;
  requiresOwnerApproval?: boolean;
  visibility?: KnowledgeEntry['visibility'];
};

export function createConfessionalEntry(
  program: KnowledgeProgram,
  input: ConfessionalInput
): KnowledgeProgram {
  const now = new Date().toISOString();
  const entry: KnowledgeEntry = {
    id: newId('ke'),
    knowledgeObjectId: newId('ko'),
    version: 1,
    previousVersionId: input.affectsPriorEntryId ?? null,
    entryType: 'confessional_update',
    expertName: program.expertName,
    profession: program.profession,
    companyId: program.companyId,
    profileId: program.profileId,
    knowledgeArea: 'Continuing Education',
    statement: input.summary || input.transcript.slice(0, 500),
    structuredType: 'confessional',
    condition: input.universal ? 'Universal' : 'Context-dependent',
    action: input.summary,
    purpose: 'Knowledge Confessional update',
    lifecycleStatus: input.visibility === 'private_draft' ? 'draft' : 'expert_reviewed',
    visibility: input.visibility ?? 'expert_only',
    freshnessStatus: 'current',
    trainingStatus: 'not_eligible',
    workerConfidenceImpact: null,
    source: {
      sessionId: 'confessional',
      answerId: newId('conf-answer'),
      questionId: 'confessional',
      questionText: 'Knowledge Confessional',
      videoTimestampMs: null,
      mediaRef: null,
      transcript: input.transcript,
      correctedTranscript: null,
      aiInterpretation: input.summary,
      expertApprovedAt: input.visibility !== 'private_draft' ? now : null,
      ownerApprovedAt: null,
    },
    expertCorrection: null,
    ownerNotes: null,
    scenarioTestStatus: input.requiresOwnerApproval ? 'required' : 'none',
    effectiveFrom: input.changeEffectiveDate ?? now,
    effectiveUntil: null,
    reviewDueAt: null,
    jurisdiction: input.jurisdiction ?? null,
    industryContext: program.profession,
    softwareContext: null,
    createdAt: now,
    updatedAt: now,
    submittedForOwnerReviewAt: null,
  };

  let next: KnowledgeProgram = {
    ...program,
    entries: [...program.entries, entry],
    versions: [...program.versions, createVersionRecord(entry, program.expertName, 'Knowledge Confessional entry')],
    notifications:
      input.visibility !== 'private_draft'
        ? [
            ...program.notifications,
            {
              id: newId('notify'),
              type: 'confessional_update',
              title: 'Expert recorded a Knowledge Confessional update',
              summary: input.summary.slice(0, 200),
              relatedEntryIds: [entry.id],
              relatedPacketId: null,
              read: false,
              createdAt: now,
            },
          ]
        : program.notifications,
    updatedAt: now,
  };

  if (input.affectsPriorEntryId) {
    next.entries = next.entries.map((e) =>
      e.id === input.affectsPriorEntryId
        ? { ...e, freshnessStatus: 'potentially_outdated' as const, updatedAt: now }
        : e
    );
  }

  next = rebuildTrainingPackets(next);
  next = rebuildCompetencies(next);
  return next;
}

export const CONFESSIONAL_PROMPTS = [
  'What changed?',
  'What prior instruction does this affect?',
  'When did the change become effective?',
  'Does this apply universally or only in certain situations?',
  'Which jurisdiction, client type, or software version is affected?',
  'Should the old knowledge be replaced, restricted, or retired?',
  'Does this require owner approval?',
];
