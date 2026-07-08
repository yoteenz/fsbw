import { getExchangeCertification } from '../certifications/registry';
import type { CertificationRewardBundle } from './schema';

export function buildCertificationRewardBundle(certificationId: string): CertificationRewardBundle | null {
  const cert = getExchangeCertification(certificationId);
  if (!cert) return null;

  return {
    certificationId,
    unlocks: cert.unlocks,
    exchangeCredits: 25,
    mentorPoints: cert.unlocks.some((u) => u.kind === 'mentorship') ? 50 : undefined,
    heroObjectIds: cert.unlocks.filter((u) => u.kind === 'hero-object').map((u) => u.targetId),
  };
}
