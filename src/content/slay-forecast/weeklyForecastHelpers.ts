import type { ForecastEdition } from './editionTypes';
import type { ForecastObservation, ForecastPulse, WeeklyForecastLifecycleStatus } from './weeklyForecastTypes';

/** Supporting observations — prefer canonical field, fall back during migration. */
export function getEditionObservations(edition: ForecastEdition): ForecastObservation[] {
  if (edition.observations?.length) {
    return [...edition.observations].sort(
      (a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0),
    );
  }
  return edition.signals.map((s, index) => ({
    id: s.id,
    label: s.label,
    description: s.shortDescription,
    category: s.category,
    categoryLabel: s.categoryLabel,
    momentum: s.momentum,
    displayOrder: index,
    overlayZone: s.overlayZone,
    relatedTrendReportId: s.relatedTrendReportId,
    linkedSignalId: s.linkedSignalId,
  }));
}

export function getEditionPulses(edition: ForecastEdition): ForecastPulse[] {
  return edition.pulses ?? [];
}

export function getNewestPublishedPulse(edition: ForecastEdition): ForecastPulse | undefined {
  return getEditionPulses(edition)
    .filter((p) => p.status === 'published')
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))[0];
}

export function isEditionNavigable(edition: ForecastEdition): boolean {
  if (edition.lifecycleStatus === 'draft' || edition.lifecycleStatus === 'scheduled') {
    return false;
  }
  if (edition.status === 'developing' || edition.status === 'upcoming') return false;
  if (edition.lifecycleStatus === 'developing') return false;
  return edition.status === 'published' || edition.status === 'current';
}

export function resolveLifecycleStatus(edition: ForecastEdition): WeeklyForecastLifecycleStatus {
  if (edition.lifecycleStatus) return edition.lifecycleStatus;
  if (edition.status === 'current') return 'live';
  if (edition.status === 'published') return 'final';
  if (edition.status === 'developing' || edition.status === 'upcoming') return 'developing';
  return 'draft';
}

export function formatEditionPeriodRange(edition: ForecastEdition): string {
  return edition.displayPeriod.replace(/\s*[–-]\s*/g, ' — ');
}

export function formatEditionSummaryKicker(edition: ForecastEdition): string {
  const period = formatEditionPeriodRange(edition);
  const isCurrent = edition.status === 'current' || edition.isCurrent;
  if (isCurrent) return `THIS WEEK · ${period}`;
  if (edition.finalStatusLabel) return `${period} · ${edition.finalStatusLabel}`;
  return `FORECAST · ${period}`;
}

export function formatWeeklyForecastHeadline(edition: ForecastEdition): string {
  return edition.headline;
}

export function formatPrimaryForecastOverlay(edition: ForecastEdition): {
  label: string;
  action: string;
} {
  return {
    label: edition.primaryForecastLabel ?? edition.headline.split(' ARE ')[0] ?? edition.headline,
    action: edition.primaryForecastAction ?? 'MOVING IN',
  };
}

/** Editorial bullets for dashboard — derived from observations, not invented copy. */
export function getWhyItsMovingBullets(edition: ForecastEdition): string[] {
  const observations = getEditionObservations(edition).slice(0, 4);
  if (observations.length === 0 && edition.outlook) {
    return [edition.outlook];
  }
  return observations.map((observation) => {
    const detail = observation.description?.trim();
    if (detail) return detail.endsWith('.') ? detail : `${detail}.`;
    return `${observation.label.toLowerCase()} gaining visibility across current signals.`;
  });
}

export type ForecastWeekDayMarker = {
  label: string;
  isoDate: string;
  intensity: number;
  note?: string;
};

/** Same-week intensity tier — NOT separate daily forecasts. */
export type ForecastWeekDayPulseTier = 1 | 2 | 3;

export type ForecastWeekDayPulse = {
  label: string;
  isoDate: string;
  tier: ForecastWeekDayPulseTier;
};

const MOMENTUM_WEEK_PROGRESSION: Record<
  NonNullable<ForecastEdition['momentum']>,
  ForecastWeekDayPulseTier[]
> = {
  emerging: [1, 1, 1, 1, 2, 2, 2],
  rising: [1, 1, 1, 2, 2, 2, 2],
  accelerating: [1, 1, 2, 2, 2, 3, 3],
  holding: [1, 1, 1, 1, 1, 1, 1],
  cooling: [2, 2, 1, 1, 1, 1, 1],
};

