/** Studio Production Orchestrator™ — AI production handoff system */

export const PRODUCTION_ORCHESTRATOR_STORAGE_KEY = 'studioOsProductionOrchestrator_v1';
export const PRODUCTION_ORCHESTRATOR_VERSION = '1.0.0';
export const STUDIO_OS_PRODUCTION_ORCHESTRATOR_UPDATED = 'studio-os-production-orchestrator-updated';

export const PRODUCTION_ORCHESTRATOR_ACCENT = '#A855F7';

export const PRODUCTION_ORCHESTRATOR_STAGES = [
  'idea',
  'architecture-queued',
  'architecture-running',
  'architecture-complete',
  'implementation-ready',
  'composer-running',
  'implementation-complete',
  'assets-needed',
  'motion-needed',
  'review-needed',
  'approved',
  'archived',
] as const;

export const PRODUCTION_ORCHESTRATOR_STAGE_LABELS: Record<(typeof PRODUCTION_ORCHESTRATOR_STAGES)[number], string> = {
  idea: 'Idea',
  'architecture-queued': 'Architecture Queued',
  'architecture-running': 'Architecture Running',
  'architecture-complete': 'Architecture Complete',
  'implementation-ready': 'Implementation Ready',
  'composer-running': 'Composer Running',
  'implementation-complete': 'Implementation Complete',
  'assets-needed': 'Assets Needed',
  'motion-needed': 'Motion Needed',
  'review-needed': 'Review Needed',
  approved: 'Approved',
  archived: 'Archived',
};

export const PRODUCTION_MODEL_ROLES = [
  'gpt-5.5',
  'composer-2.5',
  'openart-fal',
  'kling',
  'founder',
] as const;

export const PRODUCTION_MODEL_LABELS: Record<(typeof PRODUCTION_MODEL_ROLES)[number], string> = {
  'gpt-5.5': 'GPT-5.5',
  'composer-2.5': 'Composer 2.5',
  'openart-fal': 'OpenArt / FAL',
  kling: 'Kling',
  founder: 'Founder',
};

export const PRODUCTION_PIPELINE_ORDER = [
  'Founder Intent™',
  'Architecture Prompt Queue™',
  'GPT Architecture Output™',
  'Architecture Completion Detection™',
  'Implementation Handoff Package™',
  'Composer Implementation Queue™',
  'Asset Generation Queue™',
  'Motion Queue™',
  'Review Queue™',
  'Knowledge Core / ADR Update™',
] as const;
