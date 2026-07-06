/** Milestone 152 — Confidence Engine™ · Visible Intelligence Confidence */

export const CONFIDENCE_ENGINE_STORAGE_KEY = 'studioOsConfidenceEngine_v1';
export const CONFIDENCE_ENGINE_VERSION = '1.0.0';
export const STUDIO_OS_CONFIDENCE_ENGINE_UPDATED = 'studio-os-confidence-engine-updated';

export const CONFIDENCE_ENGINE_ACCENT = '#A855F7';

export const CONFIDENCE_ENGINE_PHILOSOPHY = [
  'Confidence Engine™ measures, communicates, and explains how confident Studio Intelligence™ is before making recommendations.',
  'Confidence should become visible throughout Studio OS — not a percentage, but a conversation.',
  'Studio Intelligence™ always explains what it knows, what it doesn\'t know, and why it believes what it believes.',
  'When confidence is low, Studio Intelligence™ says so — confidence should never be exaggerated.',
] as const;

export const CONFIDENCE_LEVELS = [
  'very-high',
  'high',
  'moderate',
  'low',
  'insufficient-evidence',
] as const;

export const RECOMMENDATION_CATEGORIES = [
  'publishing-schedule',
  'workflow-approval',
  'pricing-change',
  'expert-hiring',
  'automation-trigger',
  'knowledge-publication',
  'marketplace-listing',
  'customer-outreach',
  'risk-escalation',
  'resource-allocation',
] as const;

export const RISK_LEVELS = ['low', 'medium', 'high', 'critical'] as const;

export const CONFIDENCE_LEVEL_LABELS: Record<(typeof CONFIDENCE_LEVELS)[number], string> = {
  'very-high': 'Very High',
  high: 'High',
  moderate: 'Moderate',
  low: 'Low',
  'insufficient-evidence': 'Insufficient Evidence',
};

export const RECOMMENDATION_CATEGORY_LABELS: Record<(typeof RECOMMENDATION_CATEGORIES)[number], string> = {
  'publishing-schedule': 'Publishing Schedule',
  'workflow-approval': 'Workflow Approval',
  'pricing-change': 'Pricing Change',
  'expert-hiring': 'Expert Hiring',
  'automation-trigger': 'Automation Trigger',
  'knowledge-publication': 'Knowledge Publication',
  'marketplace-listing': 'Marketplace Listing',
  'customer-outreach': 'Customer Outreach',
  'risk-escalation': 'Risk Escalation',
  'resource-allocation': 'Resource Allocation',
};

export const LOW_CONFIDENCE_MESSAGES = [
  "I don't have enough historical knowledge yet.",
  'I need more published content before making reliable predictions.',
  'This recommendation is based on limited evidence.',
  'Additional validation would significantly improve my confidence.',
  'Similar organizations in our network have more data — my estimate is preliminary.',
] as const;
