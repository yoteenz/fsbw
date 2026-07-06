/** Milestone 155 — Prompt QA™ · Mission-critical prompt validation */

export const PROMPT_QA_STORAGE_KEY = 'studioOsPromptQa_v1';
export const PROMPT_QA_VERSION = '1.0.0';
export const STUDIO_OS_PROMPT_QA_UPDATED = 'studio-os-prompt-qa-updated';

export const PROMPT_QA_ACCENT = '#047857';

export const PROMPT_QA_PHILOSOPHY = [
  'Prompt QA™ validates every prompt, Profession Brain™, workflow instruction, and AI reasoning chain before production.',
  'Studio OS treats prompts like mission-critical infrastructure — not fragile collections of hidden text.',
  'Profession Brains™ become organizational assets when prompts are clear, consistent, versioned, and maintainable.',
  'Every audit returns quality, maintainability, scalability, clarity, conflicts, improvements, and estimated AI confidence.',
] as const;

export const PROMPT_SOURCES = [
  'profession-brain',
  'studio-intelligence',
  'ai-concierge',
  'marketplace',
  'automation',
  'documentation',
  'knowledge',
  'system',
  'generated',
] as const;

export const PROMPT_ISSUE_TYPES = [
  'ambiguous-instructions',
  'missing-context',
  'conflicting-logic',
  'contradictory-rules',
  'hallucination-risk',
  'circular-dependencies',
  'duplicate-instructions',
  'incomplete-workflows',
  'missing-edge-cases',
  'unsafe-assumptions',
  'overly-complex-prompts',
  'maintainability-concerns',
  'scalability-concerns',
] as const;

export const PROMPT_QA_SEVERITIES = ['critical', 'warning', 'advisory'] as const;

export const PROMPT_SOURCE_LABELS: Record<(typeof PROMPT_SOURCES)[number], string> = {
  'profession-brain': 'Profession Brain™',
  'studio-intelligence': 'Studio Intelligence™',
  'ai-concierge': 'AI Concierge',
  marketplace: 'Marketplace',
  automation: 'Automation',
  documentation: 'Documentation',
  knowledge: 'Knowledge',
  system: 'System',
  generated: 'Generated',
};

export const PROMPT_ISSUE_LABELS: Record<(typeof PROMPT_ISSUE_TYPES)[number], string> = {
  'ambiguous-instructions': 'Ambiguous Instructions',
  'missing-context': 'Missing Context',
  'conflicting-logic': 'Conflicting Logic',
  'contradictory-rules': 'Contradictory Rules',
  'hallucination-risk': 'Hallucination Risk',
  'circular-dependencies': 'Circular Dependencies',
  'duplicate-instructions': 'Duplicate Instructions',
  'incomplete-workflows': 'Incomplete Workflows',
  'missing-edge-cases': 'Missing Edge Cases',
  'unsafe-assumptions': 'Unsafe Assumptions',
  'overly-complex-prompts': 'Overly Complex Prompts',
  'maintainability-concerns': 'Maintainability Concerns',
  'scalability-concerns': 'Scalability Concerns',
};
