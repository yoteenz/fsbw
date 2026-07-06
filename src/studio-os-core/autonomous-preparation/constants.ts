/** Milestone 114 — Autonomous Preparation™ V1.0 */

export const AUTONOMOUS_PREPARATION_STORAGE_KEY = 'studioOsAutonomousPreparation_v1';
export const AUTONOMOUS_PREPARATION_VERSION = '1.0.0';
export const STUDIO_OS_AUTONOMOUS_PREPARATION_UPDATED = 'studio-os-autonomous-preparation-updated';

export const AUTONOMOUS_PREPARATION_PHILOSOPHY = [
  'Preparation creates leverage — founders should frequently find work already prepared.',
  'Nothing executes automatically. Everything waits for approval.',
  'Preparation becomes invisible until it becomes valuable.',
] as const;

export const PREPARATION_TYPES = [
  'meeting-agenda',
  'presentation',
  'report',
  'launch-checklist',
  'research',
  'contract',
  'email-campaign',
  'social-calendar',
  'executive-summary',
  'onboarding-doc',
  'proposal-template',
] as const;

export const PREPARATION_TYPE_LABELS: Record<(typeof PREPARATION_TYPES)[number], string> = {
  'meeting-agenda': 'Meeting Agenda',
  presentation: 'Presentation',
  report: 'Report',
  'launch-checklist': 'Launch Checklist',
  research: 'Organized Research',
  contract: 'Contract Draft',
  'email-campaign': 'Email Campaign',
  'social-calendar': 'Social Media Calendar',
  'executive-summary': 'Executive Summary',
  'onboarding-doc': 'Onboarding Documentation',
  'proposal-template': 'Proposal Template',
};

export const APPROVAL_ACTIONS = [
  'approve',
  'edit',
  'reject',
  'schedule',
  'delegate',
  'archive',
] as const;

export const APPROVAL_ACTION_LABELS: Record<(typeof APPROVAL_ACTIONS)[number], string> = {
  approve: 'Approve',
  edit: 'Edit',
  reject: 'Reject',
  schedule: 'Schedule',
  delegate: 'Delegate',
  archive: 'Archive',
};

export const PREPARATION_STATUSES = [
  'pending',
  'approved',
  'edited',
  'rejected',
  'scheduled',
  'delegated',
  'archived',
] as const;
