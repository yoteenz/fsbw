import type { GenesisCompileTargetId } from '../types';

export type GenesisCompileTarget = {
  id: GenesisCompileTargetId;
  title: string;
  purpose: string;
  outputRoot: string;
  sourceObjectTypes: string[];
};

export const GENESIS_COMPILE_TARGET_REGISTRY: Record<GenesisCompileTargetId, GenesisCompileTarget> = {
  constitution: {
    id: 'constitution',
    title: 'Constitution',
    purpose: 'Immutable law and governing doctrine.',
    outputRoot: 'docs/studio-os/codex',
    sourceObjectTypes: ['principle', 'article', 'policy', 'amendment'],
  },
  'architects-brain': {
    id: 'architects-brain',
    title: "Architect's Brain",
    purpose: 'Machine-readable architectural reasoning.',
    outputRoot: 'docs/studio-os/architects-brain',
    sourceObjectTypes: ['system', 'adr', 'specification'],
  },
  'master-specification': {
    id: 'master-specification',
    title: 'Master Specification',
    purpose: 'Complete product and platform specification.',
    outputRoot: 'docs/studio-os/master-spec',
    sourceObjectTypes: ['system', 'capability', 'workflow', 'implementation', 'ui-component'],
  },
  'world-bible': {
    id: 'world-bible',
    title: 'World Bible',
    purpose: 'Civilization continuity and world coherence.',
    outputRoot: 'docs/studio-os/world-bible',
    sourceObjectTypes: ['world-entity', 'institution', 'department', 'mission', 'hero-object', 'event'],
  },
  'developer-docs': {
    id: 'developer-docs',
    title: 'Developer Docs',
    purpose: 'Implementation guidance for engineers and agents.',
    outputRoot: 'docs/studio-os',
    sourceObjectTypes: ['implementation', 'specification', 'workflow', 'adr'],
  },
  'sdk-docs': {
    id: 'sdk-docs',
    title: 'SDK Docs',
    purpose: 'SDK usage and public interfaces.',
    outputRoot: 'docs/studio-os/sdk',
    sourceObjectTypes: ['specification', 'capability'],
  },
  'api-docs': {
    id: 'api-docs',
    title: 'API Docs',
    purpose: 'API integration and operational reference.',
    outputRoot: 'docs/studio-os/api',
    sourceObjectTypes: ['specification', 'implementation'],
  },
  codex: {
    id: 'codex',
    title: 'Codex',
    purpose: 'Readable canonical library — compiled projection of Genesis.',
    outputRoot: 'docs/studio-os/codex',
    sourceObjectTypes: ['article', 'principle', 'system', 'collection', 'book', 'volume', 'chapter'],
  },
  'institute-of-knowledge': {
    id: 'institute-of-knowledge',
    title: 'Institute of Knowledge',
    purpose: 'Governance, publication, validation, and official editions.',
    outputRoot: 'docs/studio-os/institute',
    sourceObjectTypes: ['research-paper', 'article', 'amendment'],
  },
};

export function listCompileTargets(): GenesisCompileTarget[] {
  return Object.values(GENESIS_COMPILE_TARGET_REGISTRY);
}

export function getCompileTarget(id: GenesisCompileTargetId): GenesisCompileTarget {
  return GENESIS_COMPILE_TARGET_REGISTRY[id];
}
