/** Sprite config — v4 unlabeled grid extraction (v2/v3 retired). */
export const EXPERIENCE_LAB_ICON_SOURCE_LABELED_STORAGE_PATH =
  '/storage/v1/object/public/live-preview/Studio%20World/740E9EB1-6B7B-4C5F-B745-E4621EC45EF3.png';

export const EXPERIENCE_LAB_ICON_SOURCE_UNLABELED_STORAGE_PATH =
  '/storage/v1/object/public/live-preview/Studio%20World/E0141347-B0F9-4795-B86B-C402E0B3C84E.png';

export function resolveExperienceLabIconSourceLabeledUrl(): string {
  const base =
    (import.meta as unknown as { env?: { VITE_SUPABASE_URL?: string } }).env?.VITE_SUPABASE_URL?.trim() || '';
  if (!base) return EXPERIENCE_LAB_ICON_SOURCE_LABELED_STORAGE_PATH;
  return `${base.replace(/\/$/, '')}${EXPERIENCE_LAB_ICON_SOURCE_LABELED_STORAGE_PATH}`;
}

export function resolveExperienceLabIconSourceUnlabeledUrl(): string {
  const base =
    (import.meta as unknown as { env?: { VITE_SUPABASE_URL?: string } }).env?.VITE_SUPABASE_URL?.trim() || '';
  if (!base) return EXPERIENCE_LAB_ICON_SOURCE_UNLABELED_STORAGE_PATH;
  return `${base.replace(/\/$/, '')}${EXPERIENCE_LAB_ICON_SOURCE_UNLABELED_STORAGE_PATH}`;
}

export const EXPERIENCE_LAB_ICON_SPRITE_CONFIG = {
  labeledCatalogPath: 'src/assets/studio-world/icons/source/studio-world-icon-catalog-labeled.png',
  unlabeledSourcePath: 'src/assets/studio-world/icons/source/studio-world-icon-source-unlabeled.png',
  sourcePath: 'src/assets/studio-world/icons/source/studio-world-icon-source-unlabeled.png',
  sourceStoragePath: EXPERIENCE_LAB_ICON_SOURCE_UNLABELED_STORAGE_PATH,
  labeledStoragePath: EXPERIENCE_LAB_ICON_SOURCE_LABELED_STORAGE_PATH,
  generatedDir: 'src/assets/studio-world/experience-lab/icons/generated-v4',
  sourceWidth: 1402,
  sourceHeight: 1122,
  rows: 8,
  columns: 8,
  outputCanvas: 512,
  labeledCatalogSha256: 'd7476775716d3f2dc9b2416198c81bbd19d8e1a7f5730c5ff3c79fe6cda1f51d',
  sourceSha256: 'cdc5cd987d42a433a88fb84469cab5c56e5183e2b86a6d14e7c098b91fe2e2f9',
  bundleSha256: 'db0836c52ee5cd9f8aabf0b455e157e945b350af339d73a89a56878bd0613f22',
  extractionVersion: 'studio-world-icons-v4-unlabeled-source',
  opticalLockVersion: 'studio-world-icons-v4-unlabeled-source',
  lockdownCertified: false,
  v2PipelineFrozen: true,
  v3PipelineRetired: true,
  iconCount: 64,
  auditPass: 9,
  auditWarn: 55,
  auditFail: 0,
  parityPass: 9,
  parityWarn: 39,
  parityFail: 16,
  mode: 'unlabeled-grid-v4' as const,
  sourceRole: 'unlabeled-production-source' as const,
} as const;

export type ExperienceLabIconSpriteConfig = typeof EXPERIENCE_LAB_ICON_SPRITE_CONFIG;
