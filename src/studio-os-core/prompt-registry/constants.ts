/** Milestone 133 — Prompt Registry™ V1.0 */

export const PROMPT_REGISTRY_STORAGE_KEY = 'studioOsPromptRegistry_v1';
export const PROMPT_REGISTRY_VERSION = '1.0.0';
export const STUDIO_OS_PROMPT_REGISTRY_UPDATED = 'studio-os-prompt-registry-updated';

export const PROMPT_REGISTRY_ACCENT = '#6366F1';

export const PROMPT_REGISTRY_PHILOSOPHY = [
  'Prompts are code — treat every AI prompt with the same discipline as software.',
  'No AI prompt should exist as hidden text inside the application.',
  'Every prompt registered, versioned, searchable, testable, and reusable.',
  'AI behavior remains transparent, maintainable, and continuously improving.',
] as const;

export const PROMPT_CATEGORIES = [
  'command-dock',
  'digital-concierge',
  'executive-council',
  'profession-brain',
  'studio-institute',
  'knowledge-commerce',
  'automation-workflow',
  'marketplace',
  'help-center',
  'search',
  'summaries',
  'content-creation',
  'research',
  'decision-support',
  'developer-tools',
  'future',
] as const;

export const PROMPT_TYPES = [
  'system',
  'instruction',
  'workflow',
  'reasoning-template',
  'few-shot',
  'chain-of-thought',
] as const;

export const PROMPT_STATUSES = ['active', 'draft', 'deprecated', 'pending-approval'] as const;

export const SUPPORTED_MODELS = ['gpt-4o', 'claude-sonnet', 'gemini-pro', 'grok-2', 'studio-local'] as const;

export const VERSION_HISTORY_MAX = 50;

export const TEST_RESULTS_MAX = 80;
