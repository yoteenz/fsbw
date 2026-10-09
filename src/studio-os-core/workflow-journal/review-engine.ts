import type { JournalDocument, JournalStep, PrivateNote, WorkflowMapDraft, WorkflowMapNode } from './types';

function nowIso(): string {
  return new Date().toISOString();
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export function applyMutation(doc: JournalDocument, mutationId: string, mutate: (draft: JournalDocument) => void): JournalDocument {
  if (doc.appliedMutationIds.includes(mutationId)) return doc;
  const next = clone(doc);
  mutate(next);
  next.appliedMutationIds = [...next.appliedMutationIds, mutationId];
  next.updatedAt = nowIso();
  if (next.lifecycle === 'researched') next.lifecycle = 'expert_review';
  if (next.map.status !== 'approved') next.map = buildProposedMap(next);
  next.workerUseGranted = false;
  return next;
}

export function confirmStep(doc: JournalDocument, stepId: string, mutationId: string): JournalDocument {
  return applyMutation(doc, mutationId, (draft) => {
    const step = draft.steps.find((item) => item.id === stepId);
    if (!step || step.disposition === 'removed') return;
    step.disposition = 'confirmed';
    step.confirmedWording = step.proposedWording ?? step.researchedWording;
    step.layer = 'company';
    step.visibility = 'company_standard';
  });
}

export function markNotApplicable(doc: JournalDocument, stepId: string, mutationId: string): JournalDocument {
  return applyMutation(doc, mutationId, (draft) => {
    const step = draft.steps.find((item) => item.id === stepId);
    if (!step) return;
    step.disposition = 'not_applicable';
    step.confirmedWording = null;
  });
}

export function proposeDifferentWording(doc: JournalDocument, stepId: string, expertResponse: string, mutationId: string): JournalDocument {
  const cleaned = expertResponse.trim();
  return applyMutation(doc, mutationId, (draft) => {
    const step = draft.steps.find((item) => item.id === stepId);
    if (!step || !cleaned) return;
    step.disposition = 'different';
    step.expertResponse = cleaned;
    step.proposedWording = cleaned;
    step.confirmedWording = null;
    step.layer = 'company';
    draft.lifecycle = 'needs_correction';
  });
}

export function confirmProposedWording(doc: JournalDocument, stepId: string, mutationId: string): JournalDocument {
  return applyMutation(doc, mutationId, (draft) => {
    const step = draft.steps.find((item) => item.id === stepId);
    if (!step || !step.proposedWording) return;
    step.confirmedWording = step.proposedWording;
    step.disposition = 'confirmed';
    if (draft.lifecycle === 'needs_correction') draft.lifecycle = 'expert_review';
  });
}

export function removeStep(doc: JournalDocument, stepId: string, mutationId: string): JournalDocument {
  return applyMutation(doc, mutationId, (draft) => {
    const step = draft.steps.find((item) => item.id === stepId);
    if (!step) return;
    step.disposition = 'removed';
    step.confirmedWording = null;
  });
}

export function moveStep(doc: JournalDocument, stepId: string, direction: -1 | 1, mutationId: string): JournalDocument {
  return applyMutation(doc, mutationId, (draft) => {
    const visible = draft.steps.filter((step) => step.disposition !== 'removed').sort((a, b) => a.order - b.order);
    const index = visible.findIndex((step) => step.id === stepId);
    const swap = visible[index + direction];
    const current = visible[index];
    if (!current || !swap) return;
    const order = current.order;
    current.order = swap.order;
    swap.order = order;
  });
}

export function addStep(doc: JournalDocument, title: string, wording: string, mutationId: string): JournalDocument {
  return applyMutation(doc, mutationId, (draft) => {
    const order = Math.max(0, ...draft.steps.map((step) => step.order)) + 1;
    draft.steps.push({
      id: `added-${mutationId}`,
      order,
      title: title.trim() || 'Added step',
      researchedWording: '',
      proposedWording: wording.trim(),
      confirmedWording: null,
      expertResponse: wording.trim(),
      kind: 'action',
      disposition: 'different',
      layer: 'company',
      visibility: 'company_standard',
      requirementClass: 'organization_specific',
      sourceIds: [],
      approvalRequired: false,
      neverAutomate: false,
      guidanceMayHaveChanged: false,
    });
  });
}

export function addPrivateNote(doc: JournalDocument, body: string, visibility: PrivateNote['visibility'], mutationId: string): JournalDocument {
  const cleaned = body.trim();
  return applyMutation(doc, mutationId, (draft) => {
    if (!cleaned) return;
    draft.privateNotes.push({
      id: `note-${mutationId}`,
      workflowId: draft.workflowId,
      body: cleaned,
      visibility,
      layer: 'private',
      confirmed: false,
    });
  });
}

export function confirmPrivateNote(doc: JournalDocument, noteId: string, mutationId: string): JournalDocument {
  return applyMutation(doc, mutationId, (draft) => {
    const note = draft.privateNotes.find((item) => item.id === noteId);
    if (!note) return;
    note.confirmed = true;
  });
}

export function expertConfirmJournal(doc: JournalDocument, mutationId: string): JournalDocument {
  return applyMutation(doc, mutationId, (draft) => {
    const open = draft.steps.some((step) => step.disposition === 'different' && !step.confirmedWording);
    draft.lifecycle = open ? 'needs_correction' : 'expert_confirmed';
  });
}

export function ownerApproveJournal(doc: JournalDocument, mutationId: string): JournalDocument {
  return applyMutation(doc, mutationId, (draft) => {
    if (draft.lifecycle !== 'expert_confirmed') return;
    draft.lifecycle = 'owner_approved';
    draft.map = { ...buildProposedMap(draft), status: 'approved', executable: false };
    draft.workerUseGranted = false;
  });
}

export function activeSteps(doc: JournalDocument): JournalStep[] {
  return doc.steps.filter((step) => step.disposition !== 'removed').sort((a, b) => a.order - b.order);
}

export function buildProposedMap(doc: JournalDocument): WorkflowMapDraft {
  const nodes: WorkflowMapNode[] = activeSteps(doc).map((step) => ({
    id: `node-${step.id}`,
    engineNodeType: engineNodeFor(step),
    label: step.confirmedWording ?? step.proposedWording ?? step.researchedWording,
    kind: step.kind,
    sourceStepId: step.id,
  }));
  return { status: 'proposed', executable: false, nodes };
}

function engineNodeFor(step: JournalStep): WorkflowMapNode['engineNodeType'] {
  if (step.kind === 'trigger') return 'trigger';
  if (step.kind === 'decision' || step.kind === 'exception') return 'decision';
  if (step.kind === 'approval' || step.approvalRequired) return 'approval';
  if (step.kind === 'completion') return 'end';
  return 'document-creation';
}

export function structureNarrative(text: string): Array<{ title: string; wording: string }> {
  const parts = text
    .split(/\n+|(?<=[.!?])\s+/)
    .map((part) => part.trim())
    .filter((part) => part.length > 8)
    .slice(0, 12);
  return parts.map((wording, index) => ({
    title: `Described step ${index + 1}`,
    wording,
  }));
}

const TEXT_EXTENSIONS = new Set(['txt', 'md', 'text']);

export function extractStepsFromFile(filename: string, text: string): { ok: true; steps: Array<{ title: string; wording: string }> } | { ok: false; reason: string } {
  const extension = filename.split('.').pop()?.toLowerCase() ?? '';
  if (!TEXT_EXTENSIONS.has(extension)) {
    return {
      ok: false,
      reason: 'This pilot reads .txt and .md checklists only. PDF, Word, and images are not extracted.',
    };
  }
  const lines = text
    .split(/\n+/)
    .map((line) => line.replace(/^(\d+[.)]|[-*])\s*/, '').trim())
    .filter((line) => line.length > 3 && !line.startsWith('#'))
    .slice(0, 20);
  if (!lines.length) return { ok: false, reason: 'No steps were found in that file.' };
  return {
    ok: true,
    steps: lines.map((wording, index) => ({ title: `File step ${index + 1}`, wording })),
  };
}

export function isApprovedProcedure(step: JournalStep, lifecycle: JournalDocument['lifecycle']): boolean {
  return lifecycle === 'owner_approved' && step.disposition === 'confirmed' && Boolean(step.confirmedWording);
}
