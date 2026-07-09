export { GENESIS_KERNEL_DOCTRINE, GENESIS_HIERARCHY, GENESIS_HIERARCHY_LABELS } from './hierarchy';
export { listPipelineStages, getNextPipelineStage } from './hierarchy';

export const GENESIS_FRAMEWORK_MODULES = [
  'framework',
  'constitution',
  'object-model',
  'interaction-model',
  'decision-engine',
  'core-systems',
  'dependency-map',
  'build-order',
  'identity-engine',
  'executive-headquarters',
  'orb',
  'founder-acceptance-testing',
  'live-validation-system',
  'evolution-room',
  'executive-reflection-suite',
  'architects-prompt-library',
  'studio-os-design-dna',
  'experience-engine-dna',
  'experience-runtime-dna',
  'brand-discovery-engine-dna',
  'studio-intelligence-layer-dna',
  'narrative-intelligence-dna',
  'experience-lab-dna',
  'articles',
  'adr',
  'proposals',
  'reviews',
  'objects',
  'schemas',
  'relationships',
  'versioning',
  'history',
  'compiler',
] as const;

export type GenesisFrameworkModule = (typeof GENESIS_FRAMEWORK_MODULES)[number];

export function listGenesisFrameworkModules(): GenesisFrameworkModule[] {
  return [...GENESIS_FRAMEWORK_MODULES];
}
