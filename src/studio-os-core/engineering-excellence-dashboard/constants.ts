/** Milestone 162 — Engineering Excellence Dashboard™ · Executive command center for engineering health */

export const ENGINEERING_EXCELLENCE_STORAGE_KEY = 'studioOsEngineeringExcellence_v1';
export const ENGINEERING_EXCELLENCE_VERSION = '1.0.0';
export const STUDIO_OS_ENGINEERING_EXCELLENCE_UPDATED = 'studio-os-engineering-excellence-updated';

export const ENGINEERING_EXCELLENCE_ACCENT = '#0369A1';

export const ENGINEERING_EXCELLENCE_PHILOSOPHY = [
  'Engineering Excellence Dashboard™ gives founders, administrators, and engineering teams a real-time executive overview of Studio OS health, quality, and readiness.',
  'This dashboard becomes the executive command center for engineering excellence — not merely measuring software quality, but discipline, consistency, craftsmanship, and long-term health.',
  'Engineering Excellence™ should become a permanent organizational mindset. Studio OS rewards excellence rather than speed alone.',
  'Help every organization develop world-class engineering habits — even with a team of one.',
] as const;

export const HEALTH_PILLARS = [
  'design-health',
  'prompt-health',
  'experience-health',
  'accessibility',
  'performance',
  'trust',
  'regression-status',
  'simulation-status',
  'documentation-health',
  'knowledge-health',
  'release-readiness',
  'guardian-status',
] as const;

export const ENGINEERING_KPIS = [
  'overall-engineering-score',
  'technical-debt',
  'open-risks',
  'critical-issues',
  'regression-trend',
  'deployment-frequency',
  'production-stability',
  'customer-experience-trend',
  'average-release-confidence',
  'average-resolution-time',
] as const;

export const EXCELLENCE_PERIODS = [
  'daily',
  'weekly',
  'monthly',
  'quarterly',
  'yearly',
  'organization-lifetime',
] as const;

export const CULTURE_ACHIEVEMENTS = [
  'zero-regression-release',
  'accessibility-improvement',
  'performance-milestone',
  'design-consistency',
  'knowledge-quality',
  'automation-reliability',
  'documentation-excellence',
] as const;

export const HEALTH_PILLAR_LABELS: Record<(typeof HEALTH_PILLARS)[number], string> = {
  'design-health': 'Design Health',
  'prompt-health': 'Prompt Health',
  'experience-health': 'Experience Health',
  accessibility: 'Accessibility',
  performance: 'Performance',
  trust: 'Trust',
  'regression-status': 'Regression Status',
  'simulation-status': 'Simulation Status',
  'documentation-health': 'Documentation Health',
  'knowledge-health': 'Knowledge Health',
  'release-readiness': 'Release Readiness',
  'guardian-status': 'Guardian Status',
};

export const ENGINEERING_KPI_LABELS: Record<(typeof ENGINEERING_KPIS)[number], string> = {
  'overall-engineering-score': 'Overall Engineering Score',
  'technical-debt': 'Technical Debt',
  'open-risks': 'Open Risks',
  'critical-issues': 'Critical Issues',
  'regression-trend': 'Regression Trend',
  'deployment-frequency': 'Deployment Frequency',
  'production-stability': 'Production Stability',
  'customer-experience-trend': 'Customer Experience Trend',
  'average-release-confidence': 'Average Release Confidence',
  'average-resolution-time': 'Average Resolution Time',
};

export const EXCELLENCE_PERIOD_LABELS: Record<(typeof EXCELLENCE_PERIODS)[number], string> = {
  daily: 'Daily',
  weekly: 'Weekly',
  monthly: 'Monthly',
  quarterly: 'Quarterly',
  yearly: 'Yearly',
  'organization-lifetime': 'Organization Lifetime',
};

export const CULTURE_ACHIEVEMENT_LABELS: Record<(typeof CULTURE_ACHIEVEMENTS)[number], string> = {
  'zero-regression-release': 'Zero-Regression Release',
  'accessibility-improvement': 'Accessibility Improvement',
  'performance-milestone': 'Performance Milestone',
  'design-consistency': 'Design Consistency',
  'knowledge-quality': 'Knowledge Quality',
  'automation-reliability': 'Automation Reliability',
  'documentation-excellence': 'Documentation Excellence',
};
