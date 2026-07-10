import { describe, expect, it } from 'vitest';
import { TAX_PREPARATION_PROFILE } from '../profiles';
import { createEmptySession, createAnswerForQuestion } from '../session-storage';
import { approveAnswerKnowledge, applyKnowledgeExtraction } from '../knowledge-extraction';
import { createEmptyProgram, submitEntryForOwnerReview } from './sync-from-session';
import { refreshProgramFromSession } from './program-orchestrator';
import { canEnterWorkerTraining } from './lifecycle';
import { createConfessionalEntry } from './confessional-service';
import {
  ownerApproveEntryForTraining,
  ownerApprovePacketForTraining,
  passScenarioTestForPacket,
  restrictAuthorization,
} from './competency-core';
import { supersedeKnowledgeEntry, markEntryOutdated, detectConflicts } from './training-packets';
import { sandboxAnswerFromApprovedKnowledge } from './owner-mirror-data';

function buildApprovedProgram() {
  const session = createEmptySession(
    {
      expertName: 'Jane Expert',
      expertRole: 'Tax Preparer',
      organizationLabel: 'Acme Tax',
    },
    TAX_PREPARATION_PROFILE
  );
  session.meta.consentAcceptedAt = new Date().toISOString();
  session.meta.startedAt = new Date().toISOString();

  const q = session.questions[0];
  let answer = createAnswerForQuestion(session, q);
  answer = {
    ...answer,
    transcript: 'Always verify W-2 against prior year before proceeding.',
    status: 'interpreted',
    confirmation: 'correct',
  };
  answer = applyKnowledgeExtraction(answer, [
    {
      type: 'workflow_step',
      statement: 'Compare W-2 to prior year return',
      condition: null,
      action: null,
      purpose: null,
      confidence: 0.9,
      needsReview: false,
      sourceTimestampMs: null,
      videoTimestampMs: null,
      conversationReference: null,
    },
  ]);
  answer = approveAnswerKnowledge(answer);
  session.answers = [answer];

  let program = createEmptyProgram({
    profileId: TAX_PREPARATION_PROFILE.id,
    companyId: TAX_PREPARATION_PROFILE.companyId,
    expertName: session.meta.expertName,
    profession: session.meta.expertRole,
    organizationLabel: session.meta.organizationLabel,
  });
  program = refreshProgramFromSession(program, session, TAX_PREPARATION_PROFILE.aiIndustryContext);
  return { program, session, answer };
}

