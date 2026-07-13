import { canAccessStudioAdministration } from '../../../studio-os-core/application/portfolio-access';

export type ExperienceLabV2FeatureFlags = {
  experienceLabV2Enabled: boolean;
  experienceLabV2LiveActionsEnabled: boolean;
  experienceLabV2EnvironmentAssetEnabled: boolean;
  experienceLabV2DiagnosticsEnabled: boolean;
  experienceLabV2MobileDockEnabled: boolean;
  experienceLabV2ComponentReviewEnabled: boolean;
};

function envFlag(key: string, defaultValue = false): boolean {
  try {
    const raw = import.meta.env[key];
    if (raw === 'true' || raw === '1') return true;
    if (raw === 'false' || raw === '0') return false;
  } catch {
    /* ignore */
  }
  return defaultValue;
}

/** Client-readable flags — writes still require server enforcement. */
export function resolveExperienceLabV2FeatureFlags(): ExperienceLabV2FeatureFlags {
  const admin = canAccessStudioAdministration();
  return {
    experienceLabV2Enabled: admin && envFlag('VITE_EXPERIENCE_LAB_V2_ENABLED', true),
    experienceLabV2LiveActionsEnabled: admin && envFlag('VITE_EXPERIENCE_LAB_V2_LIVE_ACTIONS', false),
    experienceLabV2EnvironmentAssetEnabled: envFlag('VITE_EXPERIENCE_LAB_V2_ENVIRONMENT', true),
    experienceLabV2DiagnosticsEnabled: admin && envFlag('VITE_EXPERIENCE_LAB_V2_DIAGNOSTICS', true),
    experienceLabV2MobileDockEnabled: envFlag('VITE_EXPERIENCE_LAB_V2_MOBILE_DOCK', true),
    experienceLabV2ComponentReviewEnabled: admin && envFlag('VITE_EXPERIENCE_LAB_V2_COMPONENT_REVIEW', true),
  };
}

/** Server-side enforcement for production writes from V2. */
export function assertExperienceLabV2LiveWriteAllowed(headers: { 'x-elab-v2-mode'?: string }): {
  ok: boolean;
  code?: string;
  message?: string;
} {
  const mode = headers['x-elab-v2-mode'];
  if (mode !== 'CONTROLLED_LIVE') {
    return { ok: false, code: 'V2_READ_ONLY', message: 'Experience Lab V2 live writes require CONTROLLED_LIVE mode.' };
  }
  if (!envFlag('VITE_EXPERIENCE_LAB_V2_LIVE_ACTIONS', false)) {
    return { ok: false, code: 'V2_LIVE_DISABLED', message: 'Experience Lab V2 live actions are disabled server-side.' };
  }
  return { ok: true };
}
