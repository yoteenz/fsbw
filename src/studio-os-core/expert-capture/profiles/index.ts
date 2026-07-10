import { DEFAULT_EXPERT_CAPTURE_PROFILE } from './default-profile';
import { ALL_IN_ONE_PERMITTING_PROFILE } from './all-in-one-permitting-profile';
import { TAX_PREPARATION_PROFILE } from './tax-preparation-profile';
import type { ExpertCaptureProfile } from './profile-types';

export const EXPERT_CAPTURE_PROFILES: Record<string, ExpertCaptureProfile> = {
  [DEFAULT_EXPERT_CAPTURE_PROFILE.id]: DEFAULT_EXPERT_CAPTURE_PROFILE,
  [ALL_IN_ONE_PERMITTING_PROFILE.id]: ALL_IN_ONE_PERMITTING_PROFILE,
  [TAX_PREPARATION_PROFILE.id]: TAX_PREPARATION_PROFILE,
};

export function getExpertCaptureProfile(profileId?: string | null): ExpertCaptureProfile {
  if (profileId && EXPERT_CAPTURE_PROFILES[profileId]) {
    return EXPERT_CAPTURE_PROFILES[profileId];
  }
  return DEFAULT_EXPERT_CAPTURE_PROFILE;
}

export { DEFAULT_EXPERT_CAPTURE_PROFILE, ALL_IN_ONE_PERMITTING_PROFILE, TAX_PREPARATION_PROFILE };
export type { ExpertCaptureProfile, ExpertCaptureBranding } from './profile-types';
