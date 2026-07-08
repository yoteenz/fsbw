import type { SceneStackLayerId, SceneStackLayerPrompt } from './types';

const NEG = {
  ui: 'dashboard UI cards sidebar SaaS office cubicles fluorescent panels text overlays buttons menus webpage file explorer folder tree',
  fullScene: 'complete single scene full room one-shot render',
};

type StationCtx = { name: string; subject: string; landmark?: string };

const STATIONS: Record<string, StationCtx> = {
  threshold: {
    name: 'Entrance Hall™',
    subject:
      'massive modern warehouse threshold bronze industrial doors partial sightline into glowing atrium beyond polished concrete luxury archive',
  },
  'central-atrium': {
    name: 'Central Atrium™',
    subject:
      'cathedral warehouse atrium skylight suspended gallery bridges orientation landmark compass floor markings branching aisles',
    landmark: 'Warehouse Orientation Compass™',
  },
  'environment-gallery': {
    name: 'Environment Gallery™',
    subject:
      'long gallery rows of miniature architectural headquarters dioramas on illuminated plinths Apple industrial design lab scale models',
    landmark: 'Environment Diorama Row™',
  },
  'lighting-gallery': {
    name: 'Lighting Gallery™',
    subject:
      'suspended illuminated lighting capsules floating in dark volume Pixar lighting vault comparison aisle',
    landmark: 'Lighting Capsule Array™',
  },
  'furniture-hall': {
    name: 'Furniture Hall™',
    subject: 'luxury furniture showroom executive props desks chairs shelving physical walk-around display',
    landmark: 'Furniture Showroom Aisle™',
  },
  'materials-library': {
    name: 'Materials Library™',
    subject:
      'floor-to-ceiling material walls marble glass chrome fabric concrete swatch panels high-end architecture gallery',
    landmark: 'Material Swatch Wall™',
  },
  'atmosphere-lab': {
    name: 'Atmosphere Lab™',
    subject: 'interactive atmospheric chambers fog bloom volumetric depth glass reflection demonstration pods',
    landmark: 'Atmosphere Chamber™',
  },
  'hero-object-vault': {
    name: 'Hero Object Vault™',
    subject: 'secured vault floating landmark sculptures dramatic spotlights Studio Orb monuments',
    landmark: 'Hero Vault Pedestal™',
  },
  'particle-lab': {
    name: 'Particle Lab™',
    subject: 'particle system demonstration chambers dust motes shimmer fields isolated preview boxes',
    landmark: 'Particle Demonstration Pod™',
  },
  'animation-archive': {
    name: 'Animation Archive™',
    subject: 'motion archive aisle looping runtime displays idle life preview screens cinematic prop warehouse',
    landmark: 'Animation Loop Bay™',
  },
  'audio-vault': {
    name: 'Audio Vault™',
    subject: 'acoustic vault ambient bed capsules sonic identity listening pods luxury museum archive',
    landmark: 'Audio Listening Capsule™',
  },
  'marketplace-imports': {
    name: 'Marketplace Imports™',
    subject: 'import dock receiving bay purchased assets arrive on conveyor luxury warehouse intake',
    landmark: 'Marketplace Intake Dock™',
  },
  'restoration-lab': {
    name: 'Asset Restoration Lab™',
    subject: 'restoration workbench upscale validation lab precision lighting repair station',
    landmark: 'Restoration Workbench™',
  },
  'generation-bay': {
    name: 'Generation Bay™',
    subject: 'manufacturing generation bay new assets manifest on floor industrial luxury hybrid',
    landmark: 'Generation Manifestation Bay™',
  },
  'museum-connection': {
    name: 'Museum Connection™',
    subject:
      'architectural walkway bridge from active warehouse into preserved legacy museum wing continuous campus',
    landmark: 'Museum Connection Arch™',
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

export function getWarehouseSceneStackLayerPrompts(
  stationId: string
): Partial<Record<SceneStackLayerId, SceneStackLayerPrompt>> {
  const ctx = STATIONS[stationId];
  if (!ctx) return {};

  return {
    'environment-shell': layerPrompt(
      stationId,
      'environment-shell',
      'Architecture shell only warehouse gallery walls ceiling floor structure proportions massive modern luxury industrial.',
      'env-shell-wh',
      'environment'
    ),
    'signature-landmark': layerPrompt(
      stationId,
      'signature-landmark',
      ctx.landmark ? `${ctx.landmark} hero landmark centerpiece.` : 'Warehouse gallery landmark centerpiece.',
      `landmark-${stationId}`,
      'hero-objects'
    ),
    'furniture-objects': layerPrompt(
      stationId,
      'furniture-objects',
      'Physical gallery furniture plinths pedestals display cases aligned to warehouse room purpose.',
      'plinth-wh',
      'furniture'
    ),
    'lighting-systems': layerPrompt(
      stationId,
      'lighting-systems',
      'Warehouse gallery lighting rig track spots coffer glow capsule illumination compositing pass.',
      'lighting-wh',
      'lighting'
    ),
    'atmospheric-systems': layerPrompt(
      stationId,
      'atmospheric-systems',
      'Warehouse atmospheric depth subtle haze industrial luxury air volumetric gallery.',
      'atmos-wh',
      'ambient-systems'
    ),
    'surface-materials': layerPrompt(
      stationId,
      'surface-materials',
      'Concrete polished floor brushed steel glass chrome material richness detail pass.',
      'floor-wh',
      'architecture'
    ),
    'ambient-motion': layerPrompt(
      stationId,
      'ambient-motion',
      'Subtle warehouse ambient motion conveyor shimmer dust motes slow drift idle life.',
      'motion-wh',
      'ambient-systems'
    ),
    'founder-personalization': layerPrompt(
      stationId,
      'founder-personalization',
      'Genome-adapted warehouse accents brand expression without rebuilding architecture.',
      'genome-wh',
      'decor'
    ),
  };
}

export const WAREHOUSE_SCENE_STACK_HOTSPOTS: Record<
  string,
  Record<string, { left: string; top: string; width: string; height: string }>
> = {
  threshold: { enter: { left: '24%', top: '58%', width: '52%', height: '14%' } },
  'central-atrium': {
    compass: { left: '32%', top: '38%', width: '36%', height: '22%' },
    registry: { left: '6%', top: '68%', width: '88%', height: '18%' },
  },
  'environment-gallery': { floor: { left: '4%', top: '52%', width: '92%', height: '32%' } },
  'lighting-gallery': { floor: { left: '4%', top: '48%', width: '92%', height: '36%' } },
  'furniture-hall': { floor: { left: '6%', top: '50%', width: '88%', height: '34%' } },
  'materials-library': { floor: { left: '4%', top: '44%', width: '92%', height: '40%' } },
  'atmosphere-lab': { floor: { left: '6%', top: '48%', width: '88%', height: '36%' } },
  'hero-object-vault': { floor: { left: '8%', top: '46%', width: '84%', height: '38%' } },
  'particle-lab': { floor: { left: '6%', top: '50%', width: '88%', height: '34%' } },
  'animation-archive': { floor: { left: '4%', top: '48%', width: '92%', height: '36%' } },
  'audio-vault': { floor: { left: '6%', top: '50%', width: '88%', height: '34%' } },
  'marketplace-imports': { dock: { left: '8%', top: '42%', width: '84%', height: '42%' } },
  'restoration-lab': { bench: { left: '10%', top: '44%', width: '80%', height: '40%' } },
  'generation-bay': { bay: { left: '6%', top: '40%', width: '88%', height: '44%' } },
  'museum-connection': { walkway: { left: '12%', top: '50%', width: '76%', height: '28%' } },
};

export const WAREHOUSE_SCENE_STACK_STATION_META = [
  { stationId: 'threshold', displayName: 'Entrance Hall™', shortLabel: 'Entrance' },
  { stationId: 'central-atrium', displayName: 'Central Atrium™', shortLabel: 'Atrium', signatureLandmarkId: 'central-atrium' },
  { stationId: 'environment-gallery', displayName: 'Environment Gallery™', shortLabel: 'Environ' },
  { stationId: 'lighting-gallery', displayName: 'Lighting Gallery™', shortLabel: 'Light' },
  { stationId: 'furniture-hall', displayName: 'Furniture Hall™', shortLabel: 'Furn' },
  { stationId: 'materials-library', displayName: 'Materials Library™', shortLabel: 'Mat' },
  { stationId: 'atmosphere-lab', displayName: 'Atmosphere Lab™', shortLabel: 'Atmos' },
  { stationId: 'hero-object-vault', displayName: 'Hero Object Vault™', shortLabel: 'Hero' },
  { stationId: 'particle-lab', displayName: 'Particle Lab™', shortLabel: 'Part' },
  { stationId: 'animation-archive', displayName: 'Animation Archive™', shortLabel: 'Anim' },
  { stationId: 'audio-vault', displayName: 'Audio Vault™', shortLabel: 'Audio' },
  { stationId: 'marketplace-imports', displayName: 'Marketplace Imports™', shortLabel: 'Import' },
  { stationId: 'restoration-lab', displayName: 'Asset Restoration Lab™', shortLabel: 'Restore' },
  { stationId: 'generation-bay', displayName: 'Generation Bay™', shortLabel: 'Gen' },
  { stationId: 'museum-connection', displayName: 'Museum Connection™', shortLabel: 'Museum' },
] as const;
