/**
 * Experience Lab validation render — ephemeral compile path.
 * Permitted: mount draft_ready layers in World Compiler, no Asset Registry promotion.
 */
import { logCompilerEvent } from '../../studio-os/diagnostics/world-compiler-investigation';
import { attachEphemeralCompileAuth } from '../creative-production/ephemeral-compile-auth-session';

export type ValidationRenderMode = 'production' | 'experience-lab-validation';

let activeMode: ValidationRenderMode = 'production';

export function setValidationRenderMode(mode: ValidationRenderMode): void {
  logCompilerEvent('CONTEXT_UPDATED', 'validation-render.setValidationRenderMode', {
    detail: { mode, previous: activeMode },
  });
  activeMode = mode;
}

export function getValidationRenderMode(): ValidationRenderMode {
  return activeMode;
}

export function isExperienceLabValidationRender(): boolean {
  return activeMode === 'experience-lab-validation';
}

let activePreviewSessionId: string | null = null;

export function setValidationPreviewSession(sessionId: string | null): void {
  logCompilerEvent('CONTEXT_UPDATED', 'validation-render.setValidationPreviewSession', {
    detail: { sessionId, previous: activePreviewSessionId },
  });
  activePreviewSessionId = sessionId;
}

export function getValidationPreviewSession(): string | null {
  return activePreviewSessionId;
}

export const VALIDATION_RENDER_AUTHORIZATION = {
  assetRegistryWrites: false,
  productionAuthorization: 'server-issued-ephemeral',
  publishing: false,
  ephemeralMount: true,
  sceneStackLocalDraft: true,
} as const;

export type ValidationCompileAuthContext = {
  validationMode: boolean;
  compileRunId?: string | null;
  previewSessionId?: string | null;
  organizationId?: string;
  departmentId?: string;
  stationId?: string;
  projectId?: string;
};

export function withValidationEphemeralAuth<T extends Record<string, unknown>>(
  payload: T,
  ctx: ValidationCompileAuthContext
): ReturnType<typeof attachEphemeralCompileAuth<T>> {
  return attachEphemeralCompileAuth(payload, ctx);
}

export {
  setActiveEphemeralCompileAuthorization,
  getActiveEphemeralCompileAuthorization,
  clearActiveEphemeralCompileAuthorization,
} from '../creative-production/ephemeral-compile-auth-session';

export type { EphemeralCompileAuthGrant } from '../creative-production/ephemeral-compile-auth-session';
