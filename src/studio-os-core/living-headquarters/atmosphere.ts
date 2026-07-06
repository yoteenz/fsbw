import type { LivingAtmosphereMode, LivingHeadquartersState, LivingSeason } from './types';

type MilestoneLike = { id: string; recordedAt: string };

function isHolidaySeason(date: Date): boolean {
  const m = date.getMonth();
  const d = date.getDate();
  return (m === 11 && d >= 15) || (m === 0 && d <= 5);
}

function daysSince(iso: string, now: Date): number {
  return (now.getTime() - new Date(iso).getTime()) / 86_400_000;
}

function isOrganizationAnniversary(foundedAt: string | null | undefined, now: Date): boolean {
  if (!foundedAt) return false;
  const f = new Date(foundedAt);
  return f.getMonth() === now.getMonth() && f.getDate() === now.getDate();
}

export function resolveAtmosphereMode(
  milestones: MilestoneLike[],
  organizationFoundedAt: string | null | undefined,
  healthScore: number,
  now = new Date(),
  options?: { allowHolidayAtmosphere?: boolean }
): LivingAtmosphereMode {
  if (healthScore > 0 && healthScore < 35) return 'emergency';

  if (options?.allowHolidayAtmosphere !== false && isHolidaySeason(now)) return 'holiday';

  if (isOrganizationAnniversary(organizationFoundedAt, now)) return 'anniversary';

  for (const m of milestones) {
    if (m.id === 'first-publish' && daysSince(m.recordedAt, now) <= 3) return 'launch-day';
    if (m.id === 'first-revenue' && daysSince(m.recordedAt, now) <= 5) return 'celebration';
    if (m.id === 'first-100-pages' && daysSince(m.recordedAt, now) <= 7) return 'celebration';
  }

  const day = now.getDay();
  if (day === 1 && now.getHours() < 12) return 'executive-review';

  return 'default';
}

export function atmosphereModeLabel(mode: LivingAtmosphereMode): string {
  switch (mode) {
    case 'celebration':
      return 'Celebration · warmer light · crystal illumination';
    case 'anniversary':
      return 'Organization anniversary · commemorative display active';
    case 'launch-day':
      return 'Launch day · focused energy · crystal emphasis';
    case 'focus-week':
      return 'Focus week · calm executive atmosphere';
    case 'holiday':
      return 'Holiday season · refined warmth';
    case 'executive-review':
      return 'Executive review · morning clarity';
    case 'emergency':
      return 'Response mode · calm confidence';
    default:
      return 'Executive headquarters · living environment';
  }
}

export function applySeasonEffects(
  season: LivingSeason,
  mode: LivingAtmosphereMode
): Pick<
  LivingHeadquartersState,
  'crystalIllumination' | 'floralAccent' | 'frostAccent' | 'goldenHour' | 'commemorativeDisplay'
> {
  const celebration = mode === 'celebration' || mode === 'anniversary' || mode === 'launch-day';

  return {
    crystalIllumination: celebration,
    floralAccent: season === 'spring' || (celebration && season !== 'winter'),
    frostAccent: season === 'winter' && mode !== 'celebration',
    goldenHour: season === 'autumn' || mode === 'anniversary',
    commemorativeDisplay: mode === 'anniversary' || mode === 'celebration',
  };
}
