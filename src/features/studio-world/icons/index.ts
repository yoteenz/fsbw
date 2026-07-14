export { ExperienceLabIcon } from './ExperienceLabIcon';
export type { ExperienceLabIconProps, ExperienceLabIconSize } from './ExperienceLabIcon';
export { ExperienceLabIconPresentation } from './ExperienceLabIconPresentation';
export type { ExperienceLabIconPresentationProps } from './ExperienceLabIconPresentation';
export {
  EXPERIENCE_LAB_ICON_REGISTRY,
  EXPERIENCE_LAB_ICON_NAMES,
  isExperienceLabIconName,
} from './experience-lab-icon-registry';
export type { ExperienceLabIconName } from './experience-lab-icon-registry';
export { EXPERIENCE_LAB_ICON_SPRITE_CONFIG } from './experience-lab-icon-sprite.config';
export {
  EXPERIENCE_LAB_ICON_ASSETS,
  EXPERIENCE_LAB_ICON_LOCKDOWN_CERTIFIED,
  EXPERIENCE_LAB_ICON_V2_PIPELINE_FROZEN,
  EXPERIENCE_LAB_ICON_V3_PIPELINE_RETIRED,
  EXPERIENCE_LAB_ICON_V4_PIPELINE_RETIRED,
  EXPERIENCE_LAB_ICON_OPTICAL_LOCK_VERSION,
  EXPERIENCE_LAB_ICON_EXTRACTION_VERSION,
  EXPERIENCE_LAB_ICON_SOURCE_ROLE,
} from './experience-lab-icon-assets.generated';
export {
  STUDIO_WORLD_ICON_SOURCES,
  STUDIO_WORLD_ICON_SOURCE_MANIFEST_VERSION,
  STUDIO_WORLD_ICON_EXTRACTION_SOURCE_ROLE,
  STUDIO_WORLD_ICON_FORBIDDEN_EXTRACTION_PATHS,
  STUDIO_WORLD_ICON_V6_OUTPUT_DIR,
  STUDIO_WORLD_ICON_V6_VERSION,
  STUDIO_WORLD_ICON_V5_OUTPUT_DIR,
  STUDIO_WORLD_ICON_V5_VERSION,
  STUDIO_WORLD_ICON_V4_OUTPUT_DIR,
  STUDIO_WORLD_ICON_V4_VERSION,
  STUDIO_WORLD_ICON_GRID_CALIBRATION_PATH,
} from './studio-world-icon-source-manifest';
export {
  STUDIO_WORLD_ICON_GRID_CALIBRATION_CANONICAL,
  validateGridCalibration,
  resolveAllCalibratedCellRects,
  createDefaultGridCalibration,
} from './grid-calibration';
export type { StudioWorldIconGridCalibration, StudioWorldIconCellOverride } from './grid-calibration';
export { STUDIO_WORLD_ICON_LABEL_MASKS } from './studio-world-icon-label-mask.config';
export {
  STUDIO_WORLD_ICON_GRID_CONFIG,
  resolveStudioWorldIconCellRect,
} from './studio-world-icon-grid.config';
export {
  resolveExperienceLabIconSourceUnlabeledUrl,
  resolveExperienceLabIconSourceLabeledUrl,
  resolveExperienceLabIconSourceUnlabeledTwinUrl,
} from './experience-lab-icon-sprite.config';
export {
  resolveProductionExperienceLabIconAsset,
  resolveQaExperienceLabIconAsset,
  EXPERIENCE_LAB_ICON_OPTICAL_TUNING_PAUSED,
} from './experience-lab-icon-asset-resolver';
export {
  ExperienceLabIconPresentationSystem,
  StudioWorldIconPresentationRegistry,
  STUDIO_WORLD_ICON_PRESENTATION_VERSION,
  resolveStudioWorldIconPresentation,
  type IconPresentationProfile,
  type IconPresentationScores,
} from './experience-lab-icon-presentation';
export {
  presentExperienceLabIcon,
  resolveIconPresentation,
  resolveCanonicalIconPresentation,
  getFounderPresentationOverrides,
  setFounderPresentationOverride,
  clearFounderPresentationOverride,
  exportFounderPresentationPatchFragment,
  isFounderOpticalModeEnabled,
  setFounderOpticalModeEnabled,
  FOUNDER_OPTICAL_STORAGE_KEY,
  FOUNDER_OPTICAL_MODE_KEY,
  FOUNDER_OPTICAL_MODE_PAUSED,
  SIZE_PX,
} from './experience-lab-icon-presenter';
export {
  resolveExperienceLabIconOpticalScale,
  resolveExperienceLabIconOpticalProfile,
  EXPERIENCE_LAB_ICON_OPTICAL_PROFILE,
  EXPERIENCE_LAB_ICON_OPTICAL_CERTIFICATION_VERSION,
} from './experience-lab-icon-optical-scale';
