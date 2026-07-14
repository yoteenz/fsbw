/** Extraction config — auto-updated by scripts/extract-experience-lab-icons.mjs */
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
  generatedDir: 'src/assets/studio-world/experience-lab/icons/generated',
  sourceWidth: 1402,
  sourceHeight: 1122,
  rows: 8,
  columns: 8,
  outputCanvas: 256,
  sourceSha256: 'd7476775716d3f2dc9b2416198c81bbd19d8e1a7f5730c5ff3c79fe6cda1f51d',
  bundleSha256: 'b7fd4d0a61e282461894bdd8605ddc2e91e4c44ca371f27fbe8e7c163c2daecd',
  extractionVersion: 'experience-lab-icons-v2',
  iconCount: 64,
  auditPass: 40,
  auditWarn: 24,
  auditFail: 0,
  mode: 'extracted-transparent-png' as const,
} as const;

export type ExperienceLabIconSpriteConfig = typeof EXPERIENCE_LAB_ICON_SPRITE_CONFIG;
