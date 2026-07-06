import { HYBRID_INTELLIGENCE_LAYERS, HYBRID_LAYER_LABELS } from './constants';
import type { HybridIntelligenceLayerStatus, HybridIntelligenceRequest, ProfessionModelId } from './types';
import { PROFESSION_MODEL_LABELS } from './constants';

const HYBRID_EXAMPLES: Record<(typeof HYBRID_INTELLIGENCE_LAYERS)[number], { role: string; example: string }> = {
  'studio-profession-model': {
    role: 'Workflow reasoning · domain expertise · organizational patterns',
    example: 'Studio Tax™ handles fuel tax workflow reasoning.',
  },
  'external-model': {
    role: 'Language drafting · summarization · general writing',
    example: 'External model handles language drafting and polish.',
  },
  'knowledge-fabric': {
    role: 'Organization-specific context · connected knowledge nodes',
    example: 'Knowledge Fabric™ provides organization-specific context.',
  },
  'professional-trust-framework': {
    role: 'Scope validation · regulated industry gates · professional boundaries',
    example: 'Professional Trust Framework™ validates scope before execution.',
  },
};

export function buildHybridLayers(orchestratorLinked: boolean): HybridIntelligenceLayerStatus[] {
  return HYBRID_INTELLIGENCE_LAYERS.map((layer, index) => {
    const meta = HYBRID_EXAMPLES[layer];
    return {
      layer,
      label: HYBRID_LAYER_LABELS[layer],
      role: meta.role,
      active: orchestratorLinked || index < 3,
      example: meta.example,
    };
  });
}

export function buildHybridIntelligenceLine(layers: HybridIntelligenceLayerStatus[]): string {
  const active = layers.filter((l) => l.active).length;
  return `Hybrid intelligence — ${active}/${layers.length} layers active. Studio Profession Models™ reason · external models draft · Knowledge Fabric™ contextualizes · Trust Framework™ validates.`;
}

export function buildDemoHybridRequest(professionModelId: ProfessionModelId = 'studio-tax'): HybridIntelligenceRequest {
  return {
    id: `sfm-${Date.now()}`,
    professionModelId,
    workflow: 'Fuel tax compliance review',
    studioModelRole: `${PROFESSION_MODEL_LABELS[professionModelId]} workflow reasoning`,
    externalModelRole: 'Language drafting for client communication',
    knowledgeFabricContext: 'Organization tax history + Profession Brain™ patterns',
    trustValidation: 'Professional Trust Framework™ scope check passed',
    processedAt: new Date().toISOString(),
  };
}

export function summarizeHybridIntelligence(layers: HybridIntelligenceLayerStatus[]): string {
  return [
    buildHybridIntelligenceLine(layers),
    ...layers.filter((l) => l.active).map((l) => `${l.label}: ${l.example}`),
  ].join(' ');
}
