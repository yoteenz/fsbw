import {
  SLAY_FORECAST_BROADCAST_VIDEO_SLOT,
  SLAY_FORECAST_STUDIO_POSTER,
} from '../../constants/slayForecastBroadcast';
import { isEditionNavigable } from './weeklyForecastHelpers';
import type { ForecastEdition, ForecastEditionGroup } from './editionTypes';

const DEMO_RADAR = [
  { id: 'radar-micro-layers', label: 'MICRO LAYERS', status: 'forming' as const },
  { id: 'radar-diffused-copper', label: 'DIFFUSED COPPER', status: 'watching' as const },
  { id: 'radar-sculpted-side-part', label: 'SCULPTED SIDE PART', status: 'early' as const },
];

const AUG_10_OBSERVATIONS: ForecastEdition['observations'] = [
  {
    id: 'obs-aug10-face-framing',
    label: 'FACE-FRAMING MOVEMENT',
    description: 'Side parts and face-framing layers gaining editorial momentum.',
    category: 'styling',
    categoryLabel: 'STYLING',
    momentum: 'rising',
    evidenceStrength: 'high',
    displayOrder: 0,
    overlayZone: 'broadcast-left',
    linkedSignalId: 'fall-2026-signal-04',
    relatedTrendReportId: 'trend-report-summer',
  },
  {
    id: 'obs-aug10-airy-layers',
    label: 'AIRY LAYERS',
    description: 'Soft separation and airy length replacing over-defined structure.',
    category: 'texture',
    categoryLabel: 'TEXTURE',
    momentum: 'accelerating',
    evidenceStrength: 'high',
    displayOrder: 1,
    overlayZone: 'broadcast-left',
    linkedSignalId: 'fall-2026-signal-01',
    relatedTrendReportId: 'trend-report-summer',
  },
  {
    id: 'obs-aug10-airy-finishes',
    label: 'GLOSSY MOVEMENT',
    description: 'Reflective movement and shine returning in editorial framing.',
    category: 'styling',
    categoryLabel: 'STYLING',
    momentum: 'rising',
    evidenceStrength: 'medium',
    displayOrder: 2,
    overlayZone: 'broadcast-right',
    relatedTrendReportId: 'trend-report-summer',
  },
  {
    id: 'obs-aug10-softer-silhouettes',
    label: 'SOFT SEPARATION',
    description: 'Rounded, fluid shapes holding while structure softens at the edges.',
    category: 'silhouette',
    categoryLabel: 'SILHOUETTE',
    momentum: 'holding',
    evidenceStrength: 'medium',
    displayOrder: 3,
    overlayZone: 'broadcast-bottom',
    linkedSignalId: 'fall-2026-signal-03',
    relatedTrendReportId: 'trend-report-summer',
  },
];

