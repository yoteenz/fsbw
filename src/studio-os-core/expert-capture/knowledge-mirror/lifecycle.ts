import type { KnowledgeLifecycleStatus, KnowledgeVisibility, TrainingPacketStatus } from './types';
import { NEVER_TRAINING_STATUSES, TRAINING_ELIGIBLE_STATUSES } from './types';

/** Governance: raw/unverified knowledge must never enter active worker training */
export function canEnterWorkerTraining(status: KnowledgeLifecycleStatus): boolean {
  if (NEVER_TRAINING_STATUSES.includes(status)) return false;
  return TRAINING_ELIGIBLE_STATUSES.includes(status);
}

export function isOwnerVisible(visibility: KnowledgeVisibility, status: KnowledgeLifecycleStatus): boolean {
  if (visibility === 'private_draft' || visibility === 'expert_only') return false;
  if (status === 'deleted' || status === 'rejected') return false;
  return (
    visibility === 'owner_review' ||
    visibility === 'approved_training' ||
    status === 'owner_visible' ||
    status === 'approved_for_training' ||
    status === 'scenario_tested' ||
    status === 'active_knowledge'
  );
}

const EXPERT_SUBMIT_TRANSITIONS: Partial<Record<KnowledgeLifecycleStatus, KnowledgeLifecycleStatus[]>> = {
  interpreted: ['expert_reviewed', 'needs_clarification', 'rejected'],
  expert_reviewed: ['owner_visible'],
  partially_approved: ['expert_reviewed'],
  needs_clarification: ['interpreted', 'expert_reviewed'],
};

const OWNER_TRANSITIONS: Partial<Record<KnowledgeLifecycleStatus, KnowledgeLifecycleStatus[]>> = {
  owner_visible: ['approved_for_training', 'needs_clarification', 'rejected', 'restricted'],
  approved_for_training: ['scenario_tested', 'active_knowledge', 'outdated'],
  scenario_tested: ['active_knowledge', 'restricted'],
  active_knowledge: ['superseded', 'outdated', 'restricted', 'archived'],
};

export function canExpertTransition(from: KnowledgeLifecycleStatus, to: KnowledgeLifecycleStatus): boolean {
  return EXPERT_SUBMIT_TRANSITIONS[from]?.includes(to) ?? false;
}

export function canOwnerTransition(from: KnowledgeLifecycleStatus, to: KnowledgeLifecycleStatus): boolean {
  return OWNER_TRANSITIONS[from]?.includes(to) ?? false;
}

export function lifecycleLabel(status: KnowledgeLifecycleStatus): string {
  const labels: Record<KnowledgeLifecycleStatus, string> = {
    draft: 'Draft',
    recorded: 'Recorded',
    transcribed: 'Transcribed',
    interpreted: 'Interpreted',
    needs_clarification: 'Needs Clarification',
    partially_approved: 'Partially Approved',
    expert_reviewed: 'Expert Reviewed',
    owner_visible: 'Owner Visible',
    approved_for_training: 'Approved for Training',
    scenario_tested: 'Scenario Tested',
    active_knowledge: 'Active Knowledge',
    superseded: 'Superseded',
    outdated: 'Outdated',
    disputed: 'Disputed',
    rejected: 'Rejected',
    archived: 'Archived',
    deleted: 'Deleted',
    restricted: 'Restricted',
  };
  return labels[status] ?? status;
}

export function packetStatusLabel(status: TrainingPacketStatus): string {
  return status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export function competencyLabel(level: string): string {
  return level.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}
