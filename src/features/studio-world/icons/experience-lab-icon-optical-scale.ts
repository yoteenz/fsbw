import { resolveStudioWorldIconPresentation } from './experience-lab-icon-presentation';
import type { ExperienceLabIconName } from './experience-lab-icon-registry';

/** @deprecated Prefer resolveStudioWorldIconPresentation from experience-lab-icon-presentation.ts */
export function resolveExperienceLabIconOpticalScale(name: ExperienceLabIconName): number {
  return resolveStudioWorldIconPresentation(name).scale;
}

export {
  resolveStudioWorldIconPresentation as resolveExperienceLabIconOpticalProfile,
} from './experience-lab-icon-presentation';

export {
  STUDIO_WORLD_ICON_PRESENTATION_VERSION as EXPERIENCE_LAB_ICON_OPTICAL_CERTIFICATION_VERSION,
} from './experience-lab-icon-presentation';

/** @deprecated Use StudioWorldIconPresentationRegistry */
export { StudioWorldIconPresentationRegistry as EXPERIENCE_LAB_ICON_OPTICAL_PROFILE } from './experience-lab-icon-presentation';
