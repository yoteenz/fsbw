/**
 * Studio Builder™ → Creative Intelligence Engine™ kernel gate.
 * Call before any generation request leaves the client.
 */

import { runCreativeIntelligenceGate } from '../creative-intelligence-engine/kernel';
import type { CreativeIntelligenceGateResult } from '../creative-intelligence-engine/kernel';
import type { FounderIntentInput } from '../creative-intelligence-engine/types';
import { evaluateForKernelGate } from '../../services/studio/creativeIntelligence/api';
import { resolveCompanyGenomeSnapshot } from './genome-context';

export async function gateStudioBuilderGeneration(
  input: Omit<FounderIntentInput, 'genome_snapshot'> & { org_id?: string },
  options?: { forceGenerate?: boolean; cieDecisionId?: string }
): Promise<CreativeIntelligenceGateResult> {
  const genome = resolveCompanyGenomeSnapshot();
  const intent: FounderIntentInput = {
    org_id: input.org_id ?? 'frontal-slayer',
    raw_intent: input.raw_intent,
    category: input.category,
    department_id: input.department_id,
    workspace_id: input.workspace_id,
    scene_id: input.scene_id,
    generation_pack_id: input.generation_pack_id,
    quality_intent: input.quality_intent,
    asset_type: input.asset_type,
    tags: input.tags,
    materials: input.materials,
    lighting_profile: input.lighting_profile,
    reuse_category: input.reuse_category,
    prefer_reuse: input.prefer_reuse,
    concept_count: input.concept_count,
    layered: input.layered,
    metadata: input.metadata,
    genome_snapshot: {
      company_name: genome.companyName,
      material_language: genome.materialLanguage,
      editorial_direction: genome.editorialDirection,
      lighting_style: genome.lightingStyle,
      photography_direction: genome.photographyDirection,
      brand_dna: genome.brandDNA,
      creative_dna_confidence: 80,
      visual_dna_confidence: 85,
    },
  };

  return runCreativeIntelligenceGate(intent, evaluateForKernelGate, options);
}
