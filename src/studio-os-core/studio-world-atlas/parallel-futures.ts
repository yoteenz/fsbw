import type {
  AtlasFutureAnalysis,
  AtlasParallelFuture,
  AtlasPlanFeature,
  ParallelFutureArchetype,
  ParallelFutureBuilding,
} from './types';

type BaseParallelFutureArchetype = 'future-a' | 'future-b' | 'future-c' | 'future-d';

function baseArchetype(archetype: ParallelFutureArchetype): BaseParallelFutureArchetype {
  if (
    archetype === 'future-a' ||
    archetype === 'future-b' ||
    archetype === 'future-c' ||
    archetype === 'future-d'
  ) {
    return archetype;
  }
  return 'future-a';
}

function uid(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

const ARCHETYPE_META: Record<
  BaseParallelFutureArchetype,
  { label: string; tagline: string; strategy: string; risk: AtlasFutureAnalysis['riskProfile'] }
> = {
  'future-a': {
    label: 'Luxury Flagship™',
    tagline: 'Future A™',
    strategy: 'Maximum brand presence · cinematic headquarters · premium marketplace positioning.',
    risk: 'balanced',
  },
  'future-b': {
    label: 'Enterprise Scale™',
    tagline: 'Future B™',
    strategy: 'Department depth · AI workforce scale · expansion-ready campus grid.',
    risk: 'conservative',
  },
  'future-c': {
    label: 'Lean Startup™',
    tagline: 'Future C™',
    strategy: 'Minimal footprint · aggressive reuse · preserve Creative Budget for launches.',
    risk: 'conservative',
  },
  'future-d': {
    label: 'Experimental Vision™',
    tagline: 'Future D™',
    strategy: 'Two experimental headquarters · Marketplace product potential · high discovery.',
    risk: 'experimental',
  },
};

function analysisFor(archetype: ParallelFutureArchetype): AtlasFutureAnalysis {
  const base: Record<BaseParallelFutureArchetype, AtlasFutureAnalysis> = {
    'future-a': {
      creativeBudgetEstimate: '$142K',
      generationCostEstimate: '$118.4K',
      buildDurationWeeks: 14,
      creativeEquity: '+2,400 CE',
      assetReusePct: 60,
      marketplacePotential: '$84K annual',
      expansionFlexibility: 72,
      aiWorkforceCount: 18,
      navigationEfficiency: 88,
      operationalComplexity: 'medium',
      maintainability: 78,
      founderWorkloadHours: 24,
      riskProfile: 'balanced',
      timelineMonths: 8,
      growthProjection: '+35% campus capacity · 3yr',
    },
    'future-b': {
      creativeBudgetEstimate: '$198K',
      generationCostEstimate: '$156.2K',
      buildDurationWeeks: 22,
      creativeEquity: '+3,100 CE',
      assetReusePct: 52,
      marketplacePotential: '$62K annual',
      expansionFlexibility: 94,
      aiWorkforceCount: 32,
      navigationEfficiency: 82,
      operationalComplexity: 'high',
      maintainability: 85,
      founderWorkloadHours: 18,
      riskProfile: 'conservative',
      timelineMonths: 12,
      growthProjection: '+58% campus capacity · 5yr',
    },
    'future-c': {
      creativeBudgetEstimate: '$68K',
      generationCostEstimate: '$43.5K',
      buildDurationWeeks: 6,
      creativeEquity: '+980 CE',
      assetReusePct: 87,
      marketplacePotential: '$28K annual',
      expansionFlexibility: 68,
      aiWorkforceCount: 8,
      navigationEfficiency: 91,
      operationalComplexity: 'low',
      maintainability: 92,
      founderWorkloadHours: 12,
      riskProfile: 'conservative',
      timelineMonths: 4,
      growthProjection: '+18% campus capacity · 2yr',
    },
    'future-d': {
      creativeBudgetEstimate: '$124K',
      generationCostEstimate: '$96.8K',
      buildDurationWeeks: 11,
      creativeEquity: '+2,850 CE',
      assetReusePct: 45,
      marketplacePotential: '$142K annual',
      expansionFlexibility: 76,
      aiWorkforceCount: 14,
      navigationEfficiency: 74,
      operationalComplexity: 'medium',
      maintainability: 65,
      founderWorkloadHours: 32,
      riskProfile: 'experimental',
      timelineMonths: 7,
      growthProjection: '+42% campus capacity · 4yr',
    },
  };
  return base[baseArchetype(archetype)];
}

function buildingsFor(archetype: ParallelFutureArchetype): ParallelFutureBuilding[] {
  const layouts: Record<BaseParallelFutureArchetype, ParallelFutureBuilding[]> = {
    'future-a': [
      { id: 'b-a-hq', label: 'Luxury Marketing HQ™', department: 'Marketing', mapX: 58, mapY: 36, wingCount: 4, roomCount: 28 },
      { id: 'b-a-creative', label: 'Flagship Creative Campus™', department: 'Creative', mapX: 24, mapY: 56, wingCount: 3, roomCount: 22 },
      { id: 'b-a-archives', label: 'Golden Archives Wing™', department: 'Archives', mapX: 76, mapY: 52, wingCount: 2, roomCount: 16 },
      { id: 'b-a-experience', label: 'Customer Experience Center™', department: 'Experience', mapX: 42, mapY: 28, wingCount: 2, roomCount: 12 },
    ],
    'future-b': [
      { id: 'b-b-hq', label: 'Enterprise Operations HQ™', department: 'Operations', mapX: 50, mapY: 42, wingCount: 6, roomCount: 48 },
      { id: 'b-b-marketing', label: 'Marketing Headquarters™', department: 'Marketing', mapX: 68, mapY: 38, wingCount: 4, roomCount: 32 },
      { id: 'b-b-ai', label: 'AI Workforce Campus™', department: 'AI', mapX: 30, mapY: 30, wingCount: 3, roomCount: 24 },
      { id: 'b-b-training', label: 'Training Academy™', department: 'Learning', mapX: 22, mapY: 62, wingCount: 2, roomCount: 18 },
      { id: 'b-b-research', label: 'Research Campus™', department: 'Innovation', mapX: 72, mapY: 58, wingCount: 3, roomCount: 20 },
    ],
    'future-c': [
      { id: 'b-c-hq', label: 'Minimal Headquarters™', department: 'Executive', mapX: 48, mapY: 44, wingCount: 1, roomCount: 8 },
      { id: 'b-c-studio', label: 'Compact Creative Studio™', department: 'Creative', mapX: 32, mapY: 52, wingCount: 1, roomCount: 6 },
      { id: 'b-c-warehouse', label: 'Reuse Warehouse Hub™', department: 'Assets', mapX: 62, mapY: 48, wingCount: 1, roomCount: 4 },
    ],
    'future-d': [
      { id: 'b-d-exp', label: 'Experimental HQ Alpha™', department: 'Innovation', mapX: 26, mapY: 34, wingCount: 2, roomCount: 14 },
      { id: 'b-d-beta', label: 'Experimental HQ Beta™', department: 'Marketplace', mapX: 74, mapY: 36, wingCount: 2, roomCount: 12 },
      { id: 'b-d-lab', label: 'Prototype District™', department: 'Labs', mapX: 44, mapY: 62, wingCount: 3, roomCount: 18 },
      { id: 'b-d-pavilion', label: 'Marketplace Pavilion™', department: 'Marketplace', mapX: 58, mapY: 24, wingCount: 2, roomCount: 10 },
    ],
  };
  return layouts[baseArchetype(archetype)];
}

function roadsFor(archetype: ParallelFutureArchetype, buildings: ParallelFutureBuilding[]): AtlasPlanFeature[] {
  const anchor = { mapX: 50, mapY: 50 };
  const meta = ARCHETYPE_META[baseArchetype(archetype)];
  return buildings.slice(0, 3).map((b, i) => ({
    id: `pf-road-${archetype}-${i}`,
    type: 'road' as const,
    label: `${meta.tagline} Boulevard™`,
    mapX: (anchor.mapX + b.mapX) / 2,
    mapY: (anchor.mapY + b.mapY) / 2,
  }));
}

export function buildParallelFuture(archetype: BaseParallelFutureArchetype): AtlasParallelFuture {
  const meta = ARCHETYPE_META[archetype];
  const buildings = buildingsFor(archetype);
  const now = new Date().toISOString();
  return {
    id: `pf-${archetype}`,
    archetype,
    label: meta.label,
    tagline: meta.tagline,
    strategy: meta.strategy,
    createdAt: now,
    updatedAt: now,
    version: 1,
    status: 'draft',
    buildings,
    roads: roadsFor(archetype, buildings),
    departments: [...new Set(buildings.map((b) => b.department))],
    expansionStrategy:
      archetype === 'future-b'
        ? 'Phased north expansion · transit spine · 3 district rings'
        : archetype === 'future-c'
          ? 'Single expansion zone · reuse-first · defer wings until revenue gates'
          : archetype === 'future-d'
            ? 'Marketplace export path · fork experimental wings independently'
            : 'Luxury anchor · radial wings · brand monument at atrium',
    constructionPhases: [
      'Vision™',
      'Reserved Land™',
      'Concept Blueprint™',
      'Approved Blueprint™',
      'Construction™',
      'Interior Assembly™',
      'Commissioning™',
      'Grand Opening™',
      'Operational™',
    ],
    analysis: analysisFor(archetype),
  };
}

export function defaultParallelFutures(): AtlasParallelFuture[] {
  return (['future-a', 'future-b', 'future-c', 'future-d'] as BaseParallelFutureArchetype[]).map(
    buildParallelFuture
  );
}

export function forkParallelFuture(source: AtlasParallelFuture, newLabel: string): AtlasParallelFuture {
  const now = new Date().toISOString();
  return {
    ...source,
    id: uid('pf-fork'),
    label: newLabel,
    version: source.version + 1,
    status: 'forked',
    forkedFromId: source.id,
    createdAt: now,
    updatedAt: now,
    commitSummary: undefined,
  };
}

export function buildParallelFutureRoadPaths(
  future: AtlasParallelFuture,
  anchor: { mapX: number; mapY: number }
): string[] {
  const paths: string[] = [];
  for (const b of future.buildings) {
    const mx = (anchor.mapX + b.mapX) / 2;
    const my = (anchor.mapY + b.mapY) / 2 - 3;
    paths.push(`M ${anchor.mapX} ${anchor.mapY} Q ${mx} ${my} ${b.mapX} ${b.mapY}`);
  }
  for (const r of future.roads) {
    paths.push(`M ${anchor.mapX} ${anchor.mapY} L ${r.mapX} ${r.mapY}`);
  }
  return paths;
}
