/** Milestone 126 — Documentation Registry™ V1.0 */

export const DOCUMENTATION_REGISTRY_STORAGE_KEY = 'studioOsDocumentationRegistry_v1';
export const DOCUMENTATION_REGISTRY_VERSION = '1.0.0';
export const STUDIO_OS_DOCUMENTATION_REGISTRY_UPDATED = 'studio-os-documentation-registry-updated';

export const DOCUMENTATION_REGISTRY_ACCENT = '#0891B2';

export const DOCUMENTATION_REGISTRY_PHILOSOPHY = [
  'One source. Many consumers. Every feature registers once — every documentation system consumes automatically.',
  'Documentation is infrastructure—not static pages. No manual updates in multiple places.',
  'The Documentation Registry™ is the documentation equivalent of Profession Brain™.',
  'One source. Infinite knowledge. Always synchronized.',
] as const;

/** Surfaces auto-synchronized from registry */
export const AUTO_SYNC_SURFACES = [
  'studio-manual',
  'getting-started',
  'walkthrough',
  'academy',
  'help-center',
  'search-index',
  'tooltips',
  'faq',
  'developer-docs',
  'architecture-docs',
  'command-dock',
  'release-notes',
  'feature-registry',
  'version-history',
] as const;

export const REGISTRY_CATEGORIES = [
  'foundation',
  'intelligence',
  'operations',
  'legacy',
  'commerce',
  'executive',
  'platform',
] as const;
