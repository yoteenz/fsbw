/** Live Validation System™ — Phase 2 continuous founder validation */

export const LVS_SUBSYSTEM_NAME = 'Live Validation System™';
export const LVS_SUBSYSTEM_VERSION = '1.0.0';

export const LVS_TRACKING_METRICS = [
  'daily-active-workflows',
  'tasks-completed',
  'mission-completion',
  'tool-switching',
  'context-switching',
  'time-saved',
  'knowledge-retrieval',
  'creative-output',
  'automation-usage',
  'decision-support',
  'founder-confidence',
  'founder-satisfaction',
  'stress-indicators',
  'flow-interruptions',
] as const;

export type LvsTrackingMetricId = (typeof LVS_TRACKING_METRICS)[number];

export const LVS_TRACKING_METRIC_LABELS: Record<LvsTrackingMetricId, string> = {
  'daily-active-workflows': 'Daily Active Workflows',
  'tasks-completed': 'Tasks Completed',
  'mission-completion': 'Mission Completion',
  'tool-switching': 'Tool Switching',
  'context-switching': 'Context Switching',
  'time-saved': 'Time Saved',
  'knowledge-retrieval': 'Knowledge Retrieval',
  'creative-output': 'Creative Output',
  'automation-usage': 'Automation Usage',
  'decision-support': 'Decision Support',
  'founder-confidence': 'Founder Confidence',
  'founder-satisfaction': 'Founder Satisfaction',
  'stress-indicators': 'Stress Indicators',
  'flow-interruptions': 'Flow Interruptions',
};

export const LVS_HEALTH_DIMENSIONS = [
  'usage',
  'adoption',
  'value',
  'reliability',
  'confidence',
  'replacement-likelihood',
  'founder-dependency',
  'learning-growth',
] as const;

export type LvsHealthDimension = (typeof LVS_HEALTH_DIMENSIONS)[number];

export const LVS_HEALTH_DIMENSION_LABELS: Record<LvsHealthDimension, string> = {
  usage: 'Usage',
  adoption: 'Adoption',
  value: 'Value',
  reliability: 'Reliability',
  confidence: 'Confidence',
  'replacement-likelihood': 'Replacement Likelihood',
  'founder-dependency': 'Founder Dependency',
  'learning-growth': 'Learning Growth',
};

export const LVS_ESCAPE_CLASSIFICATIONS = [
  'missing-capability',
  'poor-workflow',
  'low-trust',
  'knowledge-gap',
  'integration-need',
  'intentional-boundary',
  'creative-preference',
  'temporary-workaround',
] as const;

export type LvsEscapeClassification = (typeof LVS_ESCAPE_CLASSIFICATIONS)[number];

export const LVS_ESCAPE_OUTCOMES = [
  'replace',
  'integrate',
  'defer',
  'accept-boundary',
  'investigate',
] as const;

export type LvsEscapeOutcome = (typeof LVS_ESCAPE_OUTCOMES)[number];

export const LVS_PROPOSAL_STATUSES = [
  'queued',
  'under-review',
  'accepted',
  'rejected',
  'deferred',
] as const;

export type LvsProposalStatus = (typeof LVS_PROPOSAL_STATUSES)[number];

export const LVS_DASHBOARD_VIEWS = [
  'overview',
  'founder-diary',
  'escape-velocity',
  'system-health',
  'adoption-value',
  'genesis-proposals',
] as const;

export type LvsDashboardView = (typeof LVS_DASHBOARD_VIEWS)[number];

export const LVS_DASHBOARD_VIEW_LABELS: Record<LvsDashboardView, string> = {
  overview: 'Live Validation Overview™',
  'founder-diary': 'Founder Diary™',
  'escape-velocity': 'Escape Velocity™',
  'system-health': 'System Health™',
  'adoption-value': 'Adoption & Value™',
  'genesis-proposals': 'Genesis Proposals™',
};

export const LVS_DIARY_SENTIMENTS = [
  'calm',
  'stress',
  'confidence',
  'hesitation',
  'momentum',
  'drag',
  'delight',
  'indifference',
  'trust',
  'confusion',
  'relief',
  'frustration',
] as const;

export type LvsDiarySentiment = (typeof LVS_DIARY_SENTIMENTS)[number];
