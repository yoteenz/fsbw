import type {
  ForecastSeason,
  ForecastSignal,
  ForecastSignalStatus,
} from './types';

const ASSETS = {
  wave: '/assets/NOIR/wave-thumb.png',
  noir: '/assets/NOIR/noir-thumb.png',
  blanco: '/assets/NOIR/blanco-thumb.png',
  curl: '/assets/NOIR/curl-thumb.png',
} as const;

function signal(
  partial: Omit<ForecastSignal, 'seasonId' | 'publishedAt' | 'updatedAt'> & {
    seasonId?: string;
    publishedAt?: string;
    updatedAt?: string;
  }
): ForecastSignal {
  return {
    seasonId: partial.seasonId ?? 'fall-2026',
    publishedAt: partial.publishedAt ?? '2026-08-01',
    updatedAt: partial.updatedAt ?? '2026-08-11',
    ...partial,
  };
}

const FALL_2026_SIGNALS: ForecastSignal[] = [
  signal({
    id: 'fall-2026-signal-01',
    slug: 'lived-in-waves',
    number: 1,
    category: 'texture',
    categoryLabel: 'TEXTURE SIGNAL',
    title: 'LIVED-IN WAVES',
    summary:
      'Soft, natural-looking waves with movement and separation are becoming the new standard. Over-defined patterns are cooling down.',
    status: 'accelerating',
    assets: { hero: ASSETS.wave, thumbnail: ASSETS.wave },
    reasoning: [
      'Runway embracing effortless texture',
      'Clients requesting more movement',
      'Lifestyle trends shifting toward lower-maintenance luxury',
    ],
    relatedSignalIds: ['fall-2026-signal-02', 'fall-2026-signal-03'],
    relatedTrendReportPackId: 'trend-report-summer',
    relatedMasteryId: 'mastery-style',
    relatedContentPackId: 'styling-layers-demo',
    relatedContentLabel: 'SOFT WAVE STYLING',
  }),
  signal({
    id: 'fall-2026-signal-02',
    slug: 'espresso-dimension',
    number: 2,
    category: 'color',
    categoryLabel: 'COLOR SIGNAL',
    title: 'ESPRESSO DIMENSION',
    summary:
      'Rich brunette depth with subtle dimension is gaining momentum as blonde fatigue settles across editorial and client requests.',
    status: 'rising',
    assets: { hero: ASSETS.noir, thumbnail: ASSETS.noir },
    reasoning: [
      'Editorial color stories favor depth over flat tone',
      'Clients seeking low-maintenance richness',
      'Dimension reads premium on camera',
    ],
    relatedSignalIds: ['fall-2026-signal-01', 'fall-2026-signal-04'],
    relatedTrendReportPackId: 'trend-report-summer',
  }),
  signal({
    id: 'fall-2026-signal-03',
    slug: 'softer-hairlines',
    number: 3,
    category: 'lace',
    categoryLabel: 'LACE SIGNAL',
    title: 'SOFTER HAIRLINES',
    summary:
      'Hairlines are moving away from harsh density toward feathered, believable lace transitions that melt into skin.',
    status: 'accelerating',
    assets: { hero: ASSETS.blanco, thumbnail: ASSETS.blanco },
    reasoning: [
      'Undetectable installs remain the luxury standard',
      'Plucking and tinting education spreading',
      'Social proof favoring natural frontals',
    ],
    relatedSignalIds: ['fall-2026-signal-05', 'fall-2026-signal-01'],
    relatedMasteryId: 'mastery-lace',
    relatedContentPackId: 'plucking-lace',
    relatedContentLabel: 'LACE HAIRLINE REFINEMENT',
  }),
  signal({
    id: 'fall-2026-signal-04',
    slug: 'side-part-revival',
    number: 4,
    category: 'style',
    categoryLabel: 'STYLE SIGNAL',
    title: 'SIDE PART REVIVAL',
    summary:
      'Classic side parts are returning with modern softness — less rigid, more editorial, and highly camera-friendly.',
    status: 'rising',
    assets: { hero: ASSETS.curl, thumbnail: ASSETS.curl },
    reasoning: [
      'Red carpet revisiting 90s silhouettes',
      'Middle-part dominance easing in editorial',
      'Side parts frame the face with less volume demand',
    ],
    relatedSignalIds: ['fall-2026-signal-01', 'fall-2026-signal-02'],
    relatedContentPackId: 'styling-layers-demo',
    relatedContentLabel: 'FACE-FRAMING STYLING',
  }),
  signal({
    id: 'fall-2026-signal-05',
    slug: 'glueless-confidence',
    number: 5,
    category: 'install',
    categoryLabel: 'INSTALL SIGNAL',
    title: 'GLUELESS CONFIDENCE',
    summary:
      'Glueless and low-adhesive installs are rising as clients prioritize comfort, scalp health, and repeat wearability.',
    status: 'rising',
    assets: { hero: ASSETS.wave, thumbnail: ASSETS.blanco },
    reasoning: [
      'Comfort-first luxury becoming non-negotiable',
      'Tutorial culture normalizing secure glueless methods',
      'Repeat clients asking for less adhesive stress',
    ],
    relatedSignalIds: ['fall-2026-signal-03'],
    relatedMasteryId: 'mastery-install',
    relatedContentPackId: 'melting-lace',
    relatedContentLabel: 'SECURE GLUELESS INSTALL',
  }),
];

