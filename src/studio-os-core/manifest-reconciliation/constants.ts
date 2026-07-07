/** Manifest Reconciliation™ — consumes docs/studio-os/master-spec (not owns it) */

export const MANIFEST_BUNDLE_PATH = '/studio-os/master-spec/manifest-bundle.json';
export const MANIFEST_BUNDLE_VERSION = '1.0.0';

export const IMPLEMENTATION_STATUS_LABELS = {
  planned: 'Planned',
  'in-progress': 'In Progress',
  complete: 'Complete',
  deprecated: 'Deprecated',
} as const;

export const REGISTRY_KINDS = [
  'constitution',
  'volume',
  'chapter',
  'milestone',
  'design-revision',
  'philosophy',
  'component',
  'system',
  'api',
  'design-token',
  'workflow',
  'automation',
  'profession-brain',
  'prompt',
  'qa',
] as const;
