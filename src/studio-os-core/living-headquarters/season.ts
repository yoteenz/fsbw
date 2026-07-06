import type { LivingSeason } from './types';

/** Northern-hemisphere tasteful seasons — subtle, never gimmicky. */
export function resolveLivingSeason(date = new Date()): LivingSeason {
  const month = date.getMonth();
  if (month === 11 || month <= 1) return 'winter';
  if (month >= 2 && month <= 4) return 'spring';
  if (month >= 5 && month <= 7) return 'summer';
  return 'autumn';
}

export function seasonAtmosphereLabel(season: LivingSeason): string {
  switch (season) {
    case 'winter':
      return 'Softer daylight · crystal frost at the windows';
    case 'spring':
      return 'Brighter natural light · renewed atmosphere';
    case 'summer':
      return 'Vibrant daylight · open energetic feeling';
    case 'autumn':
      return 'Golden afternoon · executive warmth';
  }
}
