import {
  ALL_IN_ONE_PERMITTING_PROFILE,
  DEFAULT_EXPERT_CAPTURE_PROFILE,
  TAX_PREPARATION_PROFILE,
} from '../profiles';
import type { ExpertCaptureProfile } from '../profiles/profile-types';

export type InviteProfileOption = {
  id: string;
  label: string;
  companyId: string;
  profile: ExpertCaptureProfile;
};

/** Registry for invite interview types — add profiles here, not new pages. */
export const INVITE_PROFILE_OPTIONS: InviteProfileOption[] = [
  {
    id: TAX_PREPARATION_PROFILE.id,
    label: 'Tax Preparation Expert Capture',
    companyId: TAX_PREPARATION_PROFILE.companyId,
    profile: TAX_PREPARATION_PROFILE,
  },
  {
    id: ALL_IN_ONE_PERMITTING_PROFILE.id,
    label: 'All In One Permitting Expert Capture',
    companyId: ALL_IN_ONE_PERMITTING_PROFILE.companyId,
    profile: ALL_IN_ONE_PERMITTING_PROFILE,
  },
  {
    id: DEFAULT_EXPERT_CAPTURE_PROFILE.id,
    label: 'Generic Expert Capture',
    companyId: DEFAULT_EXPERT_CAPTURE_PROFILE.companyId,
    profile: DEFAULT_EXPERT_CAPTURE_PROFILE,
  },
];

export function getInviteProfileLabel(profileId: string): string {
  return INVITE_PROFILE_OPTIONS.find((p) => p.id === profileId)?.label ?? 'Expert Capture Interview';
}

export function resolveInviteProfileOption(profileId: string): InviteProfileOption {
  return INVITE_PROFILE_OPTIONS.find((p) => p.id === profileId) ?? INVITE_PROFILE_OPTIONS[0]!;
}
