import type { SceneStackLayerId, SceneStackLayerPrompt } from './types';

const NEG = {
  ui: 'dashboard UI cards sidebar SaaS office cubicles webpage marble cards flat panels module grid',
  fullScene: 'complete single scene full room one-shot render',
};

const STATIONS: Record<string, { name: string; subject: string; landmark?: string }> = {
  threshold: {
    name: 'Command Threshold™',
    subject:
      'massive executive headquarters threshold bronze doors partial sightline into glowing atrium Organization Pulse Core beyond',
  },
  'executive-atrium': {
    name: 'Executive Atrium™',
    subject:
      'cathedral executive command atrium double-height skylight radial wing corridors portals branching create intelligence distribution operations finance archives creative direction',
    landmark: 'Organization Pulse Core™',
  },
};

function layerPrompt(
  stationId: string,
  primary: string,
  heroAssetId: string,
  productionGroupId: string
): SceneStackLayerPrompt {
  const ctx = STATIONS[stationId];
  return {
    primary: `${ctx.name} — ${ctx.subject}. ${primary}`,
    negative: `${NEG.fullScene} ${NEG.ui}`.trim(),
    heroAssetId,
    productionGroupId,
  };
}

export function getCommandCenterSceneStackLayerPrompts(
  stationId: string
): Partial<Record<SceneStackLayerId, SceneStackLayerPrompt>> {
  if (!STATIONS[stationId]) return {};

  return {
    'environment-shell': layerPrompt(
      stationId,
      'Architecture shell only executive command center walls ceiling floor radial corridor geometry.',
      'env-shell-scc',
      'environment'
    ),
    'signature-landmark': layerPrompt(
      stationId,
      stationId === 'executive-atrium'
        ? 'Organization Pulse Core™ massive central living command sculpture mission control not analytics cards.'
        : 'Threshold landmark arch into atrium.',
      stationId === 'executive-atrium' ? 'pulse-core-scc' : 'threshold-arch-scc',
      'hero-objects'
    ),
    'furniture-objects': layerPrompt(
      stationId,
      'Physical wing portal doorframes corridor stations embedded command consoles not card lists.',
      'portals-scc',
      'furniture'
    ),
    'lighting-systems': layerPrompt(
      stationId,
      'Executive atrium lighting rig coffer glow radial accent tracks pulse core illumination.',
      'lighting-scc',
      'lighting'
    ),
    'atmospheric-systems': layerPrompt(
      stationId,
      'Volumetric executive atmosphere depth haze living campus air.',
      'atmos-scc',
      'ambient-systems'
    ),
    'surface-materials': layerPrompt(
      stationId,
      'Polished stone brushed brass glass chrome executive material richness.',
      'floor-scc',
      'architecture'
    ),
    'ambient-motion': layerPrompt(
      stationId,
      'Subtle pulse core shimmer ambient drift idle life command center energy.',
      'motion-scc',
      'ambient-systems'
    ),
    'founder-personalization': layerPrompt(
      stationId,
      'Genome-adapted executive accents without rebuilding atrium architecture.',
      'genome-scc',
      'decor'
    ),
  };
}

export const COMMAND_CENTER_SCENE_STACK_HOTSPOTS: Record<
  string,
  Record<string, { left: string; top: string; width: string; height: string }>
> = {
  threshold: { enter: { left: '26%', top: '58%', width: '48%', height: '14%' } },
  'executive-atrium': {
    pulseCore: { left: '30%', top: '32%', width: '40%', height: '36%' },
    wingRing: { left: '4%', top: '14%', width: '92%', height: '78%' },
    priorityDisplay: { left: '8%', top: '6%', width: '84%', height: '10%' },
  },
};

export const COMMAND_CENTER_SCENE_STACK_STATION_META = [
  { stationId: 'threshold', displayName: 'Command Threshold™', shortLabel: 'Threshold' },
  {
    stationId: 'executive-atrium',
    displayName: 'Executive Atrium™',
    shortLabel: 'Atrium',
    signatureLandmarkId: 'executive-atrium',
  },
] as const;