describe('Living Knowledge Mirror scenarios', () => {
  it('1–5: partial approval, owner review, packet, sandbox untrained', () => {
    const { program, session } = buildApprovedProgram();
    const entry = program.entries[0];
    expect(entry.lifecycleStatus).toBe('expert_reviewed');
    expect(canEnterWorkerTraining('expert_reviewed')).toBe(false);

    let next = submitEntryForOwnerReview(program, entry.id);
    expect(next.notifications.some((n) => n.type === 'expert_approved')).toBe(true);

    const untrained = sandboxAnswerFromApprovedKnowledge(next, 'What have you learned so far?');
    expect(untrained.toLowerCase()).toContain('not yet');

    next = ownerApproveEntryForTraining(next, entry.id);
    next = refreshProgramFromSession(next, session, TAX_PREPARATION_PROFILE.aiIndustryContext);
    expect(next.packets.length).toBeGreaterThan(0);

    const trained = sandboxAnswerFromApprovedKnowledge(next, 'What have you learned so far?');
    expect(trained.toLowerCase()).toContain('learned');
  });

  it('6–11: supersede, refresh, restrict, scenario pass, restore auth', () => {
    let { program, session } = buildApprovedProgram();
    const entryId = program.entries[0].id;
    program = submitEntryForOwnerReview(program, entryId);
    program = ownerApproveEntryForTraining(program, entryId);
    program = refreshProgramFromSession(program, session, TAX_PREPARATION_PROFILE.aiIndustryContext);
    const packet = program.packets[0];

    program = ownerApprovePacketForTraining(program, packet.id);
    program = passScenarioTestForPacket(program, packet.id);
    expect(program.entries.find((e) => e.id === entryId)?.lifecycleStatus).toBe('active_knowledge');

    program = supersedeKnowledgeEntry(program, entryId, 'Never skip W-2 verification.', 'Expert correction', 'Jane');
    expect(program.entries.find((e) => e.id === entryId)?.lifecycleStatus).toBe('superseded');
    expect(program.packets.find((p) => p.id === packet.id)?.status).toBe('needs_refresh');

    program = restrictAuthorization(program, 'can_organize_documents', 'Pending refresh');
    expect(program.authorizations.find((a) => a.capability === 'can_organize_documents')?.granted).toBe(false);

    const newEntry = program.entries.find((e) => e.lifecycleStatus === 'expert_reviewed' && e.statement.includes('Never skip'));
    expect(newEntry).toBeDefined();
    program = ownerApproveEntryForTraining(program, newEntry!.id);
    program = passScenarioTestForPacket(program, packet.id);
    expect(program.authorizations.some((a) => a.granted)).toBe(true);
  });

  it('12–16: confessional, conflict detection, no auto-replace', () => {
    let { program } = buildApprovedProgram();
    const entryId = program.entries[0].id;
    program = submitEntryForOwnerReview(program, entryId);
    program = ownerApproveEntryForTraining(program, entryId);
    program = passScenarioTestForPacket(program, program.packets[0].id);

    program = createConfessionalEntry(program, {
      transcript: 'We never accept unsigned returns anymore.',
      summary: 'Unsigned returns policy change',
      requiresOwnerApproval: true,
    });
    expect(program.notifications.some((n) => n.type === 'confessional_update')).toBe(true);

    const area = program.entries[0].knowledgeArea;
    program.entries = program.entries.map((e) =>
      e.id === entryId ? { ...e, statement: 'Never accept unsigned returns without client consent.', lifecycleStatus: 'active_knowledge' as const } : e
    );
    program.entries.push({
      ...program.entries[0],
      id: 'ke-conflict-b',
      statement: 'Always file unsigned returns when client is traveling.',
      knowledgeArea: area,
      lifecycleStatus: 'active_knowledge',
    });
    program = detectConflicts(program);
    expect(program.conflicts.length).toBeGreaterThan(0);
    expect(program.entries.filter((e) => e.lifecycleStatus === 'active_knowledge').length).toBeGreaterThan(1);
  });

  it('17–18: private draft vs owner-visible confessional', () => {
    let { program } = buildApprovedProgram();
    const before = program.entries.length;
    program = createConfessionalEntry(program, {
      transcript: 'Private thought not ready for owner.',
      summary: 'Draft',
      visibility: 'private_draft',
    });
    expect(program.entries.length).toBe(before + 1);
    const draft = program.entries[program.entries.length - 1];
    expect(draft.visibility).toBe('private_draft');
    expect(program.notifications.filter((n) => n.type === 'confessional_update').length).toBe(0);

    program = createConfessionalEntry(program, {
      transcript: 'Published excerpt only.',
      summary: 'Published update',
      visibility: 'owner_review',
    });
    expect(program.notifications.some((n) => n.type === 'confessional_update')).toBe(true);
  });

  it('19–20: outdated flag and multi-session continuity', () => {
    let { program, session } = buildApprovedProgram();
    const entryId = program.entries[0].id;
    program = markEntryOutdated(program, entryId, 'Review date expired');
    expect(program.entries.find((e) => e.id === entryId)?.freshnessStatus).toBe('potentially_outdated');

    session.meta.id = 'session-2-continued';
    program = refreshProgramFromSession(program, session, TAX_PREPARATION_PROFILE.aiIndustryContext);
    expect(program.sessionIds).toContain('session-2-continued');
  });
});
