import type { PSATodayEpisode, PSAWatchPolicy } from './types';

/** Standard PSA Today Slay Ticket entitlement defaults (Episode 01). */
export const DEFAULT_PSA_WATCH_POLICY: Required<PSAWatchPolicy> = {
  includedWatches: 3,
  qualificationPercent: 1 / 3,
  accessDurationYears: 1,
};

export function resolvePsaWatchPolicy(episode: Pick<PSATodayEpisode, 'watchPolicy'>): Required<PSAWatchPolicy> {
  const p = episode.watchPolicy;
  return {
    includedWatches: Math.max(1, Math.floor(p?.includedWatches ?? DEFAULT_PSA_WATCH_POLICY.includedWatches)),
    qualificationPercent:
      typeof p?.qualificationPercent === 'number' && p.qualificationPercent > 0 && p.qualificationPercent <= 1
        ? p.qualificationPercent
        : DEFAULT_PSA_WATCH_POLICY.qualificationPercent,
    accessDurationYears: Math.max(1, Math.floor(p?.accessDurationYears ?? DEFAULT_PSA_WATCH_POLICY.accessDurationYears)),
  };
}

/** Calendar-year expiration (e.g. Aug 8 2026 → Aug 8 2027). */
export function addCalendarYears(from: Date | string, years: number): Date {
  const d = new Date(from);
  d.setFullYear(d.getFullYear() + years);
  return d;
}

export function computePsaEntitlementExpiresAt(redeemedAt: Date | string, accessDurationYears: number): string {
  return addCalendarYears(redeemedAt, accessDurationYears).toISOString();
}

export function qualificationThresholdSeconds(
  lessonDurationSeconds: number,
  qualificationPercent: number
): number {
  const duration = Math.max(0, lessonDurationSeconds);
  if (duration <= 0) return 0;
  return Math.ceil(duration * qualificationPercent);
}

export function formatPsaAccessUntil(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).toUpperCase();
  } catch {
    return iso;
  }
}

export function watchesRemainingLabel(remaining: number, _total?: number): string {
  if (remaining <= 0) return 'WATCHES USED';
  if (remaining === 1) return '1 WATCH LEFT';
  return `${remaining} WATCHES LEFT`;
}

export function watchesRemainingDetail(remaining: number, total: number): string {
  return `${remaining} OF ${total} WATCHES REMAINING`;
}
