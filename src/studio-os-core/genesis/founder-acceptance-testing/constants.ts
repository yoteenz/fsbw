/** Founder Acceptance Testing™ — Studio OS Launch Stack validation framework */

export const FAT_SUBSYSTEM_NAME = 'Founder Acceptance Testing™';
export const FAT_SUBSYSTEM_VERSION = '1.0.0';

export const FAT_VALIDATION_LEVELS = [
  'architectural',
  'implementation',
  'founder-acceptance',
  'company',
  'market',
] as const;

export type FatValidationLevel = (typeof FAT_VALIDATION_LEVELS)[number];

export const FAT_VALIDATION_LEVEL_LABELS: Record<FatValidationLevel, string> = {
  architectural: 'Architectural Validation™',
  implementation: 'Implementation Validation™',
  'founder-acceptance': 'Founder Acceptance Testing™',
  company: 'Company Validation™',
  market: 'Market Validation™',
};

export const FAT_GATE_STATUSES = [
  'blocked',
  'retry',
  'conditional',
  'accepted',
  'graduated',
  'pending',
] as const;

export type FatGateStatus = (typeof FAT_GATE_STATUSES)[number];

export const FAT_PIPELINE_STAGES = [
  'architecture',
  'implementation',
  'founder-acceptance-testing',
  'genesis-feedback',
  'launch-stack-graduation',
  'platform-ready',
] as const;

export type FatPipelineStage = (typeof FAT_PIPELINE_STAGES)[number];

export const FAT_PIPELINE_STAGE_LABELS: Record<FatPipelineStage, string> = {
  architecture: 'Architecture',
  implementation: 'Implementation',
  'founder-acceptance-testing': 'Founder Acceptance Testing™',
  'genesis-feedback': 'Genesis Feedback™',
  'launch-stack-graduation': 'Launch Stack Graduation™',
  'platform-ready': 'Platform Ready™',
};

export const FAT_METRIC_IDS = [
  'daily-usage',
  'time-saved',
  'tool-replacement',
  'task-completion',
  'automation-success',
  'knowledge-retrieval',
  'creative-output',
  'stress-score',
  'focus-score',
  'confidence-score',
  'reliability',
  'founder-satisfaction',
] as const;

export type FatMetricId = (typeof FAT_METRIC_IDS)[number];

export const FAT_METRIC_LABELS: Record<FatMetricId, string> = {
  'daily-usage': 'Daily Usage',
  'time-saved': 'Time Saved',
  'tool-replacement': 'Tool Replacement',
  'task-completion': 'Task Completion',
  'automation-success': 'Automation Success',
  'knowledge-retrieval': 'Knowledge Retrieval',
  'creative-output': 'Creative Output',
  'stress-score': 'Stress Score',
  'focus-score': 'Focus Score',
  'confidence-score': 'Confidence Score',
  reliability: 'Reliability',
  'founder-satisfaction': 'Founder Satisfaction',
};

export const FAT_PASS_THRESHOLD = 75;

export const FAT_DASHBOARD_VIEWS = [
  'validation-dashboard',
  'launch-stack-status',
  'metric-trends',
  'genesis-learnings',
  'outstanding-issues',
  'graduated-systems',
] as const;

export type FatDashboardView = (typeof FAT_DASHBOARD_VIEWS)[number];

export const FAT_DASHBOARD_VIEW_LABELS: Record<FatDashboardView, string> = {
  'validation-dashboard': 'Validation Dashboard™',
  'launch-stack-status': 'Launch Stack Status™',
  'metric-trends': 'Metric Trends™',
  'genesis-learnings': 'Genesis Learnings™',
  'outstanding-issues': 'Outstanding Issues™',
  'graduated-systems': 'Graduated Systems™',
};
