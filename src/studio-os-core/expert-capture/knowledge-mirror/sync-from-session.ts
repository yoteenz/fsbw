import type { ExpertCaptureAnswer, ExpertCaptureSession } from '../types';
import type { KnowledgeEntry, KnowledgeEntryType, KnowledgeProgram, KnowledgeVersion } from './types';

function newId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function mapStructuredTypeToEntryType(structuredType: string): KnowledgeEntryType {
  if (structuredType.includes('workflow')) return 'workflow_rule';
  if (structuredType.includes('decision')) return 'decision_rule';
  if (structuredType.includes('quality')) return 'quality_control_rule';
  if (structuredType.includes('exception') || structuredType.includes('edge')) return 'exception';
  return 'interview_answer';
}

function findKnowledgeArea(session: ExpertCaptureSession, questionId: string): string {
  return session.questions.find((q) => q.id === questionId)?.category ?? 'General';
}

export function buildProgramId(profileId: string, companyId: string, expertName: string): string {
  const slug = `${profileId}::${companyId}::${expertName.trim().toLowerCase()}`.replace(/\s+/g, '-');
  return `program-${slug.slice(0, 120)}`;
}

export function createEmptyProgram(input: {
  profileId: string;
  companyId: string;
  expertName: string;
  profession: string;
  organizationLabel: string;
}): KnowledgeProgram {
  const now = new Date().toISOString();
  return {
    programId: buildProgramId(input.profileId, input.companyId, input.expertName),
    profileId: input.profileId,
    companyId: input.companyId,
    expertName: input.expertName,
    profession: input.profession,
    organizationLabel: input.organizationLabel,
    sessionIds: [],
    entries: [],
    versions: [],
    packets: [],
    competencies: [],
    authorizations: [],
    scenarioTests: [],
    continuingEducation: [],
    ownerReviews: [],
    conflicts: [],
    notifications: [],
    createdAt: now,
    updatedAt: now,
  };
}

export function syncSessionToProgram(
  program: KnowledgeProgram,
  session: ExpertCaptureSession,
  industryContext: string
): KnowledgeProgram {
  const now = new Date().toISOString();
  const sessionIds = program.sessionIds.includes(session.meta.id)
    ? program.sessionIds
    : [...program.sessionIds, session.meta.id];

  const activeAnswers = session.answers.filter((a) => !a.deleted && !a.skipped);

  for (const answer of activeAnswers) {
    syncAnswerEntries(program, session, answer, industryContext, now);
  }

  return { ...program, sessionIds, updatedAt: now };
}

function syncAnswerEntries(
  program: KnowledgeProgram,
  session: ExpertCaptureSession,
  answer: ExpertCaptureAnswer,
  industryContext: string,
  now: string
): void {
  const knowledgeArea = findKnowledgeArea(session, answer.questionId);
  const transcript = answer.correctedTranscript ?? answer.transcript;

  if (answer.knowledgeItems.length === 0 && transcript && answer.status === 'approved') {
    upsertEntry(program, {
      answer,
      session,
      knowledgeArea,
      industryContext,
      statement: answer.aiUnderstanding ?? transcript.slice(0, 500),
      structuredType: 'principle',
      itemId: `${answer.id}-summary`,
      now,
    });
    return;
  }

  for (const item of answer.knowledgeItems) {
    if (item.status === 'deleted' || item.status === 'rejected') continue;
    upsertEntry(program, {
      answer,
      session,
      knowledgeArea,
      industryContext,
      statement: item.statement,
      structuredType: item.type,
      itemId: item.id,
      itemStatus: item.status,
      now,
    });
  }
}

