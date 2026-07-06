/** Milestone 150 — Self-Healing™ Engine · Intelligent Resilience */

export const SELF_HEALING_ENGINE_STORAGE_KEY = 'studioOsSelfHealingEngine_v1';
export const SELF_HEALING_ENGINE_VERSION = '1.0.0';
export const STUDIO_OS_SELF_HEALING_ENGINE_UPDATED = 'studio-os-self-healing-engine-updated';

export const SELF_HEALING_ENGINE_ACCENT = '#0891B2';

export const SELF_HEALING_ENGINE_PHILOSOPHY = [
  'Self-Healing™ Engine protects organizations by safely correcting low-risk issues and preparing intelligent recovery plans for higher-risk situations.',
  'The goal is not autonomous control — the goal is intelligent resilience.',
  'Minor issues quietly resolve themselves. Major issues arrive with a complete recovery strategy before anyone asks how to fix them.',
  'Never modify legal, medical, financial, or compliance-related workflows automatically.',
] as const;

export const HEALING_CATEGORIES = [
  'broken-links',
  'missing-documentation',
  'inactive-automations',
  'outdated-references',
  'knowledge-graph-inconsistencies',
  'duplicate-records',
  'unused-assets',
  'minor-ui-issues',
  'configuration-drift',
  'dependency-issues',
] as const;

export const HEALING_MODES = [
  'observe',
  'recommend',
  'request-approval',
  'automatic-repair',
] as const;

export const HEALING_RISK_LEVELS = ['low', 'medium', 'high', 'restricted'] as const;

export const REPAIR_STATUSES = [
  'detected',
  'pending-approval',
  'approved',
  'repaired',
  'rolled-back',
  'recovery-planned',
  'dismissed',
] as const;

export const RECOVERY_PRIORITIES = ['low', 'medium', 'high', 'critical'] as const;

export const RESTRICTED_DOMAINS = [
  'legal',
  'medical',
  'financial',
  'compliance',
] as const;

export const HEALING_CATEGORY_LABELS: Record<(typeof HEALING_CATEGORIES)[number], string> = {
  'broken-links': 'Broken Links',
  'missing-documentation': 'Missing Documentation',
  'inactive-automations': 'Inactive Automations',
  'outdated-references': 'Outdated References',
  'knowledge-graph-inconsistencies': 'Knowledge Graph Inconsistencies',
  'duplicate-records': 'Duplicate Records',
  'unused-assets': 'Unused Assets',
  'minor-ui-issues': 'Minor UI Issues',
  'configuration-drift': 'Configuration Drift',
  'dependency-issues': 'Dependency Issues',
};

export const HEALING_MODE_LABELS: Record<(typeof HEALING_MODES)[number], string> = {
  observe: 'Observe',
  recommend: 'Recommend',
  'request-approval': 'Request Approval',
  'automatic-repair': 'Automatic Repair (Low-Risk Only)',
};

export const DEFAULT_HEALING_THRESHOLDS = {
  autoRepairMaxRisk: 'low' as const,
  approvalRequiredRisk: 'medium' as const,
  autoRepairConfidenceMin: 85,
  maxAutoRepairsPerDay: 12,
};
