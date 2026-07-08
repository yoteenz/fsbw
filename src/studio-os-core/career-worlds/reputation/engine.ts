import type { CareerPlayerProfile } from '../core/schemas';

export function adjustReputation(profile: CareerPlayerProfile, delta: number): CareerPlayerProfile {
  const professionalReputation = Math.max(0, Math.min(100, profile.professionalReputation + delta));
  return { ...profile, professionalReputation, updatedAt: new Date().toISOString() };
}

export function reputationTier(score: number): string {
  if (score >= 90) return 'Master Professional';
  if (score >= 75) return 'Trusted Specialist';
  if (score >= 55) return 'Rising Professional';
  if (score >= 30) return 'Known Contributor';
  return 'New Arrival';
}

export function promotionProgress(profile: CareerPlayerProfile): number {
  const phaseTargets: Record<string, number> = {
    entry: 15,
    apprentice: 30,
    operator: 50,
    specialist: 65,
    leader: 78,
    founder: 88,
    'master-professional': 95,
    mentor: 100,
  };
  const target = phaseTargets[profile.currentPhase] ?? 50;
  return Math.min(100, Math.round((profile.experience / target) * 100));
}
