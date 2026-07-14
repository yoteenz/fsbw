/** Sprite config — v5 pixel-preserving twin extraction (v2/v3/v4 retired). */
import labeledCatalogUrl from '../../../assets/studio-world/icons/source/studio-world-icon-catalog-labeled.png';
import unlabeledTwinUrl from '../../../assets/studio-world/icons/source/studio-world-icon-source-unlabeled-twin.png';

export const EXPERIENCE_LAB_ICON_SOURCE_LABELED_STORAGE_PATH =
  '/storage/v1/object/public/live-preview/Studio%20World/740E9EB1-6B7B-4C5F-B745-E4621EC45EF3.png';

export function resolveExperienceLabIconSourceLabeledUrl(): string {
  return labeledCatalogUrl;
}

export function resolveExperienceLabIconSourceUnlabeledTwinUrl(): string {
  return unlabeledTwinUrl;
}

/** @deprecated historical generated sheet — not for extraction */
export function resolveExperienceLabIconSourceUnlabeledUrl(): string {
  return resolveExperienceLabIconSourceUnlabeledTwinUrl();
}

export const EXPERIENCE_LAB_ICON_SPRITE_CONFIG = {
  labeledCatalogPath: 'src/assets/studio-world/icons/source/studio-world-icon-catalog-labeled.png',
  unlabeledTwinPath: 'src/assets/studio-world/icons/source/studio-world-icon-source-unlabeled-twin.png',
  deprecatedUnlabeledPath: 'src/assets/studio-world/icons/source/studio-world-icon-source-unlabeled.png',
  sourcePath: 'src/assets/studio-world/icons/source/studio-world-icon-source-unlabeled-twin.png',
  labeledStoragePath: EXPERIENCE_LAB_ICON_SOURCE_LABELED_STORAGE_PATH,
  generatedDir: 'src/assets/studio-world/experience-lab/icons/generated-v5',
  sourceWidth: 1402,
  sourceHeight: 1122,
  rows: 8,
  columns: 8,
  outputCanvas: 512,
  labeledCatalogSha256: 'd7476775716d3f2dc9b2416198c81bbd19d8e1a7f5730c5ff3c79fe6cda1f51d',
  sourceSha256: '96a179e4ac77626f9d59be111486eda69176a5b245749827d8749a4663e0e96b',
  twinSha256: '96a179e4ac77626f9d59be111486eda69176a5b245749827d8749a4663e0e96b',
  bundleSha256: 'f09695a7e63ec4f43dee3699ba0d21f227a4b830b21cbe8b48ae082555de4500',
  extractionVersion: 'studio-world-icons-v5-source-twin',
  opticalLockVersion: 'studio-world-icons-v5-source-twin',
  lockdownCertified: false,
  v2PipelineFrozen: true,
  v3PipelineRetired: true,
  v4PipelineRetired: true,
  iconCount: 64,
  auditPass: 64,
  auditWarn: 0,
  auditFail: 0,
  parityPass: 64,
  parityWarn: 0,
  parityFail: 0,
  mode: 'source-twin-grid-v5' as const,
  sourceRole: 'pixel-preserving-unlabeled-twin' as const,
} as const;

export type ExperienceLabIconSpriteConfig = typeof EXPERIENCE_LAB_ICON_SPRITE_CONFIG;