export const SLAY_FORECAST_EDITIONS: ForecastEdition[] = [
  {
    id: 'forecast-2026-08-03',
    slug: 'forecast-2026-08-03',
    periodStart: '2026-08-03',
    periodEnd: '2026-08-09',
    displayDate: '2026-08-03',
    displayPeriod: 'AUG 03–09',
    season: 'fall',
    year: 2026,
    status: 'published',
    headline: 'POLISHED TEXTURE HOLDS',
    shortForecast:
      'Last week we called soft structure and dimensional brunette — movement stayed editorial, not overdone.',
    primaryForecastLabel: 'POLISHED TEXTURE',
    primaryForecastAction: 'HOLDS',
    outlook:
      'Editorial texture stayed believable — soft layers held without collapsing into flatness. Dimensional brunette depth continued to read premium on camera.',
    momentum: 'holding',
    lifecycleStatus: 'final',
    finalStatus: 'strengthened',
    finalStatusLabel: 'STRENGTHENED ↑',
    broadcastPoster: SLAY_FORECAST_STUDIO_POSTER,
    duration: 15,
    openingCueEnd: 4,
    forecastRevealCue: 4,
    closingCue: 11,
    completeCue: 15,
    linkedSeasonId: 'fall-2026',
    relatedTrendReportIds: ['trend-report-summer'],
    publishedAt: '2026-08-03',
    finalizedAt: '2026-08-09',
    isDemoFixture: true,
    transcript: {
      opening:
        'Last week we saw polished texture holding strong — soft layers, believable lace, and espresso depth staying in frame.',
      closing: 'Structure without stiffness. Still the move.',
    },
    observations: [
      {
        id: 'obs-aug03-lived-in-waves',
        label: 'LIVED-IN WAVES',
        category: 'texture',
        categoryLabel: 'TEXTURE',
        momentum: 'accelerating',
        displayOrder: 0,
        overlayZone: 'broadcast-left',
        linkedSignalId: 'fall-2026-signal-01',
        relatedTrendReportId: 'trend-report-summer',
      },
      {
        id: 'obs-aug03-espresso',
        label: 'ESPRESSO DIMENSION',
        category: 'color',
        categoryLabel: 'COLOR',
        momentum: 'rising',
        displayOrder: 1,
        overlayZone: 'broadcast-right',
        linkedSignalId: 'fall-2026-signal-02',
        relatedTrendReportId: 'trend-report-summer',
      },
      {
        id: 'obs-aug03-hairlines',
        label: 'SOFTER HAIRLINES',
        category: 'lace',
        categoryLabel: 'LACE',
        momentum: 'accelerating',
        displayOrder: 2,
        overlayZone: 'broadcast-left',
        linkedSignalId: 'fall-2026-signal-03',
        relatedTrendReportId: 'trend-report-summer',
      },
    ],
    signals: [],
  },
  {
    id: 'forecast-2026-08-10',
    slug: 'forecast-2026-08-10',
    periodStart: '2026-08-10',
    periodEnd: '2026-08-16',
    displayDate: '2026-08-10',
    displayPeriod: 'AUG 10–16',
    season: 'fall',
    year: 2026,
    status: 'current',
    headline: 'SOFT LAYERS ARE MOVING IN.',
    shortForecast:
      'This week Frontal Slayer is calling soft layers — airy finishes, face-framing movement, and glossy separation building into one editorial direction.',
    optionalSubheadline: 'Polished without looking like you tried too hard.',
    primaryForecastLabel: 'SOFT LAYERS',
    primaryForecastAction: 'MOVING IN',
    dashboardSummary:
      'Airy separation, face-framing movement and glossy finishes are gaining momentum.',
    weeklyPulseCaption: 'MOVEMENT IS PICKING UP THROUGH THE WEEK.',
    confidenceLabel: 'HIGH',
    openingLine:
      'This week we\'re seeing serious movement toward soft layers — airy finishes, face-framing movement, and glossy separation.',
    closingLine: 'So basically, polished without looking like you tried too hard. You\'re welcome.',
    outlook:
      'Soft layering is the editorial call — not one isolated signal. Face-framing movement, airy length, and glossy separation are the evidence supporting the prediction.',
    momentum: 'accelerating',
    lifecycleStatus: 'live',
    isCurrent: true,
    broadcastVideo: SLAY_FORECAST_BROADCAST_VIDEO_SLOT,
    broadcastPoster: SLAY_FORECAST_STUDIO_POSTER,
    duration: 15,
    openingCueEnd: 4,
    forecastRevealCue: 4,
    closingCue: 11,
    completeCue: 15,
    linkedSeasonId: 'fall-2026',
    relatedTrendReportIds: ['trend-report-summer'],
    publishedAt: '2026-08-10',
    isDemoFixture: true,
    transcript: {
      opening:
        'This week we\'re seeing serious movement toward lived-in waves, espresso dimension and softer hairlines.',
      closing:
        'So basically, polished without looking like you tried too hard. You\'re welcome.',
    },
    radarSignals: DEMO_RADAR,
    observations: AUG_10_OBSERVATIONS,
    pulses: [
      {
        id: 'pulse-aug10-momentum',
        type: 'momentum_update',
        headline: 'Movement is picking up.',
        body: 'Face-framing layers and airy finishes are accelerating faster than Monday\'s initial read — the weekly call is strengthening.',
        publishedAt: '2026-08-12T14:00:00.000Z',
        momentumChange: 'accelerating',
        status: 'published',
      },
    ],
    signals: [],
  },
  {
    id: 'forecast-2026-08-17',
    slug: 'forecast-2026-08-17',
    periodStart: '2026-08-17',
    periodEnd: '2026-08-23',
    displayDate: '2026-08-17',
    displayPeriod: 'AUG 17–23',
    season: 'fall',
    year: 2026,
    status: 'developing',
    headline: 'SIGNALS FORMING',
    shortForecast: 'Next outlook is still assembling — early texture and color reads are on our radar.',
    lifecycleStatus: 'developing',
    broadcastPoster: SLAY_FORECAST_STUDIO_POSTER,
    duration: 15,
    openingCueEnd: 4,
    forecastRevealCue: 4,
    closingCue: 11,
    completeCue: 15,
    linkedSeasonId: 'fall-2026',
    relatedTrendReportIds: ['trend-report-summer'],
    publishedAt: '2026-08-17',
    isDemoFixture: true,
    radarSignals: DEMO_RADAR,
    observations: [],
    pulses: [],
    signals: [],
  },
];

