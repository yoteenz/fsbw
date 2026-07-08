import type { SceneStackLayerId, SceneStackLayerPrompt } from './types';

const NEG = {
  ui: 'dashboard UI cards sidebar SaaS office cubicles webpage marble cards flat panels module grid sitemap file explorer',
  fullScene: 'complete single scene full room one-shot render',
};

const STATIONS: Record<string, { name: string; subject: string }> = {
  'holographic-table': {
    name: 'Studio World Atlas™ Holographic Table',
    subject:
      'monumental executive holographic projection table entire Studio World civilization buildings rising roads elevators pulsing AI concierge lights living miniature campus blueprint',
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

export function getWorldAtlasSceneStackLayerPrompts(
  stationId: string
): Partial<Record<SceneStackLayerId, SceneStackLayerPrompt>> {
  if (!STATIONS[stationId]) return {};

  return {
    'environment-shell': layerPrompt(
      stationId,
      'Executive atrium environment shell monumental table platform overlooking command center.',
      'env-shell-atlas',
      'environment'
    ),
    'signature-landmark': layerPrompt(
      stationId,
      'Studio World Atlas™ centerpiece — entire civilization rising from table Studio Orb guide sphere.',
      'atlas-landmark',
      'hero-objects'
    ),
    'furniture-objects': layerPrompt(
      stationId,
      'Building extrusions landmarks transit skybridges observation towers roads walkways on holographic projection.',
      'buildings-atlas',
      'furniture'
    ),
    'lighting-systems': layerPrompt(
      stationId,
      'Cyan holographic table lighting building glow activity pulses executive coffer accents.',
      'light-atlas',
      'lighting'
    ),
    'atmospheric-systems': layerPrompt(
      stationId,
      'Terrain atmosphere beneath projected world gardens courtyards water features believable urban planning haze.',
      'terrain-atlas',
      'ambient-systems'
    ),
    'surface-materials': layerPrompt(
      stationId,
      'Holographic table architecture projection rig bezels emitters structural supports polished executive materials.',
      'arch-atlas',
      'architecture'
    ),
    'ambient-motion': layerPrompt(
      stationId,
      'Live world motion expeditions traveling marketplace activity concierge movement generation glow.',
      'motion-atlas',
      'ambient-systems'
    ),
    interaction: layerPrompt(
      stationId,
      'Interactive navigation layers fast travel paths elevator shafts fog of discovery unrevealed districts.',
      'nav-atlas',
      'ambient-systems'
    ),
    'founder-personalization': layerPrompt(
      stationId,
      'Genome-adapted campus accents company-specific building glow without rebuilding atlas architecture.',
      'genome-atlas',
      'decor'
    ),
  };
}

export const WORLD_ATLAS_SCENE_STACK_HOTSPOTS: Record<
  string,
  Record<string, { left: string; top: string; width: string; height: string }>
> = {
  'holographic-table': {
    worldView: { left: '12%', top: '22%', width: '76%', height: '58%' },
    orbGuide: { left: '78%', top: '18%', width: '16%', height: '22%' },
    fastTravel: { left: '30%', top: '82%', width: '40%', height: '10%' },
  },
};

export const WORLD_ATLAS_SCENE_STACK_STATION_META = [
  {
    stationId: 'holographic-table',
    displayName: 'Studio World Atlas™ Holographic Table',
    shortLabel: 'Atlas',
    signatureLandmarkId: 'holographic-table',
  },
] as const;
