import type { ActionPriority, NextActionRow } from './types.js';

type ProjectContext = {
  id: string;
  slug: string;
  name: string;
  current_phase: string;
  payment_state: string;
  provisioning_state: string;
};

type DeliverableCtx = {
  deliverable_key: string;
  title: string;
  status: string;
  blocked_by: string[];
};

type AccessCtx = {
  provider_key: string;
  display_name: string;
  connection_state: string;
  required_phase: string;
};

type FeedbackCtx = { id: string; body: string };

export function computeNextActions(input: {
  project: ProjectContext;
  deliverables: DeliverableCtx[];
  access: AccessCtx[];
  pendingApprovals: number;
  feedback: FeedbackCtx[];
}): Omit<NextActionRow, 'id' | 'created_at' | 'resolved_at'>[] {
  const actions: Omit<NextActionRow, 'id' | 'created_at' | 'resolved_at'>[] = [];
  const base = `/admin/site00/projects/${input.project.id}`;

  const homepage = input.deliverables.find((d) => d.deliverable_key === 'homepage_visual_direction');
  if (homepage && (homepage.status === 'READY' || homepage.status === 'NOT_READY') && homepage.blocked_by.length === 0) {
    actions.push({
      project_id: input.project.id,
      action_type: 'GENERATE_BRIEF',
      priority: 'HIGH',
      title: 'HOMEPAGE ART DIRECTION CAN NOW BE GENERATED.',
      reason: 'DEPENDENCIES FOR HOMEPAGE ART DIRECTION ARE SATISFIED.',
      dependency: 'SITEMAP APPROVED',
      destination: `${base}/studio`,
      metadata: { deliverableKey: 'homepage_visual_direction' },
    });
  }

  for (const fb of input.feedback) {
    actions.push({
      project_id: input.project.id,
      action_type: 'REVIEW_FEEDBACK',
      priority: 'HIGH',
      title: 'CLIENT FEEDBACK RECEIVED.',
      reason: fb.body.slice(0, 120).toUpperCase(),
      dependency: null,
      destination: `${base}/approvals`,
      metadata: { feedbackId: fb.id },
    });
  }

  const mobile = input.deliverables.find((d) => d.deliverable_key === 'mobile_adaptation');
  const desktopApproved = homepage?.status === 'APPROVED' || homepage?.status === 'CLIENT_APPROVED';
  if (mobile?.status === 'BLOCKED' && !desktopApproved) {
    actions.push({
      project_id: input.project.id,
      action_type: 'REVIEW_DESKTOP',
      priority: 'MEDIUM',
      title: 'MOBILE ADAPTATION BLOCKED BY DESKTOP APPROVAL.',
      reason: 'DESKTOP HOMEPAGE DIRECTION MUST BE APPROVED FIRST.',
      dependency: 'HOMEPAGE VISUAL DIRECTION',
      destination: `${base}/approvals`,
      metadata: { deliverableKey: 'mobile_adaptation' },
    });
  }

  const supabase = input.access.find((a) => a.provider_key === 'supabase');
  if (supabase && supabase.connection_state === 'CLIENT_ACTION_REQUIRED') {
    actions.push({
      project_id: input.project.id,
      action_type: 'VIEW_ACCESS',
      priority: 'HIGH',
      title: 'BACKEND IMPLEMENTATION BLOCKED — SUPABASE ACCESS REQUIRED.',
      reason: 'CLIENT-OWNED SUPABASE CONNECTION IS REQUIRED FOR BACKEND BUILD.',
      dependency: 'SUPABASE ACCESS',
      destination: `${base}/access`,
      metadata: { serviceKey: 'supabase' },
    });
  }

  if (input.project.payment_state === 'CONFIRMED' && input.project.provisioning_state === 'NOT_STARTED') {
    actions.push({
      project_id: input.project.id,
      action_type: 'START_PROVISIONING',
      priority: 'HIGH',
      title: 'PAYMENT CONFIRMED — PROVISIONING CAN BEGIN.',
      reason: 'CLIENT PROVISIONING FLOW SHOULD BE UNLOCKED.',
      dependency: 'PAYMENT CONFIRMED',
      destination: `/project/${input.project.slug}/provisioning`,
      metadata: {},
    });
  }

  if (input.pendingApprovals > 0) {
    actions.push({
      project_id: input.project.id,
      action_type: 'REVIEW_APPROVALS',
      priority: 'MEDIUM',
      title: `${input.pendingApprovals} ITEMS WAITING FOR ADMIN DECISION.`,
      reason: 'CENTRAL APPROVAL DESK HAS PENDING REVIEWS.',
      dependency: null,
      destination: '/admin/site00/approvals',
      metadata: { count: input.pendingApprovals },
    });
  }

  return sortByPriority(actions);
}

function sortByPriority(
  actions: Omit<NextActionRow, 'id' | 'created_at' | 'resolved_at'>[],
): Omit<NextActionRow, 'id' | 'created_at' | 'resolved_at'>[] {
  const order: Record<ActionPriority, number> = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
  return [...actions].sort((a, b) => order[a.priority] - order[b.priority]);
}