export const SLAY_FORECAST_SEASONS: ForecastSeason[] = [
  {
    id: 'fall-2026',
    slug: 'fall-2026',
    season: 'fall',
    year: 2026,
    title: 'FALL 2026 FORECAST',
    subtitle: "5 SIGNALS WE'RE WATCHING",
    descriptor: "WHAT'S NEXT IN HAIR, BEFORE IT HITS.",
    publishedAt: '2026-08-01',
    updatedAt: '2026-08-11',
    status: 'current',
    heroAsset: ASSETS.noir,
    signals: FALL_2026_SIGNALS,
    secondarySignals: [
      {
        id: 'fall-2026-secondary-curl-definition',
        title: 'CURL DEFINITION',
        status: 'rising',
        thumbnail: ASSETS.curl,
        sparkline: [0.2, 0.35, 0.42, 0.55, 0.62],
      },
      {
        id: 'fall-2026-secondary-blonde-melt',
        title: 'BLONDE MELT',
        status: 'emerging',
        thumbnail: ASSETS.blanco,
        sparkline: [0.15, 0.18, 0.22, 0.28, 0.3],
      },
      {
        id: 'fall-2026-secondary-layered-movement',
        title: 'LAYERED MOVEMENT',
        status: 'rising',
        thumbnail: ASSETS.wave,
        sparkline: [0.25, 0.3, 0.38, 0.48, 0.58],
      },
      {
        id: 'fall-2026-secondary-mini-twists',
        title: 'MINI TWISTS REVIVAL',
        status: 'emerging',
        thumbnail: ASSETS.curl,
        sparkline: [0.12, 0.16, 0.2, 0.24, 0.27],
      },
    ],
    forecastReality: [],
    relatedTrendReportPackIds: ['trend-report-summer'],
    editorialExplainer:
      'Our experts analyze texture, culture, client behavior and beauty innovation to forecast what\'s rising, what\'s next and what\'s worth knowing.',
  },
  {
    id: 'spring-2026',
    slug: 'spring-2026',
    season: 'spring',
    year: 2026,
    title: 'SPRING 2026 FORECAST',
    subtitle: "4 SIGNALS WE'RE WATCHING",
    descriptor: "WHAT'S NEXT IN HAIR, BEFORE IT HITS.",
    publishedAt: '2026-03-01',
    updatedAt: '2026-06-15',
    status: 'archived',
    heroAsset: ASSETS.blanco,
    signals: [
      signal({
        id: 'spring-2026-signal-01',
        slug: 'soft-brunette-dimension',
        seasonId: 'spring-2026',
        number: 1,
        category: 'color',
        categoryLabel: 'COLOR SIGNAL',
        title: 'SOFT BRUNETTE DIMENSION',
        summary: 'Dimensional brunette with soft contrast was forecast as the season\'s defining color story.',
        status: 'rising',
        assets: { hero: ASSETS.noir, thumbnail: ASSETS.noir },
        reasoning: ['Editorial favoring depth', 'Client requests for richer tone'],
        publishedAt: '2026-03-01',
        updatedAt: '2026-06-15',
      }),
    ],
    secondarySignals: [],
    forecastReality: [
      {
        id: 'spring-2026-reality-brunette',
        seasonId: 'spring-2026',
        seasonLabel: 'SPRING 2026 FORECAST',
        signalTitle: 'SOFT BRUNETTE DIMENSION',
        originalStatus: 'rising',
        outcomeStatus: 'confirmed',
        originalLabel: 'WE PREDICTED IT',
        currentLabel: 'CONFIRMED ✓',
        beforeAsset: ASSETS.noir,
        currentAsset: ASSETS.blanco,
        outcomeSummary: 'Dimensional brunette moved from editorial edge to mainstream client demand.',
      },
    ],
    relatedTrendReportPackIds: ['trend-report-summer'],
  },
  {
    id: 'summer-2026',
    slug: 'summer-2026',
    season: 'summer',
    year: 2026,
    title: 'SUMMER 2026 FORECAST',
    subtitle: "4 SIGNALS WE'RE WATCHING",
    descriptor: "WHAT'S NEXT IN HAIR, BEFORE IT HITS.",
    publishedAt: '2026-06-01',
    updatedAt: '2026-07-20',
    status: 'archived',
    heroAsset: ASSETS.wave,
    signals: [
      signal({
        id: 'summer-2026-signal-01',
        slug: 'glossy-shoulder-layers',
        seasonId: 'summer-2026',
        number: 1,
        category: 'texture',
        categoryLabel: 'TEXTURE SIGNAL',
        title: 'GLOSSY SHOULDER LAYERS',
        summary: 'Shoulder-length layers with high gloss were positioned as the summer movement signal.',
        status: 'accelerating',
        assets: { hero: ASSETS.wave, thumbnail: ASSETS.wave },
        reasoning: ['Heat-friendly lengths', 'Gloss-forward editorial'],
        publishedAt: '2026-06-01',
        updatedAt: '2026-07-20',
      }),
    ],
    secondarySignals: [],
    forecastReality: [
      {
        id: 'summer-2026-reality-glossy-layers',
        seasonId: 'summer-2026',
        seasonLabel: 'SUMMER 2026 FORECAST',
        signalTitle: 'GLOSSY SHOULDER LAYERS',
        originalStatus: 'accelerating',
        outcomeStatus: 'still-developing',
        originalLabel: 'WE PREDICTED IT',
        currentLabel: 'STILL DEVELOPING',
        beforeAsset: ASSETS.wave,
        currentAsset: ASSETS.curl,
        outcomeSummary: 'Signal remains active — full seasonal evaluation pending.',
      },
    ],
  },
];

