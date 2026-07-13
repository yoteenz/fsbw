import type { LightingProfileSpec } from './construction-plan-schema';

export const LIGHTING_PROFILE_SYSTEM_VERSION = 'lighting-profile-system.v1';

export function defineLightingProfile(profile: LightingProfileSpec): LightingProfileSpec {
  return profile;
}

export function assertLightingProfileComplete(
  profile: LightingProfileSpec
): { ok: true } | { ok: false; missing: string[] } {
  const missing: string[] = [];
  if (!profile.profileId) missing.push('profileId');
  if (!profile.version) missing.push('version');
  if (profile.colorTemperatureK <= 0) missing.push('colorTemperatureK');
  if (profile.reflectionIntensity < 0 || profile.reflectionIntensity > 1) missing.push('reflectionIntensity');
  if (profile.shadowSoftness < 0 || profile.shadowSoftness > 1) missing.push('shadowSoftness');
  if (profile.bounceCount < 0) missing.push('bounceCount');
  if (!profile.ambientProfile) missing.push('ambientProfile');
  if (missing.length > 0) return { ok: false, missing };
  return { ok: true };
}

/** No model invents lighting — profile is authoritative */
export function buildLightingWorkerPayload(profile: LightingProfileSpec): {
  profileId: string;
  version: string;
  colorTemperatureK: number;
  reflectionIntensity: number;
  shadowSoftness: number;
  bounceCount: number;
  glassResponse: number;
  materialResponse: number;
  ambientProfile: string;
} {
  return {
    profileId: profile.profileId,
    version: profile.version,
    colorTemperatureK: profile.colorTemperatureK,
    reflectionIntensity: profile.reflectionIntensity,
    shadowSoftness: profile.shadowSoftness,
    bounceCount: profile.bounceCount,
    glassResponse: profile.glassResponse,
    materialResponse: profile.materialResponse,
    ambientProfile: profile.ambientProfile,
  };
}
