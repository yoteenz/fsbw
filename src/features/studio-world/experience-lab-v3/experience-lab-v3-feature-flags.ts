import { canAccessStudioAdministration } from '../../../studio-os-core/application/portfolio-access';

export type ExperienceLabV3FeatureFlags = {
  experienceLabV3Enabled: boolean;
  worldBuilderAliasEnabled: boolean;
  spotlightSearchEnabled: boolean;
  aiAssistantEnabled: boolean;
  queueBoardDragEnabled: boolean;
  liveOperationsTickerEnabled: boolean;
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

/** V3 is experimental — gated behind admin + explicit flag. V2 unaffected. */
export function resolveExperienceLabV3FeatureFlags(): ExperienceLabV3FeatureFlags {
  const admin = canAccessStudioAdministration();
  return {
    experienceLabV3Enabled: admin && envFlag('VITE_EXPERIENCE_LAB_V3_ENABLED', true),
    worldBuilderAliasEnabled: admin && envFlag('VITE_EXPERIENCE_LAB_V3_WORLD_BUILDER', true),
    spotlightSearchEnabled: admin && envFlag('VITE_EXPERIENCE_LAB_V3_SPOTLIGHT', true),
    aiAssistantEnabled: admin && envFlag('VITE_EXPERIENCE_LAB_V3_AI_ASSISTANT', true),
    queueBoardDragEnabled: admin && envFlag('VITE_EXPERIENCE_LAB_V3_QUEUE_DRAG', false),
    liveOperationsTickerEnabled: admin && envFlag('VITE_EXPERIENCE_LAB_V3_OPS_TICKER', true),
  };
}
