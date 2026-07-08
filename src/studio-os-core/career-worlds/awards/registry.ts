import type { CareerAwardRecord } from '../core/schemas';

export const AWARD_CATALOG: Array<Omit<CareerAwardRecord, 'id' | 'awardedDay'>> = [
  { title: 'Rising Professional', issuer: 'Industry Guild', category: 'recognition' },
  { title: 'Client Excellence', issuer: 'Professional Trust Board', category: 'service' },
  { title: 'Innovation Pioneer', issuer: 'World Congress', category: 'innovation' },
  { title: 'Master Mentor', issuer: 'Career Worlds Council', category: 'mentorship' },
  { title: 'Community Builder', issuer: 'Professional Network', category: 'community' },
];

export function grantAward(
  awards: CareerAwardRecord[],
  template: Omit<CareerAwardRecord, 'id' | 'awardedDay'>,
  day: number
): CareerAwardRecord[] {
  const award: CareerAwardRecord = {
    ...template,
    id: `award-${day}-${awards.length}`,
    awardedDay: day,
  };
  return [award, ...awards].slice(0, 30);
}

export function eligibleAward(
  reputation: number,
  experience: number
): Omit<CareerAwardRecord, 'id' | 'awardedDay'> | null {
  if (reputation >= 90 && experience >= 80) return AWARD_CATALOG[3]!;
  if (reputation >= 75) return AWARD_CATALOG[1]!;
  if (experience >= 40) return AWARD_CATALOG[0]!;
  return null;
}
