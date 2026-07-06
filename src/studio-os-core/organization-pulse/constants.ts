/** Milestone 100 — Organization Pulse™ V1.0 */

export const ORGANIZATION_PULSE_STORAGE_KEY = 'studioOsOrganizationPulse_v1';
export const ORGANIZATION_PULSE_VERSION = '1.0.0';
export const STUDIO_OS_ORGANIZATION_PULSE_UPDATED = 'studio-os-organization-pulse-updated';

export const ORGANIZATION_PULSE_PHILOSOPHY = [
  'Businesses are living systems — revenue alone cannot describe organizational health.',
  'Studio OS monitors the organization\'s pulse in real time.',
  'Mission Control communicates how the organization feels — not just what it earned.',
  'How is our organization really doing? Organizationally — not financially.',
] as const;

export const PULSE_INDICATORS = [
  'customer-satisfaction',
  'employee-activity',
  'founder-workload',
  'department-activity',
  'project-velocity',
  'revenue-momentum',
  'marketing-performance',
  'operational-efficiency',
  'knowledge-growth',
  'learning-activity',
  'automation-adoption',
  'innovation',
  'team-collaboration',
  'client-retention',
] as const;

export const PULSE_STATES = [
  'thriving',
  'healthy',
  'growing',
  'stable',
  'needs-attention',
  'strained',
  'critical',
] as const;

export const PULSE_ALERT_SEVERITIES = ['info', 'watch', 'urgent', 'critical'] as const;

export const STRAINED_THRESHOLD = 50;
export const CRITICAL_PULSE_THRESHOLD = 40;
