import { CAMPUS_TRANSITION_SPEED_KEY, type CampusTransitionSpeed } from './types';

export const DEFAULT_CAMPUS_TRANSITION_SPEED: CampusTransitionSpeed = 'cinematic';

export function readCampusTransitionSpeed(): CampusTransitionSpeed {
  if (typeof window === 'undefined') return DEFAULT_CAMPUS_TRANSITION_SPEED;
  try {
    const raw = localStorage.getItem(CAMPUS_TRANSITION_SPEED_KEY);
    if (raw === 'cinematic' || raw === 'standard' || raw === 'instant') return raw;
  } catch {
    /* ignore */
  }
  return DEFAULT_CAMPUS_TRANSITION_SPEED;
}

export function writeCampusTransitionSpeed(speed: CampusTransitionSpeed): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CAMPUS_TRANSITION_SPEED_KEY, speed);
}

export function campusTransitionDurations(speed: CampusTransitionSpeed): Record<
  'departing' | 'traveling' | 'revealing' | 'concierge' | 'exiting' | 'returning',
  number
> {
  switch (speed) {
    case 'instant':
      return { departing: 0, traveling: 0, revealing: 0, concierge: 0, exiting: 0, returning: 0 };
    case 'standard':
      return { departing: 400, traveling: 1400, revealing: 800, concierge: 600, exiting: 500, returning: 1200 };
    case 'cinematic':
    default:
      return { departing: 700, traveling: 3200, revealing: 1800, concierge: 1200, exiting: 900, returning: 2400 };
  }
}
