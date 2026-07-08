import type { AtlasEngineId, AtlasMapMode, AtlasNode } from './types';
import { ATLAS_MODE_ENGINE_FOCUS } from './types';

/** Maps Studio OS engines to Atlas nodes — central intelligence layer */
const FLAGSHIP_ENGINES: Record<string, AtlasEngineId[]> = {
  'studio-command-center': [
    'architecture-auditor',
    'experience-intelligence',
    'scene-stack',
    'generation-pipeline',
    'company-genome',
  ],
  'creative-direction-studio': [
    'creative-intelligence',
    'scene-stack',
    'generation-pipeline',
    'creative-budget',
    'creative-portfolio',
  ],
  'studio-warehouse': ['generation-pipeline', 'asset-registry', 'scene-stack', 'creative-budget'],
  'studio-archives': [
    'studio-archives',
    'asset-registry',
    'blueprint-archive',
    'creative-portfolio',
  ],
  marketplace: ['creative-portfolio', 'asset-registry'],
  headquarters: ['company-genome', 'creative-budget', 'creative-portfolio'],
  'expedition-hub': ['expedition-hub', 'blueprint-archive', 'company-genome'],
};

const ROUTE_ENGINE_HINTS: Record<string, AtlasEngineId[]> = {
  'architecture-observatory': ['architecture-auditor'],
  'experience-observatory': ['experience-intelligence'],
  'world-atlas': ['company-genome'],
  'constitution-hall': ['architecture-auditor', 'experience-intelligence'],
  'creative-direction-immersive': ['creative-intelligence', 'scene-stack'],
  'studio-warehouse': ['asset-registry', 'generation-pipeline'],
  marketplace: ['creative-portfolio'],
  'expansion-center': ['expedition-hub'],
  'business-discovery-blueprint': ['expedition-hub', 'company-genome'],
};

export function resolveEnginesForNode(node: AtlasNode): AtlasEngineId[] {
  const engines = new Set<AtlasEngineId>();
  if (node.flagshipId) {
    for (const e of FLAGSHIP_ENGINES[node.flagshipId] ?? []) engines.add(e);
  }
  for (const [slug, ids] of Object.entries(ROUTE_ENGINE_HINTS)) {
    if (node.id.includes(slug)) {
      for (const e of ids) engines.add(e);
    }
  }
  if (node.migrationStatus === 'immersive-live') {
    engines.add('scene-stack');
    engines.add('generation-pipeline');
  }
  if (node.physicalType === 'observatory') engines.add('experience-intelligence');
  if (node.physicalType === 'vault' || node.displayName.includes('Blueprint')) {
    engines.add('blueprint-archive');
  }
  return [...engines];
}

export function nodeVisibleInMapMode(node: AtlasNode, mapMode: AtlasMapMode): boolean {
  if (node.modes.includes(mapMode)) return true;
  const focusEngines = ATLAS_MODE_ENGINE_FOCUS[mapMode];
  if (!focusEngines?.length) return mapMode === 'architectural-blueprint';
  const nodeEngines = node.engineIds ?? resolveEnginesForNode(node);
  return focusEngines.some((e) => nodeEngines.includes(e));
}

export function listActiveEnginesInCatalog(nodes: AtlasNode[]): AtlasEngineId[] {
  const set = new Set<AtlasEngineId>();
  for (const n of nodes) {
    for (const e of n.engineIds ?? resolveEnginesForNode(n)) set.add(e);
  }
  return [...set];
}