const editionById = new Map(SLAY_FORECAST_EDITIONS.map((e) => [e.id, e]));

export function getAllForecastEditions(): ForecastEdition[] {
  return [...SLAY_FORECAST_EDITIONS].sort((a, b) => b.periodStart.localeCompare(a.periodStart));
}

export function getForecastEditionById(id: string): ForecastEdition | undefined {
  return editionById.get(id);
}

export function getForecastEditionBySlug(slug: string): ForecastEdition | undefined {
  return SLAY_FORECAST_EDITIONS.find((e) => e.slug === slug);
}

/** Resolve current edition from date range + editorial status. */
export function getCurrentForecastEdition(referenceDate = new Date()): ForecastEdition | undefined {
  const explicit = SLAY_FORECAST_EDITIONS.find((e) => e.status === 'current' || e.isCurrent);
  if (explicit) return explicit;

  const iso = referenceDate.toISOString().slice(0, 10);
  return SLAY_FORECAST_EDITIONS.find(
    (e) =>
      (e.status === 'published' || e.status === 'current') &&
      iso >= e.periodStart &&
      iso <= e.periodEnd,
  );
}

export function getAdjacentForecastEditions(editionId: string): {
  previous?: ForecastEdition;
  current: ForecastEdition;
  next?: ForecastEdition;
} | null {
  const sorted = [...SLAY_FORECAST_EDITIONS].sort((a, b) =>
    a.periodStart.localeCompare(b.periodStart),
  );
  const index = sorted.findIndex((e) => e.id === editionId);
  if (index < 0) return null;
  const current = sorted[index];

  let previous: ForecastEdition | undefined;
  for (let i = index - 1; i >= 0; i -= 1) {
    if (isEditionNavigable(sorted[i])) {
      previous = sorted[i];
      break;
    }
  }

  let next: ForecastEdition | undefined;
  for (let i = index + 1; i < sorted.length; i += 1) {
    if (isEditionNavigable(sorted[i])) {
      next = sorted[i];
      break;
    }
  }

  return { previous, current, next };
}

export function getPublishedForecastEditions(): ForecastEdition[] {
  return getAllForecastEditions().filter((e) => isEditionNavigable(e));
}

export function formatForecastEditionStatusLabel(edition: ForecastEdition): string {
  if (edition.status === 'current') return 'THIS WEEK';
  if (edition.status === 'developing' || edition.status === 'upcoming') return 'NEXT OUTLOOK';
  if (edition.status === 'published') return 'PREVIOUS FORECAST';
  if (edition.finalStatusLabel) return edition.finalStatusLabel;
  return edition.displayPeriod;
}

export function resolveEditionSignalDetailIds(
  edition: ForecastEdition,
  editionSignalId: string,
): { seasonId: string; signalId: string } | null {
  const observation = edition.observations?.find((o) => o.id === editionSignalId);
  if (observation?.linkedSignalId && edition.linkedSeasonId) {
    return { seasonId: edition.linkedSeasonId, signalId: observation.linkedSignalId };
  }

  const sig = edition.signals.find((s) => s.id === editionSignalId);
  if (!sig) return null;
  const seasonId = edition.linkedSeasonId;
  const signalId = sig.linkedSignalId ?? sig.id;
  if (!seasonId) return null;
  return { seasonId, signalId };
}

export const FORECAST_HISTORY_GROUPS: ForecastEditionGroup[] = [
  {
    id: 'fall-2026-weekly',
    label: 'FALL 2026',
    year: 2026,
    editionIds: SLAY_FORECAST_EDITIONS.filter((e) => e.season === 'fall' && e.year === 2026).map(
      (e) => e.id,
    ),
  },
];