const seasonById = new Map(SLAY_FORECAST_SEASONS.map((s) => [s.id, s]));
const signalById = new Map<string, ForecastSignal>();

for (const season of SLAY_FORECAST_SEASONS) {
  for (const sig of season.signals) {
    signalById.set(sig.id, sig);
  }
}

export function getAllForecastSeasons(): ForecastSeason[] {
  return [...SLAY_FORECAST_SEASONS].sort((a, b) => {
    if (a.status === 'current' && b.status !== 'current') return -1;
    if (b.status === 'current' && a.status !== 'current') return 1;
    return b.publishedAt.localeCompare(a.publishedAt);
  });
}

export function getForecastSeasonById(id: string): ForecastSeason | undefined {
  return seasonById.get(id);
}

export function getCurrentForecastSeason(): ForecastSeason | undefined {
  return SLAY_FORECAST_SEASONS.find((s) => s.status === 'current');
}

export function getArchivedForecastSeasons(): ForecastSeason[] {
  return SLAY_FORECAST_SEASONS.filter((s) => s.status === 'archived').sort((a, b) =>
    b.publishedAt.localeCompare(a.publishedAt)
  );
}

export function getForecastSignalById(signalId: string): ForecastSignal | undefined {
  return signalById.get(signalId);
}

export function getForecastSignalInSeason(
  seasonId: string,
  signalId: string
): ForecastSignal | undefined {
  const season = getForecastSeasonById(seasonId);
  return season?.signals.find((s) => s.id === signalId);
}

export function formatForecastSeasonLabel(season: ForecastSeason): string {
  return `${season.season.toUpperCase()} ${season.year}`;
}

export function formatForecastUpdatedLabel(isoDate: string): string {
  const match = isoDate.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return isoDate.toUpperCase();
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
  ];
  const month = months[Number(match[2]) - 1] ?? 'JAN';
  return `UPDATED ${month} ${Number(match[3])}, ${match[1]}`;
}

export const FORECAST_STATUS_LABELS: Record<ForecastSignalStatus, string> = {
  emerging: 'EMERGING',
  rising: 'RISING',
  accelerating: 'ACCELERATING',
  holding: 'HOLDING',
  cooling: 'COOLING',
};

export const FORECAST_OUTCOME_LABELS: Record<
  import('./types').ForecastOutcomeStatus,
  string
> = {
  confirmed: 'CONFIRMED',
  'partially-confirmed': 'PARTIALLY CONFIRMED',
  'still-developing': 'STILL DEVELOPING',
  'did-not-materialize': "DIDN'T MATERIALIZE",
};
