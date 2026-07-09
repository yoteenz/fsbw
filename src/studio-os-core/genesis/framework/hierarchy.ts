import type { GenesisPipelineStage } from '../types';
import { GENESIS_PIPELINE_STAGES } from '../constants';

export type GenesisHierarchyLevel =
  | 'genesis'
  | 'collection'
  | 'book'
  | 'volume'
  | 'chapter'
  | 'article'
  | 'system'
  | 'implementation';

export const GENESIS_HIERARCHY: GenesisHierarchyLevel[] = [
  'genesis',
  'collection',
  'book',
  'volume',
  'chapter',
  'article',
  'system',
  'implementation',
];

export const GENESIS_HIERARCHY_LABELS: Record<GenesisHierarchyLevel, string> = {
  genesis: 'Genesis',
  collection: 'Collection',
  book: 'Book',
  volume: 'Volume',
  chapter: 'Chapter',
  article: 'Article',
  system: 'System',
  implementation: 'Implementation',
};

export function getNextPipelineStage(
  current: GenesisPipelineStage
): GenesisPipelineStage | undefined {
  const idx = GENESIS_PIPELINE_STAGES.indexOf(current);
  if (idx < 0 || idx >= GENESIS_PIPELINE_STAGES.length - 1) return undefined;
  return GENESIS_PIPELINE_STAGES[idx + 1];
}

export function getPreviousPipelineStage(
  current: GenesisPipelineStage
): GenesisPipelineStage | undefined {
  const idx = GENESIS_PIPELINE_STAGES.indexOf(current);
  if (idx <= 0) return undefined;
  return GENESIS_PIPELINE_STAGES[idx - 1];
}

export function isTerminalPipelineStage(stage: GenesisPipelineStage): boolean {
  return stage === 'canonical';
}

export function listPipelineStages(): GenesisPipelineStage[] {
  return [...GENESIS_PIPELINE_STAGES];
}

export const GENESIS_KERNEL_DOCTRINE = {
  rule: 'If Genesis and any compiled output disagree, Genesis wins.',
  posture: 'Genesis is the kernel; downstream documents are compiled projections.',
  charterPath: 'Genesis.md',
} as const;