export function pulseTierToArrows(tier: ForecastWeekDayPulseTier): string {
  if (tier >= 3) return '↑↑↑';
  if (tier === 2) return '↑↑';
  return '↑';
}

export function getEditionDashboardSummary(edition: ForecastEdition): string {
  const explicit = edition.dashboardSummary?.trim();
  if (explicit) return explicit;
  const outlook = edition.outlook?.trim();
  if (outlook) return outlook;
  return edition.shortForecast?.trim() ?? '';
}

export function getEditionConfidenceLabel(edition: ForecastEdition): string {
  if (edition.confidenceLabel) return edition.confidenceLabel;
  const observations = getEditionObservations(edition);
  const highCount = observations.filter((o) => o.evidenceStrength === 'high').length;
  if (highCount >= 2 || edition.momentum === 'accelerating') return 'HIGH';
  if (observations.some((o) => o.evidenceStrength === 'medium')) return 'MODERATE';
  return 'BUILDING';
}

export function getWeeklyPulseCaption(edition: ForecastEdition): string {
  const explicit = edition.weeklyPulseCaption?.trim();
  if (explicit) return explicit;
  const pulse = getNewestPublishedPulse(edition);
  if (pulse?.type === 'momentum_update') {
    return 'MOVEMENT IS PICKING UP THROUGH THE WEEK.';
  }
  switch (edition.momentum) {
    case 'accelerating':
      return 'MOMENTUM IS BUILDING THROUGH THE WEEK.';
    case 'rising':
      return 'SIGNALS ARE STRENGTHENING THROUGH THE WEEK.';
    case 'holding':
      return 'THE CALL IS HOLDING STEADY THROUGH THE WEEK.';
    case 'cooling':
      return 'MOVEMENT IS SOFTENING THROUGH THE WEEK.';
    default:
      return 'WATCH THE WEEKLY TRAJECTORY.';
  }
}

export function formatPulseUpdateLabel(publishedAt: string): string {
  const date = new Date(publishedAt);
  if (Number.isNaN(date.getTime())) return 'UPDATED';
  const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'] as const;
  const months = [
    'JAN',
    'FEB',
    'MAR',
    'APR',
    'MAY',
    'JUN',
    'JUL',
    'AUG',
    'SEP',
    'OCT',
    'NOV',
    'DEC',
  ] as const;
  return `UPDATED ${days[date.getDay()]} · ${months[date.getMonth()]} ${date.getDate()}`;
}

export function buildForecastWeekPulseDays(edition: ForecastEdition): ForecastWeekDayPulse[] {
  const markers = buildForecastWeekTimeline(edition);
  const baseProgression =
    MOMENTUM_WEEK_PROGRESSION[edition.momentum ?? 'rising'] ?? MOMENTUM_WEEK_PROGRESSION.rising;
  const pulses = getEditionPulses(edition)
    .filter((p) => p.status === 'published')
    .sort((a, b) => a.publishedAt.localeCompare(b.publishedAt));
  const latestPulseDate = pulses[pulses.length - 1]?.publishedAt.slice(0, 10);

  return markers.map((marker, index) => {
    let tier = baseProgression[index] ?? 1;
    if (latestPulseDate && marker.isoDate >= latestPulseDate && tier < 2) {
      tier = 2;
    }
    if (latestPulseDate && marker.isoDate > latestPulseDate && tier < 3) {
      tier = (tier + 1) as ForecastWeekDayPulseTier;
    }
    return {
      label: marker.label,
      isoDate: marker.isoDate,
      tier: Math.min(3, Math.max(1, tier)) as ForecastWeekDayPulseTier,
    };
  });
}

/** Luxury week trajectory — intensity from pulses mapped to weekdays. */
export function buildForecastWeekTimeline(edition: ForecastEdition): ForecastWeekDayMarker[] {
  const start = new Date(`${edition.periodStart}T12:00:00`);
  const labels = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  const pulses = getEditionPulses(edition).filter((p) => p.status === 'published');

  return labels.map((label, index) => {
    const day = new Date(start);
    day.setDate(start.getDate() + index);
    const isoDate = day.toISOString().slice(0, 10);
    const pulse = pulses.find((p) => p.publishedAt.slice(0, 10) === isoDate);
    const base = edition.momentum === 'accelerating' ? 0.42 : 0.34;
    const intensity = pulse ? Math.min(1, base + 0.22 + index * 0.04) : base + index * 0.03;
    return {
      label,
      isoDate,
      intensity: Math.min(1, intensity),
      note: pulse?.headline,
    };
  });
}
