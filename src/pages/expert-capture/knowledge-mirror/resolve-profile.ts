import {
  ALL_IN_ONE_PERMITTING_PROFILE,
  DEFAULT_EXPERT_CAPTURE_PROFILE,
  TAX_PREPARATION_PROFILE,
  getExpertCaptureProfile,
} from '../../../studio-os-core/expert-capture/profiles';
import type { ExpertCaptureProfile } from '../../../studio-os-core/expert-capture/profiles/profile-types';
import { loadSession } from '../../../studio-os-core/expert-capture';

const SLUG_TO_PROFILE: Record<string, ExpertCaptureProfile> = {
  '': DEFAULT_EXPERT_CAPTURE_PROFILE,
  generic: DEFAULT_EXPERT_CAPTURE_PROFILE,
  'tax-preparation': TAX_PREPARATION_PROFILE,
  'all-in-one-permitting': ALL_IN_ONE_PERMITTING_PROFILE,
};

export function resolveProfileFromSlug(slug: string | undefined): ExpertCaptureProfile {
  if (!slug) return DEFAULT_EXPERT_CAPTURE_PROFILE;
  return SLUG_TO_PROFILE[slug] ?? getExpertCaptureProfile(slug) ?? DEFAULT_EXPERT_CAPTURE_PROFILE;
}

export function profileSlug(profile: ExpertCaptureProfile): string {
  if (profile.id === TAX_PREPARATION_PROFILE.id) return 'tax-preparation';
  if (profile.id === ALL_IN_ONE_PERMITTING_PROFILE.id) return 'all-in-one-permitting';
  return 'generic';
}

export function loadSessionIdentity(profile: ExpertCaptureProfile) {
  const session = loadSession(profile);
  if (!session?.meta.expertName) return null;
  return {
    expertName: session.meta.expertName,
    expertRole: session.meta.expertRole,
    organizationLabel: session.meta.organizationLabel,
  };
}

export function mirrorNavLinks(profile: ExpertCaptureProfile) {
  const slug = profileSlug(profile);
  const prefix = slug === 'generic' ? '/expert-capture' : `/expert-capture/${slug}`;
  return {
    interview: profile.route,
    stream: `${prefix}/knowledge-stream`,
    confessional: `${prefix}/confessional`,
    ownerMirror: `${prefix}/owner-mirror`,
    knowledgeVault: `${prefix}/knowledge-vault`,
    trustDashboard: `${prefix}/trust-dashboard`,
    livingWorker: `${prefix}/living-worker`,
  };
}
