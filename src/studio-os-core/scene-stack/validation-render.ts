/**
 * Experience Lab validation render — ephemeral compile path.
 * Permitted: mount draft_ready layers in World Compiler, no Asset Registry promotion.
 */

export type ValidationRenderMode = 'production' | 'experience-lab-validation';

let activeMode: ValidationRenderMode = 'production';

export function setValidationRenderMode(mode: ValidationRenderMode): void {
  activeMode = mode;
}

export function getValidationRenderMode(): ValidationRenderMode {
  return activeMode;
}

export function isExperienceLabValidationRender(): boolean {
  return activeMode === 'experience-lab-validation';
}

export const VALIDATION_RENDER_AUTHORIZATION = {
  assetRegistryWrites: false,
  productionAuthorization: false,
  publishing: false,
  ephemeralMount: true,
  sceneStackLocalDraft: true,
} as const;
