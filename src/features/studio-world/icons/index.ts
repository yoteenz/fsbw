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
export { EXPERIENCE_LAB_ICON_ASSETS } from './experience-lab-icon-assets.generated';
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
  SIZE_PX,
} from './experience-lab-icon-presenter';
export {
  resolveExperienceLabIconOpticalScale,
  resolveExperienceLabIconOpticalProfile,
  EXPERIENCE_LAB_ICON_OPTICAL_PROFILE,
  EXPERIENCE_LAB_ICON_OPTICAL_CERTIFICATION_VERSION,
} from './experience-lab-icon-optical-scale';
