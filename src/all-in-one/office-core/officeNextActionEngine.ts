import type { OfficeNextAction } from './officeWorkTypes';
import type { RawOfficeAttentionCandidate } from './officeAttentionEngine';
import type { OfficeWorkItemView } from './officeWorkTypes';
import { aioPaths } from '../utils/paths';

const PRIORITY_ORDER: Record<string, number> = {
  urgent: 4,
  high: 3,
  normal: 2,
  low: 1,
};

/**
 * Staff next-action precedence:
 * 1. Overdue assigned work (waiting on All In One)
 * 2. Customer waiting on us (document review, message)
 * 3. Due today assigned work
 * 4. Ready for review
 * 5. Insurance/renewal urgent window
 * 6. Unassigned high priority (managers only)
 */
export function selectOfficeNextAction(
  myWork: OfficeWorkItemView[],
  candidates: RawOfficeAttentionCandidate[],
  isManager: boolean,
): OfficeNextAction | undefined {
  const active = myWork.filter((w) => w.status !== 'completed' && w.status !== 'cancelled');

  const overdueAio = active
    .filter((w) => w.isOverdue && w.waitingOn === 'all_in_one')
    .sort((a, b) => PRIORITY_ORDER[b.priority] - PRIORITY_ORDER[a.priority]);
  if (overdueAio[0]) {
    const w = overdueAio[0];
    return {
      priority: w.priority,
      title: w.title,
      description: w.description ?? `Overdue — ${w.organizationName} is waiting on All In One.`,
      ctaLabel: 'OPEN WORK',
      ctaHref: w.ctaHref,
      workItemId: w.id,
      organizationName: w.organizationName,
      reason: 'OVERDUE · CUSTOMER WAITING',
    };
  }

  const docReview = active.filter((w) => w.workType === 'document_review' && w.waitingOn === 'all_in_one');
  if (docReview[0]) {
    const w = docReview[0];
    return {
      priority: w.priority,
      title: w.title,
      description: w.description ?? 'Document received — review needed.',
      ctaLabel: 'REVIEW DOCUMENT',
      ctaHref: w.ctaHref,
      workItemId: w.id,
      organizationName: w.organizationName,
      reason: 'DOCUMENT RECEIVED',
    };
  }

  const dueToday = active
    .filter((w) => w.dueAt && w.dueAt.slice(0, 10) === new Date().toISOString().slice(0, 10))
    .sort((a, b) => PRIORITY_ORDER[b.priority] - PRIORITY_ORDER[a.priority]);
  if (dueToday[0]) {
    const w = dueToday[0];
    return {
      priority: w.priority,
      title: w.title,
      description: w.description ?? `Due today for ${w.organizationName}.`,
      ctaLabel: 'OPEN WORK',
      ctaHref: w.ctaHref,
      workItemId: w.id,
      organizationName: w.organizationName,
      reason: 'DUE TODAY',
    };
  }

  const readyReview = active.filter((w) => w.status === 'ready_for_review');
  if (readyReview[0]) {
    const w = readyReview[0];
    return {
      priority: w.priority,
      title: w.title,
      description: w.description ?? 'Ready for your review.',
      ctaLabel: 'REVIEW',
      ctaHref: w.ctaHref,
      workItemId: w.id,
      organizationName: w.organizationName,
      reason: 'READY FOR REVIEW',
    };
  }

  const insuranceUrgent = candidates.find(
    (c) => c.dedupeKey.startsWith('insurance-expiry:') && (c.priority === 'urgent' || c.priority === 'high'),
  );
  if (insuranceUrgent) {
    return {
      priority: insuranceUrgent.priority,
      title: insuranceUrgent.title,
      description: insuranceUrgent.explanation,
      ctaLabel: insuranceUrgent.ctaLabel,
      ctaHref: insuranceUrgent.ctaHref,
      organizationName: insuranceUrgent.organizationName,
      reason: insuranceUrgent.statusLabel,
    };
  }

  if (isManager) {
    const unassigned = candidates.find((c) => c.waitingOn === 'all_in_one' && c.priority !== 'low');
    if (unassigned) {
      return {
        priority: unassigned.priority,
        title: unassigned.title,
        description: unassigned.explanation,
        ctaLabel: 'VIEW UNASSIGNED',
        ctaHref: aioPaths.officeQueues,
        organizationName: unassigned.organizationName,
        reason: 'UNASSIGNED WORK',
      };
    }
  }

  const top = active.sort((a, b) => PRIORITY_ORDER[b.priority] - PRIORITY_ORDER[a.priority])[0];
  if (top) {
    return {
      priority: top.priority,
      title: top.title,
      description: top.description ?? top.statusLabel,
      ctaLabel: 'OPEN WORK',
      ctaHref: top.ctaHref,
      workItemId: top.id,
      organizationName: top.organizationName,
      reason: top.statusLabel.toUpperCase(),
    };
  }

  return undefined;
}

export function transitionApprovalStatus(
  status: 'pending' | 'approved' | 'rejected' | 'cancelled' | 'expired',
  next: 'pending' | 'approved' | 'rejected' | 'cancelled' | 'expired',
): boolean {
  const allowed: Record<string, string[]> = {
    pending: ['approved', 'rejected', 'cancelled', 'expired'],
    approved: [],
    rejected: [],
    cancelled: [],
    expired: [],
  };
  return (allowed[status] ?? []).includes(next);
}

export function transitionHandoffStatus(
  status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'declined',
  next: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'declined',
): boolean {
  const allowed: Record<string, string[]> = {
    pending: ['accepted', 'declined'],
    accepted: ['in_progress', 'declined'],
    in_progress: ['completed', 'declined'],
    completed: [],
    declined: [],
  };
  return (allowed[status] ?? []).includes(next);
}

export function transitionEscalationAcknowledge(
  acknowledgedAt?: string,
): boolean {
  return !acknowledgedAt;
}
