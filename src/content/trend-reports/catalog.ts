import type { TrendReportEditorial } from './types';

export const TREND_REPORT_SUMMER_2026: TrendReportEditorial = {
  packId: 'trend-report-summer',
  seasonLabel: 'SUMMER 2026',
  dek: 'WHAT IS SLAYING THIS SEASON — LENGTH, PARTS, AND COLOR.',
  readTime: '5 MIN',
  heroImage: '/assets/NOIR/wave-thumb.png',
  orbEnabled: true,
  relatedForecastEditionId: 'forecast-2026-08-10',
  relatedForecastLabel: 'VIEW THE FALL 2026 SLAY FORECAST',
  sections: [
    {
      id: 'cover',
      kind: 'cover',
      title: 'SUMMER TREND REPORT',
    },
    {
      id: 'seeing',
      kind: 'what-were-seeing',
      title: "WHAT WE'RE SEEING",
      body:
        'Editorial and client behavior are converging on softer structure, believable lace, and dimensional brunette — luxury that reads effortless on camera.',
      imageSrc: '/assets/NOIR/wave-thumb.png',
    },
    {
      id: 'takeaways',
      kind: 'key-takeaways',
      title: 'KEY TAKEAWAYS',
      bullets: ['SOFT LAYERS', 'MIDDLE PARTS', 'GLOSS WITHOUT GREASE', 'ESPRESSO DEPTH OVER FLAT TONE'],
    },
    {
      id: 'movement',
      kind: 'the-movement',
      title: 'THE MOVEMENT',
      body:
        'Shoulder-length silhouettes with face-framing layers are replacing heavy blunt cuts. Movement is the new polish.',
      pullQuote: 'EFFORTLESS IS THE NEW EDITORIAL.',
      imageSrc: '/assets/NOIR/curl-thumb.png',
    },
    {
      id: 'why',
      kind: 'why-its-happening',
      title: "WHY IT'S HAPPENING",
      body:
        'Heat-friendly lengths, repeat-wear installs, and social proof favoring natural texture are pushing clients away from high-maintenance perfection.',
    },
    {
      id: 'signals',
      kind: 'the-signals',
      title: 'THE SIGNALS',
      bullets: [
        'TEXTURE · LIVED-IN WAVES · ACCELERATING',
        'COLOR · ESPRESSO DIMENSION · RISING',
        'LACE · SOFTER HAIRLINES · ACCELERATING',
      ],
    },
    {
      id: 'peaking',
      kind: 'whats-peaking',
      title: "WHAT'S PEAKING",
      body: 'Dimensional brunette, soft side parts, and glueless confidence installs.',
      signalLabel: 'ESPRESSO DIMENSION',
      signalDirection: 'RISING ↑',
    },
    {
      id: 'cooling',
      kind: 'whats-cooling',
      title: "WHAT'S COOLING",
      body: 'Over-defined curl patterns, harsh hairlines, and flat single-process color.',
      signalLabel: 'HELMET CURL',
      signalDirection: 'COOLING ↓',
    },
    {
      id: 'fs-take',
      kind: 'the-fs-take',
      title: 'THE FS TAKE',
      pullQuote: 'POLISHED WITHOUT LOOKING LIKE YOU TRIED TOO HARD.',
      body:
        'Frontal Slayer is tracking a shift from performative perfection to believable luxury — texture, lace, and color that hold up in real life.',
    },
    {
      id: 'try',
      kind: 'try-the-trend',
      title: 'TRY THE TREND',
      body: 'Build soft shoulder layers with face-framing movement and dimensional espresso depth.',
    },
    {
      id: 'next',
      kind: 'what-happens-next',
      title: 'WHAT WE THINK HAPPENS NEXT',
      body:
        'PSA is watching soft structure consolidate into the defining fall silhouette — lived-in waves with premium lace refinement.',
    },
  ],
};

const byPackId = new Map<string, TrendReportEditorial>([
  [TREND_REPORT_SUMMER_2026.packId, TREND_REPORT_SUMMER_2026],
]);

export function getTrendReportEditorial(packId: string): TrendReportEditorial | undefined {
  return byPackId.get(packId);
}

export function isTrendReportPackId(packId: string): boolean {
  return byPackId.has(packId);
}
