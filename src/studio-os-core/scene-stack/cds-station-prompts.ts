import type { SceneStackLayerId, SceneStackLayerPrompt } from './types';

const NEG = {
  ui: 'dashboard UI cards sidebar SaaS office cubicles fluorescent panels text overlays buttons menus',
  fullScene: 'complete single scene full room one-shot render',
};

type StationCtx = { name: string; subject: string; landmark?: string };

const STATIONS: Record<string, StationCtx> = {
  arrival: {
    name: 'Arrival Zone™',
    subject: 'bronze arch arrival threshold double-height editorial atelier glimpse of Story Table in distance',
  },
  'story-table': {
    name: 'Story Table™',
    subject: 'illuminated floating creative altar holographic brand projections Studio Orb host above',
    landmark: 'Story Table Signature Landmark™',
  },
  'mood-wall': {
    name: 'Living Mood Wall™',
    subject: 'massive 30-foot editorial inspiration wall luxury campaigns packaging photography',
    landmark: 'Living Mood Wall™',
  },
  'founder-notes': {
    name: 'Founder Notes Desk™',
    subject: 'executive walnut desk leather notebook glass tablet voice recorder warm lamp',
  },
  'pipeline-board': {
    name: 'Creative Pipeline™',
    subject: 'mission control production wall illuminated stage nodes NASA meets editorial studio',
  },
  'reference-library': {
    name: 'Reference Library™',
    subject: 'floor-to-ceiling archive shelving luxury books packaging material swatches',
  },
};

function layerPrompt(
  stationId: string,
  _layerId: SceneStackLayerId,
  primary: string,
  heroAssetId: string,
  productionGroupId: string,
  negative = ''
): SceneStackLayerPrompt {
  const ctx = STATIONS[stationId];
  return {
    primary: `${ctx.name} — ${ctx.subject}. ${primary}`,
    negative: `${NEG.fullScene} ${NEG.ui} ${negative}`.trim(),
    heroAssetId,
    productionGroupId,
  };
}

/** CDS Creative Direction Studio™ — per-station per-layer FAL prompts */
export function getCdsSceneStackLayerPrompts(
  stationId: string
): Partial<Record<SceneStackLayerId, SceneStackLayerPrompt>> {
  const ctx = STATIONS[stationId];
  if (!ctx) return {};

  return {
    'environment-shell': layerPrompt(
      stationId,
      'environment-shell',
      'Architecture shell only walls ceiling floor proportions luxury creative atelier dark bronze smoked glass stone.',
      'env-shell-cds',
      'environment'
    ),
    'signature-landmark': layerPrompt(
      stationId,
      'signature-landmark',
      ctx.landmark
        ? `${ctx.landmark} hero object department identity centerpiece.`
        : 'Department focal hero object for this station.',
      stationId === 'story-table' ? 'table-timeline-cds' : stationId === 'mood-wall' ? 'wall-mood-cds' : 'orb-cds',
      'hero-objects'
    ),
    'furniture-objects': layerPrompt(
      stationId,
      'furniture-objects',
      'Physical furniture props workstations shelving desks aligned to station purpose.',
      'table-sandbox-cds',
      'furniture'
    ),
    'lighting-systems': layerPrompt(
      stationId,
      'lighting-systems',
      'Editorial gallery lighting rig coffer glow accent tracks warm key light reflection pools compositing pass.',
      'lighting-rig-cds',
      'lighting'
    ),
    'atmospheric-systems': layerPrompt(
      stationId,
      'atmospheric-systems',
      'Volumetric atmosphere subtle haze depth editorial luxury studio air.',
      'particles-ambient-cds',
      'ambient-systems'
    ),
    'surface-materials': layerPrompt(
      stationId,
      'surface-materials',
      'Surface material richness bronze brushed metal stone glass polish detail pass.',
      'env-floor-cds',
      'architecture'
    ),
    'ambient-motion': layerPrompt(
      stationId,
      'ambient-motion',
      'Subtle ambient motion hints shimmer particles slow drift for idle life layer.',
      'particles-ambient-cds',
      'ambient-systems'
    ),
    'founder-personalization': layerPrompt(
      stationId,
      'founder-personalization',
      'Genome-adapted accents brand expression personalization overlay without rebuilding architecture.',
      `seed-brief-cds`,
      'decor'
    ),
  };
}

export const CDS_SCENE_STACK_HOTSPOTS: Record<
  string,
  Record<string, { left: string; top: string; width: string; height: string }>
> = {
  arrival: { enter: { left: '28%', top: '62%', width: '44%', height: '12%' } },
  'story-table': {
    orb: { left: '35%', top: '8%', width: '30%', height: '18%' },
    table: { left: '10%', top: '42%', width: '80%', height: '28%' },
    speech: { left: '8%', top: '26%', width: '84%', height: '14%' },
  },
  'mood-wall': {
    wall: { left: '6%', top: '10%', width: '88%', height: '52%' },
    console: { left: '6%', top: '66%', width: '88%', height: '22%' },
  },
  'founder-notes': { desk: { left: '8%', top: '32%', width: '84%', height: '48%' } },
  'pipeline-board': { wall: { left: '4%', top: '8%', width: '92%', height: '78%' } },
  'reference-library': { shelves: { left: '6%', top: '12%', width: '88%', height: '68%' } },
};

export const CDS_SCENE_STACK_STATION_META = [
  { stationId: 'arrival', displayName: 'Arrival Zone™', shortLabel: 'Arrival' },
  { stationId: 'story-table', displayName: 'Story Table™', shortLabel: 'Story Table', signatureLandmarkId: 'story-table' },
  { stationId: 'mood-wall', displayName: 'Living Mood Wall™', shortLabel: 'Mood Wall' },
  { stationId: 'founder-notes', displayName: 'Founder Notes Desk™', shortLabel: 'Notes Desk' },
  { stationId: 'pipeline-board', displayName: 'Creative Pipeline™', shortLabel: 'Pipeline' },
  { stationId: 'reference-library', displayName: 'Reference Library™', shortLabel: 'Library' },
] as const;
