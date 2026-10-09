import type {
  ApprenticeshipSession,
  ObservationEvent,
  PracticeStep,
  ProposedStep,
  WorkspaceChangeRequest,
} from './types';

const LIVE_ACTIONS = new Set([
  'submit_filing',
  'take_payment',
  'move_money',
  'notify_customer',
  'edit_production_record',
  'change_account',
  'call_external_api',
  'deploy',
]);

export function createSession(input: {
  id: string;
  organizationId: string;
  workflowId: string;
  baseline: PracticeStep[];
}): ApprenticeshipSession {
  return {
    id: input.id,
    organizationId: input.organizationId,
    workflowId: input.workflowId,
    mode: 'show_me',
    beat: 'demonstration',
    presence: 'workspace_presenter',
    expression: 'spotlight',
    control: 'guide',
    baseline: sortSteps(input.baseline),
    proposed: input.baseline.map(asProposed),
    events: [],
    knowledgeStatus: 'draft',
    clarificationRequired: false,
    workerAuthorized: false,
    executionAuthorized: false,
    trainingPublished: false,
    simulated: true,
  };
}

export function showMe(session: ApprenticeshipSession): ApprenticeshipSession {
  return { ...session, mode: 'show_me', beat: 'demonstration', control: 'guide', expression: 'spotlight' };
}

export function letMeTakeOver(session: ApprenticeshipSession): ApprenticeshipSession {
  return {
    ...session,
    mode: 'let_me_take_over',
    beat: 'takeover',
    control: 'expert',
    expression: 'aside',
    presence: 'workspace_presenter',
  };
}

export function recordEvent(session: ApprenticeshipSession, event: ObservationEvent): ApprenticeshipSession {
  if (session.control !== 'expert') return session;
  if (!event.simulated) return session;
  const events = [...session.events, event];
  return interpret({ ...session, events, beat: 'observation' });
}

export function interpret(session: ApprenticeshipSession): ApprenticeshipSession {
  const reorders = session.events.filter((event) => event.kind === 'reordered_step');
  let proposed = session.baseline.map(asProposed);
  for (const event of reorders) {
    if (event.fromOrder == null || event.toOrder == null) continue;
    proposed = moveOrder(proposed, event.fromOrder, event.toOrder);
    const reason = reasonFor(session.events, event.id);
    proposed = proposed.map((step) =>
      step.order === event.toOrder ? { ...step, reason, unexplained: !reason } : step,
    );
  }
  const unexplained = proposed.some((step) => step.unexplained && step.order !== baselineOrder(session, step.id));
  return {
    ...session,
    proposed: sortProposed(proposed),
    beat: 'interpretation',
    knowledgeStatus: unexplained ? 'needs_clarification' : 'interpreted',
    clarificationRequired: unexplained,
    workerAuthorized: false,
    executionAuthorized: false,
    trainingPublished: false,
  };
}

export function tryMyWay(session: ApprenticeshipSession): ApprenticeshipSession | { blocked: 'clarification_required' } {
  if (session.clarificationRequired || session.knowledgeStatus === 'needs_clarification') {
    return { blocked: 'clarification_required' };
  }
  if (session.knowledgeStatus !== 'interpreted' && session.knowledgeStatus !== 'expert_reviewed') {
    return { blocked: 'clarification_required' };
  }
  return {
    ...session,
    mode: 'try_it_my_way',
    beat: 'replay',
    control: 'guide',
    expression: 'spotlight',
  };
}

export function expertConfirm(session: ApprenticeshipSession, answer: 'yes' | 'almost' | 'no'): ApprenticeshipSession {
  if (answer === 'yes') {
    if (session.beat !== 'replay') return session;
    return { ...session, beat: 'confirmation', knowledgeStatus: 'expert_reviewed', clarificationRequired: false };
  }
  if (answer === 'almost') {
    return letMeTakeOver({ ...session, knowledgeStatus: 'needs_clarification', clarificationRequired: true });
  }
  return {
    ...createSession(session),
    id: session.id,
    events: [],
    knowledgeStatus: 'draft',
  };
}

export function submitForOwnerReview(session: ApprenticeshipSession): ApprenticeshipSession {
  if (session.knowledgeStatus !== 'expert_reviewed') return session;
  return { ...session, beat: 'completion', knowledgeStatus: 'expert_reviewed' };
}

export function ownerApprove(session: ApprenticeshipSession): ApprenticeshipSession {
  if (session.knowledgeStatus !== 'expert_reviewed') return session;
  return {
    ...session,
    knowledgeStatus: 'owner_visible',
    workerAuthorized: false,
    executionAuthorized: false,
    trainingPublished: false,
  };
}

export function publishTraining(session: ApprenticeshipSession): ApprenticeshipSession {
  if (session.knowledgeStatus !== 'owner_visible') return session;
  return { ...session, knowledgeStatus: 'approved_for_training', trainingPublished: true, workerAuthorized: false, executionAuthorized: false };
}

export function attemptLiveAction(action: string): { allowed: false; simulated: true; reason: string } {
  if (LIVE_ACTIONS.has(action) || action.length > 0) {
    return { allowed: false, simulated: true, reason: 'Practice mode cannot perform a live business action.' };
  }
  return { allowed: false, simulated: true, reason: 'Practice mode cannot perform a live business action.' };
}

export function workspaceFinding(session: ApprenticeshipSession): WorkspaceChangeRequest | null {
  const surfaces = new Set(session.proposed.map((step) => step.surfaceId));
  if (surfaces.size < 2) return null;
  return {
    id: `change-${session.id}`,
    organizationId: session.organizationId,
    finding: 'Checks the expert treated as one sequence are split across more than one surface.',
    opportunity: 'Consider a consolidated review panel. This is a request, not a product change.',
    status: 'founder_review',
    appliedToProduction: false,
  };
}

export function blocksLegalRemoval(session: ApprenticeshipSession, stepId: string): boolean {
  const step = session.baseline.find((item) => item.id === stepId);
  return step?.requirement === 'legal_requirement';
}

function asProposed(step: PracticeStep): ProposedStep {
  return { ...step, reason: null, unexplained: false };
}

function sortSteps(steps: PracticeStep[]): PracticeStep[] {
  return [...steps].sort((a, b) => a.order - b.order);
}

function sortProposed(steps: ProposedStep[]): ProposedStep[] {
  return [...steps].sort((a, b) => a.order - b.order).map((step, index) => ({ ...step, order: index + 1 }));
}

function moveOrder(steps: ProposedStep[], fromOrder: number, toOrder: number): ProposedStep[] {
  const list = sortProposed(steps);
  const from = list.findIndex((step) => step.order === fromOrder);
  if (from < 0) return list;
  const [item] = list.splice(from, 1);
  const target = Math.max(0, Math.min(list.length, toOrder - 1));
  list.splice(target, 0, item);
  return list.map((step, index) => ({ ...step, order: index + 1 }));
}

function reasonFor(events: ObservationEvent[], eventId: string): string | null {
  const notes = events.filter((event) => event.kind === 'explained_why' && event.aboutEventId === eventId && event.reason?.trim());
  return notes[notes.length - 1]?.reason?.trim() || null;
}

function baselineOrder(session: ApprenticeshipSession, stepId: string): number {
  return session.baseline.find((step) => step.id === stepId)?.order ?? -1;
}
