import type { SceneStackLayerId, SceneStackLayerPrompt } from './types';

const NEG = {
  ui: 'dashboard UI cards sidebar SaaS office cubicles fluorescent panels text overlays buttons menus webpage file explorer folder tree',
  fullScene: 'complete single scene full room one-shot render',
};

type StationCtx = { name: string; subject: string; landmark?: string };

const STATIONS: Record<string, StationCtx> = {
  threshold: {
    name: 'Grand Entrance™',
    subject:
      'iconic monumental archive entrance bronze glass industrial permanence Smithsonian luxury architecture museum threshold Studio Orb welcome',
  },
  'central-atrium': {
    name: 'Orientation Atrium™',
    subject:
      'cathedral archives atrium monumental central space skylight suspended bridges compass floor company summary displays branching wings Library of Alexandria prestige',
    landmark: 'Archives Orientation Compass™',
  },
  'warehouse-wing': {
    name: 'Warehouse Wing™',
    subject:
      'active production asset wing foyer reusable objects editable galleries branch ahead luxury industrial archive',
    landmark: 'Warehouse Wing Portal™',
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
    name: 'Marketplace Pavilion™',
    subject:
      'architectural exposition hall companies showcase headquarters departments blueprints lighting packs scene packs brand systems preview compare purchase import',
    landmark: 'Marketplace Exposition Hall™',
  },
  'generation-bay': {
    name: 'Generation Bay™',
    subject: 'active asset production floor Scene Stack assembly generation queue luxury industrial archive bay',
    landmark: 'Generation Assembly Crane™',
  },
  'asset-restoration': {
    name: 'Asset Restoration™',
    subject: 'restoration workshop repair refine revalidate archived assets conservation lab',
    landmark: 'Restoration Workbench™',
  },
  'company-genome-vault': {
    name: 'Company Genome Vault™',
    subject:
      'permanent company DNA vault brand personality visual language creative preferences design taste typography motion lighting material preferences evolving genome memory layer',
    landmark: 'Genome Helix Monument™',
  },
  'blueprint-archive': {
    name: 'Blueprint Archive™',
    subject:
      'reusable company systems archive department workflows workspace templates generation pipelines automation hiring sales marketing customer experience versioned forkable blueprints',
    landmark: 'Blueprint Stack Tower™',
  },
  'museum-wing': {
    name: 'Museum Wing™',
    subject:
      'quiet refined legacy museum wing softer acoustics purple bronze gallery lighting preserved Golden Build installations holographic exhibit reconstructions monumental legacy hallway',
    landmark: 'Legacy Hall Arch™',
  },
  'hall-of-innovation': {
    name: 'Hall of Innovation™',
    subject:
      'innovation laboratory wing prototype bays inventor storytelling displays experimental installations future company inventions luminous discovery corridor',
    landmark: 'Innovation Beacon™',
  },
  'future-expansion-wings': {
    name: 'Future Expansion Wings™',
    subject:
      'unfinished architectural expansion bays scaffolding luxury industrial future campus growth wings awaiting new districts',
    landmark: 'Expansion Portal Frame™',
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
    compass: { left: '28%', top: '32%', width: '44%', height: '24%' },
    summary: { left: '4%', top: '58%', width: '44%', height: '28%' },
    budget: { left: '52%', top: '58%', width: '44%', height: '28%' },
    registry: { left: '6%', top: '8%', width: '88%', height: '20%' },
  },
  'warehouse-wing': { portal: { left: '20%', top: '44%', width: '60%', height: '28%' } },
  'environment-gallery': { floor: { left: '4%', top: '52%', width: '92%', height: '32%' } },
  'lighting-gallery': { floor: { left: '4%', top: '48%', width: '92%', height: '36%' } },
  'furniture-hall': { floor: { left: '6%', top: '50%', width: '88%', height: '34%' } },
  'materials-library': { floor: { left: '4%', top: '44%', width: '92%', height: '40%' } },
  'atmosphere-lab': { floor: { left: '6%', top: '48%', width: '88%', height: '36%' } },
  'hero-object-vault': { floor: { left: '8%', top: '46%', width: '84%', height: '38%' } },
  'particle-lab': { floor: { left: '6%', top: '46%', width: '88%', height: '38%' } },
  'animation-archive': { floor: { left: '6%', top: '44%', width: '88%', height: '40%' } },
  'audio-vault': { floor: { left: '8%', top: '46%', width: '84%', height: '38%' } },
  'generation-bay': { bay: { left: '8%', top: '40%', width: '84%', height: '44%' } },
  'asset-restoration': { workshop: { left: '10%', top: '42%', width: '80%', height: '42%' } },
  'marketplace-imports': {
    pavilion: { left: '6%', top: '36%', width: '88%', height: '48%' },
    dock: { left: '8%', top: '42%', width: '84%', height: '36%' },
  },
  'company-genome-vault': {
    helix: { left: '28%', top: '30%', width: '44%', height: '36%' },
    traits: { left: '6%', top: '68%', width: '88%', height: '24%' },
  },
  'blueprint-archive': {
    stacks: { left: '6%', top: '36%', width: '88%', height: '48%' },
    catalog: { left: '8%', top: '8%', width: '84%', height: '24%' },
  },
  'museum-wing': {
    legacyHall: { left: '4%', top: '38%', width: '92%', height: '48%' },
    historian: { left: '6%', top: '8%', width: '88%', height: '26%' },
    exhibit: { left: '8%', top: '12%', width: '84%', height: '72%' },
  },
  'hall-of-innovation': {
    prototypes: { left: '6%', top: '40%', width: '88%', height: '44%' },
    storyteller: { left: '10%', top: '10%', width: '80%', height: '24%' },
  },
  'future-expansion-wings': {
    bays: { left: '8%', top: '36%', width: '84%', height: '48%' },
  },
};

