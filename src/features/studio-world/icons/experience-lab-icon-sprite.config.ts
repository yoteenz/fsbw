/** Measured geometry for Experience Lab labeled icon sprite — auto-updated by build script. */
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
  runtimeAtlasPath: 'src/assets/studio-world/experience-lab/experience-lab-icon-runtime-atlas.png',
  sourceWidth: 1402,
  sourceHeight: 1122,
  rows: 8,
  columns: 8,
  cellWidth: 175.25,
  cellHeight: 140.25,
  runtimeGlyphCell: 96,
  runtimeAtlasWidth: 768,
  runtimeAtlasHeight: 768,
  blackThreshold: 40,
  whiteThreshold: 180,
  sourceSha256: 'd7476775716d3f2dc9b2416198c81bbd19d8e1a7f5730c5ff3c79fe6cda1f51d',
  iconCount: 64,
  mode: 'transparent-atlas' as const,
} as const;

export type ExperienceLabIconSpriteConfig = typeof EXPERIENCE_LAB_ICON_SPRITE_CONFIG;
