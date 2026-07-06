/** Milestone 126.5 — Documentation Governance™ V1.0 */

export const DOCUMENTATION_GOVERNANCE_STORAGE_KEY = 'studioOsDocumentationGovernance_v1';
export const DOCUMENTATION_GOVERNANCE_VERSION = '1.0.0';
export const STUDIO_OS_DOCUMENTATION_GOVERNANCE_UPDATED = 'studio-os-documentation-governance-updated';

export const DOCUMENTATION_GOVERNANCE_ACCENT = '#0E7490';

export const DOCUMENTATION_GOVERNANCE_PHILOSOPHY = [
  'Documentation is not a deliverable — it is a living organizational system.',
  'As Studio OS evolves, documentation should evolve automatically.',
  'Documentation Governance™ continuously monitors, validates, audits, and improves every piece of documentation.',
  'Documentation should never become outdated, incomplete, duplicated, inconsistent, or disconnected from the platform.',
] as const;

/** Organizational standard — feature not complete below this threshold */
export const COVERAGE_STANDARD_PCT = 95;

/** Surfaces validated for every registered feature */
export const COVERAGE_SURFACES = [
  'studio-manual',
  'academy',
  'walkthrough',
  'help-center',
  'search',
  'command-dock',
  'tooltips',
  'developer-docs',
  'architecture-docs',
  'release-notes',
  'faq',
  'examples',
  'screenshots',
  'video-tutorials',
] as const;

/** Official terminology — banned variants unless registered as aliases */
export const OFFICIAL_TERMINOLOGY: Record<string, string[]> = {
  'Profession Brain™': ['Knowledge Brain', 'AI Brain', 'Professional Brain', 'knowledge brain', 'ai brain'],
  'Executive Council™': ['Executive Board', 'Leadership Council', 'AI Council'],
  'Organization Genome™': ['Company DNA', 'Org DNA', 'Business Genome'],
  'Legacy Vault™': ['Memory Vault', 'Archive Vault', 'Company Archive'],
  'Studio Intelligence™': ['Studio AI', 'Platform AI', 'OS Intelligence'],
  'Command Dock™': ['Command Bar', 'AI Command', 'Chat Dock'],
  'Documentation Registry™': ['Doc Registry', 'Feature Registry', 'Help Registry'],
};

export const AUDIT_ISSUE_TYPES = [
  'outdated',
  'missing',
  'broken-reference',
  'duplicate',
  'unused',
  'orphaned',
  'deprecated-terminology',
  'missing-tutorial',
  'missing-walkthrough',
  'missing-academy',
  'missing-search-keywords',
  'incomplete-description',
] as const;
