/** Studio World Knowledge Core™ — institutional memory engine */

export const KNOWLEDGE_CORE_STORAGE_KEY = 'studioOsKnowledgeCore_v1';
export const KNOWLEDGE_CORE_VERSION = '1.0.0';
export const STUDIO_OS_KNOWLEDGE_CORE_UPDATED = 'studio-os-knowledge-core-updated';

export const KNOWLEDGE_CORE_ACCENT = '#C9A962';

export const CANON_STATUSES = ['Canon'] as const;

export const WORKING_STATUSES = ['Approved', 'Draft', 'Experimental'] as const;

export const HISTORICAL_STATUSES = ['Deprecated', 'Historical', 'Archived'] as const;

export const KNOWLEDGE_CORE_PHILOSOPHY = [
  'Studio World becomes its own memory — not external AI, not chat history.',
  'Every major prompt that changes the civilization creates a searchable Knowledge Entry.',
  'Only Canon™ may influence future architecture automatically.',
  'History is never overwritten — every revision preserves its lineage.',
  'Knowledge behaves like intelligence, not documentation folders.',
] as const;