function upsertEntry(
  program: KnowledgeProgram,
  ctx: {
    answer: ExpertCaptureAnswer;
    session: ExpertCaptureSession;
    knowledgeArea: string;
    industryContext: string;
    statement: string;
    structuredType: string;
    itemId: string;
    itemStatus?: string;
    now: string;
  }
): void {
  const existingIdx = program.entries.findIndex(
    (e) => e.source.answerId === ctx.answer.id && e.source.sessionId === ctx.session.meta.id && e.id.endsWith(ctx.itemId)
  );

  const knowledgeObjectId = `ko-${ctx.session.meta.profileId}-${ctx.itemId}`;
  const lifecycleStatus = mapAnswerStatusToLifecycle(ctx.answer, ctx.itemStatus);
  const visibility =
    lifecycleStatus === 'expert_reviewed' || lifecycleStatus === 'owner_visible'
      ? 'owner_review'
      : lifecycleStatus === 'approved_for_training' || lifecycleStatus === 'active_knowledge'
        ? 'approved_training'
        : 'expert_only';

  const entry: KnowledgeEntry = {
    id: existingIdx >= 0 ? program.entries[existingIdx].id : newId('ke'),
    knowledgeObjectId,
    version: existingIdx >= 0 ? program.entries[existingIdx].version : 1,
    previousVersionId: existingIdx >= 0 ? program.entries[existingIdx].id : null,
    entryType: ctx.answer.followUpOf ? 'follow_up_answer' : mapStructuredTypeToEntryType(ctx.structuredType),
    expertName: ctx.session.meta.expertName,
    profession: ctx.session.meta.expertRole,
    companyId: program.companyId,
    profileId: ctx.session.meta.profileId,
    knowledgeArea: ctx.knowledgeArea,
    statement: ctx.statement,
    structuredType: ctx.structuredType,
    condition: null,
    action: null,
    purpose: null,
    lifecycleStatus,
    visibility,
    freshnessStatus: 'current',
    trainingStatus: lifecycleStatus === 'approved_for_training' || lifecycleStatus === 'active_knowledge' ? 'in_packet' : 'not_eligible',
    workerConfidenceImpact: null,
    source: {
      sessionId: ctx.session.meta.id,
      answerId: ctx.answer.id,
      questionId: ctx.answer.questionId,
      questionText: ctx.answer.questionText,
      videoTimestampMs: null,
      mediaRef: ctx.answer.media.videoBlobId,
      transcript: ctx.answer.transcript,
      correctedTranscript: ctx.answer.correctedTranscript,
      aiInterpretation: ctx.answer.aiUnderstanding,
      expertApprovedAt: ctx.answer.status === 'approved' ? ctx.now : null,
      ownerApprovedAt: null,
    },
    expertCorrection: ctx.answer.clarificationNotes,
    ownerNotes: null,
    scenarioTestStatus: 'none',
    effectiveFrom: ctx.now,
    effectiveUntil: null,
    reviewDueAt: null,
    jurisdiction: null,
    industryContext: ctx.industryContext,
    softwareContext: null,
    createdAt: existingIdx >= 0 ? program.entries[existingIdx].createdAt : ctx.now,
    updatedAt: ctx.now,
    submittedForOwnerReviewAt:
      lifecycleStatus === 'owner_visible' ? ctx.now : program.entries[existingIdx]?.submittedForOwnerReviewAt ?? null,
  };

  if (existingIdx >= 0) {
    program.entries[existingIdx] = entry;
  } else {
    program.entries.push(entry);
    program.versions.push(createVersionRecord(entry, ctx.session.meta.expertName, 'Initial capture from interview'));
  }
}

function mapAnswerStatusToLifecycle(answer: ExpertCaptureAnswer, itemStatus?: string): KnowledgeEntry['lifecycleStatus'] {
  if (answer.deleted) return 'deleted';
  if (answer.status === 'rejected' || itemStatus === 'rejected') return 'rejected';
  if (answer.status === 'needs_clarification') return 'needs_clarification';
  if (answer.status === 'approved' || itemStatus === 'approved') return 'expert_reviewed';
  if (answer.status === 'interpreted' || answer.confirmation) return 'interpreted';
  if (answer.transcript) return 'transcribed';
  return 'recorded';
}

export function createVersionRecord(
  entry: KnowledgeEntry,
  createdBy: string,
  changeSummary: string,
  reasonForChange = 'Knowledge capture'
): KnowledgeVersion {
  return {
    id: newId('kv'),
    knowledgeObjectId: entry.knowledgeObjectId,
    version: entry.version,
    previousVersionId: entry.previousVersionId,
    supersedesVersionId: null,
    entryId: entry.id,
    status: entry.lifecycleStatus,
    effectiveFrom: entry.effectiveFrom,
    effectiveUntil: entry.effectiveUntil,
    createdBy,
    approvedByExpert: entry.source.expertApprovedAt ? createdBy : null,
    approvedByOwner: entry.source.ownerApprovedAt,
    sourceSessionId: entry.source.sessionId,
    reasonForChange,
    changeSummary,
    jurisdiction: entry.jurisdiction,
    industryContext: entry.industryContext,
    softwareContext: entry.softwareContext,
    reviewDueAt: entry.reviewDueAt,
    createdAt: entry.updatedAt,
  };
}

export function submitEntryForOwnerReview(program: KnowledgeProgram, entryId: string): KnowledgeProgram {
  const now = new Date().toISOString();
  const entries = program.entries.map((e) =>
    e.id === entryId && (e.lifecycleStatus === 'expert_reviewed' || e.lifecycleStatus === 'interpreted')
      ? {
          ...e,
          lifecycleStatus: 'owner_visible' as const,
          visibility: 'owner_review' as const,
          submittedForOwnerReviewAt: now,
          updatedAt: now,
        }
      : e
  );
  const notifications = [
    ...program.notifications,
    {
      id: newId('notify'),
      type: 'expert_approved' as const,
      title: 'New knowledge submitted for review',
      summary: `Expert submitted knowledge in ${entries.find((e) => e.id === entryId)?.knowledgeArea ?? 'an area'} for owner review.`,
      relatedEntryIds: [entryId],
      relatedPacketId: null,
      read: false,
      createdAt: now,
    },
  ];
  return { ...program, entries, notifications, updatedAt: now };
}

export function submitAllExpertApprovedForOwnerReview(program: KnowledgeProgram): KnowledgeProgram {
  let next = program;
  for (const entry of program.entries.filter((e) => e.lifecycleStatus === 'expert_reviewed')) {
    next = submitEntryForOwnerReview(next, entry.id);
  }
  return next;
}