export const WAREHOUSE_SCENE_STACK_STATION_META = [
  { stationId: 'threshold', displayName: 'Grand Entrance™', shortLabel: 'Entrance' },
  { stationId: 'central-atrium', displayName: 'Orientation Atrium™', shortLabel: 'Atrium', signatureLandmarkId: 'central-atrium' },
  { stationId: 'warehouse-wing', displayName: 'Warehouse Wing™', shortLabel: 'Warehouse' },
  { stationId: 'environment-gallery', displayName: 'Environment Gallery™', shortLabel: 'Environment' },
  { stationId: 'lighting-gallery', displayName: 'Lighting Gallery™', shortLabel: 'Lighting' },
  { stationId: 'furniture-hall', displayName: 'Furniture Hall™', shortLabel: 'Furniture' },
  { stationId: 'materials-library', displayName: 'Materials Library™', shortLabel: 'Materials' },
  { stationId: 'atmosphere-lab', displayName: 'Atmosphere Lab™', shortLabel: 'Atmosphere' },
  { stationId: 'hero-object-vault', displayName: 'Hero Object Vault™', shortLabel: 'Hero Vault' },
  { stationId: 'particle-lab', displayName: 'Particle Lab™', shortLabel: 'Particles' },
  { stationId: 'animation-archive', displayName: 'Animation Archive™', shortLabel: 'Animation' },
  { stationId: 'audio-vault', displayName: 'Audio Vault™', shortLabel: 'Audio' },
  { stationId: 'generation-bay', displayName: 'Generation Bay™', shortLabel: 'Generation' },
  { stationId: 'asset-restoration', displayName: 'Asset Restoration™', shortLabel: 'Restore' },
  { stationId: 'museum-wing', displayName: 'Museum Wing™', shortLabel: 'Museum', signatureLandmarkId: 'museum-wing' },
  { stationId: 'hall-of-innovation', displayName: 'Hall of Innovation™', shortLabel: 'Innovation' },
  { stationId: 'company-genome-vault', displayName: 'Company Genome Vault™', shortLabel: 'Genome', signatureLandmarkId: 'company-genome-vault' },
  { stationId: 'blueprint-archive', displayName: 'Blueprint Archive™', shortLabel: 'Blueprints' },
  { stationId: 'marketplace-imports', displayName: 'Marketplace Pavilion™', shortLabel: 'Marketplace' },
  { stationId: 'future-expansion-wings', displayName: 'Future Expansion Wings™', shortLabel: 'Future' },
] as const;
