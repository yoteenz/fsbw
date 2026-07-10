/**
 * Expression Lineage hooks — Asset Registry metadata and relationship helpers.
 */

import type { ExpressionLineage, GovernedGenerationAudit } from './types';

export type RegistryRelationshipDraft = {
  relation_type: string;
  target_kind: 'asset' | 'department' | 'scene' | 'generation_pack' | 'workspace';
  to_asset_id?: string | null;
  target_ref?: string | null;
  metadata?: Record<string, unknown>;
};

export function buildSourceLineage(initiativeId: string): ExpressionLineage {
  return { kind: 'source', initiativeId };
}

export function buildAdaptationLineage(input: {
  sourceAssetRegistryId: string;
  sourceExpressionId: string;
  adaptationReason: string;
}): ExpressionLineage {
  return {
    kind: 'adaptation',
    sourceAssetRegistryId: input.sourceAssetRegistryId,
    sourceExpressionId: input.sourceExpressionId,
    adaptationReason: input.adaptationReason,
  };
}

/** Metadata envelope written to Supabase Asset Registry on governed registration. */
export function buildRegistryLineageMetadata(audit: GovernedGenerationAudit): Record<string, unknown> {
  return {
    creative_production: {
      gatewayVersion: audit.gatewayVersion,
      initiativeId: audit.initiativeId,
      productionAuthorizationId: audit.productionAuthorizationId,
      assetIntentId: audit.assetIntentId,
      outputClass: audit.outputClass,
      expressionLineage: audit.expressionLineage,
      genomeRefs: audit.genomeRefs,
      rightsState: audit.rightsState,
      approvalState: audit.approvalState,
      sourceRoute: audit.sourceRoute,
      sourceSystem: audit.sourceSystem,
      legacyCompat: audit.legacyCompat ?? false,
      recordedAt: audit.recordedAt,
    },
  };
}

export function lineageToRegistryRelationships(
  lineage: ExpressionLineage,
  orgId: string
): RegistryRelationshipDraft[] {
  if (lineage.kind === 'adaptation') {
    return [
      {
        relation_type: 'adapted_from',
        target_kind: 'asset',
        to_asset_id: lineage.sourceAssetRegistryId,
        metadata: {
          org_id: orgId,
          source_expression_id: lineage.sourceExpressionId,
          adaptation_reason: lineage.adaptationReason,
        },
      },
    ];
  }
  if (lineage.kind === 'independent') {
    return [
      {
        relation_type: 'governed_by',
        target_kind: 'workspace',
        target_ref: lineage.governingDecisionId,
        metadata: { rationale: lineage.rationale },
      },
    ];
  }
  return [
    {
      relation_type: 'sources',
      target_kind: 'workspace',
      target_ref: lineage.initiativeId,
      metadata: { lineage_kind: 'source' },
    },
  ];
}
