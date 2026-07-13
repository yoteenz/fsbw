/**
 * Studio World Construction Mode™
 * The Founder walks the world before it exists.
 */

export const CONSTRUCTION_MODE_VERSION = 'construction-mode.v1';

/** Full compiler experience with Construction Mode before manufacturing */
export const CONSTRUCTION_MODE_COMPILER_ORDER = [
  'founder-request',
  'blueprint-author',
  'construction-plan',
  'construction-mode',
  'founder-approval',
  'asset-dna',
  'render-intent',
  'manufacturing-queue',
  'ai-factory-workers',
  'manufacturing-inspection',
  'quality-guard',
  'immune-system',
  'scene-stack',
  'living-world',
] as const;

export type ConstructionModePhase = (typeof CONSTRUCTION_MODE_COMPILER_ORDER)[number];

export type ConstructionLayerId =
  | 'architecture'
  | 'hero-assets'
  | 'furniture'
  | 'decor'
  | 'materials'
  | 'lighting'
  | 'collision'
  | 'navigation'
  | 'interaction'
  | 'camera-anchors'
  | 'sockets'
  | 'health'
  | 'dependencies'
  | 'generation-queue';

export type HealthOverlayColor = 'green' | 'yellow' | 'red' | 'blue' | 'gray' | 'purple';

export type HealthOverlayState = {
  color: HealthOverlayColor;
  label: string;
};

export const HEALTH_OVERLAY_MAP: Record<HealthOverlayColor, HealthOverlayState> = {
  green: { color: 'green', label: 'Healthy' },
  yellow: { color: 'yellow', label: 'Warning' },
  red: { color: 'red', label: 'Repair Required' },
  blue: { color: 'blue', label: 'Building' },
  gray: { color: 'gray', label: 'Queued' },
  purple: { color: 'purple', label: 'Waiting Dependencies' },
};

export type FounderApprovalStatus = 'pending' | 'approved' | 'rejected' | 'edit-requested';

export type ConstructionModeStatus =
  | 'planning'
  | 'previewing'
  | 'awaiting-approval'
  | 'manufacturing'
  | 'installing'
  | 'completing'
  | 'living-world';
