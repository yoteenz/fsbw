/** Milestone 153 — Organizational Guardian™ · Highest Oversight Layer */

export const ORGANIZATIONAL_GUARDIAN_STORAGE_KEY = 'studioOsOrganizationalGuardian_v1';
export const ORGANIZATIONAL_GUARDIAN_VERSION = '1.0.0';
export const STUDIO_OS_ORGANIZATIONAL_GUARDIAN_UPDATED = 'studio-os-organizational-guardian-updated';

export const ORGANIZATIONAL_GUARDIAN_ACCENT = '#1E40AF';

export const GUARDIAN_PHILOSOPHY = [
  'Organizational Guardian™ is the highest oversight layer — continuously watching the entire organization not to control it, but to protect it.',
  'Protect before reacting. Explain before acting. Recommend before changing. Ask before assuming. Learn before optimizing.',
  'The Guardian™ should feel less like monitoring software and more like a trusted executive advisor.',
  'Its purpose is to quietly protect the organization, preserve operational excellence, and ensure Studio OS remains worthy of trust every day.',
] as const;

export const GUARDIAN_MONITOR_DOMAINS = [
  'quality',
  'trust',
  'security',
  'compliance',
  'performance',
  'knowledge-integrity',
  'profession-brains',
  'marketplace',
  'experts',
  'customer-experience',
  'ai-systems',
  'infrastructure',
  'documentation',
  'automation-health',
  'organization-growth',
] as const;

export const GUARDIAN_RESPONSIBILITIES = [
  'detect-emerging-risks',
  'protect-organizational-trust',
  'recommend-improvements',
  'escalate-important-issues',
  'coordinate-qa-systems',
  'coordinate-studio-intelligence',
  'coordinate-red-team',
  'coordinate-predictive-qa',
  'coordinate-self-healing',
] as const;

export const GUARDIAN_PRINCIPLES = [
  'Protect before reacting.',
  'Explain before acting.',
  'Recommend before changing.',
  'Ask before assuming.',
  'Learn before optimizing.',
] as const;

export const GUARDIAN_ALERT_SEVERITIES = ['advisory', 'attention', 'urgent', 'critical'] as const;

export const GUARDIAN_ALERT_STATUSES = ['active', 'acknowledged', 'escalated', 'resolved', 'dismissed'] as const;

export const DASHBOARD_METRICS = [
  'organizational-confidence',
  'trust',
  'health',
  'security',
  'quality',
  'operational-risk',
  'readiness',
  'growth',
] as const;

export const GUARDIAN_MONITOR_LABELS: Record<(typeof GUARDIAN_MONITOR_DOMAINS)[number], string> = {
  quality: 'Quality',
  trust: 'Trust',
  security: 'Security',
  compliance: 'Compliance',
  performance: 'Performance',
  'knowledge-integrity': 'Knowledge Integrity',
  'profession-brains': 'Profession Brains™',
  marketplace: 'Marketplace',
  experts: 'Experts',
  'customer-experience': 'Customer Experience',
  'ai-systems': 'AI Systems',
  infrastructure: 'Infrastructure',
  documentation: 'Documentation',
  'automation-health': 'Automation Health',
  'organization-growth': 'Organization Growth',
};

export const GUARDIAN_RESPONSIBILITY_LABELS: Record<(typeof GUARDIAN_RESPONSIBILITIES)[number], string> = {
  'detect-emerging-risks': 'Detect Emerging Risks',
  'protect-organizational-trust': 'Protect Organizational Trust',
  'recommend-improvements': 'Recommend Improvements',
  'escalate-important-issues': 'Escalate Important Issues',
  'coordinate-qa-systems': 'Coordinate QA Systems',
  'coordinate-studio-intelligence': 'Coordinate Studio Intelligence™',
  'coordinate-red-team': 'Coordinate Red Team™',
  'coordinate-predictive-qa': 'Coordinate Predictive QA™',
  'coordinate-self-healing': 'Coordinate Self-Healing™',
};

export const DASHBOARD_METRIC_LABELS: Record<(typeof DASHBOARD_METRICS)[number], string> = {
  'organizational-confidence': 'Overall Organizational Confidence',
  trust: 'Trust',
  health: 'Health',
  security: 'Security',
  quality: 'Quality',
  'operational-risk': 'Operational Risk',
  readiness: 'Readiness',
  growth: 'Growth',
};
