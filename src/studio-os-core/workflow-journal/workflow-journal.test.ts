import { describe, expect, it } from 'vitest';
import { createOperatingAuthorityDraft } from './aio/profile';
import { mirrorAllowsWorkerTraining, toKnowledgeMirrorStatus } from './lifecycle';
import { canPerform } from './permissions';
import { deviceSaveReceipt } from './persistence';
import { SERVICE_LIBRARY } from './research/service-library';
import { RESEARCH_SOURCES } from './research/sources';
import {
  confirmProposedWording,
  confirmStep,
  expertConfirmJournal,
  extractStepsFromFile,
  isApprovedProcedure,
  moveStep,
  ownerApproveJournal,
  proposeDifferentWording,
  structureNarrative,
} from './review-engine';
import { createMemory, openJournal, putInvite, readNotesForOrganization, revokeInvite, saveJournal } from './server';
import type { JournalReader } from './types';

const NOW = '2026-10-09T12:00:00.000Z';

function reader(organizationId: string, role: JournalReader['role']): JournalReader {
  return { organizationId, role, inviteId: null };
}

describe('workflow journal pilot', () => {
  it('keeps researched wording when the expert corrects a step', () => {
    let doc = createOperatingAuthorityDraft(NOW);
    doc = proposeDifferentWording(doc, 'oa-identity', 'I check that every name and address matches before I prepare anything.', 'm1');
    const step = doc.steps.find((item) => item.id === 'oa-identity');
    expect(step?.researchedWording).toContain('legal name');
    expect(step?.expertResponse).toContain('every name');
    expect(step?.confirmedWording).toBeNull();
    expect(step?.sourceIds).toContain('fmcsa-operating-authority');
    expect(isApprovedProcedure(step!, doc.lifecycle)).toBe(false);
    doc = confirmProposedWording(doc, 'oa-identity', 'm2');
    expect(doc.steps.find((item) => item.id === 'oa-identity')?.confirmedWording).toContain('every name');
    expect(doc.steps.find((item) => item.id === 'oa-identity')?.researchedWording).toContain('legal name');
  });

  it('does not treat owner approval as worker activation', () => {
    let doc = createOperatingAuthorityDraft(NOW);
    for (const step of doc.steps) {
      doc = confirmStep(doc, step.id, `confirm-${step.id}`);
    }
    doc = expertConfirmJournal(doc, 'expert-ok');
    expect(doc.lifecycle).toBe('expert_confirmed');
    doc = ownerApproveJournal(doc, 'owner-ok');
    expect(doc.lifecycle).toBe('owner_approved');
    expect(doc.workerUseGranted).toBe(false);
    expect(doc.map.status).toBe('approved');
    expect(doc.map.executable).toBe(false);
    expect(toKnowledgeMirrorStatus(doc.lifecycle)).toBe('owner_visible');
    expect(mirrorAllowsWorkerTraining(doc.lifecycle, doc.workerUseGranted)).toBe(false);
    expect(isApprovedProcedure(doc.steps[0], doc.lifecycle)).toBe(true);
  });

  it('ignores a duplicate mutation', () => {
    let doc = createOperatingAuthorityDraft(NOW);
    const once = moveStep(doc, 'oa-usdot', -1, 'move-1');
    const twice = moveStep(once, 'oa-usdot', -1, 'move-1');
    expect(twice.steps.map((step) => step.order)).toEqual(once.steps.map((step) => step.order));
  });

  it('refuses unapproved file types and does not auto-approve a narrative', () => {
    expect(extractStepsFromFile('sop.pdf', '1. Do the thing').ok).toBe(false);
    const text = extractStepsFromFile('checklist.txt', '1. Match the names\n2. Call the insurer');
    expect(text.ok).toBe(true);
    const narrative = structureNarrative('I call the client first. Then I compare the addresses.');
    expect(narrative.length).toBe(2);
    expect(narrative[0].wording).not.toMatch(/approved procedure/i);
  });

  it('isolates private notes and revoked invites', () => {
    const memory = createMemory();
    const token = 'review-token-aio';
    putInvite(memory, {
      id: 'inv-aio',
      organizationId: 'all-in-one',
      expertLabel: 'Permitting lead',
      workflowId: 'operating-authority-application',
      token,
      expiresAt: '2026-12-01T00:00:00.000Z',
      revokedAt: null,
    });
    let doc = createOperatingAuthorityDraft(NOW);
    doc.privateNotes.push({
      id: 'note-1',
      workflowId: doc.workflowId,
      body: 'I compare the insurance address before I touch the application.',
      visibility: 'restricted_expert',
      layer: 'private',
      confirmed: true,
    });
    const saved = saveJournal({ memory, token, nowIso: NOW, document: doc });
    expect(saved.ok).toBe(true);
    expect(readNotesForOrganization(memory, reader('other-company', 'owner'))).toEqual([]);
    expect(readNotesForOrganization(memory, reader('all-in-one', 'team'))).toEqual([]);
    expect(readNotesForOrganization(memory, reader('all-in-one', 'owner'))).toHaveLength(1);
    expect(canPerform({
      reader: reader('all-in-one', 'team'),
      noteOrganizationId: 'all-in-one',
      visibility: 'restricted_expert',
      action: 'export',
      workerUseGranted: false,
      inviteRevoked: false,
    })).toBe(false);
    expect(canPerform({
      reader: reader('all-in-one', 'owner'),
      noteOrganizationId: 'all-in-one',
      visibility: 'restricted_expert',
      action: 'worker_context',
      workerUseGranted: true,
      inviteRevoked: false,
    })).toBe(false);
    expect(revokeInvite(memory, 'inv-aio', reader('all-in-one', 'owner')).ok).toBe(true);
    const opened = openJournal({ memory, token, nowIso: NOW });
    expect(opened.ok).toBe(false);
    if (!opened.ok) expect(opened.status).toBe(403);
  });

  it('covers twelve service families and does not activate brokerage', () => {
    expect(SERVICE_LIBRARY).toHaveLength(12);
    const brokerage = SERVICE_LIBRARY.find((family) => family.id === 'brokerage');
    expect(brokerage?.aioCommercialState).toBe('paused');
    expect(brokerage?.interactivePilot).toBe(false);
    expect(SERVICE_LIBRARY.filter((family) => family.interactivePilot).map((family) => family.id)).toEqual(['permitting-authorities']);
    expect(RESEARCH_SOURCES.every((source) => source.url && source.dateChecked === '2026-10-09')).toBe(true);
    expect(deviceSaveReceipt(NOW).durable).toBe(false);
  });
});
