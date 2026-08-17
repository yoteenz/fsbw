export const ASSTS_ENVIRONMENT_SLOTS = {
  library: 'assts.library.environment.mobile',
  batch: 'assts.batch.environment.mobile',
  inspection: 'assts.inspection.environment.mobile',
} as const;

export type AsstsEnvironmentSlot = (typeof ASSTS_ENVIRONMENT_SLOTS)[keyof typeof ASSTS_ENVIRONMENT_SLOTS];

export const ASSTS_LIBRARY_CATEGORIES = [
  { id: 'environments', label: '01 ENVIRONMENTS', count: 32 },
  { id: 'objects', label: '02 OBJECTS', count: 128 },
  { id: 'ui', label: '03 UI / GRAPHICS', count: 48 },
  { id: 'brand', label: '04 BRAND SYSTEMS', count: 22 },
  { id: 'project', label: '05 PROJECT ASSETS', count: 17 },
] as const;

export const STATUS_LABELS: Record<string, string> = {
  QUEUED: 'Queued',
  GENERATING: 'Generating',
  NEEDS_REVIEW: 'Needs Review',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  REGENERATING: 'Regenerating',
  VARIANT_REQUESTED: 'Variant Requested',
  LOCKED: 'Locked',
  FAILED: 'Failed',
};
