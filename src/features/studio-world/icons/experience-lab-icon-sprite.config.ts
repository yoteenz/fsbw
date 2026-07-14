/** Sprite config — v3 deterministic crop pipeline (v2 frozen). */
export const EXPERIENCE_LAB_ICON_SOURCE_LABELED_STORAGE_PATH =
  '/storage/v1/object/public/live-preview/Studio%20World/740E9EB1-6B7B-4C5F-B745-E4621EC45EF3.png';

export function resolveExperienceLabIconSourceLabeledUrl(): string {
  const base =
    (import.meta as unknown as { env?: { VITE_SUPABASE_URL?: string } }).env?.VITE_SUPABASE_URL?.trim() || '';
  if (!base) return EXPERIENCE_LAB_ICON_SOURCE_LABELED_STORAGE_PATH;
  return `${base.replace(/\/$/, '')}${EXPERIENCE_LAB_ICON_SOURCE_LABELED_STORAGE_PATH}`;
}

export const EXPERIENCE_LAB_ICON_SPRITE_CONFIG = {
  sourcePath: 'src/assets/studio-world/experience-lab/experience-lab-icon-source-labeled.png',
  sourceStoragePath: EXPERIENCE_LAB_ICON_SOURCE_LABELED_STORAGE_PATH,
  generatedDir: 'src/assets/studio-world/experience-lab/icons/generated-v3',
  sourceWidth: 1402,
  sourceHeight: 1122,
  rows: 8,
  columns: 8,
  outputCanvas: 512,
  sourceSha256: 'd7476775716d3f2dc9b2416198c81bbd19d8e1a7f5730c5ff3c79fe6cda1f51d',
  bundleSha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
  extractionVersion: 'studio-world-icons-v3',
  opticalLockVersion: 'studio-world-icons-v3-pending-approval',
  lockdownCertified: false,
  v2PipelineFrozen: true,
  iconCount: 64,
  auditPass: 0,
  auditWarn: 64,
  auditFail: 0,
  mode: 'deterministic-crop-v3' as const,
} as const;

export type ExperienceLabIconSpriteConfig = typeof EXPERIENCE_LAB_ICON_SPRITE_CONFIG;
