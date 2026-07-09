/** Genesis Constitution™ — constitutional infrastructure constants */

export const CONSTITUTION_SUBSYSTEM_VERSION = '1.0.0';
export const CONSTITUTION_SUBSYSTEM_NAME = 'Genesis Constitution™';

/** Amendment Workflow™ stages */
export const CONSTITUTION_AMENDMENT_STAGES = [
  'proposal',
  'discussion',
  'architecture-review',
  'founder-approval',
  'genesis-update',
  'codex-update',
  'historical-archive',
] as const;

export const CONSTITUTION_RELATIONSHIP_TYPES = [
  'governs',
  'depends-on',
  'supports',
  'extends',
  'supersedes',
  'contradicts',
  'references',
  'related-to',
  'interpreted-by',
  'compiled-to-codex',
] as const;
