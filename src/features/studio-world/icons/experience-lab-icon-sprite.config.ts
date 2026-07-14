/** Sprite config — v6 grid-calibrated unlabeled extraction (v2–v5 retired from production). */
import labeledCatalogUrl from '../../../assets/studio-world/icons/source/studio-world-icon-catalog-labeled.png';
import unlabeledSourceUrl from '../../../assets/studio-world/icons/source/studio-world-icon-source-unlabeled.png';

export const EXPERIENCE_LAB_ICON_SOURCE_LABELED_STORAGE_PATH =
  '/storage/v1/object/public/live-preview/Studio%20World/740E9EB1-6B7B-4C5F-B745-E4621EC45EF3.png';

export function resolveExperienceLabIconSourceLabeledUrl(): string {
  return labeledCatalogUrl;
}

export function resolveExperienceLabIconSourceUnlabeledUrl(): string {
  return unlabeledSourceUrl;
}

/** @deprecated retired twin — reference/rollback only */
export function resolveExperienceLabIconSourceUnlabeledTwinUrl(): string {
  return unlabeledSourceUrl;
}

export const EXPERIENCE_LAB_ICON_SPRITE_CONFIG = {
  labeledCatalogPath: 'src/assets/studio-world/icons/source/studio-world-icon-catalog-labeled.png',
  unlabeledSourcePath: 'src/assets/studio-world/icons/source/studio-world-icon-source-unlabeled.png',
  retiredTwinPath: 'src/assets/studio-world/icons/source/studio-world-icon-source-unlabeled-twin.png',
  sourcePath: 'src/assets/studio-world/icons/source/studio-world-icon-source-unlabeled.png',
  labeledStoragePath: EXPERIENCE_LAB_ICON_SOURCE_LABELED_STORAGE_PATH,
  generatedDir: 'src/assets/studio-world/experience-lab/icons/generated-v6',
  sourceWidth: 1402,
  sourceHeight: 1122,
  rows: 8,
  columns: 8,
  outputCanvas: 512,
  labeledCatalogSha256: 'd7476775716d3f2dc9b2416198c81bbd19d8e1a7f5730c5ff3c79fe6cda1f51d',
  sourceSha256: 'cdc5cd987d42a433a88fb84469cab5c56e5183e2b86a6d14e7c098b91fe2e2f9',
  bundleSha256: '60f08e9e7875a45ae5745789940254b45572253205551e2147b058c997569dc3',
  extractionVersion: 'studio-world-icons-v6-grid-calibration',
  opticalLockVersion: 'studio-world-icons-v6-grid-calibration',
  gridCalibrationVersion: 'studio-world-icon-grid-calibration-v1',
  lockdownCertified: false,
  v2PipelineFrozen: true,
  v3PipelineRetired: true,
  v4PipelineRetired: true,
  v5PipelineRetired: true,
  iconCount: 64,
  auditPass: 64,
  auditWarn: 0,
  auditFail: 0,
  mode: 'grid-calibration-v6' as const,
  sourceRole: 'unlabeled-grid-calibrated' as const,
} as const;

export type ExperienceLabIconSpriteConfig = typeof EXPERIENCE_LAB_ICON_SPRITE_CONFIG;
