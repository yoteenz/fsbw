import type { ExpertCaptureSession } from '../types';
import type { ExpertTrustRecord } from './types';
import { TRUST_AGREEMENT_VERSION } from './types';

export function createEmptyTrustRecord(): ExpertTrustRecord {
  return {
    welcomeCompletedAt: null,
    agreementsSignedAt: null,
    signatureName: null,
    agreementsAccepted: {},
    vaultIntroCompletedAt: null,
    agreementVersion: TRUST_AGREEMENT_VERSION,
  };
}

export function isTrustFrameworkComplete(session: ExpertCaptureSession | null): boolean {
  return Boolean(session?.meta.trustFramework?.agreementsSignedAt);
}

export function resolvePostLandingPhase(session: ExpertCaptureSession | null): 'trust_welcome' | 'trust_agreements' | 'vault_gate' | 'consent' | 'media_setup' | 'interview' | 'welcome_back' {
  if (!session) return 'trust_welcome';
  if (!session.meta.trustFramework?.welcomeCompletedAt) return 'trust_welcome';
  if (!session.meta.trustFramework?.agreementsSignedAt) return 'trust_agreements';
  if (!session.meta.trustFramework?.vaultIntroCompletedAt) return 'vault_gate';
  if (!session.meta.consentAcceptedAt) return 'consent';
  if (!session.meta.startedAt) return 'media_setup';
  return 'interview';
}
