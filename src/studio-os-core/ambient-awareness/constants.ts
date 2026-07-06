/** Milestone 107 — Ambient Awareness™ V1.0 */

export const AMBIENT_AWARENESS_STORAGE_KEY = 'studioOsAmbientAwareness_v1';
export const AMBIENT_AWARENESS_VERSION = '1.0.0';
export const STUDIO_OS_AMBIENT_AWARENESS_UPDATED = 'studio-os-ambient-awareness-updated';

export const AMBIENT_AWARENESS_PHILOSOPHY = [
  'Studio OS should always understand context — not surveillance, context.',
  'The founder should never need to repeatedly explain what is happening — Studio OS already knows.',
  'Present, not reactive — like an Executive Chief of Staff that understands before anyone speaks.',
  'Every Digital Concierge receives organizational awareness automatically — no Concierge operates in isolation.',
] as const;

export const AWARENESS_LAYERS = [
  'current-organization',
  'current-department',
  'current-workspace',
  'current-project',
  'current-campaign',
  'current-calendar',
  'current-priorities',
  'current-workload',
  'current-objectives',
  'current-milestones',
] as const;

export const AWARENESS_LAYER_LABELS: Record<(typeof AWARENESS_LAYERS)[number], string> = {
  'current-organization': 'Current Organization',
  'current-department': 'Current Department',
  'current-workspace': 'Current Workspace',
  'current-project': 'Current Project',
  'current-campaign': 'Current Campaign',
  'current-calendar': 'Current Calendar',
  'current-priorities': 'Current Priorities',
  'current-workload': 'Current Workload',
  'current-objectives': 'Current Objectives',
  'current-milestones': 'Current Milestones',
};
