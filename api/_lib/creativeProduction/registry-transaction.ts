/**
 * Asset Registry transaction helper — governed registration with Expression Lineage.
 */

import { createRegistryAsset } from '../assetRegistry/service.js';
import type { RegistrySupabase } from '../assetRegistry/types.js';
import type { GovernedGenerationAudit } from '../../../src/studio-os-core/creative-production/types.js';
import type { RegistryRelationshipDraft } from '../../../src/studio-os-core/creative-production/lineage.js';
import {
  buildRegistryLineageMetadata,
  lineageToRegistryRelationships,
} from './studio-os-server.js';

export type RegisterGeneratedAssetInput = {
  supabase: RegistrySupabase;
  orgId: string;
  audit: GovernedGenerationAudit;
  name: string;
  category: string;
  artifactUrl: string;
  departmentId?: string;
  generationModel?: string;
  generationProvider?: string;
  promptVersion?: string;
  metadata?: Record<string, unknown>;
};

export async function registerGeneratedAssetWithLineage(
  input: RegisterGeneratedAssetInput
): Promise<{ assetRegistryId: string }> {
  if (input.audit.outputClass === 'exploratory_draft') {
    throw new Error('Exploratory drafts must not write to Asset Registry in Phase 1');
  }

  const lineageMeta = buildRegistryLineageMetadata(input.audit);
  const relationships = lineageToRegistryRelationships(input.audit.expressionLineage, input.orgId);

  const row = await createRegistryAsset(input.supabase, {
    org_id: input.orgId,
    name: input.name,
    category: input.category,
    department_id: input.departmentId ?? null,
    artifact_url: input.artifactUrl,
    generation_model: input.generationModel ?? null,
    generation_provider: input.generationProvider ?? 'fal',
    prompt_version: input.promptVersion ?? null,
    created_by_type: 'creative-production-gateway',
    created_by_id: input.audit.productionAuthorizationId,
    metadata: {
      ...lineageMeta,
      ...(input.metadata ?? {}),
    },
    relationships: relationships.map((rel: RegistryRelationshipDraft) => ({
      relation_type: rel.relation_type,
      target_kind: rel.target_kind,
      to_asset_id: rel.to_asset_id ?? null,
      target_ref: rel.target_ref ?? null,
      metadata: rel.metadata,
    })),
  });

  return { assetRegistryId: row.id };
}
