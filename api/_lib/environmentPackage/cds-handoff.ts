/**
 * CDS handoff — durable approved package record for Creative Director Studio.
 */

import { randomUUID } from 'crypto';
import {
  appendAuditEvent,
  getCdsHandoff,
  getPackageById,
  listOutputs,
  upsertCdsHandoff,
} from './persistence.js';
import { resolveEnvironmentPackageServerFlags } from './config.js';

export type CdsHandoffResult =
  | { ok: true; handoffId: string; status: string }
  | { ok: false; code: string; message: string };

export async function createEnvironmentPackageCdsHandoff(input: {
  packageId: string;
  founderApprovalId: string;
  actor: string;
}): Promise<CdsHandoffResult> {
  const flags = resolveEnvironmentPackageServerFlags();
  if (!flags.enablePackageCdsHandoff) {
    return { ok: false, code: 'CDS_HANDOFF_BLOCKED', message: 'CDS handoff feature disabled.' };
  }

  const pkg = await getPackageById(input.packageId);
  if (!pkg) {
    return { ok: false, code: 'PACKAGE_NOT_PERSISTED', message: 'Package not found.' };
  }
  if (!pkg.canonical) {
    return { ok: false, code: 'CDS_HANDOFF_BLOCKED', message: 'Package must be canonical before CDS handoff.' };
  }

  const outputs = await listOutputs(input.packageId);
  const byType = Object.fromEntries(outputs.map((o) => [o.output_type as string, o]));

  const handoffPayload = {
    packageId: input.packageId,
    variantId: pkg.variant_id,
    departmentBibleVersion: pkg.department_bible_version,
    architecturalDnaVersion: pkg.architectural_dna_version,
    promptVersion: pkg.prompt_version,
    packageRevision: pkg.revision,
    founderApprovalId: input.founderApprovalId,
    manufacturingRequirements: byType.asset_manifest?.artifact_url ?? null,
    message: 'APPROVED ENVIRONMENT PACKAGE RECEIVED',
  };

  const result = await upsertCdsHandoff({
    handoff_id: `cds-handoff-${randomUUID()}`,
    package_id: input.packageId,
    variant_id: pkg.variant_id,
    status: 'delivered',
    canonical_master_output: byType.desktop?.artifact_url ?? null,
    mobile_output: byType.mobile?.artifact_url ?? null,
    tablet_output: byType.tablet?.artifact_url ?? null,
    blueprint_output: byType.blueprint?.artifact_url ?? null,
    construction_output: byType.construction_plan?.artifact_url ?? null,
    lighting_output: byType.lighting_profile?.artifact_url ?? null,
    materials_output: byType.materials_profile?.artifact_url ?? null,
    asset_manifest: byType.asset_manifest ?? {},
    department_bible_version: pkg.department_bible_version,
    architectural_dna_version: pkg.architectural_dna_version,
    prompt_version: pkg.prompt_version,
    package_revision: pkg.revision,
    founder_approval_id: input.founderApprovalId,
    handoff_payload: handoffPayload,
  });

  if (!result.ok) {
    return { ok: false, code: 'CDS_HANDOFF_BLOCKED', message: result.error };
  }

  await appendAuditEvent({
    packageId: input.packageId,
    eventType: 'cds-handoff',
    actor: input.actor,
    detail: 'CDS handoff record created',
    revision: pkg.revision as number,
    payload: { handoffId: result.handoffId },
  });

  return { ok: true, handoffId: result.handoffId, status: 'delivered' };
}

export async function resolveCdsHandoffForPackage(packageId: string) {
  return getCdsHandoff(packageId);
}
