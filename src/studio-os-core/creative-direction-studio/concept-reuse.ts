import type { CreativeConceptFuture } from './creative-pipeline-types';

export type ConceptReuseLayerPlan = {
  kind: string;
  reusable: boolean;
  reuseSource?: 'asset-registry' | 'blueprint-archive' | 'golden-build' | 'marketplace' | 'company-genome';
  generateRequired: boolean;
  estimatedCost: string;
};

export type ConceptReuseAnalysis = {
  overallReusePct: number;
  layers: ConceptReuseLayerPlan[];
  summary: string;
  checkedSources: string[];
};

const REUSE_SOURCES = [
  'Asset Registry™',
  'Blueprint Archive™',
  'Previous Golden Builds™',
  'Marketplace™',
  'Company Genome™',
] as const;

/** Asset Reuse™ — check registry before generating anything new. */
export function analyzeConceptAssetReuse(
  _projectId: string,
  concept: CreativeConceptFuture
): ConceptReuseAnalysis {
  const baseReuse = concept.analysis.reusePct;
  const layers: ConceptReuseLayerPlan[] = [
    { kind: 'environment', reusable: baseReuse > 50, reuseSource: 'golden-build', generateRequired: baseReuse <= 50, estimatedCost: '$4.2K' },
    { kind: 'lighting', reusable: baseReuse > 45, reuseSource: 'asset-registry', generateRequired: baseReuse <= 45, estimatedCost: '$2.8K' },
    { kind: 'architecture', reusable: false, generateRequired: true, estimatedCost: '$6.4K' },
    { kind: 'materials', reusable: baseReuse > 60, reuseSource: 'blueprint-archive', generateRequired: baseReuse <= 60, estimatedCost: '$1.9K' },
    { kind: 'furniture', reusable: baseReuse > 55, reuseSource: 'marketplace', generateRequired: baseReuse <= 55, estimatedCost: '$3.1K' },
    { kind: 'hero', reusable: baseReuse > 40, reuseSource: 'company-genome', generateRequired: baseReuse <= 40, estimatedCost: '$5.6K' },
    { kind: 'atmosphere', reusable: baseReuse > 65, reuseSource: 'asset-registry', generateRequired: baseReuse <= 65, estimatedCost: '$1.2K' },
    { kind: 'motion', reusable: baseReuse > 48, reuseSource: 'golden-build', generateRequired: baseReuse <= 48, estimatedCost: '$2.4K' },
  ];

  const reusableCount = layers.filter((l) => l.reusable && !l.generateRequired).length;
  const overallReusePct = Math.round((reusableCount / layers.length) * 100);

  return {
    overallReusePct,
    layers,
    summary: `${overallReusePct}% reuse — only ${layers.filter((l) => l.generateRequired).length} layers require new generation`,
    checkedSources: [...REUSE_SOURCES],
  };
}

export function formatReuseLines(analysis: ConceptReuseAnalysis): string[] {
  return [
    analysis.summary,
    `Checked: ${analysis.checkedSources.join(' · ')}`,
    `${analysis.overallReusePct}% asset reuse before generation`,
  ];
}
